#!/bin/bash
set -e

echo "=== Installing backend dependencies ==="
npm install

echo "=== Installing client dependencies ==="
cd client
npm install

echo "=== Building client ==="
NODE_OPTIONS="--max-old-space-size=512" npm run build

echo "=== Build complete ==="
ls -la dist/
