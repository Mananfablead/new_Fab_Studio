import { useState } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';

const plans = {
  photographer: [
    {
      name: 'Standard',
      price: { quarterly: 999, annually: 799 },
      features: ['500 photos/month', '5 groups', 'Basic analytics', 'Email support', 'Watermark'],
      popular: false,
    },
    {
      name: 'Essential',
      price: { quarterly: 1999, annually: 1599 },
      features: ['2000 photos/month', '20 groups', 'Advanced analytics', 'Priority support', 'Watermark', 'Branding', 'Team (3 members)'],
      popular: true,
    },
    {
      name: 'Premium',
      price: { quarterly: 4999, annually: 3999 },
      features: ['Unlimited photos', 'Unlimited groups', 'Full analytics', '24/7 support', 'White-label', 'Custom domain', 'Team (unlimited)', 'API access'],
      popular: false,
    },
  ],
  personal: [
    {
      name: 'Free',
      price: { quarterly: 0, annually: 0 },
      features: ['View & download photos', 'Join 5 groups', 'Basic filters'],
      popular: false,
    },
    {
      name: 'Plus',
      price: { quarterly: 299, annually: 199 },
      features: ['Unlimited groups', 'HD downloads', 'Advanced filters', 'No ads'],
      popular: true,
    },
    {
      name: 'Pro',
      price: { quarterly: 599, annually: 499 },
      features: ['Everything in Plus', 'Priority AI matching', 'Cloud backup', 'Early access features'],
      popular: false,
    },
  ],
};

export default function PricingPage() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'photographer' | 'personal'>('photographer');
  const [billing, setBilling] = useState<'quarterly' | 'annually'>('annually');

  const currentPlans = plans[userType];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-heading font-bold">Choose the right plan</h1>
          </div>
          <p className="text-muted-foreground">Scale as you grow. Cancel anytime.</p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex bg-muted rounded-xl p-1">
            <button onClick={() => setUserType('photographer')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${userType === 'photographer' ? 'bg-card fab-shadow' : ''}`}>
              Photographers
            </button>
            <button onClick={() => setUserType('personal')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${userType === 'personal' ? 'bg-card fab-shadow' : ''}`}>
              Personal
            </button>
          </div>
          <div className="flex bg-muted rounded-xl p-1">
            <button onClick={() => setBilling('quarterly')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${billing === 'quarterly' ? 'bg-card fab-shadow' : ''}`}>
              Quarterly
            </button>
            <button onClick={() => setBilling('annually')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${billing === 'annually' ? 'bg-card fab-shadow' : ''}`}>
              Annually
              <span className="absolute -top-2 -right-2 text-[9px] px-1.5 py-0.5 rounded-full fab-gradient-amber text-accent-foreground font-bold">-20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentPlans.map(plan => (
            <div key={plan.name} className={`bg-card rounded-xl border p-6 transition-all hover:-translate-y-1 ${plan.popular ? 'border-accent fab-shadow-lg relative' : 'border-border fab-shadow'}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full fab-gradient-amber text-accent-foreground text-xs font-bold">
                  Bestseller
                </span>
              )}
              <h3 className="font-heading font-semibold text-lg">{plan.name}</h3>
              <div className="mt-3 mb-5">
                <span className="text-3xl font-heading font-bold">₹{plan.price[billing]}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
                <p className="text-xs text-muted-foreground mt-1">+ GST</p>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-fab-success shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-xl text-sm font-medium transition-opacity ${plan.popular ? 'fab-gradient text-primary-foreground hover:opacity-90' : 'border border-border hover:bg-muted'}`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
