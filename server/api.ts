import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import {
  getDatabase,
  mutateLedger,
  generateId,
  generateReferralCode,
  AdminPermissions,
  DEFAULT_SUPER_ADMIN_PERMISSIONS,
  DEFAULT_SUB_ADMIN_PERMISSIONS,
  getCloudSyncStatus,
  forcePushToCloud,
  forcePullFromCloud,
} from './db.js';
import {
  requireAuth,
  requireAdmin,
  requirePermission,
  optionalAuth,
  signToken,
  AuthenticatedRequest,
} from './auth.js';

export const apiRouter = Router();

// ==========================================
// 1. PUBLIC & SITE SETTINGS ENDPOINTS
// ==========================================

apiRouter.get('/settings', (req, res) => {
  const db = getDatabase();
  const settings = db.site_settings;
  res.json({
    brandName: settings.brandName || 'Earnora',
    referralReward: settings.referralReward ?? 50,
    minWithdrawal: settings.minWithdrawal ?? 500,
    maxWithdrawal: settings.maxWithdrawal ?? 50000,
    withdrawalFeePercent: settings.withdrawalFeePercent ?? 2,
    withdrawalMethods: settings.withdrawalMethods || ['bKash', 'Nagad', 'Rocket'],
    bkashNumber: settings.bkashNumber || '',
    nagadNumber: settings.nagadNumber || '',
    rocketNumber: settings.rocketNumber || '',
    supportPhone: settings.supportPhone || '',
    supportWhatsapp: settings.supportWhatsapp || '',
    supportTelegram: settings.supportTelegram || '',
    supportEmail: settings.supportEmail || '',
    announcement: settings.announcement || '',
    signupBonus: settings.signupBonus ?? 10,
    dailyCheckinReward: settings.dailyCheckinReward ?? 1,
    popupNotice: settings.popupNotice || { enabled: false, title: '', message: '' },
    maintenanceMode: settings.maintenanceMode || { enabled: false, message: '' },
    heroTitle: settings.heroTitle || '',
    heroSubtitle: settings.heroSubtitle || '',
    heroVideoUrl: settings.heroVideoUrl || '',
    telegramChannelUrl: settings.telegramChannelUrl || '',
    telegramGroupUrl: settings.telegramGroupUrl || '',
    faqs: settings.faqs || [],
  });
});

// ==========================================
// 2. AUTHENTICATION ENDPOINTS
// ==========================================

apiRouter.post('/auth/register', (req, res) => {
  try {
    const { fullName, phoneNumber, email, password, confirmPassword, referralCode } = req.body;

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      res.status(400).json({ error: 'সঠিক পূর্ণ নাম প্রদান করুন।' });
      return;
    }

    if (!phoneNumber || typeof phoneNumber !== 'string' || !/^01[3-9]\d{8}$/.test(phoneNumber.replace(/\s+/g, ''))) {
      res.status(400).json({ error: 'সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)' });
      return;
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ error: 'সঠিক ইমেইল ঠিকানা দিন।' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: 'পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phoneNumber.replace(/\s+/g, '');

    const result = mutateLedger((db) => {
      // Check existing email
      const existingEmail = db.profiles.find((p) => p.email.toLowerCase() === cleanEmail);
      if (existingEmail) {
        throw new Error('এই ইমেইল ঠিকানা দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে।');
      }

      // Check existing phone
      const existingPhone = db.profiles.find((p) => p.phoneNumber === cleanPhone);
      if (existingPhone) {
        throw new Error('এই মোবাইল নম্বরটি ইতিমধ্যে ব্যবহৃত হয়েছে।');
      }

      // Check optional referral code
      let referrerId: string | null = null;
      if (referralCode && typeof referralCode === 'string' && referralCode.trim()) {
        const cleanRef = referralCode.trim().toUpperCase();
        const referrer = db.profiles.find((p) => p.referralCode === cleanRef);
        if (referrer) {
          referrerId = referrer.id;
        }
      }

      // Generate unique referral code
      let newRefCode = generateReferralCode();
      while (db.profiles.some((p) => p.referralCode === newRefCode)) {
        newRefCode = generateReferralCode();
      }

      const newUserId = generateId();
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(password, salt);
      const now = new Date().toISOString();

      const newProfile = {
        id: newUserId,
        email: cleanEmail,
        fullName: fullName.trim(),
        phoneNumber: cleanPhone,
        referralCode: newRefCode,
        referredBy: referrerId,
        balance: 0.0,
        totalEarned: 0.0,
        totalWithdrawn: 0.0,
        totalReferrals: 0,
        status: 'active' as const,
        createdAt: now,
        updatedAt: now,
      };

      db.profiles.push(newProfile);

      db.user_roles.push({
        id: generateId(),
        userId: newUserId,
        role: 'user',
        createdAt: now,
      });

      db.auth_credentials.push({
        userId: newUserId,
        passwordHash,
        updatedAt: now,
      });

      // Record referral relationship if valid referrer found
      if (referrerId) {
        db.referrals.push({
          id: generateId(),
          referrerId,
          referredUserId: newUserId,
          rewardAmount: db.site_settings.referralReward,
          status: 'registered',
          createdAt: now,
        });
      }

      return newProfile;
    });

    const token = signToken({
      userId: result.id,
      email: result.email,
      role: 'user',
    });

    res.cookie('fahimpay_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'রেজিস্ট্রেশন সফল হয়েছে!',
      token,
      user: {
        ...result,
        roles: ['user'],
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।' });
  }
});

apiRouter.post('/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'ইমেইল ও পাসওয়ার্ড প্রদান করুন।' });
      return;
    }

    const cleanInput = email.trim();
    const cleanPhone = cleanInput.replace(/\s+/g, '').replace(/^(\+880|880)/, '0');
    const db = getDatabase();

    const profile = db.profiles.find(
      (p) =>
        p.email.toLowerCase() === cleanInput.toLowerCase() ||
        p.phoneNumber === cleanInput ||
        p.phoneNumber === cleanPhone ||
        p.phoneNumber.replace(/\s+/g, '') === cleanPhone
    );
    if (!profile) {
      res.status(401).json({ error: 'ইমেইল বা মোবাইল নম্বরটি খুঁজে পাওয়া যায়নি।' });
      return;
    }

    if (profile.status === 'suspended') {
      res.status(403).json({ error: 'আপনার অ্যাকাউন্টটি স্থগিত করা হয়েছে। সাপোর্টে যোগাযোগ করুন।' });
      return;
    }

    const cred = db.auth_credentials.find((c) => c.userId === profile.id);
    if (!cred || !bcrypt.compareSync(password, cred.passwordHash)) {
      res.status(401).json({ error: 'পাসওয়ার্ডটি সঠিক নয়। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' });
      return;
    }

    const roles = db.user_roles.filter((r) => r.userId === profile.id).map((r) => r.role);
    const primaryRole = roles.includes('admin') ? 'admin' : 'user';

    const token = signToken({
      userId: profile.id,
      email: profile.email,
      role: primaryRole,
    });

    res.cookie('fahimpay_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'লগইন সফল হয়েছে!',
      token,
      user: {
        ...profile,
        roles,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'লগইন প্রক্রিয়ায় ত্রুটি দেখা দিয়েছে।' });
  }
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const profile = db.profiles.find((p) => p.id === req.user!.userId);
  if (!profile) {
    res.status(404).json({ error: 'প্রোফাইল পাওয়া যায়নি।' });
    return;
  }

  const adminRole = db.user_roles.find((r) => r.userId === profile.id && r.role === 'admin');
  const roles = db.user_roles.filter((r) => r.userId === profile.id).map((r) => r.role);
  const isSuperAdmin = Boolean(adminRole?.isSuperAdmin || profile.email.toLowerCase() === 'fahim236455@gmail.com');
  const adminPermissions = adminRole
    ? isSuperAdmin
      ? { ...DEFAULT_SUPER_ADMIN_PERMISSIONS }
      : ({ ...(adminRole.permissions || DEFAULT_SUB_ADMIN_PERMISSIONS) } as AdminPermissions)
    : null;
  const adminTitle = adminRole
    ? adminRole.title || (isSuperAdmin ? 'সুপার অ্যাডমিন (Founder & Admin)' : 'সাব-অ্যাডমিন / মডারেটর')
    : null;

  res.json({
    user: {
      ...profile,
      roles,
      isSuperAdmin,
      adminTitle,
      adminPermissions,
    },
    settings: db.site_settings,
  });
});

apiRouter.post('/auth/logout', (req, res) => {
  res.clearCookie('fahimpay_token');
  res.json({ message: 'লগআউট সফল হয়েছে।' });
});

apiRouter.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'ইমেইল দিন।' });
    return;
  }
  res.json({
    message: 'পাসওয়ার্ড রিসেট নির্দেশনা আপনার ইমেইলে পাঠানো হয়েছে অথবা অফিসিয়াল টেলিগ্রাম সাপোর্ট যোগাযোগ করুন।',
  });
});

apiRouter.post('/auth/change-password', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
    return;
  }

  try {
    mutateLedger((db) => {
      const cred = db.auth_credentials.find((c) => c.userId === req.user!.userId);
      if (!cred) {
        throw new Error('ব্যবহারকারীর ক্রেডেনশিয়াল পাওয়া যায়নি।');
      }
      const salt = bcrypt.genSaltSync(10);
      cred.passwordHash = bcrypt.hashSync(newPassword, salt);
      cred.updatedAt = new Date().toISOString();
    });

    res.json({ message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'পাসওয়ার্ড পরিবর্তনে ত্রুটি।' });
  }
});

apiRouter.put('/user/update-profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { fullName, phoneNumber, avatar } = req.body;

  try {
    let updatedProfile = null;
    mutateLedger((db) => {
      const profile = db.profiles.find((p) => p.id === req.user!.userId);
      if (!profile) {
        throw new Error('ব্যবহারকারী খুঁজে পাওয়া যায়নি।');
      }

      if (fullName && typeof fullName === 'string' && fullName.trim() !== '') {
        profile.fullName = fullName.trim();
      }
      
      if (phoneNumber && typeof phoneNumber === 'string' && /^01[3-9]\d{8}$/.test(phoneNumber.replace(/\s+/g, ''))) {
        const cleanPhone = phoneNumber.replace(/\s+/g, '');
        // Check if phone number is already used by someone else
        const existingPhone = db.profiles.find((p) => p.phoneNumber === cleanPhone && p.id !== req.user!.userId);
        if (existingPhone) {
          throw new Error('এই মোবাইল নম্বরটি অন্য একজন ব্যবহারকারী ব্যবহার করছেন।');
        }
        profile.phoneNumber = cleanPhone;
      }

      if (avatar !== undefined) {
        profile.avatar = typeof avatar === 'string' ? avatar : '';
      }

      profile.updatedAt = new Date().toISOString();
      updatedProfile = { ...profile };
    });

    res.json({ message: 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে।', user: updatedProfile });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'প্রোফাইল আপডেটে ত্রুটি।' });
  }
});

// ==========================================
// 3. USER DASHBOARD & TRANSACTIONS
// ==========================================

apiRouter.get('/user/summary', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.userId;
  const profile = db.profiles.find((p) => p.id === userId);
  if (!profile) {
    res.status(404).json({ error: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' });
    return;
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  const pendingWithdrawals = db.withdrawal_requests.filter(
    (w) => w.userId === profile.id && (w.status === 'pending' || w.status === 'approved')
  );
  const pendingWithdrawalsAmount = pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  const pendingTasksCount = db.task_submissions.filter(
    (t) => t.userId === profile.id && t.status === 'pending'
  ).length;

  const checkinTask = db.tasks.find((t) => t.category === 'daily_checkin' && t.status === 'active');
  const hasClaimedDailyCheckinToday = checkinTask
    ? db.task_submissions.some(
        (s) =>
          s.taskId === checkinTask.id &&
          s.userId === userId &&
          s.status === 'approved' &&
          s.createdAt.slice(0, 10) === todayStr
      )
    : false;

  const dailyCheckinAmount = checkinTask ? checkinTask.rewardAmount : 5;

  const activeTasksCount = db.tasks.filter((t) => t.status === 'active').length;

  const recentTransactions = db.transactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  const creditTypes = ['task_reward', 'referral_bonus', 'daily_checkin', 'withdrawal_refund'];
  const todayEarnings = db.transactions
    .filter((t) => t.userId === userId && creditTypes.includes(t.type) && t.createdAt.slice(0, 10) === todayStr)
    .reduce((sum, t) => sum + t.amount, 0);

  res.json({
    profile,
    pendingWithdrawalsAmount,
    pendingTasksCount,
    hasClaimedDailyCheckinToday,
    dailyCheckinAmount,
    activeTasksCount,
    recentTransactions,
    todayEarnings,
    settings: db.site_settings,
  });
});

apiRouter.get('/user/transactions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const txs = db.transactions
    .filter((t) => t.userId === req.user!.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(txs);
});

// ==========================================
// 4. TASK SYSTEM & DAILY CHECK-IN
// ==========================================

apiRouter.get('/tasks', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.userId;
  const todayStr = new Date().toISOString().slice(0, 10);

  const tasksWithStatus = (db.tasks || [])
    .filter((t) => t.status === 'active')
    .map((task) => {
      // Check submissions for this task by this user
      const userSubs = db.task_submissions.filter((s) => s.taskId === task.id && s.userId === userId);
      const todaySub = userSubs.find((s) => s.createdAt.slice(0, 10) === todayStr);

      const latestSub = userSubs.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      return {
        ...task,
        completedToday: Boolean(todaySub && todaySub.status === 'approved'),
        submissionStatus: latestSub ? latestSub.status : null,
      };
    });

  res.json(tasksWithStatus);
});

// Server-authoritative Daily Check-in (Safe Auto-task)
apiRouter.post('/tasks/daily-checkin', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const todayStr = new Date().toISOString().slice(0, 10);

    const result = mutateLedger((db) => {
      const user = db.profiles.find((p) => p.id === userId);
      if (!user) throw new Error('ব্যবহারকারী পাওয়া যায়নি।');

      const checkinTask = db.tasks.find((t) => t.category === 'daily_checkin' && t.status === 'active');
      if (!checkinTask) throw new Error('দৈনিক বোনাস টাস্ক বর্তমানে সক্রিয় নেই।');

      // Check if already checked in today
      const alreadyCheckedIn = db.task_submissions.some(
        (s) =>
          s.taskId === checkinTask.id &&
          s.userId === userId &&
          s.status === 'approved' &&
          s.createdAt.slice(0, 10) === todayStr
      );

      if (alreadyCheckedIn) {
        throw new Error('আপনি আজ ইতিমধ্যে দৈনিক বোনাস সংগ্রহ করেছেন। অনুগ্রহ করে আগামীকাল আবার আসুন।');
      }

      const reward = checkinTask.rewardAmount;
      const now = new Date().toISOString();

      // Atomic balance update
      user.balance = Number((user.balance + reward).toFixed(2));
      user.totalEarned = Number((user.totalEarned + reward).toFixed(2));
      user.updatedAt = now;

      // Submission record
      const submissionId = generateId();
      db.task_submissions.push({
        id: submissionId,
        taskId: checkinTask.id,
        userId,
        proofData: 'Auto daily check-in verified by server',
        status: 'approved',
        rewardAmount: reward,
        reviewedBy: 'system',
        reviewedAt: now,
        createdAt: now,
      });

      // Transaction record
      db.transactions.push({
        id: generateId(),
        userId,
        type: 'daily_checkin',
        amount: reward,
        balanceAfter: user.balance,
        description: 'দৈনিক উপস্থিতি বোনাস গ্রহণ',
        referenceId: submissionId,
        createdAt: now,
      });

      // REFERRAL REWARD CHECK:
      // Referrer earns ৳50 only after the referred user completes their FIRST valid approved task!
      handleFirstTaskReferralReward(db, user, now);

      return {
        newBalance: user.balance,
        reward,
      };
    });

    res.json({
      message: `অভিনন্দন! দৈনিক উপস্থিতি বোনাস ৳${result.reward} আপনার একাউন্টে জমা হয়েছে।`,
      balance: result.newBalance,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'দৈনিক বোনাস সংগ্রহে সমস্যা হয়েছে।' });
  }
});

