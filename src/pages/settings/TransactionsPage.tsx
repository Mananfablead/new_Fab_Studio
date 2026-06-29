import { useEffect, useState, useMemo } from 'react';
import {
  Download, Receipt, CheckCircle2, Clock, XCircle, Loader2, ArrowLeft,
  Search, CreditCard, Eye
} from 'lucide-react';
import { fetchTransactions, type Transaction } from '@/services/paymentService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectUser } from '@/store/selectors';
import { fetchPlans } from '@/store/slices/plansSlice';
import { getTransactionSummary, formatAmount, formatDate } from '@/utils/transactionUtils';
import { CheckCircle } from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === 'captured' || s === 'paid' || s === 'completed' || s === 'success' || s === 'successful') {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200/50">
        <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Success
      </span>
    );
  }
  if (s === 'pending' || s === 'created' || s === 'authorized') {
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50">
        <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/50">
      <XCircle className="w-3.5 h-3.5 text-rose-600" /> Failed
    </span>
  );
}

export default function TransactionsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const plans = useAppSelector((state) => state.plans.plans);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all');

  useEffect(() => {
    setLoading(true);
    fetchTransactions()
      .then(setTransactions)
      .catch((err) => {
        console.error('Failed to load transactions:', err);
        toast.error('Could not load transactions.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (plans.length === 0) {
      dispatch(fetchPlans());
    }
  }, [plans, dispatch]);

  // ── Filters & Search ─────────────────────────────────────────────────────
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const summaryName = getTransactionSummary(t, plans);
      const matchesSearch = 
        summaryName.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        (t.razorpay_payment_id || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.razorpay_order_id || '').toLowerCase().includes(search.toLowerCase()) ||
        t.id.toString().includes(search);

      const s = t.status?.toLowerCase();
      const isSuccess = s === 'captured' || s === 'paid' || s === 'completed' || s === 'success' || s === 'successful';
      const isPending = s === 'pending' || s === 'created' || s === 'authorized';

      let matchesStatus = true;
      if (statusFilter === 'success') matchesStatus = isSuccess;
      else if (statusFilter === 'pending') matchesStatus = isPending;
      else if (statusFilter === 'failed') matchesStatus = !isSuccess && !isPending;

      return matchesSearch && matchesStatus;
    });
  }, [transactions, search, statusFilter, plans]);


  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      toast.info('No transactions to export.');
      return;
    }

    const headers = ['Transaction ID', 'Description', 'Status', 'Amount', 'Date'];
    const rows = filteredTransactions.map(t => {
      const amt = Number(t.total_amount || t.amount);
      return [
        t.razorpay_payment_id || t.razorpay_order_id || t.id,
        getTransactionSummary(t, plans),
        t.status,
        `INR ${amt}`,
        new Date(t.created_at).toLocaleString()
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `fablead_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Transactions exported successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-150 p-4 sm:px-6 sm:py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="font-heading font-extrabold text-xl text-slate-800">Billing & Transactions</h2>
            <p className="text-xs text-slate-400 font-medium">Manage invoice history and payments</p>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm shrink-0"
        >
          <Download className="w-4 h-4 text-slate-500" /> Export CSV
        </button>
      </div>

      {/* Transactions List Card (Includes Control Panel and Table) */}
      <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-sm">
        
        {/* Control Panel (Integrated into the card) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border-b border-slate-150 bg-white">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
            <input
              type="text"
              placeholder="Search transactions, payment IDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-500 transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Tab Filters */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start md:self-auto border border-slate-200/50">
            {(['all', 'success', 'pending', 'failed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === tab
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="text-sm font-medium">Loading transactions…</span>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-center shadow-inner">
              <Receipt className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">No transactions found</p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                {search || statusFilter !== 'all'
                  ? "We couldn't find any transactions matching your current filters."
                  : "Your payment history will appear here once you make a purchase."}
              </p>
            </div>
            {(search || statusFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); }}
                className="text-xs font-bold text-orange-500 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-[1fr_120px_120px_165px_100px] gap-4 px-6 py-3.5 border-b border-slate-100 bg-slate-50/50 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              <span>Description</span>
              <span className="text-center">Status</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Date</span>
              <span className="text-right">Invoice</span>
            </div>

            <div className="divide-y divide-slate-100/70">
              {filteredTransactions.map((t) => {
                const summaryName = getTransactionSummary(t, plans);
                const hasPlan = summaryName.toLowerCase().includes('plan');
                const hasAddons = summaryName.toLowerCase().includes('addon') || summaryName.toLowerCase().includes('storage') || summaryName.toLowerCase().includes('photos') || summaryName.toLowerCase().includes('videos') || summaryName.toLowerCase().includes('events') || summaryName.toLowerCase().includes('favorites') || summaryName.toLowerCase().includes('flipbook') || summaryName.toLowerCase().includes('watermark') || summaryName.toLowerCase().includes('website') || summaryName.toLowerCase().includes('login');

                return (
                  <div
                    key={t.id}
                    onClick={() => navigate(`/settings/transactions/${t.id}`, { state: { transaction: t } })}
                    className="group flex flex-col sm:grid sm:grid-cols-[1fr_120px_120px_165px_100px] gap-2.5 sm:gap-4 sm:items-center px-6 py-5 hover:bg-slate-50/50 cursor-pointer transition-colors"
                  >
                    {/* Description & Badges */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 group-hover:bg-orange-100 transition-colors">
                        <CreditCard className="w-4.5 h-4.5 text-orange-500" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-orange-600 transition-colors">
                            {summaryName}
                          </p>
                          <div className="flex gap-1 shrink-0">
                            {hasPlan && (
                              <span className="inline-flex text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wide">
                                Plan
                              </span>
                            )}
                            {hasAddons && (
                              <span className="inline-flex text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100 uppercase tracking-wide">
                                Add-ons
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">
                          {t.razorpay_payment_id ?? t.razorpay_order_id ?? `#${t.id}`}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex sm:justify-center">
                      <StatusBadge status={t.status} />
                    </div>

                    {/* Amount */}
                    <div className="text-sm font-black text-slate-800 sm:text-right">
                      {formatAmount(t.total_amount || t.amount)}
                    </div>

                    {/* Date */}
                    <div className="text-xs text-slate-505 font-semibold sm:text-right whitespace-nowrap">
                      {formatDate(t.created_at)}
                    </div>

                    {/* Action/View Invoice */}
                    <div className="flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/settings/transactions/${t.id}`, { state: { transaction: t } });
                        }}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 px-3 py-1.5 rounded-lg transition-all shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
