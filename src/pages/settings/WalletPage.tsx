import { useState, useEffect } from 'react';
import {
  Wallet, Plus, Mail, MessageCircle, History,
  Sparkles, CreditCard, ChevronRight, CheckCircle2,
  TrendingUp, ArrowUpRight, ArrowDownRight, Loader2,
  UserCheck, ShieldCheck, LifeBuoy, Bell
} from 'lucide-react';
import { mockTransactions as initialTransactions } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchWalletBalance,
  fetchTransactions,
  addCredits,
  setWalletFromMock,
} from '@/store/slices/walletSlice';
import {
  selectWalletBalance,
  selectTransactions,
  selectWalletLoading,
  selectApiMode,
} from '@/store/selectors';
import { useAuth } from '@/contexts/AuthContext';

const popularAmounts = [100, 300, 500, 1000];

export default function WalletPage() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const apiMode = useAppSelector(selectApiMode);
  const balance = useAppSelector(selectWalletBalance);
  const transactions = useAppSelector(selectTransactions);
  const walletLoading = useAppSelector(selectWalletLoading);
  const [amountInput, setAmountInput] = useState('100');
  const [isLoading, setIsLoading] = useState(false);

  const credits = parseInt(amountInput) || 0;

  // Load wallet data
  useEffect(() => {
    if (apiMode === 'live' && user?.id) {
      dispatch(fetchWalletBalance(user.id));
      dispatch(fetchTransactions({ userId: user.id }));
    } else {
      dispatch(setWalletFromMock({ balance: 500, transactions: initialTransactions }));
    }
  }, [dispatch, apiMode, user?.id]);

  const handleAddCredits = async () => {
    const amount = parseInt(amountInput);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsLoading(true);

    if (apiMode === 'live') {
      const result = await dispatch(addCredits({ amount, paymentMethod: 'card' }));
      if (addCredits.fulfilled.match(result)) {
        toast.success(`₹${amount} added successfully`, {
          description: `${amount} credits have been added to your wallet.`,
          duration: 3000,
        });
      } else {
        toast.error(result.payload as string);
      }
    } else {
      // Mock mode
      await new Promise((resolve) => setTimeout(resolve, 1500));
      dispatch(
        setWalletFromMock({
          balance: balance + amount,
          transactions: [
            {
              id: String(Date.now()),
              description: 'Wallet Top-up',
              amount,
              date: new Date().toISOString().split('T')[0],
              type: 'credit',
              status: 'completed',
            },
            ...transactions,
          ],
        })
      );
      toast.success(`₹${amount} added successfully`, {
        description: `${amount} credits have been added to your wallet.`,
        duration: 3000,
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="p-4 md:p-8 lg:p-10 space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-[hsl(var(--fab-navy))]">Photo Fablead Wallet</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Add Credit (3/5) */}
        <div className="lg:col-span-3 space-y-8">
          {/* Balance Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Balance</h2>
            <div className="bg-white rounded-2xl border border-border/60 fab-shadow p-6 md:p-8 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2 text-3xl font-heading font-bold text-[hsl(var(--fab-navy))]">
                <div className="w-10 h-10 rounded-full border-2 border-[hsl(var(--fab-navy))] flex items-center justify-center text-lg">₹</div>
                {balance} credits
              </div>
              <p className="text-sm text-muted-foreground mt-2">₹1 = 1 credits</p>
            </div>
          </div>

          {/* Add Credit Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-heading font-semibold">Add Credit</h2>
              <p className="text-xs text-muted-foreground">Add credits in the multiples of ₹5</p>
              <p className="text-[10px] text-[hsl(var(--fab-amber))] font-medium italic">We suggest ₹100+ to reduce frequent top-ups</p>
            </div>

            <div className="bg-white rounded-2xl border border-border/60 p-6 space-y-6">
              {/* Input Display */}
              <div className="relative">
                <div className="flex items-center justify-between w-full px-4 py-4 rounded-xl border border-input bg-muted/20">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-medium">₹</span>
                    <input
                      type="number"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="bg-transparent border-none focus:outline-none w-24 font-bold text-lg"
                    />
                  </div>
                  <div className="text-muted-foreground">
                    = <span className="text-[hsl(var(--fab-navy))] font-bold">{credits} credits</span>
                  </div>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {popularAmounts.map(a => (
                  <button
                    key={a}
                    onClick={() => setAmountInput(a.toString())}
                    className={`py-3 rounded-xl border text-sm font-bold transition-all ${parseInt(amountInput) === a
                      ? 'bg-[hsl(var(--fab-navy))] text-white border-[hsl(var(--fab-navy))] shadow-md'
                      : 'border-border hover:border-primary/30 hover:bg-muted font-medium'
                      }`}
                  >
                    ₹{a}
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-[11px] text-muted-foreground text-center">Tax/GST will be added at checkout</p>
                <Button
                  onClick={handleAddCredits}
                  disabled={isLoading}
                  className="w-full py-7 rounded-xl bg-[hsl(var(--fab-navy))] hover:bg-[hsl(var(--fab-navy-light))] text-white font-bold text-lg transition-all shadow-xl shadow-[hsl(var(--fab-navy))]/10"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {isLoading ? "Processing..." : "Add"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Usage & More (2/5) */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">How to use credits</h2>

          {/* Notifications Card */}
          <div className="bg-white rounded-2xl border border-border/60 fab-shadow overflow-hidden">
            <div className="p-5 bg-muted/20 border-b border-border/40">
              <p className="text-xs font-semibold text-muted-foreground leading-relaxed">
                Notify participants every time you upload new photos via:
              </p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">Mail</span>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">0.2 credit/notification</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold">WhatsApp</span>
                </div>
                <span className="text-[11px] font-medium text-muted-foreground">1 credit/notification</span>
              </div>

              <div className="pt-2 space-y-2 border-t border-border/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-fab-success" />
                  Photo Upload Notifications
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-fab-success" />
                  Welcome Messages
                </div>
              </div>
            </div>
          </div>

          {/* Liveness/Advanced Features Card */}
          <div className="bg-white rounded-2xl border border-border/60 fab-shadow p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Liveness Detection</p>
                  <p className="text-[10px] text-muted-foreground">Reject fake selfies using AI</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[hsl(var(--fab-navy))]">2 credit/user</span>
            </div>
            <button className="text-[11px] font-bold text-primary hover:underline">Learn More</button>
          </div>

          {/* Subscription Card */}
          <div className="bg-white rounded-2xl border border-border/60 fab-shadow p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold">Subscription</h3>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                Buy & Renew Subscriptions
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                Unlock premium features
              </div>
            </div>
            <button className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1">
              <LifeBuoy className="w-3.5 h-3.5" /> Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Transactions History Section at bottom */}
      <div className="bg-white rounded-2xl border border-border/60 fab-shadow overflow-hidden mt-8">
        <div className="p-5 border-b border-border/40 flex items-center justify-between bg-muted/5">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-semibold uppercase tracking-wider">Transaction History</h2>
          </div>
          <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="divide-y divide-border/30">
          {transactions.slice(0, 5).map(t => (
            <div key={t.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'credit' ? 'bg-fab-success/5 text-fab-success' : 'bg-destructive/5 text-destructive'
                  }`}>
                  {t.type === 'credit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.description}</p>
                  <p className="text-[10px] text-muted-foreground">{t.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${t.type === 'credit' ? 'text-fab-success' : 'text-foreground'}`}>
                  {t.type === 'credit' ? '+' : ''}{t.amount} {t.type === 'credit' ? 'credits' : '₹'}
                </p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'completed' ? 'bg-fab-success' : 'bg-fab-amber'}`} />
                  <span className="text-[9px] uppercase font-bold text-muted-foreground/70">{t.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
