const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPanelPage.tsx', 'utf8');

const importStatement = code.match(/import {[^}]+} from 'lucide-react';/);
if (importStatement) {
  let newImport = importStatement[0].replace('}', ', Briefcase }');
  code = code.replace(importStatement[0], newImport);
  fs.writeFileSync('src/pages/AdminPanelPage.tsx', code);
  console.log("Added Briefcase import");
}
