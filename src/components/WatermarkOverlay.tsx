import { useWatermark } from '@/contexts/WatermarkContext';
import { motion, AnimatePresence } from 'framer-motion';

interface WatermarkOverlayProps {
  children: React.ReactNode;
  className?: string;
  show?: boolean;
}

export default function WatermarkOverlay({ children, className = '', show = true }: WatermarkOverlayProps) {
  const { 
    watermarkImage, watermarkText, watermarkType,
    watermarkPosition, watermarkOpacity, watermarkScale, isTiled 
  } = useWatermark();

  // Only check the 'show' prop, not watermarkEnabled from context
  // The 'show' prop is controlled by the parent component based on group settings
  if (!show || (watermarkType === 'image' && !watermarkImage) || (watermarkType === 'text' && !watermarkText)) {
    return <div className={`relative ${className}`}>{children}</div>;
  }

  const getPositionStyles = () => {
    switch (watermarkPosition) {
      case 'top-left': return { top: '1rem', left: '1rem' };
      case 'top-right': return { top: '1rem', right: '1rem' };
      case 'bottom-left': return { bottom: '1rem', left: '1rem' };
      case 'bottom-right': return { bottom: '1rem', right: '1rem' };
      case 'center': return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      default: return { bottom: '1rem', right: '1rem' };
    }
  };

  return (
    <div className={`relative ${className} group`}>
      {children}
      
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none overflow-hidden select-none"
        >
          {isTiled ? (
            <div 
              className="w-full h-full grid grid-cols-3 grid-rows-3 gap-8 p-8"
              style={{ opacity: watermarkOpacity / 100 }}
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="flex items-center justify-center opacity-40 -rotate-44">
                  {watermarkType === 'image' && watermarkImage && (
                    <img src={watermarkImage} alt="" className="w-16 h-16 object-contain" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="absolute pointer-events-none"
              style={{ 
                ...getPositionStyles(),
                opacity: watermarkOpacity / 100,
                width: `${watermarkScale}%`
              }}
            >
              {watermarkType === 'image' && watermarkImage && (
                <img
                  src={watermarkImage}
                  alt="Watermark"
                  className="w-full h-auto object-contain"
                />
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
