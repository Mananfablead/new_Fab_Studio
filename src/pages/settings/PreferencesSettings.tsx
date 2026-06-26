import { useState } from 'react';

export default function PreferencesSettings() {
  const [highRes, setHighRes] = useState(true);

  return (
    <div className="bg-card rounded-xl border border-border fab-shadow p-6">
      <h2 className="font-heading font-semibold mb-4">Account Preferences</h2>
      <div className="flex items-center justify-between py-4 border-b border-border">
        <div>
          <p className="text-sm font-medium">Upload in High Resolution</p>
          <p className="text-xs text-muted-foreground mt-0.5">Uses more credits per upload</p>
        </div>
        <button
          onClick={() => setHighRes(!highRes)}
          className={`w-11 h-6 rounded-full transition-colors relative ${highRes ? 'bg-fab-success' : 'bg-muted'}`}
        >
          <div className={`w-5 h-5 rounded-full bg-card absolute top-0.5 transition-all ${highRes ? 'left-[22px]' : 'left-0.5'}`} />
        </button>
      </div>
    </div>
  );
}
