import { useState } from 'react';
import { Heart, Check, X, ShoppingCart, Download, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { galleryPhotos } from '@/lib/mock-data';

interface ClientAlbumSelectionProps {
  groupId?: string;
  maxSelections?: number;
}

export default function ClientAlbumSelection({ groupId, maxSelections = 100 }: ClientAlbumSelectionProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'selected'>('grid');

  const handleToggleSelection = (photoId: string) => {
    setSelectedPhotos(prev => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        if (next.size >= maxSelections) {
          toast({
            title: 'Selection Limit Reached',
            description: `You can only select up to ${maxSelections} photos.`,
            variant: 'destructive',
          });
          return prev;
        }
        next.add(photoId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedPhotos.size === galleryPhotos.length) {
      setSelectedPhotos(new Set());
    } else {
      const limited = galleryPhotos.slice(0, maxSelections).map(p => p.id);
      setSelectedPhotos(new Set(limited));
      toast({
        title: 'Photos Selected',
        description: `Selected ${limited.length} photos for your album.`,
      });
    }
  };

  const handleConfirmSelection = () => {
    toast({
      title: 'Album Selection Confirmed!',
      description: `You have selected ${selectedPhotos.size} photos for your album.`,
    });
  };

  const displayedPhotos = viewMode === 'selected' 
    ? galleryPhotos.filter(p => selectedPhotos.has(p.id))
    : galleryPhotos;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-semibold flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            Member Favorite Selection
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            View photos that group members have favorited from your uploads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {selectedPhotos.size} / {maxSelections} selected
          </span>
          <button
            onClick={handleConfirmSelection}
            disabled={selectedPhotos.size === 0}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Confirm Selection
          </button>
        </div>
      </div>

      {/* Selection Progress */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Selection Progress</span>
          <span className="text-sm text-muted-foreground">
            {Math.round((selectedPhotos.size / maxSelections) * 100)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(selectedPhotos.size / maxSelections) * 100}%` }}
          />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleSelectAll}
          className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
        >
          {selectedPhotos.size === galleryPhotos.length ? (
            <>
              <X className="w-4 h-4" />
              Deselect All
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Select All
            </>
          )}
        </button>
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'selected' : 'grid')}
          className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          {viewMode === 'grid' ? 'Show Selected' : 'Show All'}
        </button>
        {selectedPhotos.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <button className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
            <button className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download Selected
            </button>
          </div>
        )}
      </div>

      {/* Photo Grid */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
        <AnimatePresence>
          {displayedPhotos.map((photo, i) => {
            const isSelected = selectedPhotos.has(photo.id);
            return (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className={`group relative mb-3 break-inside-avoid rounded-xl overflow-hidden cursor-pointer ${
                  isSelected ? 'ring-3 ring-primary' : ''
                }`}
                onClick={() => handleToggleSelection(photo.id)}
              >
                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-auto group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div
                  className={`absolute inset-0 transition-colors ${
                    isSelected ? 'bg-primary/20' : 'bg-foreground/0 group-hover:bg-foreground/20'
                  }`}
                />

                {/* Selection Indicator */}
                <div className="absolute top-2 left-2">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Hover Actions */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toast({ title: 'Preview', description: 'Photo preview coming soon' });
                    }}
                    className="p-1.5 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
                  >
                    <Eye className="w-4 h-4 text-foreground" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleToggleSelection(photo.id);
                    }}
                    className="p-1.5 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
                  >
                    {isSelected ? (
                      <X className="w-4 h-4 text-destructive" />
                    ) : (
                      <Heart className="w-4 h-4 text-primary" />
                    )}
                  </button>
                </div>

                {/* Selection Badge */}
                {isSelected && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-full bg-primary/90 backdrop-blur-sm">
                    <span className="text-white text-xs font-semibold">Selected</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {displayedPhotos.length === 0 && (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No photos selected yet</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Click on photos to add them to your album selection
          </p>
        </div>
      )}
    </div>
  );
}
