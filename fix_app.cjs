const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">[\s\S]*?<\/p>\s*<\/div>/;

const skeletonLoader = `
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        {/* SKELETON LOADER UI */}
        <div className="w-full max-w-md space-y-4 animate-pulse">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-12 h-12 bg-slate-800 rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-800 rounded" />
              <div className="h-3 w-16 bg-slate-800 rounded" />
            </div>
          </div>
          <div className="h-32 bg-slate-800 rounded-2xl w-full" />
          <div className="h-24 bg-slate-800 rounded-2xl w-full" />
          <div className="grid grid-cols-2 gap-3 mt-4">
             <div className="h-20 bg-slate-800 rounded-2xl w-full" />
             <div className="h-20 bg-slate-800 rounded-2xl w-full" />
             <div className="h-20 bg-slate-800 rounded-2xl w-full" />
             <div className="h-20 bg-slate-800 rounded-2xl w-full" />
          </div>
        </div>
      </div>
`;

if (regex.test(code)) {
  code = code.replace(regex, skeletonLoader);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Fixed App.tsx skeleton loader");
} else {
  // alternative matching if the regex failed due to current state
  const startIdx = code.indexOf('<div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">');
  const endIdx = code.indexOf('    );', startIdx);
  if (startIdx !== -1 && endIdx !== -1) {
    code = code.slice(0, startIdx) + skeletonLoader.trim() + '\n  ' + code.slice(endIdx);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Fixed App.tsx skeleton loader via index slice");
  } else {
    console.log("Could not find block");
  }
}
