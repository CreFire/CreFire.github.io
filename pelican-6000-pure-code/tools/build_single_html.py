#!/usr/bin/env python3
"""Build a self-contained single-file HTML version of 鹈鹕骑行_纯代码全片 (zero images, audio, or font files)."""

import base64
import gzip
import json
import pathlib
import re


def trim_js_lines(code: str) -> str:
    """Safely drop whole-line // comments and leading/trailing whitespace."""
    out = []
    for line in code.splitlines():
        s = line.strip()
        if not s or s.startswith("//"):
            continue
        out.append(s)
    return "\n".join(out)


def strip_es_module_syntax(code: str) -> str:
    """Strip import statements and leading export keywords for Worker/Worklet bundling."""
    cleaned = re.sub(r"import\s+(?:[\s\S]*?)\s+from\s+['\"][^'\"]+['\"];?\s*", "", code)
    cleaned = re.sub(r"^export\s+(?=(?:class|function|const|let|var)\b)", "", cleaned, flags=re.MULTILINE)
    return trim_js_lines(cleaned)


def collect_topological_modules(root: pathlib.Path, entry_rel: str):
    """Collect active ES modules from entry in topological order (dependencies first)."""
    order = []
    visited = set()
    dep_map = {}

    def visit(rel: str):
        if rel in visited:
            return
        visited.add(rel)
        p = root / rel
        txt = p.read_text(encoding="utf-8")
        deps = []
        for m in re.finditer(r"""(?:from|import)\s*\(?\s*['"](\.[^'"]+)['"]""", txt):
            spec = m.group(1)
            nxt = (p.parent / spec).resolve()
            if nxt.is_file():
                nxt_rel = str(nxt.relative_to(root))
                deps.append([spec, nxt_rel])
                visit(nxt_rel)
        dep_map[rel] = deps
        order.append(rel)

    visit(entry_rel)
    return order, dep_map


