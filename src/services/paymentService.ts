import api from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  amount: number; // amount in INR — backend handles paise conversion
  plan_id?: string | number;
  addons?: {
    photos?: string;
    videos?: string;
    storage?: string;
    events?: string;
    features?: string[];
  };
}

export interface CreateOrderResponse {
  id: string;          // Razorpay order_id  e.g. "order_T6DfvJYvNKI0yx"
  amount: number;      // amount in paise
  currency: string;
  receipt?: string;
  status?: string;
}

export interface VerifySignaturePayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifySignatureResponse {
  success: boolean;
  message?: string;
  transaction?: Record<string, unknown>;
}

export interface Transaction {
  id: string | number;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  description?: string;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * Step 1 — Create a Razorpay order on the backend.
 * POST /payments/create-order
 */
export const createOrder = async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
  const response = await api.post<CreateOrderResponse>('/payments/create-order', payload);
  return response.data;
};

/**
 * Step 2 — Verify payment signature after Razorpay checkout succeeds.
 * POST /payments/verify-signature
 */
export const verifySignature = async (payload: VerifySignaturePayload): Promise<VerifySignatureResponse> => {
  const response = await api.post<VerifySignatureResponse>('/payments/verify-signature', payload);
  return response.data;
};

/**
 * Step 3 — Fetch transaction history.
 * GET /payments/transactions
 */
export const fetchTransactions = async (): Promise<Transaction[]> => {
  const response = await api.get<Transaction[] | { data: Transaction[] }>('/payments/transactions');
  // Handle both array and wrapped response shapes
  const data = response.data;
  return Array.isArray(data) ? data : (data as any).data ?? [];
};

// ─── Razorpay Checkout Helper ─────────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayCheckoutOptions {
  orderId: string;
  amount: number;      // in paise
  currency: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  onDismiss?: () => void;
}

/**
 * Opens the Razorpay payment modal.
 * Requires the Razorpay checkout script to be loaded in index.html.
 */
export const openRazorpayCheckout = (options: RazorpayCheckoutOptions): void => {
  if (!window.Razorpay) {
    console.error('Razorpay SDK not loaded. Ensure the script tag is in index.html.');
    return;
  }

  const rzp = new window.Razorpay({
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    order_id: options.orderId,
    amount: options.amount,
    currency: options.currency || 'INR',
    name: options.name ?? 'Fablead Studio',
    description: options.description ?? 'Plan Add-ons',
    prefill: options.prefill ?? {},
    theme: { color: '#f59e0b' },
    handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
      options.onSuccess(response);
    },
    modal: {
      ondismiss: () => {
        options.onDismiss?.();
      },
    },
  });

  rzp.open();
};