// Manual task submission with auto-cycling to next available task
apiRouter.post('/tasks/submit', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskId, proofData, screenshot } = req.body;
    const userId = req.user!.userId;

    const hasProofText = typeof proofData === 'string' && proofData.trim().length >= 2;
    const hasScreenshot = typeof screenshot === 'string' && screenshot.startsWith('data:image');

    if (!taskId || (!hasProofText && !hasScreenshot)) {
      res.status(400).json({ error: 'টাস্ক প্রুফ টেক্সট অথবা স্ক্রিনশট প্রদান আবশ্যক।' });
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    const { submission, nextTask, remainingCount } = mutateLedger((db) => {
      const task = db.tasks.find((t) => t.id === taskId && t.status === 'active');
      if (!task) throw new Error('টাস্কটি খুঁজে পাওয়া যায়নি বা সক্রিয় নেই।');

      if (task.taskType === 'auto') {
        throw new Error('এটি একটি অটো টাস্ক। সরাসরি সাবমিট করা যাবে না।');
      }

      // Check daily limit
      const subsToday = db.task_submissions.filter(
        (s) => s.taskId === taskId && s.userId === userId && s.createdAt.slice(0, 10) === todayStr
      );

      if (subsToday.length >= task.dailyLimit) {
        throw new Error(`আজকের জন্য এই টাস্কটির দৈনিক সীমা (${task.dailyLimit} বার) পূর্ণ হয়েছে।`);
      }

      // Check if user already has a pending submission for this task
      const hasPending = db.task_submissions.some(
        (s) => s.taskId === taskId && s.userId === userId && s.status === 'pending'
      );
      if (hasPending) {
        throw new Error('এই টাস্কের একটি প্রুফ ইতিমধ্যে পর্যালোচনার জন্য অপেক্ষমান রয়েছে।');
      }

      const now = new Date().toISOString();
      const newSub = {
        id: generateId(),
        taskId,
        userId,
        proofData: hasProofText ? proofData.trim() : 'স্ক্রিনশট প্রুফ দাখিল করা হয়েছে',
        screenshot: hasScreenshot ? screenshot : undefined,
        status: 'pending' as const,
        rewardAmount: task.rewardAmount,
        createdAt: now,
      };

      db.task_submissions.push(newSub);

      // Identify remaining available manual tasks for this user
      const userSubs = db.task_submissions.filter((s) => s.userId === userId);
      const completedOrPendingIds = new Set(
        userSubs
          .filter((s) => s.status === 'pending' || s.status === 'approved' || s.createdAt.slice(0, 10) === todayStr)
          .map((s) => s.taskId)
      );

      const remainingTasks = db.tasks.filter(
        (t) => t.category !== 'daily_checkin' && t.status === 'active' && !completedOrPendingIds.has(t.id)
      );

      const next = remainingTasks.length > 0 ? remainingTasks[0] : null;

      return {
        submission: newSub,
        nextTask: next,
        remainingCount: remainingTasks.length,
      };
    });

    res.status(201).json({
      message: nextTask
        ? `টাস্ক প্রুফ সফলভাবে জমা হয়েছে! পরবর্তী কাজ: "${nextTask.title}" লোড করা হয়েছে।`
        : 'টাস্ক প্রুফ সফলভাবে জমা হয়েছে! এডমিন অনুমোদনের পর ব্যালেন্সে টাকা যোগ হবে।',
      submission,
      nextTask,
      remainingCount,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'টাস্ক সাবমিট ব্যর্থ হয়েছে।' });
  }
});

// Helper for referral reward after first task completion
function handleFirstTaskReferralReward(db: ReturnType<typeof getDatabase>, user: any, now: string) {
  // Find registered referral for this user
  const referral = db.referrals.find((r) => r.referredUserId === user.id && r.status === 'registered');
  if (!referral) return;

  const referrer = db.profiles.find((p) => p.id === referral.referrerId);
  if (!referrer) return;

  const rewardAmount = db.site_settings.referralReward || 50.0;

  // Credit referrer
  referrer.balance = Number((referrer.balance + rewardAmount).toFixed(2));
  referrer.totalEarned = Number((referrer.totalEarned + rewardAmount).toFixed(2));
  referrer.totalReferrals += 1;
  referrer.updatedAt = now;

  // Mark referral as rewarded
  referral.status = 'rewarded';
  referral.rewardedAt = now;

  // Create transaction for referrer
  db.transactions.push({
    id: generateId(),
    userId: referrer.id,
    type: 'referral_bonus',
    amount: rewardAmount,
    balanceAfter: referrer.balance,
    description: `রেফারেল বোনাস (${user.fullName} প্রথম কাজ সম্পন্ন করেছেন)`,
    referenceId: referral.id,
    createdAt: now,
  });

  // Audit log
  db.audit_logs.push({
    id: generateId(),
    actorId: user.id,
    actorEmail: user.email,
    action: 'referral_reward_credited',
    details: {
      referrerId: referrer.id,
      referrerEmail: referrer.email,
      referredUserId: user.id,
      amount: rewardAmount,
    },
    createdAt: now,
  });
}

// ==========================================
// 4.5. USER POSTED JOBS (MICRO JOB POSTING & MANAGEMENT)
// ==========================================

// Get all jobs posted by current user
apiRouter.get('/user-jobs', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.userId;
  const userJobs = (db.user_posted_jobs || []).filter((j) => j.userId === userId);
  res.json(userJobs.reverse());
});

// Create and publish a new user micro job (3-step creation flow)
apiRouter.post('/user-jobs', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      mainCategory,
      subCategory,
      title,
      instructions,
      thumbnailUrl,
      proofRequirements,
      workersNeeded,
      costPerWorker,
    } = req.body;

    if (!mainCategory || !subCategory || !title || !instructions) {
      res.status(400).json({ error: 'কাজের ক্যাটাগরি, সাব-ক্যাটাগরি, শিরোনাম এবং বিবরণ বাধ্যতামূলক।' });
      return;
    }

    const numWorkers = parseInt(workersNeeded, 10);
    const cost = parseFloat(costPerWorker);

    if (isNaN(numWorkers) || numWorkers < 1) {
      res.status(400).json({ error: 'কমপক্ষে ১ জন ওয়ার্কার নির্বাচন করুন।' });
      return;
    }

    if (isNaN(cost) || cost < 0.5) {
      res.status(400).json({ error: 'প্রতি ওয়ার্কারের বাজেট কমপক্ষে ৳০.৫০ হতে হবে।' });
      return;
    }

    const netAmount = Number((numWorkers * cost).toFixed(2));
    const systemFee = Number((netAmount * 0.10).toFixed(2)); // 10% system fee
    const totalPayable = Number((netAmount + systemFee).toFixed(2));

    const userId = req.user!.userId;

    const result = mutateLedger((db) => {
      const user = db.profiles.find((p) => p.id === userId);
      if (!user) {
        throw new Error('ব্যবহারকারী পাওয়া যায়নি।');
      }

      if (user.balance < totalPayable) {
        throw new Error(
          `আপনার ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই। মোট খরচ ৳${totalPayable.toFixed(2)}, আপনার বর্তমান ব্যালেন্স ৳${user.balance.toFixed(2)}`
        );
      }

      const now = new Date().toISOString();
      const jobId = generateId();
      const taskId = generateId();

      // Deduct balance from user
      user.balance = Number((user.balance - totalPayable).toFixed(2));
      user.updatedAt = now;

      // Add transaction
      db.transactions.push({
        id: generateId(),
        userId: user.id,
        type: 'withdrawal_hold',
        amount: totalPayable,
        balanceAfter: user.balance,
        description: `জব পোস্ট ফি কর্তন (${title.slice(0, 30)} - ${numWorkers} জন ওয়ার্কার)`,
        referenceId: jobId,
        createdAt: now,
      });

      // Prepare proof requirements
      const formattedProofs = Array.isArray(proofRequirements) && proofRequirements.length > 0
        ? proofRequirements.map((p: any, idx: number) => ({
            id: p.id || `proof-${idx + 1}`,
            title: p.title || 'কাজের স্ক্রিনশট বা প্রুফ',
            type: p.type === 'text' ? ('text' as const) : ('screenshot' as const),
          }))
        : [
            {
              id: 'proof-1',
              title: 'কাজের প্রুফ বা স্ক্রিনশট',
              type: 'screenshot' as const,
            },
          ];

      // Save user posted job record
      const newJob = {
        id: jobId,
        userId: user.id,
        userEmail: user.email,
        userFullName: user.fullName,
        mainCategory,
        subCategory,
        title,
        instructions,
        thumbnailUrl: thumbnailUrl || '',
        proofRequirements: formattedProofs,
        workersNeeded: numWorkers,
        workersCompleted: 0,
        costPerWorker: cost,
        netAmount,
        systemFee,
        totalPayable,
        status: 'active' as const,
        createdAt: now,
        updatedAt: now,
      };

      if (!db.user_posted_jobs) db.user_posted_jobs = [];
      db.user_posted_jobs.push(newJob);

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
        title: `[মাইক্রো জব] ${title}`,
        description: `${instructions}\n\nক্যাটাগরি: ${mainCategory} > ${subCategory}\nনিয়োগদাতা: ${user.fullName}`,
        category: taskCat,
        rewardAmount: cost,
        taskType: 'manual' as const,
        proofType: 'screenshot_and_username' as const,
        proofInstruction: formattedProofs.map((p: any) => p.title).join(', '),
        targetUrl: '',
        dailyLimit: numWorkers,
        status: 'active' as const,
        createdAt: now,
        updatedAt: now,
      };

      db.tasks.push(publicTask);

      // Audit log
      db.audit_logs.push({
        id: generateId(),
        actorId: user.id,
        actorEmail: user.email,
        action: 'user_posted_job_created',
        details: {
          jobId,
          taskId,
          title,
          numWorkers,
          cost,
          totalPayable,
        },
        createdAt: now,
      });

      return newJob;
    });

    res.status(201).json({
      message: 'আপনার জবটি সফলভাবে পোস্ট ও লাইভ করা হয়েছে!',
      job: result,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'জব পোস্ট করতে ব্যর্থ হয়েছে।' });
  }
});

// Toggle Job Status (Pause / Resume)
apiRouter.post('/user-jobs/:id/toggle-status', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const jobId = req.params.id;
    const userId = req.user!.userId;

    const job = mutateLedger((db) => {
      const targetJob = (db.user_posted_jobs || []).find((j) => j.id === jobId && j.userId === userId);
      if (!targetJob) {
        throw new Error('জব পাওয়া যায়নি বা আপনার অনুমতি নেই।');
      }

      targetJob.status = targetJob.status === 'active' ? 'paused' : 'active';
      targetJob.updatedAt = new Date().toISOString();
      return targetJob;
    });

    res.json({
      message: `জবটি ${job.status === 'active' ? 'চালু' : 'স্থগিত'} করা হয়েছে।`,
      job,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।' });
  }
});

// ==========================================
// 5. REFERRAL / TEAM ENDPOINT
// ==========================================


// ==========================================
// 8. TEAM & REFERRALS ENDPOINTS
// ==========================================
apiRouter.get('/team/leaderboard', requireAuth, (req, res) => {
  const db = getDatabase();
  
  const referralCounts = {};
  for (const ref of db.referrals) {
    if (ref.status === 'rewarded') {
      referralCounts[ref.referrerId] = (referralCounts[ref.referrerId] || 0) + 1;
    }
  }

  const leaderboard = db.profiles
    .map(p => ({
      id: p.id,
      name: p.fullName,
      successfulReferrals: referralCounts[p.id] || 0,
      avatar: p.avatar,
      earnings: (referralCounts[p.id] || 0) * (db.site_settings.referralReward ?? 50)
    }))
    .filter(p => p.successfulReferrals > 0)
    .sort((a, b) => b.successfulReferrals - a.successfulReferrals)
    .slice(0, 10);

  res.json({ leaderboard });
});

