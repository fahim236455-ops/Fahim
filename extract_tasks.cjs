const fs = require('fs');
const code = fs.readFileSync('server/api.ts', 'utf8');
const start = code.indexOf('apiRouter.get(\'/tasks\'');
const end = code.indexOf('});', start + 100) + 3;
console.log(code.substring(start, end));
