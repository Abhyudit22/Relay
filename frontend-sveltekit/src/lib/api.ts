const API_BASE_URL = typeof window !== 'undefined' && (window as any).VITE_API_URL 
  ? (window as any).VITE_API_URL 
  : 'http://localhost:8000/api';

export async function loginUser(emailOrPhone: string, password: string, role: string = 'customer') {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone, password, role }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }
  return response.json();
}

export async function signupUser(data: { name: string; email: string; phone: string; password: string; role?: string }) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Signup failed');
  }
  return response.json();
}

export async function trackOrder(trackingNumber: string) {
  const response = await fetch(`${API_BASE_URL}/orders/track/${encodeURIComponent(trackingNumber)}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Order not found');
  }
  return response.json();
}
