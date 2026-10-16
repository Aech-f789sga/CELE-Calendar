import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const svgContent = fs.readFileSync(path.resolve('./public/icon.svg'), 'utf8');

// Simple HTML page embedding the SVG with exact dimensions
const htmlTemplate = (size, isMaskable = false) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: ${size}px;
      height: ${size}px;
      background: ${isMaskable ? '#09090b' : 'transparent'};
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    svg {
      width: ${isMaskable ? Math.round(size * 0.8) : size}px;
      height: ${isMaskable ? Math.round(size * 0.8) : size}px;
    }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>
`;

fs.mkdirSync('./.icon-tmp', { recursive: true });
fs.writeFileSync('./.icon-tmp/icon-192.html', htmlTemplate(192, false));
fs.writeFileSync('./.icon-tmp/icon-512.html', htmlTemplate(512, false));
fs.writeFileSync('./.icon-tmp/icon-apple.html', htmlTemplate(180, false));
fs.writeFileSync('./.icon-tmp/icon-maskable.html', htmlTemplate(512, true));

console.log('Temporary icon HTML files created.');
