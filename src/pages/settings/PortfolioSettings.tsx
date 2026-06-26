import { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Globe,
  FileText,
  Camera,
  Heart,
  Video,
  BookOpen,
  User,
  Phone,
  ChevronDown,
  Settings2,
  Save,
  Sparkles,
  X,
  RefreshCw,
  Check,
  Plus,
  Image as ImageIcon,
  Pencil,
  Trash2,
  Link,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  fetchPortfolio,
  updatePortfolio,
  uploadPortfolioPhotos,
  addPortfolioService,
  updatePortfolioService,
  deletePortfolioService,
  type PortfolioService,
} from '@/store/slices/portfolioSlice';
import {
  selectUser,
  selectPortfolioSlug,
  selectPortfolioWebsiteUrl,
  selectPortfolioAbout,
  selectPortfolioCoverImage,
  selectPortfolioPhotos,
  selectPortfolioServices,
  selectPortfolioLoading,
  selectPortfolioUploadLoading,
  selectPortfolioServiceLoading,
  selectPortfolioError,
  selectPortfolioName,
  selectPortfolioPhone,
  selectPortfolioSocialLinks,
} from '@/store/selectors';

// ─── Constants ────────────────────────────────────────────────────────────────

const SERVICE_OPTIONS = [
  { id: 'wedding_photo',    label: 'Wedding Photography',         icon: <Camera   className="w-5 h-5 text-blue-500"    /> },
  { id: 'pre_wedding',      label: 'Pre-Wedding Shoot',           icon: <Heart    className="w-5 h-5 text-pink-500"    /> },
  { id: 'cinematic_video',  label: 'Cinematic Videography',       icon: <Video    className="w-5 h-5 text-purple-500"  /> },
  { id: 'traditional_video',label: 'Traditional Videography',     icon: <Camera   className="w-5 h-5 text-amber-500"   /> },
  { id: 'wedding_album',    label: 'Wedding Album',               icon: <BookOpen className="w-5 h-5 text-emerald-500" /> },
  { id: 'product_fashion',  label: 'Product/Fashion Photography', icon: <User     className="w-5 h-5 text-indigo-500"  /> },
];

