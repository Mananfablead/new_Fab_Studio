import api from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  amount: number; // amount in INR — backend handles paise conversion
  plan_id?: string | number;
  feature_id?: number[];
  addons_id?: number[];
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
  plan_id?: number | null;
  features?: any[] | null;
  addons_id?: any[] | null;
  plan?: {
    id: number;
    name: string;
    price: number;
    currency: string;
  } | null;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

/**
 * Step 1 — Create a Razorpay order on the backend.
 * POST /payments/create-order
 */
export const createOrder = async (payload: CreateOrderPayload): Promise<CreateOrderResponse> => {
  const response = await api.post('/payments/create-order', payload);
  console.log('Create order response:', response.data);
  // Extract id gracefully regardless of backend wrapper (e.g. { data: { id: ... } } or { order_id: ... })
  const data = response.data;
  const orderData = data.data || data.order || data;
  const id = orderData.id || orderData.order_id || orderData.razorpay_order_id;
  
  return {
    ...orderData,
    id, // Ensure id is populated for the frontend to use
  };
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

  // Inject CSS to fix Radix UI / Shadcn Dialog blocking pointer events on Razorpay container
  if (!document.getElementById('rzp-radix-fix')) {
    const style = document.createElement('style');
    style.id = 'rzp-radix-fix';
    style.innerHTML = `
      .razorpay-container {
        pointer-events: auto !important;
        z-index: 2147483647 !important;
      }
    `;
    document.head.appendChild(style);
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
