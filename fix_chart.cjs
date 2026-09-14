const fs = require('fs');
let code = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

const regex = /<div className="flex items-end justify-between h-24 pt-2 pb-1 gap-2">[\s\S]*?<\/div>/;

const svgChart = `
        <div className="pt-4 pb-2">
          <div className="relative w-full h-20 mb-2">
            {/* Tooltips placed absolutely over the points */}
            <div className="absolute top-[30px] left-[-5px] text-[8px] font-bold text-slate-400 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">৳45</div>
            <div className="absolute top-[0px] left-[40px] text-[8px] font-bold text-slate-400 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">৳120</div>
            <div className="absolute top-[10px] left-[90px] text-[8px] font-bold text-slate-400 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">৳80</div>
            <div className="absolute top-[-10px] left-[140px] text-[8px] font-bold text-slate-400 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">৳150</div>
            <div className="absolute top-[25px] left-[190px] text-[8px] font-bold text-slate-400 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">৳30</div>
            <div className="absolute top-[5px] left-[240px] text-[8px] font-bold text-slate-400 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">৳90</div>
            <div className="absolute top-[-20px] right-[0px] text-[8px] font-bold text-emerald-400 opacity-100 transition-opacity cursor-pointer drop-shadow-md">৳200</div>

            {/* The SVG Line Chart */}
            <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible preserve-3d">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Area fill */}
              <path
                d="M 0 50 L 50 20 L 100 30 L 150 10 L 200 45 L 250 25 L 300 0 L 300 80 L 0 80 Z"
                fill="url(#chartGradient)"
                className="animate-pulse"
              />

              {/* Line path */}
              <path
                d="M 0 50 L 50 20 L 100 30 L 150 10 L 200 45 L 250 25 L 300 0"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />

              {/* Data Points */}
              <circle cx="0" cy="50" r="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" className="hover:r-5 transition-all cursor-pointer" />
              <circle cx="50" cy="20" r="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" className="hover:r-5 transition-all cursor-pointer" />
              <circle cx="100" cy="30" r="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" className="hover:r-5 transition-all cursor-pointer" />
              <circle cx="150" cy="10" r="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" className="hover:r-5 transition-all cursor-pointer" />
              <circle cx="200" cy="45" r="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" className="hover:r-5 transition-all cursor-pointer" />
              <circle cx="250" cy="25" r="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" className="hover:r-5 transition-all cursor-pointer" />
              {/* Highlighted last point */}
              <circle cx="300" cy="0" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" className="animate-pulse" />
            </svg>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between w-full text-[9px] text-slate-500 font-medium">
            <span>শনি</span>
            <span>রবি</span>
            <span>সোম</span>
            <span>মঙ্গল</span>
            <span>বুধ</span>
            <span>বৃহঃ</span>
            <span>শুক্র</span>
          </div>
        </div>
`;

if (regex.test(code)) {
  code = code.replace(regex, svgChart);
  fs.writeFileSync('src/pages/DashboardPage.tsx', code);
  console.log("Replaced with SVG chart.");
} else {
  console.log("Could not find the chart wrapper div.");
}
