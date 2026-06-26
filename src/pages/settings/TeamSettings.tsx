import { useState, useEffect } from 'react';
import { Plus, Trash2, X, User, Mail, Shield, Lock, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchTeamMembers,
  fetchTeamRoles,
  addTeamMember,
  deleteTeamMember,
  TeamMember
} from '@/store/slices/teamSlice';
import { fetchGroups } from '@/store/slices/groupsSlice';
import { toast } from '@/hooks/use-toast';

const fallbackRoles = [ 'photographer', 'viewer'];

export default function TeamSettings() {
  const dispatch = useAppDispatch();
  const { members, roles, loading } = useAppSelector((state) => state.team);
  const groups = useAppSelector((state) => state.groups.groups);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'viewer',
    password: '',
    permissionType: 'full',
    groupIds: [] as string[]
  });

  useEffect(() => {
    dispatch(fetchTeamMembers(undefined));
    dispatch(fetchTeamRoles(undefined));
    dispatch(fetchGroups({}));
  }, [dispatch]);

  const handleAddMember = () => {
    if (newMember.name && newMember.email) {
      dispatch(addTeamMember({
        ...newMember,
        role: newMember.role.toLowerCase(),
        password: newMember.password,
        permissions: newMember.permissionType === 'full' ? 'full_access' : 'specific',
        permission_type: newMember.permissionType === 'full' ? 'full_access' : 'specific',
        group_id: newMember.permissionType === 'specific' ? newMember.groupIds[0] || null : null,
        group_ids: newMember.permissionType === 'specific' ? newMember.groupIds : []
      }))
        .unwrap()
        .then(() => {
          toast({ title: 'Success', description: 'Team member added successfully' });
          setNewMember({
            name: '',
            email: '',
            role: 'editor',
            password: '',
            permissionType: 'full',
            groupIds: []
          });
          setShowAddModal(false);
          dispatch(fetchTeamMembers());
        })
        .catch((err) => {
          toast({ title: 'Error', description: err || 'Failed to add team member', variant: 'destructive' });
        });
    }
  };

  const handleDeleteClick = (member: TeamMember) => {
    setMemberToDelete(member);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (memberToDelete) {
      dispatch(deleteTeamMember(memberToDelete.id))
        .unwrap()
        .then(() => {
          toast({ title: 'Success', description: 'Team member removed successfully' });
          setMemberToDelete(null);
          setShowDeleteModal(false);
        })
        .catch((err) => {
          toast({ title: 'Error', description: err || 'Failed to remove team member', variant: 'destructive' });
        });
    }
  };

  const displayRoles = roles.length > 0 ? roles.map(r => r.name) : fallbackRoles;
  const displayMembers = Array.isArray(members) ? members : [];

  return (
    <>
      <div className="bg-card rounded-xl border border-border fab-shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold">Team Login</h2>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 rounded-xl fab-gradient text-primary-foreground text-xs font-medium flex items-center gap-1 hover:opacity-90"
          >
            <Plus className="w-3.5 h-3.5" /> Add Member
          </button>
        </div>
        <div className="space-y-3">
          {displayMembers.map(m => (
            <div key={m.id || m.email} className="flex items-center justify-between p-3 rounded-xl border border-border">
              <div>
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
                  {m.role ? m.role.charAt(0).toUpperCase() + m.role.slice(1) : ''}
                </span>
                <button 
                  onClick={() => handleDeleteClick(m)}
                  className="p-1.5 rounded-xl hover:bg-destructive/10 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {displayMembers.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground text-center py-4">No team members found.</p>
          )}
          {loading && (
            <p className="text-sm text-muted-foreground text-center py-4">Loading team members...</p>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md w-full p-0 rounded-2xl border-none shadow-2xl flex flex-col max-h-[90vh]">
          <div className="px-6 pt-6 pb-4 shrink-0">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-heading font-semibold text-foreground">
                <Plus className="w-5 h-5 text-orange-500" />
                Add Team Member
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Invite a new member to join your team
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="space-y-4 overflow-y-auto px-6 pb-2 flex-1">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" /> Full Name
              </Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="rounded-xl border-border focus:ring-orange-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="rounded-xl border-border focus:ring-orange-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" /> Role
              </Label>
              <Select
                value={newMember.role}
                onValueChange={(value) => setNewMember({ ...newMember, role: value })}
              >
                <SelectTrigger className="rounded-xl border-border">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {displayRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" /> Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Set password"
                value={newMember.password}
                onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                className="rounded-xl border-border focus:ring-orange-500/20"
              />
            </div>
            {newMember.role !== 'viewer' && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" /> Permission Level
                  </Label>
                  <Select
                    value={newMember.permissionType}
                    onValueChange={(value) => setNewMember({ ...newMember, permissionType: value })}
                  >
                    <SelectTrigger className="rounded-xl border-border">
                      <SelectValue placeholder="Select permission level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="full">Full Permission</SelectItem>
                      <SelectItem value="specific">Specific Group</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newMember.permissionType === 'specific' && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" /> Select Groups
                    </Label>
                    <div className="border border-border rounded-xl p-3 max-h-40 overflow-y-auto space-y-1 bg-muted/20">
                      {groups && groups.map((group) => {
                        const isChecked = newMember.groupIds.includes(String(group.id));
                        return (
                          <label 
                            key={group.id} 
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const idStr = String(group.id);
                                if (e.target.checked) {
                                  setNewMember(prev => ({
                                    ...prev,
                                    groupIds: [...prev.groupIds, idStr]
                                  }));
                                } else {
                                  setNewMember(prev => ({
                                    ...prev,
                                    groupIds: prev.groupIds.filter(id => id !== idStr)
                                  }));
                                }
                              }}
                              className="rounded border-border text-orange-600 focus:ring-orange-500/20 w-4 h-4"
                            />
                            <span className="text-sm text-foreground">{group.name}</span>
                          </label>
                        );
                      })}
                      {(!groups || groups.length === 0) && (
                        <p className="text-xs text-muted-foreground text-center py-2">No groups available</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium" onClick={handleAddMember} disabled={loading}>
              {loading ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-heading text-destructive">
              <Trash2 className="w-5 h-5" />
              Remove Member
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this team member?
            </DialogDescription>
          </DialogHeader>
          {memberToDelete && (
            <div className="mt-4 p-4 rounded-xl bg-muted/50">
              <p className="font-medium">{memberToDelete.name}</p>
              <p className="text-sm text-muted-foreground">{memberToDelete.email}</p>
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
                {memberToDelete.role}
              </span>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleConfirmDelete} disabled={loading}>
              {loading ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
