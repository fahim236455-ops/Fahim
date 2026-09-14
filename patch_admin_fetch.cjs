const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPanelPage.tsx', 'utf8');

// Add state for userJobs
const stateInsert = `  const [userJobs, setUserJobs] = useState<any[]>([]);\n`;
const statePoint = code.indexOf('const [socialTasks, setSocialTasks] = useState');
code = code.slice(0, statePoint) + stateInsert + code.slice(statePoint);

// Add fetch call in loadData
const fetchInsert = `          fetchApi(\`/admin/user-jobs?t=\${Date.now()}\`).catch((e) => { console.error('UserJobs API:', e); return null; }),\n`;
const fetchPoint = code.indexOf('fetchApi(`/admin/stats?t=${Date.now()}`)');
code = code.slice(0, fetchPoint) + fetchInsert + code.slice(fetchPoint);

// Add response handling in loadData
const resInsert = `
        if (results[13]) setUserJobs(results[13]);
`;
// Actually, I don't know the exact index. Let's just find where it sets state.
// Wait, the index of results[13] might be wrong.
// Better strategy: Find `const [statsRes, subsRes, withRes, tasksRes, usersRes, ticketsRes, settingsRes, auditRes, socialSalesRes, socialJobsRes, socialTasksRes, rolesRes, cloudSyncRes]`

