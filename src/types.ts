// Types for Fahim Pay BD

export type UserRole = 'admin' | 'user';

export type UserStatus = 'active' | 'suspended';

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

export interface AdminRoleInfo {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  role: 'admin' | 'user';
  isSuperAdmin?: boolean;
  title: string;
  permissions: AdminPermissions;
  assignedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
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
  status: UserStatus;
  roles: UserRole[];
  isSuperAdmin?: boolean;
  adminTitle?: string;
  adminPermissions?: AdminPermissions | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteFaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface SiteSettings {
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
    channelButtonText?: string;
    channelUrl?: string;
    groupButtonText?: string;
    groupUrl?: string;
    facebookUrl?: string;
    youtubeUrl?: string;
    instagramUrl?: string;
    showEveryVisit?: boolean;
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
  faqs?: SiteFaqItem[];
  updatedAt: string;
}

export type TaskCategory =
  | 'telegram'
  | 'youtube'
  | 'facebook'
  | 'gmail'
  | 'instagram'
  | 'app'
  | 'daily_checkin'
  | 'website'
  | 'general';
export type TaskType = 'manual' | 'auto';
export type ProofType = 'screenshot_and_username' | 'link_or_text' | 'none';
export type TaskStatus = 'active' | 'paused' | 'archived';

export interface SocialJobConfig {
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
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  rewardAmount: number;
  taskType: TaskType;
  proofType: ProofType;
  proofInstruction?: string;
  targetUrl?: string;
  dailyLimit: number;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedToday?: boolean;
  submissionStatus?: 'pending' | 'approved' | 'rejected' | null;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface TaskSubmission {
  id: string;
  taskId: string;
  taskTitle?: string;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  userPhone?: string;
  proofData: string;
  screenshot?: string;
  status: SubmissionStatus;
  rewardAmount: number;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface SocialAccountSale {
  id: string;
  userId: string;
  userEmail?: string;
  userFullName?: string;
  userPhone?: string;
  service: 'gmail' | 'facebook' | 'instagram';
  taskId?: string;
  accountIdentifier: string;
  password?: string;
  extraField?: string;
  rate: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export type ReferralStatus = 'registered' | 'rewarded';

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserName?: string;
  referredUserEmail?: string;
  referredUserPhone?: string;
  rewardAmount: number;
  status: ReferralStatus;
  rewardedAt?: string;
  createdAt: string;
}

export type TransactionType =
  | 'task_reward'
  | 'referral_bonus'
  | 'daily_checkin'
  | 'withdrawal_hold'
  | 'withdrawal_refund'
  | 'withdrawal_paid';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceId?: string;
  createdAt: string;
}

export type WithdrawalMethod = 'bKash' | 'Nagad' | 'Rocket' | 'Recharge' | 'USDT';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userFullName?: string;
  userEmail?: string;
  userPhone?: string;
  method: WithdrawalMethod;
  accountNumber: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: WithdrawalStatus;
  adminNote?: string;
  reviewedBy?: string;
  processedAt?: string;
  createdAt: string;
}

export type TicketCategory = 'withdrawal' | 'task' | 'referral' | 'account' | 'other';
export type TicketStatus = 'open' | 'answered' | 'closed';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  attachmentUrl?: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userFullName?: string;
  userEmail?: string;
  userPhone?: string;
  userBalance?: number;
  subject: string;
  message: string;
  category: TicketCategory;
  status: TicketStatus;
  adminReply?: string;
  repliedAt?: string;
  messages?: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  actorEmail: string;
  action: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalBalance: number;
  totalWithdrawn: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsAmount: number;
  pendingTasksCount: number;
  completedTasksCount: number;
  totalReferralsCount: number;
}
