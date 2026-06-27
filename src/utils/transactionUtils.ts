import type { Plan } from '@/store/slices/plansSlice';
import type { Transaction } from '@/services/paymentService';

export interface DecodedDetails {
  plan: Plan | null;
  addons: { name: string; price: number }[];
}

export const knownAddons = [
  { name: '1,000 Photos Add-on', price: 99, testPrice: 0.99 },
  { name: '5,000 Photos Add-on', price: 399, testPrice: 3.99 },
  { name: '10,000 Photos Add-on', price: 699, testPrice: 6.99 },
  { name: '2,000 Photos Add-on', price: 250, testPrice: 2.50 },
  
  { name: '10 Videos Add-on', price: 199, testPrice: 1.99 },
  { name: '30 Videos Add-on', price: 150, testPrice: 1.50 },
  { name: '50 Videos Add-on', price: 799, testPrice: 7.99 },
  { name: '60 Videos Add-on', price: 250, testPrice: 2.50 },
  { name: '100 Videos Add-on', price: 1299, testPrice: 12.99 },
  
  { name: '10GB Storage Add-on', price: 199, testPrice: 1.99 },
  { name: '20GB Storage Add-on', price: 500, testPrice: 5.00 },
  { name: '50GB Storage Add-on', price: 799, testPrice: 7.99 },
  { name: '100GB Storage Add-on', price: 1299, testPrice: 12.99 },
  
  { name: '5 Events Add-on', price: 299, testPrice: 2.99 },
  { name: '15 Events Add-on', price: 699, testPrice: 6.99 },
  { name: '25 Events Add-on', price: 5300, testPrice: 53.00 },
  { name: '30 Events Add-on', price: 1199, testPrice: 11.99 },
  
  { name: 'Custom Watermark Add-on', price: 520, testPrice: 5.20 },
  { name: 'Face Recognition Add-on', price: 200, testPrice: 2.00 },
  { name: 'Bulk Download Add-on', price: 210, testPrice: 2.10 },
  { name: 'Digital Flipbook Add-on', price: 1000, testPrice: 10.00 },
  { name: 'Portfolio Website Add-on', price: 200, testPrice: 2.00 },
  { name: 'Team Login Add-on', price: 200, testPrice: 2.00 },
  { name: 'View Client Favorites Add-on', price: 200, testPrice: 2.00 }
];

export const decodeTransactionDetails = (transaction: Transaction, plansList: Plan[]): DecodedDetails => {
  // If we have explicit data from the backend, use it!
  if (transaction.plan || transaction.plan_id || (transaction.addons_id && transaction.addons_id.length > 0)) {
    let plan = transaction.plan as Plan | null;
    if (!plan && transaction.plan_id) {
      plan = plansList.find(p => p.id === transaction.plan_id) || null;
    }
    
    // Attempt to parse addon details from features/addons_id arrays
    const addons: { name: string; price: number }[] = [];
    if (transaction.addons_id && transaction.addons_id.length > 0) {
      transaction.addons_id.forEach(addonData => {
        // Find corresponding feature
        const feat = transaction.features?.find(f => f.id === addonData.subscription_feature_id);
        const featName = feat ? feat.feature_name : 'Unknown';
        
        let addonName = 'Add-on';
        if (featName === 'Photos') {
          addonName = `${addonData.feature_value} Photos`;
        } else if (featName === 'Videos') {
          addonName = `${addonData.feature_value} Videos`;
        } else if (featName === 'Storage') {
          addonName = `${addonData.feature_value}GB Storage`;
        } else if (featName === 'Events') {
          addonName = `${addonData.feature_value} Events`;
        } else {
          addonName = featName;
        }
        
        addons.push({
          name: `${addonName} Add-on`,
          price: addonData.addon_price || 0
        });
      });
    }
    
    return { plan, addons };
  }

  // Fallback heuristic for older transactions
  const inr = Number(transaction.amount);
  
  let bestPlan: Plan | null = null;
  let minDiff = Infinity;
  
  for (const p of plansList) {
    const planPrice = Number(p.price);
    const possiblePrices = [planPrice];
    
    for (const price of possiblePrices) {
      if (inr >= price - 0.05) {
        const diff = inr - price;
        if (diff >= 0 && diff < minDiff) {
          minDiff = diff;
          bestPlan = p;
        }
      }
    }
  }

  const basePrice = bestPlan ? Number(bestPlan.price) : 0;
  const remainder = Math.max(0, inr - basePrice);
  
  const addons: { name: string; price: number }[] = [];
  let remainingDiff = remainder;
  
  const sortedKnownAddons = [...knownAddons].sort((a, b) => b.testPrice - a.testPrice);
  
  for (const addon of sortedKnownAddons) {
    if (remainingDiff >= addon.testPrice - 0.02) {
      addons.push({ name: addon.name, price: addon.price });
      remainingDiff -= addon.testPrice;
    }
  }

  return { plan: bestPlan, addons };
};

export const getTransactionSummary = (t: Transaction, plansList: Plan[]) => {
  // If API provides exact plan object and addons_id, use them for accurate summaries
  if (t.plan || t.plan_id || (t.addons_id && t.addons_id.length > 0)) {
    let summary = '';
    
    if (t.plan) {
      summary = `${t.plan.name} Plan`;
    } else if (t.plan_id) {
      const plan = plansList.find(p => p.id === t.plan_id);
      summary = plan ? `${plan.name} Plan` : 'Subscription Plan';
    }
    
    if (t.addons_id && t.addons_id.length > 0) {
      const addOnText = t.addons_id.length === 1 ? '1 Add-on' : `${t.addons_id.length} Add-ons`;
      summary = summary ? `${summary} + ${addOnText}` : addOnText;
    }
    
    return summary || t.description || 'Plan / Add-on Payment';
  }

  // Fallback heuristic for older transactions that lack exact IDs
  const { plan, addons } = decodeTransactionDetails(t, plansList);
  
  if (plan) {
    if (addons.length > 0) {
      if (addons.length === 1) {
        return `${plan.name} Plan + ${addons[0].name.replace(' Add-on', '')}`;
      }
      return `${plan.name} Plan + ${addons.length} Add-ons`;
    }
    return `${plan.name} Plan`;
  }
  
  if (addons.length > 0) {
    return addons.map(a => a.name.replace(' Add-on', '')).join(', ');
  }
  
  return t.description || 'Plan / Add-on Payment';
};

export function formatAmount(amount: number | string): string {
  const inr = Number(amount);
  return `₹${inr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

export const formatStorage = (bytes?: number) => {
  if (!bytes) return 'N/A';
  if (bytes < 1000) return `${bytes} GB`;
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(0)} GB`;
};
