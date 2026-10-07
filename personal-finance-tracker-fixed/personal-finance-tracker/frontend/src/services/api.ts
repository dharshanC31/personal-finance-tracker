import type { Category, Transaction } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// One place for all fetch calls: checks network, HTTP status and the JSON shape.
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new Error(`Cannot reach the server at ${API_BASE}. Is the backend running?`);
  }

  let body: ApiResponse<T> | null = null;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    // body stays null: server sent something that is not JSON
  }

  if (!res.ok || !body || body.success === false) {
    throw new Error(body?.error || `Request failed (HTTP ${res.status}).`);
  }
  return body.data as T;
}

export function fetchCategories(): Promise<Category[]> {
  return request<Category[]>('/categories');
}

export function fetchTransactions(): Promise<Transaction[]> {
  return request<Transaction[]>('/transactions');
}

export function createTransaction(data: {
  amount: number;
  categoryId: number;
  date: string;
  description: string;
}): Promise<Transaction> {
  return request<Transaction>('/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteTransaction(id: number): Promise<{ id: number }> {
  return request<{ id: number }>(`/transactions/${id}`, { method: 'DELETE' });
}
