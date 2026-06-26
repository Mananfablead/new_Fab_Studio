import { useState } from 'react';
import { 
  Sun,
  Moon,
  Image,
  Type,
  Layout,
  Save,
  Grid3x3,
  Square
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import PreviewSection from './design/PreviewSection';

type ColorMode = 'light' | 'dark';
type PhotoSize = 'large' | 'small';
type FontType = 'serif' | 'sans';
type PaddingType = 'large' | 'small';
type TemplateType = 'cover' | 'gallery';
type LayoutType = 'original' | 'bordered' | 'leftAligned' | 'label' | 'centralCard';

export default function DesignSettings() {
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [photoSize, setPhotoSize] = useState<PhotoSize>('large');
  const [font, setFont] = useState<FontType>('sans');
  const [padding, setPadding] = useState<PaddingType>('large');
  const [template, setTemplate] = useState<TemplateType>('gallery');
  const [layout, setLayout] = useState<LayoutType>('original');

  const handleSaveDesignSettings = () => {
    const settings = {
      colorMode,
      photoSize,
      font,
      padding,
      template,
      layout
    };
    
    // Here you would typically make an API call to persist the settings
    console.log('Saving design settings:', settings);
    
    toast({ 
      title: 'Settings Saved', 
      description: 'Design settings have been updated successfully.' 
    });
  };

  const colorModeOptions = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> }
  ];

  const photoSizeOptions = [
    { value: 'large', label: 'Large', icon: <Image className="w-4 h-4" /> },
    { value: 'small', label: 'Small', icon: <Square className="w-4 h-4" /> }
  ];

  const fontOptions = [
    { value: 'sans', label: 'Sans', icon: <Type className="w-4 h-4" /> },
    { value: 'serif', label: 'Serif', icon: <Type className="w-4 h-4" /> }
  ];

  const paddingOptions = [
    { value: 'large', label: 'Large', icon: <Layout className="w-4 h-4" /> },
    { value: 'small', label: 'Small', icon: <Layout className="w-4 h-4" /> }
  ];

  const templateOptions = [
    { value: 'cover', label: 'Cover' },
    { value: 'gallery', label: 'Gallery' }
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">Design Settings</h2>
          <p className="text-muted-foreground">Customize the design and appearance of your group gallery</p>
        </div>

        {/* Main Content - Settings and Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Column */}
          <div className="lg:col-span-2">

        {/* Color Mode */}
        <div className="mb-8">
          <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-primary" />
            Color Mode
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setColorMode('light')}
              className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all ${
                colorMode === 'light'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center ${
                colorMode === 'light' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Sun className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Light Mode</h4>
              <p className="text-sm text-muted-foreground">Clean and bright appearance with white backgrounds</p>
              {colorMode === 'light' && (
                <div className="absolute top-4 right-4">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>

            <button
              onClick={() => setColorMode('dark')}
              className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all ${
                colorMode === 'dark'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center ${
                colorMode === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Moon className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Dark Mode</h4>
              <p className="text-sm text-muted-foreground">Easy on the eyes with dark backgrounds</p>
              {colorMode === 'dark' && (
                <div className="absolute top-4 right-4">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Photo Size */}
        <div className="mb-8">
          <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            Photo Size
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setPhotoSize('large')}
              className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all ${
                photoSize === 'large'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center ${
                photoSize === 'large' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Image className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Large Photos</h4>
              <p className="text-sm text-muted-foreground">Display photos in larger size for better detail</p>
              {photoSize === 'large' && (
                <div className="absolute top-4 right-4">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>

            <button
              onClick={() => setPhotoSize('small')}
              className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all ${
                photoSize === 'small'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center ${
                photoSize === 'small' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Square className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Small Photos</h4>
              <p className="text-sm text-muted-foreground">Display more photos in compact grid view</p>
              {photoSize === 'small' && (
                <div className="absolute top-4 right-4">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Font Family */}
        <div className="mb-8">
          <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            Font Family
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setFont('sans')}
              className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all ${
                font === 'sans'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center ${
                font === 'sans' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Type className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Sans-serif</h4>
              <p className="text-sm text-muted-foreground mb-3" style={{ fontFamily: 'sans-serif' }}>The quick brown fox jumps over the lazy dog</p>
              {font === 'sans' && (
                <div className="absolute top-4 right-4">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>

            <button
              onClick={() => setFont('serif')}
              className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all ${
                font === 'serif'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center ${
                font === 'serif' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Type className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Serif</h4>
              <p className="text-sm text-muted-foreground mb-3" style={{ fontFamily: 'serif' }}>The quick brown fox jumps over the lazy dog</p>
              {font === 'serif' && (
                <div className="absolute top-4 right-4">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Padding */}
        <div className="mb-8">
          <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" />
            Spacing & Padding
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setPadding('large')}
              className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all ${
                padding === 'large'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center ${
                padding === 'large' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Layout className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Large Padding</h4>
              <p className="text-sm text-muted-foreground">More breathing room between elements</p>
              {padding === 'large' && (
                <div className="absolute top-4 right-4">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>

            <button
              onClick={() => setPadding('small')}
              className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all ${
                padding === 'small'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center ${
                padding === 'small' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Layout className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Small Padding</h4>
              <p className="text-sm text-muted-foreground">Compact layout with tighter spacing</p>
              {padding === 'small' && (
                <div className="absolute top-4 right-4">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Template Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-primary" />
            Template & Layout
          </h3>
          
          {/* Template Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setTemplate('cover')}
              className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all ${
                template === 'cover'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center ${
                template === 'cover' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Image className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Cover Template</h4>
              <p className="text-sm text-muted-foreground">Large hero image with supporting gallery below</p>
              {template === 'cover' && (
                <div className="absolute top-4 right-4">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>

            <button
              onClick={() => setTemplate('gallery')}
              className={`relative overflow-hidden rounded-xl border-2 p-6 text-left transition-all ${
                template === 'gallery'
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center ${
                template === 'gallery' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                <Grid3x3 className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Gallery Template</h4>
              <p className="text-sm text-muted-foreground">Grid-based layout with multiple photo arrangements</p>
              {template === 'gallery' && (
                <div className="absolute top-4 right-4">
                  <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Layout Options for Gallery */}
          {template === 'gallery' && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Layout className="w-5 h-5 text-primary" />
                Gallery Layout Options
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'original', label: 'Original', desc: 'Uniform square tiles' },
                  { value: 'bordered', label: 'Bordered', desc: 'Photos with borders' },
                  { value: 'leftAligned', label: 'Left Aligned', desc: 'Photo left, text right' },
                  { value: 'label', label: 'Label', desc: 'Photos with labels below' },
                  { value: 'centralCard', label: 'Central Card', desc: 'Featured center photo' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLayout(option.value as any)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      layout === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-border">
          <button
            onClick={handleSaveDesignSettings}
            className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Design Settings
          </button>
        </div>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <PreviewSection
                colorMode={colorMode}
                photoSize={photoSize}
                font={font}
                padding={padding}
                template={template}
                layout={layout}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
