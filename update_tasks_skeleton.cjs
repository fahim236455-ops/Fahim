const fs = require('fs');
let code = fs.readFileSync('src/pages/TasksPage.tsx', 'utf8');

const regex = /<div className="space-y-3">\s*{\[1, 2\]\.map\(\(i\) => \(\s*<div key={i} className="h-44 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" \/>\s*\)\)}\s*<\/div>/;

const newSkeleton = `
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="h-3 bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-800 rounded w-5/6" />
              </div>
              <div className="flex justify-between items-end pt-2">
                <div className="h-6 w-20 bg-slate-800 rounded-lg" />
                <div className="h-8 w-28 bg-slate-800 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
`;

if (regex.test(code)) {
  code = code.replace(regex, newSkeleton);
  fs.writeFileSync('src/pages/TasksPage.tsx', code);
  console.log("Updated TasksPage skeleton loader");
} else {
  console.log("Not found in TasksPage");
}
