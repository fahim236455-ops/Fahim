const fs = require('fs');
let code = fs.readFileSync('src/pages/TasksPage.tsx', 'utf8');

// Needs Inbox icon? Actually it might already have icons. Let's use ListX if possible, or just the same structure without relying on a new icon or just importing it if needed.
if (!code.includes('Inbox')) {
  code = code.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, Inbox } from 'lucide-react';");
}

const regex = /<div className="bg-slate-900 rounded-xl p-8 text-center border border-slate-800 text-slate-400 text-sm space-y-2">[\s\S]*?<\/div>/;

const newEmpty = `
            <div className="bg-slate-900/50 rounded-2xl p-10 text-center border border-slate-800 border-dashed flex flex-col items-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-3">
                <Inbox className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-white font-bold text-sm mb-1">কোনো কাজ পাওয়া যায়নি</h3>
              <p className="text-slate-400 text-xs max-w-[200px] leading-relaxed mb-3">
                বর্তমানে এই ক্যাটাগরিতে কোনো কাজ নেই। কিছুক্ষণ পর আবার চেক করুন।
              </p>
              <button
                onClick={() => setViewMode('queue')}
                className="text-xs text-slate-950 bg-amber-500 font-bold px-4 py-2 rounded-lg shadow hover:bg-amber-400 transition-colors cursor-pointer"
              >
                অটো কিউ মোড দেখুন
              </button>
            </div>
`;

if (regex.test(code)) {
  code = code.replace(regex, newEmpty);
  fs.writeFileSync('src/pages/TasksPage.tsx', code);
  console.log("Updated TasksPage empty state");
} else {
  console.log("Not found in TasksPage");
}
