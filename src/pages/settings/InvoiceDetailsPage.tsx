import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Receipt, Mail, Phone, Calendar, 
  CreditCard, Sparkles, ShieldCheck, Copy, Printer, CheckCircle, Clock, XCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchTransactions, type Transaction } from '@/services/paymentService';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectUser } from '@/store/selectors';
import { fetchPlans } from '@/store/slices/plansSlice';
import { decodeTransactionDetails, formatAmount, formatDate, formatStorage } from '@/utils/transactionUtils';

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

export default function InvoiceDetailsPage() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const user = useAppSelector(selectUser);
  const plans = useAppSelector((state) => state.plans.plans);
  
  const [transaction, setTransaction] = useState<Transaction | null>(
    location.state?.transaction || null
  );
  const [loading, setLoading] = useState(!transaction);

  useEffect(() => {
    if (plans.length === 0) {
      dispatch(fetchPlans());
    }
  }, [plans, dispatch]);

  useEffect(() => {
    if (!transaction && transactionId) {
      setLoading(true);
      fetchTransactions()
        .then(transactions => {
          const found = transactions.find(t => String(t.id) === transactionId || t.razorpay_payment_id === transactionId || t.razorpay_order_id === transactionId);
          if (found) setTransaction(found);
          else toast.error('Invoice not found.');
        })
        .catch(() => toast.error('Failed to load invoice details.'))
        .finally(() => setLoading(false));
    }
  }, [transaction, transactionId]);

  const decodedDetails = useMemo(() => {
    if (!transaction) return { plan: null, addons: [] };
    return decodeTransactionDetails(transaction, plans);
  }, [transaction, plans]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Reference ID copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-4"></div>
        <p className="font-medium text-sm">Loading invoice details...</p>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Receipt className="w-12 h-12 mb-4 text-slate-300" />
        <p className="font-bold text-slate-800 text-lg">Invoice Not Found</p>
        <p className="text-sm mt-1">The requested transaction could not be located.</p>
        <button 
          onClick={() => navigate('/settings/transactions')}
          className="mt-6 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          Back to Transactions
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-12">
      {/* CSS Print Styles */}
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background: white !important;
          }
          /* Hide the main layout elements (sidebar, headers) */
          body > *:not(#root) {
            display: none !important;
          }
          /* Hide anything not the invoice container */
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Page Header (No Print) */}
      <div className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-slate-150 p-4 sm:px-6 sm:py-5 shadow-sm no-print">
        <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/settings/transactions')}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h2 className="font-heading font-extrabold text-xl text-slate-800">Transaction Details</h2>
          <p className="text-xs text-slate-400 font-medium">
            Ref: {transaction.razorpay_payment_id || transaction.razorpay_order_id || `TRX-${transaction.id}`}
          </p>
        </div>
        </div>
      </div>

      {/* Transaction Details Container */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm print-container">
        <div className="p-6 sm:p-10 space-y-8">
          
          {/* Status and Summary Cards */}
          <div className="flex items-center justify-between p-5 bg-slate-50 border border-slate-150 rounded-xl shadow-sm">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Payment Status</span>
              <StatusBadge status={transaction.status} />
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Paid</span>
              <span className="text-3xl font-black text-slate-800 tracking-tight">
                {formatAmount(transaction.total_amount || transaction.amount)}
              </span>
            </div>
          </div>

          {/* Info Columns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
            {/* Billed To */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Billed To:</h4>
              <div className="text-slate-700 space-y-1.5 bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                <p className="font-bold text-slate-800 text-base">
                  {user ? `${user.firstName} ${user.lastName}`.trim() : 'Guest Customer'}
                </p>
                {user?.email && (
                  <p className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" /> {user.email}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Payment Details:</h4>
              <div className="text-slate-700 space-y-2 bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                <p className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" /> 
                  {formatDate(transaction.created_at)}
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-600 font-mono font-medium">
                  <CreditCard className="w-4 h-4 text-slate-400 shrink-0" /> 
                  Gateway: Razorpay SECURE
                </p>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Order Summary</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Item Description</th>
                    <th className="px-5 py-3 text-right w-[120px]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                  {/* Plan Line Item */}
                  {decodedDetails.plan && (
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        {decodedDetails.plan.name} Plan Upgrade
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-slate-800">
                        ₹{Number(decodedDetails.plan.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}
                  {/* Addons Line Items */}
                  {decodedDetails.addons.map((addon, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-slate-600">
                        {addon.name}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-slate-800">
                        ₹{Number(addon.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {/* Fallback if nothing matched */}
                  {!decodedDetails.plan && decodedDetails.addons.length === 0 && (
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium">
                        {transaction.description || 'Plan / Add-on Payment'}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">
                        {formatAmount(transaction.total_amount || transaction.amount)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Matched Plan Features & Capabilities Breakdown */}
          {decodedDetails.plan && (
            <div className="space-y-4 bg-orange-50/30 p-5 sm:p-6 rounded-2xl border border-orange-100/60 shadow-sm">
              <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" /> Included Plan limits & Features
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm text-slate-600 mt-2">
                <div className="flex justify-between border-b border-orange-100/50 pb-2">
                  <span className="font-semibold text-slate-500">Max Photos:</span>
                  <span className="font-extrabold text-slate-800">
                    {decodedDetails.plan.max_photos ? decodedDetails.plan.max_photos.toLocaleString('en-IN') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-orange-100/50 pb-2">
                  <span className="font-semibold text-slate-500">Max Videos:</span>
                  <span className="font-extrabold text-slate-800">
                    {decodedDetails.plan.max_videos || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-orange-100/50 pb-2">
                  <span className="font-semibold text-slate-500">Max Storage:</span>
                  <span className="font-extrabold text-slate-800">
                    {formatStorage(decodedDetails.plan.max_storage_bytes)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-orange-100/50 pb-2">
                  <span className="font-semibold text-slate-500">Max Events:</span>
                  <span className="font-extrabold text-slate-800">
                    {decodedDetails.plan.max_events || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="pt-3 mt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2.5">Plan Capabilities Enabled</span>
                <div className="flex flex-wrap gap-2">
                  {decodedDetails.plan.has_custom_watermark && (
                    <span className="inline-flex text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-white text-orange-600 border border-orange-200 shadow-sm">
                      Custom Watermark
                    </span>
                  )}
                  {decodedDetails.plan.has_face_recognition && (
                    <span className="inline-flex text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-white text-orange-600 border border-orange-200 shadow-sm">
                      Face Recognition
                    </span>
                  )}
                  {decodedDetails.plan.has_bulk_download && (
                    <span className="inline-flex text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-white text-orange-600 border border-orange-200 shadow-sm">
                      Bulk Download
                    </span>
                  )}
                  {decodedDetails.plan.has_business_branding && (
                    <span className="inline-flex text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-white text-orange-600 border border-orange-200 shadow-sm">
                      Business Branding
                    </span>
                  )}
                  {decodedDetails.plan.has_switch_downloads && (
                    <span className="inline-flex text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-white text-orange-600 border border-orange-200 shadow-sm">
                      Switch Downloads
                    </span>
                  )}
                  {decodedDetails.plan.has_portfolio_website && (
                    <span className="inline-flex text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-white text-orange-600 border border-orange-200 shadow-sm">
                      Portfolio Website
                    </span>
                  )}
                  {decodedDetails.plan.has_team_login && (
                    <span className="inline-flex text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-white text-orange-600 border border-orange-200 shadow-sm">
                      Team Login
                    </span>
                  )}
                  {decodedDetails.plan.has_view_client_favorites && (
                    <span className="inline-flex text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-white text-orange-600 border border-orange-200 shadow-sm">
                      Client Favorites
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Custom Add-ons Info Box */}
          {decodedDetails.addons.length > 0 && (
            <div className="space-y-3 p-5 bg-orange-50/50 border border-orange-200/60 rounded-2xl shadow-sm">
              <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" /> Custom Upgrades Added:
              </h4>
              <ul className="text-sm text-slate-700 font-semibold space-y-1.5 list-disc list-inside pl-1">
                {decodedDetails.addons.map((addon, index) => (
                  <li key={index}>{addon.name}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Grand Total */}
          <div className="space-y-2.5 border-t-2 border-dashed border-slate-200 pt-6 text-sm">
            <div className="flex justify-between text-slate-900 font-black text-xl">
              <span>Grand Total</span>
              <span className="text-orange-600">{formatAmount(transaction.total_amount || transaction.amount)}</span>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2.5 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-xs font-bold mt-8 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>This is a computer-generated receipt. No signature required. Secured by Razorpay.</span>
          </div>
        </div>

        {/* Receipt Footer Action Bar */}
        <div className="px-6 sm:px-10 py-6 bg-slate-50 border-t border-slate-200 flex gap-4 shrink-0 no-print">
          <button
            type="button"
            onClick={() => handleCopyId(transaction.razorpay_payment_id || transaction.razorpay_order_id || String(transaction.id))}
            className="flex-[1] py-3.5 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Copy className="w-4 h-4" /> Copy ID
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-[2] py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
