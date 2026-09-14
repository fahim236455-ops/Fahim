const fs = require('fs');
let code = fs.readFileSync('src/pages/SupportPage.tsx', 'utf8');

// The backticks got double escaped. Let's fix the export blocks at the end.
const endOfComponent = '};\n';
const idx = code.lastIndexOf(endOfComponent);

if (idx !== -1) {
  code = code.slice(0, idx + endOfComponent.length) + `
export const formatWhatsAppLink = (number: string) => {
  return "https://wa.me/" + number.replace(/[^0-9]/g, "");
};

export const formatTelegramLink = (username: string) => {
  return "https://t.me/" + username.replace('@', '');
};
`;
  fs.writeFileSync('src/pages/SupportPage.tsx', code);
  console.log("Fixed exports");
}
