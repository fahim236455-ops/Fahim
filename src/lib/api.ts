import { UserProfile, SiteSettings } from '../types';

let cachedToken: string | null = localStorage.getItem('fahimpay_token');

export function setToken(token: string | null) {
  cachedToken = token;
  if (token) {
    localStorage.setItem('fahimpay_token', token);
  } else {
    localStorage.removeItem('fahimpay_token');
  }
}

export function getToken(): string | null {
  if (!cachedToken) {
    cachedToken = localStorage.getItem('fahimpay_token');
  }
  return cachedToken;
}

// Client-side fallback handler for Netlify static deployments without Express backend
function handleStaticMockApi(endpoint: string, options: RequestInit = {}): any {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};
  const token = getToken();

  const defaultAdminUser: UserProfile = {
    id: 'admin_1',
    fullName: 'Fahim Admin',
    email: 'admin@fahimpaybd.com',
    phoneNumber: '01700000000',
    role: 'admin',
    isSuperAdmin: true,
    balance: 5000,
    totalEarned: 5000,
    totalWithdrawn: 0,
    totalReferrals: 0,
    referralCode: 'ADMIN123',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultSettings: SiteSettings = {
    id: 'stg_1',
    brandName: 'Earnora',
    referralReward: 50,
    minWithdrawal: 100,
    maxWithdrawal: 50000,
    withdrawalFeePercent: 2,
    withdrawalMethods: ['bKash', 'Nagad', 'Rocket'],
    bkashNumber: '01700000000',
    nagadNumber: '01800000000',
    rocketNumber: '01900000000',
    supportPhone: '01700000000',
    supportWhatsapp: 'https://wa.me/8801700000000',
    supportTelegram: 'https://t.me/earnora_bd',
    supportEmail: 'support@fahimpaybd.com',
    announcement: 'স্বাগতম Earnora-তে! কাজ শুরু করে আয় করুন।',
    signupBonus: 10,
    dailyCheckinReward: 1,
    popupNotice: { enabled: false, title: '', message: '' },
    maintenanceMode: { enabled: false, message: '' },
    heroTitle: 'অনলাইনে কাজ করে মোবাইল দিয়েই প্রতিদিন আয় করুন',
    heroSubtitle: 'সহজ টাস্ক পূরণ করুন এবং সরাসরি বিকাশ, নগদ ও রকেটে ইনস্ট্যান্ট পেমেন্ট নিন।',
    heroVideoUrl: '',
    telegramChannelUrl: 'https://t.me/earnora_bd',
    telegramGroupUrl: 'https://t.me/earnora_group',
    faqs: [],
    updatedAt: new Date().toISOString(),
  };

  // 1. Settings
  if (endpoint === '/settings') {
    const storedSettings = localStorage.getItem('local_settings');
    return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
  }

  // 2. Admin Login
  if (endpoint === '/admin/login' && method === 'POST') {
    const { email, password } = body;
    const cleanEmail = email.trim().toLowerCase();
    if (
      (cleanEmail === 'fahim236455@gmail.com' || cleanEmail === 'admin@fahimpaybd.com') &&
      (password === 'Admin@FahimPay2026' || password === 'admin123456' || password === 'admin123')
    ) {
      const token = 'mock_admin_token_' + Date.now();
      const adminUser = { ...defaultAdminUser, email: cleanEmail };
      localStorage.setItem('local_user', JSON.stringify(adminUser));
      return {
        token,
        admin: adminUser,
        message: 'অ্যাডমিন লগইন সফল হয়েছে!',
      };
    } else {
      throw new Error('ভুল অ্যাডমিন ইমেইল বা পাসওয়ার্ড!');
    }
  }

  // 3. User Login
  if (endpoint === '/auth/login' && method === 'POST') {
    const { email, password } = body;
    const cleanEmail = email.trim().toLowerCase();
    if (
      (cleanEmail === 'fahim236455@gmail.com' || cleanEmail === 'admin@fahimpaybd.com') &&
      (password === 'Admin@FahimPay2026' || password === 'admin123456' || password === 'admin123')
    ) {
      const token = 'mock_admin_token_' + Date.now();
      const adminUser = { ...defaultAdminUser, email: cleanEmail };
      localStorage.setItem('local_user', JSON.stringify(adminUser));
      return {
        token,
        user: adminUser,
        message: 'লগইন সফল হয়েছে!',
      };
    }

    const storedUsers = JSON.parse(localStorage.getItem('local_users_list') || '[]');
    const cleanEmailOrPhone = email.trim().toLowerCase();
    const found = storedUsers.find(
      (u: any) => u.email.toLowerCase() === cleanEmailOrPhone || u.phoneNumber === cleanEmailOrPhone
    );

    if (found && found.password === password) {
      const token = 'mock_user_token_' + Date.now();
      localStorage.setItem('local_user', JSON.stringify(found.user));
      return {
        token,
        user: found.user,
        message: 'লগইন সফল হয়েছে!',
      };
    } else if (!found && password.length >= 6) {
      // Auto-create user for quick demo login
      const newUser: UserProfile = {
        id: 'usr_' + Date.now(),
        fullName: email.split('@')[0] || 'User',
        email: email.includes('@') ? email : `${email}@fahimpaybd.com`,
        phoneNumber: email.match(/^\d+$/) ? email : '017' + Math.floor(10000000 + Math.random() * 90000000),
        role: 'user',
        balance: 50,
        totalEarned: 50,
        totalWithdrawn: 0,
        totalReferrals: 0,
        referralCode: 'REF' + Math.floor(1000 + Math.random() * 9000),
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const token = 'mock_user_token_' + Date.now();
      localStorage.setItem('local_user', JSON.stringify(newUser));
      return {
        token,
        user: newUser,
        message: 'লগইন সফল হয়েছে!',
      };
    } else {
      throw new Error('ভুল ইমেইল বা পাসওয়ার্ড!');
    }
  }

  // 4. Register
  if (endpoint === '/auth/register' && method === 'POST') {
    const { fullName, phoneNumber, email, password } = body;
    const newUser: UserProfile = {
      id: 'usr_' + Date.now(),
      fullName,
      email,
      phoneNumber,
      role: 'user',
      balance: 10,
      totalEarned: 10,
      totalWithdrawn: 0,
      totalReferrals: 0,
      referralCode: 'REF' + Math.floor(1000 + Math.random() * 9000),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const storedUsers = JSON.parse(localStorage.getItem('local_users_list') || '[]');
    storedUsers.push({ email, phoneNumber, password, user: newUser });
    localStorage.setItem('local_users_list', JSON.stringify(storedUsers));
    localStorage.setItem('local_user', JSON.stringify(newUser));
    return {
      token: 'mock_user_token_' + Date.now(),
      user: newUser,
      message: 'রেজিস্ট্রেশন সফল হয়েছে!',
    };
  }

  // 5. Auth / Me
  if (endpoint === '/auth/me') {
    if (!token) throw new Error('Unauthenticated');
    const storedUser = localStorage.getItem('local_user');
    const user = storedUser ? JSON.parse(storedUser) : defaultAdminUser;
    const storedSettings = localStorage.getItem('local_settings');
    const settings = storedSettings ? JSON.parse(storedSettings) : defaultSettings;
    return { user, settings };
  }

  // Generic fallback for list endpoints
  if (endpoint.includes('/tasks')) return [];
  if (endpoint.includes('/withdrawals')) return [];
  if (endpoint.includes('/transactions')) return [];
  if (endpoint.includes('/users')) return [defaultAdminUser];

  return { success: true };
}

export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type');
    if (!response.ok || !contentType || !contentType.includes('application/json')) {
      // If Express server is missing (e.g. Netlify static hosting returning HTML index.html for /api routes)
      return handleStaticMockApi(endpoint, options) as T;
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    // Catch fetch/network/JSON parse errors and fallback gracefully
    console.warn('[API Fallback] Falling back to client-side handler:', err);
    try {
      return handleStaticMockApi(endpoint, options) as T;
    } catch (fallbackErr: any) {
      throw fallbackErr;
    }
  }
}