def build_single_html(root: pathlib.Path, out_path: pathlib.Path):
    css_parts = [
        (root / "styles/tokens.css").read_text(encoding="utf-8"),
        (root / "styles/layout.css").read_text(encoding="utf-8"),
        (root / "styles/components/player.css").read_text(encoding="utf-8"),
    ]
    bundled_css = "\n".join(css_parts)

    json_files = {}
    for p in sorted((root / "data").glob("*.json")):
        json_files[f"data/{p.name}"] = p.read_text(encoding="utf-8")
    json_files["data/audio/manifest.json"] = (root / "data/audio/manifest.json").read_text(encoding="utf-8")

    audio_b64 = {}
    for p in sorted((root / "data/audio").glob("*.js")):
        txt = p.read_text(encoding="utf-8")
        m = re.search(r'"([A-Za-z0-9+/=]+)"', txt)
        if not m:
            raise ValueError(f"Could not extract base64 payload from {p}")
        audio_b64[p.name] = m.group(1)

    vendor_p5 = (root / "assets/vendor/p5.min.js").read_text(encoding="utf-8")
    vendor_brush = (root / "assets/vendor/p5.brush.js").read_text(encoding="utf-8")
    vendor_lzma = (root / "assets/vendor/lzma-d-min.js").read_text(encoding="utf-8")

    storage_code = strip_es_module_syntax((root / "src/audio/dsp/storage.js").read_text(encoding="utf-8"))
    worker_script = (
        vendor_lzma
        + "\n"
        + storage_code
        + """
self.onmessage = ({ data }) => {
  try {
    const decoded = self.LZMA.decompress(new Uint8Array(data.buffer));
    if (typeof decoded === 'string') throw new Error('Unexpected text in binary parameters');
    const buffer = unpackSpectrum(Uint8Array.from(decoded));
    self.postMessage({ id: data.id, buffer }, [buffer]);
  } catch (error) {
    self.postMessage({ id: data.id, error: error.message || String(error) });
  }
};
"""
    )

    dsp_order = [
        "src/audio/dsp/fft.js",
        "src/audio/dsp/resampler.js",
        "src/audio/dsp/storage.js",
        "src/audio/dsp/spectral-stream.js",
        "src/audio/dsp/engine.js",
        "src/audio/dsp/worklet.js",
    ]
    worklet_script = "\n".join(
        strip_es_module_syntax((root / rel).read_text(encoding="utf-8")) for rel in dsp_order
    )

    mod_order, dep_map = collect_topological_modules(root, "src/app.js")
    modules_payload = []
    for rel in mod_order:
        if rel == "src/audio/parameters.js":
            code = """
function base64ToArrayBuffer(b64) {
  const binStr = atob(b64);
  const bytes = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
  return bytes.buffer;
}

export async function loadParameters(manifest, onProgress) {
  const worker = new Worker(window.__VFS_WORKER_URL);
  const pending = new Map();
  const streams = manifest.tracks.flatMap((track) => track.streams);
  let completed = 0;
  worker.onmessage = ({ data }) => {
    const request = pending.get(data.id);
    if (!request) return;
    pending.delete(data.id);
    if (data.error) request.reject(new Error(data.error));
    else {
      request.resolve(data.buffer);
      onProgress?.(++completed, streams.length);
    }
  };
  worker.onerror = (event) => {
    for (const request of pending.values()) request.reject(new Error(event.message || 'Worker decode failed'));
    pending.clear();
  };
  try {
    const pairs = await Promise.all(
      streams.map(async (stream, id) => {
        const jsName = stream.file.replace(/\\.lzpar$/, '.js');
        const b64 = window.__VFS_AUDIO_B64[jsName];
        if (!b64) throw new Error('Missing embedded audio payload: ' + jsName);
        const buffer = base64ToArrayBuffer(b64);
        const result = new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
        worker.postMessage({ id, buffer }, [buffer]);
        return [stream.file, await result];
      })
    );
    return Object.fromEntries(pairs);
  } finally {
    worker.terminate();
  }
}
""".strip()
            deps = []
        elif rel == "src/audio/audio-controller.js":
            raw_code = (root / rel).read_text(encoding="utf-8")
            raw_code = raw_code.replace(
                "new URL('./dsp/worklet.js', import.meta.url)",
                "window.__VFS_WORKLET_DATA_URL",
            )
            code = trim_js_lines(raw_code)
            deps = dep_map[rel]
        else:
            code = trim_js_lines((root / rel).read_text(encoding="utf-8"))
            deps = dep_map[rel]
        modules_payload.append([rel, code, deps])

    vfs_obj = {
        "json": json_files,
        "audioB64": audio_b64,
        "p5": vendor_p5,
        "brush": vendor_brush,
        "worker": worker_script,
        "worklet": worklet_script,
        "modules": modules_payload,
    }
    vfs_bytes = json.dumps(vfs_obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    vfs_gz = gzip.compress(vfs_bytes, compresslevel=9)
    vfs_b64 = base64.b64encode(vfs_gz).decode("ascii")

    html_out = f"""<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>鹈鹕六千年的车</title>
  <link rel="icon" href="data:,">
  <style>
{bundled_css}
  </style>
</head>
<body>
  <main class="cinema-viewport">
    <div id="cinema-shell" class="cinema-shell">
      <div class="screen-wrap">
        <canvas id="film" width="1920" height="1440" aria-label="鹈鹕六千年的车"></canvas>
      </div>
    </div>
  </main>
  <script id="vfs-payload" type="text/plain">{vfs_b64}</script>
  <script>
(async function bootSingleHtml() {{
  const b64 = document.getElementById('vfs-payload').textContent.trim();
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const ds = new DecompressionStream('gzip');
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  const vfs = JSON.parse(await new Response(stream).text());

  const origFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {{
    const urlStr = typeof input === 'string' ? input : (input && input.url) || '';
    const norm = urlStr.replace(/^\\.\\//, '').split('?')[0];
    if (Object.prototype.hasOwnProperty.call(vfs.json, norm)) {{
      return new Response(vfs.json[norm], {{
        status: 200,
        headers: {{ 'Content-Type': 'application/json; charset=utf-8' }}
      }});
    }}
    return origFetch(input, init);
  }};

  for (const srcCode of [vfs.p5, vfs.brush]) {{
    const s = document.createElement('script');
    s.textContent = srcCode;
    document.head.appendChild(s);
  }}

  window.__VFS_AUDIO_B64 = vfs.audioB64;
  window.__VFS_WORKER_URL = URL.createObjectURL(
    new Blob([vfs.worker], {{ type: 'application/javascript' }})
  );
  const wkBytes = new TextEncoder().encode(vfs.worklet);
  let wkBin = '';
  for (let i = 0; i < wkBytes.length; i += 0x8000) {{
    wkBin += String.fromCharCode.apply(null, wkBytes.subarray(i, i + 0x8000));
  }}
  window.__VFS_WORKLET_DATA_URL = 'data:text/javascript;base64,' + btoa(wkBin);

  const blobUrls = {{}};
  for (const [rel, rawCode, deps] of vfs.modules) {{
    let code = rawCode;
    for (const [spec, targetRel] of deps) {{
      const targetUrl = blobUrls[targetRel];
      if (!targetUrl) throw new Error('Missing topological module: ' + targetRel);
      code = code.split("'" + spec + "'").join(JSON.stringify(targetUrl));
      code = code.split('"' + spec + '"').join(JSON.stringify(targetUrl));
    }}
    blobUrls[rel] = URL.createObjectURL(new Blob([code], {{ type: 'application/javascript' }}));
  }}

  await import(blobUrls['src/app.js']);
}})().catch((err) => {{
  console.error(err);
  window.__loadError = String(err);
}});
  </script>
</body>
</html>
"""
    out_path.write_text(html_out, encoding="utf-8")
    print(f"Built {out_path}")
    print(f"  Raw VFS JSON: {len(vfs_bytes):,} B ({len(vfs_bytes)/1024/1024:.2f} MiB)")
    print(f"  Gzip-9 VFS:   {len(vfs_gz):,} B ({len(vfs_gz)/1024/1024:.2f} MiB)")
    sz = out_path.stat().st_size
    print(f"  Final HTML:   {sz:,} B ({sz/1024/1024:.2f} MiB | {sz/1000/1000:.2f} MB)")


if __name__ == "__main__":
    project_root = pathlib.Path(__file__).resolve().parent.parent
    out_file = project_root / "鹈鹕骑行_纯代码全片_单文件版.html"
    build_single_html(project_root, out_file)
