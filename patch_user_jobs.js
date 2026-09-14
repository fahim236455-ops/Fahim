import fs from 'fs';

let code = fs.readFileSync('server/api.ts', 'utf8');

const targetContent = `      const newJob = {
        id: jobId,
        userId: user.id,
        userEmail: user.email,
        userFullName: user.fullName,
        mainCategory,
        subCategory,
        title,
        instructions,
        targetUrl: cleanTargetUrl,
        thumbnailUrl: thumbnailUrl || '',
        proofRequirements: formattedProofs,
        workersNeeded: numWorkers,
        workersCompleted: 0,
        costPerWorker: cost,
        netAmount,
        systemFee,
        totalPayable: chargedAmount,
        status: 'active' as const,
        linkedTaskId: taskId,
        createdAt: now,
        updatedAt: now,
      };

      if (!db.user_posted_jobs) db.user_posted_jobs = [];
      db.user_posted_jobs.unshift(newJob);

      // Also publish to active public tasks so other workers can do the job!
      // Map main category to task category
      let taskCat: any = 'general';
      const catLower = mainCategory.toLowerCase();
      if (catLower.includes('youtube')) taskCat = 'youtube';
      else if (catLower.includes('facebook')) taskCat = 'facebook';
      else if (catLower.includes('instagram')) taskCat = 'instagram';
      else if (catLower.includes('telegram')) taskCat = 'telegram';
      else if (catLower.includes('app')) taskCat = 'app';
      else if (catLower.includes('web')) taskCat = 'website';
      else if (catLower.includes('gmail')) taskCat = 'gmail';

      const publicTask = {
        id: taskId,
        userJobId: jobId,
        createdByUserId: user.id,
        createdByUserName: user.fullName,
        title: title.startsWith('[মাইক্রো জব]') ? title : \`[মাইক্রো জব] \${title}\`,
        description: \`\${instructions}\\n\\nক্যাটাগরি: \${mainCategory} > \${subCategory}\\nনিয়োগদাতা: \${user.fullName}\`,
        category: taskCat,
        rewardAmount: cost,
        taskType: 'manual' as const,
        proofType: 'screenshot_and_username' as const,
        proofInstruction: formattedProofs.map((p: any) => p.title).join(', '),
        targetUrl: cleanTargetUrl,
        dailyLimit: 1, // Daily limit for 1 user is 1 submission
        totalSlots: numWorkers,
        slotsRemaining: numWorkers,
        workersCompleted: 0,
        status: 'active' as const,
        createdAt: now,
        updatedAt: now,
      };

      // Place task at the top of tasks so it immediately appears first in Micro Job!
      if (!db.tasks) db.tasks = [];
      db.tasks.unshift(publicTask);`;

const replacementContent = `      const newJob = {
        id: jobId,
        userId: user.id,
        userEmail: user.email,
        userFullName: user.fullName,
        mainCategory,
        subCategory,
        title,
        instructions,
        targetUrl: cleanTargetUrl,
        thumbnailUrl: thumbnailUrl || '',
        proofRequirements: formattedProofs,
        workersNeeded: numWorkers,
        workersCompleted: 0,
        costPerWorker: cost,
        netAmount,
        systemFee,
        totalPayable: chargedAmount,
        status: 'pending' as const,
        linkedTaskId: taskId,
        createdAt: now,
        updatedAt: now,
      };

      if (!db.user_posted_jobs) db.user_posted_jobs = [];
      db.user_posted_jobs.unshift(newJob);

      // Do NOT publish to public tasks immediately. Wait for admin approval.`;

code = code.replace(targetContent, replacementContent);
fs.writeFileSync('server/api.ts', code);
console.log("Replaced POST /user-jobs successfully.");
