const fs = require('fs');
let code = fs.readFileSync('src/pages/SupportPage.tsx', 'utf8');

const compRegex = /export const SupportPage[\s\S]*/;
const match = code.match(compRegex);
if(match) {
  let content = match[0];
  const endIdx = content.indexOf('};\n');
  if(endIdx !== -1) {
     const goodContent = content.slice(0, endIdx + 3) + "\nexport const formatWhatsAppLink = (number: string) => {\n  return 'https://wa.me/' + number.replace(/[^0-9]/g, '');\n};\n\nexport const formatTelegramLink = (username: string) => {\n  return 'https://t.me/' + username.replace('@', '');\n};\n";
     code = code.replace(content, goodContent);
     fs.writeFileSync('src/pages/SupportPage.tsx', code);
     console.log("Fixed exports properly");
  }
}
