const fs = require('fs');
let content = fs.readFileSync('server/api.ts', 'utf8');

// Replace standard endpoints with required permissions
const replacements = [
  // Users
  ["apiRouter.get('/admin/users', requireAdmin", "apiRouter.get('/admin/users', requirePermission('canManageUsers')"],
  ["apiRouter.post('/admin/users/:id/toggle-status', requireAdmin", "apiRouter.post('/admin/users/:id/toggle-status', requirePermission('canManageUsers')"],
  ["apiRouter.post('/admin/users/:id/balance', requireAdmin", "apiRouter.post('/admin/users/:id/balance', requirePermission('canManageUsers')"],
  ["apiRouter.delete('/admin/users/:id', requireAdmin", "apiRouter.delete('/admin/users/:id', requirePermission('canManageUsers')"],
  
  // Tasks
  ["apiRouter.get('/admin/tasks', requireAdmin", "apiRouter.get('/admin/tasks', requirePermission('canManageTasks')"],
  ["apiRouter.post('/admin/tasks', requireAdmin", "apiRouter.post('/admin/tasks', requirePermission('canManageTasks')"],
  ["apiRouter.put('/admin/tasks/:id', requireAdmin", "apiRouter.put('/admin/tasks/:id', requirePermission('canManageTasks')"],
  ["apiRouter.post('/admin/tasks/:id/duplicate', requireAdmin", "apiRouter.post('/admin/tasks/:id/duplicate', requirePermission('canManageTasks')"],
  ["apiRouter.delete('/admin/tasks/:id', requireAdmin", "apiRouter.delete('/admin/tasks/:id', requirePermission('canManageTasks')"],
  ["apiRouter.post('/admin/tasks/clear-all', requireAdmin", "apiRouter.post('/admin/tasks/clear-all', requirePermission('canManageTasks')"],
  
  // Submissions (Proofs)
  ["apiRouter.get('/admin/submissions', requireAdmin", "apiRouter.get('/admin/submissions', requirePermission('canReviewTaskProofs')"],
  ["apiRouter.post('/admin/submissions/:id/review', requireAdmin", "apiRouter.post('/admin/submissions/:id/review', requirePermission('canReviewTaskProofs')"],
  
  // Withdrawals
  ["apiRouter.get('/admin/withdrawals', requireAdmin", "apiRouter.get('/admin/withdrawals', requirePermission('canManageWithdrawals')"],
  ["apiRouter.post('/admin/withdrawals/:id/review', requireAdmin", "apiRouter.post('/admin/withdrawals/:id/review', requirePermission('canManageWithdrawals')"],
  
  // Tickets
  ["apiRouter.get('/admin/tickets', requireAdmin", "apiRouter.get('/admin/tickets', requirePermission('canManageSupport')"],
  ["apiRouter.post('/admin/tickets/:id/reply', requireAdmin", "apiRouter.post('/admin/tickets/:id/reply', requirePermission('canManageSupport')"],
  ["apiRouter.post('/admin/tickets/:id/status', requireAdmin", "apiRouter.post('/admin/tickets/:id/status', requirePermission('canManageSupport')"],
  ["apiRouter.get('/admin/support/tickets', requireAdmin", "apiRouter.get('/admin/support/tickets', requirePermission('canManageSupport')"],
  ["apiRouter.post('/admin/support/tickets/:id/reply', requireAdmin", "apiRouter.post('/admin/support/tickets/:id/reply', requirePermission('canManageSupport')"],
  
  // Settings
  ["apiRouter.put('/admin/settings', requireAdmin", "apiRouter.put('/admin/settings', requirePermission('canEditSiteSettings')"],
  
  // Audit Logs
  ["apiRouter.get('/admin/audit-logs', requireAdmin", "apiRouter.get('/admin/audit-logs', requirePermission('canViewAuditLogs')"],
  
  // Social Jobs Config & Tasks
  ["apiRouter.post('/admin/social-jobs/update', requireAdmin", "apiRouter.post('/admin/social-jobs/update', requirePermission('canManageSocialJobs')"],
  ["apiRouter.post('/admin/social-tasks/create', requireAdmin", "apiRouter.post('/admin/social-tasks/create', requirePermission('canManageSocialJobs')"],
  ["apiRouter.post('/admin/social-tasks/generate-1000', requireAdmin", "apiRouter.post('/admin/social-tasks/generate-1000', requirePermission('canManageSocialJobs')"],
  ["apiRouter.delete('/admin/social-tasks/:id', requireAdmin", "apiRouter.delete('/admin/social-tasks/:id', requirePermission('canManageSocialJobs')"],
  
  // Social Sales Review
  ["apiRouter.post('/admin/social-sales/:id/review', requireAdmin", "apiRouter.post('/admin/social-sales/:id/review', requirePermission('canReviewSocialSubmissions')"],
  
  // Roles
  ["apiRouter.get('/admin/roles', requireAdmin", "apiRouter.get('/admin/roles', requirePermission('canManageAdmins')"],
  ["apiRouter.post('/admin/roles/assign', requireAdmin", "apiRouter.post('/admin/roles/assign', requirePermission('canManageAdmins')"],
  ["apiRouter.post('/admin/roles/revoke', requireAdmin", "apiRouter.post('/admin/roles/revoke', requirePermission('canManageAdmins')"]
];

for (const [search, replace] of replacements) {
  content = content.replace(search, replace);
}

fs.writeFileSync('server/api.ts', content, 'utf8');
