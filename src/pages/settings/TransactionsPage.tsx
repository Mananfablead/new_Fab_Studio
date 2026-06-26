import { useEffect } from 'react';
import { Download } from 'lucide-react';
import { mockTransactions } from '@/lib/mock-data';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchTransactions, exportTransactions, setWalletFromMock } from '@/store/slices/walletSlice';
import {
  selectTransactions,
  selectTransactionsLoading,
  selectWalletBalance,
  selectApiMode,
} from '@/store/selectors';
import { useAuth } from '@/contexts/AuthContext';

export default function TransactionsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const apiMode = useAppSelector(selectApiMode);
  const transactions = useAppSelector(selectTransactions);
  const loading = useAppSelector(selectTransactionsLoading);
  const balance = useAppSelector(selectWalletBalance);

  useEffect(() => {
    if (apiMode === 'live' && user?.id) {
      dispatch(fetchTransactions({ userId: user.id }));
    } else {
      // Mock mode - wallet slice mein set karo
      if (transactions.length === 0) {
        dispatch(setWalletFromMock({ balance: balance || 500, transactions: mockTransactions }));
      }
    }
  }, [dispatch, apiMode, user?.id]);

  const handleExport = () => {
    if (apiMode === 'live' && user?.id) {
      dispatch(exportTransactions({ userId: user.id, format: 'csv' }));
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border fab-shadow">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-heading font-semibold">Transactions</h2>
        <button
          onClick={handleExport}
          className="px-3 py-2 rounded-xl border border-border text-xs font-medium flex items-center gap-1 hover:bg-muted"
        >
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div>
          {transactions.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30"
            >
              <div>
                <p className="text-sm font-medium">{t.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.date}</p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${
                    t.amount > 0 ? 'text-fab-success' : 'text-foreground'
                  }`}
                >
                  {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount)}
                </p>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    t.status === 'completed'
                      ? 'bg-fab-success/10 text-fab-success'
                      : t.status === 'pending'
                      ? 'bg-fab-amber/10 text-fab-amber'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
