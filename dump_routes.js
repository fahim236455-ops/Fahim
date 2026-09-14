const fs = require('fs');
const code = fs.readFileSync('server/api.ts', 'utf8');
const matches = [...code.matchAll(/apiRouter\.(get|post)\('([^']+)'/g)];
matches.forEach(m => console.log(m[1] + ' ' + m[2]));
