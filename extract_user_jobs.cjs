const fs = require('fs');
const code = fs.readFileSync('server/api.ts', 'utf8');
const start = code.indexOf('apiRouter.post(\'/user-jobs\'');
const end = code.indexOf('return newJob', start) + 20;
console.log(code.substring(start, end));
