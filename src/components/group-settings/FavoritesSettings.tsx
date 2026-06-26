import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Download, Loader2, X, ChevronRight, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/store';
import { downloadPhoto, downloadPhotos } from '@/store/slices/photosSlice';

interface LikedPhoto {
  id: string | number;
  url: string;
  thumbnail?: string;
  thumbnail_url?: string;
  filename?: string;
  originalName?: string;
}

interface FavoriteItem {
  photo: LikedPhoto;
  user?: {
    id: string | number;
    name: string;
    email?: string;
  };
  favorited_at?: string;
}

function getImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.includes('services/storage/')) {
    return url.replace('services/storage/', 'services/public/storage/');
  }
  if (url.startsWith('storage/')) {
    return `https://fabphotopic.fableadtech.in/services/public/${url}`;
  }
  return url;
}

export default function FavoritesSettings() {
  const { groupId } = useParams<{ groupId: string }>();
  const dispatch = useAppDispatch();
  const bulkDownloadLoading = useAppSelector((state) => state.photos.bulkDownloadLoading);
  const downloadingPhotoId = useAppSelector((state) => state.photos.downloadingPhotoId);

  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [lightboxItem, setLightboxItem] = useState<FavoriteItem | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(null);

  const usersWithFavorites = useMemo(() => {
    const userMap = new Map<string | number, { user: FavoriteItem['user'], count: number, photos: FavoriteItem[] }>();
    favorites.forEach(item => {
      const uid = item.user?.id;
      if (!uid) return;
      if (!userMap.has(uid)) {
        userMap.set(uid, { user: item.user, count: 0, photos: [] });
      }
      const u = userMap.get(uid)!;
      u.count++;
      u.photos.push(item);
    });
    return Array.from(userMap.values());
  }, [favorites]);

  const selectedUser = selectedUserId ? usersWithFavorites.find(u => u.user?.id === selectedUserId) : null;

  useEffect(() => {
    if (!groupId) return;

    const fetchLikedPhotos = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/groups/${groupId}/favorites/all`);

        const list: FavoriteItem[] = Array.isArray(data?.favorites)
          ? data.favorites
          : [];

        setFavorites(list);
      } catch (err) {
        console.error('Failed to fetch liked photos', err);
        toast({ title: 'Error', description: 'Failed to load liked photos.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchLikedPhotos();
  }, [groupId]);

  const handleDownload = async (item: FavoriteItem) => {
    const result = await dispatch(downloadPhoto(String(item.photo.id)));
    if (downloadPhoto.rejected.match(result)) {
      toast({ title: 'Error', description: 'Failed to download photo.', variant: 'destructive' });
    }
  };

  const handleDownloadAll = async () => {
    const photosToDownload = selectedUser ? selectedUser.photos : favorites;
    if (!groupId || photosToDownload.length === 0) return;
    const photoIds = photosToDownload.map((f) => String(f.photo.id));
    const result = await dispatch(downloadPhotos({
      groupId,
      downloadType: 'specific',
      photoIds,
    }));
    if (downloadPhotos.rejected.match(result)) {
      toast({ title: 'Error', description: 'Failed to download photos.', variant: 'destructive' });
    }
  };



  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Client Favorites
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            All photos liked by members in this group.
          </p>
        </div>
        {favorites.length > 0 && (
          <button
            onClick={handleDownloadAll}
            disabled={bulkDownloadLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all shadow-sm shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {bulkDownloadLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Downloading...</>
              : <><Download className="w-4 h-4" /> {selectedUser ? `Download All (${selectedUser.count})` : `Download All (${favorites.length})`}</>
            }
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* User List */}
      {!loading && !selectedUserId && usersWithFavorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-2">
          {usersWithFavorites.map(({ user, count }) => (
            <div 
              key={user?.id}
              onClick={() => setSelectedUserId(user?.id!)}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-xl cursor-pointer hover:border-primary/40 transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-medium text-lg uppercase">
                    {user?.name?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    {user?.name || 'Unknown User'}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                    {count} {count === 1 ? 'photo' : 'photos'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 ml-2" />
            </div>
          ))}
        </div>
      )}

      {/* Selected User Photos */}
      {!loading && selectedUserId && selectedUser && (
        <>
          <button 
            onClick={() => setSelectedUserId(null)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to User List
          </button>
          
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-tighter whitespace-nowrap">
              {selectedUser.count} {selectedUser.count === 1 ? 'Photo' : 'Photos'}
            </span>
            <span className="text-sm font-medium text-foreground">
              Liked by {selectedUser.user?.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {selectedUser.photos.map((item, index) => {
              const photo = item.photo;
              const thumb = getImageUrl(photo?.thumbnail || photo?.thumbnail_url || photo?.url);
              return (
                <div
                  key={`${photo?.id || index}-${item.user?.id || index}`}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted cursor-pointer hover:border-primary/40 transition-all"
                  onClick={() => setLightboxItem(item)}
                >
                  <img
                    src={thumb}
                    alt={photo?.filename || photo?.originalName || String(photo?.id)}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                  />
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                      disabled={downloadingPhotoId === String(photo?.id)}
                      className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                      title="Download"
                    >
                      {downloadingPhotoId === String(photo?.id)
                        ? <Loader2 className="w-4 h-4 animate-spin text-gray-700" />
                        : <Download className="w-4 h-4 text-gray-700" />
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && favorites.length === 0 && (
        <div className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground">
            No liked photos yet
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            When members like photos in this group, they will appear here.
          </p>
        </div>
      )}

      {/* Lightbox */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setLightboxItem(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={getImageUrl(lightboxItem.photo?.url)}
            alt={lightboxItem.photo?.filename || lightboxItem.photo?.originalName || String(lightboxItem.photo?.id)}
            className="max-w-full max-h-[90vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
          
          {/* Lightbox participant info */}
          <div className="absolute top-6 left-6 text-white font-medium flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            Liked by {lightboxItem.user?.name || 'Unknown User'}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); handleDownload(lightboxItem); }}
            className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
          >
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      )}
    </div>
  );
}
