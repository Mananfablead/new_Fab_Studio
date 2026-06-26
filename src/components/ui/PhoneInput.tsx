import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const COUNTRIES = [
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', dial: '+94', flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal', dial: '+977', flag: '🇳🇵' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
];

/** Detect country dial code from browser locale */
export function detectCountryDial(): string {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const region = locale.split('-')[1]?.toUpperCase();
    return COUNTRIES.find(c => c.code === region)?.dial ?? '+91';
  } catch {
    return '+91';
  }
}

/**
 * Split a full phone string like "+919876543210" into { dial, number }.
 * Falls back to defaultDial if no matching prefix found.
 */
export function splitPhone(full: string, defaultDial = '+91'): { dial: string; number: string } {
  if (!full) return { dial: defaultDial, number: '' };
  // Sort by length descending so longer prefixes match first (e.g. +971 before +97)
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (full.startsWith(c.dial)) {
      return { dial: c.dial, number: full.slice(c.dial.length) };
    }
  }
  // No prefix matched — return as-is with default dial
  return { dial: defaultDial, number: full.replace(/^\+/, '') };
}

interface PhoneInputProps {
  /** The 10-digit number part (no country code) */
  value: string;
  onChange: (val: string) => void;
  countryDial: string;
  onCountryChange: (dial: string) => void;
  placeholder?: string;
  className?: string;
  /** Extra classes for the wrapper (e.g. error state) */
  wrapperClassName?: string;
}

export default function PhoneInput({
  value,
  onChange,
  countryDial,
  onCountryChange,
  placeholder = '9876543210',
  className = '',
  wrapperClassName = '',
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = COUNTRIES.find(c => c.dial === countryDial) ?? COUNTRIES[0];

  return (
    <div
      ref={ref}
      className={`relative flex rounded-xl overflow-visible border border-input bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all ${wrapperClassName}`}
    >
      {/* Country selector button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-3 border-r border-input text-foreground text-sm shrink-0 hover:bg-muted transition-colors rounded-l-xl"
      >
        <span className="text-base leading-none">{selected.flag}</span>
        <span className="font-mono text-xs text-muted-foreground">{selected.dial}</span>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-60 max-h-60 overflow-y-auto bg-popover border border-border rounded-xl shadow-2xl">
          {COUNTRIES.map(c => (
            <button
              key={c.code}
              type="button"
              onClick={() => { onCountryChange(c.dial); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors ${c.dial === countryDial ? 'bg-muted' : ''}`}
            >
              <span>{c.flag}</span>
              <span className="flex-1 text-left">{c.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{c.dial}</span>
            </button>
          ))}
        </div>
      )}

      {/* Number input */}
      <input
        type="tel"
        value={value}
        onChange={e => {
          let v = e.target.value.replace(/\D/g, '');
          if (v.length > 10) v = v.slice(0, 10);
          onChange(v);
        }}
        placeholder={placeholder}
        className={`flex-1 px-3 py-3 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none ${className}`}
      />
    </div>
  );
}
