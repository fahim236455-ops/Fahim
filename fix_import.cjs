const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPanelPage.tsx', 'utf8');
code = code.replace(', Briefcase }', 'Briefcase }');
code = code.replace(',  Briefcase', ', Briefcase');
code = code.replace(',\n  , Briefcase', ',\n  Briefcase');
fs.writeFileSync('src/pages/AdminPanelPage.tsx', code);
console.log("Fixed import");
