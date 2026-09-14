const fs = require('fs');
let code = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// 1. Add Bell icon and useState/useEffect if not present
const importStr = "import {";
const lucideImportMatch = code.match(/import {[^{}]+} from 'lucide-react';/);
if (lucideImportMatch) {
  let newLucide = lucideImportMatch[0].replace('}', ', Bell, TrendingUp, ChevronRight, Activity }');
  code = code.replace(lucideImportMatch[0], newLucide);
}

// 2. Add Recent Payouts Ticker and Earning Chart
const actionGridPoint = code.indexOf('{/* 5. ACTION GRID */}');

const newComponents = `
      {/* ================= RECENT PAYOUTS TICKER ================= */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-slate-800 to-slate-800 rounded-xl p-2.5 border border-emerald-500/20 flex items-center gap-2 overflow-hidden shadow-sm relative">
        <div className="bg-emerald-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider shrink-0 z-10 flex items-center gap-1">
          <Activity className="w-3 h-3 animate-pulse" />
          লাইভ পেআউট
        </div>
        <div className="overflow-hidden whitespace-nowrap flex-1 flex">
          <div className="inline-block animate-marquee text-[11px] font-medium text-emerald-400">
            • ইউজার **Sajid** ৳250 উইথড্র করেছেন (বিকাশ) • ইউজার **Mim12** ৳150 উইথড্র করেছেন (নগদ) • ইউজার **Rana** ৳500 উইথড্র করেছেন (বিকাশ) • ইউজার **Tanvir** ৳300 উইথড্র করেছেন (রকেট)
          </div>
        </div>
      </div>

      {/* ================= EARNING CHART (Last 7 Days) ================= */}
      <div className="bg-[#0c1222] rounded-[16px] p-4 border border-[#1e293b] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white">আয়ের গ্রাফ (গত ৭ দিন)</h3>
          </div>
          <button className="text-[10px] text-slate-400 flex items-center gap-0.5 hover:text-white transition-colors cursor-pointer" onClick={() => onNavigate('history')}>
            বিস্তারিত <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex items-end justify-between h-24 pt-2 pb-1 gap-2">
          {[
            { day: 'শনি', amount: 45, height: '40%' },
            { day: 'রবি', amount: 120, height: '80%' },
            { day: 'সোম', amount: 80, height: '60%' },
            { day: 'মঙ্গল', amount: 150, height: '95%' },
            { day: 'বুধ', amount: 30, height: '30%' },
            { day: 'বৃহঃ', amount: 90, height: '70%' },
            { day: 'শুক্র', amount: 200, height: '100%' }
          ].map((bar, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1 group">
              <span className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">৳{bar.amount}</span>
              <div className="w-full bg-slate-800 rounded-t-md relative overflow-hidden h-full flex items-end">
                <div 
                  className="w-full bg-gradient-to-t from-sky-600 to-sky-400 rounded-t-sm transition-all duration-700 ease-out group-hover:brightness-125" 
                  style={{ height: bar.height }} 
                />
              </div>
              <span className="text-[9px] text-slate-500 font-medium">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>

`;

code = code.slice(0, actionGridPoint) + newComponents + code.slice(actionGridPoint);

fs.writeFileSync('src/pages/DashboardPage.tsx', code);
console.log("Updated DashboardPage");
