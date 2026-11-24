const encoder = new TextEncoder();
const ttl = 600;
const securityHeaders = {
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

function base64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function decode(value) {
  return Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), (c) => c.charCodeAt(0));
}

function random() {
  return base64url(crypto.getRandomValues(new Uint8Array(32)));
}

function key(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

async function signSession(session, secret) {
  const payload = base64url(encoder.encode(JSON.stringify(session)));
  const signature = await crypto.subtle.sign('HMAC', await key(secret), encoder.encode(payload));
  return `${payload}.${base64url(signature)}`;
}

async function readSession(value, secret, now) {
  try {
    const parts = value.split('.');
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    if (!await crypto.subtle.verify('HMAC', await key(secret), decode(signature), encoder.encode(payload))) return null;
    const session = JSON.parse(new TextDecoder().decode(decode(payload)));
    return session.expires > now && session.expires <= now + ttl * 1000 ? session : null;
  } catch {
    return null;
  }
}

const cmsOrigin = 'https://crefire.github.io';
const repoApiUrl = 'https://api.github.com/repos/CreFire/CreFire.github.io';
const repositoryId = '769548419';
const cookieName = '__Host-crefire_pages_oauth';

function cookie(value, maxAge = ttl) {
  return `${cookieName}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`;
}

function message(text, status = 400, extra = {}) {
  return new Response(text, { status, headers: { ...securityHeaders, 'Content-Type': 'text/plain; charset=utf-8', ...extra } });
}

function popup(token) {
  const nonce = random();
  const payload = JSON.stringify(`authorization:github:success:${JSON.stringify({ token, provider: 'github' })}`).replaceAll('<', '\\u003c');
  const target = JSON.stringify(cmsOrigin).replaceAll('<', '\\u003c');
  return new Response(`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>登录完成</title><p>登录完成，正在返回写作后台。若窗口未关闭，请返回后台重试。</p><script nonce="${nonce}">
const target = ${target};
const openerWindow = window.opener;
function receive(event) {
  if (event.origin !== target || event.source !== openerWindow || event.data !== 'authorizing:github') return;
  window.removeEventListener('message', receive);
  openerWindow.postMessage(${payload}, target);
}
if (openerWindow) {
  window.addEventListener('message', receive);
  openerWindow.postMessage('authorizing:github', target);
}
</script></html>`, {
    headers: {
      ...securityHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': cookie('', 0),
      'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'`,
    },
  });
}

export async function handleRequest(request, env, fetcher = fetch, now = Date.now()) {
  const url = new URL(request.url);
  if (!['/auth', '/auth/callback', '/auth/status'].includes(url.pathname)) return message('Not found', 404);
  if (request.method !== 'GET') return message('Method not allowed', 405, { Allow: 'GET' });
  if (url.origin !== env.AUTH_ORIGIN) return message('请从正式站点的写作后台登录。', 403);
  const configured = Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
  if (url.pathname === '/auth/status') {
    return Response.json({ configured }, { headers: securityHeaders });
  }
  if (!configured) return message('后台登录尚未启用，请联系站点管理员完成 GitHub 登录配置。', 503);
  const redirectUri = new URL('/auth/callback', env.AUTH_ORIGIN).href;

  if (url.pathname === '/auth') {
    if (url.searchParams.get('provider') !== 'github') return message('Unsupported provider');
    const state = random();
    const verifier = random();
    const session = await signSession({ state, verifier, expires: now + ttl * 1000 }, env.GITHUB_CLIENT_SECRET);
    const authorize = new URL('https://github.com/login/oauth/authorize');
    authorize.search = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: 'offline_access',
      state,
      code_challenge: base64url(await crypto.subtle.digest('SHA-256', encoder.encode(verifier))),
      code_challenge_method: 'S256',
      allow_signup: 'false',
    }).toString();
    return new Response(null, { status: 302, headers: { ...securityHeaders, Location: authorize.href, 'Set-Cookie': cookie(session) } });
  }

  const rawCookie = (request.headers.get('Cookie') || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
  const session = await readSession(rawCookie?.slice(cookieName.length + 1) || '', env.GITHUB_CLIENT_SECRET, now);
  const clearedCookie = { 'Set-Cookie': cookie('', 0) };
  if (!session || session.state !== url.searchParams.get('state')) {
    return message('登录校验失败或已过期，请返回后台重新登录。', 400, clearedCookie);
  }
  if (url.searchParams.has('error')) return message('GitHub 登录已取消，请返回后台重新登录。', 400, clearedCookie);
  const code = url.searchParams.get('code');
  if (!code) return message('缺少 GitHub 登录授权码。', 400, clearedCookie);

  try {
    const response = await fetcher('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, code_verifier: session.verifier, redirect_uri: redirectUri, repository_id: repositoryId }),
      signal: AbortSignal.timeout(10000),
    });
    const data = await response.json();
    if (!response.ok || typeof data.access_token !== 'string' || !data.access_token || data.error) {
      return message('GitHub 登录失败，请返回后台重试。', 502, clearedCookie);
    }
    const permission = await fetcher(repoApiUrl, {
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${data.access_token}`, 'User-Agent': 'CreFire-Pages-CMS' },
      signal: AbortSignal.timeout(10000),
    });
    if (!permission.ok || !(await permission.json()).permissions?.push) {
      return message('此 GitHub 账号没有博客仓库的写入权限。', 403, clearedCookie);
    }
    return popup(data.access_token);
  } catch {
    return message('GitHub 暂时无法连接，请稍后重试。', 502, clearedCookie);
  }
}

export default {
  fetch(request, env) {
    return handleRequest(request, env);
  },
};
