import { useState } from 'react';
import { 
  Palette,
  Type,
  Image,
  Layout,
  Save,
  CheckCircle2,
  Monitor,
  Moon,
  Sun,
  Hash,
  Grid3X3,
  Columns
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function DesignSettings() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [primaryColor, setPrimaryColor] = useState('#f97316');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [layoutStyle, setLayoutStyle] = useState<'grid' | 'masonry' | 'list'>('grid');

  const handleSaveDesignSettings = () => {
    toast({ 
      title: 'Settings Saved', 
      description: 'Design settings have been updated successfully.' 
    });
  };

  const themeOptions = [
    { value: 'light', label: 'Light', desc: 'Clean and bright', icon: <Sun className="w-5 h-5" />, bg: 'bg-yellow-50', color: 'text-yellow-600' },
    { value: 'dark', label: 'Dark', desc: 'Easy on the eyes', icon: <Moon className="w-5 h-5" />, bg: 'bg-slate-800', color: 'text-white' },
    { value: 'auto', label: 'Auto', desc: 'Follow system', icon: <Monitor className="w-5 h-5" />, bg: 'bg-gray-100', color: 'text-gray-600' },
  ];

  const fontOptions = [
    { value: 'sans-serif', label: 'Sans-serif', preview: 'The quick brown fox' },
    { value: 'serif', label: 'Serif', preview: 'The quick brown fox' },
    { value: 'monospace', label: 'Monospace', preview: 'The quick brown fox' },
  ];

  const layoutOptions = [
    { value: 'grid', label: 'Grid', desc: 'Uniform square tiles', icon: <Grid3X3 className="w-5 h-5" /> },
    { value: 'masonry', label: 'Masonry', desc: 'Pinterest-style', icon: <Layout className="w-5 h-5" /> },
    { value: 'list', label: 'List', desc: 'Single column', icon: <Columns className="w-5 h-5" /> },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-xl font-heading font-bold">Design Settings</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Customize the look and feel</p>
        </div>
        <button
          onClick={handleSaveDesignSettings}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      {/* Theme Selection */}
      <div className="mb-7">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Theme
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value as any)}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                theme === option.value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              {theme === option.value && (
                <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-primary" />
              )}
              <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center ${theme === option.value ? option.bg : 'bg-muted'}`}>
                <span className={theme === option.value ? option.color : 'text-muted-foreground'}>{option.icon}</span>
              </div>
              <div className="font-semibold text-sm mb-0.5">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Primary Color */}
      <div className="mb-7">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Image className="w-4 h-4" />
          Primary Color
        </h3>
        <div className="flex items-center gap-4 p-5 rounded-xl border border-border bg-card">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-12 h-12 rounded-xl border-2 border-border cursor-pointer"
          />
          <div className="flex-1">
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm font-mono"
              placeholder="#6366f1"
            />
          </div>
          <div className="w-20 h-12 rounded-xl shadow-sm" style={{ backgroundColor: primaryColor }} />
        </div>
      </div>

      {/* Font Family */}
      <div className="mb-7">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Type className="w-4 h-4" />
          Font Family
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {fontOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFontFamily(option.value)}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                fontFamily === option.value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
              style={{ fontFamily: option.value }}
            >
              {fontFamily === option.value && (
                <CheckCircle2 className="absolute top-3 right-3 w-4 h-4 text-primary" />
              )}
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                <div className="font-semibold text-sm">{option.label}</div>
              </div>
              <div className="text-sm text-muted-foreground truncate">{option.preview}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Layout Style */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Layout className="w-4 h-4" />
          Photo Layout
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {layoutOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setLayoutStyle(option.value as any)}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                layoutStyle === option.value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              {layoutStyle === option.value && (
                <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-primary" />
              )}
              <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center ${
                layoutStyle === option.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {option.icon}
              </div>
              <div className="font-semibold text-sm mb-0.5">{option.label}</div>
              <div className="text-xs text-muted-foreground">{option.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
