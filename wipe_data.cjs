const fs = require('fs');

const dbPath = 'data/database.json';
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const myEmail = 'fahim236455@gmail.com';

// Find the founder
const me = db.profiles.find(p => p.email.toLowerCase() === myEmail.toLowerCase());
if (!me) {
  console.log("Could not find founder profile!");
  process.exit(1);
}

const myId = me.id;

// 1. Remove all other users
db.profiles = db.profiles.filter(p => p.id === myId);

// 2. Remove user roles for others
db.user_roles = db.user_roles.filter(r => r.userId === myId);

// 3. Remove transactions for others
if (db.transactions) {
  db.transactions = db.transactions.filter(t => t.userId === myId);
}

// 4. Remove referrals
if (db.referrals) {
  db.referrals = db.referrals.filter(r => r.referrerId === myId || r.referredUserId === myId);
}

// 5. Remove task submissions
if (db.task_submissions) {
  db.task_submissions = db.task_submissions.filter(s => s.userId === myId);
}

// 6. Remove withdrawals
if (db.withdrawals) {
  db.withdrawals = db.withdrawals.filter(w => w.userId === myId);
}

// 7. Remove support tickets
if (db.support_tickets) {
  db.support_tickets = db.support_tickets.filter(t => t.userId === myId);
}

// 8. Remove social account sales
if (db.social_account_sales) {
  db.social_account_sales = db.social_account_sales.filter(s => s.userId === myId);
}

// 9. Clear the video link for gmail service
if (db.social_jobs_config) {
  const gmailJob = db.social_jobs_config.find(c => c.service === 'gmail');
  if (gmailJob) {
    gmailJob.tutorialUrl = '';
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log("Done wiping data and removing gmail tutorial link.");
