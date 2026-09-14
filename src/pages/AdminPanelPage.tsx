import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../lib/api';
import { Logo } from '../components/Logo';
import { SiteNoticeModal } from '../components/SiteNoticeModal';
import { Task, SiteSettings, SocialJobConfig, SupportTicket, AdminRoleInfo, AdminPermissions } from '../types';
import { formatWhatsAppLink, formatTelegramLink } from './SupportPage';
import {
  ShieldCheck,
  Users,
  CheckSquare,
  ArrowDownCircle,
  Headphones,
  Settings,
  Activity,
  Check,
  X,
  Plus,
  RefreshCw,
  LogOut,
  ArrowLeft,
  DollarSign,
  Search,
  AlertCircle,
  ExternalLink,
  Copy,
  Lock,
  Mail,
  ArrowRight,
  TrendingUp,
  Wallet,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  UserCheck,
  UserX,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Share2,
  ThumbsUp,
  Instagram,
  Send,
  MessageSquare,
  Phone,
  Edit3,
  Trash2,
  Filter,
  Youtube,
  Video,
  Cloud,
  Database,
  UploadCloud,
  KeyRound,
  HelpCircle,
  Globe,
  Sliders,
  Layers,
  Bell,
  AlertTriangle,
  CreditCard,
  Gift,
} from 'lucide-react';

interface AdminPanelPageProps {
  onNavigate: (route: string) => void;
}

interface EnrichedSubmission {
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
  taskTitle?: string;
  taskDescription?: string;
  taskTargetUrl?: string;
  taskProofInstruction?: string;
  userFullName?: string;
  userEmail?: string;
  userPhone?: string;
}

interface EnrichedWithdrawal {
  id: string;
  userId: string;
  method: 'bKash' | 'Nagad' | 'Rocket';
  accountNumber: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  adminNote?: string;
  reviewedBy?: string;
  processedAt?: string;
  createdAt: string;
  userFullName?: string;
  userEmail?: string;
  userPhone?: string;
}

interface EnrichedUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  referralCode: string;
  balance: number;
  totalEarned: number;
  totalWithdrawn: number;
  totalReferrals: number;
  status: 'active' | 'suspended';
  createdAt: string;
  roles?: string[];
}

interface EnrichedTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  category: string;
  status: 'open' | 'answered';
  adminReply?: string;
  answeredAt?: string;
  createdAt: string;
  userName?: string;
}

interface AuditLogItem {
  id: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  details?: any;
  createdAt: string;
}

