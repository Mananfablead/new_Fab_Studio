import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectFolders, selectApiMode } from '@/store/selectors';
import { fetchFolders, updateFolder, deleteFolder, transferFolderPhotos } from '@/store/slices/photosSlice';
import { 
  FolderOpen,
  ArrowRightLeft,
  GripVertical,
  Edit3,
  Trash2,
  CheckCircle2,
  FolderPlus,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function FoldersSettings() {
  const { groupId } = useParams();
  const dispatch = useAppDispatch();
  const reduxFolders = useAppSelector(selectFolders);
  const apiMode = useAppSelector(selectApiMode);

  useEffect(() => {
    if (groupId && apiMode === 'live') {
      dispatch(fetchFolders(groupId));
    }
  }, [groupId, apiMode, dispatch]);

  const [folders, setFolders] = useState([
    { id: '1', name: '14-04-2026', photoCount: 200, date: '2026-04-14' },
    { id: '2', name: '13-04-2026', photoCount: 150, date: '2026-04-13' },
    { id: '3', name: '12-04-2026', photoCount: 180, date: '2026-04-12' },
    { id: '4', name: '11-04-2026', photoCount: 120, date: '2026-04-11' },
    { id: '5', name: '10-04-2026', photoCount: 90, date: '2026-04-10' },
  ]);

  useEffect(() => {
    if (apiMode === 'live' && reduxFolders) {
      const mapped = reduxFolders.map((f: any) => ({
        id: String(f.id),
        name: f.name,
        photoCount: f.photos?.length || f.photoCount || 0,
        date: f.date || new Date().toISOString().split('T')[0]
      }));

      // Apply saved order from localStorage if exists
      if (groupId) {
        const savedOrder = localStorage.getItem(`folder_order_${groupId}`);
        if (savedOrder) {
          try {
            const orderIds = JSON.parse(savedOrder);
            mapped.sort((a, b) => {
              const indexA = orderIds.indexOf(a.id);
              const indexB = orderIds.indexOf(b.id);
              if (indexA === -1 && indexB === -1) return 0;
              if (indexA === -1) return 1;
              if (indexB === -1) return -1;
              return indexA - indexB;
            });
          } catch (e) {
            console.error('Failed to parse saved folder order', e);
          }
        }
      }
      
      setFolders(mapped);
    }
  }, [reduxFolders, apiMode, groupId]);
  const [showEditFolderDialog, setShowEditFolderDialog] = useState(false);
  const [showDeleteFolderDialog, setShowDeleteFolderDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<{ id: string; name: string } | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [isRearranging, setIsRearranging] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [draggedFolder, setDraggedFolder] = useState<string | null>(null);
  const [transferSource, setTransferSource] = useState('');
  const [transferDestination, setTransferDestination] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const handleEditFolder = (folder: { id: string; name: string }) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setShowEditFolderDialog(true);
  };

  const handleSaveFolderName = async () => {
    if (editingFolder && newFolderName.trim()) {
      if (apiMode === 'live') {
        try {
          await dispatch(updateFolder({ folderId: editingFolder.id, name: newFolderName.trim() })).unwrap();
          toast({ title: 'Folder Updated', description: 'Folder name has been updated successfully.' });
        } catch (error: any) {
          toast({ title: 'Update Failed', description: error || 'Failed to update folder', variant: 'destructive' });
          return;
        }
      } else {
        setFolders(prev =>
          prev.map(f =>
            f.id === editingFolder.id ? { ...f, name: newFolderName.trim() } : f
          )
        );
        toast({ title: 'Folder Updated', description: 'Folder name has been updated successfully.' });
      }
      setShowEditFolderDialog(false);
      setEditingFolder(null);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    setEditingFolder({ id: folderId, name: '' });
    setShowDeleteFolderDialog(true);
  };

  const confirmDeleteFolder = async () => {
    if (editingFolder) {
      if (apiMode === 'live') {
        try {
          await dispatch(deleteFolder(editingFolder.id)).unwrap();
          toast({ title: 'Folder Deleted', description: 'Folder has been deleted successfully.', variant: 'destructive' });
        } catch (error: any) {
          toast({ title: 'Delete Failed', description: error || 'Failed to delete folder', variant: 'destructive' });
          return;
        }
      } else {
        setFolders(prev => prev.filter(f => f.id !== editingFolder.id));
        toast({ title: 'Folder Deleted', description: 'Folder has been deleted successfully.', variant: 'destructive' });
      }
      setShowDeleteFolderDialog(false);
      setEditingFolder(null);
    }
  };

  const handleTransfer = () => {
    setShowTransferDialog(true);
  };

  const confirmTransfer = async () => {
    if (transferSource && transferDestination) {
      setIsTransferring(true);
      if (apiMode === 'live') {
        try {
          const res = await dispatch(transferFolderPhotos({
            source_folder_id: transferSource,
            destination_folder_id: transferDestination
          })).unwrap();

          const sourceFolder = folders.find(f => f.id === transferSource);
          const destFolder = folders.find(f => f.id === transferDestination);
          const count = res?.data?.photos_transferred ?? res?.photos_transferred ?? 0;
          
          toast({ 
            title: 'Transfer Complete', 
            description: `Successfully transferred ${count} photos from ${sourceFolder?.name || 'source'} to ${destFolder?.name || 'destination'}.` 
          });
          
          // Refresh folders list to sync any other server modifications
          if (groupId) {
            dispatch(fetchFolders(groupId));
          }
        } catch (error: any) {
          toast({ 
            title: 'Transfer Failed', 
            description: error || 'Failed to transfer photos', 
            variant: 'destructive' 
          });
          setIsTransferring(false);
          return;
        }
      } else {
        // Mock fallback logic
        const sourceFolder = folders.find(f => f.id === transferSource);
        const destFolder = folders.find(f => f.id === transferDestination);
        
        if (sourceFolder && destFolder) {
          const countToTransfer = sourceFolder.photoCount;
          setFolders(prev => prev.map(f => {
            if (f.id === transferSource) {
              return { ...f, photoCount: 0 };
            }
            if (f.id === transferDestination) {
              return { ...f, photoCount: f.photoCount + countToTransfer };
            }
            return f;
          }));
          toast({ 
            title: 'Transfer Complete', 
            description: `Photos transferred from ${sourceFolder.name} to ${destFolder.name}` 
          });
        }
      }
      setIsTransferring(false);
      setShowTransferDialog(false);
      setTransferSource('');
      setTransferDestination('');
    }
  };

  const handleDragStart = (folderId: string) => {
    setDraggedFolder(folderId);
  };

  const handleDragOver = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    if (draggedFolder && draggedFolder !== targetFolderId) {
      setFolders(prev => {
        const newFolders = [...prev];
        const draggedIndex = newFolders.findIndex(f => f.id === draggedFolder);
        const targetIndex = newFolders.findIndex(f => f.id === targetFolderId);
        const [removed] = newFolders.splice(draggedIndex, 1);
        newFolders.splice(targetIndex, 0, removed);
        return newFolders;
      });
    }
  };

  const handleDragEnd = () => {
    setDraggedFolder(null);
  };

  const saveRearrangedOrder = () => {
    setIsRearranging(false);
    if (groupId) {
      const orderIds = folders.map(f => f.id);
      localStorage.setItem(`folder_order_${groupId}`, JSON.stringify(orderIds));
    }
    toast({ title: 'Order Saved', description: 'Folder order has been updated successfully.' });
  };

  const totalPhotos = folders.reduce((sum, f) => sum + f.photoCount, 0);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-heading font-bold">Folders</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage and organize your photo folders</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleTransfer}
            className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transfer
          </button>
          <button
            onClick={() => isRearranging ? saveRearrangedOrder() : setIsRearranging(!isRearranging)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              isRearranging
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                : 'bg-muted text-foreground hover:bg-secondary'
            }`}
          >
            {isRearranging ? <CheckCircle2 className="w-4 h-4" /> : <GripVertical className="w-4 h-4" />}
            {isRearranging ? 'Save Order' : 'Rearrange'}
          </button>
        </div>
      </div>

      {/* Folders List */}
      <div className="space-y-2 mb-5">
        {folders.map((folder, index) => (
          <div
            key={folder.id}
            draggable={isRearranging}
            onDragStart={() => isRearranging && handleDragStart(folder.id)}
            onDragOver={(e) => isRearranging && handleDragOver(e, folder.id)}
            onDragEnd={handleDragEnd}
            className={`flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all ${
              isRearranging
                ? 'border-primary/50 cursor-move hover:border-primary hover:bg-muted/50'
                : draggedFolder === folder.id
                ? 'border-primary bg-primary/5 opacity-50'
                : 'border-border hover:border-primary/30 hover:bg-muted/20'
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Drag Handle or Index */}
              {isRearranging ? (
                <div className="cursor-move text-muted-foreground">
                  <GripVertical className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  {index + 1}
                </div>
              )}

              {/* Folder Icon */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shrink-0">
                <FolderOpen className="w-5 h-5 text-amber-600" />
              </div>

              {/* Folder Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{folder.name}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon className="w-3 h-3" />
                  <span>{folder.photoCount} photos</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isRearranging && (
                <>
                  <button
                    onClick={() => handleEditFolder({ id: folder.id, name: folder.name })}
                    className="p-1.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                    title="Edit folder"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteFolder(folder.id)}
                    className="p-1.5 rounded-xl hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                    title="Delete folder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
              {isRearranging && (
                <div className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-xl">
                  Pos {index + 1}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{folders.length}</span> folders · <span className="font-semibold text-foreground">{totalPhotos}</span> photos
          </p>
        </div>
      </div>

      {/* Edit Folder Dialog */}
      <Dialog open={showEditFolderDialog} onOpenChange={setShowEditFolderDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-primary" />
              Edit Folder Name
            </DialogTitle>
            <DialogDescription className="text-sm">Enter a new name for this folder</DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            placeholder="Enter folder name"
            autoFocus
          />
          <DialogFooter>
            <button
              onClick={() => setShowEditFolderDialog(false)}
              className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveFolderName}
              disabled={!newFolderName.trim()}
              className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={showDeleteFolderDialog} onOpenChange={setShowDeleteFolderDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Delete Folder?</DialogTitle>
                <DialogDescription className="mt-0.5 text-sm">
                  All photos in this folder will be moved to the default folder.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setShowDeleteFolderDialog(false)}
              className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteFolder}
              className="flex-1 px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Photos Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              Transfer Photos
            </DialogTitle>
            <DialogDescription className="text-sm">Move photos from one folder to another</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Source Folder</label>
              <Select value={transferSource} onValueChange={setTransferSource}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select source folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name} ({folder.photoCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Destination Folder</label>
              <Select value={transferDestination} onValueChange={setTransferDestination}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select destination folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders.filter(f => f.id !== transferSource).map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name} ({folder.photoCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setShowTransferDialog(false)}
              className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmTransfer}
              disabled={!transferSource || !transferDestination || isTransferring}
              className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isTransferring ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Transfer
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
