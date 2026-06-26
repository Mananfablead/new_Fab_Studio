import { useState } from 'react';
import { 
  Eye,
  Download,
  Shield,
  Save,
  Image,
  Share2,
  MousePointerClick,
  CheckCircle2
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

export default function ViewDownloadSettings() {
  const [allowDownloading, setAllowDownloading] = useState(true);
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  const [enableRightClick, setEnableRightClick] = useState(true);
  const [downloadQuality, setDownloadQuality] = useState<'original' | 'high' | 'medium' | 'low'>('original');
  const [enableSharing, setEnableSharing] = useState(true);

  const handleSaveSettings = () => {
    toast({ 
      title: 'Settings Saved', 
      description: 'View & Download settings have been updated successfully.' 
    });
  };

  const qualityOptions = [
    { value: 'original', label: 'Original', desc: 'Full resolution' },
    { value: 'high', label: 'High', desc: 'High quality' },
    { value: 'medium', label: 'Medium', desc: 'Medium quality' },
    { value: 'low', label: 'Low', desc: 'Low quality' },
  ];

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h2 className="text-xl font-heading font-bold">View & Download</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Configure viewing and download options</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      {/* Download Settings */}
      <div className="mb-7">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Settings
        </h3>
        
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Allow Downloading</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Users can download photos from this group</p>
            </div>
          </div>
          <Switch checked={allowDownloading} onCheckedChange={setAllowDownloading} />
        </div>

        {allowDownloading && (
          <div className="p-4 rounded-xl border border-border bg-card">
            <h4 className="font-semibold text-sm mb-3">Download Quality</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {qualityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setDownloadQuality(option.value as any)}
                  className={`relative p-3 rounded-xl border-2 transition-all text-center ${
                    downloadQuality === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  {downloadQuality === option.value && (
                    <CheckCircle2 className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-primary" />
                  )}
                  <div className="font-semibold text-xs mb-0.5">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Viewing Settings */}
      <div className="mb-7">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Viewing Settings
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <MousePointerClick className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Enable Right Click</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Allow users to right-click on images</p>
              </div>
            </div>
            <Switch checked={enableRightClick} onCheckedChange={setEnableRightClick} />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Enable Sharing</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Users can share photos via social media</p>
              </div>
            </div>
            <Switch checked={enableSharing} onCheckedChange={setEnableSharing} />
          </div>
        </div>
      </div>

      {/* Watermark Settings */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Watermark
        </h3>
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card mb-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Image className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">Show Watermark</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Add watermark to protect your photos</p>
            </div>
          </div>
          <Switch checked={showWatermark} onCheckedChange={setShowWatermark} />
        </div>

        {showWatermark && (
          <div className="p-4 rounded-xl border border-border bg-card">
            <label className="block text-xs font-semibold text-muted-foreground mb-2">Watermark Text</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
              placeholder="Enter watermark text..."
            />
            <p className="text-xs text-muted-foreground mt-2">This text will appear on all photos</p>
          </div>
        )}
      </div>
    </div>
  );
}
