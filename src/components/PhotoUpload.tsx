import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { uploadPhotos, fetchFolders, createFolder } from '@/store/slices/photosSlice';
import { uploadVideos } from '@/store/slices/videosSlice';
import type { RootState, AppDispatch } from '@/store';
import { Upload, X, CheckCircle, AlertCircle, Image, FolderUp, Video, Film, Cloud, HardDrive, Box, Sparkles, Globe, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { usePlanLimits } from '@/hooks/usePlanLimits';

type UploadTab = 'images' | 'videos' | 'cloud';

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
}

interface PhotoUploadProps {
  groupName?: string;
  onUploadComplete?: (files: File[]) => void;
}

export default function PhotoUpload({ groupName = 'this group', onUploadComplete }: PhotoUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<UploadTab>('images');
  const inputRef = useRef<HTMLInputElement>(null);

  // const { groupId } = useParams<{ groupId: string }>();
  // const dispatch = useDispatch<AppDispatch>();
  // const uploadLoading = useSelector((state: RootState) => state.photos.uploadLoading);
  // const folders = useSelector((state: RootState) => state.photos.folders);
  const currentGroup = useSelector((state: RootState) => state.groups.currentGroup);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const acceptedTypes = activeTab === 'images' 
      ? f => f.type.startsWith('image/')
      : f => f.type.startsWith('video/');
    
    const validFiles = Array.from(newFiles).filter(acceptedTypes);
    if (validFiles.length === 0) {
      const fileType = activeTab === 'images' ? 'image' : 'video';
      toast({ 
        title: 'Invalid files', 
        description: `Please select ${fileType} files only.`, 
        variant: 'destructive' 
      });
      return;
    }

    const uploads: UploadFile[] = validFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: activeTab === 'images' 
        ? URL.createObjectURL(file) 
        : URL.createObjectURL(file),
      progress: 0,
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...uploads]);
    const fileType = activeTab === 'images' ? 'photo(s)' : 'video(s)';
    toast({ title: `${validFiles.length} ${fileType} added`, description: 'Click Upload to start.' });
  }, [activeTab]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const { groupId } = useParams<{ groupId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const photoUploadLoading = useSelector((state: RootState) => state.photos.uploadLoading);
  const videoUploadLoading = useSelector((state: RootState) => state.videos.uploadLoading);
  const uploadLoading = activeTab === 'videos' ? videoUploadLoading : photoUploadLoading;
  
  const folders = useSelector((state: RootState) => state.photos.folders);
  const currentGroupPhotoCount = useSelector((state: RootState) => state.photos.total);
  const currentGroupVideoCount = useSelector((state: RootState) => state.videos.total ?? 0);

  // Plan limits
  const { checkPhotoLimit, checkVideoLimit, checkStorageLimit } = usePlanLimits();
  
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState<string>('');

  useEffect(() => {
    if (groupId && isOpen) {
      dispatch(fetchFolders(groupId));
    }
  }, [groupId, isOpen, dispatch]);

  const handleActualUpload = async () => {
    const pending = files.filter(f => f.status === 'pending' || f.status === 'error');
    if (pending.length === 0) return;
    
    if (!groupId) {
      toast({ title: 'Error', description: 'Group ID not found.', variant: 'destructive' });
      return;
    }

    // Check plan limits before uploading
    if (activeTab === 'images') {
      const photoCheck = checkPhotoLimit(currentGroupPhotoCount, pending.length);
      if (!photoCheck.allowed) {
        toast({ title: 'Plan Limit Reached', description: photoCheck.message, variant: 'destructive' });
        return;
      }
    } else if (activeTab === 'videos') {
      const videoCheck = checkVideoLimit(currentGroupVideoCount, pending.length);
      if (!videoCheck.allowed) {
        toast({ title: 'Plan Limit Reached', description: videoCheck.message, variant: 'destructive' });
        return;
      }
    }

    // Check storage limit
    const totalNewBytes = pending.reduce((sum, f) => sum + f.file.size, 0);
    const storageCheck = checkStorageLimit(totalNewBytes);
    if (!storageCheck.allowed) {
      toast({ title: 'Storage Limit Reached', description: storageCheck.message, variant: 'destructive' });
      return;
    }

    let uploadFolder = selectedFolderId;

    if (newFolderName.trim() !== '') {
      try {
        const createResult = await dispatch(createFolder({ groupId, name: newFolderName.trim() })).unwrap();
        uploadFolder = String(createResult.id || createResult.name);
        setNewFolderName('');
      } catch (err: any) {
        toast({ title: 'Folder creation failed', description: err || 'Could not create folder', variant: 'destructive' });
        return;
      }
    }

    const BATCH_SIZE = 10;
    const totalPending = pending.length;
    const batches: UploadFile[][] = [];

    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      batches.push(pending.slice(i, i + BATCH_SIZE));
    }

    let successfullyUploaded: File[] = [];
    let hasErrorOccurred = false;

    for (let i = 0; i < batches.length; i++) {
      const currentBatch = batches[i];
      const batchIds = currentBatch.map(f => f.id);

      setFiles(prev => prev.map(f => batchIds.includes(f.id) ? { ...f, status: 'uploading', progress: 10 } : f));

      const batchInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (batchIds.includes(f.id) && f.status === 'uploading') {
            const nextProgress = Math.min(92, f.progress + Math.floor(Math.random() * 8) + 4);
            return { ...f, progress: nextProgress };
          }
          return f;
        }));
      }, 350);

      try {
        let resultAction;
        if (activeTab === 'videos') {
          resultAction = await dispatch(uploadVideos({ 
            groupId, 
            files: currentBatch.map(f => f.file)
          }));
        } else {
          resultAction = await dispatch(uploadPhotos({ 
            groupId, 
            files: currentBatch.map(f => f.file),
            folder: uploadFolder || undefined
          }));
        }

        clearInterval(batchInterval);

        if (uploadPhotos.fulfilled.match(resultAction) || uploadVideos.fulfilled.match(resultAction)) {
          setFiles(prev => prev.map(f => batchIds.includes(f.id) ? { ...f, status: 'complete', progress: 100 } : f));
          successfullyUploaded.push(...currentBatch.map(f => f.file));
        } else {
          const errorMsg = (resultAction.payload as any)?.message || resultAction.payload as string || 'Upload failed';
          throw new Error(errorMsg);
        }
      } catch (err: any) {
        clearInterval(batchInterval);
        
        setFiles(prev => prev.map(f => batchIds.includes(f.id) ? { ...f, status: 'error', progress: 0 } : f));
        hasErrorOccurred = true;

        toast({ 
          title: `Batch ${i + 1} failed`, 
          description: err.message || 'Something went wrong during upload', 
          variant: 'destructive' 
        });
        
        break;
      }
    }

    if (successfullyUploaded.length > 0) {
      const fileType = activeTab === 'images' ? 'photo(s)' : 'video(s)';
      toast({ 
        title: 'Upload complete!', 
        description: `Successfully uploaded ${successfullyUploaded.length} of ${totalPending} ${fileType} to ${groupName}.` 
      });
      
      onUploadComplete?.(successfullyUploaded);
      
      if (!hasErrorOccurred && successfullyUploaded.length === totalPending) {
        setTimeout(() => {
          setFiles([]);
          setIsOpen(false);
        }, 1500);
      }
    }
  };

  const completedCount = files.filter(f => f.status === 'complete').length;
  const totalCount = files.length;
  const isUploadingActive = files.some(f => f.status === 'uploading');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (isUploadingActive) return;
      setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        <button className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors">
          <Upload className="w-4 h-4" /> Upload
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" /> Upload to {groupName}
          </DialogTitle>
        </DialogHeader>

        {files.length === 0 && (
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            <button
              onClick={() => {
                setActiveTab('images');
                setFiles([]);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'images'
                  ? 'bg-card text-primary fab-shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Image className="w-4 h-4" />
              <span>Images</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('videos');
                setFiles([]);
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'videos'
                  ? 'bg-card text-primary fab-shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>Videos</span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pt-2">
          {files.length === 0 ? (
            <>
              <div className="space-y-2 px-1">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <FolderUp className="w-4 h-4" /> Upload to Folder (Optional)
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                    className="flex-1 h-10 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">No Folder (Root)</option>
                    {folders && folders.map((f) => (
                      <option key={f.id} value={String(f.id)}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Or create new folder..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="flex-1 h-10 px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-border hover:border-primary/40 hover:bg-muted/30'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept={activeTab === 'images' ? 'image/*' : 'video/*'}
                  className="hidden"
                  onChange={e => e.target.files && addFiles(e.target.files)}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-colors ${isDragging ? 'bg-primary/10' : 'bg-muted'}`}>
                    {activeTab === 'images' ? (
                      <FolderUp className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    ) : (
                      <Film className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {isDragging 
                        ? `Drop your ${activeTab === 'images' ? 'photos' : 'videos'} here` 
                        : `Drag & drop ${activeTab === 'images' ? 'photos' : 'videos'} here`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or click to browse • Supports {activeTab === 'images' ? 'JPG, PNG, WEBP' : 'MP4, MOV, AVI'} • Bulk upload supported
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-muted/20 p-4 rounded-xl border border-border">
                <div className="md:col-span-8 flex items-center gap-3">
                  <div className="relative w-12 h-14 bg-card border border-border rounded-lg flex flex-col items-center justify-center shadow-sm flex-shrink-0">
                    {activeTab === 'images' ? (
                      <>
                        <Image className="w-6 h-6 text-primary" />
                        <div className="absolute bottom-1 bg-primary text-[8px] font-bold text-white px-1 py-0.2 rounded leading-none uppercase">JPG</div>
                      </>
                    ) : (
                      <>
                        <Film className="w-6 h-6 text-primary" />
                        <div className="absolute bottom-1 bg-primary text-[8px] font-bold text-white px-1 py-0.2 rounded leading-none uppercase">MP4</div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-semibold text-sm text-foreground">
                        {completedCount}/{totalCount} {activeTab === 'images' ? 'Photos' : 'Videos'}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {(files.reduce((a, f) => a + f.file.size, 0) / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <Progress value={totalCount > 0 ? (completedCount / totalCount) * 100 : 0} className="h-2 bg-primary/10 transition-all duration-300" />
                  </div>
                </div>

                <div className="md:col-span-4 space-y-1">
                  <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                    Choose Folder
                  </Label>
                  <div className="flex gap-1.5 items-center">
                    <select
                      value={selectedFolderId}
                      disabled={isUploadingActive}
                      onChange={(e) => setSelectedFolderId(e.target.value)}
                      className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium disabled:opacity-50"
                    >
                      <option value="">No Folder (Root)</option>
                      {folders && folders.map((f) => (
                        <option key={f.id} value={String(f.id)}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                    <button className="h-9 w-9 border border-border hover:bg-muted text-muted-foreground rounded-lg flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 max-h-96 pr-2 mt-4 custom-scrollbar">
                {files.map((file) => {
                  const isUploading = file.status === 'uploading';
                  const isComplete = file.status === 'complete';
                  const isError = file.status === 'error';
                  const fileSizeMB = (file.file.size / 1024 / 1024).toFixed(2);

                  return (
                    <div 
                      key={file.id} 
                      className="group relative flex flex-col py-2 px-3 hover:bg-muted/30 rounded-xl transition-all border border-transparent hover:border-border"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {activeTab === 'images' && file.preview && (
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-muted">
                              <img src={file.preview} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <span className="font-semibold text-[13px] text-sky-700 dark:text-sky-400 truncate hover:underline cursor-pointer">
                            {file.file.name}
                          </span>
                        </div>

                        <span className="text-xs text-muted-foreground font-medium flex-shrink-0">
                          {fileSizeMB} MB
                        </span>

                        <div className="flex items-center gap-2 flex-shrink-0 min-w-[100px] justify-end">
                          <span className={`text-[10px] font-bold tracking-wider uppercase ${
                            isComplete ? 'text-[hsl(var(--fab-success))]' :
                            isError ? 'text-destructive' :
                            isUploading ? 'text-primary animate-pulse' :
                            'text-muted-foreground'
                          }`}>
                            {isComplete ? 'COMPLETE' :
                             isError ? 'FAILED' :
                             isUploading ? 'UPLOADING' :
                             'UPLOAD'}
                          </span>
                          
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isComplete ? 'border-[hsl(var(--fab-success))] bg-[hsl(var(--fab-success))]/10 text-[hsl(var(--fab-success))]' :
                            isError ? 'border-destructive bg-destructive/10 text-destructive' :
                            isUploading ? 'border-primary border-t-transparent animate-spin' :
                            'border-muted-foreground/40'
                          }`}>
                            {isComplete && (
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {isError && (
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>

                          {!isUploadingActive && !isComplete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(file.id);
                              }}
                              className="p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="w-full mt-2 bg-muted/60 h-[5px] rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            isComplete ? 'bg-[hsl(var(--fab-success))]' :
                            isError ? 'bg-destructive' :
                            'bg-primary/70'
                          }`}
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
          <p className="text-xs text-muted-foreground">
            {files.length > 0 ? `${files.length} file(s) • ${(files.reduce((a, f) => a + f.file.size, 0) / 1024 / 1024).toFixed(2)} MB` : 'No files selected'}
          </p>
          <div className="flex gap-2">
            {!isUploadingActive && (
              <button 
                onClick={() => inputRef.current?.click()} 
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-1.5"
              >
                {activeTab === 'images' ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />} 
                Add More
              </button>
            )}
            <button
              onClick={handleActualUpload}
              disabled={files.filter(f => f.status === 'pending' || f.status === 'error').length === 0 || isUploadingActive || uploadLoading}
              className="px-6 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
            >
              {isUploadingActive || uploadLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isUploadingActive || uploadLoading
                ? 'Uploading...' 
                : `Upload ${files.filter(f => f.status === 'pending' || f.status === 'error').length > 0 ? `(${files.filter(f => f.status === 'pending' || f.status === 'error').length})` : ''}`
              }
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
