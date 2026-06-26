import { DollarSign, Download, ShoppingCart, Settings, Save, Type } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateGroup } from '@/store/slices/groupsSlice';
import { selectCurrentGroup, selectApiMode } from '@/store/selectors';
import { useState, useEffect } from 'react';

interface MonetizationSettingsProps {
  groupId?: string;
}

export default function MonetizationSettings({ groupId }: MonetizationSettingsProps) {
  const dispatch = useAppDispatch();
  const apiMode = useAppSelector(selectApiMode);
  const group = useAppSelector(selectCurrentGroup);
  const monetization = group?.monetization;

  const [enabled, setEnabled] = useState(monetization?.enabled ?? false);
  const [sellPhotos, setSellPhotos] = useState(monetization?.sellPhotos ?? true);
  const [paidDownloads, setPaidDownloads] = useState(monetization?.paidDownloads ?? false);
  const [pricePerPhoto, setPricePerPhoto] = useState(monetization?.pricePerPhoto ?? 50);
  const [pricePerAlbum, setPricePerAlbum] = useState(monetization?.pricePerAlbum ?? 2000);
  const [currency, setCurrency] = useState(monetization?.currency ?? '₹');
  const [clientAlbumSelection, setClientAlbumSelection] = useState(monetization?.clientAlbumSelection ?? false);
  const [maxSelections, setMaxSelections] = useState(monetization?.maxSelections ?? 100);
  const [watermarkText, setWatermarkText] = useState(monetization?.watermarkText ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (monetization) {
      setEnabled(monetization.enabled);
      setSellPhotos(monetization.sellPhotos ?? true);
      setPaidDownloads(monetization.paidDownloads ?? false);
      setPricePerPhoto(monetization.pricePerPhoto);
      setPricePerAlbum(monetization.pricePerAlbum ?? 2000);
      setCurrency(monetization.currency);
      setClientAlbumSelection(monetization.clientAlbumSelection ?? false);
      setMaxSelections(monetization.maxSelections ?? 100);
      setWatermarkText(monetization.watermarkText ?? '');
    }
  }, [monetization]);

  const handleSave = async () => {
    if (apiMode === 'mock') {
      toast({
        title: 'Settings Saved',
        description: 'Monetization settings have been updated successfully (Mock Mode).',
      });
      return;
    }

    if (!groupId) return;

    setIsSaving(true);
    try {
      await dispatch(updateGroup({
        groupId,
        payload: {
          monetization: {
            enabled,
            sellPhotos,
            paidDownloads,
            pricePerPhoto,
            pricePerAlbum,
            currency,
            clientAlbumSelection,
            maxSelections,
            watermarkText
          }
        }
      })).unwrap();

      toast({
        title: 'Success',
        description: 'Monetization settings updated successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err || 'Failed to update monetization settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-semibold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            Monetization Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure photo sales, pricing, and client selections
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Enable Monetization */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Enable Monetization</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Turn on photo sales and paid downloads for this group
            </p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              enabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                enabled ? 'left-8' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {enabled && (
        <>
          {/* Photo Sales */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Photo Sales
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="text-sm font-medium">Allow Photo Purchases</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clients can buy individual photos
                </p>
              </div>
              <button
                onClick={() => setSellPhotos(!sellPhotos)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  sellPhotos ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    sellPhotos ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {sellPhotos && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Per Photo</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {currency}
                    </span>
                    <input
                      type="number"
                      value={pricePerPhoto}
                      onChange={(e) => setPricePerPhoto(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Per Full Album</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {currency}
                    </span>
                    <input
                      type="number"
                      value={pricePerAlbum}
                      onChange={(e) => setPricePerAlbum(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Paid Downloads */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Paid Downloads
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="text-sm font-medium">Require Payment for Downloads</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Clients must pay before downloading photos
                </p>
              </div>
              <button
                onClick={() => setPaidDownloads(!paidDownloads)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  paidDownloads ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    paidDownloads ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Client Album Selection */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Client Album Selection
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <p className="text-sm font-medium">Enable Client Selections</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Allow clients to select their favorite photos for printing
                </p>
              </div>
              <button
                onClick={() => setClientAlbumSelection(!clientAlbumSelection)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  clientAlbumSelection ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    clientAlbumSelection ? 'left-7' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {clientAlbumSelection && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Maximum Selections Allowed</label>
                  <input
                    type="number"
                    value={maxSelections}
                    onChange={(e) => setMaxSelections(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Clients can select up to {maxSelections} photos for their album
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                    <Type className="w-4 h-4 text-primary" />
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g. Fablead Photo"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Custom text to display on watermarked photos
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Revenue Summary */}
          <div className="bg-gradient-to-br from-primary/5 to-[hsl(var(--fab-amber))]/5 rounded-xl border border-primary/20 p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold mt-1">{currency}12,500</p>
              </div>
              <div className="bg-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Photos Sold</p>
                <p className="text-2xl font-bold mt-1">245</p>
              </div>
              <div className="bg-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Albums Purchased</p>
                <p className="text-2xl font-bold mt-1">8</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
