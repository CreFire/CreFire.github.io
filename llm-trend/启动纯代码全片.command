#!/bin/zsh
cd "$(dirname "$0")"
exec python3 ./server.py --port 8922 --open
