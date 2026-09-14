const fs = require('fs');
const code = fs.readFileSync('src/pages/AdminPanelPage.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('id: \'social_jobs\''));
console.log(lines.slice(start - 5, start + 15).join('\n'));
