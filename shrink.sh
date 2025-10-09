#!/bin/bash
rm -r mini/*

find src/scripts/ -name '*.js' -type f -exec sh -c 'cat {}; echo ";"' \; > mini/all.js
cat src/main.js >> mini/all.js
esbuild mini/all.js --minify --outfile=mini/src/main.js
rm mini/all.js

find src/styles/ -name '*.css' -type f -exec cat {} + > mini/src/styles.css

cp src/art mini/src/art -r
cp index.html mini/index.html

cd mini

echo "
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');
let newHtml = html
  .replace(/<link rel=\"stylesheet\" href=\"src\/.*?\"\/?>/g, '')
  .replace(/<script src=\"src\/.*?\"><\/script>/g, '')
  .replace(/\n\s*?\n/g, '');

newHtml = newHtml.replace('</head>', '\n  <link rel=\"stylesheet\" href=\"src/styles.css\">\n</head>');
newHtml = newHtml.replace('</body>', '  <script src=\"src/main.js\"></script>\n</body>');

fs.writeFileSync('index.html', newHtml);

const css = fs.readFileSync('src/styles.css', 'utf-8');
let newCss = css
	.replace(/[\n\t]/g, '')
	.replace(/\.\.\//g, '')
	.replace(/(?<=[:;{}])\s*/g, '')
	.replace(/\s*{/g, '{')
	.replace(/\s+/g, ' ')
	.replace(/ > /g, '>')

fs.writeFileSync('src/styles.css', newCss);
" > rename.js

node rename.js
rm rename.js