apiRouter.get('/team', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.userId;
  const user = db.profiles.find((p) => p.id === userId);
  if (!user) {
    res.status(404).json({ error: 'ব্যবহারকারী পাওয়া যায়নি।' });
    return;
  }

  // Dynamic origin detection
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const origin = `${protocol}://${host}`;
  const referralLink = `${origin}/register?ref=${user.referralCode}`;

  const userReferrals = db.referrals.filter((r) => r.referrerId === userId);
  const totalReferrals = userReferrals.length;
  const rewardedReferrals = userReferrals.filter((r) => r.status === 'rewarded');
  const referralEarnings = rewardedReferrals.reduce((sum, r) => sum + r.rewardAmount, 0);

  const referredUsers = userReferrals.map((ref) => {
    const referred = db.profiles.find((p) => p.id === ref.referredUserId);
    const maskedPhone = referred?.phoneNumber
      ? `${referred.phoneNumber.slice(0, 3)}****${referred.phoneNumber.slice(-4)}`
      : '01*********';

    return {
      id: ref.id,
      name: referred?.fullName || 'সদস্য',
      phone: maskedPhone,
      registeredAt: ref.createdAt,
      status: ref.status,
      rewardAmount: ref.rewardAmount,
    };
  });

  res.json({
    referralCode: user.referralCode,
    referralLink,
    totalReferrals,
    rewardedReferralsCount: rewardedReferrals.length,
    referralEarnings,
    rewardPerReferral: db.site_settings.referralReward,
    referredUsers,
  });
});

// ==========================================
// 6. WITHDRAWAL SYSTEM
// ==========================================

apiRouter.post('/withdrawals/request', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { method, accountNumber, amount } = req.body;
    const userId = req.user!.userId;

    const db = getDatabase();
    const settings = db.site_settings;
    const allowedMethods = settings.withdrawalMethods?.length
      ? [...new Set([...settings.withdrawalMethods, 'bKash', 'Nagad', 'Rocket', 'Recharge'])]
      : ['bKash', 'Nagad', 'Rocket', 'Recharge'];

    if (!method || !allowedMethods.includes(method)) {
      res.status(400).json({ error: `সঠিক পেমেন্ট মেথড নির্বাচন করুন (${allowedMethods.join(', ')})।` });
      return;
    }

    if (!accountNumber || typeof accountNumber !== 'string' || !/^01[3-9]\d{8}$/.test(accountNumber.replace(/\s+/g, ''))) {
      res.status(400).json({ error: 'সঠিক ১১ ডিজিটের পার্সোনাল নম্বর দিন (যেমন: 01712345678)' });
      return;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      res.status(400).json({ error: 'সঠিক উত্তোলনের পরিমাণ উল্লেখ করুন।' });
      return;
    }

    if (numericAmount < settings.minWithdrawal) {
      res.status(400).json({ error: `সর্বনিম্ন উত্তোলনের পরিমাণ ৳${settings.minWithdrawal} টাকা।` });
      return;
    }

    // Server-side fee recalculation: 2% of amount
    const fee = Number(((numericAmount * settings.withdrawalFeePercent) / 100).toFixed(2));
    const netAmount = Number((numericAmount - fee).toFixed(2));

    const result = mutateLedger((db) => {
      const user = db.profiles.find((p) => p.id === userId);
      if (!user) throw new Error('ব্যবহারকারী পাওয়া যায়নি।');

      if (user.balance < numericAmount) {
        throw new Error(`অপর্যাপ্ত ব্যালেন্স। আপনার বর্তমান ব্যালেন্স ৳${user.balance} টাকা।`);
      }

      // Check if user already has an active pending withdrawal
      const activePending = db.withdrawal_requests.some(
        (w) => w.userId === userId && w.status === 'pending'
      );
      if (activePending) {
        throw new Error('আপনার একটি উইথড্র রিকোয়েস্ট ইতিমধ্যে পেন্ডিং রয়েছে। নতুন রিকোয়েস্টের পূর্বে সেটি সম্পন্ন হতে দিন।');
      }

      const now = new Date().toISOString();
      const withdrawalId = generateId();

      // Reserve/Hold balance atomically
      user.balance = Number((user.balance - numericAmount).toFixed(2));
      user.updatedAt = now;

      const newWithdrawal = {
        id: withdrawalId,
        userId,
        method: method as any,
        accountNumber: accountNumber.replace(/\s+/g, ''),
        amount: numericAmount,
        fee,
        netAmount,
        status: 'pending' as const,
        createdAt: now,
      };

      db.withdrawal_requests.push(newWithdrawal);

      // Create transaction record for held funds
      db.transactions.push({
        id: generateId(),
        userId,
        type: 'withdrawal_hold',
        amount: -numericAmount,
        balanceAfter: user.balance,
        description: `${method} এর মাধ্যমে উত্তোলনের অনুরোধ (হোল্ড)`,
        referenceId: withdrawalId,
        createdAt: now,
      });

      return {
        withdrawal: newWithdrawal,
        newBalance: user.balance,
      };
    });

    res.status(201).json({
      message: `৳${numericAmount} টাকা উইথড্র রিকোয়েস্ট সফলভাবে গৃহীত হয়েছে! ফি ৳${fee} বাদ দিয়ে আপনি পাবেন ৳${netAmount} টাকা।`,
      withdrawal: result.withdrawal,
      balance: result.newBalance,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'উইথড্র রিকোয়েস্ট প্রক্রিয়াকরণে ত্রুটি।' });
  }
});

apiRouter.get('/withdrawals/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const history = db.withdrawal_requests
    .filter((w) => w.userId === req.user!.userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(history);
});

// ==========================================
// 7. PENDING STATUS ENDPOINT
// ==========================================

apiRouter.get('/user/pending', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.userId;

  const submissions = db.task_submissions
    .filter((s) => s.userId === userId)
    .map((s) => {
      const task = db.tasks.find((t) => t.id === s.taskId);
      return {
        ...s,
        taskTitle: task?.title || 'টাস্ক',
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const withdrawals = db.withdrawal_requests
    .filter((w) => w.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const socialSales = (db.social_account_sales || [])
    .filter((s) => s.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    pendingSubmissions: submissions,
    pendingWithdrawals: withdrawals,
    socialSales,
  });
});

// ==========================================
// 8. SUPPORT TICKETS
// ==========================================

apiRouter.get('/support/tickets', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user?.userId;
  const guestId = (req.query.guestId as string) || '';

  if (!userId && !guestId) {
    res.json([]);
    return;
  }

  const tickets = db.support_tickets
    .filter((t) => (userId && t.userId === userId) || (guestId && t.userId === guestId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(tickets);
});

apiRouter.post('/support/tickets', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subject, message, category, guestId, userName, userPhone, userEmail } = req.body;
    if (!subject || !message || subject.trim().length < 2 || message.trim().length < 2) {
      res.status(400).json({ error: 'বিষয় ও বার্তা সঠিকভাবে লিখুন।' });
      return;
    }

    const now = new Date().toISOString();
    const newTicket = mutateLedger((db) => {
      let resolvedUserId = req.user?.userId || guestId || `guest_${generateId()}`;
      let resolvedName = userName || 'গ্রাহক';
      let resolvedPhone = userPhone || '';
      let resolvedEmail = userEmail || '';

      if (req.user?.userId) {
        const profile = db.profiles.find((p) => p.id === req.user!.userId);
        if (profile) {
          resolvedName = profile.fullName;
          resolvedPhone = profile.phoneNumber;
          resolvedEmail = profile.email;
        }
      }

      const ticket = {
        id: generateId(),
        userId: resolvedUserId,
        userName: resolvedName,
        userPhone: resolvedPhone,
        userEmail: resolvedEmail,
        subject: subject.trim(),
        message: message.trim(),
        category: category || 'other',
        status: 'open' as const,
        messages: [
          {
            id: generateId(),
            sender: 'user' as const,
            text: message.trim(),
            timestamp: now,
          }
        ],
        createdAt: now,
        updatedAt: now,
      };
      db.support_tickets.push(ticket);
      return ticket;
    });

    res.status(201).json({
      message: 'সাপোর্ট টিকিট সফলভাবে পাঠানো হয়েছে। অ্যাডমিন টিম দ্রুত উত্তর দেবে।',
      ticket: newTicket,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'টিকিট তৈরিতে সমস্যা হয়েছে।' });
  }
});

// Real-Time / Live Chat Message Endpoint (Supports logged-in user or guest)
apiRouter.post('/support/chat/send', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ticketId, text, attachmentUrl, guestId, userName, userPhone, userEmail } = req.body;
    if ((!text || typeof text !== 'string' || text.trim().length === 0) && !attachmentUrl) {
      res.status(400).json({ error: 'মেসেজ বা ছবি সংযুক্ত করুন।' });
      return;
    }

    const now = new Date().toISOString();

    const result = mutateLedger((db) => {
      let resolvedUserId = req.user?.userId || guestId || `guest_${generateId()}`;
      let resolvedName = userName || 'সাপোর্ট গ্রাহক';
      let resolvedPhone = userPhone || '';
      let resolvedEmail = userEmail || '';

      if (req.user?.userId) {
        const profile = db.profiles.find((p) => p.id === req.user!.userId);
        if (profile) {
          resolvedName = profile.fullName;
          resolvedPhone = profile.phoneNumber;
          resolvedEmail = profile.email;
        }
      }

      let ticket = ticketId ? db.support_tickets.find((t) => t.id === ticketId) : null;
      if (!ticket) {
        // Find latest open or answered ticket for this user or guest
        ticket = db.support_tickets
          .filter((t) => t.userId === resolvedUserId && t.status !== 'closed')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      }

      const msgId = generateId();
      const newMsg = {
        id: msgId,
        sender: 'user' as const,
        text: (text || '').trim(),
        attachmentUrl: attachmentUrl || undefined,
        timestamp: now,
      };

      if (!ticket) {
        // Create new ticket for this chat session
        ticket = {
          id: generateId(),
          userId: resolvedUserId,
          userName: resolvedName,
          userPhone: resolvedPhone,
          userEmail: resolvedEmail,
          subject: 'সরাসরি লাইভ চ্যাট সাপোর্ট',
          message: (text || 'ছবি সংযুক্ত করা হয়েছে').trim(),
          category: 'other' as const,
          status: 'open' as const,
          messages: [newMsg],
          createdAt: now,
          updatedAt: now,
        };
        db.support_tickets.push(ticket);
      } else {
        if (!ticket.messages) {
          ticket.messages = [
            {
              id: generateId(),
              sender: 'user' as const,
              text: ticket.message,
              timestamp: ticket.createdAt,
            }
          ];
          if (ticket.adminReply) {
            ticket.messages.push({
              id: generateId(),
              sender: 'agent' as const,
              text: ticket.adminReply,
              timestamp: ticket.repliedAt || ticket.updatedAt,
            });
          }
        }
        ticket.messages.push(newMsg);
        ticket.updatedAt = now;
        ticket.status = 'open' as const; // reopen or mark open so admin sees new message
        if (!ticket.userName && resolvedName) ticket.userName = resolvedName;
        if (!ticket.userPhone && resolvedPhone) ticket.userPhone = resolvedPhone;
      }

      return { ticket, newMsg, guestId: resolvedUserId };
    });

    res.json({
      success: true,
      message: 'মেসেজ পাঠানো হয়েছে',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'মেসেজ পাঠাতে ব্যর্থ হয়েছে' });
  }
});

