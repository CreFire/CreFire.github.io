#!/usr/bin/env python3
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import webbrowser


def main():
    parser = argparse.ArgumentParser(description='Serve 100% pure-code Pelican 6000 film & audio player.')
    parser.add_argument('--port', type=int, default=8922)
    parser.add_argument('--open', action='store_true')
    args = parser.parse_args()
    root = Path(__file__).resolve().parent

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(root), **kw)

        def end_headers(self):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
            super().end_headers()

        def do_GET(self):
            if self.path == '/favicon.ico':
                self.send_response(204)
                self.end_headers()
                return
            for h in ('If-Modified-Since', 'If-None-Match'):
                if h in self.headers:
                    del self.headers[h]
            super().do_GET()

        def log_message(self, fmt, *a):
            print(fmt % a, flush=True)

    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    url = f'http://127.0.0.1:{server.server_address[1]}/'
    print(f'100% 纯代码音画全片：{url}', flush=True)
    if args.open:
        threading.Timer(0.3, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()


if __name__ == '__main__':
    main()
