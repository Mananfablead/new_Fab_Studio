import { useState } from 'react';
import { Camera, Users, Calendar, Trash2, LogOut, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { deleteGroup, leaveGroup } from '@/store/slices/groupsSlice';
import { toast } from '@/hooks/use-toast';
import type { Group } from '@/lib/mock-data';
import LeaveGroupModal from './modals/LeaveGroupModal';
import DeleteGroupModal from './modals/DeleteGroupModal';

export default function GroupCard({ group, viewMode = 'grid' }: { group: Group; viewMode?: 'grid' | 'list' | 'compact' | 'masonry' }) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  
  const isOwner = group.createdBy === String(currentUser?.id) || 
                  group.ownerId === String(currentUser?.id) || 
                  (group as any).owner_id === String(currentUser?.id);

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteGroup(group.id)).unwrap();
      toast({
        title: 'Group Deleted',
        description: 'The group has been deleted successfully.',
        variant: 'destructive'
      });
      setShowDeleteModal(false);
    } catch (error: any) {
      const errorMessage = error?.message || error || 'Failed to delete group. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLeave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLeaveModal(true);
  };

  const handleConfirmLeave = async () => {
    setIsLeaving(true);
    try {
      await dispatch(leaveGroup(group.id)).unwrap();
      toast({
        title: 'Left Group',
        description: 'You have left the group successfully.'
      });
      setShowLeaveModal(false);
    } catch (error: any) {
      const errorMessage = error?.message || error || 'Failed to leave group. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <>
      <LeaveGroupModal
        isOpen={showLeaveModal}
        isLoading={isLeaving}
        groupName={group.name}
        onConfirm={handleConfirmLeave}
        onCancel={() => setShowLeaveModal(false)}
      />
      <DeleteGroupModal
        isOpen={showDeleteModal}
        isLoading={isDeleting}
        groupName={group.name}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
      <div
        onClick={() => navigate(`/gallery/${group.id}`)}
        className={`group cursor-pointer bg-card rounded-xl overflow-hidden border border-border fab-shadow hover:fab-shadow-lg transition-all duration-300 hover:-translate-y-1 relative ${viewMode === 'list' ? 'flex flex-col sm:flex-row h-auto sm:h-32' :
            viewMode === 'compact' ? 'break-inside-avoid' :
              viewMode === 'masonry' ? 'break-inside-avoid mb-5' : 'flex flex-col'
          }`}
      >
      {viewMode === 'list' ? (
        <>
          <div className="relative w-full sm:w-48 h-48 sm:h-full flex-shrink-0 overflow-hidden">
            {group.coverImage ? (
              <img
                src={group.coverImage}
                alt={group.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
              </div>
            )}
            {/* ...existing code... */}
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${group.type === 'private' ? 'bg-primary text-primary-foreground' : 'bg-white text-black border border-gray-300'}`}>
                {group.type}
              </span>
            </div>
          </div>
          <div className="flex-1 p-3 sm:p-4 flex flex-col justify-center">
            <h3 className="font-heading font-semibold text-sm sm:text-base">{group.name}</h3>
            <div className="flex items-center justify-between mt-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex-1 flex flex-col gap-2 text-xs">
                <span className="flex items-center gap-1 sm:gap-1.5"><Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {group.photoCount} photos</span>
                <span className="flex items-center gap-1 sm:gap-1.5"><Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {group.participantCount} participants</span>

              </div>
              {/* Action Buttons */}
              <div className="flex flex-col justify-end gap-4">
                <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(group.createdAt)}</span>
                </span>
                <div className="hidden md:flex gap-2 mt-2">
                  {!isOwner && (
                    <button
                      onClick={handleLeave}
                      className="px-3 py-2 text-xs font-medium bg-orange-500/10 text-orange-600 rounded-lg hover:bg-orange-500/20 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Leave
                    </button>
                  )}
                  {isOwner && (
                    <button
                      onClick={handleDelete}
                      className="px-3 py-2 text-xs font-medium bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="relative h-40 sm:h-48 overflow-hidden">
            {group.coverImage ? (
              <img
                src={group.coverImage}
                alt={group.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${group.type === 'private' ? 'bg-primary text-primary-foreground' : 'bg-white text-black border border-gray-300'}`}>
                {group.type}
              </span>
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <h3 className="font-heading font-semibold text-sm sm:text-base truncate">{group.name}</h3>
            <div className="flex items-center justify-between mt-2 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-3 sm:gap-4">
                <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {group.photoCount}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {group.participantCount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(group.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Hover overlay - only appears on hover */}
          {viewMode !== 'compact' && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20">
              {/* Image expands to full card height */}
              <div className="absolute inset-0 overflow-hidden">
                {group.coverImage ? (
                  <img
                    src={group.coverImage}
                    alt={group.name}
                    className="w-full h-full object-cover scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
                  </div>
                )}
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/50" />
              </div>

              {/* Badge */}
              <div className="absolute top-2 right-2 z-10">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${group.type === 'private' ? 'bg-primary text-primary-foreground' : 'bg-white text-black border border-gray-300'}`}>
                  {group.type}
                </span>
              </div>

              {/* Content on hover */}
              <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4 pb-[60px] sm:pb-[68px] z-10">
                <h3 className="font-heading font-semibold text-sm sm:text-base text-white truncate drop-shadow-md">{group.name}</h3>
                <div>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/90 drop-shadow-sm mb-2">
                    <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {group.photoCount} photos</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {group.participantCount} participants</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-white/80 drop-shadow-sm">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(group.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
            {viewMode !== 'list' && (
            <div className="flex gap-2 p-3 sm:p-4 pt-0 z-30 relative mt-auto bg-card group-hover:bg-card/95 backdrop-blur-sm">
              {!isOwner && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleLeave(e); }}
                  className="flex-1 px-3 py-2 text-xs font-semibold bg-orange-500/10 text-orange-600 rounded-lg hover:bg-orange-500/20 transition-all duration-300 flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Leave
                </button>
              )}
              {isOwner && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(e); }}
                  className="flex-1 px-3 py-2 text-xs font-semibold bg-red-500/10 text-red-600 rounded-lg hover:bg-red-500/20 transition-all duration-300 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>
          )}
      </div>
    </>
  );
}