const CURRENCY_OPTIONS = [
  { code: 'INR', symbol: '₹', flag: '🇮🇳', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', flag: '🇺🇸', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', label: 'Euro' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧', label: 'British Pound' },
  { code: 'AUD', symbol: 'A$', flag: '🇦🇺', label: 'Australian Dollar' },
];

const DEFAULT_CURRENCY = 'INR';

const getServiceIconUrl = (service: PortfolioService | any) =>
  service?.iconUrl || service?.icon_url || service?.icon || '';

// ─── Component ────────────────────────────────────────────────────────────────

export default function PortfolioSettings() {
  const dispatch = useAppDispatch();

  // ── Redux state ──────────────────────────────────────────────────────────
  const user            = useAppSelector(selectUser);
  const portfolioSlug   = useAppSelector(selectPortfolioSlug);
  const serverUrl       = useAppSelector(selectPortfolioWebsiteUrl);
  const serverAbout     = useAppSelector(selectPortfolioAbout);
  const serverCoverImage = useAppSelector(selectPortfolioCoverImage);
  const serverPhotos    = useAppSelector(selectPortfolioPhotos);
  const serverServices  = useAppSelector(selectPortfolioServices);
  const loading         = useAppSelector(selectPortfolioLoading);
  const uploadLoading   = useAppSelector(selectPortfolioUploadLoading);
  const serviceLoading  = useAppSelector(selectPortfolioServiceLoading);
  const apiError        = useAppSelector(selectPortfolioError);
  const serverName      = useAppSelector(selectPortfolioName);
  const serverPhone     = useAppSelector(selectPortfolioPhone);
  const serverSocialLinks = useAppSelector(selectPortfolioSocialLinks);

  // ── Local form state (mirrors server state, editable) ────────────────────
  const [websiteURL, setWebsiteURL] = useState('');
  const [about, setAbout]           = useState('');
  const [currency, setCurrency]     = useState(DEFAULT_CURRENCY);
  const [name, setName]             = useState('');
  const [phone, setPhone]           = useState('');
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);

  // Cover image: file to upload + preview URL
  const [coverImageFile, setCoverImageFile]       = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  // Local service map: service_type → { enabled, pricing }
  const [serviceMap, setServiceMap] = useState<
    Record<string, { enabled: boolean; pricing: string; id?: string | number; iconUrl?: string }>
  >(() =>
    Object.fromEntries(
      SERVICE_OPTIONS.map((o) => [o.id, { enabled: false, pricing: '', iconUrl: '' }])
    )
  );

  // Pending image files (not yet uploaded)
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  // Preview URLs for pending files
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);

  // ── Delete confirmation state ─────────────────────────────────────────────
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);

  // ── New Service Modal state ───────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSvcId, setEditingSvcId] = useState<string | number | null>(null);
  const [newSvc, setNewSvc] = useState({
    title: '',
    pricing: '',
    enabled: true,
    icon: null as File | null,
    iconPreview: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const svcIconRef  = useRef<HTMLInputElement>(null);

  // ── Fetch portfolio on mount ─────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchPortfolio());
  }, [dispatch]);

  // ── Sync server state → local form state ────────────────────────────────
  useEffect(() => {
    if (serverUrl)   setWebsiteURL(serverUrl);
    if (serverAbout) setAbout(serverAbout);
    // Only set preview from server if no local file is pending
    if (serverCoverImage && !coverImageFile) setCoverImagePreview(serverCoverImage);
    
    // Sync Name: Use serverName, fall back to user's name
    if (serverName) {
      setName(serverName);
    } else if (user) {
      setName(user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim());
    }

    // Sync Phone: Use serverPhone, fall back to user's phone
    if (serverPhone) {
      setPhone(serverPhone);
    } else if (user) {
      setPhone(user.phone || '');
    }

    // Sync Social Links: Use serverSocialLinks, fall back to user's business social links
    const s = serverSocialLinks?.length ? serverSocialLinks : user?.business?.socialLinks;
    if (Array.isArray(s)) {
      setSocialLinks(s.map((item: any) => ({ platform: item.platform || '', url: item.url || '' })));
    } else if (s && typeof s === 'object') {
      const linksList = Object.entries(s)
        .map(([platform, url]) => ({ platform, url: String(url) }))
        .filter(link => link.url);
      setSocialLinks(linksList);
    } else {
      setSocialLinks([]);
    }
  }, [serverUrl, serverAbout, serverCoverImage, serverName, serverPhone, serverSocialLinks, user]);

  useEffect(() => {
    if (serverServices.length > 0) {
      // Sync currency from the first service that has one
      const firstWithCurrency = serverServices.find((s) => s.currency && s.currency !== '₹');
      if (firstWithCurrency?.currency) {
        setCurrency(firstWithCurrency.currency);
      }

      setServiceMap((prev) => {
        const next = { ...prev };
        serverServices.forEach((svc) => {
          // Match server service to a SERVICE_OPTIONS entry by title
          const match = SERVICE_OPTIONS.find(
            (o) => o.label.toLowerCase() === svc.title.toLowerCase()
          );
          const key = match?.id ?? svc.title;
          next[key] = {
            enabled: svc.enabled,
            pricing: svc.pricing,
            id:      svc.id,
            iconUrl: getServiceIconUrl(svc),
          };
        });
        return next;
      });
    }
  }, [serverServices]);

  // ── Show API errors as toasts ────────────────────────────────────────────
  useEffect(() => {
    if (apiError) toast.error(apiError);
  }, [apiError]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFiles    = Array.from(files);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPendingFiles((prev)    => [...prev, ...newFiles]);
    setPendingPreviews((prev) => [...prev, ...newPreviews]);
    // Reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const handleRemovePending = (index: number) => {
    URL.revokeObjectURL(pendingPreviews[index]);
    setPendingFiles((prev)    => prev.filter((_, i) => i !== index));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleServiceToggle = (id: string, enabled: boolean) => {
    setServiceMap((prev) => ({ ...prev, [id]: { ...prev[id], enabled } }));
  };

  const handlePricingChange = (id: string, pricing: string) => {
    setServiceMap((prev) => ({ ...prev, [id]: { ...prev[id], pricing } }));
  };

  const handleOpenEditModal = (svc: PortfolioService) => {
    setEditingSvcId(svc.id || null);
    setNewSvc({
      title: svc.title,
      pricing: svc.pricing,
      enabled: svc.enabled,
      icon: null,
      iconPreview: getServiceIconUrl(svc),
    });
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingSvcId(null);
    setNewSvc({ title: '', pricing: '', enabled: true, icon: null, iconPreview: '' });
    setIsModalOpen(true);
  };

  const handleSaveService = async () => {
    if (!newSvc.title.trim()) {
      toast.error('Service title is required');
      return;
    }

    try {
      const payload: PortfolioService = {
        title:   newSvc.title,
        pricing: newSvc.pricing,
        enabled: newSvc.enabled,
        currency,
        icon:    newSvc.icon,
      };

      if (editingSvcId) {
        await dispatch(updatePortfolioService({ serviceId: editingSvcId, service: payload })).unwrap();
        toast.success('Service updated successfully');
      } else {
        await dispatch(addPortfolioService(payload)).unwrap();
        toast.success('Custom service added successfully');
      }
      await dispatch(fetchPortfolio());
      setIsModalOpen(false);
      setEditingSvcId(null);
      setNewSvc({ title: '', pricing: '', enabled: true, icon: null, iconPreview: '' });
    } catch (err: any) {
      toast.error(err || 'Failed to save service');
    }
  };

  const handleSvcIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewSvc(prev => ({
        ...prev,
        icon: file,
        iconPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleDeleteService = async (serviceId: string | number) => {
    setDeleteConfirmId(serviceId);
  };

  const confirmDeleteService = async () => {
    if (deleteConfirmId === null) return;
    try {
      await dispatch(deletePortfolioService(deleteConfirmId)).unwrap();
      await dispatch(fetchPortfolio());
      toast.success('Service deleted successfully');
    } catch (err: any) {
      toast.error(err || 'Failed to delete service');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  /**
   * Save handler — runs three independent API calls in parallel:
   *  1. PUT /api/v2/portfolio          → update website_url & about
   *  2. POST /api/v2/portfolio/photos  → upload pending images (if any)
   *  3. Per-service: POST or PUT depending on whether the service already has an id
   */
  const handleSave = async () => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const tasks: Promise<any>[] = [];

      // 1. Update portfolio info
      tasks.push(
        dispatch(
          updatePortfolio({
            website_url: websiteURL,
            about,
            cover_image: coverImageFile || undefined,
            name,
            phone,
            socialLinks: socialLinks.filter((l) => l.platform && l.url.trim()),
          })
        ).unwrap()
      );

      // 2. Upload pending photos
      if (pendingFiles.length > 0) {
        tasks.push(
          dispatch(uploadPortfolioPhotos(pendingFiles))
            .unwrap()
            .then(() => {
              // Clean up object URLs after successful upload
              pendingPreviews.forEach((url) => URL.revokeObjectURL(url));
              setPendingFiles([]);
              setPendingPreviews([]);
              // Re-fetch to get the authoritative server URLs into Redux state
              dispatch(fetchPortfolio());
            })
        );
      }

      // 3. Sync services
      SERVICE_OPTIONS.forEach((option) => {
        const local = serviceMap[option.id];
        // title sent to API should be the human-readable title
        const servicePayload: PortfolioService = {
          title:        option.label,   // e.g. "Wedding Photography"
          enabled:      local.enabled,
          pricing:      local.pricing,
          currency,
        };

        // Match by title (title in Redux holds the title after normalisation)
        const existingOnServer = serverServices.find(
          (s) => s.title.toLowerCase() === option.label.toLowerCase()
        );

        if (existingOnServer) {
          // Service exists → PUT /v2/portfolio/services/{serviceId}
          tasks.push(
            dispatch(
              updatePortfolioService({
                serviceId: existingOnServer.id!,
                service: { ...servicePayload, id: existingOnServer.id },
              })
            ).unwrap()
          );
        } else {
          // New service → POST /v2/portfolio/services
          tasks.push(
            dispatch(addPortfolioService(servicePayload)).unwrap()
          );
        }
      });

      await Promise.all(tasks);
      await dispatch(fetchPortfolio());
      toast.success('Portfolio settings saved successfully!');
    } catch {
      // Individual errors are already shown via the apiError effect
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const isSaving = loading || uploadLoading || serviceLoading;
  // Use slug from API if available, fall back to user.id for backward compat
  const portfolioUrl = portfolioSlug
    ? `${window.location.origin}/portfolio/${portfolioSlug}`
    : user?.id
    ? `${window.location.origin}/portfolio/${user.id}`
    : null;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!portfolioUrl) return;
    navigator.clipboard.writeText(portfolioUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-heading font-bold">Portfolio Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your professional online presence</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-[hsl(var(--fab-amber))] text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving
            ? <RefreshCw className="w-4 h-4 animate-spin" />
            : <Save className="w-4 h-4" />}
          Save Portfolio
        </button>
      </div>

      {/* Portfolio Public Link */}
      {portfolioUrl && (
        <div className="bg-gradient-to-r from-[hsl(var(--fab-amber))]/10 to-pink-500/10 border border-[hsl(var(--fab-amber))]/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--fab-amber))]/20 flex items-center justify-center shrink-0">
            <Link className="w-5 h-5 text-[hsl(var(--fab-amber))]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground mb-0.5">Your Public Portfolio Link</p>
            <p className="text-xs text-muted-foreground truncate">{portfolioUrl}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-medium hover:bg-muted transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <a
              href={portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--fab-amber))] text-white text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View
            </a>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading portfolio…
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-6 space-y-6">
            {/* General Info */}
            <div className="bg-card rounded-2xl border border-border/60 fab-shadow p-6 space-y-4">
              <h3 className="font-heading font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                General Information
              </h3>

              <div className="space-y-4">
                {/* Cover Image */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Cover Image
                  </label>
                  <div
                    onClick={() => coverImageInputRef.current?.click()}
                    className={`relative w-full h-40 rounded-xl border-2 border-dashed cursor-pointer overflow-hidden transition-all
                      ${coverImagePreview ? 'border-primary' : 'border-border hover:border-primary/60 bg-muted/30 hover:bg-muted/50'}`}
                  >
                    {coverImagePreview ? (
                      <>
                        <img
                          src={coverImagePreview}
                          alt="Cover"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white text-sm font-medium flex items-center gap-1.5">
                            <Upload className="w-4 h-4" /> Change Cover
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoverImageFile(null);
                            setCoverImagePreview(null);
                          }}
                          className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                        <Upload className="w-7 h-7" />
                        <p className="text-sm font-medium">Click to upload cover image</p>
                        <p className="text-xs">JPG, PNG, WEBP — shown at top of your portfolio</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setCoverImageFile(file);
                      setCoverImagePreview(URL.createObjectURL(file));
                      e.target.value = '';
                    }}
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your Phone Number"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Website URL */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Website URL
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={websiteURL}
                      onChange={(e) => setWebsiteURL(e.target.value)}
                      placeholder="www.example.com/portfolio"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* About */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    About
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-muted-foreground">
                      <FileText className="w-4 h-4" />
                    </div>
                    <textarea
                      rows={4}
                      value={about}
                      onChange={(e) => setAbout(e.target.value)}
                      placeholder="Tell clients about yourself…"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                </div>

                {/* Social Links (Array Store Multiple) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      Social Links
                    </label>
                    <button
                      type="button"
                      onClick={() => setSocialLinks(prev => [...prev, { platform: 'instagram', url: '' }])}
                      className="flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--fab-amber))] hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Social Link
                    </button>
                  </div>

                  {socialLinks.length === 0 ? (
                    <p className="text-xs text-muted-foreground bg-muted/20 border border-dashed border-border rounded-xl p-4 text-center">
                      No social links added yet. Click "Add Social Link" to add your first profile.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {socialLinks.map((link, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <select
                            value={link.platform}
                            onChange={(e) => {
                              const newLinks = [...socialLinks];
                              newLinks[idx].platform = e.target.value;
                              setSocialLinks(newLinks);
                            }}
                            className="px-3 py-2 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 w-32 h-10"
                          >
                            <option value="instagram">Instagram</option>
                            <option value="facebook">Facebook</option>
                            <option value="twitter">X (Twitter)</option>
                            <option value="youtube">YouTube</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="vimeo">Vimeo</option>
                          </select>
                          <input
                            type="text"
                            value={link.url}
                            onChange={(e) => {
                              const newLinks = [...socialLinks];
                              newLinks[idx].url = e.target.value;
                              setSocialLinks(newLinks);
                            }}
                            placeholder={
                              link.platform === 'whatsapp'
                                ? 'e.g. +919876543210'
                                : `e.g. instagram.com/username`
                            }
                            className="flex-1 px-4 py-2 h-10 rounded-xl border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                          <button
                            type="button"
                            onClick={() => setSocialLinks(prev => prev.filter((_, i) => i !== idx))}
                            className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors h-10 w-10 flex items-center justify-center shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Portfolio Images */}
            <div className="bg-card rounded-2xl border border-border/60 fab-shadow p-6 space-y-4">
              <h3 className="font-heading font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                Portfolio Images
              </h3>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                />
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {uploadLoading
                    ? <RefreshCw className="w-6 h-6 animate-spin" />
                    : <Upload className="w-6 h-6" />}
                </div>
                <p className="text-sm font-medium">
                  {uploadLoading ? 'Uploading…' : 'Upload portfolio images'}
                </p>
                <p className="text-xs text-muted-foreground text-center">
                  Drag and drop or click to browse high-resolution showcase photos
                </p>
              </div>

              {/* Already-uploaded images (from server) */}
              {serverPhotos.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Uploaded</p>
                  <div className="grid grid-cols-4 gap-3">
                    {serverPhotos.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                        <img src={url} alt={`portfolio-${i}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending (not yet saved) images */}
              {pendingPreviews.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Pending upload ({pendingPreviews.length})
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    {pendingPreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={src} alt={`pending-${i}`} className="w-full h-full object-cover" />
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemovePending(i); }}
                          className="absolute top-1 right-1 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-card rounded-2xl border border-border/60 fab-shadow p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                  Display Your Services
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[hsl(var(--fab-amber))] bg-[hsl(var(--fab-amber))]/10 text-[hsl(var(--fab-amber))] text-xs font-bold hover:bg-[hsl(var(--fab-amber))]/20 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Service
                  </button>
                  
                  {/* Currency Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-bold hover:bg-muted transition-colors uppercase">
                        {CURRENCY_OPTIONS.find((c) => c.code === currency)?.flag || '🇮🇳'}{' '}
                        {currency} <ChevronDown className="w-3 h-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {CURRENCY_OPTIONS.map((curr) => (
                        <DropdownMenuItem
                          key={curr.code}
                          onClick={() => setCurrency(curr.code)}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-base">{curr.flag}</span>
                            <span className="text-xs font-medium">{curr.code}</span>
                            <span className="text-xs text-muted-foreground">({curr.symbol})</span>
                          </span>
                          {currency === curr.code && <Check className="w-3.5 h-3.5 text-primary" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-4">
                {/* 1. Predefined Services */}
                {SERVICE_OPTIONS.map((option) => {
                  const svc = serviceMap[option.id];
                  return (
                    <div key={option.id} className="group/service">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover/service:scale-110 transition-transform">
                            {svc.iconUrl ? (
                              <img src={getServiceIconUrl(svc)} alt={option.label} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              option.icon
                            )}
                          </div>
                          <span className="text-sm font-bold text-foreground/80">{option.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              const existing = serverServices.find(s => s.title.toLowerCase() === option.label.toLowerCase());
                              handleOpenEditModal({
                                id: existing?.id,
                                title: option.label,
                              pricing: svc.pricing,
                              enabled: svc.enabled,
                              currency: currency,
                              iconUrl: existing?.iconUrl || svc.iconUrl
                              });
                            }}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <Switch
                            checked={svc.enabled}
                            onCheckedChange={(val) => handleServiceToggle(option.id, val)}
                          />
                        </div>
                      </div>
                      <div
                        className={`transition-all duration-300 ${
                          svc.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'
                        }`}
                      >
                        <input
                          type="text"
                          placeholder="Pricing (Optional)"
                          value={svc.pricing}
                          onChange={(e) => handlePricingChange(option.id, e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  );
                })}

                {/* 2. Custom Services */}
                {serverServices.filter(s => !SERVICE_OPTIONS.some(o => o.label.toLowerCase() === s.title.toLowerCase())).map((svc) => (
                  <div key={svc.id} className="group/service border-t border-border/50 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden group-hover/service:scale-110 transition-transform">
                          {getServiceIconUrl(svc) ? (
                            <img src={getServiceIconUrl(svc)} alt={svc.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-sm font-bold text-foreground/80">{svc.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleOpenEditModal(svc)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteService(svc.id!)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <Switch
                          checked={svc.enabled}
                          onCheckedChange={(val) => {
                            dispatch(updatePortfolioService({ 
                              serviceId: svc.id!, 
                              service: { ...svc, enabled: val } 
                            }));
                          }}
                        />
                      </div>
                    </div>
                    <div
                      className={`transition-all duration-300 ${
                        svc.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'
                      }`}
                    >
                      <input
                        type="text"
                        placeholder="Pricing (Optional)"
                        defaultValue={svc.pricing}
                        onBlur={(e) => {
                          if (e.target.value !== svc.pricing) {
                            dispatch(updatePortfolioService({ 
                              serviceId: svc.id!, 
                              service: { ...svc, pricing: e.target.value } 
                            }));
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-900">Pro Tip</p>
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                      Listing clear pricing for your services increases conversion rates by up to 40%.
                      You can also add custom packages in the 'Edit' section.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────────────────── */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              Delete Service?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete this service? This action cannot be undone.
          </p>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <button
              onClick={confirmDeleteService}
              disabled={serviceLoading}
              className="w-full py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {serviceLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              Delete
            </button>
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="w-full py-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Service Modal ──────────────────────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">
              {editingSvcId ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Icon Upload */}
            <div className="flex flex-col items-center gap-3">
              <div 
                onClick={() => svcIconRef.current?.click()}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 overflow-hidden bg-muted/30"
              >
                {newSvc.iconPreview ? (
                  <img src={newSvc.iconPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <input 
                type="file" 
                ref={svcIconRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleSvcIconSelect} 
              />
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                {editingSvcId ? 'Change Icon' : 'Service Icon'}
              </p>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Service Title</label>
              <input
                type="text"
                value={newSvc.title}
                onChange={(e) => setNewSvc(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Birthday Photography"
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Pricing */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Pricing (Optional)</label>
              <input
                type="text"
                value={newSvc.pricing}
                onChange={(e) => setNewSvc(prev => ({ ...prev, pricing: e.target.value }))}
                placeholder="Starting from ₹5000"
                className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20">
              <span className="text-sm font-medium">Active on Portfolio</span>
              <Switch
                checked={newSvc.enabled}
                onCheckedChange={(val) => setNewSvc(prev => ({ ...prev, enabled: val }))}
              />
            </div>
          </div>

          <DialogFooter>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveService}
              disabled={serviceLoading}
              className="px-6 py-2 rounded-xl bg-[hsl(var(--fab-amber))] text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {serviceLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {editingSvcId ? 'Save Changes' : 'Create Service'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
