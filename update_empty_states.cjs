const fs = require('fs');

function updateFile(filePath, emptyStateComponent) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  // Replace the simple empty state with a beautiful empty state
  // We need to make sure the file has the necessary icons. Inbox icon
  if (!code.includes('Inbox')) {
    code = code.replace(/import {([^}]+)} from 'lucide-react';/, "import { $1, Inbox } from 'lucide-react';");
  }

  // Find the empty state regex
  const emptyStateRegex = /<div className="bg-slate-900 rounded-2xl p-8 text-center border border-slate-800 text-slate-400 text-sm shadow-md">[\s\S]*?<\/div>/;
  
  if (emptyStateRegex.test(code)) {
    code = code.replace(emptyStateRegex, emptyStateComponent);
    fs.writeFileSync(filePath, code);
    console.log("Updated " + filePath);
  } else {
    console.log("Empty state not found in " + filePath);
  }
}

const emptyStateIncome = `
        <div className="bg-slate-900/50 rounded-2xl p-10 text-center border border-slate-800 border-dashed flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-3">
            <Inbox className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-bold text-sm mb-1">কোনো লেনদেন পাওয়া যায়নি</h3>
          <p className="text-slate-400 text-xs max-w-[200px] leading-relaxed">
            টাস্ক পূরণ করে প্রথম আয় শুরু করুন এবং আপনার ব্যালেন্স বৃদ্ধি করুন।
          </p>
        </div>
`;

const emptyStateWithdraw = `
        <div className="bg-slate-900/50 rounded-2xl p-10 text-center border border-slate-800 border-dashed flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-3">
            <Inbox className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-bold text-sm mb-1">কোনো উইথড্র রেকর্ড নেই</h3>
          <p className="text-slate-400 text-xs max-w-[200px] leading-relaxed">
            আপনি এখনও কোনো টাকা উইথড্র করেননি। কাজ করে আয় করুন এবং প্রথম উইথড্র দিন।
          </p>
        </div>
`;

updateFile('src/pages/IncomeHistoryPage.tsx', emptyStateIncome);
updateFile('src/pages/WithdrawHistoryPage.tsx', emptyStateWithdraw);
