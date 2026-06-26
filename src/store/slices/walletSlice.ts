import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
}

interface WalletState {
  balance: number;
  currency: string;
  transactions: Transaction[];
  loading: boolean;
  transactionsLoading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
}

const initialState: WalletState = {
  balance: 0,
  currency: '₹',
  transactions: [],
  loading: false,
  transactionsLoading: false,
  error: null,
  total: 0,
  hasMore: false,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const fetchWalletBalance = createAsyncThunk(
  'wallet/fetchBalance',
  async (userId: string, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/users/${userId}/wallet`);
      return data as { balance: number; currency: string; credits: number };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error?.message
      );
    }
  }
);

export const fetchTransactions = createAsyncThunk(
  'wallet/fetchTransactions',
  async (
    {
      userId,
      params,
    }: {
      userId: string;
      params?: {
        page?: number;
        limit?: number;
        type?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.get(`/users/${userId}/transactions`, { params });
      return data as {
        transactions: Transaction[];
        total: number;
        pagination: { hasNext: boolean };
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error?.message
      );
    }
  }
);

export const addCredits = createAsyncThunk(
  'wallet/addCredits',
  async (
    {
      amount,
      paymentMethod,
      paymentDetails,
    }: { amount: number; paymentMethod: string; paymentDetails?: object },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post('/wallet/add-credits', {
        amount,
        paymentMethod,
        paymentDetails,
      });
      return data as { balance: number; transaction: Transaction };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error?.message
      );
    }
  }
);

export const exportTransactions = createAsyncThunk(
  'wallet/exportTransactions',
  async (
    { userId, format }: { userId: string; format: 'csv' | 'pdf' | 'xlsx' },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(`/users/${userId}/transactions/export`, {
        params: { format },
        responseType: 'blob',
      });
      // Browser download trigger
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      return true;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.error?.message
      );
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError(state) {
      state.error = null;
    },
    // Mock data ke liye
    setWalletFromMock(
      state,
      action: { payload: { balance: number; transactions: Transaction[] } }
    ) {
      state.balance = action.payload.balance;
      state.transactions = action.payload.transactions;
      state.total = action.payload.transactions.length;
      state.loading = false;
    },
    // Wallet se deduct karo (purchase ke baad)
    deductBalance(state, action: { payload: number }) {
      state.balance = Math.max(0, state.balance - action.payload);
    },
  },
  extraReducers: (builder) => {
    // fetchWalletBalance
    builder
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.currency = action.payload.currency;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchTransactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.transactionsLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false;
        state.transactions = action.payload.transactions;
        state.total = action.payload.total;
        state.hasMore = action.payload.pagination.hasNext;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.transactionsLoading = false;
        state.error = action.payload as string;
      });

    // addCredits
    builder
      .addCase(addCredits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCredits.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.transactions.unshift(action.payload.transaction);
        state.total += 1;
      })
      .addCase(addCredits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearWalletError, setWalletFromMock, deductBalance } = walletSlice.actions;
export default walletSlice.reducer;
