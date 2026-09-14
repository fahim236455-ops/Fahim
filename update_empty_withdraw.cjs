const fs = require('fs');
let code = fs.readFileSync('src/pages/WithdrawHistoryPage.tsx', 'utf8');

const regex = /<div className="bg-slate-900 rounded-2xl p-8 text-center border border-slate-800 text-slate-400 text-sm space-y-2">[\s\S]*?<\/div>/;
const emptyStateWithdraw = `
        <div className="bg-slate-900/50 rounded-2xl p-10 text-center border border-slate-800 border-dashed flex flex-col items-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-3">
            <FileCheck2 className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-white font-bold text-sm mb-1">কোনো উইথড্র রেকর্ড নেই</h3>
          <p className="text-slate-400 text-xs max-w-[200px] leading-relaxed mb-3">
            আপনি এখনও কোনো টাকা উইথড্র করেননি। কাজ করে আয় করুন এবং প্রথম উইথড্র দিন।
          </p>
          <button
            onClick={() => onNavigate('withdraw')}
            className="text-xs text-slate-950 bg-amber-500 font-bold px-4 py-2 rounded-lg shadow hover:bg-amber-400 transition-colors cursor-pointer"
          >
            উইথড্র রিকোয়েস্ট দিন
          </button>
        </div>
`;

if (regex.test(code)) {
  code = code.replace(regex, emptyStateWithdraw);
  fs.writeFileSync('src/pages/WithdrawHistoryPage.tsx', code);
  console.log("Updated WithdrawHistoryPage");
} else {
  console.log("Not found");
}
