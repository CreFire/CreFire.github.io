#!/usr/bin/env python3
"""Build a self-contained single-file HTML version of 《硅基涌现 · 大模型演进二十幕》 (zero images, audio, or font files)."""

import base64
import gzip
import json
import pathlib
import re


def trim_js_lines(code: str) -> str:
    out = []
    for line in code.splitlines():
        s = line.strip()
        if not s or s.startswith("//"):
            continue
        out.append(s)
    return "\n".join(out)


def collect_topological_modules(root: pathlib.Path, entry_rel: str):
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

    vendor_p5 = (root / "assets/vendor/p5.min.js").read_text(encoding="utf-8")
    vendor_brush = (root / "assets/vendor/p5.brush.js").read_text(encoding="utf-8")

    mod_order, dep_map = collect_topological_modules(root, "src/app.js")
    modules_payload = []
    for rel in mod_order:
        code = trim_js_lines((root / rel).read_text(encoding="utf-8"))
        modules_payload.append([rel, code, dep_map[rel]])

    vfs_obj = {
        "json": json_files,
        "p5": vendor_p5,
        "brush": vendor_brush,
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
  <title>硅基涌现 · 大模型演进二十幕</title>
  <link rel="icon" href="data:,">
  <style>
{bundled_css}
  </style>
</head>
<body>
  <main class="cinema-viewport">
    <div id="cinema-shell" class="cinema-shell">
      <div class="screen-wrap">
        <canvas id="film" width="1920" height="1440" aria-label="硅基涌现 · 大模型演进二十幕"></canvas>
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
    sz = out_path.stat().st_size
    print(f"Built {out_path} ({sz:,} bytes | {sz/1000/1000:.2f} MB)")
    return sz


if __name__ == "__main__":
    project_root = pathlib.Path(__file__).resolve().parent.parent
    out_file = project_root / "大模型演进二十幕_纯代码单文件版.html"
    sz = build_single_html(project_root, out_file)
    # Sync exact byte count into code_payload_story.json and rebuild once so HUD matches 1:1!
    story_path = project_root / "data/code_payload_story.json"
    story = json.loads(story_path.read_text(encoding="utf-8"))
    story["exactBytes"] = sz
    story["sizeMB"] = round(sz / 1_000_000, 2)
    story["finale"]["bytesLabel"] = f"{sz:,} bytes"
    story_path.write_text(json.dumps(story, ensure_ascii=False, indent=2), encoding="utf-8")
    build_single_html(project_root, out_file)
