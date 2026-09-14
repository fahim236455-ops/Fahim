const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPanelPage.tsx', 'utf8');

// 1. Add pendingUserJobs state
const stateInsert = `  const [pendingUserJobs, setPendingUserJobs] = useState<any[]>([]);\n`;
const statePoint = code.indexOf('const [socialTasks, setSocialTasks] = useState<any[]>([])');
code = code.slice(0, statePoint) + stateInsert + code.slice(statePoint);

// 2. Add fetch result to destructuring array
const arrStr = 'const [statsData, subData, withData, taskData, usrData, tktData, settsData, logsData, socData, socJobsData, socTasksData, rolesData, syncData';
const arrReplace = arrStr + ', userJobsData';
code = code.replace(arrStr, arrReplace);

// 3. Add fetch promise
const fetchInsert = `          fetchApi(\`/admin/user-jobs?t=\${Date.now()}\`).catch((e) => { console.error('UserJobs API:', e); return null; }),\n`;
const fetchPoint = code.indexOf('fetchApi(`/admin/cloud-sync?t=${Date.now()}`)');
code = code.slice(0, fetchPoint) + fetchInsert + code.slice(fetchPoint);

// 4. Set state from fetch result
const setInsert = `      if (Array.isArray(userJobsData)) setPendingUserJobs(userJobsData);\n`;
const setPoint = code.indexOf('if (Array.isArray(socJobsData)) setSocialJobs(socJobsData);') + 'if (Array.isArray(socJobsData)) setSocialJobs(socJobsData);'.length + 1;
code = code.slice(0, setPoint) + setInsert + code.slice(setPoint);

// 5. Add tab
const tabInsert = `            {
              id: 'user_jobs',
              label: \`ইউজার জব রিকোয়েস্ট (\${pendingUserJobs.filter((j) => j.status === 'pending').length})\`,
              icon: Briefcase,
              perm: 'canManageTasks'
            },
`;
const tabPoint = code.indexOf('{ id: \'tasks\', label:');
code = code.slice(0, tabPoint) + tabInsert + code.slice(tabPoint);

fs.writeFileSync('src/pages/AdminPanelPage.tsx', code);
console.log("Patched state and tabs.");