// Live Chat Poll Endpoint for User
apiRouter.get('/support/chat/poll', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user?.userId;
  const guestId = (req.query.guestId as string) || '';
  const ticketId = (req.query.ticketId as string) || '';

  if (!userId && !guestId && !ticketId) {
    res.json({ ticket: null, messages: [] });
    return;
  }

  let ticket = ticketId ? db.support_tickets.find((t) => t.id === ticketId) : null;
  if (!ticket) {
    ticket = db.support_tickets
      .filter((t) => (userId && t.userId === userId) || (guestId && t.userId === guestId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }

  if (!ticket) {
    res.json({ ticket: null, messages: [] });
    return;
  }

  res.json({
    ticket,
    messages: ticket.messages || [],
  });
});

// ==========================================
// 9. ADMIN PANEL ENDPOINTS (Strictly Protected)
// ==========================================

// In-memory rate limiter / brute force protector for Admin Login
const adminLoginAttempts = new Map<string, { count: number; lastAttempt: number; lockedUntil?: number }>();

// Admin Login (Enhanced Security)
apiRouter.post('/admin/login', (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'অ্যাডমিন ইমেইল ও পাসওয়ার্ড প্রদান আবশ্যক।' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const rateKey = `${ip}_${cleanEmail}`;
  const now = Date.now();

  const attempt = adminLoginAttempts.get(rateKey);
  if (attempt && attempt.lockedUntil && now < attempt.lockedUntil) {
    const remainingMinutes = Math.ceil((attempt.lockedUntil - now) / 60000);
    res.status(429).json({
      error: `অতিরিক্ত ভুল চেষ্টার কারণে অ্যাডমিন লগইন সাময়িকভাবে লক করা হয়েছে। ${remainingMinutes} মিনিট পর আবার চেষ্টা করুন।`,
    });
    return;
  }

  const db = getDatabase();
  const profile = db.profiles.find((p) => p.email.toLowerCase() === cleanEmail);

  if (!profile) {
    // Record failed attempt
    const currentCount = (attempt?.count || 0) + 1;
    const lockedUntil = currentCount >= 5 ? now + 10 * 60 * 1000 : undefined;
    adminLoginAttempts.set(rateKey, { count: currentCount, lastAttempt: now, lockedUntil });

    mutateLedger((d) => {
      d.audit_logs.push({
        id: generateId(),
        actorEmail: cleanEmail,
        action: 'admin_login_failed_user_not_found',
        details: { ip, attemptCount: currentCount },
        ipAddress: ip,
        createdAt: new Date().toISOString(),
      });
    });

    res.status(401).json({ error: 'অবৈধ অ্যাডমিন ক্রেডেনশিয়াল।' });
    return;
  }

  const hasAdminRole = db.user_roles.some((r) => r.userId === profile.id && r.role === 'admin');
  if (!hasAdminRole) {
    mutateLedger((d) => {
      d.audit_logs.push({
        id: generateId(),
        actorId: profile.id,
        actorEmail: profile.email,
        action: 'admin_login_rejected_no_role',
        details: { ip },
        ipAddress: ip,
        createdAt: new Date().toISOString(),
      });
    });

    res.status(403).json({ error: 'অননুমোদিত অ্যাক্সেস। আপনার অ্যাডমিন অনুমতি নেই।' });
    return;
  }

  const cred = db.auth_credentials.find((c) => c.userId === profile.id);
  if (!cred || !bcrypt.compareSync(password, cred.passwordHash)) {
    const currentCount = (attempt?.count || 0) + 1;
    const lockedUntil = currentCount >= 5 ? now + 10 * 60 * 1000 : undefined;
    adminLoginAttempts.set(rateKey, { count: currentCount, lastAttempt: now, lockedUntil });

    mutateLedger((d) => {
      d.audit_logs.push({
        id: generateId(),
        actorId: profile.id,
        actorEmail: profile.email,
        action: 'admin_login_failed_wrong_password',
        details: { ip, attemptCount: currentCount },
        ipAddress: ip,
        createdAt: new Date().toISOString(),
      });
    });

    res.status(401).json({ error: 'অবৈধ অ্যাডমিন ক্রেডেনশিয়াল।' });
    return;
  }

  // Clear failed attempts on successful login
  adminLoginAttempts.delete(rateKey);

  const token = signToken({
    userId: profile.id,
    email: profile.email,
    role: 'admin',
  });

  mutateLedger((d) => {
    d.audit_logs.push({
      id: generateId(),
      actorId: profile.id,
      actorEmail: profile.email,
      action: 'admin_login_success',
      details: { ip, browser: req.headers['user-agent'] || 'unknown' },
      ipAddress: ip,
      createdAt: new Date().toISOString(),
    });
  });

  res.cookie('fahimpay_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const adminRole = db.user_roles.find((r) => r.userId === profile.id && r.role === 'admin');
  const isSuperAdmin = Boolean(adminRole?.isSuperAdmin || profile.email.toLowerCase() === 'fahim236455@gmail.com');
  const adminPermissions = adminRole
    ? isSuperAdmin
      ? { ...DEFAULT_SUPER_ADMIN_PERMISSIONS }
      : ({ ...(adminRole.permissions || DEFAULT_SUB_ADMIN_PERMISSIONS) } as AdminPermissions)
    : null;
  const adminTitle = adminRole
    ? adminRole.title || (isSuperAdmin ? 'সুপার অ্যাডমিন (Founder & Admin)' : 'সাব-অ্যাডমিন / মডারেটর')
    : null;

  res.json({
    message: 'অ্যাডমিন লগইন সফল হয়েছে!',
    token,
    admin: {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      role: 'admin',
      isSuperAdmin,
      adminTitle,
      adminPermissions,
    },
  });
});

// Admin Dashboard Overview Stats
apiRouter.get('/admin/stats', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();

  const totalUsers = db.profiles.length;
  const activeUsers = db.profiles.filter((p) => p.status === 'active').length;
  const totalBalance = Number(db.profiles.reduce((sum, p) => sum + p.balance, 0).toFixed(2));
  const totalWithdrawn = Number(
    db.withdrawal_requests
      .filter((w) => w.status === 'paid')
      .reduce((sum, w) => sum + w.netAmount, 0)
      .toFixed(2)
  );

  const pendingWithdrawals = db.withdrawal_requests.filter((w) => w.status === 'pending');
  const pendingWithdrawalsCount = pendingWithdrawals.length;
  const pendingWithdrawalsAmount = Number(
    pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0).toFixed(2)
  );

  const pendingGeneralTasks = db.task_submissions.filter((s) => s.status === 'pending').length;
  const pendingSocialSales = (db.social_account_sales || []).filter((s) => s.status === 'pending').length;
  const pendingTasksCount = pendingGeneralTasks + pendingSocialSales;

  const completedGeneralTasks = db.task_submissions.filter((s) => s.status === 'approved').length;
  const completedSocialSales = (db.social_account_sales || []).filter((s) => s.status === 'approved').length;
  const completedTasksCount = completedGeneralTasks + completedSocialSales;
  const totalReferralsCount = db.referrals.length;

  res.json({
    totalUsers,
    activeUsers,
    totalBalance,
    totalWithdrawn,
    pendingWithdrawalsCount,
    pendingWithdrawalsAmount,
    pendingTasksCount,
    completedTasksCount,
    pendingSocialSalesCount: pendingSocialSales,
    pendingGeneralTasksCount: pendingGeneralTasks,
    totalReferralsCount,
  });
});

// Admin Users Management
apiRouter.get('/admin/users', requirePermission('canManageUsers'), (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const search = (req.query.search as string || '').toLowerCase().trim();

  let users = db.profiles
    .map((p) => {
      const roles = db.user_roles.filter((r) => r.userId === p.id).map((r) => r.role);
      return {
        ...p,
        roles,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (search) {
    users = users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.phoneNumber.includes(search) ||
        u.referralCode.toLowerCase().includes(search)
    );
  }

  res.json(users);
});

apiRouter.post('/admin/users/:id/toggle-status', requirePermission('canManageUsers'), (req: AuthenticatedRequest, res: Response) => {
  const userId = req.params.id;
  try {
    const updated = mutateLedger((db) => {
      const user = db.profiles.find((p) => p.id === userId);
      if (!user) throw new Error('ব্যবহারকারী পাওয়া যায়নি।');

      const isCurrentAdmin = db.user_roles.some((r) => r.userId === userId && r.role === 'admin');
      if (isCurrentAdmin && user.email === 'fahim236455@gmail.com') {
        throw new Error('মূল অ্যাডমিন অ্যাকাউন্ট স্থগিত করা যাবে না।');
      }

      user.status = user.status === 'active' ? 'suspended' : 'active';
      user.updatedAt = new Date().toISOString();

      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: user.status === 'active' ? 'user_reactivated' : 'user_suspended',
        details: { targetUserId: user.id, targetEmail: user.email },
        createdAt: new Date().toISOString(),
      });

      return user;
    });

    res.json({ message: `ব্যবহারকারীর স্ট্যাটাস এখন ${updated.status}`, user: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/users/:id/balance', requirePermission('canManageUsers'), (req: AuthenticatedRequest, res: Response) => {
  const userId = req.params.id;
  const { amount, type, reason } = req.body;

  if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
    res.status(400).json({ error: 'সঠিক ইতিবাচক টাকার পরিমাণ প্রদান করুন।' });
    return;
  }

  const numAmount = Number(amount);
  const isCredit = type === 'credit';

  try {
    const updatedUser = mutateLedger((db) => {
      const user = db.profiles.find((p) => p.id === userId);
      if (!user) throw new Error('ব্যবহারকারী পাওয়া যায়নি।');

      if (!isCredit && user.balance < numAmount) {
        throw new Error(`ব্যবহারকারীর বর্তমান ব্যালেন্স (৳${user.balance.toFixed(2)}) এর চেয়ে বেশি পরিমাণ কাটা সম্ভব নয়।`);
      }

      if (isCredit) {
        user.balance = Number((user.balance + numAmount).toFixed(2));
        user.totalEarned = Number((user.totalEarned + numAmount).toFixed(2));
      } else {
        user.balance = Number((user.balance - numAmount).toFixed(2));
      }
      user.updatedAt = new Date().toISOString();

      // Log transaction ledger entry
      db.transactions.push({
        id: generateId(),
        userId: user.id,
        type: 'admin_adjustment',
        amount: isCredit ? numAmount : -numAmount,
        balanceAfter: user.balance,
        description: reason ? reason.trim() : (isCredit ? 'অ্যাডমিন ক্রেডিট সমন্বয়' : 'অ্যাডমিন ডেব্রিট সমন্বয়'),
        createdAt: new Date().toISOString(),
      });

      // Audit log entry
      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: isCredit ? 'user_balance_credited' : 'user_balance_debited',
        details: { targetUserId: user.id, targetEmail: user.email, amount: numAmount, type, reason },
        createdAt: new Date().toISOString(),
      });

      return user;
    });

    res.json({
      message: `${updatedUser.fullName}-এর অ্যাকাউন্টে ৳${numAmount.toFixed(2)} ${isCredit ? 'যোগ করা' : 'কাটা'} হয়েছে!`,
      user: updatedUser,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'ব্যালেন্স সমন্বয় সম্পন্ন করা যায়নি।' });
  }
});

apiRouter.delete('/admin/users/:id', requirePermission('canManageUsers'), (req: AuthenticatedRequest, res: Response) => {
  const userId = req.params.id;

  try {
    const deletedUser = mutateLedger((db) => {
      const targetUser = db.profiles.find((p) => p.id === userId);
      if (!targetUser) throw new Error('ব্যবহারকারী পাওয়া যায়নি।');

      if (targetUser.email.toLowerCase() === 'fahim236455@gmail.com') {
        throw new Error('প্রতিষ্ঠাতা সুপার অ্যাডমিন একাউন্ট মোছা সম্ভব নয়।');
      }

      // Remove profile
      db.profiles = db.profiles.filter((p) => p.id !== userId);
      // Remove roles & auth credentials
      db.user_roles = db.user_roles.filter((r) => r.userId !== userId);
      db.auth_credentials = db.auth_credentials.filter((c) => c.userId !== userId);
      // Clean associated referrals, submissions, withdrawals, transactions
      db.referrals = db.referrals.filter((r) => r.referrerId !== userId && r.referredUserId !== userId);
      db.task_submissions = db.task_submissions.filter((s) => s.userId !== userId);
      db.withdrawal_requests = db.withdrawal_requests.filter((w) => w.userId !== userId);
      db.transactions = db.transactions.filter((t) => t.userId !== userId);

      // Audit log entry
      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: 'user_deleted',
        details: { targetUserId: userId, targetEmail: targetUser.email, targetName: targetUser.fullName },
        createdAt: new Date().toISOString(),
      });

      return targetUser;
    });

    res.json({
      message: `ব্যবহারকারী "${deletedUser.fullName}" সফলভাবে মুছে ফেলা হয়েছে।`,
      deletedUserId: userId,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'ইউজার মোছা সম্ভব হয়নি।' });
  }
});

