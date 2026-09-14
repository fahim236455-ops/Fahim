const fs = require('fs');
const code = fs.readFileSync('src/pages/AdminPanelPage.tsx', 'utf8');
const lines = code.split('\n');
const start = lines.findIndex(l => l.includes('fetchApi(`/admin/stats'));
console.log(lines.slice(start - 2, start + 25).join('\n'));
