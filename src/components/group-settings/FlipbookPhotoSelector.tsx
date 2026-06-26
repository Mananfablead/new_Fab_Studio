import { useState } from 'react';
import { useAppSelector } from '@/store';
import { selectPhotos, selectPhotosLoading } from '@/store/selectors';
import { Check, Loader2, Search, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FlipbookPhotoSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (selectedPhotos: { id: string, url: string }[]) => void;
  currentPhotos: string[];
}

export default function FlipbookPhotoSelector({
  open,
  onOpenChange,
  onSelect,
  currentPhotos
}: FlipbookPhotoSelectorProps) {
  const photos = useAppSelector(selectPhotos);
  const loading = useAppSelector(selectPhotosLoading);
  const [selectedPhotos, setSelectedPhotos] = useState<{ id: string, url: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const togglePhoto = (photo: { id: string, url: string }) => {
    setSelectedPhotos(prev => 
      prev.some(p => p.id === photo.id) 
        ? prev.filter(p => p.id !== photo.id) 
        : [...prev, photo]
    );
  };

  const handleConfirm = () => {
    onSelect(selectedPhotos);
    onOpenChange(false);
    setSelectedPhotos([]);
  };

  const filteredPhotos = photos.filter(photo => 
    !currentPhotos.includes(photo.url) &&
    (String(photo.id).toLowerCase().includes(searchQuery.toLowerCase()) || photo.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle>Select Group Photos</DialogTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search photos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 rounded-xl"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading group photos...</p>
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-medium">No photos found</p>
              <p className="text-sm text-muted-foreground">Try a different search or upload more photos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredPhotos.map((photo) => {
                const isSelected = selectedPhotos.some(p => p.id === photo.id);
                return (
                  <div
                    key={photo.id}
                    onClick={() => togglePhoto({ id: photo.id, url: photo.url })}
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                      isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt=""
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 bg-black/20 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-primary border-primary' : 'bg-black/20 border-white'
                    }`}>
                      {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {selectedPhotos.length} photo(s) selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedPhotos.length === 0}
                className="rounded-xl px-8"
              >
                Add to Flipbook
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