// Admin Tasks Management
apiRouter.get('/admin/tasks', requirePermission('canManageTasks'), (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  
  // Enrich tasks with submission statistics
  const enrichedTasks = db.tasks.map((task) => {
    const subs = db.task_submissions.filter((s) => s.taskId === task.id);
    const pendingSubs = subs.filter((s) => s.status === 'pending').length;
    const approvedSubs = subs.filter((s) => s.status === 'approved').length;
    const rejectedSubs = subs.filter((s) => s.status === 'rejected').length;
    const totalPaidReward = approvedSubs * (task.rewardAmount || 0);

    return {
      ...task,
      totalSubmissions: subs.length,
      pendingSubmissions: pendingSubs,
      approvedSubmissions: approvedSubs,
      rejectedSubmissions: rejectedSubs,
      totalPaidReward,
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(enrichedTasks);
});

apiRouter.post('/admin/tasks', requirePermission('canManageTasks'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, category, rewardAmount, taskType, proofType, proofInstruction, targetUrl, dailyLimit } = req.body;

    if (!title || !description || rewardAmount === undefined || rewardAmount === null) {
      res.status(400).json({ error: 'শিরোনাম, বর্ণনা ও রিওয়ার্ড পরিমাণ প্রদান আবশ্যক।' });
      return;
    }

    const parsedReward = Number(rewardAmount);
    if (isNaN(parsedReward) || parsedReward <= 0) {
      res.status(400).json({ error: 'রিওয়ার্ড পরিমাণ ০-এর বেশি হতে হবে।' });
      return;
    }

    const newTask = mutateLedger((db) => {
      const now = new Date().toISOString();
      const task = {
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        category: category || 'general',
        rewardAmount: parsedReward,
        taskType: taskType || 'manual',
        proofType: proofType || 'screenshot_and_username',
        proofInstruction: proofInstruction ? proofInstruction.trim() : '',
        targetUrl: targetUrl ? targetUrl.trim() : '',
        dailyLimit: Number(dailyLimit) > 0 ? Number(dailyLimit) : 1,
        status: 'active' as const,
        createdAt: now,
        updatedAt: now,
      };

      db.tasks.push(task);

      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: 'task_created',
        details: { taskId: task.id, title: task.title, rewardAmount: task.rewardAmount, category: task.category },
        createdAt: now,
      });

      return task;
    });

    res.status(201).json(newTask);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/admin/tasks/:id', requirePermission('canManageTasks'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = req.params.id;
    const { title, description, category, rewardAmount, status, taskType, proofType, proofInstruction, targetUrl, dailyLimit } = req.body;

    const updated = mutateLedger((db) => {
      const task = db.tasks.find((t) => t.id === taskId);
      if (!task) throw new Error('টাস্ক পাওয়া যায়নি।');

      if (title !== undefined) task.title = title.trim();
      if (description !== undefined) task.description = description.trim();
      if (category !== undefined) task.category = category;
      if (rewardAmount !== undefined) {
        const parsedReward = Number(rewardAmount);
        if (isNaN(parsedReward) || parsedReward <= 0) throw new Error('রিওয়ার্ড পরিমাণ ০-এর বেশি হতে হবে।');
        task.rewardAmount = parsedReward;
      }
      if (status !== undefined) task.status = status;
      if (taskType !== undefined) task.taskType = taskType;
      if (proofType !== undefined) task.proofType = proofType;
      if (proofInstruction !== undefined) task.proofInstruction = proofInstruction;
      if (targetUrl !== undefined) task.targetUrl = targetUrl;
      if (dailyLimit !== undefined) task.dailyLimit = Number(dailyLimit) > 0 ? Number(dailyLimit) : 1;
      task.updatedAt = new Date().toISOString();

      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: 'task_updated',
        details: { taskId: task.id, title: task.title, rewardAmount: task.rewardAmount, status: task.status },
        createdAt: new Date().toISOString(),
      });

      return task;
    });

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Duplicate Task
apiRouter.post('/admin/tasks/:id/duplicate', requirePermission('canManageTasks'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = req.params.id;
    const duplicated = mutateLedger((db) => {
      const original = db.tasks.find((t) => t.id === taskId);
      if (!original) throw new Error('মূল টাস্কটি খুঁজে পাওয়া যায়নি।');

      const now = new Date().toISOString();
      const clone = {
        ...original,
        id: generateId(),
        title: `${original.title} (কপি)`,
        status: 'active' as const,
        createdAt: now,
        updatedAt: now,
      };

      db.tasks.push(clone);

      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: 'task_duplicated',
        details: { originalId: original.id, newTaskId: clone.id, title: clone.title },
        createdAt: now,
      });

      return clone;
    });

    res.status(201).json(duplicated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/admin/tasks/:id', requirePermission('canManageTasks'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const taskId = req.params.id;
    const permanent = req.query.permanent === 'true';

    mutateLedger((db) => {
      const index = db.tasks.findIndex((t) => t.id === taskId);
      if (index === -1) throw new Error('টাস্ক পাওয়া যায়নি।');

      if (permanent) {
        db.tasks.splice(index, 1);
      } else {
        db.tasks[index].status = 'archived';
        db.tasks[index].updatedAt = new Date().toISOString();
      }

      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: permanent ? 'task_deleted_permanent' : 'task_archived',
        details: { taskId },
        createdAt: new Date().toISOString(),
      });
    });

    res.json({ message: permanent ? 'টাস্ক স্থায়ীভাবে মুছে ফেলা হয়েছে।' : 'টাস্ক আর্কাইভ করা হয়েছে।' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Clear All Tasks
apiRouter.post('/admin/tasks/clear-all', requirePermission('canManageTasks'), (req: AuthenticatedRequest, res: Response) => {
  try {
    mutateLedger((db) => {
      const removedCount = db.tasks.length;
      db.tasks = [];
      db.task_submissions = [];
      db.social_tasks_queue = [];
      db.user_posted_jobs = [];

      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: 'all_tasks_cleared',
        details: { count: removedCount },
        createdAt: new Date().toISOString(),
      });
    });

    res.json({ message: 'সব ডেমো ও বিদ্যমান কাজ সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Task Submissions Review
apiRouter.get('/admin/submissions', requirePermission('canReviewTaskProofs'), (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const enriched = db.task_submissions.map((sub) => {
    const task = db.tasks.find((t) => t.id === sub.taskId);
    const user = db.profiles.find((p) => p.id === sub.userId);
    return {
      ...sub,
      taskTitle: task?.title || 'টাস্ক',
      taskDescription: task?.description || '',
      taskTargetUrl: task?.targetUrl || '',
      taskProofInstruction: task?.proofInstruction || '',
      userFullName: user?.fullName || 'সদস্য',
      userEmail: user?.email || '',
      userPhone: user?.phoneNumber || '',
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(enriched);
});

apiRouter.post('/admin/submissions/:id/review', requirePermission('canReviewTaskProofs'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const subId = req.params.id;
    const rawDecision = req.body.decision || req.body.action;
    const decision = rawDecision === 'approve' ? 'approved' : rawDecision === 'reject' ? 'rejected' : rawDecision;
    const rejectionReason = req.body.rejectionReason || req.body.adminNote;

    if (decision !== 'approved' && decision !== 'rejected') {
      res.status(400).json({ error: 'সিদ্ধান্ত অবশ্যই approved বা rejected হতে হবে।' });
      return;
    }

    const updated = mutateLedger((db) => {
      const sub = db.task_submissions.find((s) => s.id === subId);
      if (!sub) throw new Error('সাবমিশন খুঁজে পাওয়া যায়নি।');
      if (sub.status !== 'pending') throw new Error('এই সাবমিশনটি ইতিমধ্যে পর্যালোচনা করা হয়েছে।');

      const user = db.profiles.find((p) => p.id === sub.userId);
      if (!user) throw new Error('ব্যবহারকারী পাওয়া যায়নি।');

      const task = db.tasks.find((t) => t.id === sub.taskId);
      const now = new Date().toISOString();

      sub.reviewedBy = req.user!.userId;
      sub.reviewedAt = now;

      if (decision === 'approved') {
        sub.status = 'approved';
        // Credit reward
        user.balance = Number((user.balance + sub.rewardAmount).toFixed(2));
        user.totalEarned = Number((user.totalEarned + sub.rewardAmount).toFixed(2));
        user.updatedAt = now;

        // Transaction record
        db.transactions.push({
          id: generateId(),
          userId: user.id,
          type: 'task_reward',
          amount: sub.rewardAmount,
          balanceAfter: user.balance,
          description: `টাস্ক সম্পন্ন: ${task?.title || 'অনলাইন টাস্ক'}`,
          referenceId: sub.id,
          createdAt: now,
        });

        // Trigger referral reward if first approved task
        handleFirstTaskReferralReward(db, user, now);
      } else {
        sub.status = 'rejected';
        sub.rejectionReason = rejectionReason || 'প্রদত্ত তথ্য বা প্রুফ সঠিক নয়।';
      }

      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: `task_submission_${decision}`,
        details: { submissionId: sub.id, userId: user.id, reward: sub.rewardAmount },
        createdAt: now,
      });

      return sub;
    });

    res.json({ message: `সাবমিশন ${decision === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'} হয়েছে।`, submission: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Withdrawal Requests
apiRouter.get('/admin/withdrawals', requirePermission('canManageWithdrawals'), (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const enriched = db.withdrawal_requests.map((w) => {
    const user = db.profiles.find((p) => p.id === w.userId);
    return {
      ...w,
      userFullName: user?.fullName || 'সদস্য',
      userEmail: user?.email || '',
      userPhone: user?.phoneNumber || '',
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(enriched);
});

apiRouter.post('/admin/withdrawals/:id/review', requirePermission('canManageWithdrawals'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const withdrawalId = req.params.id;
    const { action, adminNote } = req.body;
    const normalizedAction = action === 'paid' ? 'mark_paid' : action;

    if (!['approve', 'reject', 'mark_paid'].includes(normalizedAction)) {
      res.status(400).json({ error: 'অবৈধ অ্যাকশন।' });
      return;
    }

    const updated = mutateLedger((db) => {
      const withdrawal = db.withdrawal_requests.find((w) => w.id === withdrawalId);
      if (!withdrawal) throw new Error('উইথড্র রিকোয়েস্ট পাওয়া যায়নি।');

      const user = db.profiles.find((p) => p.id === withdrawal.userId);
      if (!user) throw new Error('ব্যবহারকারী পাওয়া যায়নি।');

      const now = new Date().toISOString();
      withdrawal.reviewedBy = req.user!.userId;
      withdrawal.processedAt = now;
      if (adminNote) withdrawal.adminNote = adminNote;

      if (normalizedAction === 'approve') {
        withdrawal.status = 'approved';
      } else if (normalizedAction === 'reject') {
        // Return/Refund the held amount correctly!
        user.balance = Number((user.balance + withdrawal.amount).toFixed(2));
        user.updatedAt = now;

        withdrawal.status = 'rejected';

        db.transactions.push({
          id: generateId(),
          userId: user.id,
          type: 'withdrawal_refund',
          amount: withdrawal.amount,
          balanceAfter: user.balance,
          description: `উইথড্র বাতিল ও রিফান্ড (${withdrawal.method}) - ${adminNote || 'তথ্য অসম্পূর্ণ'}`,
          referenceId: withdrawal.id,
          createdAt: now,
        });
      } else if (normalizedAction === 'mark_paid') {
        withdrawal.status = 'paid';
        user.totalWithdrawn = Number((user.totalWithdrawn + withdrawal.netAmount).toFixed(2));
        user.updatedAt = now;

        db.transactions.push({
          id: generateId(),
          userId: user.id,
          type: 'withdrawal_paid',
          amount: 0,
          balanceAfter: user.balance,
          description: `পেমেন্ট সম্পন্ন: ৳${withdrawal.netAmount} (${withdrawal.method}: ${withdrawal.accountNumber})`,
          referenceId: withdrawal.id,
          createdAt: now,
        });
      }

      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: `withdrawal_${action}`,
        details: { withdrawalId: withdrawal.id, userId: user.id, amount: withdrawal.amount, action },
        createdAt: now,
      });

      return withdrawal;
    });

    res.json({ message: 'উইথড্র রিকোয়েস্ট সফলভাবে হালনাগাদ হয়েছে।', withdrawal: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Referrals List
apiRouter.get('/admin/referrals', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const list = db.referrals.map((r) => {
    const referrer = db.profiles.find((p) => p.id === r.referrerId);
    const referred = db.profiles.find((p) => p.id === r.referredUserId);
    return {
      ...r,
      referrerName: referrer?.fullName || 'অজানা',
      referrerEmail: referrer?.email || '',
      referrerPhone: referrer?.phoneNumber || '',
      referredName: referred?.fullName || 'অজানা',
      referredEmail: referred?.email || '',
      referredPhone: referred?.phoneNumber || '',
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(list);
});

// Admin All Transactions Ledger
apiRouter.get('/admin/transactions', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const list = db.transactions.map((t) => {
    const user = db.profiles.find((p) => p.id === t.userId);
    return {
      ...t,
      userFullName: user?.fullName || 'সদস্য',
      userEmail: user?.email || '',
      userPhone: user?.phoneNumber || '',
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(list);
});

// Admin Support Tickets
apiRouter.get('/admin/tickets', requirePermission('canManageSupport'), (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const tickets = db.support_tickets.map((t) => {
    const user = db.profiles.find((p) => p.id === t.userId);
    return {
      ...t,
      userFullName: user?.fullName || t.userName || 'গ্রাহক / ভিজিটর',
      userEmail: user?.email || t.userEmail || '',
      userPhone: user?.phoneNumber || t.userPhone || '',
      userBalance: user?.balance ?? 0,
    };
  }).sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

  res.json(tickets);
});

apiRouter.post('/admin/tickets/:id/reply', requirePermission('canManageSupport'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticketId = req.params.id;
    const { reply, status, attachmentUrl } = req.body;

    if ((!reply || typeof reply !== 'string' || reply.trim().length === 0) && !attachmentUrl) {
      res.status(400).json({ error: 'রিপ্লাই টেক্সট দিন।' });
      return;
    }

    const updated = mutateLedger((db) => {
      const ticket = db.support_tickets.find((t) => t.id === ticketId);
      if (!ticket) throw new Error('টিকিট পাওয়া যায়নি।');

      const now = new Date().toISOString();
      const replyText = (reply || 'ফাইল সংযুক্ত করা হয়েছে').trim();
      ticket.adminReply = replyText;
      ticket.repliedAt = now;
      ticket.status = status || 'answered';
      ticket.updatedAt = now;

      if (!ticket.messages) {
        ticket.messages = [
          {
            id: generateId(),
            sender: 'user' as const,
            text: ticket.message,
            timestamp: ticket.createdAt,
          },
        ];
      }
      ticket.messages.push({
        id: generateId(),
        sender: 'agent' as const,
        text: replyText,
        attachmentUrl: attachmentUrl || undefined,
        timestamp: now,
      });

      return ticket;
    });

    res.json({ message: 'সাপোর্ট রিপ্লাই পাঠানো হয়েছে।', ticket: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/admin/tickets/:id/status', requirePermission('canManageSupport'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticketId = req.params.id;
    const { status } = req.body;
    const updated = mutateLedger((db) => {
      const ticket = db.support_tickets.find((t) => t.id === ticketId);
      if (!ticket) throw new Error('টিকিট পাওয়া যায়নি।');
      ticket.status = status;
      ticket.updatedAt = new Date().toISOString();
      return ticket;
    });
    res.json({ message: 'টিকিট স্ট্যাটাস হালনাগাদ করা হয়েছে।', ticket: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Aliases for support tickets
apiRouter.get('/admin/support/tickets', requirePermission('canManageSupport'), (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const tickets = db.support_tickets.map((t) => {
    const user = db.profiles.find((p) => p.id === t.userId);
    return {
      ...t,
      userFullName: user?.fullName || t.userName || 'গ্রাহক / ভিজিটর',
      userEmail: user?.email || t.userEmail || '',
      userPhone: user?.phoneNumber || t.userPhone || '',
      userBalance: user?.balance ?? 0,
    };
  }).sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

  res.json(tickets);
});

apiRouter.post('/admin/support/tickets/:id/reply', requirePermission('canManageSupport'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticketId = req.params.id;
    const { reply, status, attachmentUrl } = req.body;

    if ((!reply || typeof reply !== 'string' || reply.trim().length === 0) && !attachmentUrl) {
      res.status(400).json({ error: 'রিপ্লাই টেক্সট দিন।' });
      return;
    }

    const updated = mutateLedger((db) => {
      const ticket = db.support_tickets.find((t) => t.id === ticketId);
      if (!ticket) throw new Error('টিকিট পাওয়া যায়নি।');

      const now = new Date().toISOString();
      const replyText = (reply || 'ফাইল সংযুক্ত করা হয়েছে').trim();
      ticket.adminReply = replyText;
      ticket.repliedAt = now;
      ticket.status = status || 'answered';
      ticket.updatedAt = now;

      if (!ticket.messages) {
        ticket.messages = [
          {
            id: generateId(),
            sender: 'user' as const,
            text: ticket.message,
            timestamp: ticket.createdAt,
          },
        ];
      }
      ticket.messages.push({
        id: generateId(),
        sender: 'agent' as const,
        text: replyText,
        attachmentUrl: attachmentUrl || undefined,
        timestamp: now,
      });

      return ticket;
    });

    res.json({ message: 'সাপোর্ট রিপ্লাই পাঠানো হয়েছে।', ticket: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Settings
apiRouter.get('/admin/settings', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  res.json(db.site_settings);
});

apiRouter.put('/admin/settings', requirePermission('canEditSiteSettings'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      brandName,
      referralReward,
      minWithdrawal,
      maxWithdrawal,
      withdrawalFeePercent,
      withdrawalMethods,
      bkashNumber,
      nagadNumber,
      rocketNumber,
      supportPhone,
      supportWhatsapp,
      supportTelegram,
      supportEmail,
      announcement,
      signupBonus,
      dailyCheckinReward,
      popupNotice,
      maintenanceMode,
      heroTitle,
      heroSubtitle,
      heroVideoUrl,
      telegramChannelUrl,
      telegramGroupUrl,
      faqs,
    } = req.body;

    const updated = mutateLedger((db) => {
      const s = db.site_settings;
      if (brandName !== undefined && typeof brandName === 'string' && brandName.trim().length > 0) {
        s.brandName = brandName.trim();
      }
      if (referralReward !== undefined) s.referralReward = Math.max(0, Number(referralReward));
      if (minWithdrawal !== undefined) s.minWithdrawal = Math.max(0, Number(minWithdrawal));
      if (maxWithdrawal !== undefined) s.maxWithdrawal = Math.max(0, Number(maxWithdrawal));
      if (withdrawalFeePercent !== undefined) s.withdrawalFeePercent = Math.max(0, Number(withdrawalFeePercent));
      if (Array.isArray(withdrawalMethods)) s.withdrawalMethods = withdrawalMethods;
      if (bkashNumber !== undefined) s.bkashNumber = String(bkashNumber).trim();
      if (nagadNumber !== undefined) s.nagadNumber = String(nagadNumber).trim();
      if (rocketNumber !== undefined) s.rocketNumber = String(rocketNumber).trim();
      if (supportPhone !== undefined) s.supportPhone = String(supportPhone).trim();
      if (supportWhatsapp !== undefined) s.supportWhatsapp = String(supportWhatsapp).trim();
      if (supportTelegram !== undefined) s.supportTelegram = String(supportTelegram).trim();
      if (supportEmail !== undefined) s.supportEmail = String(supportEmail).trim();
      if (announcement !== undefined) s.announcement = String(announcement).trim();
      if (signupBonus !== undefined) s.signupBonus = Math.max(0, Number(signupBonus));
      if (dailyCheckinReward !== undefined) s.dailyCheckinReward = Math.max(0, Number(dailyCheckinReward));
      if (popupNotice !== undefined && typeof popupNotice === 'object') {
        s.popupNotice = {
          enabled: Boolean(popupNotice.enabled),
          title: String(popupNotice.title || '').trim(),
          message: String(popupNotice.message || '').trim(),
          channelButtonText: String(popupNotice.channelButtonText || '').trim(),
          channelUrl: String(popupNotice.channelUrl || '').trim(),
          groupButtonText: String(popupNotice.groupButtonText || '').trim(),
          groupUrl: String(popupNotice.groupUrl || '').trim(),
          facebookUrl: String(popupNotice.facebookUrl || '').trim(),
          youtubeUrl: String(popupNotice.youtubeUrl || '').trim(),
          instagramUrl: String(popupNotice.instagramUrl || '').trim(),
          showEveryVisit: popupNotice.showEveryVisit !== undefined ? Boolean(popupNotice.showEveryVisit) : true,
        };
      }
      if (maintenanceMode !== undefined && typeof maintenanceMode === 'object') {
        s.maintenanceMode = {
          enabled: Boolean(maintenanceMode.enabled),
          message: String(maintenanceMode.message || '').trim(),
        };
      }
      if (heroTitle !== undefined) s.heroTitle = String(heroTitle).trim();
      if (heroSubtitle !== undefined) s.heroSubtitle = String(heroSubtitle).trim();
      if (heroVideoUrl !== undefined) s.heroVideoUrl = String(heroVideoUrl).trim();
      if (telegramChannelUrl !== undefined) s.telegramChannelUrl = String(telegramChannelUrl).trim();
      if (telegramGroupUrl !== undefined) s.telegramGroupUrl = String(telegramGroupUrl).trim();
      if (Array.isArray(faqs)) {
        s.faqs = faqs.map((f: any) => ({
          id: f.id || generateId(),
          question: String(f.question || '').trim(),
          answer: String(f.answer || '').trim(),
        })).filter(f => f.question && f.answer);
      }
      s.updatedAt = new Date().toISOString();

      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: 'settings_updated',
        details: {
          brandName: s.brandName,
          supportWhatsapp: s.supportWhatsapp,
          supportTelegram: s.supportTelegram,
          supportPhone: s.supportPhone,
        },
        createdAt: new Date().toISOString(),
      });

      return s;
    });

    res.json({ message: 'সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে।', settings: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin change own password
apiRouter.post('/admin/change-password', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      res.status(400).json({ error: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      res.status(400).json({ error: 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।' });
      return;
    }

    mutateLedger((db) => {
      const user = db.profiles.find((p) => p.id === req.user!.userId);
      if (!user) throw new Error('ইউজার পাওয়া যায়নি।');

      const cred = db.auth_credentials.find((c) => c.userId === req.user!.userId);
      if (!cred) throw new Error('অথেনটিকেশন রেকর্ড পাওয়া যায়নি।');

      // Verify current password if provided
      if (currentPassword) {
        const isMatch = bcrypt.compareSync(currentPassword, cred.passwordHash);
        if (!isMatch) {
          throw new Error('বর্তমান পাসওয়ার্ড ভুল হয়েছে।');
        }
      }

      cred.passwordHash = bcrypt.hashSync(newPassword, 10);
      cred.updatedAt = new Date().toISOString();

      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: 'admin_password_changed',
        details: { userId: user.id },
        createdAt: new Date().toISOString(),
      });
    });

    res.json({ message: 'অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin Cloud Sync Management (Firebase Firestore)
apiRouter.get('/admin/cloud-sync', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const status = getCloudSyncStatus();
  res.json({
    provider: 'Firebase Cloud Firestore',
    status: 'connected',
    ...status,
  });
});

apiRouter.post('/admin/cloud-sync/push', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await forcePushToCloud();
    if (success) {
      res.json({ success: true, message: 'বর্তমান ডেটাবেস সফলভাবে ক্লাউড ফায়ারস্টোরে আপলোড হয়েছে।' });
    } else {
      res.status(500).json({ success: false, error: 'ক্লাউডে আপলোড করতে সমস্যা হয়েছে।' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/admin/cloud-sync/pull', requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await forcePullFromCloud();
    if (success) {
      res.json({ success: true, message: 'ক্লাউড ফায়ারস্টোর থেকে সফলভাবে সর্বশেষ ডেটা রিস্টোর করা হয়েছে।' });
    } else {
      res.status(500).json({ success: false, error: 'ক্লাউড থেকে ডেটা পাওয়া যায়নি বা সমস্যা হয়েছে।' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Audit Logs
apiRouter.get('/admin/audit-logs', requirePermission('canViewAuditLogs'), (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const logs = [...db.audit_logs].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(logs);
});

// ==========================================
// 12. SOCIAL ACCOUNT SELL (GMAIL, FB, INSTAGRAM)
// ==========================================

const DEFAULT_SOCIAL_CONFIG = {
  gmail: {
    service: 'gmail' as const,
    title: 'Gmail Sell',
    rate: 14.0,
    dailyLimit: 1000,
    reportTime: '15-30 hours',
    usernameTemplate: 'earnora',
    todayPassword: 'sgwteam1@21A',
    active: true,
    tutorialUrl: '',
    notes: 'নতুন জিমেইল তৈরি করুন। নির্দেশিত পাসওয়ার্ড দিয়ে রিকভারি ইমেইল ছাড়া সাবমিট করুন।',
  },
  facebook: {
    service: 'facebook' as const,
    title: 'Facebook Sell',
    rate: 4.5,
    dailyLimit: 1000,
    reportTime: '15/40 hours',
    usernameTemplate: 'earnora_fb',
    todayPassword: 'earnora@12',
    active: true,
    tutorialUrl: '',
    notes: 'ফেসবুক ইউআইডি ও পাসওয়ার্ড দিন। কুকিজ দিলে দ্রুত অনুমোদন।',
  },
  instagram: {
    service: 'instagram' as const,
    title: 'Instagram Sell',
    rate: 2.5,
    dailyLimit: 1000,
    reportTime: '10/20 hours',
    usernameTemplate: 'earnora_ig',
    todayPassword: 'earnora@12',
    active: true,
    tutorialUrl: '',
    notes: 'ইনস্টাগ্রাম ইউজারনেম ও পাসওয়ার্ড দিয়ে সাবমিট করুন।',
  },
};

function getSocialServiceConfig(db: any, service: 'gmail' | 'facebook' | 'instagram') {
  const configs = db.social_jobs_config || [];
  const found = configs.find((c: any) => c.service === service);
  if (found) return found;
  return DEFAULT_SOCIAL_CONFIG[service];
}

function generateDynamicSocialTask(
  db: any,
  service: 'gmail' | 'facebook' | 'instagram',
  userCompletedCount: number,
  userId?: string | null,
  skipTaskIds: string[] = [],
  skipCount: number = 0
) {
  const config = getSocialServiceConfig(db, service);
  const queue = (db.social_tasks_queue || []).filter(
    (t: any) => t.service === service && t.status === 'active'
  );

  const effectiveTaskIndex = userCompletedCount + (Number(skipCount) || 0);
  const taskNumber = Math.min(effectiveTaskIndex + 1, config.dailyLimit || 1000);
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const shortSuffix = Math.floor(1000 + Math.random() * 9000);

  // If there's a custom queued task created by admin
  let matchedTask = null;
  if (queue.length > 0) {
    // If user has specific user sales, pick next queued task
    const userSubmittedTaskIds = userId
      ? (db.social_account_sales || [])
          .filter((s: any) => s.userId === userId && s.service === service && s.taskId)
          .map((s: any) => s.taskId)
      : [];

    // Filter out submitted AND skipped tasks
    const eligibleTasks = queue.filter(
      (q: any) => !userSubmittedTaskIds.includes(q.id) && !skipTaskIds.includes(q.id)
    );

    if (eligibleTasks.length > 0) {
      const idx = (Number(skipCount) || 0) % eligibleTasks.length;
      matchedTask = eligibleTasks[idx];
    } else {
      // If all eligible were skipped, cycle through remaining non-submitted tasks
      const nonSubmitted = queue.filter((q: any) => !userSubmittedTaskIds.includes(q.id));
      if (nonSubmitted.length > 0) {
        const idx = (Number(skipCount) || 0) % nonSubmitted.length;
        matchedTask = nonSubmitted[idx];
      } else {
        matchedTask = queue[(Number(skipCount) || 0) % queue.length];
      }
    }
  }

  let title = '';
  let instruction = '';
  let suggestedUsername = '';
  let requiredPassword = config.todayPassword || 'earnora@12';
  let recoveryEmail = 'কোন রিকভারি ইমেইল যোগ করবেন না';
  let rate = Number(config.rate) || 10;
  let taskId = matchedTask ? matchedTask.id : `task_dyn_${service}_${taskNumber}_${shortSuffix}_${randomSuffix.toString().slice(-3)}`;

  if (matchedTask) {
    title = matchedTask.title;
    instruction = matchedTask.instruction || config.notes || '';
    suggestedUsername = matchedTask.suggestedUsername || `${config.usernameTemplate || 'earnora'}_${shortSuffix}`;
    requiredPassword = matchedTask.requiredPassword || config.todayPassword || 'earnora@12';
    recoveryEmail = matchedTask.recoveryEmail || 'কোন রিকভারি ইমেইল যোগ করবেন না';
    rate = Number(matchedTask.rate) || Number(config.rate) || 10;
  } else {
    if (service === 'gmail') {
      const prefix = config.usernameTemplate || 'earnora';
      title = `টাস্ক #${taskNumber}: নতুন ফ্রেশ জিমেইল তৈরি করুন`;
      instruction = `নির্দেশিত ইউজারনেম ফরম্যাট ব্যবহার করে গুগল অ্যাকাউন্ট খুলুন। পাসওয়ার্ড দিন "${requiredPassword}"। কোনো রিকভারি ফোন বা ইমেইল যুক্ত করবেন না।`;
      suggestedUsername = `${prefix}${randomSuffix}@gmail.com`;
      recoveryEmail = 'কোন রিকভারি দরকার নেই (No Recovery)';
    } else if (service === 'facebook') {
      const prefix = config.usernameTemplate || 'fb';
      title = `টাস্ক #${taskNumber}: ফেসবুক একাউন্ট জমা দিন`;
      instruction = `কমপক্ষে ২০+ ফ্রেন্ডস এবং প্রোফাইল পিকচার সহ ফেসবুক আইডি সাবমিট করুন। পাসওয়ার্ড "${requiredPassword}" সেট করুন।`;
      suggestedUsername = `${prefix}_user_${shortSuffix}_${randomSuffix.toString().slice(-2)}`;
      recoveryEmail = 'N/A';
    } else {
      const prefix = config.usernameTemplate || 'ig';
      title = `টাস্ক #${taskNumber}: ইনস্টাগ্রাম একাউন্ট জমা দিন`;
      instruction = `কমপক্ষে ১০০+ ফলোয়ার সহ ইনস্টাগ্রাম একাউন্ট সাবমিট করুন। পাসওয়ার্ড "${requiredPassword}" দিন এবং 2FA কী থাকলে তা প্রদান করুন।`;
      suggestedUsername = `${prefix}_acc_${shortSuffix}_${randomSuffix.toString().slice(-2)}`;
      recoveryEmail = 'N/A';
    }
  }

  return {
    taskId,
    taskNumber,
    service,
    title,
    instruction,
    suggestedUsername,
    todayPassword: requiredPassword,
    recoveryEmail,
    rate,
    todaySubmissions: userCompletedCount,
    dailyLimit: Number(config.dailyLimit) || 1000,
    remainingToday: Math.max(0, (Number(config.dailyLimit) || 1000) - userCompletedCount),
    active: config.active !== false,
    reportTime: config.reportTime || '15-30 hours',
    tutorialUrl: config.tutorialUrl,
  };
}

// Get active task & user status for a service
apiRouter.get('/social-sell/active-task', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user?.userId || null;

  const service = ((req.query.service as string) || 'gmail').toLowerCase() as 'gmail' | 'facebook' | 'instagram';
  if (!['gmail', 'facebook', 'instagram'].includes(service)) {
    res.status(400).json({ error: 'অবৈধ সার্ভিস নাম।' });
    return;
  }

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const userSales = userId
    ? (db.social_account_sales || []).filter((s) => s.userId === userId && s.service === service && s.createdAt >= twentyFourHoursAgo)
    : [];

  const skipCurrentId = (req.query.skipTaskId as string) || '';
  const skipCount = Number(req.query.skipCount) || 0;
  const skipTaskIds = skipCurrentId ? [skipCurrentId] : [];

  const task = generateDynamicSocialTask(db, service, userSales.length, userId, skipTaskIds, skipCount);
  res.json(task);
});

// Skip or generate next task
apiRouter.all('/social-sell/next-task', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user?.userId || null;

  const service = ((req.query.service || req.body?.service || 'gmail') as string).toLowerCase() as 'gmail' | 'facebook' | 'instagram';
  const skipCurrentId = (req.query.skipTaskId || req.body?.skipTaskId || '') as string;
  const rawSkipIds = (req.query.skipTaskIds || req.body?.skipTaskIds || '') as string;
  let skipTaskIds: string[] = [];
  if (skipCurrentId) skipTaskIds.push(skipCurrentId);
  if (rawSkipIds) {
    const list = Array.isArray(rawSkipIds) ? rawSkipIds : rawSkipIds.split(',');
    skipTaskIds.push(...list.map((s: string) => s.trim()).filter(Boolean));
  }

  const skipCount = Number(req.query.skipCount || req.body?.skipCount || 0) + 1;

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const userSales = userId
    ? (db.social_account_sales || []).filter((s) => s.userId === userId && s.service === service && s.createdAt >= twentyFourHoursAgo)
    : [];

  const task = generateDynamicSocialTask(db, service, userSales.length, userId, skipTaskIds, skipCount);
  res.json({
    message: `কাজ #${task.taskNumber} সফলভাবে লোড হয়েছে।`,
    ...task,
  });
});

// Dedicated skip endpoint
apiRouter.post('/social-sell/skip', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user?.userId || null;

  const { service = 'gmail', skipTaskId, skipTaskIds = [], skipCount = 0 } = req.body;
  const svc = (service as string).toLowerCase() as 'gmail' | 'facebook' | 'instagram';

  const combinedSkipIds: string[] = Array.isArray(skipTaskIds) ? [...skipTaskIds] : [];
  if (skipTaskId && !combinedSkipIds.includes(skipTaskId)) {
    combinedSkipIds.push(skipTaskId);
  }

  const nextSkipCount = Number(skipCount) + 1;
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const userSales = userId
    ? (db.social_account_sales || []).filter((s) => s.userId === userId && s.service === svc && s.createdAt >= twentyFourHoursAgo)
    : [];

  const task = generateDynamicSocialTask(db, svc, userSales.length, userId, combinedSkipIds, nextSkipCount);
  res.json({
    message: 'কাজটি স্কিপ করা হয়েছে এবং পরবর্তী নতুন কাজ লোড হয়েছে।',
    nextSkipCount,
    ...task,
  });
});

// Get config & user 24h submission count (Public & User)
apiRouter.get('/social-sell/info', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user?.userId || null;

  const service = (req.query.service as string)?.toLowerCase();
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const userSales = userId
    ? (db.social_account_sales || []).filter((s) => s.userId === userId && s.createdAt >= twentyFourHoursAgo)
    : [];

  const gmailCfg = getSocialServiceConfig(db, 'gmail');
  const fbCfg = getSocialServiceConfig(db, 'facebook');
  const instaCfg = getSocialServiceConfig(db, 'instagram');

  const stats = {
    gmail: {
      ...gmailCfg,
      submissions24h: userSales.filter((s) => s.service === 'gmail').length,
    },
    facebook: {
      ...fbCfg,
      submissions24h: userSales.filter((s) => s.service === 'facebook').length,
    },
    instagram: {
      ...instaCfg,
      submissions24h: userSales.filter((s) => s.service === 'instagram').length,
    },
  };

  if (service && stats[service as keyof typeof stats]) {
    res.json(stats[service as keyof typeof stats]);
  } else {
    res.json(stats);
  }
});

// Admin: Get all social jobs configurations
apiRouter.get('/admin/social-jobs', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const configs = db.social_jobs_config || [];
  const services: ('gmail' | 'facebook' | 'instagram')[] = ['gmail', 'facebook', 'instagram'];
  const fullConfigs = services.map((s) => {
    const existing = configs.find((c) => c.service === s);
    return existing || DEFAULT_SOCIAL_CONFIG[s];
  });
  res.json(fullConfigs);
});

// Admin: Get all queued social tasks
apiRouter.get('/admin/social-tasks', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const tasks = db.social_tasks_queue || [];
  res.json(tasks);
});

// Admin: Create individual or batch social tasks in queue
apiRouter.post('/admin/social-tasks/create', requirePermission('canManageSocialJobs'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      service,
      title,
      instruction,
      suggestedUsername,
      requiredPassword,
      recoveryEmail,
      rate,
      quantity = 1,
    } = req.body;

    if (!['gmail', 'facebook', 'instagram'].includes(service)) {
      res.status(400).json({ error: 'অবৈধ সার্ভিস নাম।' });
      return;
    }

    const createdList = mutateLedger((db) => {
      if (!db.social_tasks_queue) db.social_tasks_queue = [];
      const config = getSocialServiceConfig(db, service);
      const list: any[] = [];
      const count = Math.max(1, Math.min(Number(quantity) || 1, 1000));
      const baseNum = db.social_tasks_queue.filter((t) => t.service === service).length;

      for (let i = 1; i <= count; i++) {
        const itemNum = baseNum + i;
        const rand = Math.floor(100000 + Math.random() * 900000);
        const item = {
          id: generateId(),
          service: service as 'gmail' | 'facebook' | 'instagram',
          taskNumber: itemNum,
          title: title || `${service.toUpperCase()} কাজ #${itemNum}`,
          instruction: instruction || config.notes || '',
          suggestedUsername: suggestedUsername
            ? `${suggestedUsername}${count > 1 ? rand : ''}`
            : `${config.usernameTemplate || 'earnora'}_${rand}`,
          requiredPassword: requiredPassword || config.todayPassword || 'earnora@12',
          recoveryEmail: recoveryEmail || (service === 'gmail' ? 'No Recovery' : 'N/A'),
          rate: Number(rate) || Number(config.rate) || 10,
          status: 'active' as const,
          completedCount: 0,
          dailyLimit: 1000,
          createdAt: new Date().toISOString(),
        };
        db.social_tasks_queue.push(item);
        list.push(item);
      }

      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: 'social_tasks_batch_created',
        details: { service, count, title, rate },
        createdAt: new Date().toISOString(),
      });

      return list;
    });

    res.status(201).json({
      message: `${createdList.length}টি ${service.toUpperCase()} কাজ সফলভাবে কিউ-তে যুক্ত হয়েছে!`,
      data: createdList,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Instant Generate 1000 Tasks Queue
apiRouter.post('/admin/social-tasks/generate-1000', requirePermission('canManageSocialJobs'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { service } = req.body;
    if (!['gmail', 'facebook', 'instagram'].includes(service)) {
      res.status(400).json({ error: 'অবৈধ সার্ভিস নাম।' });
      return;
    }

    const result = mutateLedger((db) => {
      if (!db.social_tasks_queue) db.social_tasks_queue = [];
      const config = getSocialServiceConfig(db, service as 'gmail' | 'facebook' | 'instagram');

      // Clear previous queue for this service and generate fresh 1000 pool
      db.social_tasks_queue = db.social_tasks_queue.filter((t) => t.service !== service);

      const generated: any[] = [];
      for (let i = 1; i <= 1000; i++) {
        const rand = Math.floor(100000 + Math.random() * 900000);
        let suggested = '';
        let title = '';
        let instruction = '';

        if (service === 'gmail') {
          suggested = `earnora_${rand}@gmail.com`;
          title = `জিমেইল টাস্ক #${i}: নতুন জিমেইল তৈরি করুন`;
          instruction = 'নতুন জিমেইল তৈরি করে নির্দেশিত পাসওয়ার্ড দিন। কোনো রিকভারি ইমেইল যোগ করবেন না।';
        } else if (service === 'facebook') {
          suggested = `fb_user_${rand}`;
          title = `ফেসবুক টাস্ক #${i}: ফেসবুক একাউন্ট জমা দিন`;
          instruction = 'সক্রিয় ফেসবুক আইডি সাবমিট করুন। কুকিজ ও পাসওয়ার্ড সেট করে প্রদান করুন।';
        } else {
          suggested = `ig_user_${rand}`;
          title = `ইনস্টাগ্রাম টাস্ক #${i}: ইনস্টাগ্রাম একাউন্ট জমা দিন`;
          instruction = 'কমপক্ষে ১০০+ ফলোয়ার সহ ইনস্টাগ্রাম একাউন্ট ও ২FA কোড সাবমিট করুন।';
        }

        const task = {
          id: generateId(),
          service: service as 'gmail' | 'facebook' | 'instagram',
          taskNumber: i,
          title,
          instruction,
          suggestedUsername: suggested,
          requiredPassword: config.todayPassword || 'earnora@12',
          recoveryEmail: service === 'gmail' ? 'No Recovery' : 'N/A',
          rate: Number(config.rate) || 10,
          status: 'active' as const,
          completedCount: 0,
          dailyLimit: 1000,
          createdAt: new Date().toISOString(),
        };
        db.social_tasks_queue.push(task);
        generated.push(task);
      }

      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: 'social_tasks_1000_generated',
        details: { service, count: 1000 },
        createdAt: new Date().toISOString(),
      });

      return generated.length;
    });

    res.json({
      message: `সফল! ${service.toUpperCase()} সার্ভিসের জন্য ১০০০টি স্বয়ংক্রিয় কাজের কিউ প্রস্তুত করা হয়েছে।`,
      count: result,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Delete a queued social task
apiRouter.delete('/admin/social-tasks/:id', requirePermission('canManageSocialJobs'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    mutateLedger((db) => {
      if (!db.social_tasks_queue) return;
      db.social_tasks_queue = db.social_tasks_queue.filter((t) => t.id !== id);
    });
    res.json({ message: 'টাস্ক সফলভাবে মুছে ফেলা হয়েছে।' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Update / Set social job configuration
apiRouter.post('/admin/social-jobs/update', requirePermission('canManageSocialJobs'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      service,
      title,
      rate,
      dailyLimit,
      reportTime,
      todayPassword,
      usernameTemplate,
      active,
      tutorialUrl,
      notes,
    } = req.body;

    if (!['gmail', 'facebook', 'instagram'].includes(service)) {
      res.status(400).json({ error: 'অবৈধ সার্ভিস নাম (শুধু gmail, facebook, instagram সমর্থিত)।' });
      return;
    }

    const updated = mutateLedger((db) => {
      if (!db.social_jobs_config) db.social_jobs_config = [];
      let item = db.social_jobs_config.find((c) => c.service === service);
      const now = new Date().toISOString();

      if (!item) {
        item = {
          service,
          title: title || DEFAULT_SOCIAL_CONFIG[service as keyof typeof DEFAULT_SOCIAL_CONFIG].title,
          rate: Number(rate) || DEFAULT_SOCIAL_CONFIG[service as keyof typeof DEFAULT_SOCIAL_CONFIG].rate,
          dailyLimit: Number(dailyLimit) || 1000,
          reportTime: reportTime || '15-30 hours',
          todayPassword: todayPassword || '',
          usernameTemplate: usernameTemplate || '',
          active: active !== undefined ? Boolean(active) : true,
          tutorialUrl: tutorialUrl || '',
          notes: notes || '',
          updatedAt: now,
        };
        db.social_jobs_config.push(item);
      } else {
        if (title !== undefined) item.title = title.trim();
        if (rate !== undefined) item.rate = Number(rate);
        if (dailyLimit !== undefined) item.dailyLimit = Number(dailyLimit);
        if (reportTime !== undefined) item.reportTime = reportTime.trim();
        if (todayPassword !== undefined) item.todayPassword = todayPassword.trim();
        if (usernameTemplate !== undefined) item.usernameTemplate = usernameTemplate.trim();
        if (active !== undefined) item.active = Boolean(active);
        if (tutorialUrl !== undefined) item.tutorialUrl = tutorialUrl.trim();
        if (notes !== undefined) item.notes = notes.trim();
        item.updatedAt = now;
      }

      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: 'social_job_config_updated',
        details: { service, rate: item.rate, active: item.active, todayPassword: item.todayPassword },
        createdAt: now,
      });

      return item;
    });

    res.json({ message: 'সোশ্যাল কাজের রেট ও সেটিংস সফলভাবে আপডেট হয়েছে।', data: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Submit social account with auto-advance to next task
apiRouter.post('/social-sell/submit', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { service, accountIdentifier, password, extraField, taskId, taskNumber } = req.body;
    const userId = req.user!.userId;
    const userEmail = req.user!.email;

    if (!['gmail', 'facebook', 'instagram'].includes(service)) {
      res.status(400).json({ error: 'অবৈধ সার্ভিস নির্বাচন।' });
      return;
    }

    if (!accountIdentifier || typeof accountIdentifier !== 'string' || !accountIdentifier.trim()) {
      res.status(400).json({ error: 'অনুগ্রহ করে অ্যাকাউন্ট আইডি / ইউজারনেম / ইমেইল প্রদান করুন।' });
      return;
    }

    if (!password || typeof password !== 'string' || !password.trim()) {
      res.status(400).json({ error: 'অনুগ্রহ করে পাসওয়ার্ড প্রদান করুন।' });
      return;
    }

    const { item, config, completedCount, nextTask } = mutateLedger((db) => {
      const cfg = getSocialServiceConfig(db, service as 'gmail' | 'facebook' | 'instagram');
      if (cfg.active === false) {
        throw new Error('এই সার্ভিসটি বর্তমানে সাময়িকভাবে বন্ধ আছে।');
      }

      if (!db.social_account_sales) db.social_account_sales = [];

      // Check duplicate
      const existing = db.social_account_sales.find(
        (s) => s.service === service && s.accountIdentifier.toLowerCase() === accountIdentifier.trim().toLowerCase()
      );
      if (existing) {
        throw new Error('এই অ্যাকাউন্টটি ইতিমধ্যে সাবমিট করা হয়েছে।');
      }

      const saleItem = {
        id: generateId(),
        userId,
        userEmail,
        service: service as 'gmail' | 'facebook' | 'instagram',
        taskId: taskId || undefined,
        accountIdentifier: accountIdentifier.trim(),
        password: password.trim(),
        extraField: extraField ? extraField.trim() : undefined,
        rate: Number(cfg.rate) || 10.0,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      db.social_account_sales.push(saleItem);

      // If taskId matches queued task, update completedCount
      if (taskId && db.social_tasks_queue) {
        const qTask = db.social_tasks_queue.find((t) => t.id === taskId);
        if (qTask) {
          qTask.completedCount = (qTask.completedCount || 0) + 1;
        }
      }

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const userSales = db.social_account_sales.filter(
        (s) => s.userId === userId && s.service === service && s.createdAt >= twentyFourHoursAgo
      );

      const next = generateDynamicSocialTask(db, service as 'gmail' | 'facebook' | 'instagram', userSales.length, userId);

      return {
        item: saleItem,
        config: cfg,
        completedCount: userSales.length,
        nextTask: next,
      };
    });

    res.status(201).json({
      message: `কাজ #${taskNumber || completedCount} সফলভাবে সাবমিট হয়েছে! পরবর্তী নতুন কাজ লোড করা হয়েছে।`,
      data: item,
      completedToday: completedCount,
      nextTask,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'সাবমিশন ব্যর্থ হয়েছে।' });
  }
});

// Get user submission history
apiRouter.get('/social-sell/history', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const userId = req.user!.userId;
  const service = req.query.service as string | undefined;

  let sales = (db.social_account_sales || []).filter((s) => s.userId === userId);
  if (service) {
    sales = sales.filter((s) => s.service === service.toLowerCase());
  }

  sales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(sales);
});

// Admin: List all social sales
apiRouter.get('/admin/social-sales', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const sales = [...(db.social_account_sales || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(sales);
});

// Admin: Review social sale (Approve/Reject)
apiRouter.post('/admin/social-sales/:id/review', requirePermission('canReviewSocialSubmissions'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      res.status(400).json({ error: 'স্ট্যাটাস অবশ্যই approved অথবা rejected হতে হবে।' });
      return;
    }

    const updated = mutateLedger((db) => {
      if (!db.social_account_sales) db.social_account_sales = [];
      const item = db.social_account_sales.find((s) => s.id === id);
      if (!item) {
        throw new Error('সাবমিশন রেকর্ড পাওয়া যায়নি।');
      }

      if (item.status !== 'pending') {
        throw new Error('এই সাবমিশনটি ইতিমধ্যে নিষ্পত্তি করা হয়েছে।');
      }

      const now = new Date().toISOString();
      item.status = status;
      item.reviewedAt = now;
      item.reviewedBy = req.user!.email;
      if (status === 'rejected') {
        item.rejectionReason = rejectionReason || 'অ্যাকাউন্ট ভেরিফিকেশন ব্যর্থ হয়েছে';
      } else {
        // Credit the seller!
        const seller = db.profiles.find((p) => p.id === item.userId);
        if (seller) {
          seller.balance = Number((seller.balance + item.rate).toFixed(2));
          seller.totalEarned = Number((seller.totalEarned + item.rate).toFixed(2));
          seller.updatedAt = now;

          db.transactions.push({
            id: generateId(),
            userId: seller.id,
            type: 'task_reward',
            amount: item.rate,
            balanceAfter: seller.balance,
            description: `${item.service.toUpperCase()} অ্যাকাউন্ট সেল পেমেন্ট (${item.accountIdentifier})`,
            referenceId: item.id,
            createdAt: now,
          });
        }
      }

      return item;
    });

    res.json({
      message: status === 'approved' ? 'অ্যাকাউন্ট অনুমোদিত ও টাকা যোগ করা হয়েছে।' : 'অ্যাকাউন্ট বাতিল করা হয়েছে।',
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// ADMIN ROLES & GRANULAR PERMISSIONS ENDPOINTS
// ==========================================

// Get list of all admins and their permission settings
apiRouter.get('/admin/roles', requirePermission('canManageAdmins'), (req: AuthenticatedRequest, res: Response) => {
  const db = getDatabase();
  const adminRoleRecords = db.user_roles.filter((r) => r.role === 'admin');

  const result = adminRoleRecords.map((r) => {
    const profile = db.profiles.find((p) => p.id === r.userId);
    const isFounder = profile ? profile.email.toLowerCase() === 'fahim236455@gmail.com' : false;
    const isSuper = Boolean(r.isSuperAdmin || isFounder);

    const permissions: AdminPermissions = isSuper
      ? { ...DEFAULT_SUPER_ADMIN_PERMISSIONS }
      : ({
          canManageTasks: Boolean(r.permissions?.canManageTasks),
          canReviewTaskProofs: Boolean(r.permissions?.canReviewTaskProofs),
          canManageSocialJobs: Boolean(r.permissions?.canManageSocialJobs),
          canReviewSocialSubmissions: Boolean(r.permissions?.canReviewSocialSubmissions),
          canManageWithdrawals: Boolean(r.permissions?.canManageWithdrawals),
          canManageUsers: Boolean(r.permissions?.canManageUsers),
          canManageSupport: Boolean(r.permissions?.canManageSupport),
          canEditSiteSettings: Boolean(r.permissions?.canEditSiteSettings),
          canViewAuditLogs: Boolean(r.permissions?.canViewAuditLogs),
          canManageAdmins: Boolean(r.permissions?.canManageAdmins),
        } as AdminPermissions);

    return {
      id: r.id,
      userId: r.userId,
      userEmail: profile?.email || 'N/A',
      userName: profile?.fullName || 'অজানা অ্যাডমিন',
      userPhone: profile?.phoneNumber || 'N/A',
      role: 'admin',
      isSuperAdmin: isSuper,
      title: r.title || (isSuper ? 'সুপার অ্যাডমিন (Founder & Admin)' : 'সাব-অ্যাডমিন / মডারেটর'),
      permissions,
      assignedBy: r.assignedBy || 'System',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt || r.createdAt,
    };
  });

  res.json(result);
});

// Assign or update admin role and permissions for any user
apiRouter.post('/admin/roles/assign', requirePermission('canManageAdmins'), (req: AuthenticatedRequest, res: Response) => {
  const { userId, title, permissions, isSuperAdmin } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'ব্যবহারকারী প্রদান করুন।' });
    return;
  }

  // Permission check: only Super Admins or users with canManageAdmins can assign roles
  if (!req.isAdminSuper && !req.adminPermissions?.canManageAdmins) {
    res.status(403).json({ error: 'আপনার কাছে নতুন অ্যাডমিন নিয়োগ বা পারমিশন পরিবর্তন করার অধিকার নেই।' });
    return;
  }

  try {
    const updatedRoleInfo = mutateLedger((db) => {
      const profile = db.profiles.find((p) => p.id === userId);
      if (!profile) {
        throw new Error('ব্যবহারকারী খুঁজে পাওয়া যায়নি।');
      }

      const isFounder = profile.email.toLowerCase() === 'fahim236455@gmail.com';
      const now = new Date().toISOString();

      let roleRecord = db.user_roles.find((r) => r.userId === userId && r.role === 'admin');

      const cleanPermissions: AdminPermissions = isFounder
        ? { ...DEFAULT_SUPER_ADMIN_PERMISSIONS }
        : {
            canManageTasks: Boolean(permissions?.canManageTasks),
            canReviewTaskProofs: Boolean(permissions?.canReviewTaskProofs),
            canManageSocialJobs: Boolean(permissions?.canManageSocialJobs),
            canReviewSocialSubmissions: Boolean(permissions?.canReviewSocialSubmissions),
            canManageWithdrawals: Boolean(permissions?.canManageWithdrawals),
            canManageUsers: Boolean(permissions?.canManageUsers),
            canManageSupport: Boolean(permissions?.canManageSupport),
            canEditSiteSettings: Boolean(permissions?.canEditSiteSettings),
            canViewAuditLogs: Boolean(permissions?.canViewAuditLogs),
            canManageAdmins: Boolean(permissions?.canManageAdmins),
          };

      const cleanTitle = (title || '').trim() || (isFounder ? 'সুপার অ্যাডমিন (Founder & Admin)' : 'সাব-অ্যাডমিন / মডারেটর');

      if (!roleRecord) {
        roleRecord = {
          id: generateId(),
          userId: profile.id,
          role: 'admin',
          isSuperAdmin: isFounder ? true : Boolean(isSuperAdmin),
          title: cleanTitle,
          permissions: cleanPermissions,
          assignedBy: req.user!.email,
          createdAt: now,
          updatedAt: now,
        };
        db.user_roles.push(roleRecord);
      } else {
        if (isFounder) {
          roleRecord.isSuperAdmin = true;
          roleRecord.permissions = { ...DEFAULT_SUPER_ADMIN_PERMISSIONS };
          roleRecord.title = cleanTitle || 'সুপার অ্যাডমিন (Founder & Admin)';
        } else {
          roleRecord.isSuperAdmin = Boolean(isSuperAdmin);
          roleRecord.permissions = cleanPermissions;
          roleRecord.title = cleanTitle;
        }
        roleRecord.assignedBy = req.user!.email;
        roleRecord.updatedAt = now;
      }

      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: 'admin_role_assigned_or_updated',
        details: {
          targetUserId: profile.id,
          targetEmail: profile.email,
          title: roleRecord.title,
          isSuperAdmin: roleRecord.isSuperAdmin,
          permissions: roleRecord.permissions,
        },
        createdAt: now,
      });

      return {
        id: roleRecord.id,
        userId: profile.id,
        userEmail: profile.email,
        userName: profile.fullName,
        userPhone: profile.phoneNumber,
        role: 'admin' as const,
        isSuperAdmin: roleRecord.isSuperAdmin,
        title: roleRecord.title,
        permissions: roleRecord.permissions,
        assignedBy: roleRecord.assignedBy,
        createdAt: roleRecord.createdAt,
        updatedAt: roleRecord.updatedAt,
      };
    });

    res.json({
      message: 'অ্যাডমিন পারমিশন ও রোল সফলভাবে আপডেট করা হয়েছে!',
      data: updatedRoleInfo,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Revoke admin access from a user
apiRouter.post('/admin/roles/revoke', requirePermission('canManageAdmins'), (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    res.status(400).json({ error: 'ব্যবহারকারী আইডি দিন।' });
    return;
  }

  if (!req.isAdminSuper && !req.adminPermissions?.canManageAdmins) {
    res.status(403).json({ error: 'আপনার কাছে অ্যাডমিন রোল প্রত্যাহার করার অধিকার নেই।' });
    return;
  }

  try {
    mutateLedger((db) => {
      const profile = db.profiles.find((p) => p.id === userId);
      if (!profile) {
        throw new Error('ব্যবহারকারী খুঁজে পাওয়া যায়নি।');
      }

      if (profile.email.toLowerCase() === 'fahim236455@gmail.com') {
        throw new Error('মূল প্রতিষ্ঠাতা ও সুপার অ্যাডমিনের পারমিশন প্রত্যাহার করা যাবে না।');
      }

      const roleIndex = db.user_roles.findIndex((r) => r.userId === userId && r.role === 'admin');
      if (roleIndex === -1) {
        throw new Error('এই ব্যবহারকারী অ্যাডমিন তালিকায় নেই।');
      }

      db.user_roles.splice(roleIndex, 1);

      db.audit_logs.push({
        id: generateId(),
        actorId: req.user!.userId,
        actorEmail: req.user!.email,
        action: 'admin_role_revoked',
        details: {
          targetUserId: profile.id,
          targetEmail: profile.email,
        },
        createdAt: new Date().toISOString(),
      });
    });

    res.json({ message: 'ব্যবহারকারীর অ্যাডমিন অ্যাক্সেস সফলভাবে প্রত্যাহার করা হয়েছে।' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

