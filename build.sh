#!/bin/bash
echo "Building GoSave frontend..."
cd gosave-frontend
npm install
npm run build
echo "Build complete! Contents of dist:"
ls -la dist/
echo "Index.html content:"
head -20 dist/index.html