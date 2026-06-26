import { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Crown,
  User,
  UserX,
  MoreVertical,
  Mail,
  LogOut,
  Trash2,
  UserPlus,
  Loader2,
  UserCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchParticipants, clearParticipants, deleteParticipant, updateParticipantRole, blockParticipant, unblockParticipant } from '@/store/slices/participantsSlice';
import QRCodePopup from '@/components/popups/QRCodePopup';
import { selectCurrentGroup } from '@/store/selectors';
import api from '@/services/api';

interface Participant {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer' | 'blocked';
  avatar: string;
  joinedDate: string;
}

interface ParticipantsSettingsProps {
  groupId?: string;
  groupName?: string;
  onDeleteGroup?: () => void;
  onLeaveGroup?: () => void;
}

type FilterType = 'all' | 'admin' | 'viewer' | 'blocked';

export default function ParticipantsSettings({
  groupId = '',
  groupName = 'Group',
  onDeleteGroup,
  onLeaveGroup
}: ParticipantsSettingsProps = {}) {
  const [participantFilter, setParticipantFilter] = useState<FilterType>('all');
  const [participantSearch, setParticipantSearch] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [transferTarget, setTransferTarget] = useState<Participant | null>(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { participants, loading, pagination } = useAppSelector((state) => state.participants);
  const group = useAppSelector(selectCurrentGroup);
  const qrLink = useAppSelector((state) => state.groups.qrLink);
  const isCurrentUserOwner =
    Boolean(user?.id) &&
    (String(user?.id) === String(group?.ownerId) ||
     String(user?.id) === String(group?.owner_id) ||
     String(user?.id) === String(group?.createdBy) ||
     String(user?.id) === String(group?.created_by) ||
     String(user?.id) === String(group?.owner?.id));

  const isTeamMember = (group as any)?.team_members?.some(
    (member: any) => String(member.user_id) === String(user?.id)
  );
  
  const isGroupAdmin = participants?.some(
    (p: any) => String(p.id) === String(user?.id) && p.role?.toLowerCase() === 'admin'
  );

  const canManage = user?.role !== 'user' || isTeamMember || isCurrentUserOwner || isGroupAdmin;

  useEffect(() => {
    if (groupId) {
      dispatch(fetchParticipants({ groupId, page: currentPage }));
    }
  }, [dispatch, groupId, currentPage]);

  useEffect(() => {
    // Reset to page 1 if filter or search changes
    setCurrentPage(1);
  }, [participantFilter, participantSearch]);

  useEffect(() => {
    return () => {
      dispatch(clearParticipants());
    };
  }, [dispatch]);

  const joinCode = (group as any)?.joinCode || (group as any)?.join_code || null;
  const rawInviteLink = (group as any)?.inviteLink || (group as any)?.invite_link || '';
  const inviteLink =
    joinCode
      ? `${window.location.origin}/join/${encodeURIComponent(String(joinCode))}`
      : (rawInviteLink.includes('/join/') ? rawInviteLink : rawInviteLink || `${window.location.origin}/join/${groupId}`);

  const getRoleColors = (role: string) => {
    switch (role) {
      case 'admin': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', avatar: 'from-amber-200 to-orange-200', avatarText: 'text-amber-700' };
      case 'viewer':
      case 'user': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', avatar: 'from-blue-200 to-indigo-200', avatarText: 'text-blue-700' };
      case 'blocked': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', avatar: 'from-red-100 to-rose-100', avatarText: 'text-red-500' };
      default: return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border', avatar: 'from-muted to-muted', avatarText: 'text-muted-foreground' };
    }
  };

  const getRoleIcon = (role: string, isBlocked?: boolean) => {
    if (isBlocked) return <UserX className="w-3.5 h-3.5 text-red-500" />;
    switch (role.toLowerCase()) {
      case 'admin': return <Crown className="w-3.5 h-3.5 text-amber-500" />;
      case 'viewer':
      case 'user': return <User className="w-3.5 h-3.5 text-blue-500" />;
      default: return <User className="w-3.5 h-3.5 text-muted-foreground" />;
    }
  };

  const filteredParticipants = participants.filter(participant => {
    const name = `${participant.firstName} ${participant.lastName}`.toLowerCase();
    const matchesFilter = participantFilter === 'all' || 
      (participantFilter === 'blocked' ? (participant.isBlocked || participant.role.toLowerCase() === 'blocked' || participant.status === 'blocked') : 
       (participantFilter === 'user' ? (participant.role.toLowerCase() === 'user' || participant.role.toLowerCase() === 'viewer') : participant.role.toLowerCase() === participantFilter));
    const matchesSearch = name.includes(participantSearch.toLowerCase()) ||
      participant.email.toLowerCase().includes(participantSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters = [
    { key: 'all', label: 'All', count: participants.length },
    { key: 'admin', label: 'Admins', count: participants.filter(p => p.role.toLowerCase() === 'admin').length },
    { key: 'user', label: 'Members', count: participants.filter(p => p.role.toLowerCase() === 'user' || p.role.toLowerCase() === 'viewer').length },
    { key: 'blocked', label: 'Blocked', count: participants.filter(p => p.isBlocked || p.role.toLowerCase() === 'blocked' || p.status === 'blocked').length },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-heading font-bold">Participants</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage group members and their permissions</p>
        </div>
        <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
          {canManage && (
            <button
              onClick={onDeleteGroup}
              className="px-4 py-2.5 rounded-xl border border-destructive/50 text-destructive text-xs sm:text-sm font-medium hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete Group</span>
              <span className="sm:hidden">Delete</span>
            </button>
          )}
          <button
            onClick={onLeaveGroup}
            className="px-4 py-2.5 rounded-xl border border-border text-xs sm:text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Leave</span>
            <span className="sm:hidden">Leave</span>
          </button>
          {canManage && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 col-span-2 md:col-span-1 min-h-[44px]"
            >
              <UserPlus className="w-4 h-4" />
              Invite
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={participantSearch}
            onChange={(e) => setParticipantSearch(e.target.value)}
            placeholder="Search participants..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
          />
        </div>
        <div className="flex gap-1.5 p-1 bg-muted rounded-xl overflow-x-auto !scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setParticipantFilter(filter.key as any)}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 min-h-[40px] ${participantFilter === filter.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {filter.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${participantFilter === filter.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-background/70 text-muted-foreground'
                }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Participants List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading participants...</p>
          </div>
        ) : filteredParticipants.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="font-medium text-muted-foreground">No participants found</p>
          </div>
        ) : (
          filteredParticipants.map((participant) => {
            const colors = getRoleColors(participant.role.toLowerCase());
            const fullName = `${participant.firstName} ${participant.lastName}`;
            const initials = `${participant.firstName.charAt(0)}${participant.lastName.charAt(0)}`.toUpperCase();
            const isParticipantOwner =
              String(participant.id) === String(group?.ownerId) ||
              String(participant.id) === String(group?.owner_id) ||
              String(participant.id) === String(group?.createdBy) ||
              String(participant.id) === String(group?.created_by) ||
              String(participant.id) === String(group?.owner?.id);

            const getAvatarUrl = (avatar: string | undefined | null) => {
              if (!avatar) return null;
              if (avatar.startsWith('http')) return avatar;
              let processedAvatar = avatar;
              if (processedAvatar.includes('services/images/')) {
                processedAvatar = processedAvatar.replace('services/images/', 'services/public/images/');
              }
              if (processedAvatar.startsWith('/')) return `https://fabphotopic.fableadtech.in${processedAvatar}`;
              return `https://fabphotopic.fableadtech.in/services/public/images/avatars/${processedAvatar}`;
            };

            const avatarSrc = getAvatarUrl(participant.avatar);

            return (
              <div
                key={participant.id}
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all"
              >
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br ${colors.avatar} flex items-center justify-center shrink-0 overflow-hidden`}>
                    {avatarSrc ? (
                      <img src={avatarSrc} alt={fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span className={`${colors.avatarText} font-bold text-[10px] sm:text-xs`}>
                        {initials}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h4 className="font-semibold text-xs sm:text-sm truncate">{fullName}</h4>
                      {getRoleIcon(participant.role, participant.isBlocked)}
                    </div>
                    <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{participant.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className={`px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold border ${participant.isBlocked ? 'bg-red-100 text-red-700 border-red-200' : colors.bg} ${participant.isBlocked ? '' : colors.text} ${participant.isBlocked ? '' : colors.border} whitespace-nowrap`}>
                    {participant.isBlocked ? 'Blocked' : (participant.role.toLowerCase() === 'user' ? 'Member' : (participant.role.charAt(0).toUpperCase() + participant.role.slice(1)))}
                  </span>

                  {isParticipantOwner ? (
                    <button disabled className="p-1.5 rounded-xl opacity-30 cursor-not-allowed shrink-0" title="Actions disabled for group owner">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-xl hover:bg-muted transition-colors shrink-0">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {!participant.isBlocked && participant.role.toLowerCase() !== 'blocked' && participant.status !== 'blocked' ? (
                          <DropdownMenuItem
                            className="text-amber-600"
                            onClick={() => {
                              if (!canManage) {
                                toast({ title: 'Permission Denied', description: "You don't have permission", variant: 'destructive' });
                                return;
                              }
                              if (groupId) {
                                dispatch(blockParticipant({ groupId, participantId: participant.id }))
                                  .unwrap()
                                  .then(() => toast({ title: 'Success', description: 'User blocked successfully' }))
                                  .catch((err) => toast({ title: 'Error', description: typeof err === 'string' ? err : (err?.message || 'Failed to block user'), variant: 'destructive' }));
                              }
                            }}
                          >
                            <UserX className="mr-2 h-4 w-4" />
                            Block User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-green-600"
                            onClick={() => {
                              if (!canManage) {
                                toast({ title: 'Permission Denied', description: "You don't have permission", variant: 'destructive' });
                                return;
                              }
                              if (groupId) {
                                dispatch(unblockParticipant({ groupId, participantId: participant.id }))
                                  .unwrap()
                                  .then(() => toast({ title: 'Success', description: 'User unblocked successfully' }))
                                  .catch((err) => toast({ title: 'Error', description: typeof err === 'string' ? err : (err?.message || 'Failed to unblock user'), variant: 'destructive' }));
                              }
                            }}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Unblock User
                          </DropdownMenuItem>
                        )}
                        {canManage && participant.role.toLowerCase() !== 'admin' && (
                          <DropdownMenuItem
                            onClick={() => {
                              if (!canManage) {
                                toast({ title: 'Permission Denied', description: "You don't have permission", variant: 'destructive' });
                                return;
                              }
                              if (groupId) {
                                dispatch(updateParticipantRole({ groupId, participantId: participant.id, role: 'admin' }))
                                  .unwrap()
                                  .then(() => toast({ title: 'Success', description: 'User promoted to Admin' }))
                                  .catch((err) => toast({ title: 'Error', description: typeof err === 'string' ? err : (err?.message || 'Failed to make admin'), variant: 'destructive' }));
                              }
                            }}
                          >
                            <Crown className="mr-2 h-4 w-4" />
                            Make Admin
                          </DropdownMenuItem>
                        )}
                        {canManage && participant.role.toLowerCase() === 'admin' && (
                          <DropdownMenuItem
                            onClick={() => {
                              if (!canManage) {
                                toast({ title: 'Permission Denied', description: "You don't have permission", variant: 'destructive' });
                                return;
                              }
                              if (groupId) {
                                dispatch(updateParticipantRole({ groupId, participantId: participant.id, role: 'user' }))
                                  .unwrap()
                                  .then(() => toast({ title: 'Success', description: 'User role changed to Member' }))
                                  .catch((err) => toast({ title: 'Error', description: typeof err === 'string' ? err : (err?.message || 'Failed to remove admin role'), variant: 'destructive' }));
                              }
                            }}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Make Member
                          </DropdownMenuItem>
                        )}
                        {isCurrentUserOwner && (
                          <DropdownMenuItem
                            className="text-blue-600"
                            onClick={() => setTransferTarget(participant)}
                          >
                            <UserCheck className="mr-2 h-4 w-4 text-blue-600" />
                            Transfer Ownership
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (!canManage) {
                              toast({ title: 'Permission Denied', description: "You don't have permission", variant: 'destructive' });
                              return;
                            }
                            if (groupId) {
                              dispatch(deleteParticipant({ groupId, participantId: participant.id }))
                                .unwrap()
                                .then(() => toast({ title: 'Success', description: 'User deleted' }))
                                .catch((err) => toast({ title: 'Error', description: typeof err === 'string' ? err : (err?.message || 'Failed to delete user'), variant: 'destructive' }));
                            }
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Count & Pagination */}
      <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredParticipants.length}</span> of <span className="font-semibold text-foreground">{pagination?.total || participants.length}</span> participants
        </p>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={!pagination.hasPrevious || loading}
              className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted disabled:opacity-50 transition-colors text-xs font-medium flex items-center gap-1"
            >
              Previous
            </button>
            <span className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
              disabled={!pagination.hasNext || loading}
              className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted disabled:opacity-50 transition-colors text-xs font-medium flex items-center gap-1"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <QRCodePopup
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        inviteLink={inviteLink}
        groupName={groupName}
      />

      <AlertDialog open={!!transferTarget} onOpenChange={(open) => !open && setTransferTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <Crown className="w-5 h-5 text-amber-500" />
              Transfer Group Ownership
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground mt-2">
              Are you sure you want to transfer ownership of <strong>{groupName}</strong> to <strong>{transferTarget ? `${transferTarget.firstName} ${transferTarget.lastName}` : ''}</strong>?
              <br /><br />
              <span className="text-destructive font-medium">Warning:</span> You will lose all owner privileges and will no longer be able to manage this group's settings or members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={transferLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-600 hover:bg-amber-700 text-white animate-none"
              disabled={transferLoading}
              onClick={(e) => {
                e.preventDefault();
                if (!transferTarget) return;
                setTransferLoading(true);
                api.post(`/groups/${groupId}/transfer-ownership`, {
                  new_owner_id: transferTarget.id,
                  old_owner_role: user?.role || 'admin'
                })
                .then(() => {
                  toast({ title: 'Success', description: 'Group ownership transferred successfully.' });
                  setTimeout(() => {
                    setTransferTarget(null);
                    setTransferLoading(false);
                    window.location.reload();
                  }, 1200);
                })
                .catch((err) => {
                  setTransferLoading(false);
                  const errorMsg = err.response?.data?.message || err.message || 'Failed to transfer ownership';
                  toast({ 
                    title: 'Error', 
                    description: errorMsg, 
                    variant: 'destructive' 
                  });
                });
              }}
            >
              {transferLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Transferring...
                </>
              ) : (
                'Transfer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
