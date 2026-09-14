const fs = require('fs');
let code = fs.readFileSync('src/pages/DashboardPage.tsx', 'utf8');

// Import fetchApi
if (!code.includes('import { fetchApi }')) {
  code = code.replace("import { useApp } from '../context/AppContext';", "import { useApp } from '../context/AppContext';\nimport { fetchApi } from '../lib/api';");
}

// Add state and effect for dynamic chart inside DashboardPage component
const stateRegex = /const \[showNotice, setShowNotice\] = useState\(true\);/;

const dynamicState = `
  const [showNotice, setShowNotice] = useState(true);

  // Dynamic Chart State
  const [chartData, setChartData] = useState([]);
  
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const transactions = await fetchApi('/user/transactions');
        // Filter last 7 days earnings
        const earnings = transactions.filter(t => t.amount > 0);
        
        // Generate last 7 days labels
        const today = new Date();
        const days = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
        const last7Days = Array.from({length: 7}).map((_, i) => {
          const d = new Date(today);
          d.setDate(d.getDate() - (6 - i));
          return {
            dateStr: d.toDateString(),
            label: days[d.getDay()],
            amount: 0
          };
        });

        // Sum earnings per day
        earnings.forEach(t => {
          const tDate = new Date(t.createdAt).toDateString();
          const dayObj = last7Days.find(d => d.dateStr === tDate);
          if (dayObj) {
            dayObj.amount += t.amount;
          }
        });

        setChartData(last7Days);
      } catch (err) {
        console.error(err);
      }
    };
    fetchChartData();
  }, []);

  const getChartPaths = () => {
    const data = chartData.length > 0 ? chartData : [
      {label: 'শনি', amount: 0}, {label: 'রবি', amount: 0}, {label: 'সোম', amount: 0}, 
      {label: 'মঙ্গল', amount: 0}, {label: 'বুধ', amount: 0}, {label: 'বৃহঃ', amount: 0}, {label: 'শুক্র', amount: 0}
    ];
    
    const max = Math.max(...data.map(d => d.amount), 10); // at least 10 scale
    const width = 300;
    const xStep = width / 6;

    const points = data.map((d, i) => {
      const x = i * xStep;
      const y = 60 - ((d.amount / max) * 50); 
      return { x, y, amount: d.amount, label: d.label };
    });

    const path = points.map((p, i) => \`\${i === 0 ? 'M' : 'L'} \${p.x} \${p.y}\`).join(' ');
    const fillPath = \`\${path} L 300 80 L 0 80 Z\`;

    return { points, path, fillPath };
  };

  const chart = getChartPaths();
`;

code = code.replace(stateRegex, dynamicState);

// Replace static chart render logic
const staticChartRegex = /<div className="pt-4 pb-2">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

const newChartHtml = `
        <div className="pt-4 pb-2">
          <div className="relative w-full h-20 mb-2">
            {chart.points.map((p, i) => (
              <div 
                key={i} 
                className="absolute text-[8px] font-bold text-slate-400 opacity-0 hover:opacity-100 transition-opacity cursor-pointer whitespace-nowrap z-20"
                style={{ top: p.y - 15, left: p.x - 10 }}
              >
                ৳{p.amount.toFixed(0)}
              </div>
            ))}
            
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

              <path
                d={chart.fillPath}
                fill="url(#chartGradient)"
                className="animate-pulse"
              />

              <path
                d={chart.path}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />

              {chart.points.map((p, i) => (
                <circle 
                  key={i}
                  cx={p.x} 
                  cy={p.y} 
                  r={i === chart.points.length - 1 ? 4.5 : 3} 
                  fill={i === chart.points.length - 1 ? "#38bdf8" : "#0f172a"} 
                  stroke={i === chart.points.length - 1 ? "#ffffff" : "#38bdf8"} 
                  strokeWidth={i === chart.points.length - 1 ? 1.5 : 2} 
                  className={i === chart.points.length - 1 ? "animate-pulse cursor-pointer relative z-10" : "hover:r-5 transition-all cursor-pointer relative z-10"} 
                />
              ))}
            </svg>
          </div>

          <div className="flex justify-between w-full text-[9px] text-slate-500 font-medium">
            {chart.points.map((p, i) => (
              <span key={i}>{p.label}</span>
            ))}
          </div>
        </div>
      </div>
`;

code = code.replace(staticChartRegex, newChartHtml);
fs.writeFileSync('src/pages/DashboardPage.tsx', code);
console.log("Updated Dynamic Chart");
