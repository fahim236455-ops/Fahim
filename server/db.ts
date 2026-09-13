import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { fetchCloudState, saveCloudState } from './firebase.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface AdminPermissions {
  canManageTasks: boolean; // মাইক্রো টাস্ক তৈরি, এডিট, ডুপ্লিকেট, ডিলিট
  canReviewTaskProofs: boolean; // ইউজারদের টাস্ক প্রুফ ও সাবমিশন যাচাই/অনুমোদন/বাতিল
  canManageSocialJobs: boolean; // জিমেইল, ফেসবুক, ইনস্টাগ্রাম কাজের রেট ও সেটিংস
  canReviewSocialSubmissions: boolean; // সোশ্যাল অ্যাকাউন্ট সেল প্রুফ চেক ও পেমেন্ট রিলিজ
  canManageWithdrawals: boolean; // বিকাশ/নগদ/রকেট উইথড্র অনুমোদন ও পেমেন্ট সম্পন্ন করা
  canManageUsers: boolean; // ইউজার লিস্ট, ব্যালেন্স এডিট (+/-), অ্যাকাউন্ট স্থগিত/সক্রিয়
  canManageSupport: boolean; // কাস্টমার সাপোর্ট টিকিট ও লাইভ চ্যাট মেসেজ
  canEditSiteSettings: boolean; // নোটিশ, রেফারেল রিওয়ার্ড, মিনিমাম উইথড্র ও হেল্পলাইন
  canViewAuditLogs: boolean; // সিকিউরিটি অডিট হিস্ট্রি ও অ্যাকশন লগ
  canManageAdmins: boolean; // নতুন অ্যাডমিন নিয়োগ ও পারমিশন কন্ট্রোল (সুপার অ্যাডমিন)
}

export const DEFAULT_SUPER_ADMIN_PERMISSIONS: AdminPermissions = {
  canManageTasks: true,
  canReviewTaskProofs: true,
  canManageSocialJobs: true,
  canReviewSocialSubmissions: true,
  canManageWithdrawals: true,
  canManageUsers: true,
  canManageSupport: true,
  canEditSiteSettings: true,
  canViewAuditLogs: true,
  canManageAdmins: true,
};

export const DEFAULT_SUB_ADMIN_PERMISSIONS: AdminPermissions = {
  canManageTasks: true,
  canReviewTaskProofs: true,
  canManageSocialJobs: false,
  canReviewSocialSubmissions: true,
  canManageWithdrawals: false,
  canManageUsers: false,
  canManageSupport: true,
  canEditSiteSettings: false,
  canViewAuditLogs: false,
  canManageAdmins: false,
};

