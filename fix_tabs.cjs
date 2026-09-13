const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPanelPage.tsx', 'utf8');

const oldTabs = `          {[
            { id: 'overview', label: 'ওভারভিউ', icon: Activity },
            {
              id: 'social_jobs',
              label: \`সোশ্যাল কাজ (Gmail/FB/Insta)\`,
              icon: Mail,
            },
            {
              id: 'social_sales',
              label: \`সোশ্যাল সেল রিভিউ (\${socialSales.filter((s) => s.status === 'pending').length})\`,
              icon: Share2,
            },
            { id: 'tasks', label: \`ম্যানুয়াল টাস্ক তৈরি ও লিস্ট (\${tasks.length})\`, icon: Plus },
            {
              id: 'submissions',
              label: \`টাস্ক রিভিউ ও অনুমোদন (\${submissions.filter((s) => s.status === 'pending').length})\`,
              icon: CheckSquare,
            },
            {
              id: 'withdrawals',
              label: \`উইথড্রয়াল (\${withdrawals.filter((w) => w.status === 'pending').length})\`,
              icon: ArrowDownCircle,
            },
            { id: 'users', label: \`ইউজার্স (\${users.length})\`, icon: Users },
            {
              id: 'support',
              label: \`সাপোর্ট (\${tickets.filter((t) => t.status === 'open').length})\`,
              icon: Headphones,
            },
            { id: 'roles', label: \`অ্যাডমিন ও রোলস (\${adminRolesList.length || 1})\`, icon: ShieldCheck },
            { id: 'settings', label: 'সেটিংস', icon: Settings },
            { id: 'audit', label: 'অডিট লগ', icon: DollarSign },
          ].map((tab) => {`;

const newTabs = `          {[
            { id: 'overview', label: 'ওভারভিউ', icon: Activity },
            {
              id: 'social_jobs',
              label: \`সোশ্যাল কাজ (Gmail/FB/Insta)\`,
              icon: Mail,
              perm: 'canManageSocialJobs'
            },
            {
              id: 'social_sales',
              label: \`সোশ্যাল সেল রিভিউ (\${socialSales.filter((s) => s.status === 'pending').length})\`,
              icon: Share2,
              perm: 'canReviewSocialSubmissions'
            },
            { id: 'tasks', label: \`ম্যানুয়াল টাস্ক তৈরি ও লিস্ট (\${tasks.length})\`, icon: Plus, perm: 'canManageTasks' },
            {
              id: 'submissions',
              label: \`টাস্ক রিভিউ ও অনুমোদন (\${submissions.filter((s) => s.status === 'pending').length})\`,
              icon: CheckSquare,
              perm: 'canReviewTaskProofs'
            },
            {
              id: 'withdrawals',
              label: \`উইথড্রয়াল (\${withdrawals.filter((w) => w.status === 'pending').length})\`,
              icon: ArrowDownCircle,
              perm: 'canManageWithdrawals'
            },
            { id: 'users', label: \`ইউজার্স (\${users.length})\`, icon: Users, perm: 'canManageUsers' },
            {
              id: 'support',
              label: \`সাপোর্ট (\${tickets.filter((t) => t.status === 'open').length})\`,
              icon: Headphones,
              perm: 'canManageSupport'
            },
            { id: 'roles', label: \`অ্যাডমিন ও রোলস (\${adminRolesList.length || 1})\`, icon: ShieldCheck, perm: 'canManageAdmins' },
            { id: 'settings', label: 'সেটিংস', icon: Settings, perm: 'canEditSiteSettings' },
            { id: 'audit', label: 'অডিট লগ', icon: DollarSign, perm: 'canViewAuditLogs' },
          ].filter(tab => {
            if (!tab.perm) return true;
            if (user?.isSuperAdmin) return true;
            return (user?.adminPermissions as any)?.[tab.perm];
          }).map((tab) => {`;

if (content.includes(oldTabs)) {
  content = content.replace(oldTabs, newTabs);
  fs.writeFileSync('src/pages/AdminPanelPage.tsx', content, 'utf8');
  console.log('Replaced tabs mapping in AdminPanelPage.tsx');
} else {
  console.log('Could not find oldTabs in AdminPanelPage.tsx');
}
