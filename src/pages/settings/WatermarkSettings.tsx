import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { 
  fetchWatermarkSettings, 
  updateWatermarkSettings, 
  uploadWatermarkImage, 
  setWatermarkState 
} from '@/store/slices/watermarkSlice';
import { Upload, Type, Image as ImageIcon, LayoutGrid, Maximize, Droplets, Check, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WatermarkPosition } from '@/contexts/WatermarkContext';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

const positions: { id: WatermarkPosition; label: string }[] = [
  { id: 'top-left', label: 'Top Left' },
  { id: 'top-right', label: 'Top Right' },
  { id: 'center', label: 'Center' },
  { id: 'bottom-left', label: 'Bottom Left' },
  { id: 'bottom-right', label: 'Bottom Right' },
];

export default function WatermarkSettings() {
  const dispatch = useAppDispatch();
  const watermarkState = useAppSelector(state => state.watermark);

  const {
    enabled: watermarkEnabled,
    type: watermarkType,
    image: watermarkImage,
    text: watermarkText,
    position: watermarkPosition,
    opacity: watermarkOpacity,
    scale: watermarkScale,
    isTiled
  } = watermarkState;

  useEffect(() => {
    dispatch(fetchWatermarkSettings());
  }, [dispatch]);

  const handleSave = async () => {
    try {
      await dispatch(updateWatermarkSettings()).unwrap();
      toast.success("Watermark settings saved successfully!");
    } catch (err: any) {
      toast.error(err || "Failed to save settings");
    }
  };

  const setWatermarkPosition = (position: any) => {
    dispatch(setWatermarkState({ position }));
  };

  const setWatermarkOpacity = (opacity: number) => {
    dispatch(setWatermarkState({ opacity }));
  };

  const setWatermarkScale = (scale: number) => {
    dispatch(setWatermarkState({ scale }));
  };

  const setIsTiled = (tiled: boolean) => {
    dispatch(setWatermarkState({ isTiled: tiled }));
  };

  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File too large. Please upload an image under 2MB.");
        return;
      }
      setIsPreviewLoading(true);
      try {
        dispatch(setWatermarkState({ imageFile: file }));
        // await dispatch(uploadWatermarkImage(file)).unwrap(); // Commented out due to 404
        toast.success("Watermark logo selected!");
      } catch (err: any) {
        toast.error(err || "Failed to upload watermark image");
      } finally {
        setIsPreviewLoading(false);
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(setWatermarkState({ image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[hsl(var(--fab-navy))]">Signature & Watermark</h1>
          <p className="text-sm text-muted-foreground mt-1">Protect your intellectual property with custom branding</p>
        </div>
        <button
          onClick={handleSave}
          disabled={watermarkState.loading}
          className="px-6 py-2.5 rounded-xl bg-[hsl(var(--fab-navy))] text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {watermarkState.loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Settings */}
        <div className="space-y-6">
          {/* Logo Upload Section */}
          <div className="bg-white rounded-2xl border border-border/60 fab-shadow p-6 space-y-4">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" /> Watermark Logo
            </h3>
            
            <div className="pt-2">
              {watermarkImage ? (
                <div className="relative group rounded-xl border border-border p-4 bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-white border border-border p-2 shadow-sm">
                      <img src={watermarkImage} alt="Watermark" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Active Logo</p>
                      <p className="text-[10px] text-muted-foreground">PNG/WEBP recommended</p>
                    </div>
                  </div>
                  <button onClick={() => {
                    dispatch(setWatermarkState({ image: null, imageFile: null }));
                  }} className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">Upload your transparency logo</p>
                  <p className="text-xs text-muted-foreground">Recommended size: 500x500px</p>
                </label>
              )}
            </div>
          </div>

          {/* Placement & Mode */}
          <div className="bg-white rounded-2xl border border-border/60 fab-shadow p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-primary" /> Placement
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tiled Mode</span>
                <button
                  onClick={() => setIsTiled(!isTiled)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${isTiled ? 'bg-[hsl(var(--fab-amber))]' : 'bg-muted'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isTiled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>

            {!isTiled && (
              <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
                {positions.map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setWatermarkPosition(pos.id)}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${watermarkPosition === pos.id ? 'border-[hsl(var(--fab-navy))] bg-[hsl(var(--fab-navy))]/5 text-[hsl(var(--fab-navy))]' : 'border-border hover:border-primary/20 text-muted-foreground'}`}
                    title={pos.label}
                  >
                    <div className={`w-3 h-3 rounded-sm ${watermarkPosition === pos.id ? 'bg-[hsl(var(--fab-navy))]' : 'bg-muted-foreground/30'}`} />
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-6 pt-2">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5" /> Opacity</span>
                  <span className="text-xs font-bold text-primary">{watermarkOpacity}%</span>
                </div>
                <Slider value={[watermarkOpacity]} max={100} step={1} onValueChange={(val) => setWatermarkOpacity(val[0])} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Maximize className="w-3.5 h-3.5" /> Scale</span>
                  <span className="text-xs font-bold text-primary">{watermarkScale}%</span>
                </div>
                <Slider value={[watermarkScale]} min={5} max={50} step={1} onValueChange={(val) => setWatermarkScale(val[0])} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="space-y-4">
          <h3 className="font-heading font-semibold text-sm uppercase tracking-widest text-muted-foreground">Live Preview</h3>
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border-8 border-white fab-shadow-lg bg-muted">
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&fit=crop"
              alt="Preview background"
              className="w-full h-full object-cover"
            />
            {/* Watermark Overlay Preview */}
            <AnimatePresence>
              {watermarkImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  {isTiled ? (
                    <div 
                      className="w-full h-full grid grid-cols-4 grid-rows-4 gap-4 p-4 opacity-50"
                      style={{ 
                        opacity: watermarkOpacity / 100,
                        transform: 'rotate(-15deg) scale(1.5)'
                      }}
                    >
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-center">
                          <img src={watermarkImage} className="w-12 h-12 object-contain" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div 
                      className={`absolute p-4 flex items-center justify-center transition-all duration-500`}
                      style={{
                        top: watermarkPosition.includes('top') ? '0' : watermarkPosition === 'center' ? '50%' : 'auto',
                        bottom: watermarkPosition.includes('bottom') ? '0' : 'auto',
                        left: watermarkPosition.includes('left') ? '0' : watermarkPosition === 'center' ? '50%' : 'auto',
                        right: watermarkPosition.includes('right') ? '0' : 'auto',
                        transform: watermarkPosition === 'center' ? 'translate(-50%, -50%)' : 'none',
                        opacity: watermarkOpacity / 100,
                        width: `${watermarkScale}%`
                      }}
                    >
                      <img src={watermarkImage} className="w-full h-auto object-contain" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white/90 text-[10px] font-bold uppercase tracking-wider">Original Preview</span>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
             <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
               <Check className="w-5 h-5 text-amber-600" />
             </div>
             <div>
               <p className="text-sm font-bold text-amber-900">Pro Tip</p>
               <p className="text-xs text-amber-700 leading-relaxed">
                 Use a white logo with transparency (PNG) for the best result on all types of photos. Center placement with low opacity (15-20%) is recommended for maximum protection.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
