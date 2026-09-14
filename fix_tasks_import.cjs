const fs = require('fs');
let code = fs.readFileSync('src/pages/TasksPage.tsx', 'utf8');

code = code.replace(', Inbox }', 'Inbox }');
code = code.replace(',\n  , Inbox', ',\n  Inbox');

fs.writeFileSync('src/pages/TasksPage.tsx', code);
console.log("Fixed import");
