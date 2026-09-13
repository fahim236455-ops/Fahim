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

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে।');
  }

  return data;
}