export interface DatabaseSchema {
  profiles: Array<{
    id: string;
    email: string;
    fullName: string;
    phoneNumber: string;
    avatar?: string;
    referralCode: string;
    referredBy?: string | null;
    balance: number;
    totalEarned: number;
    totalWithdrawn: number;
    totalReferrals: number;
    status: 'active' | 'suspended';
    createdAt: string;
    updatedAt: string;
  }>;
  user_roles: Array<{
    id: string;
    userId: string;
    role: 'admin' | 'user';
    isSuperAdmin?: boolean;
    title?: string;
    permissions?: AdminPermissions;
    assignedBy?: string;
    createdAt: string;
    updatedAt?: string;
  }>;
  auth_credentials: Array<{
    userId: string;
    passwordHash: string;
    updatedAt: string;
  }>;
  site_settings: {
    id: string;
    brandName: string;
    referralReward: number;
    minWithdrawal: number;
    maxWithdrawal?: number;
    withdrawalFeePercent: number;
    withdrawalMethods: string[];
    bkashNumber?: string;
    nagadNumber?: string;
    rocketNumber?: string;
    supportPhone: string;
    supportWhatsapp: string;
    supportTelegram: string;
    supportEmail?: string;
    announcement: string;
    signupBonus?: number;
    dailyCheckinReward?: number;
    popupNotice?: {
      enabled: boolean;
      title: string;
      message: string;
    };
    maintenanceMode?: {
      enabled: boolean;
      message: string;
    };
    heroTitle?: string;
    heroSubtitle?: string;
    heroVideoUrl?: string;
    telegramChannelUrl?: string;
    telegramGroupUrl?: string;
    faqs?: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
    updatedAt: string;
  };
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    category: 'telegram' | 'youtube' | 'facebook' | 'gmail' | 'instagram' | 'app' | 'daily_checkin' | 'website' | 'general';
    rewardAmount: number;
    taskType: 'manual' | 'auto';
    proofType: 'screenshot_and_username' | 'link_or_text' | 'none';
    proofInstruction?: string;
    targetUrl?: string;
    dailyLimit: number;
    status: 'active' | 'paused' | 'archived';
    createdAt: string;
    updatedAt: string;
  }>;
  task_submissions: Array<{
    id: string;
    taskId: string;
    userId: string;
    proofData: string;
    screenshot?: string;
    status: 'pending' | 'approved' | 'rejected';
    rewardAmount: number;
    rejectionReason?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    createdAt: string;
  }>;
  referrals: Array<{
    id: string;
    referrerId: string;
    referredUserId: string;
    rewardAmount: number;
    status: 'registered' | 'rewarded';
    rewardedAt?: string;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    userId: string;
    type: 'task_reward' | 'referral_bonus' | 'daily_checkin' | 'withdrawal_hold' | 'withdrawal_refund' | 'withdrawal_paid' | 'admin_adjustment';
    amount: number;
    balanceAfter: number;
    description: string;
    referenceId?: string;
    createdAt: string;
  }>;
  withdrawal_requests: Array<{
    id: string;
    userId: string;
    method: 'bKash' | 'Nagad' | 'Rocket';
    accountNumber: string;
    amount: number;
    fee: number;
    netAmount: number;
    status: 'pending' | 'approved' | 'rejected' | 'paid';
    adminNote?: string;
    reviewedBy?: string;
    processedAt?: string;
    createdAt: string;
  }>;
  support_tickets: Array<{
    id: string;
    userId: string;
    userName?: string;
    userPhone?: string;
    userEmail?: string;
    subject: string;
    message: string;
    category: 'withdrawal' | 'task' | 'referral' | 'account' | 'other';
    status: 'open' | 'answered' | 'closed';
    adminReply?: string;
    repliedAt?: string;
    messages?: Array<{
      id: string;
      sender: 'user' | 'agent';
      text: string;
      attachmentUrl?: string;
      timestamp: string;
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
  audit_logs: Array<{
    id: string;
    actorId?: string;
    actorEmail: string;
    action: string;
    details: Record<string, unknown>;
    ipAddress?: string;
    createdAt: string;
  }>;
  social_account_sales: Array<{
    id: string;
    userId: string;
    userEmail: string;
    service: 'gmail' | 'facebook' | 'instagram';
    accountIdentifier: string;
    password: string;
    extraField?: string;
    rate: number;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
  }>;
  social_jobs_config?: Array<{
    service: 'gmail' | 'facebook' | 'instagram';
    title: string;
    rate: number;
    dailyLimit: number;
    reportTime: string;
    todayPassword?: string;
    usernameTemplate?: string;
    active: boolean;
    tutorialUrl?: string;
    notes?: string;
    updatedAt?: string;
  }>;
  social_tasks_queue?: Array<{
    id: string;
    service: 'gmail' | 'facebook' | 'instagram';
    taskNumber: number;
    title: string;
    instruction?: string;
    suggestedUsername?: string;
    requiredPassword?: string;
    recoveryEmail?: string;
    twoFaRequired?: boolean;
    cookiesRequired?: boolean;
    rate: number;
    status: 'active' | 'completed' | 'paused';
    completedCount: number;
    dailyLimit: number;
    createdAt: string;
  }>;
  user_posted_jobs?: Array<{
    id: string;
    userId: string;
    userEmail: string;
    userFullName: string;
    mainCategory: string;
    subCategory: string;
    title: string;
    instructions: string;
    thumbnailUrl?: string;
    proofRequirements: Array<{
      id: string;
      title: string;
      type: 'text' | 'screenshot';
    }>;
    workersNeeded: number;
    workersCompleted: number;
    costPerWorker: number;
    netAmount: number;
    systemFee: number;
    totalPayable: number;
    status: 'active' | 'pending' | 'completed' | 'paused' | 'rejected';
    createdAt: string;
    updatedAt: string;
  }>;
}

let dbInstance: DatabaseSchema | null = null;

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function generateId(): string {
  return crypto.randomUUID();
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FPB';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function getInitialData(): DatabaseSchema {
  const adminId = generateId();
  const adminSalt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('Admin@FahimPay2026', adminSalt);

  const now = new Date().toISOString();

  return {
    profiles: [
      {
        id: adminId,
        email: 'fahim236455@gmail.com',
        fullName: 'Fahim Ahmed (Founder & Admin)',
        phoneNumber: '01700000000',
        referralCode: 'FPBADMIN',
        referredBy: null,
        balance: 0.0,
        totalEarned: 0.0,
        totalWithdrawn: 0.0,
        totalReferrals: 0,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
    ],
    user_roles: [
      {
        id: generateId(),
        userId: adminId,
        role: 'admin',
        isSuperAdmin: true,
        title: 'সুপার অ্যাডমিন (Founder & Admin)',
        permissions: { ...DEFAULT_SUPER_ADMIN_PERMISSIONS },
        createdAt: now,
        updatedAt: now,
      },
    ],
    auth_credentials: [
      {
        userId: adminId,
        passwordHash: adminPasswordHash,
        updatedAt: now,
      },
    ],
    site_settings: {
      id: generateId(),
      brandName: 'Earnora',
      referralReward: 50.0,
      minWithdrawal: 500.0,
      withdrawalFeePercent: 2.0,
      withdrawalMethods: ['bKash', 'Nagad', 'Rocket'],
      supportPhone: '+880 1700-000000',
      supportWhatsapp: '+880 1700-000000',
      supportTelegram: '@earnora_official',
      announcement:
        '📢 স্বাগতম! Earnora-তে প্রতিটি টাস্ক সম্পূর্ণ করে এবং বন্ধুদের রেফার করে নিশ্চিত আয় করুন। উইথড্র রিকোয়েস্ট ১২-২৪ ঘণ্টার মধ্যে সফলভাবে বিকাশ, নগদ ও রকেটে পরিশোধ করা হয়।',
      updatedAt: now,
    },
    tasks: [],
    task_submissions: [],
    referrals: [],
    transactions: [],
    withdrawal_requests: [],
    support_tickets: [],
    audit_logs: [
      {
        id: generateId(),
        actorId: adminId,
        actorEmail: 'fahim236455@gmail.com',
        action: 'system_initialized',
        details: { message: 'Earnora clean production database initialized.' },
        createdAt: now,
      },
    ],
    social_account_sales: [],
    social_jobs_config: [
      {
        service: 'gmail',
        title: 'Gmail Create & Sell',
        rate: 14.0,
        dailyLimit: 1000,
        reportTime: '15-30 hours',
        usernameTemplate: 'sgw',
        todayPassword: 'sgwteam1@21A',
        active: true,
        tutorialUrl: 'https://youtube.com',
        notes: 'নতুন জিমেইল তৈরি করুন। রিকভারি ছাড়া পাসওয়ার্ড sgwteam1@21A দিন।',
        updatedAt: now,
      },
      {
        service: 'facebook',
        title: 'Facebook ID / Followers Sell',
        rate: 4.5,
        dailyLimit: 1000,
        reportTime: '15/40 hours',
        todayPassword: 'smallgigwork@12',
        active: true,
        tutorialUrl: 'https://youtube.com',
        notes: 'ফেসবুক ইউআইডি ও পাসওয়ার্ড দিন। কুকিজ দিলে দ্রুত অনুমোদন।',
        updatedAt: now,
      },
      {
        service: 'instagram',
        title: 'Instagram Account Sell',
        rate: 2.5,
        dailyLimit: 1000,
        reportTime: '10/20 hours',
        todayPassword: 'smallgigwork@12',
        active: true,
        tutorialUrl: 'https://youtube.com',
        notes: 'ইনস্টাগ্রাম ইউজারনেম ও পাসওয়ার্ড দিয়ে সাবমিট করুন।',
        updatedAt: now,
      },
    ],
  };
}

export function getDatabase(): DatabaseSchema {
  if (dbInstance) {
    if (!dbInstance.social_account_sales) dbInstance.social_account_sales = [];
    if (!dbInstance.social_jobs_config) {
      dbInstance.social_jobs_config = [
        {
          service: 'gmail',
          title: 'Gmail Create & Sell',
          rate: 14.0,
          dailyLimit: 1000,
          reportTime: '15-30 hours',
          usernameTemplate: 'sgw',
          todayPassword: 'sgwteam1@21A',
          active: true,
          tutorialUrl: 'https://youtube.com',
          notes: 'নতুন জিমেইল তৈরি করুন। রিকভারি ছাড়া পাসওয়ার্ড sgwteam1@21A দিন।',
          updatedAt: new Date().toISOString(),
        },
        {
          service: 'facebook',
          title: 'Facebook ID / Followers Sell',
          rate: 4.5,
          dailyLimit: 1000,
          reportTime: '15/40 hours',
          todayPassword: 'smallgigwork@12',
          active: true,
          tutorialUrl: 'https://youtube.com',
          notes: 'ফেসবুক ইউআইডি ও পাসওয়ার্ড দিন। কুকিজ দিলে দ্রুত অনুমোদন।',
          updatedAt: new Date().toISOString(),
        },
        {
          service: 'instagram',
          title: 'Instagram Account Sell',
          rate: 2.5,
          dailyLimit: 1000,
          reportTime: '10/20 hours',
          todayPassword: 'smallgigwork@12',
          active: true,
          tutorialUrl: 'https://youtube.com',
          notes: 'ইনস্টাগ্রাম ইউজারনেম ও পাসওয়ার্ড দিয়ে সাবমিট করুন।',
          updatedAt: new Date().toISOString(),
        },
      ];
    }
    return dbInstance;
  }
  ensureDataDirectory();
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    dbInstance = initial;
    return dbInstance;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    dbInstance = JSON.parse(content) as DatabaseSchema;
    if (!dbInstance.social_account_sales) dbInstance.social_account_sales = [];
    if (!dbInstance.social_jobs_config) {
      dbInstance.social_jobs_config = [
        {
          service: 'gmail',
          title: 'Gmail Create & Sell',
          rate: 14.0,
          dailyLimit: 1000,
          reportTime: '15-30 hours',
          usernameTemplate: 'sgw',
          todayPassword: 'sgwteam1@21A',
          active: true,
          tutorialUrl: 'https://youtube.com',
          notes: 'নতুন জিমেইল তৈরি করুন। রিকভারি ছাড়া পাসওয়ার্ড sgwteam1@21A দিন।',
          updatedAt: new Date().toISOString(),
        },
        {
          service: 'facebook',
          title: 'Facebook ID / Followers Sell',
          rate: 4.5,
          dailyLimit: 1000,
          reportTime: '15/40 hours',
          todayPassword: 'smallgigwork@12',
          active: true,
          tutorialUrl: 'https://youtube.com',
          notes: 'ফেসবুক ইউআইডি ও পাসওয়ার্ড দিন। কুকিজ দিলে দ্রুত অনুমোদন।',
          updatedAt: new Date().toISOString(),
        },
        {
          service: 'instagram',
          title: 'Instagram Account Sell',
          rate: 2.5,
          dailyLimit: 1000,
          reportTime: '10/20 hours',
          todayPassword: 'smallgigwork@12',
          active: true,
          tutorialUrl: 'https://youtube.com',
          notes: 'ইনস্টাগ্রাম ইউজারনেম ও পাসওয়ার্ড দিয়ে সাবমিট করুন।',
          updatedAt: new Date().toISOString(),
        },
      ];
    }
    if (!dbInstance.user_posted_jobs) {
      dbInstance.user_posted_jobs = [];
    }

    // Ensure valid user ID mapping for integrity
    const validUserIds = new Set(dbInstance.profiles.map((p) => p.id));
    dbInstance.user_roles = dbInstance.user_roles.filter((r) => validUserIds.has(r.userId));
    dbInstance.auth_credentials = dbInstance.auth_credentials.filter((c) => validUserIds.has(c.userId));

    // Ensure founder is always super admin with full permissions
    const founderProfile = dbInstance.profiles.find((p) => p.email.toLowerCase() === 'fahim236455@gmail.com');
    if (founderProfile) {
      let founderRole = dbInstance.user_roles.find((r) => r.userId === founderProfile.id && r.role === 'admin');
      if (!founderRole) {
        founderRole = {
          id: generateId(),
          userId: founderProfile.id,
          role: 'admin',
          isSuperAdmin: true,
          title: 'সুপার অ্যাডমিন (Founder & Admin)',
          permissions: { ...DEFAULT_SUPER_ADMIN_PERMISSIONS },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        dbInstance.user_roles.push(founderRole);
      } else {
        founderRole.isSuperAdmin = true;
        founderRole.title = founderRole.title || 'সুপার অ্যাডমিন (Founder & Admin)';
        founderRole.permissions = { ...DEFAULT_SUPER_ADMIN_PERMISSIONS, ...(founderRole.permissions || {}) };
      }
    }

    // Hydrate default permissions for other admin roles if missing
    for (const r of dbInstance.user_roles) {
      if (r.role === 'admin') {
        if (!r.permissions) {
          r.permissions = r.isSuperAdmin ? { ...DEFAULT_SUPER_ADMIN_PERMISSIONS } : { ...DEFAULT_SUB_ADMIN_PERMISSIONS };
        }
        if (!r.title) {
          r.title = r.isSuperAdmin ? 'সুপার অ্যাডমিন' : 'সাব-অ্যাডমিন / মডারেটর';
        }
      }
    }

    // Remove any auto-generated dummy tasks so only admin manual tasks exist
    if (dbInstance.tasks) {
      dbInstance.tasks = dbInstance.tasks.filter((t) => !t.title.includes('#'));
    }

    return dbInstance;
  } catch (err) {
    console.error('Failed to parse database file, recreating fresh data:', err);
    const initial = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    dbInstance = initial;
    return dbInstance;
  }
}

let cloudSyncTimer: NodeJS.Timeout | null = null;
let lastCloudSyncTime: string | null = null;
let isCloudSyncing = false;

export function getCloudSyncStatus() {
  return {
    lastSync: lastCloudSyncTime,
    isSyncing: isCloudSyncing,
    localUsersCount: dbInstance ? dbInstance.profiles.length : 0,
  };
}

export async function forcePushToCloud(): Promise<boolean> {
  if (!dbInstance) return false;
  try {
    isCloudSyncing = true;
    const ok = await saveCloudState(dbInstance);
    if (ok) {
      lastCloudSyncTime = new Date().toISOString();
      console.log(`[Cloud DB] Successfully pushed database snapshot to Cloud Firestore! Users: ${dbInstance.profiles.length}`);
    }
    return ok;
  } catch (err) {
    console.error('[Cloud DB] Force push failed:', err);
    return false;
  } finally {
    isCloudSyncing = false;
  }
}

export async function forcePullFromCloud(): Promise<boolean> {
  try {
    isCloudSyncing = true;
    const cloud = await fetchCloudState();
    if (cloud && cloud.data && Array.isArray(cloud.data.profiles)) {
      dbInstance = cloud.data as DatabaseSchema;
      ensureDataDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(dbInstance, null, 2), 'utf-8');
      lastCloudSyncTime = cloud.syncedAt || new Date().toISOString();
      console.log(`[Cloud DB] Pulled and restored ${dbInstance.profiles.length} user(s) from Cloud Firestore.`);
      return true;
    }
    return false;
  } catch (err) {
    console.error('[Cloud DB] Force pull failed:', err);
    return false;
  } finally {
    isCloudSyncing = false;
  }
}

export function saveDatabase(): void {
  if (!dbInstance) return;
  ensureDataDirectory();
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(dbInstance, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);

  // Trailing-debounce async sync to Firestore (every 800ms max)
  if (cloudSyncTimer) {
    clearTimeout(cloudSyncTimer);
  }
  cloudSyncTimer = setTimeout(async () => {
    if (!dbInstance) return;
    try {
      isCloudSyncing = true;
      const success = await saveCloudState(dbInstance);
      if (success) {
        lastCloudSyncTime = new Date().toISOString();
      }
    } catch (err) {
      console.error('[Cloud DB] Auto sync to Firestore encountered an error:', err);
    } finally {
      isCloudSyncing = false;
    }
  }, 800);
}

export async function initCloudDatabase(): Promise<void> {
  const local = getDatabase();
  try {
    console.log('[Cloud DB] Initializing connection with Cloud Firestore...');
    const cloud = await fetchCloudState();
    if (cloud && cloud.data && Array.isArray(cloud.data.profiles) && cloud.data.profiles.length > 0) {
      console.log(`[Cloud DB] Cloud Firestore state detected with ${cloud.data.profiles.length} profile(s). (Local has ${local.profiles.length})`);
      
      // If cloud has equal or more users, or cloud has data while local only has initial default
      if (cloud.data.profiles.length >= local.profiles.length) {
        dbInstance = cloud.data as DatabaseSchema;
        ensureDataDirectory();
        fs.writeFileSync(DB_FILE, JSON.stringify(dbInstance, null, 2), 'utf-8');
        lastCloudSyncTime = cloud.syncedAt || new Date().toISOString();
        console.log(`[Cloud DB] Preserved and loaded ${dbInstance.profiles.length} user(s) from Cloud Firestore.`);
      } else {
        // Local has more users (e.g. initial migration or local update), upload local to cloud
        console.log(`[Cloud DB] Updating Cloud Firestore with ${local.profiles.length} local profiles.`);
        await forcePushToCloud();
      }
    } else {
      console.log('[Cloud DB] Cloud database empty. Seeding initial snapshot to Cloud Firestore.');
      await forcePushToCloud();
    }
  } catch (err) {
    console.error('[Cloud DB] Error during Cloud Firestore initialization:', err);
  }
}

// Mutex-like synchronous wrapper for critical ledger mutations
export function mutateLedger<T>(fn: (db: DatabaseSchema) => T): T {
  const db = getDatabase();
  const result = fn(db);
  saveDatabase();
  return result;
}

export { generateId, generateReferralCode };

