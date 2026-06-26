import { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  Heart,
  X,
  Trash2,
  Image,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import placeholderImage from '/placeholder.svg';
import WatermarkOverlay from '@/components/WatermarkOverlay';
import { useWatermark } from '@/contexts/WatermarkContext';

// ── Watermark rendered inside the image bounds ────────────────────────────────
function LightboxWatermark() {
  const {
    watermarkImage, watermarkText, watermarkType,
    watermarkPosition, watermarkOpacity, watermarkScale, isTiled,
  } = useWatermark();

  if (
    (watermarkType === 'image' && !watermarkImage) ||
    (watermarkType === 'text' && !watermarkText)
  ) return null;

  const getPositionStyles = (): React.CSSProperties => {
    switch (watermarkPosition) {
      case 'top-left':     return { top: '4%', left: '4%' };
      case 'top-right':    return { top: '4%', right: '4%' };
      case 'bottom-left':  return { bottom: '4%', left: '4%' };
      case 'center':       return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'bottom-right':
      default:             return { bottom: '4%', right: '4%' };
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {isTiled ? (
        <div
          className="w-full h-full grid grid-cols-3 grid-rows-3 gap-4 p-4"
          style={{ opacity: watermarkOpacity / 100 }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center opacity-40 -rotate-45">
              {watermarkType === 'image' && watermarkImage && (
                <img src={watermarkImage} alt="" className="w-12 h-12 object-contain" />
              )}
              {watermarkType === 'text' && watermarkText && (
                <span className="text-white text-xs font-bold whitespace-nowrap">{watermarkText}</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="absolute"
          style={{
            ...getPositionStyles(),
            opacity: watermarkOpacity / 100,
            width: `${watermarkScale}%`,
          }}
        >
          {watermarkType === 'image' && watermarkImage && (
            <img src={watermarkImage} alt="Watermark" className="w-full h-auto object-contain" />
          )}
          {watermarkType === 'text' && watermarkText && (
            <span
              className="text-white font-bold drop-shadow-lg whitespace-nowrap"
              style={{ fontSize: `${watermarkScale * 0.3}px` }}
            >
              {watermarkText}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

interface Photo {
  id: string;
  url: string;
  date: string;
  liked: boolean;
  tags: string[];
  isSelectedByClient?: boolean;
  is_selected_by_client?: boolean;
}

interface PhotoLightboxProps {
  selectedPhoto: string | null;
  filteredPhotos: Photo[];
  localPhotos: Photo[];
  likedPhotos: Set<string>;
  isSlideshow: boolean;
  zoomLevel: number;
  isDragging: boolean;
  imagePosition: { x: number; y: number };
  selectionMode: boolean;
  onClose: () => void;
  onToggleSelection: (id: string) => void;
  onPrevPhoto: () => void;
  onNextPhoto: () => void;
  onToggleSlideshow: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onDownload: () => void;
  onShare: () => void;
  onToggleLike: (id: string) => void;
  onDelete: (id: string) => void;
  onImageClick: (e: React.MouseEvent) => void;
  onImageDoubleClick: (e: React.MouseEvent) => void;
  onWheel: (e: React.WheelEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  downloadingPhotoId?: string | null;
  allowDownloading?: boolean;
  enableScreenshots?: boolean;
  isBypassUser?: boolean;
  enableWatermark?: boolean;
  groupUpdatedAt?: string;
  canDelete?: boolean;
}

export default function PhotoLightbox({
  selectedPhoto,
  filteredPhotos,
  localPhotos,
  likedPhotos,
  isSlideshow,
  zoomLevel,
  isDragging,
  imagePosition,
  selectionMode,
  onClose,
  onPrevPhoto,
  onNextPhoto,
  onToggleSlideshow,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onDownload,
  onShare,
  onToggleLike,
  onDelete,
  onImageClick,
  onImageDoubleClick,
  onWheel,
  onMouseMove,
  onMouseUp,
  downloadingPhotoId,
  allowDownloading = true,
  enableScreenshots = true,
  isBypassUser = false,
  enableWatermark = false,
  groupUpdatedAt,
  canDelete = true,
}: PhotoLightboxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { watermarkEnabled } = useWatermark();

  if (!selectedPhoto || selectionMode) return null;

  const currentIndex = filteredPhotos.findIndex(p => p.id === selectedPhoto);
  const currentPhoto = localPhotos.find(p => p.id === selectedPhoto);

  // Helper function to handle missing images
  const getImageUrl = (url: string | undefined | null): string => {
    if (!url || url.trim() === '') {
      return placeholderImage;
    }
    let processedUrl = url;
    if (processedUrl.includes('services/storage/')) {
      processedUrl = processedUrl.replace('services/storage/', 'services/public/storage/');
    } else if (processedUrl.startsWith('storage/')) {
      processedUrl = `https://fabphotopic.fableadtech.in/services/public/${processedUrl}`;
    }

    // Add no_watermark parameter if watermark is disabled
    // Use groupUpdatedAt as cache buster to force refresh when settings change
    let cacheKey = '';
    if (groupUpdatedAt) {
      try {
        cacheKey = String(new Date(groupUpdatedAt).getTime());
      } catch (e) {
        cacheKey = String(Date.now());
      }
    } else {
      cacheKey = String(Date.now());
    }

    if (!enableWatermark) {
      const separator = processedUrl.includes('?') ? '&' : '?';
      processedUrl += `${separator}no_watermark=1&v=${cacheKey}`;
    } else {
      const separator = processedUrl.includes('?') ? '&' : '?';
      processedUrl += `${separator}v=${cacheKey}`;
    }

    return processedUrl;
  };

  // Handle image error fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = placeholderImage;
  };

  // Check if image is available
  const hasImage = currentPhoto?.url && currentPhoto.url.trim() !== '';

  // ESC key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteModal) {
          setShowDeleteModal(false);
        } else {
          onClose();
        }
      }
      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onResetZoom();
        onPrevPhoto();
      }
      if (e.key === 'ArrowRight' && currentIndex < filteredPhotos.length - 1) {
        onResetZoom();
        onNextPhoto();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showDeleteModal, currentIndex, filteredPhotos.length, onPrevPhoto, onNextPhoto, onResetZoom]);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!selectedPhoto) return;
    onDelete(selectedPhoto);
    toast({
      title: 'Photo Deleted',
      description: 'The photo has been deleted successfully.'
    });
    setShowDeleteModal(false);
    onClose();
  };

  const isDownloading = downloadingPhotoId === selectedPhoto;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 bg-black/95 flex items-center justify-center ${(!enableScreenshots && !isBypassUser) ? 'no-screenshots' : ''}`}
      onClick={onClose}
      onWheel={onWheel}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onContextMenu={(e) => (!enableScreenshots && !isBypassUser) && e.preventDefault()}
    >
      {/* Previous Button */}
      {currentIndex > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); onResetZoom(); onPrevPhoto(); }}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all z-10 group"
        >
          <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Next Button */}
      {currentIndex < filteredPhotos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); onResetZoom(); onNextPhoto(); }}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 md:p-4 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all z-10 group"
        >
          <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Top Controls */}
      <div className="absolute top-4 md:top-6 right-4 md:right-6 flex flex-col md:flex-row gap-2 z-10 items-end md:items-center">
        {/* Row 1 (mobile) / all inline (desktop): Slideshow + Zoom controls */}
        <div className="flex gap-2 items-center">
          {/* Slideshow */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSlideshow(); }}
            className={`p-2.5 md:p-3 rounded-xl backdrop-blur-md hover:bg-white/20 transition-all ${isSlideshow ? 'bg-primary/80 text-white' : 'bg-white/10 text-white'
              }`}
          >
            {isSlideshow ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          {/* Zoom Out */}
          <button
            onClick={(e) => { e.stopPropagation(); onZoomOut(); }}
            className="p-2.5 md:p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
            disabled={zoomLevel <= 1}
          >
            <ZoomOut className={`w-5 h-5 ${zoomLevel <= 1 ? 'text-white/40' : 'text-white'}`} />
          </button>

          {/* Zoom In */}
          <button
            onClick={(e) => { e.stopPropagation(); onZoomIn(); }}
            className="p-2.5 md:p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>

          {/* Divider — desktop only */}
          <div className="hidden md:block w-px h-8 bg-white/20 mx-1" />

          {/* Download — desktop only (shown in row 2 on mobile) */}
          {(allowDownloading || isBypassUser) && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(); }}
              disabled={isDownloading}
              className="hidden md:flex p-2.5 md:p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-white" />
              )}
            </button>
          )}

          {/* Share — desktop only */}
          <button
            onClick={(e) => { e.stopPropagation(); onShare(); }}
            className="hidden md:flex p-2.5 md:p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>

          {/* Like — desktop only */}
          <button
            onClick={(e) => { e.stopPropagation(); if (selectedPhoto) onToggleLike(selectedPhoto); }}
            className="hidden md:flex p-2.5 md:p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
          >
            <Heart className={`w-5 h-5 ${likedPhotos.has(selectedPhoto) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>

          {/* Delete — desktop only */}
          {canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDeleteClick(); }}
              className="hidden md:flex p-2.5 md:p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-red-500/30 transition-all"
            >
              <Trash2 className="w-5 h-5 text-white hover:text-red-400" />
            </button>
          )}

          {/* Close — desktop only */}
          <button
            onClick={onClose}
            className="hidden md:flex p-2.5 md:p-3 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Row 2 — mobile only: action buttons */}
        <div className="flex md:hidden gap-2 items-center">
          {/* Download */}
          {(allowDownloading || isBypassUser) && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(); }}
              disabled={isDownloading}
              className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-white" />
              )}
            </button>
          )}

          {/* Share */}
          <button
            onClick={(e) => { e.stopPropagation(); onShare(); }}
            className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>

          {/* Like */}
          <button
            onClick={(e) => { e.stopPropagation(); if (selectedPhoto) onToggleLike(selectedPhoto); }}
            className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
          >
            <Heart className={`w-5 h-5 ${likedPhotos.has(selectedPhoto) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>

          {/* Delete */}
          {canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); handleDeleteClick(); }}
              className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-red-500/30 transition-all"
            >
              <Trash2 className="w-5 h-5 text-white hover:text-red-400" />
            </button>
          )}

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Zoom Level Indicator */}
      {zoomLevel > 1 && (
        <div className="absolute bottom-20 md:bottom-24 right-4 md:right-6 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md">
          <span className="text-white text-xs font-medium">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      )}

      {/* Image Counter */}
      <div className="absolute bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md">
        <span className="text-white text-sm font-medium">
          {currentIndex + 1} / {filteredPhotos.length}
        </span>
      </div>

      {/* Full Size Image or Message */}
      {hasImage ? (
        <div className="w-full h-full flex items-center justify-center p-4 md:p-20 transition-transform duration-200 ease-out select-none">
          <div
            className="relative"
            style={{
              transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoomLevel})`,
              cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'fit-content',
              height: 'fit-content',
            }}
            onClick={(e) => { e.stopPropagation(); onImageClick(e); }}
            onDoubleClick={(e) => { e.stopPropagation(); onImageDoubleClick(e); }}
          >
            <img
              src={getImageUrl(currentPhoto?.url)}
              alt=""
              style={{
                display: 'block',
                maxWidth: 'calc(100vw - 2rem)',
                maxHeight: 'calc(100vh - 10rem)',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
              }}
              onError={handleImageError}
              draggable={enableScreenshots || isBypassUser}
            />
            {watermarkEnabled && enableWatermark && <LightboxWatermark />}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-white">
          <Image className="w-20 h-20 mb-4 opacity-50" />
          <p className="text-xl font-semibold mb-2">Image Not Available</p>
          <p className="text-sm opacity-75">This photo has not been uploaded yet</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Icon & Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 className="w-7 h-7 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Delete Photo?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Are you sure you want to delete this photo? This action cannot be undone.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
