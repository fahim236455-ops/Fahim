import fs from 'fs';
import path from 'path';

const dir = 'src/pages';
const files = fs.readdirSync(dir);
files.forEach(f => {
  if (f.endsWith('.tsx')) {
    const filePath = path.join(dir, f);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/bg-\\[#0a1128\\]/g, 'bg-[#0a1128] dark-input');
    fs.writeFileSync(filePath, content);
  }
});
console.log("Done");
