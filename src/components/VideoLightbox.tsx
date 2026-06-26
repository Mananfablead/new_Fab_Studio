import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  X,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { deleteVideo, downloadVideo } from '@/store/slices/videosSlice';
import { selectVideoDownloadLoading, selectDownloadingVideoId } from '@/store/selectors';
import { toast } from '@/hooks/use-toast';
import MediaSharePopup from './popups/MediaSharePopup';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

interface Video {
  id: string;
  url: string;
  thumbnail?: string;
  name?: string;
  createdAt?: string;
}

interface VideoLightboxProps {
  selectedVideo: string | null;
  videos: Video[];
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  allowDownloading?: boolean;
  groupId?: string;
}

export default function VideoLightbox({
  selectedVideo,
  videos,
  onClose,
  onPrev,
  onNext,
  allowDownloading = true,
  groupId
}: VideoLightboxProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const downloadLoading = useSelector(selectVideoDownloadLoading);
  const downloadingVideoId = useSelector(selectDownloadingVideoId);
  const isDownloading = downloadLoading && downloadingVideoId === selectedVideo;
  
  if (!selectedVideo) return null;

  const currentIndex = videos.findIndex(v => v.id === selectedVideo);
  const currentVideo = videos.find(v => v.id === selectedVideo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  const handleDelete = async () => {
    if (!groupId || !selectedVideo) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteVideo({ groupId, videoId: selectedVideo })).unwrap();
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });
      onClose();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err || 'Failed to delete video',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedVideo) return;
    
    try {
      await dispatch(downloadVideo(selectedVideo)).unwrap();
    } catch (err: any) {
      toast({
        title: 'Download Failed',
        description: err || 'Failed to download video',
        variant: 'destructive',
      });
    }
  };

  if (!currentVideo) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-0"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative w-full h-full flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Left: Back button and Counter */}
        <div className="absolute top-6 left-6 flex items-center gap-4 z-50">
          <button 
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} / {videos.length}
          </span>
        </div>

        {/* Video Player Area */}
        <div className="w-full h-full flex items-center justify-center group relative overflow-hidden bg-black">
          {/* Side Navigation Arrows */}
          {currentIndex > 0 && onPrev && (
            <button 
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-4 p-4 text-white/40 hover:text-white transition-colors z-40"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          {currentIndex < videos.length - 1 && onNext && (
            <button 
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-4 p-4 text-white/40 hover:text-white transition-colors z-40"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <video
            key={currentVideo.id} // Force re-render on video change
            src={currentVideo.url}
            className="max-w-full max-h-full"
            autoPlay
            controls
          />

          {/* Right Side Actions (Floating) */}
          <div className="absolute right-6 bottom-32 flex flex-col gap-6 z-50">
            {allowDownloading && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                disabled={isDownloading}
                className="p-2 text-white/80 hover:text-white transition-colors flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Download"
              >
                {isDownloading ? (
                  <Loader2 className="w-7 h-7 animate-spin" />
                ) : (
                  <Download className="w-7 h-7" />
                )}
              </button>
            )}
            <button 
              onClick={(e) => { e.stopPropagation(); setShowSharePopup(true); }}
              className="p-2 text-white/80 hover:text-white transition-colors"
              title="Share"
            >
              <Share2 className="w-7 h-7" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
              className="p-2 text-white/80 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-7 h-7" />
            </button>
          </div>
        </div>

        <MediaSharePopup
          open={showSharePopup}
          onOpenChange={setShowSharePopup}
          shareLink={currentVideo.url}
        />

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                    <Trash2 className="w-7 h-7 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      Delete Video?
                    </h3>
                    <p className="text-sm text-gray-600">
                      Are you sure you want to delete this video? This action cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 rounded-xl h-12"
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="flex-1 rounded-xl h-12 gap-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
