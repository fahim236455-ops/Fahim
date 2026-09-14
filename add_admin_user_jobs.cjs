const fs = require('fs');
let code = fs.readFileSync('server/api.ts', 'utf8');

const newEndpoints = `
apiRouter.get('/admin/user-jobs', requireAdmin, requirePermission('canManageTasks'), (req, res) => {
  const db = getDatabase();
  res.json(db.user_posted_jobs || []);
});

apiRouter.post('/admin/user-jobs/:id/review', requireAdmin, requirePermission('canManageTasks'), (req, res) => {
  try {
    const { status } = req.body; // 'active' or 'rejected'
    const jobId = req.params.id;
    const now = new Date().toISOString();
    
    mutateLedger((db) => {
      if (!db.user_posted_jobs) db.user_posted_jobs = [];
      const job = db.user_posted_jobs.find(j => j.id === jobId);
      if (!job) throw new Error('জবটি পাওয়া যায়নি।');
      if (job.status !== 'pending') throw new Error('এই জবটি ইতিমধ্যে রিভিউ করা হয়েছে।');
      
      if (status === 'active') {
        job.status = 'active';
        job.updatedAt = now;
        
        // Map main category to task category
        let taskCat = 'general';
        const catLower = (job.mainCategory || '').toLowerCase();
        if (catLower.includes('youtube')) taskCat = 'youtube';
        else if (catLower.includes('facebook')) taskCat = 'facebook';
        else if (catLower.includes('instagram')) taskCat = 'instagram';
        else if (catLower.includes('telegram')) taskCat = 'telegram';
        else if (catLower.includes('app')) taskCat = 'app';
        else if (catLower.includes('web')) taskCat = 'website';
        else if (catLower.includes('gmail')) taskCat = 'gmail';

        const publicTask = {
          id: job.linkedTaskId,
          userJobId: job.id,
          createdByUserId: job.userId,
          createdByUserName: job.userFullName,
          title: job.title.startsWith('[মাইক্রো জব]') ? job.title : \`[মাইক্রো জব] \${job.title}\`,
          description: \`\${job.instructions}\\n\\nক্যাটাগরি: \${job.mainCategory} > \${job.subCategory}\\nনিয়োগদাতা: \${job.userFullName}\`,
          category: taskCat,
          rewardAmount: job.costPerWorker,
          taskType: 'manual',
          proofType: 'screenshot_and_username',
          proofInstruction: (job.proofRequirements || []).map((p) => p.title).join(', '),
          targetUrl: job.targetUrl || '',
          dailyLimit: 1,
          totalSlots: job.workersNeeded,
          slotsRemaining: job.workersNeeded,
          workersCompleted: 0,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        };

        if (!db.tasks) db.tasks = [];
        db.tasks.unshift(publicTask);
        
      } else if (status === 'rejected') {
        job.status = 'rejected';
        job.updatedAt = now;
        
        // Refund user
        const user = db.profiles.find((p) => p.id === job.userId);
        if (user && job.totalPayable > 0) {
          user.balance = Number((user.balance + job.totalPayable).toFixed(2));
          user.updatedAt = now;
          
          db.transactions.push({
            id: generateId(),
            userId: user.id,
            type: 'withdrawal_refund',
            amount: job.totalPayable,
            balanceAfter: user.balance,
            description: \`জব পোস্ট বাতিল হওয়ায় রিফান্ড (\${job.title.slice(0, 30)})\`,
            referenceId: job.id,
            createdAt: now,
          });
        }
      } else {
        throw new Error('অবৈধ স্ট্যাটাস');
      }
    });
    
    res.json({ message: 'জব স্ট্যাটাস আপডেট করা হয়েছে।' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

`;

const insertIndex = code.indexOf('apiRouter.get(\'/admin/tasks\'');
code = code.slice(0, insertIndex) + newEndpoints + code.slice(insertIndex);

fs.writeFileSync('server/api.ts', code);
console.log("Added Admin User Jobs endpoints");