export const AdminPanelPage: React.FC<AdminPanelPageProps> = ({ onNavigate }) => {
  const { user, isAdmin, adminLogin, logout, showToast, refreshSettings, settings } = useApp();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'submissions' | 'social_sales' | 'social_jobs' | 'withdrawals' | 'tasks' | 'users' | 'support' | 'settings' | 'audit' | 'roles'
  >('overview');

  // Admin Roles & Permissions management state
  const [adminRolesList, setAdminRolesList] = useState<AdminRoleInfo[]>([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<EnrichedUser | null>(null);
  const [roleFormTitle, setRoleFormTitle] = useState('সাব-অ্যাডমিন / মডারেটর');
  const [roleFormIsSuper, setRoleFormIsSuper] = useState(false);
  const [roleFormPermissions, setRoleFormPermissions] = useState<AdminPermissions>({
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
  });
  const [savingRole, setSavingRole] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');

  // Sub-filter tabs
  const [subFilter, setSubFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [socialFilter, setSocialFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [withFilter, setWithFilter] = useState<'all' | 'pending' | 'paid' | 'rejected'>('pending');

  // Gateway login state (for when user is not admin)
  const [gatewayEmail, setGatewayEmail] = useState('');
  const [gatewayPassword, setGatewayPassword] = useState('');
  const [gatewayLoading, setGatewayLoading] = useState(false);

  // Data states
  const [stats, setStats] = useState<any>(null);
  const [submissions, setSubmissions] = useState<EnrichedSubmission[]>([]);
  const [socialSales, setSocialSales] = useState<any[]>([]);
  const [socialJobs, setSocialJobs] = useState<SocialJobConfig[]>([]);
  const [socialTasksQueue, setSocialTasksQueue] = useState<any[]>([]);
  const [generatingQueueService, setGeneratingQueueService] = useState<string | null>(null);
  const [withdrawals, setWithdrawals] = useState<EnrichedWithdrawal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [tickets, setTickets] = useState<EnrichedTicket[]>([]);
  const [settingsForm, setSettingsForm] = useState<SiteSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cloudSyncInfo, setCloudSyncInfo] = useState<{ provider?: string; status?: string; lastSync?: string; localUsersCount?: number } | null>(null);
  const [cloudSyncLoading, setCloudSyncLoading] = useState(false);

  // Social job edit / new modal state
  const [editingSocialJob, setEditingSocialJob] = useState<SocialJobConfig | null>(null);
  const [showSocialJobModal, setShowSocialJobModal] = useState(false);
  const [socialJobSaving, setSocialJobSaving] = useState(false);
  const [newSocialJobForm, setNewSocialJobForm] = useState({
    service: 'gmail' as 'gmail' | 'facebook' | 'instagram',
    title: '',
    rate: 14.0,
    dailyLimit: 1000,
    reportTime: '15-30 hours',
    todayPassword: 'sgwteam1@21A',
    usernameTemplate: 'sgw',
    active: true,
    tutorialUrl: '',
    notes: '',
    createMicroTaskToo: true,
  });

  // New task modal state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    rewardAmount: 10,
    dailyLimit: 1,
    category: 'telegram',
    taskType: 'manual',
    proofType: 'screenshot_and_username',
    targetUrl: '',
    proofInstruction: '',
  });

  // Edit task modal & filter state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [taskSearch, setTaskSearch] = useState('');
  const [taskCategoryFilter, setTaskCategoryFilter] = useState('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

  // Balance adjustment modal state
  const [selectedUser, setSelectedUser] = useState<EnrichedUser | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceType, setBalanceType] = useState<'credit' | 'debit'>('credit');
  const [balanceReason, setBalanceReason] = useState('');

  // Withdrawal Mark Paid Modal
  const [selectedWithdrawalForPaid, setSelectedWithdrawalForPaid] = useState<EnrichedWithdrawal | null>(null);
  const [paymentTrxId, setPaymentTrxId] = useState('');

  // Withdrawal Reject Modal
  const [selectedWithdrawalForReject, setSelectedWithdrawalForReject] = useState<EnrichedWithdrawal | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Ticket reply & Live Chat state
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [selectedChatTicketId, setSelectedChatTicketId] = useState<string | null>(null);
  const [adminChatText, setAdminChatText] = useState('');
  const [adminSendingChat, setAdminSendingChat] = useState(false);
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'answered' | 'closed'>('all');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Search state
  const [userSearch, setUserSearch] = useState('');

  // Selected screenshot lightbox modal state
  const [selectedScreenshotUrl, setSelectedScreenshotUrl] = useState<string | null>(null);

  // Settings Sub-tab & Configuration states
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'support' | 'payments' | 'rewards' | 'landing' | 'security' | 'cloud'>('general');
  const [adminPasswordForm, setAdminPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [adminPasswordLoading, setAdminPasswordLoading] = useState(false);
  const [newFaqForm, setNewFaqForm] = useState({ question: '', answer: '' });
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);

  // Quick WhatsApp, Telegram & YouTube support modal states
  const [quickSupportModalOpen, setQuickSupportModalOpen] = useState(false);
  const [previewNoticeModalOpen, setPreviewNoticeModalOpen] = useState(false);
  const [quickWhatsapp, setQuickWhatsapp] = useState('');
  const [quickTelegram, setQuickTelegram] = useState('');
  const [quickYoutube, setQuickYoutube] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [savingQuickSupport, setSavingQuickSupport] = useState(false);

  const openQuickSupportModal = () => {
    if (settingsForm) {
      setQuickWhatsapp(settingsForm.supportWhatsapp || '');
      setQuickTelegram(settingsForm.supportTelegram || '');
      setQuickYoutube(settingsForm.heroVideoUrl || '');
      setQuickPhone(settingsForm.supportPhone || '');
    }
    setQuickSupportModalOpen(true);
  };

  const handleSaveQuickSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      setSavingQuickSupport(true);
      const updatedForm = {
        ...settingsForm,
        supportWhatsapp: quickWhatsapp.trim(),
        supportTelegram: quickTelegram.trim(),
        heroVideoUrl: quickYoutube.trim(),
        supportPhone: quickPhone.trim(),
      };
      const res = await fetchApi<{ message: string }>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(updatedForm),
      });
      setSettingsForm(updatedForm);
      showToast(res.message || 'সোশ্যাল লিংক ও সাপোর্ট সফলভাবে আপডেট হয়েছে!', 'success');
      await refreshSettings();
      setQuickSupportModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'সেটিংস আপডেট ব্যর্থ হয়েছে।', 'error');
    } finally {
      setSavingQuickSupport(false);
    }
  };

  // Load all admin data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsData, subData, withData, taskData, usrData, tktData, settsData, logsData, socData, socJobsData, socTasksData, rolesData, syncData] =
        await Promise.all([
          fetchApi(`/admin/stats?t=${Date.now()}`).catch((e) => { console.error('Stats API:', e); return null; }),
          fetchApi(`/admin/submissions?t=${Date.now()}`).catch((e) => { console.error('Subs API:', e); return null; }),
          fetchApi(`/admin/withdrawals?t=${Date.now()}`).catch((e) => { console.error('With API:', e); return null; }),
          fetchApi(`/admin/tasks?t=${Date.now()}`).catch((e) => { console.error('Tasks API:', e); return null; }),
          fetchApi(`/admin/users?t=${Date.now()}`).catch((e) => { console.error('Users API:', e); return null; }),
          fetchApi(`/admin/support/tickets?t=${Date.now()}`).catch((e) => { console.error('Tickets API:', e); return null; }),
          fetchApi(`/settings?t=${Date.now()}`).catch((e) => { console.error('Settings API:', e); return null; }),
          fetchApi(`/admin/audit-logs?t=${Date.now()}`).catch((e) => { console.error('Audit API:', e); return null; }),
          fetchApi(`/admin/social-sales?t=${Date.now()}`).catch((e) => { console.error('SocSales API:', e); return null; }),
          fetchApi(`/admin/social-jobs?t=${Date.now()}`).catch((e) => { console.error('SocJobs API:', e); return null; }),
          fetchApi(`/admin/social-tasks?t=${Date.now()}`).catch((e) => { console.error('SocTasks API:', e); return null; }),
          fetchApi(`/admin/roles?t=${Date.now()}`).catch((e) => { console.error('Roles API:', e); return null; }),
          fetchApi(`/admin/cloud-sync?t=${Date.now()}`).catch((e) => { console.error('CloudSync API:', e); return null; }),
        ]);

      if (statsData) setStats(statsData);
      if (Array.isArray(subData)) setSubmissions(subData);
      if (Array.isArray(withData)) setWithdrawals(withData);
      if (Array.isArray(taskData)) setTasks(taskData);
      if (Array.isArray(usrData)) setUsers(usrData);
      if (Array.isArray(tktData)) setTickets(tktData);
      if (settsData) setSettingsForm(settsData);
      if (Array.isArray(logsData)) setAuditLogs(logsData);
      if (Array.isArray(socData)) setSocialSales(socData);
      if (Array.isArray(socJobsData)) setSocialJobs(socJobsData);
      if (Array.isArray(socTasksData)) setSocialTasksQueue(socTasksData);
      if (Array.isArray(rolesData)) setAdminRolesList(rolesData);
      if (syncData) setCloudSyncInfo(syncData);
    } catch (err: any) {
      showToast(err.message || 'অ্যাডমিন ডেটা লোড ব্যর্থ হয়েছে।', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
      
      const refreshLiveStats = () => {
        // Background silent refresh for live new registered users & task submissions
        Promise.all([
          fetchApi(`/admin/users?t=${Date.now()}`).catch(() => null),
          fetchApi(`/admin/stats?t=${Date.now()}`).catch(() => null),
          fetchApi(`/admin/roles?t=${Date.now()}`).catch(() => null),
          fetchApi(`/admin/submissions?t=${Date.now()}`).catch(() => null),
          fetchApi(`/admin/social-sales?t=${Date.now()}`).catch(() => null),
        ]).then(([usrData, statsData, rolesData, subData, socSalesData]) => {
          if (Array.isArray(usrData)) {
            setUsers(usrData);
          }
          if (statsData) {
            setStats(statsData);
          }
          if (Array.isArray(rolesData)) setAdminRolesList(rolesData);
          if (Array.isArray(subData)) setSubmissions(subData);
          if (Array.isArray(socSalesData)) setSocialSales(socSalesData);
        });
      };

      const interval = setInterval(refreshLiveStats, 5000);
      
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          refreshLiveStats();
        }
      };
      
      const handleFocus = () => {
        refreshLiveStats();
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);

      return () => {
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [isAdmin, loadData]);

  // Handle Quick Admin Switch
  const handleQuickAdminLogin = async (emailToUse?: string, passToUse?: string) => {
    const targetEmail = emailToUse || 'fahim236455@gmail.com';
    const targetPass = passToUse || 'Admin@FahimPay2026';

    try {
      setGatewayLoading(true);
      await adminLogin(targetEmail, targetPass);
      showToast('সুপার অ্যাডমিন হিসেবে সফলভাবে লগইন সম্পন্ন হয়েছে!', 'success');
      await loadData();
    } catch {
      // Try demo fallback admin
      try {
        await adminLogin('admin@fahimpaybd.com', 'admin123456');
        showToast('অ্যাডমিন মোডে প্রবেশ সফল হয়েছে!', 'success');
        await loadData();
      } catch (err2: any) {
        showToast(err2.message || 'অ্যাডমিন লগইন ব্যর্থ হয়েছে', 'error');
      }
    } finally {
      setGatewayLoading(false);
    }
  };

  // Custom Admin Login form
  const handleCustomAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gatewayEmail || !gatewayPassword) {
      showToast('ইমেইল ও পাসওয়ার্ড প্রদান করুন', 'error');
      return;
    }
    try {
      setGatewayLoading(true);
      await adminLogin(gatewayEmail.trim(), gatewayPassword);
      showToast('অ্যাডমিন লগইন সফল হয়েছে!', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'অবৈধ অ্যাডমিন ক্রেডেনশিয়াল', 'error');
    } finally {
      setGatewayLoading(false);
    }
  };

  // -------------------------------------------------------------
  // ACTION HANDLERS
  // -------------------------------------------------------------

  // Review task submission (Approve / Reject)
  const handleReviewSubmission = async (submissionId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetchApi<{ message: string }>(`/admin/submissions/${submissionId}/review`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      showToast(res.message || 'টাস্ক সাবমিশন পর্যালোচনা সম্পন্ন হয়েছে।', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'পর্যালোচনা ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Review Social Account Sale (Approve / Reject)
  const handleReviewSocialSale = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      const res = await fetchApi<{ message: string }>(`/admin/social-sales/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, rejectionReason: reason }),
      });
      showToast(res.message || 'সোশ্যাল অ্যাকাউন্ট সেল পর্যালোচনা সম্পন্ন হয়েছে।', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'পর্যালোচনা ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Save/Update Social Job Configuration
  const handleSaveSocialJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSocialJob) return;
    try {
      setSocialJobSaving(true);
      const res = await fetchApi<{ message: string; data: any }>('/admin/social-jobs/update', {
        method: 'POST',
        body: JSON.stringify(editingSocialJob),
      });
      showToast(res.message || 'সোশ্যাল কাজ সফলভাবে আপডেট হয়েছে', 'success');
      setShowSocialJobModal(false);
      setEditingSocialJob(null);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'আপডেট ব্যর্থ হয়েছে', 'error');
    } finally {
      setSocialJobSaving(false);
    }
  };

  // Create/Publish New Social Job & Optionally Linked Micro-Task
  const handleCreateNewSocialJobAndTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSocialJobSaving(true);
      // 1. Update social job config (rates, password, etc.)
      await fetchApi('/admin/social-jobs/update', {
        method: 'POST',
        body: JSON.stringify({
          service: newSocialJobForm.service,
          title: newSocialJobForm.title || `${newSocialJobForm.service.toUpperCase()} Service Job`,
          rate: Number(newSocialJobForm.rate),
          dailyLimit: Number(newSocialJobForm.dailyLimit),
          reportTime: newSocialJobForm.reportTime,
          todayPassword: newSocialJobForm.todayPassword,
          usernameTemplate: newSocialJobForm.usernameTemplate,
          active: newSocialJobForm.active,
          tutorialUrl: newSocialJobForm.tutorialUrl,
          notes: newSocialJobForm.notes,
        }),
      });

      // 2. Optionally create micro-task if selected
      if (newSocialJobForm.createMicroTaskToo) {
        await fetchApi('/admin/tasks', {
          method: 'POST',
          body: JSON.stringify({
            title: newSocialJobForm.title || `${newSocialJobForm.service.toUpperCase()} অ্যাকাউন্ট তৈরি ও সাবমিট কাজ`,
            description: newSocialJobForm.notes || `নতুন অ্যাকাউন্ট তৈরি করুন এবং পাসওয়ার্ড "${newSocialJobForm.todayPassword}" দিয়ে সাবমিট করুন। প্রতি কাজে ৳${newSocialJobForm.rate} টাকা।`,
            category: newSocialJobForm.service,
            rewardAmount: Number(newSocialJobForm.rate),
            taskType: 'manual',
            proofType: 'link_or_text',
            proofInstruction: `${newSocialJobForm.service === 'gmail' ? 'জিমেইল এড্রেস' : newSocialJobForm.service === 'facebook' ? 'ফেসবুক ইউআইডি' : 'ইনস্টাগ্রাম ইউজারনেম'} এবং ব্যবহৃত পাসওয়ার্ড দিন।`,
            dailyLimit: Number(newSocialJobForm.dailyLimit) || 10,
          }),
        });
      }

      showToast('নতুন সোশ্যাল কাজ ও সার্ভিস সফলভাবে যোগ করা হয়েছে!', 'success');
      setNewSocialJobForm({
        service: 'gmail',
        title: '',
        rate: 14.0,
        dailyLimit: 1000,
        reportTime: '15-30 hours',
        todayPassword: 'sgwteam1@21A',
        usernameTemplate: 'sgw',
        active: true,
        tutorialUrl: '',
        notes: '',
        createMicroTaskToo: true,
      });
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'কাজ যোগ করতে ব্যর্থ হয়েছে', 'error');
    } finally {
      setSocialJobSaving(false);
    }
  };

  // 1-Click Publish Social Job to Micro-tasks
  const handlePublishJobToTasks = async (job: SocialJobConfig) => {
    try {
      await fetchApi('/admin/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: `${job.title} - নতুন কাজ`,
          description: job.notes || `${job.service.toUpperCase()} সার্ভিস কাজ। পাসওয়ার্ড "${job.todayPassword || 'দেয়া পাসওয়ার্ড'}" দিয়ে সাবমিট করে ৳${job.rate} টাকা আয় করুন।`,
          category: job.service,
          rewardAmount: Number(job.rate),
          taskType: 'manual',
          proofType: 'link_or_text',
          proofInstruction: 'আপনার তৈরি অ্যাকাউন্ট আইডি / ইমেইল এবং পাসওয়ার্ড প্রদান করুন।',
          dailyLimit: 10,
        }),
      });
      showToast(`${job.title} মাইক্রো-টাস্ক তালিকায় নতুন কাজ হিসেবে যোগ হয়েছে!`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'টাস্ক যোগ ব্যর্থ হয়েছে', 'error');
    }
  };

  // Generate 1000 Tasks for a Social Service
  const handleGenerate1000Tasks = async (
    service: 'gmail' | 'facebook' | 'instagram',
    customRate?: number,
    customPassword?: string
  ) => {
    try {
      setGeneratingQueueService(service);
      const res = await fetchApi<{ message: string; generatedCount: number }>(
        '/admin/social-tasks/generate-1000',
        {
          method: 'POST',
          body: JSON.stringify({
            service,
            count: 1000,
            rate: customRate,
            todayPassword: customPassword,
          }),
        }
      );
      showToast(res.message || `${service.toUpperCase()} সার্ভিসে ১০০০টি নতুন কাজ তৈরি হয়েছে!`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || '১০০০ কাজ তৈরি করতে ব্যর্থ হয়েছে', 'error');
    } finally {
      setGeneratingQueueService(null);
    }
  };

  // Delete / Remove individual social task from queue
  const handleDeleteSocialTask = async (taskId: string) => {
    try {
      await fetchApi(`/admin/social-tasks/${taskId}`, { method: 'DELETE' });
      showToast('টাস্ক কিউ থেকে মুছে ফেলা হয়েছে', 'info');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'মুছে ফেলতে ব্যর্থ হয়েছে', 'error');
    }
  };

  // Mark Withdrawal as Paid
  const handleConfirmPaidWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawalForPaid) return;

    try {
      const res = await fetchApi<{ message: string }>(
        `/admin/withdrawals/${selectedWithdrawalForPaid.id}/review`,
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'mark_paid',
            adminNote: paymentTrxId.trim() ? `TrxID: ${paymentTrxId.trim()}` : 'পেমেন্ট সম্পন্ন',
          }),
        }
      );
      showToast(res.message || 'উইথড্রয়াল পরিশোধিত হিসেবে চিহ্নিত হয়েছে।', 'success');
      setSelectedWithdrawalForPaid(null);
      setPaymentTrxId('');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'উইথড্রয়াল প্রসেসিং ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Reject Withdrawal with automatic refund
  const handleConfirmRejectWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawalForReject) return;

    try {
      const res = await fetchApi<{ message: string }>(
        `/admin/withdrawals/${selectedWithdrawalForReject.id}/review`,
        {
          method: 'POST',
          body: JSON.stringify({
            action: 'reject',
            adminNote: rejectReason.trim() || 'অ্যাকাউন্ট তথ্যে ভুল / নিয়ম লঙ্ঘন',
          }),
        }
      );
      showToast(res.message || 'উইথড্রয়াল বাতিল ও টাকা ইউজারের অ্যাকাউন্টে রিফান্ড করা হয়েছে।', 'success');
      setSelectedWithdrawalForReject(null);
      setRejectReason('');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'উইথড্রয়াল বাতিল ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi<{ message: string }>('/admin/tasks', {
        method: 'POST',
        body: JSON.stringify(newTask),
      });
      showToast(res.message || 'নতুন টাস্ক সফলভাবে তৈরি হয়েছে!', 'success');
      setShowNewTaskModal(false);
      setNewTask({
        title: '',
        description: '',
        rewardAmount: 10,
        dailyLimit: 1,
        category: 'telegram',
        taskType: 'manual',
        proofType: 'screenshot_and_username',
        targetUrl: '',
        proofInstruction: '',
      });
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'টাস্ক তৈরি ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Toggle Task Status (Active / Paused)
  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus = task.status === 'active' ? 'paused' : 'active';
    try {
      await fetchApi(`/admin/tasks/${task.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });
      showToast(`টাস্ক স্ট্যাটাস ${nextStatus === 'active' ? 'সক্রিয়' : 'স্থগিত'} করা হয়েছে।`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'স্ট্যাটাস পরিবর্তনে ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Open Edit Task Modal
  const handleOpenEditTask = (task: Task) => {
    setEditingTask({ ...task });
    setShowEditTaskModal(true);
  };

  // Save Edited Task & Reward Amount
  const handleSaveEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    if (!editingTask.title || !editingTask.description || editingTask.rewardAmount <= 0) {
      showToast('অনুগ্রহ করে সঠিক শিরোনাম, বর্ণনা ও রিওয়ার্ড প্রদান করুন।', 'error');
      return;
    }

    try {
      await fetchApi(`/admin/tasks/${editingTask.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          category: editingTask.category,
          rewardAmount: Number(editingTask.rewardAmount),
          dailyLimit: Number(editingTask.dailyLimit) || 1,
          taskType: editingTask.taskType,
          proofType: editingTask.proofType,
          targetUrl: editingTask.targetUrl || '',
          proofInstruction: editingTask.proofInstruction || '',
          status: editingTask.status,
        }),
      });
      showToast('টাস্ক ও রিওয়ার্ড সফলভাবে আপডেট করা হয়েছে!', 'success');
      setShowEditTaskModal(false);
      setEditingTask(null);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'টাস্ক আপডেট ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Duplicate Task
  const handleDuplicateTask = async (task: Task) => {
    try {
      await fetchApi(`/admin/tasks/${task.id}/duplicate`, { method: 'POST' });
      showToast(`'${task.title}' এর একটি কপি সফলভাবে তৈরি হয়েছে!`, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'টাস্ক কপি করতে ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Archive / Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে এই টাস্কটি মুছে বা আর্কাইভ করতে চান?')) return;
    try {
      await fetchApi(`/admin/tasks/${taskId}`, { method: 'DELETE' });
      showToast('টাস্ক আর্কাইভ করা হয়েছে।', 'info');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'টাস্ক মুছে ফেলা যায়নি।', 'error');
    }
  };

  // Permanent Delete Task
  const handlePermanentDeleteTask = async (taskId: string) => {
    if (!confirm('সতর্কতা: এই টাস্কটি ডাটাবেজ থেকে স্থায়ীভাবে মুছে ফেলা হবে। আপনি কি নিশ্চিত?')) return;
    try {
      await fetchApi(`/admin/tasks/${taskId}?permanent=true`, { method: 'DELETE' });
      showToast('টাস্ক স্থায়ীভাবে মুছে ফেলা হয়েছে।', 'info');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'টাস্ক স্থায়ীভাবে মুছে ফেলা যায়নি।', 'error');
    }
  };

  // Clear All Tasks
  const handleClearAllTasks = async () => {
    if (!confirm('সতর্কতা: আপনি কি নিশ্চিত যে সমস্ত টাস্ক মুছে ডাটাবেজ খালি করতে চান? এটি করার পর আপনি সম্পূর্ণ নতুনভাবে ম্যানুয়ালি কাজ যুক্ত করতে পারবেন।')) return;
    try {
      const res = await fetchApi<{ message: string }>('/admin/tasks/clear-all', { method: 'POST' });
      showToast(res.message || 'সকল টাস্ক মুছে ফেলা হয়েছে।', 'info');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'টাস্ক মুছতে সমস্যা হয়েছে।', 'error');
    }
  };

  // Adjust User Balance (+/-)
  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const amt = parseFloat(balanceAmount);
    if (isNaN(amt) || amt <= 0) {
      showToast('সঠিক টাকার পরিমাণ দিন।', 'error');
      return;
    }

    try {
      const res = await fetchApi<{ message: string }>(`/admin/users/${selectedUser.id}/balance`, {
        method: 'POST',
        body: JSON.stringify({
          amount: amt,
          type: balanceType,
          reason: balanceReason || 'অ্যাডমিন ব্যালেন্স সমন্বয়',
        }),
      });
      showToast(res.message || 'ব্যালেন্স সমন্বয় সফল হয়েছে।', 'success');
      setSelectedUser(null);
      setBalanceAmount('');
      setBalanceReason('');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'ব্যালেন্স সমন্বয় ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Toggle User Status (Active / Suspended)
  const handleToggleUserStatus = async (u: EnrichedUser) => {
    try {
      const res = await fetchApi<{ message: string }>(`/admin/users/${u.id}/toggle-status`, {
        method: 'POST',
      });
      showToast(res.message || 'ইউজার স্ট্যাটাস পরিবর্তন হয়েছে।', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'স্ট্যাটাস পরিবর্তনে ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Support ticket real-time polling
  useEffect(() => {
    if (activeTab !== 'support' || !isAdmin) return;

    const pollAdminTickets = async () => {
      try {
        const tktData = await fetchApi<SupportTicket[]>('/admin/support/tickets');
        if (Array.isArray(tktData)) {
          setTickets(tktData);
        }
      } catch {
        // silent
      }
    };

    const interval = setInterval(pollAdminTickets, 3000);
    return () => clearInterval(interval);
  }, [activeTab, isAdmin]);

  // Auto select first ticket if none selected
  useEffect(() => {
    if (activeTab === 'support' && tickets.length > 0 && !selectedChatTicketId) {
      setSelectedChatTicketId(tickets[0].id);
    }
  }, [activeTab, tickets, selectedChatTicketId]);

  // Scroll to bottom of admin chat when ticket or messages change
  useEffect(() => {
    if (selectedChatTicketId) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChatTicketId, tickets]);

  // Send admin chat message
  const handleSendAdminChatMessage = async (ticketId: string, textOverride?: string) => {
    const textToSend = (textOverride !== undefined ? textOverride : adminChatText).trim();
    if (!textToSend || !ticketId) return;

    try {
      setAdminSendingChat(true);
      const res = await fetchApi<{ message: string; ticket: SupportTicket }>(`/admin/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply: textToSend, status: 'answered' }),
      });

      setAdminChatText('');
      showToast(res.message || 'মেসেজ পাঠানো হয়েছে!', 'success');

      if (res.ticket) {
        setTickets((prev) => prev.map((t) => (t.id === res.ticket.id ? { ...t, ...res.ticket } : t)));
      } else {
        await loadData();
      }

      setTimeout(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      showToast(err.message || 'রিপ্লাই পাঠাতে ব্যর্থ হয়েছে।', 'error');
    } finally {
      setAdminSendingChat(false);
    }
  };

  // Change ticket status
  const handleChangeTicketStatus = async (ticketId: string, status: 'open' | 'answered' | 'closed') => {
    try {
      const res = await fetchApi<{ message: string; ticket: SupportTicket }>(`/admin/tickets/${ticketId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      showToast(res.message || 'টিকিট স্ট্যাটাস পরিবর্তন হয়েছে।', 'success');
      if (res.ticket) {
        setTickets((prev) => prev.map((t) => (t.id === res.ticket.id ? { ...t, ...res.ticket } : t)));
      } else {
        await loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Reply to support ticket (Legacy/quick method)
  const handleReplyTicket = async (ticketId: string) => {
    if (!ticketReplyText.trim()) return;
    try {
      const res = await fetchApi<{ message: string }>(`/admin/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply: ticketReplyText.trim() }),
      });
      showToast(res.message || 'সাপোর্ট রিপ্লাই পাঠানো হয়েছে।', 'success');
      setReplyTicketId(null);
      setTicketReplyText('');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'সাপোর্ট রিপ্লাই ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Open Assign/Edit Role Modal for a User
  const handleOpenAssignRoleModal = (u: EnrichedUser) => {
    setSelectedUserForRole(u);
    const existingRole = adminRolesList.find((r) => r.userId === u.id);
    if (existingRole) {
      setRoleFormTitle(existingRole.title || (existingRole.isSuperAdmin ? 'সুপার অ্যাডমিন' : 'সাব-অ্যাডমিন / মডারেটর'));
      setRoleFormIsSuper(Boolean(existingRole.isSuperAdmin));
      setRoleFormPermissions({ ...existingRole.permissions });
    } else {
      setRoleFormTitle('সাব-অ্যাডমিন / মডারেটর');
      setRoleFormIsSuper(false);
      setRoleFormPermissions({
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
      });
    }
    setShowRoleModal(true);
  };

  // Quick Preset Role Selection
  const handleApplyRolePreset = (preset: 'super' | 'moderator' | 'finance' | 'support' | 'custom') => {
    if (preset === 'super') {
      setRoleFormTitle('সুপার অ্যাডমিন (Full Control)');
      setRoleFormIsSuper(true);
      setRoleFormPermissions({
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
      });
    } else if (preset === 'moderator') {
      setRoleFormTitle('টাস্ক ও প্রুফ মডারেটর');
      setRoleFormIsSuper(false);
      setRoleFormPermissions({
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
      });
    } else if (preset === 'finance') {
      setRoleFormTitle('উইথড্র ও ফাইন্যান্স অফিসার');
      setRoleFormIsSuper(false);
      setRoleFormPermissions({
        canManageTasks: false,
        canReviewTaskProofs: false,
        canManageSocialJobs: false,
        canReviewSocialSubmissions: false,
        canManageWithdrawals: true,
        canManageUsers: true,
        canManageSupport: false,
        canEditSiteSettings: false,
        canViewAuditLogs: true,
        canManageAdmins: false,
      });
    } else if (preset === 'support') {
      setRoleFormTitle('কাস্টমার সাপোর্ট এজেন্ট');
      setRoleFormIsSuper(false);
      setRoleFormPermissions({
        canManageTasks: false,
        canReviewTaskProofs: false,
        canManageSocialJobs: false,
        canReviewSocialSubmissions: false,
        canManageWithdrawals: false,
        canManageUsers: false,
        canManageSupport: true,
        canEditSiteSettings: false,
        canViewAuditLogs: false,
        canManageAdmins: false,
      });
    }
  };

  // Save Role Assignment API
  const handleSaveRoleAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRole) return;

    try {
      setSavingRole(true);
      const res = await fetchApi<{ message: string }>('/admin/roles/assign', {
        method: 'POST',
        body: JSON.stringify({
          userId: selectedUserForRole.id,
          title: roleFormTitle,
          isSuperAdmin: roleFormIsSuper,
          permissions: roleFormPermissions,
        }),
      });
      showToast(res.message || 'অ্যাডমিন পারমিশন ও রোল সফলভাবে আপডেট হয়েছে!', 'success');
      setShowRoleModal(false);
      setSelectedUserForRole(null);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'পারমিশন সেভ করতে ব্যর্থ হয়েছে', 'error');
    } finally {
      setSavingRole(false);
    }
  };

  // Revoke Admin Access API
  const handleRevokeAdminAccess = async (userId: string, userEmail: string) => {
    if (userEmail.toLowerCase() === 'fahim236455@gmail.com') {
      showToast('মূল সুপার অ্যাডমিনের রোল সরানো যাবে না', 'error');
      return;
    }
    if (!confirm(`আপনি কি নিশ্চিত যে ${userEmail} এর অ্যাডমিন পারমিশন বাতিল করতে চান?`)) return;

    try {
      const res = await fetchApi<{ message: string }>('/admin/roles/revoke', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      showToast(res.message || 'অ্যাডমিন পারমিশন বাতিল করা হয়েছে', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'অ্যাক্সেস প্রত্যাহার ব্যর্থ হয়েছে', 'error');
    }
  };

  // Delete User handler
  const handleDeleteUser = async (u: EnrichedUser) => {
    if (u.email.toLowerCase() === 'fahim236455@gmail.com') {
      showToast('প্রতিষ্ঠাতা সুপার অ্যাডমিন একাউন্ট মোছা সম্ভব নয়।', 'error');
      return;
    }

    if (!window.confirm(`আপনি কি নিশ্চিত যে "${u.fullName}"-এর একাউন্ট এবং তার সমস্ত ডাটা মুছে ফেলতে চান?`)) {
      return;
    }

    try {
      const res = await fetchApi<{ message: string }>(`/admin/users/${u.id}`, {
        method: 'DELETE',
      });
      showToast(res.message || 'ব্যবহারকারী মুছে ফেলা হয়েছে', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'ইউজার মোছা সম্ভব হয়নি।', 'error');
    }
  };

  // Save Site Settings
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settingsForm) return;
    try {
      const res = await fetchApi<{ message: string }>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(settingsForm),
      });
      showToast(res.message || 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!', 'success');
      await refreshSettings();
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'সেটিংস আপডেট ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Instant Toggle for Popup Notice
  const handleTogglePopupNotice = async () => {
    if (!settingsForm) return;
    const newEnabled = !settingsForm.popupNotice?.enabled;
    const updated = {
      ...settingsForm,
      popupNotice: {
        enabled: newEnabled,
        title: settingsForm.popupNotice?.title || 'জরুরি বিজ্ঞপ্তি',
        message: settingsForm.popupNotice?.message || 'সকল ইউজারদের অবগতির জন্য জানানো যাচ্ছে যে কাজ সঠিকভাবে সম্পন্ন করুন।',
      },
    };
    setSettingsForm(updated);
    try {
      const res = await fetchApi<{ message: string }>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(updated),
      });
      showToast(newEnabled ? 'পপ-আপ নোটিশ সক্রিয় (ON) করা হয়েছে!' : 'পপ-আপ নোটিশ নিষ্ক্রিয় (OFF) করা হয়েছে!', 'success');
      await refreshSettings();
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'পপ-আপ নোটিশ আপডেট ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Instant Toggle for Maintenance Mode
  const handleToggleMaintenanceMode = async () => {
    if (!settingsForm) return;
    const newEnabled = !settingsForm.maintenanceMode?.enabled;
    const updated = {
      ...settingsForm,
      maintenanceMode: {
        enabled: newEnabled,
        message: settingsForm.maintenanceMode?.message || 'সিস্টেম আপগ্রেডের কাজ চলছে, কিছুক্ষণ পর আবার চেষ্টা করুন।',
      },
    };
    setSettingsForm(updated);
    try {
      const res = await fetchApi<{ message: string }>('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(updated),
      });
      showToast(newEnabled ? 'সিস্টেম মেইনটেন্যান্স মোড সক্রিয় (ON) করা হয়েছে!' : 'মেইনটেন্যান্স মোড বন্ধ (স্বাভাবিক চালু) করা হয়েছে!', 'success');
      await refreshSettings();
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'মেইনটেন্যান্স মোড আপডেট ব্যর্থ হয়েছে।', 'error');
    }
  };

  // Change Super Admin Password
  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPasswordForm.newPassword || adminPasswordForm.newPassword.length < 6) {
      showToast('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।', 'error');
      return;
    }
    if (adminPasswordForm.newPassword !== adminPasswordForm.confirmNewPassword) {
      showToast('নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মিলছে না।', 'error');
      return;
    }

    try {
      setAdminPasswordLoading(true);
      const res = await fetchApi<{ message: string }>('/admin/change-password', {
        method: 'POST',
        body: JSON.stringify(adminPasswordForm),
      });
      showToast(res.message || 'অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!', 'success');
      setAdminPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err: any) {
      showToast(err.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।', 'error');
    } finally {
      setAdminPasswordLoading(false);
    }
  };

  // Add FAQ Item
  const handleAddFaq = () => {
    if (!newFaqForm.question.trim() || !newFaqForm.answer.trim()) {
      showToast('প্রশ্ন এবং উত্তর উভয়ই লিখুন।', 'error');
      return;
    }
    if (!settingsForm) return;

    const currentFaqs = settingsForm.faqs || [];
    const newFaqItem = {
      id: `faq_${Date.now()}`,
      question: newFaqForm.question.trim(),
      answer: newFaqForm.answer.trim(),
    };

    setSettingsForm({
      ...settingsForm,
      faqs: [...currentFaqs, newFaqItem],
    });
    setNewFaqForm({ question: '', answer: '' });
    showToast('নতুন FAQ যুক্ত হয়েছে! সংরক্ষণ করতে নিচে "সেটিংস সংরক্ষণ করুন" চাপুন।', 'info');
  };

  // Delete FAQ Item
  const handleDeleteFaq = (index: number) => {
    if (!settingsForm) return;
    const currentFaqs = [...(settingsForm.faqs || [])];
    currentFaqs.splice(index, 1);
    setSettingsForm({
      ...settingsForm,
      faqs: currentFaqs,
    });
    showToast('FAQ টি মুছে ফেলা হয়েছে! সংরক্ষণ করতে নিচে "সেটিংস সংরক্ষণ করুন" চাপুন।', 'info');
  };

  // Cloud Database Actions (Firebase Firestore)
  const handlePushToCloud = async () => {
    try {
      setCloudSyncLoading(true);
      const res = await fetchApi<{ success: boolean; message: string }>('/admin/cloud-sync/push', {
        method: 'POST',
      });
      showToast(res.message || 'বর্তমান ডেটাবেস সফলভাবে ক্লাউডে আপলোড হয়েছে!', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'ক্লাউড আপলোড ব্যর্থ হয়েছে।', 'error');
    } finally {
      setCloudSyncLoading(false);
    }
  };

  const handlePullFromCloud = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে ক্লাউড ফায়ারস্টোর থেকে সর্বশেষ ইউজার ও ডেটা রিস্টোর করতে চান?')) return;
    try {
      setCloudSyncLoading(true);
      const res = await fetchApi<{ success: boolean; message: string }>('/admin/cloud-sync/pull', {
        method: 'POST',
      });
      showToast(res.message || 'ক্লাউড থেকে সফলভাবে ডেটা রিস্টোর করা হয়েছে!', 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'ক্লাউড রিস্টোর ব্যর্থ হয়েছে।', 'error');
    } finally {
      setCloudSyncLoading(false);
    }
  };

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    if (!u) return false;
    const s = userSearch.toLowerCase().trim();
    if (!s) return true;
    const fullName = (u.fullName || '').toLowerCase();
    const phone = (u.phoneNumber || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const refCode = (u.referralCode || '').toLowerCase();
    return fullName.includes(s) || phone.includes(s) || email.includes(s) || refCode.includes(s);
  });

  const filteredSubmissions = submissions.filter((s) => {
    if (subFilter === 'all') return true;
    return s.status === subFilter;
  });

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (withFilter === 'all') return true;
    return w.status === withFilter;
  });

  // -------------------------------------------------------------
  // NON-ADMIN GATEWAY VIEW (Restricted to Authorized Admins Only)
  // -------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center px-4 py-8 max-w-md mx-auto">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 font-black text-2xl shadow-lg shadow-rose-950/40">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            অননুমোদিত প্রবেশাধিকার সংরক্ষিত
          </h1>
          <div className="inline-block bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            403 Forbidden • কেবল অ্যাডমিনদের জন্য
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            সাধারণ ব্যবহারকারীরা অ্যাডমিন প্যানেল এক্সেস করতে পারবেন না। প্ল্যাটফর্ম পরিচালনার জন্য আপনার বৈধ অ্যাডমিন ইমেইল ও সিকিউরিটি পাসওয়ার্ড প্রদান করুন।
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-4">
          {user && (
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">বর্তমান অ্যাকাউন্ট</span>
                <span className="font-semibold text-slate-200">{user.fullName || user.email}</span>
                <span className="text-[10px] text-amber-400 block font-medium">সাধারণ ইউজার (অ্যাডমিন অধিকার নেই)</span>
              </div>
              <button
                onClick={() => onNavigate('dashboard')}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                ড্যাশবোর্ডে যান
              </button>
            </div>
          )}

          {/* Secure Admin Credentials Form */}
          <form onSubmit={handleCustomAdminLogin} className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">অ্যাডমিন ইমেইল ঠিকানা:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={gatewayEmail}
                  onChange={(e) => setGatewayEmail(e.target.value)}
                  placeholder="admin@fahimpaybd.com"
                  className="w-full text-xs font-medium pl-9 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 block">অ্যাডমিন সিকিউরিটি পাসওয়ার্ড:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={gatewayPassword}
                  onChange={(e) => setGatewayPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs font-medium pl-9 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={gatewayLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{gatewayLoading ? 'যাচাই করা হচ্ছে...' : 'অ্যাডমিন প্যানেলে লগইন করুন'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 py-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ইউজার ড্যাশবোর্ডে ফিরে যান</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // FULL ADMIN CONTROL PANEL VIEW
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24">
      {/* Admin Top Sticky Bar */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-30 px-4 py-3 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="ইউজার ড্যাশবোর্ডে ফিরে যান"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="relative">
              <Logo size={32} />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full flex items-center justify-center text-[8px] text-slate-950 font-bold border border-slate-900">
                ★
              </span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="font-sans font-black text-amber-400">EARNORA</span>
                <span className="text-slate-200">কন্ট্রোল সেন্টার</span>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded border border-amber-500/30 font-mono">
                  SUPER ADMIN
                </span>
              </h1>
              <p className="text-[10px] text-slate-400">
                অ্যাডমিন: {user?.fullName || user?.email || 'Admin'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="hidden sm:flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1.5 rounded-lg border border-slate-700 font-semibold"
            >
              <span>ইউজার মোড</span>
            </button>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Horizontal Scroll */}
        <div className="max-w-4xl mx-auto mt-3 flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'overview', label: 'ওভারভিউ', icon: Activity },
            {
              id: 'social_jobs',
              label: `সোশ্যাল কাজ (Gmail/FB/Insta)`,
              icon: Mail,
              perm: 'canManageSocialJobs'
            },
            {
              id: 'social_sales',
              label: `সোশ্যাল সেল রিভিউ (${socialSales.filter((s) => s.status === 'pending').length})`,
              icon: Share2,
              perm: 'canReviewSocialSubmissions'
            },
            { id: 'tasks', label: `ম্যানুয়াল টাস্ক তৈরি ও লিস্ট (${tasks.length})`, icon: Plus, perm: 'canManageTasks' },
            {
              id: 'submissions',
              label: `টাস্ক রিভিউ ও অনুমোদন (${submissions.filter((s) => s.status === 'pending').length})`,
              icon: CheckSquare,
              perm: 'canReviewTaskProofs'
            },
            {
              id: 'withdrawals',
              label: `উইথড্রয়াল (${withdrawals.filter((w) => w.status === 'pending').length})`,
              icon: ArrowDownCircle,
              perm: 'canManageWithdrawals'
            },
            { id: 'users', label: `ইউজার্স (${users.length})`, icon: Users, perm: 'canManageUsers' },
            {
              id: 'support',
              label: `সাপোর্ট (${tickets.filter((t) => t.status === 'open').length})`,
              icon: Headphones,
              perm: 'canManageSupport'
            },
            { id: 'roles', label: `অ্যাডমিন ও রোলস (${adminRolesList.length || 1})`, icon: ShieldCheck, perm: 'canManageAdmins' },
            { id: 'settings', label: 'সেটিংস', icon: Settings, perm: 'canEditSiteSettings' },
            { id: 'audit', label: 'অডিট লগ', icon: DollarSign, perm: 'canViewAuditLogs' },
          ].filter(tab => {
            if (!tab.perm) return true;
            if (user?.isSuperAdmin) return true;
            return (user?.adminPermissions as any)?.[tab.perm];
          }).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* ========================================================= */}
        {/* 1. OVERVIEW TAB */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div 
                onClick={() => setActiveTab('users')}
                className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 shadow-xs cursor-pointer hover:border-blue-500/50 transition-all group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs group-hover:text-blue-300 transition-colors">মোট ইউজার</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white">
                  {stats?.totalUsers ?? users.length} <span className="text-xs font-normal text-slate-400">জন</span>
                </div>
                <p className="text-[10px] text-emerald-400 mt-1">
                  সক্রিয়: {stats?.activeUsers ?? users.filter((u) => u.status === 'active').length} জন
                </p>
              </div>

              <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs">পেন্ডিং উইথড্র</span>
                  <ArrowDownCircle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400">
                  {withdrawals.filter((w) => w.status === 'pending').length} <span className="text-xs font-normal text-slate-400">টি</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  টাকা: ৳{withdrawals.filter((w) => w.status === 'pending').reduce((s, w) => s + w.amount, 0).toFixed(2)}
                </p>
              </div>

              <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs">পেন্ডিং টাস্ক</span>
                  <CheckSquare className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-2xl font-black text-sky-400">
                  {submissions.filter((s) => s.status === 'pending').length} <span className="text-xs font-normal text-slate-400">টি</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">অনুমোদনের অপেক্ষায়</p>
              </div>

              <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-1">
                  <span className="text-xs">মোট পরিশোধিত</span>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  ৳{(stats?.totalWithdrawn ?? withdrawals.filter((w) => w.status === 'paid').reduce((s, w) => s + w.netAmount, 0)).toFixed(2)}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">সফল ক্যাশআউট</p>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                জরুরি নিয়ন্ত্রণ ও শর্টকাট
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => {
                    setActiveTab('submissions');
                    setSubFilter('pending');
                  }}
                  className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 p-3 rounded-xl text-left flex items-center justify-between group transition-colors"
                >
                  <div>
                    <span className="font-bold block">টাস্ক প্রমাণ যাচাই</span>
                    <span className="text-[11px] opacity-80">
                      {submissions.filter((s) => s.status === 'pending').length}টি রিভিউ বাকি
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('withdrawals');
                    setWithFilter('pending');
                  }}
                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 p-3 rounded-xl text-left flex items-center justify-between group transition-colors"
                >
                  <div>
                    <span className="font-bold block">উইথড্র ক্যাশআউট প্রদান</span>
                    <span className="text-[11px] opacity-80">
                      {withdrawals.filter((w) => w.status === 'pending').length}টি পেমেন্ট বাকি
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('tasks');
                    setShowNewTaskModal(true);
                  }}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 p-3 rounded-xl text-left flex items-center justify-between group transition-colors"
                >
                  <div>
                    <span className="font-bold block">নতুন টাস্ক তৈরি</span>
                    <span className="text-[11px] opacity-80">+ অ্যাড মাইক্রো-টাস্ক</span>
                  </div>
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            {/* System Status & Reserves Card */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ব্যবহারকারীদের মোট সংরক্ষিত ব্যালেন্স:</span>
                  <span className="text-base font-bold text-white font-mono">
                    ৳{(stats?.totalBalance ?? users.reduce((s, u) => s + u.balance, 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-800 text-[11px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  সার্ভার ইঞ্জিন অনলাইন
                </span>
                <span className="inline-flex items-center gap-1 bg-slate-900 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700 text-[11px]">
                  SSL সুরক্ষিত
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. SUBMISSIONS REVIEW TAB */}
        {/* ========================================================= */}
        {activeTab === 'submissions' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-white">টাস্ক সাবমিশন ও প্রুফ রিভিউ</h2>
                <p className="text-[11px] text-slate-400">ব্যবহারকারীদের দাখিলকৃত কাজের সত্যতা যাচাই করে অর্থ অনুমোদন করুন</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                {(['pending', 'approved', 'rejected', 'all'] as const).map((tabKey) => (
                  <button
                    key={tabKey}
                    onClick={() => setSubFilter(tabKey)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      subFilter === tabKey ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tabKey === 'pending'
                      ? `পেন্ডিং (${submissions.filter((s) => s.status === 'pending').length})`
                      : tabKey === 'approved'
                      ? 'অনুমোদিত'
                      : tabKey === 'rejected'
                      ? 'বাতিল'
                      : 'সকল'}
                  </button>
                ))}
              </div>
            </div>

            {filteredSubmissions.length === 0 ? (
              <div className="bg-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-700">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
                <p className="font-bold text-white">কোনো সাবমিশন পাওয়া যায়নি</p>
                <p className="text-[11px] text-slate-400 mt-0.5">নির্বাচিত ফিল্টারে এই মুহূর্তে কোনো টাস্ক অপেক্ষমাণ নেই।</p>
              </div>
            ) : (
              filteredSubmissions.map((sub) => {
                const isProofUrl = sub.proofData.startsWith('http://') || sub.proofData.startsWith('https://');

                return (
                  <div
                    key={sub.id}
                    className="bg-slate-800 rounded-2xl p-4 border border-slate-700/90 shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                          আইডি: #{sub.id.slice(0, 8)}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{sub.taskTitle || 'মাইক্রো-টাস্ক'}</h4>
                        <p className="text-slate-300 text-xs mt-0.5">
                          সদস্য: <strong className="text-amber-300">{sub.userFullName || 'সদস্য'}</strong>{' '}
                          <span className="text-slate-400 font-mono">({sub.userPhone || sub.userEmail})</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-emerald-400 block font-mono">
                          +৳{sub.rewardAmount.toFixed(2)}
                        </span>
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md mt-1 ${
                            sub.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : sub.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {sub.status === 'approved' ? '✓ অনুমোদিত' : sub.status === 'rejected' ? '✕ বাতিল' : '⏳ পেন্ডিং'}
                        </span>
                      </div>
                    </div>

                    {/* Task Info Box */}
                    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800 space-y-1.5 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        টাস্কের বিস্তারিত (Task Details):
                      </span>
                      <p className="text-slate-300 text-xs">{sub.taskDescription || 'কোনো বিবরণ নেই'}</p>
                      {sub.taskTargetUrl && (
                        <div className="pt-1">
                          <a href={sub.taskTargetUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300 text-[11px] inline-flex items-center gap-1 font-mono break-all">
                            <ExternalLink className="w-3 h-3" />
                            {sub.taskTargetUrl}
                          </a>
                        </div>
                      )}
                      {sub.taskProofInstruction && (
                        <p className="text-[10px] text-slate-400 mt-1 italic border-l-2 border-slate-700 pl-2">
                          নির্দেশনা: {sub.taskProofInstruction}
                        </p>
                      )}
                    </div>

                    {/* Proof Box */}
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-700/80 space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        ব্যবহারকারীর প্রমাণ তথ্য (Proof Submission):
                      </span>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-mono text-amber-200 text-xs break-all select-all">
                          {sub.proofData}
                        </p>
                        {isProofUrl && (
                          <a
                            href={sub.proofData}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-600 flex items-center gap-1 shrink-0"
                          >
                            <span>প্রমাণ লিংক খুলুন</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {/* Screenshot Proof Preview if available */}
                      {sub.screenshot && (
                        <div className="mt-2 pt-2 border-t border-slate-800">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <Camera className="w-3.5 h-3.5" />
                              <span>আপলোডকৃত কাজের স্ক্রিনশট (Screenshot Proof):</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedScreenshotUrl(sub.screenshot || null)}
                              className="text-[10px] font-bold text-amber-300 hover:text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 transition-colors"
                            >
                              বড় করে দেখুন
                            </button>
                          </div>
                          <div
                            onClick={() => setSelectedScreenshotUrl(sub.screenshot || null)}
                            className="relative cursor-pointer group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-w-sm"
                          >
                            <img
                              src={sub.screenshot}
                              alt="User submission screenshot"
                              className="w-full max-h-48 object-contain bg-slate-950 group-hover:scale-102 transition-transform"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-bold text-xs">
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              <span>সম্পূর্ণ স্ক্রিনশট দেখুন (Click to Zoom)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
                      <span>দাখিল: {new Date(sub.createdAt).toLocaleString('bn-BD')}</span>
                    </div>

                    {/* Action Buttons for Pending */}
                    {sub.status === 'pending' && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleReviewSubmission(sub.id, 'approve')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-98"
                        >
                          <Check className="w-4 h-4" />
                          <span>অনুমোদন করুন (+৳{sub.rewardAmount.toFixed(2)} ব্যালেন্সে যোগ)</span>
                        </button>
                        <button
                          onClick={() => handleReviewSubmission(sub.id, 'reject')}
                          className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold px-4 py-2.5 rounded-xl border border-rose-600/40 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>বাতিল</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 2.5. SOCIAL ACCOUNT SALES MANAGEMENT TAB */}
        {/* ========================================================= */}
        {activeTab === 'social_sales' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-amber-400" />
                  সোশ্যাল অ্যাকাউন্ট সেল পর্যালোচনা (Gmail / FB / Instagram)
                </h2>
                <p className="text-[11px] text-slate-400">
                  গ্রাহকদের জমা দেওয়া জিমেইল, ফেসবুক ও ইনস্টাগ্রাম অ্যাকাউন্ট ভেরিফাই ও অনুমোদন করুন
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                {(['pending', 'approved', 'rejected', 'all'] as const).map((tabKey) => (
                  <button
                    key={tabKey}
                    onClick={() => setSocialFilter(tabKey)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      socialFilter === tabKey ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tabKey === 'pending'
                      ? `পেন্ডিং (${socialSales.filter((s) => s.status === 'pending').length})`
                      : tabKey === 'approved'
                      ? 'অনুমোদিত'
                      : tabKey === 'rejected'
                      ? 'বাতিলকৃত'
                      : 'সকল'}
                  </button>
                ))}
              </div>
            </div>

            {socialSales.filter((s) => (socialFilter === 'all' ? true : s.status === socialFilter)).length === 0 ? (
              <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 text-center space-y-2">
                <Share2 className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-400 font-medium">কোনো সোশ্যাল সেল রেকর্ড নেই</p>
              </div>
            ) : (
              socialSales
                .filter((s) => (socialFilter === 'all' ? true : s.status === socialFilter))
                .map((sale) => (
                  <div
                    key={sale.id}
                    className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-3 shadow-xs"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                            sale.service === 'gmail'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : sale.service === 'facebook'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                          }`}
                        >
                          {sale.service === 'gmail' && <Mail className="w-3.5 h-3.5" />}
                          {sale.service === 'facebook' && <ThumbsUp className="w-3.5 h-3.5" />}
                          {sale.service === 'instagram' && <Instagram className="w-3.5 h-3.5" />}
                          {sale.service.toUpperCase()} SELL
                        </span>
                        <span className="text-xs font-bold text-amber-400">৳{sale.rate.toFixed(2)}</span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          sale.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : sale.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {sale.status === 'approved' ? '✓ অনুমোদিত' : sale.status === 'rejected' ? '✕ বাতিল' : '⏳ পেন্ডিং'}
                      </span>
                    </div>

                    {/* Account Details Box */}
                    <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Account / ID:</span>
                        <div className="flex items-center gap-1.5 text-white font-bold">
                          <span>{sale.accountIdentifier}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(sale.accountIdentifier);
                              showToast('অ্যাকাউন্ট আইডি কপি করা হয়েছে!', 'success');
                            }}
                            className="text-slate-400 hover:text-white p-1"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Password:</span>
                        <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                          <span>{sale.password}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(sale.password);
                              showToast('পাসওয়ার্ড কপি করা হয়েছে!', 'success');
                            }}
                            className="text-slate-400 hover:text-white p-1"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {sale.extraField && (
                        <div className="space-y-1 pt-1 border-t border-slate-800">
                          <span className="text-slate-400 text-[10px] block uppercase">2FA Key / Cookies:</span>
                          <div className="flex items-center justify-between gap-2 bg-slate-900 p-1.5 rounded-md">
                            <span className="text-[11px] text-slate-300 truncate max-w-[280px]">
                              {sale.extraField}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(sale.extraField);
                                showToast('কপি করা হয়েছে!', 'success');
                              }}
                              className="text-slate-400 hover:text-white shrink-0"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>বিক্রেতা: {sale.userEmail || sale.userId}</span>
                      <span>{new Date(sale.createdAt).toLocaleString('bn-BD')}</span>
                    </div>

                    {/* Action buttons */}
                    {sale.status === 'pending' && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleReviewSocialSale(sale.id, 'approved')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm text-xs"
                        >
                          <Check className="w-4 h-4" />
                          <span>অনুমোদন করুন (+৳{sale.rate.toFixed(2)} ব্যালেন্সে যোগ)</span>
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('বাতিল করার কারণ লিখুন (ঐচ্ছিক):') || undefined;
                            handleReviewSocialSale(sale.id, 'rejected', reason);
                          }}
                          className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold px-3 py-2 rounded-xl border border-rose-600/40 text-xs"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 2.6. SOCIAL JOBS MANAGEMENT & CREATION TAB */}
        {/* ========================================================= */}
        {activeTab === 'social_jobs' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-amber-400" />
                  সোশ্যাল কাজ পরিচালনা (Gmail, Facebook, Instagram)
                </h2>
                <p className="text-[11px] text-slate-400">
                  জিমেইল, ফেসবুক ও ইনস্টাগ্রামের কাজের রেট, পাসওয়ার্ড, লিমিট পরিবর্তন করুন এবং নতুন কাজ যুক্ত করুন
                </p>
              </div>
              <span className="text-[11px] text-amber-400/90 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                ৩টি সার্ভিস সক্রিয়
              </span>
            </div>

            {/* Top 3 Live Service Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 1. Gmail Job Card */}
              {(() => {
                const gmailJob = socialJobs.find((j) => j.service === 'gmail') || {
                  id: 'gmail-default',
                  service: 'gmail',
                  title: 'জিমেইল তৈরি ও বিক্রি কাজ',
                  rate: 14.0,
                  dailyLimit: 1000,
                  reportTime: '15-30 hours',
                  todayPassword: 'sgwteam1@21A',
                  usernameTemplate: 'sgw',
                  active: true,
                  notes: 'নতুন জিমেইল sgw দিয়ে তৈরি করে পাসওয়ার্ড ব্যবহার করতে হবে',
                };

                return (
                  <div className="bg-slate-850 rounded-2xl p-4 border border-red-500/30 bg-gradient-to-b from-red-500/5 to-transparent space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-xs">Gmail Service</h3>
                          <span className="text-[10px] text-slate-400">জিমেইল একাউন্ট তৈরি কাজ</span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          gmailJob.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {gmailJob.active ? 'সক্রিয় (Active)' : 'বন্ধ (Inactive)'}
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">প্রতি জিমেইল রেট:</span>
                        <span className="font-bold text-emerald-400 text-sm font-mono">৳{gmailJob.rate.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">আজকের পাসওয়ার্ড:</span>
                        <span className="font-mono text-amber-300 text-[11px] font-bold bg-slate-800 px-1.5 py-0.5 rounded">
                          {gmailJob.todayPassword || 'sgwteam1@21A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">ইউজারনেম প্রিফিক্স:</span>
                        <span className="font-mono text-slate-300 text-[11px]">{gmailJob.usernameTemplate || 'sgw'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">ভেরিফিকেশন সময়:</span>
                        <span className="text-slate-300 text-[11px]">{gmailJob.reportTime || '15-30 hours'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">দৈনিক লিমিট:</span>
                        <span className="text-slate-300 text-[11px]">{gmailJob.dailyLimit || 1000} টি</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSocialJob(gmailJob as SocialJobConfig);
                          setShowSocialJobModal(true);
                        }}
                        className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 font-bold py-2 rounded-xl text-[11px] transition-colors"
                      >
                        এডিট কনফিগ
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePublishJobToTasks(gmailJob as SocialJobConfig)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-2 rounded-xl text-[11px] font-bold"
                        title="টাস্কে পোস্ট করুন"
                      >
                        টাস্কে যুক্ত
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Facebook Job Card */}
              {(() => {
                const fbJob = socialJobs.find((j) => j.service === 'facebook') || {
                  id: 'facebook-default',
                  service: 'facebook',
                  title: 'ফেসবুক আইডি / পেজ কাজ',
                  rate: 4.5,
                  dailyLimit: 1000,
                  reportTime: '15/40 hours',
                  todayPassword: 'earnora@12',
                  usernameTemplate: '',
                  active: true,
                  notes: 'সক্রিয় ফেসবুক আইডি সাবমিট করতে হবে',
                };

                return (
                  <div className="bg-slate-850 rounded-2xl p-4 border border-blue-500/30 bg-gradient-to-b from-blue-500/5 to-transparent space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                          <ThumbsUp className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-xs">Facebook Service</h3>
                          <span className="text-[10px] text-slate-400">ফেসবুক আইডি সেল ও কাজ</span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          fbJob.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {fbJob.active ? 'সক্রিয় (Active)' : 'বন্ধ (Inactive)'}
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">প্রতি অ্যাকাউন্ট রেট:</span>
                        <span className="font-bold text-emerald-400 text-sm font-mono">৳{fbJob.rate.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">আজকের পাসওয়ার্ড:</span>
                        <span className="font-mono text-amber-300 text-[11px] font-bold bg-slate-800 px-1.5 py-0.5 rounded">
                          {fbJob.todayPassword || 'earnora@12'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">ভেরিফিকেশন সময়:</span>
                        <span className="text-slate-300 text-[11px]">{fbJob.reportTime || '15/40 hours'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">দৈনিক লিমিট:</span>
                        <span className="text-slate-300 text-[11px]">{fbJob.dailyLimit || 1000} টি</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSocialJob(fbJob as SocialJobConfig);
                          setShowSocialJobModal(true);
                        }}
                        className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold py-2 rounded-xl text-[11px] transition-colors"
                      >
                        এডিট কনফিগ
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePublishJobToTasks(fbJob as SocialJobConfig)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-2 rounded-xl text-[11px] font-bold"
                        title="টাস্কে পোস্ট করুন"
                      >
                        টাস্কে যুক্ত
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 3. Instagram Job Card */}
              {(() => {
                const instaJob = socialJobs.find((j) => j.service === 'instagram') || {
                  id: 'instagram-default',
                  service: 'instagram',
                  title: 'ইনস্টাগ্রাম একাউন্ট কাজ',
                  rate: 2.5,
                  dailyLimit: 1000,
                  reportTime: '10/20 hours',
                  todayPassword: 'earnora@12',
                  usernameTemplate: '',
                  active: true,
                  notes: 'ইনস্টাগ্রাম একাউন্ট সাবমিট করুন',
                };

                return (
                  <div className="bg-slate-850 rounded-2xl p-4 border border-pink-500/30 bg-gradient-to-b from-pink-500/5 to-transparent space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                          <Instagram className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-xs">Instagram Service</h3>
                          <span className="text-[10px] text-slate-400">ইনস্টাগ্রাম একাউন্ট সেল ও কাজ</span>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          instaJob.active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {instaJob.active ? 'সক্রিয় (Active)' : 'বন্ধ (Inactive)'}
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">প্রতি অ্যাকাউন্ট রেট:</span>
                        <span className="font-bold text-emerald-400 text-sm font-mono">৳{instaJob.rate.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">আজকের পাসওয়ার্ড:</span>
                        <span className="font-mono text-amber-300 text-[11px] font-bold bg-slate-800 px-1.5 py-0.5 rounded">
                          {instaJob.todayPassword || 'earnora@12'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">ভেরিফিকেশন সময়:</span>
                        <span className="text-slate-300 text-[11px]">{instaJob.reportTime || '10/20 hours'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">দৈনিক লিমিট:</span>
                        <span className="text-slate-300 text-[11px]">{instaJob.dailyLimit || 1000} টি</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSocialJob(instaJob as SocialJobConfig);
                          setShowSocialJobModal(true);
                        }}
                        className="flex-1 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 font-bold py-2 rounded-xl text-[11px] transition-colors"
                      >
                        এডিট কনফিগ
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePublishJobToTasks(instaJob as SocialJobConfig)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-2 rounded-xl text-[11px] font-bold"
                        title="টাস্কে পোস্ট করুন"
                      >
                        টাস্কে যুক্ত
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ========================================================= */}
            {/* 1,000 AUTO-TASK QUEUE GENERATOR & LIVE QUEUE MONITOR */}
            {/* ========================================================= */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-2xl p-5 border border-amber-500/30 space-y-4 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <Sparkles className="w-3 h-3" />
                    ১,০০০ কাজের অটোমেটেড কিউ সিস্টেম
                  </div>
                  <h3 className="font-black text-white text-base flex items-center gap-2">
                    প্রতিদিন ১,০০০টি আলাদা কাজ দিন (Gmail, Facebook, Instagram)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    ইউজার ১টি কাজ শেষ ও সাবমিট করলে স্বয়ংক্রিয়ভাবে পরবর্তী নতুন কাজ স্ক্রিনে আসবে (মোট ১,০০০টি আলাদা কাজ প্রস্তুত থাকবে)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 inline-block">
                    মোট কিউ আইটেম: {socialTasksQueue.length} টি
                  </span>
                </div>
              </div>

              {/* 3 One-Click 1,000 Tasks Generator Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Gmail 1,000 Generator */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-red-500/20 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> জিমেইল কিউ
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {socialTasksQueue.filter((t) => t.service === 'gmail').length} টি লোড আছে
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      ইউজারদের জন্য sgw1, sgw2...sgw1000 ফরম্যাটে ১০০০টি আলাদা কাজ তৈরি হবে।
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={generatingQueueService === 'gmail'}
                    onClick={() => handleGenerate1000Tasks('gmail')}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {generatingQueueService === 'gmail' ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>১,০০০ জিমেইল কাজ জেনারেট করুন</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Facebook 1,000 Generator */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-blue-500/20 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" /> ফেসবুক কিউ
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {socialTasksQueue.filter((t) => t.service === 'facebook').length} টি লোড আছে
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      fbuser1, fbuser2...fbuser1000 ফরম্যাটে ১০০০টি সিকোয়েন্সিয়াল কাজ প্রস্তুত হবে।
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={generatingQueueService === 'facebook'}
                    onClick={() => handleGenerate1000Tasks('facebook')}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {generatingQueueService === 'facebook' ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>১,০০০ ফেসবুক কাজ জেনারেট করুন</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3. Instagram 1,000 Generator */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-pink-500/20 space-y-2.5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pink-400 flex items-center gap-1">
                        <Instagram className="w-3.5 h-3.5" /> ইনস্টাগ্রাম কিউ
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {socialTasksQueue.filter((t) => t.service === 'instagram').length} টি লোড আছে
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      iguser1, iguser2...iguser1000 ফরম্যাটে ১০০০টি আলাদা কাজ তৈরি হবে।
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={generatingQueueService === 'instagram'}
                    onClick={() => handleGenerate1000Tasks('instagram')}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {generatingQueueService === 'instagram' ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>১,০০০ ইনস্টাগ্রাম কাজ জেনারেট করুন</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live Queued Tasks Preview List */}
              {socialTasksQueue.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">বর্তমান কিউ তালিকা (নমুনা টাস্ক প্রিভিউ):</span>
                    <span>সর্বমোট {socialTasksQueue.length} টি কাজ কিউতে রেডি</span>
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
                    {socialTasksQueue.slice(0, 15).map((qTask) => (
                      <div
                        key={qTask.id}
                        className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between text-slate-300"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              qTask.service === 'gmail'
                                ? 'bg-red-500/20 text-red-400'
                                : qTask.service === 'facebook'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-pink-500/20 text-pink-400'
                            }`}
                          >
                            {qTask.service} #{qTask.sequenceNumber}
                          </span>
                          <span className="text-white font-bold">{qTask.title}</span>
                          {qTask.suggestedUsername && (
                            <span className="text-amber-300 text-[10px] bg-slate-900 px-1.5 py-0.5 rounded">
                              @{qTask.suggestedUsername}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">৳{Number(qTask.rate).toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSocialTask(qTask.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {socialTasksQueue.length > 15 && (
                      <div className="text-center text-[10px] text-slate-500 py-1 font-sans">
                        ...আরও {socialTasksQueue.length - 15} টি কাজ কিউতে আছে
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Add New Social Job / Campaign Section */}
            <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4 text-amber-400" />
                    নতুন সোশ্যাল কাজ / অফার পোস্ট করুন
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    অ্যাডমিন এখান থেকে জিমেইল, ফেসবুক বা ইনস্টাগ্রামের নতুন কাজ এবং রেট পরিবর্তন করে প্রকাশ করতে পারবেন
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateNewSocialJobAndTask} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">সার্ভিস ক্যাটাগরি নির্বাচন:</label>
                    <select
                      value={newSocialJobForm.service}
                      onChange={(e) => {
                        const s = e.target.value as 'gmail' | 'facebook' | 'instagram';
                        let defaultRate = 14;
                        let defaultPw = 'sgwteam1@21A';
                        let defaultPrefix = 'sgw';
                        let defaultTime = '15-30 hours';
                        if (s === 'facebook') {
                          defaultRate = 4.5;
                          defaultPw = 'earnora@12';
                          defaultPrefix = '';
                          defaultTime = '15/40 hours';
                        } else if (s === 'instagram') {
                          defaultRate = 2.5;
                          defaultPw = 'earnora@12';
                          defaultPrefix = '';
                          defaultTime = '10/20 hours';
                        }
                        setNewSocialJobForm({
                          ...newSocialJobForm,
                          service: s,
                          rate: defaultRate,
                          todayPassword: defaultPw,
                          usernameTemplate: defaultPrefix,
                          reportTime: defaultTime,
                        });
                      }}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold"
                    >
                      <option value="gmail">📩 জিমেইল সার্ভিস (Gmail Sell)</option>
                      <option value="facebook">👍 ফেসবুক আইডি (Facebook Sell)</option>
                      <option value="instagram">📸 ইনস্টাগ্রাম (Instagram Sell)</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-slate-300 font-bold block">কাজের শিরোনাম / ক্যাম্পেইন নাম:</label>
                    <input
                      type="text"
                      required
                      value={newSocialJobForm.title}
                      onChange={(e) => setNewSocialJobForm({ ...newSocialJobForm, title: e.target.value })}
                      placeholder={
                        newSocialJobForm.service === 'gmail'
                          ? 'যেমন: নতুন জিমেইল অ্যাকাউন্ট তৈরি ও সেল কাজ (স্পেশাল অফার)'
                          : newSocialJobForm.service === 'facebook'
                          ? 'যেমন: সক্রিয় ফেসবুক আইডি সাবমিট কাজ'
                          : 'যেমন: ইনস্টাগ্রাম প্রোফাইল সাবমিট কাজ'
                      }
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">প্রতি কাজের রেট (৳):</label>
                    <input
                      type="number"
                      required
                      min="0.5"
                      step="0.5"
                      value={newSocialJobForm.rate}
                      onChange={(e) => setNewSocialJobForm({ ...newSocialJobForm, rate: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">আজকের পাসওয়ার্ড:</label>
                    <input
                      type="text"
                      required
                      value={newSocialJobForm.todayPassword}
                      onChange={(e) => setNewSocialJobForm({ ...newSocialJobForm, todayPassword: e.target.value })}
                      placeholder="earnora@12"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">ইউজারনেম প্রিফিক্স:</label>
                    <input
                      type="text"
                      value={newSocialJobForm.usernameTemplate}
                      onChange={(e) => setNewSocialJobForm({ ...newSocialJobForm, usernameTemplate: e.target.value })}
                      placeholder="যেমন: sgw"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">ভেরিফিকেশন সময়:</label>
                    <input
                      type="text"
                      value={newSocialJobForm.reportTime}
                      onChange={(e) => setNewSocialJobForm({ ...newSocialJobForm, reportTime: e.target.value })}
                      placeholder="যেমন: 15-30 hours"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">টিউটোরিয়াল লিংক (ইউটিউব):</label>
                  <input
                    type="url"
                    value={newSocialJobForm.tutorialUrl}
                    onChange={(e) => setNewSocialJobForm({ ...newSocialJobForm, tutorialUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">কাজের নির্দেশাবলী ও নিয়মাবলী:</label>
                  <textarea
                    rows={2}
                    value={newSocialJobForm.notes}
                    onChange={(e) => setNewSocialJobForm({ ...newSocialJobForm, notes: e.target.value })}
                    placeholder="ইউজারদের কি কি নিয়ম মানতে হবে (যেমন: রিকভারি ছাড়া, ফ্রেশ একাউন্ট হতে হবে ইত্যাদি)..."
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-700/80">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSocialJobForm.createMicroTaskToo}
                      onChange={(e) => setNewSocialJobForm({ ...newSocialJobForm, createMicroTaskToo: e.target.checked })}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4"
                    />
                    <span className="text-slate-200 font-bold text-xs">
                      একই সাথে 'মাইক্রো-টাস্ক' তালিকায় নতুন কাজ হিসেবে যোগ করুন
                    </span>
                  </label>
                  <span className="text-[11px] text-amber-400 hidden sm:inline">
                    ইউজাররা টাস্ক ও সোশ্যাল পেজ দুই জায়গা থেকেই কাজ পাবেন
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={socialJobSaving}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98 text-xs disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{socialJobSaving ? 'যোগ হচ্ছে...' : 'নতুন সোশ্যাল কাজ ও সার্ভিস যোগ করুন'}</span>
                </button>
              </form>
            </div>

            {/* Edit Social Job Modal */}
            {showSocialJobModal && editingSocialJob && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                <form
                  onSubmit={handleSaveSocialJob}
                  className="bg-slate-800 rounded-2xl p-5 border border-slate-700 space-y-3.5 text-xs max-w-md w-full my-8 shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                        {editingSocialJob.service === 'gmail' ? (
                          <Mail className="w-4 h-4" />
                        ) : editingSocialJob.service === 'facebook' ? (
                          <ThumbsUp className="w-4 h-4" />
                        ) : (
                          <Instagram className="w-4 h-4" />
                        )}
                      </span>
                      <h3 className="font-bold text-white text-sm">
                        {editingSocialJob.service.toUpperCase()} কনফিগারেশন এডিট করুন
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSocialJobModal(false);
                        setEditingSocialJob(null);
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">শিরোনাম:</label>
                    <input
                      type="text"
                      required
                      value={editingSocialJob.title}
                      onChange={(e) => setEditingSocialJob({ ...editingSocialJob, title: e.target.value })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">কাজের রেট (টাকা):</label>
                      <input
                        type="number"
                        required
                        min="0.5"
                        step="0.5"
                        value={editingSocialJob.rate}
                        onChange={(e) =>
                          setEditingSocialJob({ ...editingSocialJob, rate: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-emerald-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">আজকের পাসওয়ার্ড:</label>
                      <input
                        type="text"
                        required
                        value={editingSocialJob.todayPassword || ''}
                        onChange={(e) =>
                          setEditingSocialJob({ ...editingSocialJob, todayPassword: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">দৈনিক লিমিট:</label>
                      <input
                        type="number"
                        min="1"
                        value={editingSocialJob.dailyLimit}
                        onChange={(e) =>
                          setEditingSocialJob({ ...editingSocialJob, dailyLimit: parseInt(e.target.value) || 1000 })
                        }
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">রিপোর্ট / ভেরিফিকেশন সময়:</label>
                      <input
                        type="text"
                        value={editingSocialJob.reportTime || ''}
                        onChange={(e) =>
                          setEditingSocialJob({ ...editingSocialJob, reportTime: e.target.value })
                        }
                        placeholder="যেমন: 15-30 hours"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  {editingSocialJob.service === 'gmail' && (
                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">ইউজারনেম প্রিফিক্স:</label>
                      <input
                        type="text"
                        value={editingSocialJob.usernameTemplate || ''}
                        onChange={(e) =>
                          setEditingSocialJob({ ...editingSocialJob, usernameTemplate: e.target.value })
                        }
                        placeholder="যেমন: sgw"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">টিউটোরিয়াল লিংক (ইউটিউব):</label>
                    <input
                      type="url"
                      value={editingSocialJob.tutorialUrl || ''}
                      onChange={(e) =>
                        setEditingSocialJob({ ...editingSocialJob, tutorialUrl: e.target.value })
                      }
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">নির্দেশনা / বিবরণ:</label>
                    <textarea
                      rows={2}
                      value={editingSocialJob.notes || ''}
                      onChange={(e) =>
                        setEditingSocialJob({ ...editingSocialJob, notes: e.target.value })
                      }
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-700">
                    <div>
                      <span className="text-white font-bold block">কাজের সার্ভিস স্ট্যাটাস:</span>
                      <span className="text-[10px] text-slate-400">
                        বন্ধ করলে ইউজাররা এই কাজের ফর্ম সাবমিট করতে পারবেন না
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingSocialJob({ ...editingSocialJob, active: !editingSocialJob.active })
                      }
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                        editingSocialJob.active ? 'bg-emerald-600 text-white' : 'bg-rose-600/30 text-rose-300 border border-rose-600/50'
                      }`}
                    >
                      {editingSocialJob.active ? 'সক্রিয় (Active)' : 'স্থগিত (Disabled)'}
                    </button>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="submit"
                      disabled={socialJobSaving}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-md transition-transform active:scale-98 disabled:opacity-50"
                    >
                      {socialJobSaving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSocialJobModal(false);
                        setEditingSocialJob(null);
                      }}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2.5 rounded-xl"
                    >
                      বাতিল
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. WITHDRAWALS MANAGEMENT TAB */}
        {/* ========================================================= */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-white">উইথড্রয়াল ক্যাশআউট রিকোয়েস্টসমূহ</h2>
                <p className="text-[11px] text-slate-400">বিকাশ, নগদ ও রকেটের মাধ্যমে গ্রাহকদের অর্থ প্রেরণ নিশ্চিত করুন</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
                {(['pending', 'paid', 'rejected', 'all'] as const).map((tabKey) => (
                  <button
                    key={tabKey}
                    onClick={() => setWithFilter(tabKey)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      withFilter === tabKey ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tabKey === 'pending'
                      ? `পেন্ডিং (${withdrawals.filter((w) => w.status === 'pending').length})`
                      : tabKey === 'paid'
                      ? 'পরিশোধিত'
                      : tabKey === 'rejected'
                      ? 'বাতিলকৃত'
                      : 'সকল'}
                  </button>
                ))}
              </div>
            </div>

            {filteredWithdrawals.length === 0 ? (
              <div className="bg-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-700">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
                <p className="font-bold text-white">কোনো উইথড্র রিকোয়েস্ট নেই</p>
                <p className="text-[11px] text-slate-400 mt-0.5">সবগুলো উইথড্র সফলভাবে সম্পন্ন করা হয়েছে।</p>
              </div>
            ) : (
              filteredWithdrawals.map((w) => {
                const methodColor =
                  w.method === 'bKash'
                    ? 'bg-pink-600 text-white'
                    : w.method === 'Nagad'
                    ? 'bg-amber-600 text-white'
                    : 'bg-purple-600 text-white';

                return (
                  <div
                    key={w.id}
                    className="bg-slate-800 rounded-2xl p-4 border border-slate-700/90 shadow-xs space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${methodColor}`}>
                            {w.method}
                          </span>
                          <span className="font-mono font-bold text-white text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-700 select-all">
                            {w.accountNumber}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(w.accountNumber);
                              showToast(`নম্বর (${w.accountNumber}) কপি হয়েছে!`, 'success');
                            }}
                            className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                            title="কপি নম্বর"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-slate-300 text-xs mt-1">
                          ব্যবহারকারী: <strong className="text-white">{w.userFullName || 'সদস্য'}</strong>{' '}
                          <span className="text-slate-400 font-mono">({w.userPhone || w.userEmail})</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-white font-mono">
                          ৳{w.amount.toFixed(2)}
                        </span>
                        <div className="text-[11px] text-emerald-400 font-semibold">
                          নেট প্রদেয়: <strong className="font-mono text-sm">৳{w.netAmount.toFixed(2)}</strong>
                        </div>
                        <span className="text-[10px] text-slate-400">ফি (২%): ৳{w.fee.toFixed(2)}</span>
                      </div>
                    </div>

                    {w.adminNote && (
                      <div className="bg-slate-900 rounded-lg p-2 border border-slate-700 text-[11px] text-slate-300">
                        <strong className="text-amber-400">অ্যাডমিন নোট:</strong> {w.adminNote}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
                      <span>রিকোয়েস্ট: {new Date(w.createdAt).toLocaleString('bn-BD')}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          w.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : w.status === 'approved'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : w.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {w.status === 'paid'
                          ? '✓ পরিশোধিত (Paid)'
                          : w.status === 'approved'
                          ? 'অনুমোদিত'
                          : w.status === 'rejected'
                          ? '✕ বাতিল ও রিফান্ডেড'
                          : '⏳ অপেক্ষমাণ'}
                      </span>
                    </div>

                    {/* Pending Action Buttons */}
                    {(w.status === 'pending' || w.status === 'approved') && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            setSelectedWithdrawalForPaid(w);
                            setPaymentTrxId('');
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-xs transition-transform active:scale-98 flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>টাকা পাঠানো হয়েছে (Mark as Paid)</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWithdrawalForReject(w);
                            setRejectReason('');
                          }}
                          className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold px-4 py-2.5 rounded-xl border border-rose-600/40 transition-colors"
                        >
                          বাতিল ও রিফান্ড
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Mark as Paid Modal */}
            {selectedWithdrawalForPaid && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
                <form
                  onSubmit={handleConfirmPaidWithdrawal}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-3 text-xs shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <h3 className="font-bold text-white text-sm">পেমেন্ট নিশ্চিতকরণ</h3>
                    <button
                      type="button"
                      onClick={() => setSelectedWithdrawalForPaid(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-700 space-y-1">
                    <p className="text-slate-300">
                      গ্রাহক: <strong className="text-white">{selectedWithdrawalForPaid.userFullName}</strong>
                    </p>
                    <p className="text-slate-300">
                      মাধ্যম: <strong className="text-amber-400">{selectedWithdrawalForPaid.method}</strong> ({selectedWithdrawalForPaid.accountNumber})
                    </p>
                    <p className="text-emerald-400 font-bold text-sm">
                      প্রদেয় নেট টাকা: ৳{selectedWithdrawalForPaid.netAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">ট্রানজেকশন আইডি / রেফারেন্স নোট (ঐচ্ছিক):</label>
                    <input
                      type="text"
                      value={paymentTrxId}
                      onChange={(e) => setPaymentTrxId(e.target.value)}
                      placeholder="যেমন: TrxID: 9X8A7B2C"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>পেমেন্ট সফল হিসেবে সেভ করুন</span>
                  </button>
                </form>
              </div>
            )}

            {/* Reject & Refund Modal */}
            {selectedWithdrawalForReject && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
                <form
                  onSubmit={handleConfirmRejectWithdrawal}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-3 text-xs shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <h3 className="font-bold text-rose-400 text-sm">উইথড্রয়াল বাতিল ও রিফান্ড</h3>
                    <button
                      type="button"
                      onClick={() => setSelectedWithdrawalForReject(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-slate-300 leading-relaxed">
                    এই রিকোয়েস্টটি বাতিল করলে হোল্ড থাকা{' '}
                    <strong className="text-amber-300">৳{selectedWithdrawalForReject.amount.toFixed(2)}</strong> টাকা তাৎক্ষণিকভাবে গ্রাহকের একাউন্ট ব্যালেন্সে রিফান্ড হিসেবে যোগ হবে।
                  </p>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">বাতিলের কারণ:</label>
                    <input
                      type="text"
                      required
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="যেমন: বিকাশ নম্বর ভুল / ব্যক্তিগত একাউন্ট নয়"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    <span>বাতিল ও রিফান্ড সম্পন্ন করুন</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 4. TASK MANAGEMENT TAB */}
        {/* ========================================================= */}
        {activeTab === 'tasks' && (() => {
          const filteredTasks = tasks.filter((t: any) => {
            if (taskStatusFilter !== 'all' && t.status !== taskStatusFilter) return false;
            if (taskCategoryFilter !== 'all' && t.category !== taskCategoryFilter) return false;
            if (taskSearch.trim()) {
              const q = taskSearch.toLowerCase();
              const matchTitle = t.title?.toLowerCase().includes(q);
              const matchDesc = t.description?.toLowerCase().includes(q);
              const matchUrl = t.targetUrl?.toLowerCase().includes(q);
              const matchCat = t.category?.toLowerCase().includes(q);
              if (!matchTitle && !matchDesc && !matchUrl && !matchCat) return false;
            }
            return true;
          });

          const totalActiveCount = tasks.filter((t) => t.status === 'active').length;
          const totalRewardSum = tasks.reduce((sum, t) => sum + (Number(t.rewardAmount) || 0), 0);
          const totalApprovedSubs = tasks.reduce((sum, t: any) => sum + (Number(t.approvedSubmissions) || 0), 0);

          return (
            <div className="space-y-4">
              {/* Header & New Task Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-amber-400" />
                    <span>মাইক্রো-টাস্ক ও আর্নিং পরিচালনা ({tasks.length})</span>
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    ইউজার পেজে প্রদর্শিত প্রতিটি টাস্কের রিওয়ার্ড, কাজের লিংক, নির্দেশাবলী তৈরি ও নিয়ন্ত্রণ করুন
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {tasks.length > 0 && (
                    <button
                      onClick={handleClearAllTasks}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="সব ডেমো ও বিদ্যমান কাজ এক ক্লিকে মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>সকল কাজ মুছুন</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowNewTaskModal(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>নতুন টাস্ক তৈরি করুন</span>
                  </button>
                </div>
              </div>

              {/* Task Metrics Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 text-[10px] block font-medium">মোট টাস্ক</span>
                  <span className="text-lg font-black text-white font-mono">{tasks.length} টি</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-emerald-400 text-[10px] block font-medium">লাইভ সক্রিয় টাস্ক</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">{totalActiveCount} টি</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-amber-400 text-[10px] block font-medium">মোট রিওয়ার্ড পুল</span>
                  <span className="text-lg font-black text-amber-300 font-mono">৳{totalRewardSum.toFixed(2)}</span>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-sky-400 text-[10px] block font-medium">সম্পন্ন করা সাবমিশন</span>
                  <span className="text-lg font-black text-sky-300 font-mono">{totalApprovedSubs} বার</span>
                </div>
              </div>

              {/* Search and Filters Bar */}
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      placeholder="টাস্ক শিরোনাম, বর্ণনা বা লিংক দিয়ে খুঁজুন..."
                      className="w-full bg-slate-950 text-xs pl-9 p-2.5 rounded-xl border border-slate-800 text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-bold">
                    <button
                      onClick={() => setTaskStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        taskStatusFilter === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      সব ({tasks.length})
                    </button>
                    <button
                      onClick={() => setTaskStatusFilter('active')}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        taskStatusFilter === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      সক্রিয় ({totalActiveCount})
                    </button>
                    <button
                      onClick={() => setTaskStatusFilter('paused')}
                      className={`px-3 py-1.5 rounded-lg transition-colors ${
                        taskStatusFilter === 'paused' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      স্থগিত ({tasks.length - totalActiveCount})
                    </button>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mr-1">
                    <Filter className="w-3 h-3" />
                    <span>ক্যাটাগরি:</span>
                  </span>
                  {[
                    { id: 'all', label: 'সব ক্যাটাগরি' },
                    { id: 'gmail', label: 'Gmail' },
                    { id: 'facebook', label: 'Facebook' },
                    { id: 'instagram', label: 'Instagram' },
                    { id: 'telegram', label: 'Telegram' },
                    { id: 'youtube', label: 'YouTube' },
                    { id: 'app', label: 'App Install' },
                    { id: 'website', label: 'Website Visit' },
                    { id: 'general', label: 'General' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setTaskCategoryFilter(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                        taskCategoryFilter === cat.id
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* New Task Modal */}
              {showNewTaskModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <form
                    onSubmit={handleCreateTask}
                    className="bg-slate-900 rounded-2xl p-5 border border-slate-700 space-y-3.5 text-xs max-w-lg w-full my-8 shadow-2xl"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">নতুন মাইক্রো-টাস্ক তৈরি করুন</h3>
                          <p className="text-[10px] text-slate-400">ইউজারদের কাজের তালিকায় স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewTaskModal(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Quick Social Job Presets */}
                    <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-[11px] font-bold text-amber-400 block">⚡ দ্রুত প্রিসেট (১-ক্লিক অটোফিল):</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setNewTask({
                            title: 'নতুন জিমেইল তৈরি ও বিক্রি করুন',
                            description: 'নতুন জিমেইল তৈরি করুন sgw প্রিফিক্স দিয়ে এবং পাসওয়ার্ড sgwteam1@21A ব্যবহার করুন। কোনো রিকভারি ইমেইল বা ফোন অ্যাড করবেন না।',
                            category: 'gmail',
                            rewardAmount: 14.0,
                            dailyLimit: 10,
                            taskType: 'manual',
                            proofType: 'link_or_text',
                            targetUrl: 'https://mail.google.com',
                            proofInstruction: 'তৈরিকৃত জিমেইল এড্রেস ও পাসওয়ার্ড জমা দিন',
                          })}
                          className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[10px] font-bold flex items-center gap-1 border border-red-500/30"
                        >
                          <Mail className="w-3 h-3" />
                          <span>জিমেইল কাজ (৳১৪)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewTask({
                            title: 'ফেসবুক আইডি / প্রোফাইল জমা দিন',
                            description: 'সক্রিয় ফেসবুক আইডি সাবমিট করুন। পাসওয়ার্ড earnora@12 সেট করুন।',
                            category: 'facebook',
                            rewardAmount: 4.5,
                            dailyLimit: 10,
                            taskType: 'manual',
                            proofType: 'link_or_text',
                            targetUrl: 'https://facebook.com',
                            proofInstruction: 'ফেসবুক ইউআইডি / ফোন নম্বর ও পাসওয়ার্ড জমা দিন',
                          })}
                          className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-[10px] font-bold flex items-center gap-1 border border-blue-500/30"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>ফেসবুক কাজ (৳৪.৫)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewTask({
                            title: 'ইনস্টাগ্রাম একাউন্ট সাবমিট করুন',
                            description: 'কমপক্ষে ১০০+ ফলোয়ার সহ ইনস্টাগ্রাম একাউন্ট সাবমিট করে সাথে সাথে রিওয়ার্ড নিন। পাসওয়ার্ড: earnora@12',
                            category: 'instagram',
                            rewardAmount: 2.5,
                            dailyLimit: 10,
                            taskType: 'manual',
                            proofType: 'link_or_text',
                            targetUrl: 'https://instagram.com',
                            proofInstruction: 'ইনস্টাগ্রাম ইউজারনেম ও পাসওয়ার্ড জমা দিন',
                          })}
                          className="px-2.5 py-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-[10px] font-bold flex items-center gap-1 border border-pink-500/30"
                        >
                          <Instagram className="w-3 h-3" />
                          <span>ইনস্টাগ্রাম কাজ (৳২.৫)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewTask({
                            title: 'অফিশিয়াল টেলিগ্রাম চ্যানেলে জয়েন করুন',
                            description: 'আমাদের টেলিগ্রাম চ্যানেলে জয়েন করে প্রুফ হিসেবে আপনার টেলিগ্রাম ইউজারনেম জমা দিন।',
                            category: 'telegram',
                            rewardAmount: 5.0,
                            dailyLimit: 1,
                            taskType: 'manual',
                            proofType: 'screenshot_and_username',
                            targetUrl: settings?.telegramChannel || 'https://t.me/fahimpaybd',
                            proofInstruction: 'আপনার টেলিগ্রাম ইউজারনেম ও জয়েন করার স্ক্রিনশট দিন',
                          })}
                          className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[10px] font-bold flex items-center gap-1 border border-sky-500/30"
                        >
                          <Send className="w-3 h-3" />
                          <span>টেলিগ্রাম কাজ (৳৫)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewTask({
                            title: 'ইউটিউব ভিডিও লাইক ও সাবস্ক্রাইব করুন',
                            description: 'আমাদের অফিশিয়াল ইউটিউব চ্যানেলের ভিডিও দেখে লাইক, কমেন্ট ও সাবস্ক্রাইব করুন।',
                            category: 'youtube',
                            rewardAmount: 8.0,
                            dailyLimit: 1,
                            taskType: 'manual',
                            proofType: 'screenshot_and_username',
                            targetUrl: 'https://youtube.com',
                            proofInstruction: 'ভিডিও লাইক ও সাবস্ক্রাইব করার স্ক্রিনশট জমা দিন',
                          })}
                          className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 text-[10px] font-bold flex items-center gap-1 border border-red-600/30"
                        >
                          <Youtube className="w-3 h-3" />
                          <span>ইউটিউব কাজ (৳৮)</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">টাস্কের শিরোনাম:</label>
                      <input
                        type="text"
                        required
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="যেমন: নতুন জিমেইল তৈরি করে জমা দিন"
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">কাজের বিস্তারিত নির্দেশাবলী:</label>
                      <textarea
                        required
                        rows={3}
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="ইউজারকে কাজ সম্পন্ন করতে কী কী করতে হবে পরিষ্কারভাবে লিখুন..."
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold block">পুরস্কারের পরিমাণ (টাকা):</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-amber-400 font-bold">৳</span>
                          <input
                            type="number"
                            required
                            min="0.5"
                            step="0.5"
                            value={newTask.rewardAmount}
                            onChange={(e) =>
                              setNewTask({ ...newTask, rewardAmount: parseFloat(e.target.value) || 0 })
                            }
                            className="w-full pl-7 p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-emerald-400 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold block">ক্যাটাগরি:</label>
                        <select
                          value={newTask.category}
                          onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        >
                          <option value="gmail">Gmail Service</option>
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="telegram">Telegram</option>
                          <option value="youtube">YouTube</option>
                          <option value="app">App Install</option>
                          <option value="website">Website Visit</option>
                          <option value="general">General Task</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold block">দৈনিক সীমা (বার/দিন):</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="100"
                          value={newTask.dailyLimit}
                          onChange={(e) => setNewTask({ ...newTask, dailyLimit: parseInt(e.target.value) || 1 })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold block">টার্গেট লিংক (URL):</label>
                        <input
                          type="url"
                          value={newTask.targetUrl}
                          onChange={(e) => setNewTask({ ...newTask, targetUrl: e.target.value })}
                          placeholder="https://t.me/yourchannel"
                          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold block">প্রুফের ধরন:</label>
                        <select
                          value={newTask.proofType}
                          onChange={(e) => setNewTask({ ...newTask, proofType: e.target.value })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        >
                          <option value="screenshot_and_username">স্ক্রিনশট + ইউজারনেম/টেক্সট</option>
                          <option value="link_or_text">শুধুমাত্র টেক্সট / ইউজারনেম / আইডি</option>
                          <option value="screenshot">শুধুমাত্র স্ক্রিনশট</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">প্রুফ নির্দেশিকা (ইউজার কী জমা দেবে):</label>
                      <input
                        type="text"
                        value={newTask.proofInstruction}
                        onChange={(e) => setNewTask({ ...newTask, proofInstruction: e.target.value })}
                        placeholder="যেমন: আপনার টেলিগ্রাম ইউজারনেম ও কাজের স্ক্রিনশট দিন"
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-md transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>টাস্ক সেভ ও লাইভ প্রকাশ করুন</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewTaskModal(false)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
                      >
                        বাতিল
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Edit Task Modal */}
              {showEditTaskModal && editingTask && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                  <form
                    onSubmit={handleSaveEditTask}
                    className="bg-slate-900 rounded-2xl p-5 border border-amber-500/40 space-y-3.5 text-xs max-w-lg w-full my-8 shadow-2xl"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
                          <Edit3 className="w-4 h-4 stroke-[2.5]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">টাস্ক ও রিওয়ার্ড এডিট করুন</h3>
                          <p className="text-[10px] text-slate-400">টাস্ক আইডি: #{editingTask.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditTaskModal(false);
                          setEditingTask(null);
                        }}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">টাস্কের শিরোনাম:</label>
                      <input
                        type="text"
                        required
                        value={editingTask.title}
                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">কাজের বিস্তারিত নির্দেশাবলী:</label>
                      <textarea
                        required
                        rows={3}
                        value={editingTask.description}
                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold block">পুরস্কারের পরিমাণ (টাকা):</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-amber-400 font-bold">৳</span>
                          <input
                            type="number"
                            required
                            min="0.5"
                            step="0.5"
                            value={editingTask.rewardAmount}
                            onChange={(e) =>
                              setEditingTask({ ...editingTask, rewardAmount: parseFloat(e.target.value) || 0 })
                            }
                            className="w-full pl-7 p-2.5 bg-slate-950 border border-amber-500/40 rounded-xl text-emerald-400 font-mono font-bold focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold block">ক্যাটাগরি:</label>
                        <select
                          value={editingTask.category}
                          onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                        >
                          <option value="gmail">Gmail Service</option>
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="telegram">Telegram</option>
                          <option value="youtube">YouTube</option>
                          <option value="app">App Install</option>
                          <option value="website">Website Visit</option>
                          <option value="general">General Task</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold block">দৈনিক সীমা (বার/দিন):</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="100"
                          value={editingTask.dailyLimit}
                          onChange={(e) => setEditingTask({ ...editingTask, dailyLimit: parseInt(e.target.value) || 1 })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold block">টার্গেট লিংক (URL):</label>
                        <input
                          type="url"
                          value={editingTask.targetUrl || ''}
                          onChange={(e) => setEditingTask({ ...editingTask, targetUrl: e.target.value })}
                          placeholder="https://..."
                          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-300 font-bold block">স্ট্যাটাস:</label>
                        <select
                          value={editingTask.status}
                          onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as any })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                        >
                          <option value="active">সক্রিয় (Active - ইউজার পেজে দেখাবে)</option>
                          <option value="paused">স্থগিত (Paused - সাময়িক বন্ধ)</option>
                          <option value="archived">আর্কাইভ (Archived)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-300 font-bold block">প্রুফ নির্দেশিকা:</label>
                      <input
                        type="text"
                        value={editingTask.proofInstruction || ''}
                        onChange={(e) => setEditingTask({ ...editingTask, proofInstruction: e.target.value })}
                        placeholder="যেমন: স্ক্রিনশট ও ইউজারনেম জমা দিন"
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                      />
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-md transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>পরিবর্তন সেভ করুন</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditTaskModal(false);
                          setEditingTask(null);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
                      >
                        বাতিল
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Task List Cards */}
              {filteredTasks.length === 0 ? (
                <div className="bg-slate-900/60 p-8 rounded-2xl border border-slate-800 text-center space-y-3">
                  <AlertCircle className="w-8 h-8 text-amber-400/80 mx-auto" />
                  <p className="text-sm font-bold text-slate-300">কোনো টাস্ক খুঁজে পাওয়া যায়নি</p>
                  <p className="text-xs text-slate-500">ফিল্টার পরিবর্তন করুন অথবা নতুন টাস্ক তৈরি করুন।</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((t: any) => (
                    <div
                      key={t.id}
                      className={`bg-slate-900/90 rounded-2xl p-4 border transition-all ${
                        t.status === 'active'
                          ? 'border-slate-800 hover:border-slate-700'
                          : 'border-rose-900/40 bg-slate-950/80 opacity-80'
                      } flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-md`}
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-sm">{t.title}</span>
                          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] uppercase font-mono border border-slate-700">
                            {t.category}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              t.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {t.status === 'active' ? '● সক্রিয় (Live)' : '○ স্থগিত (Paused)'}
                          </span>
                          <span className="text-slate-500 text-[10px] font-mono">
                            সীমা: {t.dailyLimit} বার/দিন
                          </span>
                        </div>

                        <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                          {t.description}
                        </p>

                        {t.proofInstruction && (
                          <div className="text-[11px] text-amber-300/90 bg-amber-500/10 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 border border-amber-500/20">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>প্রুফ: {t.proofInstruction}</span>
                          </div>
                        )}

                        {t.targetUrl && (
                          <div className="pt-0.5">
                            <a
                              href={t.targetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-400 hover:text-amber-300 hover:underline inline-flex items-center gap-1 text-[11px] font-mono break-all"
                            >
                              <span>{t.targetUrl}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          </div>
                        )}

                        {/* Submission Stats Counters */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] font-mono text-slate-400">
                          <span>মোট কাজ জমা: <strong className="text-slate-200">{t.totalSubmissions || 0}</strong></span>
                          <span>অনুমোদিত: <strong className="text-emerald-400">{t.approvedSubmissions || 0}</strong></span>
                          <span>পেন্ডিং: <strong className="text-amber-400">{t.pendingSubmissions || 0}</strong></span>
                          {t.totalPaidReward > 0 && (
                            <span>মোট পেইড: <strong className="text-emerald-400">৳{t.totalPaidReward.toFixed(2)}</strong></span>
                          )}
                        </div>
                      </div>

                      {/* Reward Amount & Action Controls */}
                      <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                        <div className="text-left md:text-right">
                          <span className="text-xl font-black text-emerald-400 font-mono block">
                            ৳{Number(t.rewardAmount).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400">প্রতি সফল কাজে রিওয়ার্ড</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Edit Task Button */}
                          <button
                            onClick={() => handleOpenEditTask(t)}
                            className="p-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                            title="এডিট ও রিওয়ার্ড পরিবর্তন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>এডিট</span>
                          </button>

                          {/* Duplicate Task Button */}
                          <button
                            onClick={() => handleDuplicateTask(t)}
                            className="p-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                            title="কপি / ডুপ্লিকেট"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>কপি</span>
                          </button>

                          {/* Toggle Status Button */}
                          <button
                            onClick={() => handleToggleTaskStatus(t)}
                            className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] border transition-colors cursor-pointer ${
                              t.status === 'active'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            }`}
                          >
                            {t.status === 'active' ? 'স্থগিত' : 'সক্রিয়'}
                          </button>

                          {/* Delete / Archive Button */}
                          <button
                            onClick={() => handleDeleteTask(t.id)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800/40 transition-colors cursor-pointer"
                            title="আর্কাইভ বা মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* ========================================================= */}
        {/* 5. USER MANAGEMENT TAB */}
        {/* ========================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-white">ব্যবহারকারী তালিকা ({users.length})</h2>
                <p className="text-[11px] text-slate-400">সকল গ্রাহকের ব্যালেন্স, রেফারেল ও অ্যাকাউন্ট নিয়ন্ত্রণ</p>
              </div>
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="নাম, ফোন বা রেফারেল কোড..."
                  className="w-full bg-slate-800 text-xs pl-9 p-2.5 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              {filteredUsers.length === 0 ? (
                <div className="bg-slate-800/60 rounded-2xl p-8 border border-slate-700/60 text-center space-y-3">
                  <Users className="w-10 h-10 text-slate-500 mx-auto" />
                  <p className="text-slate-300 font-bold text-sm">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {userSearch ? 'অনুসন্ধান ফিল্টারে কোনো মিল মেলেনি। সার্চ বক্স ক্লিয়ার করুন।' : 'এখনও কোনো ইউজার তালিকাভুক্ত হননি অথবা সার্ভার ডাটা রিফ্রেশ করা প্রয়োজন।'}
                  </p>
                  <button
                    onClick={() => {
                      loadData();
                    }}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>ইউজার তালিকা পুনরায় লোড করুন</span>
                  </button>
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const bal = typeof u.balance === 'number' ? u.balance : Number(u.balance || 0);
                  const earned = typeof u.totalEarned === 'number' ? u.totalEarned : Number(u.totalEarned || 0);
                  const refs = typeof u.totalReferrals === 'number' ? u.totalReferrals : Number(u.totalReferrals || 0);

                  return (
                    <div
                      key={u.id}
                      className="bg-slate-800 rounded-2xl p-4 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{u.fullName || 'নামহীন ইউজার'}</span>
                          {u.roles?.includes('admin') && (
                            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
                              ADMIN
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              u.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {u.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                          </span>
                        </div>
                        <p className="text-slate-400 text-xs">
                          <strong className="text-slate-300 font-mono">{u.phoneNumber || 'ফোন নম্বর নেই'}</strong> • {u.email}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                          <span>রেফার কোড: <strong className="text-amber-300 font-mono">{u.referralCode || 'N/A'}</strong></span>
                          <span>রেফারেল: <strong className="text-white">{refs} জন</strong></span>
                          <span>মোট আয়: <strong className="text-emerald-400">৳{earned.toFixed(2)}</strong></span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/50">
                        <div className="text-left sm:text-right">
                          <span className="text-slate-400 text-[10px] block">বর্তমান ব্যালেন্স:</span>
                          <span className="text-lg font-black text-emerald-400 font-mono">
                            ৳{bal.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenAssignRoleModal(u)}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors ${
                              u.roles?.includes('admin')
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                                : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600'
                            }`}
                            title="অ্যাডমিন বানান বা পারমিশন পরিবর্তন করুন"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{u.roles?.includes('admin') ? 'রোল ও পারমিশন' : 'অ্যাডমিন বানান'}</span>
                          </button>
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1 shadow-2xs"
                          >
                            <span>ব্যালেন্স (+/-)</span>
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`p-1.5 rounded-lg border text-[11px] ${
                              u.status === 'active'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            }`}
                            title={u.status === 'active' ? 'অ্যাকাউন্ট স্থগিত করুন' : 'অ্যাকাউন্ট সক্রিয় করুন'}
                          >
                            {u.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                          {u.email.toLowerCase() !== 'fahim236455@gmail.com' && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="p-1.5 rounded-lg border text-[11px] bg-rose-600/20 text-rose-400 border-rose-500/40 hover:bg-rose-600/30 transition-colors"
                              title="ব্যবহারকারী স্থায়ীভাবে মুছে ফেলুন"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Balance Adjustment Modal */}
            {selectedUser && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
                <form
                  onSubmit={handleAdjustBalance}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-5 max-w-sm w-full space-y-3 text-xs shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <h3 className="font-bold text-white text-sm">ব্যালেন্স সমন্বয়: {selectedUser.fullName}</h3>
                    <button
                      type="button"
                      onClick={() => setSelectedUser(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-slate-300">
                    বর্তমান ব্যালেন্স: <strong className="text-emerald-400 font-mono">৳{selectedUser.balance.toFixed(2)}</strong>
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBalanceType('credit')}
                      className={`flex-1 py-2 rounded-xl font-bold transition-colors ${
                        balanceType === 'credit'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      + টাকা যোগ (Credit)
                    </button>
                    <button
                      type="button"
                      onClick={() => setBalanceType('debit')}
                      className={`flex-1 py-2 rounded-xl font-bold transition-colors ${
                        balanceType === 'debit' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      - টাকা কর্তন (Debit)
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">টাকার পরিমাণ (BDT):</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      value={balanceAmount}
                      onChange={(e) => setBalanceAmount(e.target.value)}
                      placeholder="যেমন: 50"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">সমন্বয়ের কারণ / বিবরণ:</label>
                    <input
                      type="text"
                      value={balanceReason}
                      onChange={(e) => setBalanceReason(e.target.value)}
                      placeholder="যেমন: বিশেষ বোনাস / রিফান্ড"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-md transition-transform active:scale-98"
                  >
                    ব্যালেন্স আপডেট নিশ্চিত করুন
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. SUPPORT & LIVE CHAT DESK (Real-Time Admin Messenger)    */}
        {/* ========================================================= */}
        {activeTab === 'support' && (() => {
          const openCount = tickets.filter((t) => t.status === 'open').length;
          const answeredCount = tickets.filter((t) => t.status === 'answered').length;
          const closedCount = tickets.filter((t) => t.status === 'closed').length;

          const filteredTickets = tickets.filter((t) => {
            if (ticketFilter === 'open' && t.status !== 'open') return false;
            if (ticketFilter === 'answered' && t.status !== 'answered') return false;
            if (ticketFilter === 'closed' && t.status !== 'closed') return false;
            if (ticketSearch.trim()) {
              const q = ticketSearch.toLowerCase();
              const matchName = (t.userFullName || '').toLowerCase().includes(q);
              const matchPhone = (t.userPhone || '').toLowerCase().includes(q);
              const matchEmail = (t.userEmail || '').toLowerCase().includes(q);
              const matchSubj = (t.subject || '').toLowerCase().includes(q);
              const matchMsg = (t.message || '').toLowerCase().includes(q);
              return matchName || matchPhone || matchEmail || matchSubj || matchMsg;
            }
            return true;
          });

          const currentSelectedTicket = tickets.find((t) => t.id === selectedChatTicketId) || filteredTickets[0] || null;

          return (
            <div className="space-y-3">
              {/* Header & Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-emerald-400" />
                      <span>সাপোর্ট ও লাইভ চ্যাট ডেস্ক</span>
                    </h2>
                    {openCount > 0 && (
                      <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                        ⏳ {openCount} টি নতুন বার্তা
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    গ্রাহকদের সরাসরি লাইভ চ্যাটে রিয়েল-টাইম উত্তর দিন এবং সমস্যা সমাধান করুন
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setTicketFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      ticketFilter === 'all'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    সকল ({tickets.length})
                  </button>
                  <button
                    onClick={() => setTicketFilter('open')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      ticketFilter === 'open'
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    অপেক্ষায় ({openCount})
                  </button>
                  <button
                    onClick={() => setTicketFilter('answered')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      ticketFilter === 'answered'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    উত্তর দেওয়া ({answeredCount})
                  </button>
                  <button
                    onClick={() => setTicketFilter('closed')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      ticketFilter === 'closed'
                        ? 'bg-slate-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    সম্পন্ন ({closedCount})
                  </button>
                </div>
              </div>

              {/* Quick WhatsApp & Telegram Info Card in Support Tab */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-xs">
                <div className="flex flex-wrap items-center gap-2.5 text-slate-300">
                  <div className="flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-800/70 px-2.5 py-1 rounded-lg text-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-bold text-white">WhatsApp:</span>
                    <span className="font-mono text-emerald-200">
                      {settingsForm?.supportWhatsapp || 'দেওয়া নেই'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-sky-950/70 border border-sky-800/70 px-2.5 py-1 rounded-lg text-sky-300">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span className="font-bold text-white">Telegram:</span>
                    <span className="font-mono text-sky-200">
                      {settingsForm?.supportTelegram || 'দেওয়া নেই'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-amber-950/70 border border-amber-800/70 px-2.5 py-1 rounded-lg text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-bold text-white">Hotline:</span>
                    <span className="font-mono text-amber-200">
                      {settingsForm?.supportPhone || 'দেওয়া নেই'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openQuickSupportModal}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-98 shrink-0 shadow-sm"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>হোয়াটসঅ্যাপ ও টেলিগ্রাম পরিবর্তন করুন</span>
                </button>
              </div>

              {/* Main Two-Column Layout */}
              {tickets.length === 0 ? (
                <div className="bg-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-700">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
                  <p className="font-bold text-white">কোনো সাপোর্ট টিকিট বা মেসেজ নেই</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">সবগুলো টিকিটের সমাধান করা হয়েছে।</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[560px]">
                  {/* Left Column: Chat/Ticket Conversation List */}
                  <div className="lg:col-span-4 bg-slate-800 rounded-2xl border border-slate-700/80 flex flex-col overflow-hidden max-h-[620px]">
                    {/* Search box */}
                    <div className="p-2.5 border-b border-slate-700">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={ticketSearch}
                          onChange={(e) => setTicketSearch(e.target.value)}
                          placeholder="নাম, ফোন বা বিষয় খুঁজুন..."
                          className="w-full bg-slate-900 text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-700 text-white outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Ticket Items List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-700/50">
                      {filteredTickets.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          কোনো মেসেজ পাওয়া যায়নি
                        </div>
                      ) : (
                        filteredTickets.map((t) => {
                          const isSelected = currentSelectedTicket?.id === t.id;
                          const lastMsg = t.messages && t.messages.length > 0 ? t.messages[t.messages.length - 1] : null;
                          const previewText = lastMsg ? lastMsg.text : t.message;
                          const isPendingUserMsg = lastMsg ? lastMsg.sender === 'user' : t.status === 'open';

                          return (
                            <button
                              key={t.id}
                              onClick={() => setSelectedChatTicketId(t.id)}
                              className={`w-full text-left p-3 transition-colors flex items-start gap-2.5 ${
                                isSelected
                                  ? 'bg-amber-500/15 border-l-4 border-amber-500'
                                  : 'hover:bg-slate-750'
                              }`}
                            >
                              <div className="relative shrink-0">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-500 flex items-center justify-center font-bold text-white text-xs shadow-xs">
                                  {(t.userFullName || 'সদ')[0]}
                                </div>
                                {isPendingUserMsg && (
                                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-800" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-white text-xs truncate">
                                    {t.userFullName || 'গ্রাহক / ভিজিটর'}
                                  </span>
                                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                                    {new Date(t.updatedAt || t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>

                                {t.userPhone && (
                                  <span className="text-[11px] text-amber-300 font-mono block">
                                    {t.userPhone}
                                  </span>
                                )}

                                <p className="text-slate-300 text-[11px] truncate mt-0.5">
                                  {previewText}
                                </p>

                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                      t.status === 'open'
                                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                        : t.status === 'answered'
                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                        : 'bg-slate-700 text-slate-300'
                                    }`}
                                  >
                                    {t.status === 'open' ? 'অপেক্ষমান' : t.status === 'answered' ? 'উত্তর দেওয়া' : 'সম্পন্ন'}
                                  </span>
                                  <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                                    {t.category}
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Column: Active Live Conversation Window */}
                  {currentSelectedTicket ? (
                    <div className="lg:col-span-8 bg-slate-800 rounded-2xl border border-slate-700/80 flex flex-col overflow-hidden max-h-[620px]">
                      {/* Chat Header */}
                      <div className="p-3 bg-slate-850 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm shadow-xs">
                            {(currentSelectedTicket.userFullName || 'গ্রা')[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-sm">
                                {currentSelectedTicket.userFullName || 'গ্রাহক / ভিজিটর'}
                              </h3>
                              <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                                ID: {currentSelectedTicket.userId.slice(0, 8)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              {currentSelectedTicket.userPhone && (
                                <a
                                  href={`tel:${currentSelectedTicket.userPhone}`}
                                  className="text-amber-400 font-mono hover:underline flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{currentSelectedTicket.userPhone}</span>
                                </a>
                              )}
                              {currentSelectedTicket.userEmail && (
                                <span>• {currentSelectedTicket.userEmail}</span>
                              )}
                              <span>• ব্যালেন্স: <strong className="text-emerald-400 font-mono">৳{(currentSelectedTicket.userBalance ?? 0).toFixed(2)}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Actions in Chat Header */}
                        <div className="flex items-center gap-2">
                          <select
                            value={currentSelectedTicket.status}
                            onChange={(e) => handleChangeTicketStatus(currentSelectedTicket.id, e.target.value as any)}
                            className="bg-slate-900 text-slate-200 border border-slate-700 text-xs px-2 py-1.5 rounded-lg outline-none cursor-pointer"
                          >
                            <option value="open">⏳ অপেক্ষমান (Open)</option>
                            <option value="answered">✓ উত্তর দেওয়া (Answered)</option>
                            <option value="closed">🔒 বন্ধ / সম্পন্ন (Closed)</option>
                          </select>
                        </div>
                      </div>

                      {/* Chat Messages Body */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/60">
                        {/* Initial ticket topic badge */}
                        <div className="text-center my-1">
                          <span className="bg-slate-800 border border-slate-700 text-slate-400 text-[10px] px-3 py-1 rounded-full">
                            বিষয়: <strong>{currentSelectedTicket.subject}</strong> ({currentSelectedTicket.category})
                          </span>
                        </div>

                        {/* Render thread */}
                        {(() => {
                          const thread = currentSelectedTicket.messages && currentSelectedTicket.messages.length > 0
                            ? currentSelectedTicket.messages
                            : [
                                {
                                  id: `init-${currentSelectedTicket.id}`,
                                  sender: 'user' as const,
                                  text: currentSelectedTicket.message,
                                  timestamp: currentSelectedTicket.createdAt,
                                },
                                ...(currentSelectedTicket.adminReply ? [
                                  {
                                    id: `reply-${currentSelectedTicket.id}`,
                                    sender: 'agent' as const,
                                    text: currentSelectedTicket.adminReply,
                                    timestamp: currentSelectedTicket.repliedAt || currentSelectedTicket.updatedAt,
                                  }
                                ] : [])
                              ];

                          return thread.map((msg) => {
                            const isUser = msg.sender === 'user';

                            return (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                              >
                                <span className="text-[10px] text-slate-400 mb-1 px-1 flex items-center gap-1 font-semibold">
                                  {isUser ? (
                                    <span>{currentSelectedTicket.userFullName || 'গ্রাহক'}</span>
                                  ) : (
                                    <span className="text-emerald-400">🛡️ অ্যাডমিন সাপোর্ট</span>
                                  )}
                                  <span className="text-slate-400 font-normal">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </span>

                                <div
                                  className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed space-y-1.5 shadow-sm ${
                                    isUser
                                      ? 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-xs'
                                      : 'bg-emerald-600 text-white rounded-tr-xs'
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap">{msg.text}</p>

                                  {/* Attached Image if any */}
                                  {msg.attachmentUrl && (
                                    <div className="pt-1">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedScreenshotUrl(msg.attachmentUrl || null)}
                                        className="block overflow-hidden rounded-xl border border-white/20 hover:opacity-90 transition-opacity"
                                      >
                                        <img
                                          src={msg.attachmentUrl}
                                          alt="Attachment"
                                          className="max-h-48 rounded-lg object-contain bg-black/40"
                                        />
                                      </button>
                                      <span className="text-[9px] opacity-75 mt-0.5 block">
                                        (ছবি বড় করে দেখতে ক্লিক করুন)
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                        <div ref={chatMessagesEndRef} />
                      </div>

                      {/* Quick Canned Responses Bar */}
                      <div className="bg-slate-850 px-3 py-2 border-t border-slate-700/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                        <span className="text-slate-400 shrink-0 text-[10px] font-bold">কুইক রিপ্লাই:</span>
                        <button
                          type="button"
                          onClick={() => handleSendAdminChatMessage(currentSelectedTicket.id, '✅ আপনার উইথড্র পেমেন্ট সফলভাবে পাঠানো হয়েছে। অনুগ্রহ করে একাউন্ট চেক করুন।')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
                        >
                          ✅ পেমেন্ট পাঠানো হয়েছে
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendAdminChatMessage(currentSelectedTicket.id, '🔍 আপনার বিষয়টি খতিয়ে দেখা হচ্ছে। অনুগ্রহ করে ২ মিনিট অপেক্ষা করুন।')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
                        >
                          🔍 চেক করা হচ্ছে
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendAdminChatMessage(currentSelectedTicket.id, '📸 অনুগ্রহ করে আপনার ট্রানজেকশন বা সমস্যার স্পষ্ট স্ক্রিনশট পাঠান।')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
                        >
                          📸 স্ক্রিনশট দিন
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendAdminChatMessage(currentSelectedTicket.id, '💰 আপনার ব্যালেন্সে টাকা যোগ করে দেওয়া হয়েছে। ধন্যবাদ।')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
                        >
                          💰 ব্যালেন্স যোগ হয়েছে
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendAdminChatMessage(currentSelectedTicket.id, '👍 আপনার সমস্যার সমাধান সম্পন্ন হয়েছে। ভালো থাকবেন!')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
                        >
                          👍 সমাধান হয়েছে
                        </button>
                      </div>

                      {/* Admin Message Send Input Form */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendAdminChatMessage(currentSelectedTicket.id);
                        }}
                        className="p-3 bg-slate-900 border-t border-slate-700 flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={adminChatText}
                          onChange={(e) => setAdminChatText(e.target.value)}
                          placeholder="গ্রাহককে সরাসরি উত্তর / রিপ্লাই লিখুন... (Enter চাপুন)"
                          disabled={adminSendingChat}
                          className="flex-1 bg-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 text-white outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={adminSendingChat || !adminChatText.trim()}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-xs transition-all shadow-md active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{adminSendingChat ? 'পাঠানো হচ্ছে...' : 'পাঠান'}</span>
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="lg:col-span-8 bg-slate-800 rounded-2xl border border-slate-700 p-8 flex flex-col items-center justify-center text-slate-400 text-xs">
                      <Headphones className="w-12 h-12 text-slate-600 mb-2" />
                      <p className="font-bold text-white text-sm">কোনো চ্যাট নির্বাচিত নেই</p>
                      <p className="text-[11px] mt-0.5">বাম পাশের তালিকা থেকে যেকোনো কথোপকথন নির্বাচন করুন</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* ========================================================= */}
        {/* 7. FULL DYNAMIC SETTINGS CONTROL CENTER */}
        {/* ========================================================= */}
        {activeTab === 'settings' && settingsForm && (
          <div className="space-y-6 text-xs max-w-5xl">
            {/* Top Sub-Navigation Pills for Settings */}
            <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-2xl flex items-center gap-1.5 overflow-x-auto shadow-md scrollbar-none">
              <button
                type="button"
                onClick={() => setSettingsSubTab('general')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  settingsSubTab === 'general'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>সাধারণ ও ব্র্যান্ডিং</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsSubTab('support')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  settingsSubTab === 'support'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>সাপোর্ট ও সোশ্যাল লিংক</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsSubTab('payments')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  settingsSubTab === 'payments'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>পেমেন্ট নম্বর ও উইথড্র লিমিট</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsSubTab('rewards')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  settingsSubTab === 'rewards'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>বোনাস ও কমিশন রেট</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsSubTab('landing')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  settingsSubTab === 'landing'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>ল্যান্ডিং পেজ ও FAQ কাস্টমাইজ</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsSubTab('security')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  settingsSubTab === 'security'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>অ্যাডমিন পাসওয়ার্ড পরিবর্তন</span>
              </button>

              <button
                type="button"
                onClick={() => setSettingsSubTab('cloud')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  settingsSubTab === 'cloud'
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>ক্লাউড ফায়ারস্টোর ডেটাবেস</span>
              </button>
            </div>

            {/* Sub-tab 1: General & Brand */}
            {settingsSubTab === 'general' && (
              <form onSubmit={handleSaveSettings} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      <span>সাধারণ তথ্য ও নোটিশ সেটিংস</span>
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      প্ল্যাটফর্মের নাম, হোম স্ক্রিনের মার্কি অ্যানাউন্সমেন্ট এবং পপ-আপ অ্যালার্ট নিয়ন্ত্রণ করুন
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-200 font-bold block">প্ল্যাটফর্মের অফিসিয়াল ব্র্যান্ড নাম (Brand Name):</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.brandName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                    placeholder="Earnora"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold text-xs focus:ring-1 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-slate-400">পুরো ওয়েবসাইট, ড্যাশবোর্ড, টাইটেল ও কপিরাইটে এই নামটি দেখাবে।</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-200 font-bold block">হোম স্ক্রিনের স্ক্রোলিং নোটিশ (Announcement Marquee):</label>
                  <textarea
                    rows={3}
                    value={settingsForm.announcement}
                    onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                    placeholder="📢 স্বাগতম! প্রতিটি টাস্ক সম্পূর্ণ করে এবং বন্ধুদের রেফার করে নিশ্চিত আয় করুন..."
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Pop-up Alert Modal Settings (Matches Screenshot with Telegram Channels, Groups & Social Links) */}
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">সাইট ভিজিট পপ-আপ নোটিশ (Site Visit Popup Notice)</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            settingsForm.popupNotice?.enabled
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {settingsForm.popupNotice?.enabled ? 'সক্রিয় (ON)' : 'নিষ্ক্রিয় (OFF)'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">ইউজার সাইট ওপেন করলে বা ঢুকলে এই জরুরী নোটিশটি পপ-আপ হিসেবে ভাসবে (টেলিগ্রাম ও সোশ্যাল বাটন সহ)</p>
                      </div>
                    </div>

                    {/* Interactive Switch Toggle */}
                    <button
                      type="button"
                      onClick={handleTogglePopupNotice}
                      role="switch"
                      aria-checked={settingsForm.popupNotice?.enabled}
                      className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settingsForm.popupNotice?.enabled ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          settingsForm.popupNotice?.enabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {settingsForm.popupNotice?.enabled && (
                    <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>পপ-আপ কাস্টমাইজেশন ও সোশ্যাল লিংকস</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setPreviewNoticeModalOpen(true)}
                          className="px-3 py-1 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs rounded-lg font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>লাইভ প্রিভিউ দেখুন</span>
                        </button>
                      </div>

                      {/* Title & Message */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-300 font-bold block text-xs">পপ-আপ শিরোনাম (Title):</label>
                          <input
                            type="text"
                            value={settingsForm.popupNotice?.title || ''}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                popupNotice: {
                                  enabled: true,
                                  title: e.target.value,
                                  message: settingsForm.popupNotice?.message || '',
                                  channelButtonText: settingsForm.popupNotice?.channelButtonText,
                                  channelUrl: settingsForm.popupNotice?.channelUrl,
                                  groupButtonText: settingsForm.popupNotice?.groupButtonText,
                                  groupUrl: settingsForm.popupNotice?.groupUrl,
                                  facebookUrl: settingsForm.popupNotice?.facebookUrl,
                                  youtubeUrl: settingsForm.popupNotice?.youtubeUrl,
                                  instagramUrl: settingsForm.popupNotice?.instagramUrl,
                                },
                              })
                            }
                            placeholder="যেমন: জরুরী নোটিশ!"
                            className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-sky-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-300 font-bold block text-xs">বিজ্ঞপ্তির বার্তা (Notice Text):</label>
                          <textarea
                            rows={2}
                            value={settingsForm.popupNotice?.message || ''}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                popupNotice: {
                                  enabled: true,
                                  title: settingsForm.popupNotice?.title || '',
                                  message: e.target.value,
                                  channelButtonText: settingsForm.popupNotice?.channelButtonText,
                                  channelUrl: settingsForm.popupNotice?.channelUrl,
                                  groupButtonText: settingsForm.popupNotice?.groupButtonText,
                                  groupUrl: settingsForm.popupNotice?.groupUrl,
                                  facebookUrl: settingsForm.popupNotice?.facebookUrl,
                                  youtubeUrl: settingsForm.popupNotice?.youtubeUrl,
                                  instagramUrl: settingsForm.popupNotice?.instagramUrl,
                                },
                              })
                            }
                            placeholder="যেমন: একটিও গুরুত্বপূর্ণ আপডেট মিস করবেন না!..."
                            className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs leading-relaxed focus:ring-1 focus:ring-sky-500"
                          />
                        </div>
                      </div>

                      {/* Telegram Primary Buttons Configuration */}
                      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
                        <span className="text-xs font-bold text-sky-300 block">টেলিগ্রাম প্রাইমারি বাটন সেটিংস (Telegram Action Buttons)</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Channel Button */}
                          <div className="space-y-1.5 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                            <label className="text-slate-300 font-bold text-[11px] block">১. চ্যানেল বাটনের নাম ও লিংক:</label>
                            <input
                              type="text"
                              value={settingsForm.popupNotice?.channelButtonText || ''}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  popupNotice: {
                                    ...settingsForm.popupNotice!,
                                    channelButtonText: e.target.value,
                                  },
                                })
                              }
                              placeholder="Join Officials Channel"
                              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs mb-1"
                            />
                            <input
                              type="text"
                              value={settingsForm.popupNotice?.channelUrl || ''}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  popupNotice: {
                                    ...settingsForm.popupNotice!,
                                    channelUrl: e.target.value,
                                  },
                                })
                              }
                              placeholder="যেমন: https://t.me/fahimpaybd"
                              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                            />
                          </div>

                          {/* Group Button */}
                          <div className="space-y-1.5 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                            <label className="text-slate-300 font-bold text-[11px] block">২. গ্রুপ বাটনের নাম ও লিংক:</label>
                            <input
                              type="text"
                              value={settingsForm.popupNotice?.groupButtonText || ''}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  popupNotice: {
                                    ...settingsForm.popupNotice!,
                                    groupButtonText: e.target.value,
                                  },
                                })
                              }
                              placeholder="Join Officials Group"
                              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs mb-1"
                            />
                            <input
                              type="text"
                              value={settingsForm.popupNotice?.groupUrl || ''}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  popupNotice: {
                                    ...settingsForm.popupNotice!,
                                    groupUrl: e.target.value,
                                  },
                                })
                              }
                              placeholder="যেমন: https://t.me/fahimpaybd_group"
                              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Social Media Links (Facebook, YouTube, Instagram) */}
                      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
                        <span className="text-xs font-bold text-slate-200 block">অন্যান্য সোশ্যাল লিংক (অথবা যুক্ত হন):</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {/* Facebook */}
                          <div className="space-y-1">
                            <label className="text-blue-400 font-bold text-[11px] flex items-center gap-1">
                              <span>Facebook Link:</span>
                            </label>
                            <input
                              type="text"
                              value={settingsForm.popupNotice?.facebookUrl || ''}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  popupNotice: {
                                    ...settingsForm.popupNotice!,
                                    facebookUrl: e.target.value,
                                  },
                                })
                              }
                              placeholder="https://facebook.com/..."
                              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                            />
                          </div>

                          {/* YouTube */}
                          <div className="space-y-1">
                            <label className="text-red-400 font-bold text-[11px] flex items-center gap-1">
                              <span>YouTube Link:</span>
                            </label>
                            <input
                              type="text"
                              value={settingsForm.popupNotice?.youtubeUrl || ''}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  popupNotice: {
                                    ...settingsForm.popupNotice!,
                                    youtubeUrl: e.target.value,
                                  },
                                })
                              }
                              placeholder="https://youtube.com/..."
                              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                            />
                          </div>

                          {/* Instagram */}
                          <div className="space-y-1">
                            <label className="text-pink-400 font-bold text-[11px] flex items-center gap-1">
                              <span>Instagram Link:</span>
                            </label>
                            <input
                              type="text"
                              value={settingsForm.popupNotice?.instagramUrl || ''}
                              onChange={(e) =>
                                setSettingsForm({
                                  ...settingsForm,
                                  popupNotice: {
                                    ...settingsForm.popupNotice!,
                                    instagramUrl: e.target.value,
                                  },
                                })
                              }
                              placeholder="https://instagram.com/..."
                              className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Maintenance Mode Toggle */}
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">সিস্টেম মেইনটেন্যান্স মোড (Maintenance Mode)</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            settingsForm.maintenanceMode?.enabled
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {settingsForm.maintenanceMode?.enabled ? 'মেইনটেন্যান্স চালু (Site Closed)' : 'স্বাভাবিক চালু (Normal Active)'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">জরুরি আপডেটের সময় সাধারণ ইউজারদের জন্য সাইট সাময়িক স্থগিত রাখতে চালু করুন</p>
                      </div>
                    </div>

                    {/* Interactive Switch Toggle */}
                    <button
                      type="button"
                      onClick={handleToggleMaintenanceMode}
                      role="switch"
                      aria-checked={settingsForm.maintenanceMode?.enabled}
                      className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settingsForm.maintenanceMode?.enabled ? 'bg-rose-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          settingsForm.maintenanceMode?.enabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {settingsForm.maintenanceMode?.enabled && (
                    <div className="space-y-2 pt-3 border-t border-slate-800 animate-in fade-in duration-200">
                      <label className="text-slate-300 font-bold block text-xs">মেইনটেন্যান্স বার্তা (ইউজাররা যা দেখতে পাবে):</label>
                      <input
                        type="text"
                        value={settingsForm.maintenanceMode?.message || ''}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            maintenanceMode: {
                              enabled: true,
                              message: e.target.value,
                            },
                          })
                        }
                        placeholder="সিস্টেম আপগ্রেডের কাজ চলছে, কিছুক্ষণ পর আবার চেষ্টা করুন..."
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-rose-500"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-md transition-transform active:scale-98"
                >
                  সাধারণ সেটিংস সংরক্ষণ করুন
                </button>
              </form>
            )}

            {/* Sub-tab 2: Support & Social Channels */}
            {settingsSubTab === 'support' && (
              <form onSubmit={handleSaveSettings} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>সাপোর্ট হেল্পলাইন ও সোশ্যাল চ্যানেল লিংক</span>
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ব্যবহারকারী যখন WhatsApp বা Telegram সাপোর্টে ক্লিক করবে তখন সরাসরি এই লিঙ্কগুলোতে পৌঁছাবে
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* WhatsApp Helpline */}
                  <div className="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-200 font-bold text-xs flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        <span>হোয়াটসঅ্যাপ হেল্পলাইন নম্বর (WhatsApp Number):</span>
                      </label>
                      {settingsForm.supportWhatsapp && (
                        <a
                          href={formatWhatsAppLink(settingsForm.supportWhatsapp)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800"
                        >
                          <span>টেস্ট করুন</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type="text"
                      value={settingsForm.supportWhatsapp}
                      onChange={(e) => setSettingsForm({ ...settingsForm, supportWhatsapp: e.target.value })}
                      placeholder="+880 1700-000000 বা 01712345678"
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400">যে ফরম্যাটেই লিখুন না কেন, ইউজার সরাসরি আপনার হোয়াটসঅ্যাপ চ্যাটে চলে যাবে।</p>
                  </div>

                  {/* Telegram Channel / Support Link (Controls Dashboard Telegram Button & Support) */}
                  <div className="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-200 font-bold text-xs flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                        <span>ড্যাশবোর্ড ও অফিশিয়াল টেলিগ্রাম চ্যানেল/লিংক (Telegram Link):</span>
                      </label>
                      {settingsForm.supportTelegram && (
                        <a
                          href={formatTelegramLink(settingsForm.supportTelegram)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium bg-sky-950/60 px-2.5 py-0.5 rounded border border-sky-800"
                        >
                          <span>টেস্ট করুন</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type="text"
                      value={settingsForm.supportTelegram}
                      onChange={(e) => setSettingsForm({ ...settingsForm, supportTelegram: e.target.value })}
                      placeholder="@earnora_official বা https://t.me/earnora_official"
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-sky-500"
                    />
                    <p className="text-[10px] text-slate-400">এই লিংকটি ইউজার ড্যাশবোর্ডের <strong>Telegram</strong> বাটন এবং সাপোর্ট পেজে কাজ করবে।</p>
                  </div>

                  {/* YouTube Channel / Tutorial Link (Controls Dashboard YouTube Button) */}
                  <div className="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-200 font-bold text-xs flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span>ড্যাশবোর্ড ও অফিশিয়াল ইউটিউব চ্যানেল/টিউটোরিয়াল (YouTube Link):</span>
                      </label>
                      {settingsForm.heroVideoUrl && (
                        <a
                          href={settingsForm.heroVideoUrl.startsWith('http') ? settingsForm.heroVideoUrl : `https://${settingsForm.heroVideoUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-medium bg-red-950/60 px-2.5 py-0.5 rounded border border-red-800"
                        >
                          <span>টেস্ট করুন</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <input
                      type="text"
                      value={settingsForm.heroVideoUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroVideoUrl: e.target.value })}
                      placeholder="https://youtube.com/@yourchannel বা https://youtube.com/watch?v=..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-red-500"
                    />
                    <p className="text-[10px] text-slate-400">এই লিংকটি ইউজার ড্যাশবোর্ডের <strong>YouTube</strong> বাটন এবং ল্যান্ডিং পেজে কাজ করবে।</p>
                  </div>

                  {/* Telegram Community Group Link */}
                  <div className="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80">
                    <label className="text-slate-200 font-bold text-xs flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                      <span>টেলিগ্রাম ডিসকাশন / পেমেন্ট প্রুফ গ্রুপ (Telegram Group Link):</span>
                    </label>
                    <input
                      type="text"
                      value={settingsForm.telegramGroupUrl || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, telegramGroupUrl: e.target.value })}
                      placeholder="https://t.me/earnora_community"
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Mobile Phone Helpline */}
                  <div className="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80">
                    <label className="text-slate-200 font-bold text-xs flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span>জরুরি মোবাইল হটলাইন নম্বর (Phone Helpline):</span>
                    </label>
                    <input
                      type="text"
                      value={settingsForm.supportPhone || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                      placeholder="+880 1700-000000"
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Support Email */}
                  <div className="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80">
                    <label className="text-slate-200 font-bold text-xs flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                      <span>অফিসিয়াল ইমেইল সাপোর্ট (Support Email):</span>
                    </label>
                    <input
                      type="email"
                      value={settingsForm.supportEmail || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                      placeholder="support@earnora.com"
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-violet-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-md transition-transform active:scale-98"
                >
                  সাপোর্ট সেটিংস সংরক্ষণ করুন
                </button>
              </form>
            )}

            {/* Sub-tab 3: Payment Numbers & Withdrawal Limits */}
            {settingsSubTab === 'payments' && (
              <form onSubmit={handleSaveSettings} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>পেমেন্ট মেথড ও উইথড্রয়াল লিমিট কনফিগারেশন</span>
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      বিকাশ, নগদ ও রকেট একাউন্ট নম্বর এবং ইউজারদের টাকা তোলার সীমা নির্ধারণ করুন
                    </p>
                  </div>
                </div>

                {/* Gateway Numbers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-pink-500/30">
                    <label className="text-pink-400 font-bold block text-xs">বিকাশ নম্বর (bKash Number):</label>
                    <input
                      type="text"
                      value={settingsForm.bkashNumber || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bkashNumber: e.target.value })}
                      placeholder="017xxxxxxxx (Personal/Agent)"
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-amber-500/30">
                    <label className="text-amber-400 font-bold block text-xs">নগদ নম্বর (Nagad Number):</label>
                    <input
                      type="text"
                      value={settingsForm.nagadNumber || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, nagadNumber: e.target.value })}
                      placeholder="018xxxxxxxx (Personal/Agent)"
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 bg-slate-900/80 p-3.5 rounded-xl border border-purple-500/30">
                    <label className="text-purple-400 font-bold block text-xs">রকেট নম্বর (Rocket Number):</label>
                    <input
                      type="text"
                      value={settingsForm.rocketNumber || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, rocketNumber: e.target.value })}
                      placeholder="019xxxxxxxx (Personal/Agent)"
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Limits & Fees */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">সর্বনিম্ন উইথড্র সীমা (টাকা):</label>
                    <input
                      type="number"
                      required
                      min="10"
                      value={settingsForm.minWithdrawal}
                      onChange={(e) => setSettingsForm({ ...settingsForm, minWithdrawal: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">সর্বোচ্চ এককালীন উইথড্র (টাকা):</label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={settingsForm.maxWithdrawal || 50000}
                      onChange={(e) => setSettingsForm({ ...settingsForm, maxWithdrawal: parseFloat(e.target.value) || 50000 })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block">উইথড্রয়াল প্রসেসিং ফি (%):</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="50"
                      step="0.5"
                      value={settingsForm.withdrawalFeePercent}
                      onChange={(e) => setSettingsForm({ ...settingsForm, withdrawalFeePercent: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-md transition-transform active:scale-98"
                >
                  পেমেন্ট সেটিংস সংরক্ষণ করুন
                </button>
              </form>
            )}

            {/* Sub-tab 4: Rewards & Bonuses */}
            {settingsSubTab === 'rewards' && (
              <form onSubmit={handleSaveSettings} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span>বোনাস ও রেফারেল ইনকাম সেটিংস</span>
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      নতুন ইউজারদের রেজিস্ট্রেশন ওয়েলকাম বোনাস, রেফারেল রিওয়ার্ড ও দৈনিক লগইন বোনাস নির্ধারণ করুন
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5 bg-slate-900/80 p-4 rounded-xl border border-slate-700">
                    <label className="text-emerald-400 font-bold block text-xs">রেজিস্ট্রেশন সাইনআপ বোনাস (টাকা):</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={settingsForm.signupBonus ?? 10}
                      onChange={(e) => setSettingsForm({ ...settingsForm, signupBonus: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-400">নতুন অ্যাকাউন্ট খোলার সাথে সাথে ব্যালেন্সে যোগ হবে।</p>
                  </div>

                  <div className="space-y-1.5 bg-slate-900/80 p-4 rounded-xl border border-slate-700">
                    <label className="text-amber-400 font-bold block text-xs">প্রতি রেফারেল বোনাস (টাকা):</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={settingsForm.referralReward}
                      onChange={(e) => setSettingsForm({ ...settingsForm, referralReward: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-400">রেফার করা বন্ধু কাজ শুরু করলে রেফারকারী এই বোনাস পাবেন।</p>
                  </div>

                  <div className="space-y-1.5 bg-slate-900/80 p-4 rounded-xl border border-slate-700">
                    <label className="text-sky-400 font-bold block text-xs">দৈনিক চেক-ইন বোনাস (টাকা):</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={settingsForm.dailyCheckinReward ?? 1}
                      onChange={(e) => setSettingsForm({ ...settingsForm, dailyCheckinReward: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-400">প্রতিদিন অ্যাপে লগইন করে দাবি করতে পারবে।</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-md transition-transform active:scale-98"
                >
                  বোনাস ও রিওয়ার্ড সেটিংস সংরক্ষণ করুন
                </button>
              </form>
            )}

            {/* Sub-tab 5: Landing Page & FAQ Customization */}
            {settingsSubTab === 'landing' && (
              <div className="space-y-6">
                <form onSubmit={handleSaveSettings} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div>
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-sky-400" />
                        <span>ল্যান্ডিং পেজ টেক্সট ও ভিডিও কনফিগারেশন</span>
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        হোম পেজের প্রধান শিরোনাম, বর্ণনা এবং ইউটিউব টিউটোরিয়াল ভিডিও পরিবর্তন করুন
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-bold block">ল্যান্ডিং পেজ প্রধান শিরোনাম (Hero Title):</label>
                      <input
                        type="text"
                        value={settingsForm.heroTitle || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                        placeholder="Earn Smarter With A Trusted Digital Platform"
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-bold block">ল্যান্ডিং পেজ বর্ণনা (Hero Description):</label>
                      <textarea
                        rows={3}
                        value={settingsForm.heroSubtitle || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                        placeholder="একটি আধুনিক ও নির্ভরযোগ্য ডিজিটাল প্ল্যাটফর্ম যেখানে আপনি সহজে টাস্ক সম্পন্ন করে আয় করতে পারবেন..."
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs leading-relaxed"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-bold block">ইউটিউব টিউটোরিয়াল ভিডিও লিংক (YouTube Video URL):</label>
                      <input
                        type="text"
                        value={settingsForm.heroVideoUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, heroVideoUrl: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-md transition-transform active:scale-98"
                  >
                    ল্যান্ডিং পেজ সেটিংস সংরক্ষণ করুন
                  </button>
                </form>

                {/* FAQ Management Section */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-emerald-400" />
                        <span>সাধারণ জিজ্ঞাসা (FAQ প্রশ্ন-উত্তর ম্যানেজার)</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        ওয়েবসাইটে প্রদর্শন করার জন্য নতুন প্রশ্ন ও উত্তর যুক্ত বা মুছে ফেলুন
                      </p>
                    </div>
                  </div>

                  {/* Add New FAQ Form */}
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/80 space-y-3">
                    <h4 className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      <span>নতুন FAQ যুক্ত করুন:</span>
                    </h4>
                    <input
                      type="text"
                      value={newFaqForm.question}
                      onChange={(e) => setNewFaqForm({ ...newFaqForm, question: e.target.value })}
                      placeholder="প্রশ্ন লিখুন (যেমন: পেমেন্ট পেতে কতক্ষণ সময় লাগে?)"
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                    />
                    <textarea
                      rows={2}
                      value={newFaqForm.answer}
                      onChange={(e) => setNewFaqForm({ ...newFaqForm, answer: e.target.value })}
                      placeholder="উত্তর লিখুন (যেমন: রিকোয়েস্ট করার ১২ থেকে ২৪ ঘণ্টার মধ্যে পেমেন্ট পৌঁছে যাবে)..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs leading-relaxed"
                    />
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>তালিকায় যুক্ত করুন</span>
                    </button>
                  </div>

                  {/* Existing FAQ List */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-white text-xs">বর্তমান FAQ তালিকা ({(settingsForm.faqs || []).length} টি):</h4>
                    {(settingsForm.faqs || []).length === 0 ? (
                      <p className="text-slate-500 italic text-[11px] py-2">এখনও কোনো কাস্টম FAQ যুক্ত করা হয়নি (ডিফল্ট FAQ দেখানো হচ্ছে)।</p>
                    ) : (
                      (settingsForm.faqs || []).map((faq, idx) => (
                        <div key={faq.id || idx} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/70 space-y-1.5 relative group">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-bold text-slate-100 text-xs">
                              {idx + 1}. {faq.question}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleDeleteFaq(idx)}
                              className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-950/40 transition-colors"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{faq.answer}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveSettings()}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl shadow-md transition-transform active:scale-98"
                  >
                    সকল FAQ পরিবর্তন সংরক্ষণ করুন
                  </button>
                </div>
              </div>
            )}

            {/* Sub-tab 6: Admin Password Security */}
            {settingsSubTab === 'security' && (
              <form onSubmit={handleChangeAdminPassword} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-5 shadow-sm max-w-lg">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>সুপার অ্যাডমিন পাসওয়ার্ড পরিবর্তন</span>
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      অ্যাডমিন প্যানেলের নিরাপত্তা বজায় রাখতে এখান থেকে সরাসরি পাসওয়ার্ড পরিবর্তন করুন
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">বর্তমান পাসওয়ার্ড (Current Password):</label>
                    <input
                      type="password"
                      value={adminPasswordForm.currentPassword}
                      onChange={(e) => setAdminPasswordForm({ ...adminPasswordForm, currentPassword: e.target.value })}
                      placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">নতুন পাসওয়ার্ড (New Password):</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={adminPasswordForm.newPassword}
                      onChange={(e) => setAdminPasswordForm({ ...adminPasswordForm, newPassword: e.target.value })}
                      placeholder="কমপক্ষে ৬ অক্ষরের নতুন পাসওয়ার্ড"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-bold block">কনফার্ম নতুন পাসওয়ার্ড (Confirm New Password):</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={adminPasswordForm.confirmNewPassword}
                      onChange={(e) => setAdminPasswordForm({ ...adminPasswordForm, confirmNewPassword: e.target.value })}
                      placeholder="নতুন পাসওয়ার্ডটি পুনরায় লিখুন"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminPasswordLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-transform active:scale-98 flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{adminPasswordLoading ? 'পরিবর্তন করা হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}</span>
                </button>
              </form>
            )}

            {/* Sub-tab 7: Cloud Database (Firebase Firestore) */}
            {settingsSubTab === 'cloud' && (
              <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-indigo-950/40 border-2 border-indigo-500/40 rounded-2xl p-6 space-y-5 shadow-lg">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm">
                          ক্লাউড ডেটাবেস সুরক্ষা ও পারসিস্টেন্স (Firebase Firestore)
                        </h3>
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          সংযুক্ত ও সুরক্ষিত
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        সার্ভার রিস্টার্ট বা কোড আপডেট হলেও নতুন ইউজার ও লেনদেন কখনো মুছে যাবে না
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-400" />
                      বর্তমান রেজিস্টার্ড ইউজার:
                    </span>
                    <p className="text-white font-bold text-base">
                      {cloudSyncInfo?.localUsersCount !== undefined ? cloudSyncInfo.localUsersCount : users.length} জন
                    </p>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      সর্বশেষ ক্লাউড সিঙ্ক:
                    </span>
                    <p className="text-white font-mono text-[11px]">
                      {cloudSyncInfo?.lastSync ? new Date(cloudSyncInfo.lastSync).toLocaleString('bn-BD') : 'সার্বক্ষণিক অটো-সিঙ্ক সক্রিয়'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    disabled={cloudSyncLoading}
                    onClick={handlePushToCloud}
                    className="flex-1 min-w-[160px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{cloudSyncLoading ? 'সিঙ্ক হচ্ছে...' : 'ক্লাউডে ম্যানুয়াল ব্যাকআপ পুশ করুন'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={cloudSyncLoading}
                    onClick={handlePullFromCloud}
                    className="flex-1 min-w-[160px] flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs py-3 px-4 rounded-xl border border-slate-700 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${cloudSyncLoading ? 'animate-spin text-amber-400' : ''}`} />
                    <span>ক্লাউড থেকে ডেটা রিস্টোর করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 8. AUDIT LOGS TAB */}
        {/* ========================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white">সিকিউরিটি ও অ্যাডমিন অ্যাকশন লগ ({auditLogs.length})</h2>

            {auditLogs.length === 0 ? (
              <div className="bg-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs border border-slate-700">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400 opacity-60" />
                <p className="font-bold text-white">কোনো অডিট লগ রেকর্ড নেই</p>
              </div>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-800 rounded-xl p-3.5 border border-slate-700/80 text-xs space-y-1 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-400 font-mono">{log.action}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.createdAt).toLocaleString('bn-BD')}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      অ্যাক্টর: <span className="text-slate-200">{log.actorEmail || log.actorId}</span>
                    </p>
                    {log.details && (
                      <pre className="text-[10px] bg-slate-900 p-2 rounded-lg text-slate-400 overflow-x-auto font-mono">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 9. ADMIN ROLES & GRANULAR PERMISSIONS TAB */}
        {/* ========================================================= */}
        {activeTab === 'roles' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800 p-4 rounded-2xl border border-slate-700">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>অ্যাডমিন ও রোল ম্যানেজমেন্ট ({adminRolesList.length})</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  যেকোনো ইউজারকে অ্যাডমিন বানাতে পারবেন এবং তিনি কি কি কাজ করতে পারবেন তা কাস্টমাইজ করতে পারবেন।
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('users');
                    showToast('যেকোনো ইউজারের ডানপাশে "অ্যাডমিন ও পারমিশন" বাটনে ক্লিক করুন', 'info');
                  }}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন অ্যাডমিন নিয়োগ করুন</span>
                </button>
              </div>
            </div>

            {/* Admin Roles List Cards */}
            <div className="space-y-3">
              {adminRolesList.map((r) => {
                const isFounder = r.userEmail.toLowerCase() === 'fahim236455@gmail.com';

                return (
                  <div
                    key={r.id}
                    className="bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-3 text-xs shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700/80 pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{r.userName}</span>
                          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/30">
                            {r.title}
                          </span>
                          {r.isSuperAdmin && (
                            <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-500/30">
                              SUPER ADMIN
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-[11px] font-mono">
                          {r.userEmail} • {r.userPhone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1 sm:pt-0">
                        <button
                          onClick={() => {
                            const u = users.find((usr) => usr.id === r.userId) || {
                              id: r.userId,
                              email: r.userEmail,
                              fullName: r.userName,
                              phoneNumber: r.userPhone,
                              referralCode: '',
                              balance: 0,
                              totalEarned: 0,
                              totalWithdrawn: 0,
                              totalReferrals: 0,
                              status: 'active',
                              createdAt: '',
                              roles: ['admin'],
                            };
                            handleOpenAssignRoleModal(u);
                          }}
                          className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1 border border-slate-600"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span>পারমিশন এডিট</span>
                        </button>

                        {!isFounder && (
                          <button
                            onClick={() => handleRevokeAdminAccess(r.userId, r.userEmail)}
                            className="bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>অ্যাডমিন বাতিল</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Permissions Badges Grid */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-slate-400 font-bold block uppercase tracking-wider">
                        প্রদত্ত ক্ষমতার তালিকা (Assigned Permissions):
                      </span>
                      {r.isSuperAdmin ? (
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[11px] font-bold flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>সুপার অ্যাডমিন: সকল কন্ট্রোল ও সিকিউরিটি এক্সেস উন্মুক্ত (Full Unrestricted Access)।</span>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {r.permissions.canManageTasks && (
                            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>টাস্ক তৈরি ও পরিচালনা</span>
                            </span>
                          )}
                          {r.permissions.canReviewTaskProofs && (
                            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>টাস্ক প্রুফ রিভিউ</span>
                            </span>
                          )}
                          {r.permissions.canManageSocialJobs && (
                            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>সোশ্যাল কাজের রেট ও সেটিংস</span>
                            </span>
                          )}
                          {r.permissions.canReviewSocialSubmissions && (
                            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>সোশ্যাল সেল রিভিউ</span>
                            </span>
                          )}
                          {r.permissions.canManageWithdrawals && (
                            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>উইথড্রয়াল অনুমোদন</span>
                            </span>
                          )}
                          {r.permissions.canManageUsers && (
                            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>ইউজার ও ব্যালেন্স নিয়ন্ত্রণ</span>
                            </span>
                          )}
                          {r.permissions.canManageSupport && (
                            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>সাপোর্ট ও লাইভ চ্যাট</span>
                            </span>
                          )}
                          {r.permissions.canEditSiteSettings && (
                            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>সাইট সেটিংস ও নোটিশ</span>
                            </span>
                          )}
                          {r.permissions.canViewAuditLogs && (
                            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>অডিট লগ ও হিস্ট্রি</span>
                            </span>
                          )}
                          {r.permissions.canManageAdmins && (
                            <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>অ্যাডমিন নিয়োগ ও পারমিশন</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ROLE ASSIGNMENT & GRANULAR PERMISSIONS MODAL */}
        {/* ========================================================= */}
        {showRoleModal && selectedUserForRole && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
            onClick={() => setShowRoleModal(false)}
          >
            <form
              onSubmit={handleSaveRoleAssignment}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      অ্যাডমিন রোল ও পারমিশন সেটআপ
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      ইউজার: <strong className="text-amber-300 font-mono">{selectedUserForRole.email}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content Scrollable */}
              <div className="p-4 overflow-y-auto space-y-4 text-xs">
                {/* Admin Title Input */}
                <div className="space-y-1">
                  <label className="text-slate-200 font-bold block">অ্যাডমিন টাইটেল / পদের নাম:</label>
                  <input
                    type="text"
                    required
                    value={roleFormTitle}
                    onChange={(e) => setRoleFormTitle(e.target.value)}
                    placeholder="যেমন: টাস্ক মডারেটর, ফাইন্যান্স অফিসার, কাস্টমার সাপোর্ট..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block text-[11px]">
                    দ্রুত রেডিমেড রোল টেমপ্লেট নির্বাচন করুন (Presets):
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleApplyRolePreset('moderator')}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left space-y-0.5 transition-colors"
                    >
                      <span className="font-bold text-amber-300 block">📝 টাস্ক ও প্রুফ মডারেটর</span>
                      <span className="text-[10px] text-slate-400 block">কাজের প্রুফ রিভিউ ও সোশ্যাল সেল</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyRolePreset('finance')}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left space-y-0.5 transition-colors"
                    >
                      <span className="font-bold text-emerald-300 block">💳 উইথড্র ও ফাইন্যান্স</span>
                      <span className="text-[10px] text-slate-400 block">ক্যাশআউট রিকোয়েস্ট ও ব্যালেন্স</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyRolePreset('support')}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-left space-y-0.5 transition-colors"
                    >
                      <span className="font-bold text-sky-300 block">🎧 কাস্টমার সাপোর্ট</span>
                      <span className="text-[10px] text-slate-400 block">সাপোর্ট টিকিট ও হেল্পলাইন</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyRolePreset('super')}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-amber-500/40 text-left space-y-0.5 transition-colors"
                    >
                      <span className="font-bold text-purple-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>সুপার অ্যাডমিন</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">সব কিছুর ফুল পারমিশন</span>
                    </button>
                  </div>
                </div>

                {/* Super Admin Toggle */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white text-xs block">সুপার অ্যাডমিন ক্ষমতা দিন (Super Admin)</span>
                    <span className="text-[10px] text-slate-400 block">
                      সুপার অ্যাডমিন সকল সেটিংস ও রোল নিয়ন্ত্রণ করার পূর্ণ স্বাধীনতা পাবে।
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={roleFormIsSuper}
                    disabled={selectedUserForRole.email.toLowerCase() === 'fahim236455@gmail.com'}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setRoleFormIsSuper(checked);
                      if (checked) {
                        handleApplyRolePreset('super');
                      }
                    }}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                {/* Granular Checkboxes List */}
                <div className="space-y-2 pt-1">
                  <span className="text-slate-200 font-bold block text-xs border-b border-slate-800 pb-1">
                    কাস্টম এক্সেস পারমিশনসমূহ (Granular Action Permissions):
                  </span>

                  {[
                    {
                      key: 'canManageTasks',
                      label: '১. মাইক্রো টাস্ক তৈরি ও পরিচালনা',
                      desc: 'নতুন কাজ তৈরি, ফিগার রিওয়ার্ড ও পোস্ট আপডেট বা স্থগিত করা',
                    },
                    {
                      key: 'canReviewTaskProofs',
                      label: '২. টাস্ক প্রুফ ও সাবমিশন রিভিউ',
                      desc: 'ইউজারদের জমা দেওয়া কাজের প্রুফ যাচাই, অনুমোদন ও রিফান্ড',
                    },
                    {
                      key: 'canManageSocialJobs',
                      label: '৩. সোশ্যাল কাজের রেট ও সেটিংস',
                      desc: 'জিমেইল, ফেসবুক ও ইনস্টাগ্রাম কাজের প্রাইস রেট ও পাসওয়ার্ড পরিবর্তন',
                    },
                    {
                      key: 'canReviewSocialSubmissions',
                      label: '৪. সোশ্যাল অ্যাকাউন্ট সেল রিভিউ',
                      desc: 'গ্রাহকদের জমা দেওয়া সোশ্যাল সেল অ্যাকাউন্ট চেক ও টাকা প্রদান',
                    },
                    {
                      key: 'canManageWithdrawals',
                      label: '৫. ক্যাশআউট / উইথড্রয়াল অনুমোদন',
                      desc: 'বিকাশ, নগদ ও রকেট দিয়ে টাকা তোলার রিকোয়েস্ট অনুমোদন ও পেইড মার্ক করা',
                    },
                    {
                      key: 'canManageUsers',
                      label: '৬. ইউজার লিস্ট ও ব্যালেন্স (+/-) নিয়ন্ত্রণ',
                      desc: 'ইউজারের ব্যালেন্স বাড়ানো/কমানো এবং অ্যাকাউন্ট স্থগিত বা সক্রিয় করা',
                    },
                    {
                      key: 'canManageSupport',
                      label: '৭. সাপোর্ট টিকিট ও লাইভ চ্যাট',
                      desc: 'গ্রাহকদের সাথে সরাসরি চ্যাট করা ও টিকিটের উত্তর দেওয়া',
                    },
                    {
                      key: 'canEditSiteSettings',
                      label: '৮. সাইট সেটিংস ও নোটিশ এডিট',
                      desc: 'হেডার নোটিশ, মিনিমাম উইথড্র সীমা ও হেল্পলাইন নাম্বার পরিবর্তন',
                    },
                    {
                      key: 'canViewAuditLogs',
                      label: '৯. অডিট ও সিকিউরিটি লগ',
                      desc: 'প্ল্যাটফর্মের সিকিউরিটি ইভেন্ট ও লগ পরিদর্শন করা',
                    },
                    {
                      key: 'canManageAdmins',
                      label: '১০. নতুন অ্যাডমিন নিয়োগ ও রোল পারমিশন',
                      desc: 'অন্যান্য ইউজারদের অ্যাডমিন বানানো বা পারমিশন পরিবর্তন করা',
                    },
                  ].map((item) => {
                    const isChecked = roleFormIsSuper || Boolean(roleFormPermissions[item.key as keyof AdminPermissions]);
                    return (
                      <label
                        key={item.key}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          isChecked
                            ? 'bg-amber-500/10 border-amber-500/30 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={roleFormIsSuper}
                          onChange={(e) => {
                            setRoleFormPermissions({
                              ...roleFormPermissions,
                              [item.key]: e.target.checked,
                            });
                          }}
                          className="w-4 h-4 mt-0.5 accent-amber-500 rounded cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-xs block text-slate-200">{item.label}</span>
                          <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                            {item.desc}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                {selectedUserForRole.roles?.includes('admin') &&
                  selectedUserForRole.email.toLowerCase() !== 'fahim236455@gmail.com' && (
                    <button
                      type="button"
                      onClick={async () => {
                        await handleRevokeAdminAccess(selectedUserForRole.id, selectedUserForRole.email);
                        setShowRoleModal(false);
                      }}
                      className="px-3 py-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>অ্যাডমিন পদ থেকে সরিয়ে দিন</span>
                    </button>
                  )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowRoleModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={savingRole}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-transform active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{savingRole ? 'সংরক্ষণ হচ্ছে...' : 'পারমিশন সেভ করুন'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Screenshot Lightbox Modal */}
        {selectedScreenshotUrl && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
            onClick={() => setSelectedScreenshotUrl(null)}
          >
            <div
              className="relative bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>কাজের স্ক্রিনশট প্রুফ প্রিভিউ (Screenshot Proof)</span>
                </span>
                <button
                  onClick={() => setSelectedScreenshotUrl(null)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-auto flex items-center justify-center bg-slate-950/80 min-h-[300px]">
                <img
                  src={selectedScreenshotUrl}
                  alt="Full size user submission proof"
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg border border-slate-800"
                />
              </div>
              <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>স্ক্রিনশটটি মনোযোগ সহকারে যাচাই করে টাস্ক অনুমোদন বা বাতিল করুন।</span>
                <button
                  onClick={() => setSelectedScreenshotUrl(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick WhatsApp & Telegram Change Modal (Can be opened from Support Tab or anywhere) */}
        {quickSupportModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
            onClick={() => setQuickSupportModalOpen(false)}
          >
            <div
              className="relative max-w-md w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl p-5 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      WhatsApp, Telegram ও YouTube লিংক পরিবর্তন
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      ড্যাশবোর্ড সোশ্যাল বাটন ও সাপোর্ট লিংক দ্রুত আপডেট করুন
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setQuickSupportModalOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveQuickSupport} className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">
                    হোয়াটসঅ্যাপ হেল্পলাইন নম্বর:
                  </label>
                  <input
                    type="text"
                    required
                    value={quickWhatsapp}
                    onChange={(e) => setQuickWhatsapp(e.target.value)}
                    placeholder="যেমন: +880 1700-000000 বা 01712345678"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    ইউজাররা ক্লিক করলে সরাসরি এই নম্বরে হোয়াটসঅ্যাপে চ্যাট শুরু হবে।
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">
                    ড্যাশবোর্ড ও অফিশিয়াল টেলিগ্রাম লিংক (Telegram Link):
                  </label>
                  <input
                    type="text"
                    required
                    value={quickTelegram}
                    onChange={(e) => setQuickTelegram(e.target.value)}
                    placeholder="যেমন: @fahimpaybd_official বা https://t.me/fahimpaybd_official"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-sky-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    ড্যাশবোর্ডের Telegram বাটন এবং সাপোর্ট পেজে এই লিংক কাজ করবে।
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">
                    ড্যাশবোর্ড ও অফিশিয়াল ইউটিউব লিংক (YouTube Channel/Video):
                  </label>
                  <input
                    type="text"
                    value={quickYoutube}
                    onChange={(e) => setQuickYoutube(e.target.value)}
                    placeholder="যেমন: https://youtube.com/@fahimpaybd"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-red-500"
                  />
                  <p className="text-[10px] text-slate-500">
                    ড্যাশবোর্ডের YouTube বাটন এবং ল্যান্ডিং পেজে এই লিংক কাজ করবে।
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold block">
                    জরুরি মোবাইল হটলাইন নম্বর:
                  </label>
                  <input
                    type="text"
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    placeholder="+880 1700-000000"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickSupportModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={savingQuickSupport}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-transform active:scale-98 disabled:opacity-50"
                  >
                    {savingQuickSupport ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Popup Notice Preview Modal for Admin */}
        <SiteNoticeModal
          isOpen={previewNoticeModalOpen}
          onClose={() => setPreviewNoticeModalOpen(false)}
        />
      </main>
    </div>
  );
};
