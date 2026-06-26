import { useState, useEffect } from 'react';
import { 
  Globe,
  Shield,
  UploadCloud,
  FolderOpen,
  Edit3,
  UserPlus,
  EyeOff,
  ScanFace,
  Lock,
  Users2,
  FolderX,
  Save,
  CheckCircle2,
  Search,
  Loader2 as Loader2Icon,
  UploadCloud as UploadIcon,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/store';
import { updateGroup } from '@/store/slices/groupsSlice';
import { fetchParticipants, updateParticipantUpload } from '@/store/slices/participantsSlice';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function PrivacySettings() {
  const { groupId } = useParams();
  const dispatch = useAppDispatch();
  const currentGroup = useAppSelector((state) => state.groups.currentGroup);
  const loading = useAppSelector((state) => state.groups.loading);

  const [allowNameIconChange, setAllowNameIconChange] = useState(currentGroup?.privacy?.allowMemberEdit ?? false);
  const [linkJoinEnabled, setLinkJoinEnabled] = useState(currentGroup?.privacy?.allowJoinByLink ?? true);
  const [anonymousViewing, setAnonymousViewing] = useState(currentGroup?.privacy?.allowAnonymousView ?? false);
  const [livenessDetection, setLivenessDetection] = useState(currentGroup?.privacy?.requireFaceVerification ?? false);
  const [uploadPermission, setUploadPermission] = useState<'specific' | 'all'>(
    (currentGroup?.privacy?.uploadPermission === 'all') ? 'all' : 'specific'
  );
  const [saving, setSaving] = useState(false);

  // Participants for upload permission assignment
  const { participants, loading: participantsLoading } = useAppSelector((state) => state.participants);
  const [participantSearch, setParticipantSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (groupId && uploadPermission === 'specific') {
      dispatch(fetchParticipants({ groupId }));
    }
  }, [dispatch, groupId, uploadPermission]);

  const handleToggleUpload = async (participantId: string, current: boolean) => {
    if (!groupId) return;
    setUpdatingId(participantId);
    try {
      await dispatch(updateParticipantUpload({ groupId, participantId, canUpload: !current })).unwrap();
      toast({ title: 'Updated', description: `Upload permission ${!current ? 'granted' : 'revoked'}.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err || 'Failed to update', variant: 'destructive' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSavePrivacySettings = async () => {
    if (!groupId) return;
    
    setSaving(true);
    try {
      const payload = {
        privacy: {
          allowMemberEdit: allowNameIconChange,
          allowJoinByLink: linkJoinEnabled,
          allowAnonymousView: anonymousViewing,
          requireFaceVerification: livenessDetection,
          uploadPermission: uploadPermission,
          upload_permission: uploadPermission,
        }
      };

      const result = await dispatch(updateGroup({ groupId, payload }));
      
      if (updateGroup.fulfilled.match(result)) {
        toast({ title: 'Settings Saved', description: 'Privacy settings have been updated successfully.' });
      } else {
        toast({ title: 'Error', description: result.payload as string || 'Failed to save settings', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleCards = [
    {
      icon: <Edit3 className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50',
      title: 'Anyone can change Name and Icon',
      desc: 'Allow all members to edit group name and icon',
      value: allowNameIconChange,
      onChange: setAllowNameIconChange,
    },
    {
      icon: <UserPlus className="w-5 h-5 text-green-600" />,
      bg: 'bg-green-50',
      title: 'Anyone with link can join',
      desc: 'Users with the group link can join without invitation',
      value: linkJoinEnabled,
      onChange: setLinkJoinEnabled,
    },
    {
      icon: <EyeOff className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50',
      title: 'Anonymous Viewing',
      desc: 'Users can join and view group photos without Login',
      value: anonymousViewing,
      onChange: setAnonymousViewing,
    },
    {
      icon: <ScanFace className="w-5 h-5 text-primary" />,
      bg: 'bg-orange-50',
      title: 'Liveness Detection',
      desc: 'Verify real users with facial liveness detection',
      value: livenessDetection,
      onChange: setLivenessDetection,
    },
  ];

  const folderCards = [
    {
      icon: <FolderX className="w-5 h-5 text-slate-600" />,
      bg: 'bg-slate-50',
      title: "Hide 'Deleted' folder",
      desc: 'Hide deleted photos folder from members',
      value: false, // Legacy
      onChange: () => {},
    },
    {
      icon: <UploadCloud className="w-5 h-5 text-cyan-600" />,
      bg: 'bg-cyan-50',
      title: "'User Uploads' folder",
      desc: 'Create separate folder for user uploads',
      value: false, // Legacy
      onChange: () => {},
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-7">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-bold">Privacy Settings</h2>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Configure access controls and permissions</p>
        </div>
        <button
          onClick={handleSavePrivacySettings}
          disabled={saving}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Group Access & Joining */}
      <div className="mb-7">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Group Access & Joining
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {toggleCards.map((card, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 transition-all bg-card">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0`}>
                {card.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{card.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{card.desc}</p>
              </div>
              <Switch checked={card.value} onCheckedChange={card.onChange} />
            </div>
          ))}
        </div>
      </div>

      {/* Photo Access - This section is currently informational or managed via privacy object */}
      <div className="mb-7 opacity-50 pointer-events-none">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Photo Access (Read Only)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { value: 'personal', icon: <Lock className="w-6 h-6" />, label: 'Small Personal Group', desc: 'Private access for selected members only', color: 'text-primary' },
            { value: 'public', icon: <Globe className="w-6 h-6" />, label: 'Big Public Group', desc: 'Open access for everyone to view photos', color: 'text-blue-600' },
          ].map((option) => (
            <div
              key={option.value}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                (currentGroup?.type === 'private' && option.value === 'personal') || (currentGroup?.type === 'public' && option.value === 'public')
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border bg-card'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center ${
                ((currentGroup?.type === 'private' && option.value === 'personal') || (currentGroup?.type === 'public' && option.value === 'public')) ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {option.icon}
              </div>
              <h4 className="font-semibold text-sm mb-1">{option.label}</h4>
              <p className="text-xs text-muted-foreground">{option.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Permission */}
      <div className="mb-7">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
          <UploadCloud className="w-4 h-4" />
          Upload Permission
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { value: 'specific', icon: <Users2 className="w-6 h-6" />, label: 'Select Users', desc: 'Only selected users can upload photos' },
            { value: 'all', icon: <Users2 className="w-6 h-6" />, label: 'All Participants', desc: 'Every member can upload photos' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setUploadPermission(option.value as any)}
              className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                uploadPermission === option.value
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              {uploadPermission === option.value && (
                <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-primary" />
              )}
              <div className={`w-12 h-12 rounded-xl mb-3 flex items-center justify-center ${
                uploadPermission === option.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                {option.icon}
              </div>
              <h4 className="font-semibold text-sm mb-1">{option.label}</h4>
              <p className="text-xs text-muted-foreground">{option.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Participant Upload Assignment — shown when "Select Users" is active */}
      {uploadPermission === 'specific' && (
        <div className="mb-7">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Users2 className="w-4 h-4" />
            Assign Upload Permission
          </h3>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={participantSearch}
              onChange={(e) => setParticipantSearch(e.target.value)}
              placeholder="Search participants..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>

          {participantsLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading participants...</span>
            </div>
          ) : participants.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">No participants found</div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {participants
                .filter((p) => {
                  const name = `${p.firstName} ${p.lastName}`.toLowerCase();
                  return name.includes(participantSearch.toLowerCase()) ||
                    p.email.toLowerCase().includes(participantSearch.toLowerCase());
                })
                .map((participant) => {
                  const fullName = `${participant.firstName} ${participant.lastName}`;
                  const initials = `${participant.firstName.charAt(0)}${participant.lastName.charAt(0)}`.toUpperCase();
                  const canUpload = !!participant.canUpload;
                  const isUpdating = updatingId === participant.id;

                  return (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all"
                    >
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {participant.avatar ? (
                          <img
                            src={participant.avatar.startsWith('http') ? participant.avatar : `https://fabphotopic.fableadtech.in/services/public/images/avatars/${participant.avatar}`}
                            alt={fullName}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-primary font-bold text-xs">{initials}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{participant.email}</p>
                      </div>

                      {/* Toggle */}
                      <div className="flex items-center gap-2 shrink-0">
                        {canUpload && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            Can Upload
                          </span>
                        )}
                        {isUpdating ? (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : (
                          <Switch
                            checked={canUpload}
                            onCheckedChange={() => handleToggleUpload(participant.id, canUpload)}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Folder Settings */}
      
    </div>
  );
}
