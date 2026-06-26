import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Share2,
  Heart,
  HeartOff,
  Calendar,
  Image,
  Star,
  CheckSquare,
  Square,
  Trash2,
  X,
  Upload,
  Link,
  QrCode,
  Copy,
  CheckCheck,
  Users,
  FolderOpen,
  Folder,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Video,
  ZoomIn,
  ZoomOut,
  Settings,
  DollarSign,
  ShoppingCart,
  Lock,
  ExternalLink,
  Globe,
  Mail,
  MessageSquare,
  MessageCircle,
  Loader2,
  BookOpen,
  UserCircle,
  Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import PhotoUpload from "@/components/PhotoUpload";
import ShareAlbumPopup from "@/components/popups/ShareAlbumPopup";
import QRCodePopup from "@/components/popups/QRCodePopup";
import PhotoLightbox from "@/components/PhotoLightbox";
import VideoLightbox from "@/components/VideoLightbox";
import FlipbookViewer from "@/components/group-settings/FlipbookViewer";
import ProfilePhotoModal from "@/components/modals/ProfilePhotoModal";
import { useAuth } from "@/contexts/AuthContext";
import { mockGroups } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";
import fableadLogo from "@/assets/iamges/fabstudio_logo.png";
import placeholderImage from "/placeholder.svg";
import { useReduxPhotos } from "@/hooks/useReduxPhotos";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectApiMode,
  selectCurrentGroup,
  selectCurrentGroupLoading,
  selectUser,
  selectGroupsError,
} from "@/store/selectors";
import {
  fetchGroupById,
  setCurrentGroup,
  fetchGroupQR,
  matchMyPhotos,
  fetchMyPhotos,
} from "@/store/slices/groupsSlice";
import { useWatermark } from "@/contexts/WatermarkContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  toggleSelectPhoto,
  selectAllPhotos,
  clearSelection,
  fetchFolders,
  fetchPhotos,
  toggleSelection,
  matchFacesForPhoto,
} from "@/store/slices/photosSlice";
import { fetchVideos } from "@/store/slices/videosSlice";
import api from "@/services/api";
import SEOHead from "@/components/SEOHead";

type TabType = "all" | "highlights" | "liked" | "date" | "flipbook" | string;
type ViewMode = "grid" | "folder";

export default function PhotoGallery() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const reduxUser = useAppSelector(selectUser);
  const user = reduxUser || authUser;

  // Permission check using the resolved user (Redux-first) so it works before AuthContext syncs
  const ROLE_PERMISSIONS: Record<string, string[]> = {
    admin: [
      "create_group",
      "delete_group",
      "upload_photos",
      "delete_photos",
      "manage_team",
      "view_analytics",
      "manage_branding",
      "manage_watermark",
      "manage_portfolio",
      "manage_wallet",
      "view_transactions",
      "manage_settings",
      "select_photos",
      "transfer_photos",
      "download_photos",
      "favorite_photos",
    ],
    photographer: [
      "create_group",
      "delete_group",
      "upload_photos",
      "delete_photos",
      "manage_team",
      "view_analytics",
      "manage_branding",
      "manage_watermark",
      "manage_portfolio",
      "manage_wallet",
      "view_transactions",
      "manage_settings",
      "select_photos",
      "transfer_photos",
      "download_photos",
      "favorite_photos",
    ],
    user: [
      "create_group",
      "download_photos",
      "favorite_photos",
      "select_photos",
    ],
  };
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
  };

  const dispatch = useAppDispatch();
  const apiMode = useAppSelector(selectApiMode);
  const reduxCurrentGroup = useAppSelector(selectCurrentGroup);
  const folders = useAppSelector((state) => state.photos.folders);
  const currentPage = useAppSelector((state) => state.photos.page);
  const hasMorePhotos = useAppSelector((state) => state.photos.hasMore);
  const totalPages = useAppSelector((state) => state.photos.totalPages);
  const qrLink = useAppSelector((state) => state.groups.qrLink);
  const groupsError = useAppSelector(selectGroupsError);
  const myPhotos = useAppSelector((state) => state.groups.myPhotos);
  const myPhotosLoading = useAppSelector(
    (state) => state.groups.myPhotosLoading || state.groups.matchMyPhotosLoading,
  );
  const currentGroupLoading = useAppSelector(
    (state) => state.groups.currentGroupLoading,
  );

  // Videos state
  const videos = useAppSelector((state) => state.videos.videos);
  const videosLoading = useAppSelector((state) => state.videos.loading);

  // Redux photos hook
  const {
    photos: reduxPhotos,
    loading: photosLoading,
    favoritedPhotos: reduxFavoritedPhotos,
    handleToggleLike,
    handleDeletePhotos,
    handleUploadPhotos,
    handleDownloadPhoto,
    handleDownloadPhotos,
    downloadingPhotoId,
    bulkDownloadLoading,
    deleteLoading,
    deletingPhotoIds,
    error: photosError,
  } = useReduxPhotos(groupId);

  // Group: API mode mein Redux se, mock mode mein mock data se
  // In live mode, do NOT fall back to mock data — use null while loading
  // to avoid showing wrong owner/permissions before real data arrives.
  const group =
    apiMode === "live"
      ? reduxCurrentGroup
      : mockGroups.find((g) => g.id === groupId) || mockGroups[0];

  // Safe group for rendering — only used for non-permission UI (name, cover, etc.)
  // Never use this for permission checks like isGroupOwner
  const safeGroup =
    group ||
    ({
      name: "",
      coverImage: "",
      photoCount: 0,
      monetization: {},
      viewDownload: {},
      sortBy: "newest",
    } as any);

  // Resolve branding: owner.owner contains the actual business fields from API
  const owner = (group as any)?.owner;
  const ownerDetails = owner?.owner || owner; // API returns nested owner.owner with business fields
  const resolvedBranding = {
    show: (group as any)?.branding?.show ?? false,
    name: ownerDetails?.businessName || (group as any)?.branding?.name || "",
    logo: ownerDetails?.logo || (group as any)?.branding?.logo || "",
    website:
      ownerDetails?.businessWebsite || (group as any)?.branding?.website || "",
    email: ownerDetails?.businessEmail || (group as any)?.branding?.email || "",
    phone:
      ownerDetails?.whatsappNumber ||
      ownerDetails?.businessPhone ||
      (group as any)?.branding?.phone ||
      "",
    socialLinks:
      (group as any)?.branding?.socialLinks || ownerDetails?.socialLinks || [],
  };

  // Check if current user is the group owner or a team member
  const isTeamMember = (group as any)?.team_members?.some(
    (member: any) =>
      Boolean(user?.id) && String(member.user_id) === String(user?.id),
  );

  const isGroupAdmin = (group as any)?.participants?.some(
    (p: any) =>
      Boolean(user?.id) &&
      String(p.id) === String(user?.id) &&
      p.role?.toLowerCase() === "admin",
  );

  // Also check the groups list as a fallback while currentGroup is still loading
  const groupsListEntry = useAppSelector((state) =>
    state.groups.groups.find((g) => String(g.id) === String(groupId)),
  );

  const isGroupOwner =
    Boolean(user?.id) &&
    (String(user?.id) === String((group as any)?.ownerId) ||
      String(user?.id) === String((group as any)?.owner_id) ||
      String(user?.id) === String((group as any)?.createdBy) ||
      String(user?.id) === String((group as any)?.created_by) ||
      String(user?.id) === String((group as any)?.owner?.id) ||
      // Fallback: check groups list entry (available immediately after create/fetch)
      String(user?.id) === String((groupsListEntry as any)?.ownerId) ||
      String(user?.id) === String((groupsListEntry as any)?.owner_id) ||
      String(user?.id) === String((groupsListEntry as any)?.createdBy) ||
      String(user?.id) === String((groupsListEntry as any)?.created_by) ||
      String(user?.id) === String((groupsListEntry as any)?.owner?.id) ||
      isTeamMember ||
      isGroupAdmin ||
      // If group is still loading and user is a photographer, optimistically grant owner access
      // This prevents the toolbar from flickering on first navigation after group creation
      ((currentGroupLoading || !group || group.photoCount === 0) &&
        (user?.role === "photographer" || user?.role === "admin")));

  // Members can access settings if they are the owner/team/admin OR if allowMemberEdit is true
  const allowMemberEdit = (group as any)?.privacy?.allowMemberEdit ?? true;
  const canAccessSettings = isGroupOwner || allowMemberEdit;

  const isBlocked = !!(
    photosError?.toLowerCase().includes("blocked") ||
    groupsError?.toLowerCase().includes("blocked")
  );

  const [localPhotos, setLocalPhotos] = useState<any[]>(
    reduxPhotos.length > 0 ? reduxPhotos : [],
  );

  useEffect(() => {
    if (isBlocked) return;
    if (apiMode === "live" && groupId) {
      dispatch(fetchGroupById(groupId));
      dispatch(fetchFolders(groupId));
      // Note: matchMyPhotos and fetchMyPhotos are called AFTER photos are indexed
      // in the indexAndRefresh effect below — calling them here would return 0 matches
    } else if (groupId) {
      const found = mockGroups.find((g) => g.id === groupId) || mockGroups[0];
      dispatch(setCurrentGroup(found as any));
    }
  }, [dispatch, groupId, apiMode]);

  const isPrivateGroupForGuest = group?.type === "private" && !isGroupOwner;

  const [activeTab, setActiveTab] = useState<TabType>("all");

  const isPhotosContentLoading =
    photosLoading || (activeTab === "my-photos" && myPhotosLoading);

  useEffect(() => {
    if (isPrivateGroupForGuest && activeTab !== "my-photos" && activeTab !== "liked" && activeTab !== "videos") {
      setActiveTab("my-photos");
    }
  }, [isPrivateGroupForGuest, activeTab]);
  // likedPhotos: Redux se sync karo
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(
    new Set(reduxFavoritedPhotos),
  );
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showFlipbook, setShowFlipbook] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);

  const [isSlideshow, setIsSlideshow] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const {
    setWatermarkEnabled,
    setWatermarkImage,
    setWatermarkText,
    setWatermarkType,
    setWatermarkPosition,
    setWatermarkOpacity,
    setWatermarkScale,
    setIsTiled,
    watermarkEnabled,
  } = useWatermark();

  // Fetch watermark settings if group watermark is enabled
  useEffect(() => {
    const fetchWatermarkSettings = async () => {
      if (!group?.enableWatermark) {
        // Backend flag is off — disable watermark in context and stop here.
        setWatermarkEnabled(false);
        return;
      }

      // Backend flag is on. Always mark as enabled first so the overlay shows
      // even if the settings fetch fails.
      setWatermarkEnabled(true);

      // If group already has watermark settings, use them directly
      if (group?.watermark) {
        const settings = group.watermark;
        setWatermarkType(
          settings.type === "text" || settings.watermark_text
            ? "text"
            : "image",
        );
        setWatermarkImage(
          settings.image_url || settings.watermark_image || null,
        );
        setWatermarkText(settings.watermark_text || "© PhotoFab Studio");
        setWatermarkPosition((settings.position || "bottom-right") as any);
        setWatermarkOpacity(Number(settings.opacity) || 100);
        setWatermarkScale(Number(settings.scale) || 20);
        setIsTiled(!!settings.tiled);
        return;
      }

      if (apiMode !== "live") return; // mock mode: flag is enough, no settings to fetch

      try {
        const { data } = await api.get("/watermark/settings");
        const settings = data.settings || data.data || data;

        if (settings) {
          setWatermarkType(
            settings.watermark_type === "text" || settings.type === "text"
              ? "text"
              : "image",
          );
          setWatermarkImage(
            settings.watermark_image ||
            settings.image ||
            settings.image_url ||
            null,
          );
          setWatermarkText(
            settings.watermark_text || settings.text || "© PhotoFab Studio",
          );
          setWatermarkPosition((settings.position || "bottom-right") as any);
          setWatermarkOpacity(Number(settings.opacity) || 50);
          setWatermarkScale(Number(settings.scale) || 20);
          setIsTiled(!!(settings.is_tiled || settings.isTiled));
        }
      } catch (err) {
        console.error("Failed to fetch watermark settings", err);
        // Watermark is still enabled (flag is on); we just keep the cached style settings.
      }
    };

    fetchWatermarkSettings();
  }, [group?.enableWatermark, apiMode]);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [purchasingPhoto, setPurchasingPhoto] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Guard: ensure matchMyPhotos is dispatched only once per groupId, not on
  // every render caused by reduxPhotos.length changing.
  const matchMyPhotosCalledForGroup = useRef<string | null>(null);
  const joinCode = (group as any)?.joinCode || (group as any)?.join_code || null;
  const rawInviteLink = (group as any)?.inviteLink || (group as any)?.invite_link || '';
  const shareLink =
    joinCode
      ? `${window.location.origin}/join/${encodeURIComponent(String(joinCode))}`
      : (rawInviteLink.includes('/join/') ? rawInviteLink : rawInviteLink || `${window.location.origin}/join/${groupId}`);

  // Redux photos change hone pe localPhotos sync karo
  useEffect(() => {
    setLocalPhotos(reduxPhotos);
  }, [reduxPhotos]);

  // When photos first load for a group in live mode, trigger face cluster match
  // exactly ONCE per groupId mount. Using a ref guard prevents re-triggering
  // every time reduxPhotos.length changes (which was causing the infinite loop:
  // fetchPhotos → matchMyPhotos → group state update → groupSortBy change → fetchPhotos…)
  useEffect(() => {
    if (apiMode !== "live" || reduxPhotos.length === 0 || !groupId) return;
    // Already called for this groupId — skip
    if (matchMyPhotosCalledForGroup.current === groupId) return;
    matchMyPhotosCalledForGroup.current = groupId;
    dispatch(matchMyPhotos(groupId));
  }, [reduxPhotos.length, apiMode, groupId, dispatch]);

  // Redux favoritedPhotos change hone pe sync karo
  useEffect(() => {
    setLikedPhotos(new Set(reduxFavoritedPhotos));
  }, [reduxFavoritedPhotos]);

  // Check if monetization is enabled for this group
  const isMonetizationEnabled =
    (safeGroup.monetization as any)?.enabled ?? false;
  const pricePerPhoto = (safeGroup.monetization as any)?.pricePerPhoto ?? 50;
  const pricePerAlbum = (safeGroup.monetization as any)?.pricePerAlbum ?? 2000;
  const currency = (safeGroup.monetization as any)?.currency ?? "₹";

  // View & Download Settings
  const viewDownload = safeGroup.viewDownload;
  const allowDownloading = viewDownload?.allowDownloading ?? true;
  const bulkDownloads = viewDownload?.bulkDownloads ?? true;
  const enableScreenshots = viewDownload?.enableScreenshots ?? true;

  const isBypassUser = isGroupOwner; // isGroupOwner already includes owner, team, and admin checks

  // Group photos by date
  const photosByDate = localPhotos.reduce(
    (acc, photo) => {
      const date = photo.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(photo);
      return acc;
    },
    {} as Record<string, typeof localPhotos>,
  );

  const sortedDates = Object.keys(photosByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  const filteredPhotos = (() => {
    const allowedPhotosPool = isPrivateGroupForGuest ? myPhotos : localPhotos;

    const base =
      activeTab === "my-photos"
        ? myPhotos
        : allowedPhotosPool.filter((p) => {
          if (selectedFolder) {
            return apiMode === "live"
              ? true
              : String(p.folderId) === String(selectedFolder) ||
              p.date === selectedFolder;
          }

          if (activeTab === "all") return true;
          if (activeTab === "highlights")
            return !!(p.isSelectedByClient || p.is_selected_by_client);
          if (activeTab === "liked")
            return !!(p.liked || likedPhotos.has(p.id));
          if (activeTab.startsWith("date-")) {
            const targetDate = activeTab.replace("date-", "");
            return p.date === targetDate;
          }

          // Default for any other specific tab (like folders or videos handling elsewhere)
          return false;
        });

    // Apply sort order based on group.sortBy setting
    const sortBy = (group as any)?.sortBy || "newest";
    return [...base].sort((a, b) => {
      if (sortBy === "name") {
        const nameA = (a.url || a.id || "").toString().toLowerCase();
        const nameB = (b.url || b.id || "").toString().toLowerCase();
        return nameA.localeCompare(nameB);
      }
      const dateA = new Date(a.created_at || a.date || 0).getTime();
      const dateB = new Date(b.created_at || b.date || 0).getTime();
      return sortBy === "oldest" ? dateA - dateB : dateB - dateA; // newest = desc, oldest = asc
    });
  })();

  const toggleLike = (id: string) => {
    // Redux ke through like/unlike karo
    handleToggleLike(id);
    // Local state bhi update karo (optimistic)
    setLikedPhotos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectionAction = (id: string) => {
    dispatch(toggleSelection(id));
  };

  const toggleSelect = (id: string) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedPhotos.size === filteredPhotos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(filteredPhotos.map((p) => p.id)));
    }
  };

  const handleNextPhoto = () => {
    const currentIndex = filteredPhotos.findIndex(
      (p) => p.id === selectedPhoto,
    );
    if (currentIndex < filteredPhotos.length - 1) {
      setSelectedPhoto(filteredPhotos[currentIndex + 1].id);
    }
  };

  const handlePrevPhoto = () => {
    const currentIndex = filteredPhotos.findIndex(
      (p) => p.id === selectedPhoto,
    );
    if (currentIndex > 0) {
      setSelectedPhoto(filteredPhotos[currentIndex - 1].id);
    }
  };

  const handlePrevVideo = () => {
    const currentIndex = videos.findIndex((v) => v.id === selectedVideo);
    if (currentIndex > 0) {
      setSelectedVideo(videos[currentIndex - 1].id);
    }
  };

  const handleNextVideo = () => {
    const currentIndex = videos.findIndex((v) => v.id === selectedVideo);
    if (currentIndex < videos.length - 1) {
      setSelectedVideo(videos[currentIndex + 1].id);
    }
  };

  // Slideshow functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isSlideshow && selectedPhoto) {
      interval = setInterval(() => {
        const currentIndex = filteredPhotos.findIndex(
          (p) => p.id === selectedPhoto,
        );
        if (currentIndex < filteredPhotos.length - 1) {
          setSelectedPhoto(filteredPhotos[currentIndex + 1].id);
        } else {
          // Loop back to first photo
          setSelectedPhoto(filteredPhotos[0].id);
        }
      }, 3000); // 5 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isSlideshow, selectedPhoto, filteredPhotos]);

  const toggleSlideshow = () => {
    setIsSlideshow(!isSlideshow);
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.25, 1);
      if (newZoom === 1) {
        setImagePosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleImageClick = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      // Start dragging
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      });
    } else {
      // Zoom in on click
      handleZoomIn();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedPhotos(new Set());
  };

  const handleDelete = async () => {
    if (!hasPermission("delete_photos") && !isTeamMember && !isGroupOwner) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to delete photos.",
        variant: "destructive",
      });
      return;
    }

    const photoIds = Array.from(selectedPhotos);
    if (photoIds.length === 0) return;

    if (apiMode === "live") {
      // Optimistically remove from local state
      setLocalPhotos((prev) => prev.filter((p) => !photoIds.includes(p.id)));
      await handleDeletePhotos(photoIds);
    } else {
      setLocalPhotos((prev) => prev.filter((p) => !photoIds.includes(p.id)));
      toast({
        title: "Deleted",
        description: `${photoIds.length} photo(s) deleted successfully.`,
      });
    }
    exitSelectionMode();
  };

  const handleDownload = () => {
    if (!hasPermission("download_photos") && !isTeamMember) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to download photos.",
        variant: "destructive",
      });
      return;
    }

    // If monetization is enabled and paid downloads are required
    // BUT only for regular guests, not for owners/team members
    if (
      isMonetizationEnabled &&
      (group.monetization as any)?.paidDownloads &&
      !isGroupOwner
    ) {
      setShowPurchaseDialog(true);
      return;
    }

    // Show confirmation dialog
    setShowDownloadConfirm(true);
  };

  const handlePurchasePhoto = (photoId: string) => {
    if (!isMonetizationEnabled) return;
    setPurchasingPhoto(photoId);
    setShowPurchaseDialog(true);
  };

  const handleAddToCart = (photoId: string) => {
    setCartItems((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const handleCheckout = () => {
    setShowPurchaseDialog(false);
    toast({
      title: "Purchase Successful!",
      description: `You have successfully purchased ${cartItems.size > 0 ? cartItems.size : "the"} photo(s).`,
    });
    setCartItems(new Set());
    setPurchasingPhoto(null);
  };

  const confirmDownload = async () => {
    setShowDownloadConfirm(false);

    if (apiMode === "live" && groupId) {
      if (selectedPhotos.size > 0) {
        // Download only selected photos
        await handleDownloadPhotos("specific", Array.from(selectedPhotos));
      } else {
        // Download all photos in the group
        await handleDownloadPhotos("all");
      }
    } else {
      // Mock mode fallback
      if (selectedPhotos.size > 0) {
        toast({
          title: "Downloading",
          description: `${selectedPhotos.size} selected photo(s) downloading...`,
        });
      } else {
        toast({
          title: "Downloading All",
          description: `${localPhotos.length} photo(s) and video(s) downloading...`,
        });
      }
    }
  };

  const handleFavorite = async () => {
    const photoIds = Array.from(selectedPhotos);
    if (photoIds.length === 0) return;

    if (apiMode === "live") {
      // Use Promise.all to favorite all photos
      try {
        await Promise.all(
          photoIds.map((id) => {
            // Only favorite if not already liked
            if (!likedPhotos.has(id)) {
              return handleToggleLike(id);
            }
            return Promise.resolve();
          }),
        );
        toast({
          title: "Success",
          description: `${photoIds.length} photo(s) updated in favorites.`,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to update some favorites.",
          variant: "destructive",
        });
      }
    } else {
      photoIds.forEach((id) => {
        setLikedPhotos((prev) => {
          const next = new Set(prev);
          next.add(id);
          return next;
        });
      });
      toast({
        title: "Favorited",
        description: `${photoIds.length} photo(s) added to favorites.`,
      });
    }
    exitSelectionMode();
  };

  const handleUnfavorite = async () => {
    const photoIds = Array.from(selectedPhotos);
    if (photoIds.length === 0) return;

    if (apiMode === "live") {
      try {
        await Promise.all(
          photoIds.map((id) => {
            if (likedPhotos.has(id)) {
              return handleToggleLike(id);
            }
            return Promise.resolve();
          }),
        );
        toast({
          title: "Success",
          description: `${photoIds.length} photo(s) removed from favorites.`,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to remove some favorites.",
          variant: "destructive",
        });
      }
    } else {
      photoIds.forEach((id) => {
        setLikedPhotos((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      });
      toast({
        title: "Removed",
        description: `${photoIds.length} photo(s) removed from favorites.`,
      });
    }
    exitSelectionMode();
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!hasPermission("delete_photos") && !isTeamMember && !isGroupOwner) {
      toast({
        title: "Permission Denied",
        description: "You do not have permission to delete photos.",
        variant: "destructive",
      });
      return;
    }
    // Optimistically remove from local state for instant UI feedback
    setLocalPhotos((prev) => prev.filter((p) => p.id !== photoId));
    // Call the real API via Redux thunk
    await handleDeletePhotos([photoId]);
  };

  const handleShare = () => {
    setShowShareDialog(true);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    toast({
      title: "Link Copied!",
      description: "Share link copied to clipboard.",
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatFolderName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Map group sortBy to API sort params (same logic as useReduxPhotos)
  const getGallerySortParams = (
    sortBy?: string,
  ): { sortBy?: string; sortOrder?: string } => {
    switch (sortBy) {
      case "newest":
        return { sortBy: "created_at", sortOrder: "desc" };
      case "oldest":
        return { sortBy: "created_at", sortOrder: "asc" };
      case "name":
        return { sortBy: "name", sortOrder: "asc" };
      default:
        return { sortBy: "created_at", sortOrder: "desc" };
    }
  };

  const handleUploadComplete = (newFiles: File[]) => {
    if (apiMode === "live" && groupId) {
      dispatch(fetchFolders(groupId));
      const sortParams = getGallerySortParams((group as any)?.sortBy);
      dispatch(fetchPhotos({ groupId, ...sortParams }));
    } else {
      const newPhotos = newFiles.map((file, index): any => ({
        id: `uploaded-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        thumbnail: URL.createObjectURL(file),
        date: new Date().toISOString().split("T")[0],
        liked: false,
        tags: [],
      }));
      setLocalPhotos((prev) => [...newPhotos, ...prev]);
    }
  };

  // Helper function to handle missing images
  const getImageUrl = (url: string | undefined | null): string => {
    if (!url || url.trim() === "") {
      return placeholderImage;
    }
    let processedUrl = url;
    if (processedUrl.includes("services/storage/")) {
      processedUrl = processedUrl.replace(
        "services/storage/",
        "services/public/storage/",
      );
    } else if (processedUrl.startsWith("storage/")) {
      processedUrl = `https://fabphotopic.fableadtech.in/services/public/${processedUrl}`;
    }

    // Use a STABLE cache key (group.updatedAt timestamp).
    // NEVER use Date.now() here — it changes on every render, breaking the
    // browser image cache and forcing a fresh network request for every photo
    // every time the component re-renders.
    const cacheKey = group?.updatedAt
      ? String(new Date(group.updatedAt).getTime())
      : "1";

    if (!group?.enableWatermark) {
      const separator = processedUrl.includes("?") ? "&" : "?";
      processedUrl += `${separator}no_watermark=1&v=${cacheKey}`;
    } else {
      const separator = processedUrl.includes("?") ? "&" : "?";
      processedUrl += `${separator}v=${cacheKey}`;
    }

    return processedUrl;
  };

  // Handle image error fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = placeholderImage;
  };

  // Check if cover image is missing
  const hasCoverImage =
    safeGroup.coverImage && safeGroup.coverImage.trim() !== "";

  const baseTabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "all", label: "All Photos", icon: <Image className="w-4 h-4" /> },
    // { key: 'highlights', label: 'Highlights', icon: <Star className="w-4 h-4" /> },
    { key: "liked", label: "Liked", icon: <Heart className="w-4 h-4" /> },
    {
      key: "my-photos",
      label: "My Photos",
      icon:
        (user as any)?.selfieUrl || (user as any)?.faceRegistered ? (
          <img
            src={(user as any)?.selfieUrl || (user as any)?.selfie_url}
            alt="me"
            className="w-5 h-5 rounded-full object-cover ring-1 ring-[hsl(var(--fab-amber))]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <UserCircle className="w-4 h-4" />
        ),
    },
    { key: "videos", label: "Videos", icon: <Video className="w-4 h-4" /> },
  ];

  const tabs = isPrivateGroupForGuest
    ? baseTabs.filter((t) => t.key === "my-photos" || t.key === "liked" || t.key === "videos")
    : baseTabs;

  if (!isPrivateGroupForGuest) {
    if (folders && folders.length > 0) {
      folders.forEach((f) => {
        tabs.push({
          key: `folder-${f.id}`,
          label: f.name,
          icon: <Folder className="w-4 h-4" />,
        });
      });
    }

    // Add dynamic date tabs
    sortedDates.forEach((date) => {
      tabs.push({
        key: `date-${date}`,
        label: formatDate(date),
        icon: <Calendar className="w-4 h-4" />,
      });
    });

    if ((group as any)?.flipbook?.enabled) {
      tabs.push({
        key: "flipbook",
        label: "Flipbook",
        icon: <BookOpen className="w-4 h-4 text-orange-500" />,
      });
    }
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-heading font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          {photosError || groupsError}
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-background flex flex-col ${!enableScreenshots && !isBypassUser ? "no-screenshots" : ""}`}
    >
      <SEOHead pageKey="/gallery" />
      <AppHeader />

      {/* Banner */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {currentGroupLoading ? (
          <Skeleton className="w-full h-full rounded-none" />
        ) : hasCoverImage ? (
          <img
            src={getImageUrl(safeGroup.coverImage)}
            alt={safeGroup.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[hsl(var(--fab-navy))] to-[hsl(var(--fab-amber))] flex items-center justify-center">
            <div className="text-center text-primary-foreground">
              <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">No Cover Image Available</p>
              <p className="text-sm opacity-75 mt-1">
                Upload a cover image in group settings
              </p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-6 left-6 md:left-8">
          <button
            onClick={() => navigate("/")}
            className="mb-3 text-primary-foreground/80 hover:text-primary-foreground flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {currentGroupLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-64 bg-primary-foreground/20" />
              <Skeleton className="h-5 w-32 bg-primary-foreground/20" />
            </div>
          ) : (
            <>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground">
                {safeGroup.name}
              </h1>
              <p className="text-primary-foreground/80 text-base mt-2">
                {safeGroup.photoCount} Photos
              </p>
            </>
          )}
        </div>
      </div>

      {/* Album Info & Actions - Sticky Header */}
      <div className="top-20 md:top-24 z-40 ">
        <div className="mx-auto">
          <div className="relative bg-white/90 md:bg-white/80 backdrop-blur-xl rounded-xl border border-white/60 shadow-lg shadow-black/5 overflow-hidden">
            {/* Mobile View: Full Branding followed by Action Bar */}
            <div className="md:hidden">
              {/* 1. Full Branding Section */}
              {resolvedBranding.show && (
                <div className="px-6 flex items-center justify-start gap-4 border-b border-border/40 bg-gradient-to-br from-white to-muted/10">
                  {/* Studio Info & Socials */}
                  <div className="flex flex-col gap-2 min-w-0 py-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1">
                        Album by
                      </span>
                      <h2 className="text-sm font-semibold text-foreground truncate leading-tight">
                        {resolvedBranding.name || "Fab-Photo Studio"}
                      </h2>
                    </div>
                    <div className="flex items-center gap-5">
                      {resolvedBranding.website && (
                        <a
                          href={resolvedBranding.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe className="w-4 h-4 text-muted-foreground active:text-primary" />
                        </a>
                      )}
                      {resolvedBranding.socialLinks?.find(
                        (l: any) => l.platform === "instagram",
                      )?.url && (
                          <a
                            href={
                              resolvedBranding.socialLinks.find(
                                (l: any) => l.platform === "instagram",
                              )!.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg
                              className="w-4 h-4 text-muted-foreground active:text-pink-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          </a>
                        )}
                      {resolvedBranding.socialLinks?.find(
                        (l: any) => l.platform === "facebook",
                      )?.url && (
                          <a
                            href={
                              resolvedBranding.socialLinks.find(
                                (l: any) => l.platform === "facebook",
                              )!.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg
                              className="w-4 h-4 text-muted-foreground active:text-blue-600"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-8.74h-2.94v-3.403h2.94v-2.511c0-2.91 1.777-4.496 4.375-4.496 1.244 0 2.315.093 2.626.134v3.044l-1.802.001c-1.412 0-1.686.671-1.686 1.656v2.172h3.369l-.438 3.403h-2.931v8.74h6.066c.732 0 1.325-.593 1.325-1.325v-21.351c0-.732-.593-1.325-1.325-1.325z" />
                            </svg>
                          </a>
                        )}
                      {resolvedBranding.phone && (
                        <a
                          href={`https://wa.me/${resolvedBranding.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageSquare className="w-4 h-4 text-muted-foreground active:text-green-600" />
                        </a>
                      )}
                      {resolvedBranding.email && (
                        <a href={`mailto:${resolvedBranding.email}`}>
                          <Mail className="w-4 h-4 text-muted-foreground active:text-blue-500" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex-1" />
                  <div
                    className="w-20 h-20 flex-shrink-0 bg-white cursor-pointer"
                    onClick={() => navigate("/settings/portfolio")}
                  >
                    {currentGroupLoading ? (
                      <Skeleton className="w-full h-full" />
                    ) : (
                      <img
                        src={getImageUrl(resolvedBranding.logo || fableadLogo)}
                        alt="Studio Logo"
                        className="w-full h-full object-contain"
                        onError={handleImageError}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* 2. Action Icons Bar */}
              <div
                className={`flex items-center ${resolvedBranding.show ? "justify-between" : "justify-center"} px-4 py-2.5 bg-white/50 backdrop-blur-sm`}
              >
                <div className="flex items-center gap-1">
                  {isGroupOwner && (
                    <div className="scale-90">
                      <PhotoUpload
                        groupName={safeGroup.name}
                        onUploadComplete={handleUploadComplete}
                      />
                    </div>
                  )}

                  {(bulkDownloads || isBypassUser) && (
                    <button
                      onClick={handleDownload}
                      className="relative p-2 rounded-xl text-muted-foreground"
                    >
                      <Download className="w-5 h-5" />
                      {selectedPhotos.size > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-0.5 bg-gradient-to-br from-[hsl(var(--fab-amber))] to-orange-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                          {selectedPhotos.size}
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    onClick={handleShare}
                    className="p-2 rounded-xl text-muted-foreground"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() =>
                      selectionMode
                        ? exitSelectionMode()
                        : setSelectionMode(true)
                    }
                    className={`p-2 rounded-xl transition-all ${selectionMode ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                  >
                    <CheckSquare className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => navigate(`/chat/${groupId}`)}
                    className="p-2 rounded-xl text-muted-foreground"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </button>

                  {canAccessSettings && (
                    <button
                      onClick={() => navigate(`/group-settings/${groupId}`)}
                      className="p-2 rounded-xl text-muted-foreground"
                    >
                      <Settings className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            {/* Desktop: Two-Column Layout (Branding on Left, Icons on Right) */}
            <div
              className={`hidden md:flex items-center ${resolvedBranding.show ? "justify-between" : "justify-center"} max-w-7xl mx-auto px-6 py-2`}
            >
              {/* Left - Album Info & Action Buttons */}
              <div
                className={`flex items-center gap-4 ${resolvedBranding.show ? "justify-start flex-1 pr-6" : "justify-center"}`}
              >
                <div className="flex items-center gap-2">
                  {isGroupOwner && (
                    <PhotoUpload
                      groupName={safeGroup.name}
                      onUploadComplete={handleUploadComplete}
                    />
                  )}

                  {/* Selection Mode Toggle */}
                  {(hasPermission("select_photos") || isTeamMember) && (
                    <button
                      onClick={() =>
                        selectionMode
                          ? exitSelectionMode()
                          : setSelectionMode(true)
                      }
                      className={`relative p-2.5 rounded-xl transition-all duration-300 group ${selectionMode
                        ? "bg-gradient-to-br from-[hsl(var(--fab-amber))] to-[hsl(var(--fab-navy))] text-white shadow-lg"
                        : "hover:bg-black/5"
                        }`}
                      title={selectionMode ? "Exit Selection" : "Select Photos"}
                    >
                      <CheckSquare
                        className={`w-5 h-5 ${selectionMode ? "text-white" : "text-muted-foreground group-hover:text-foreground"}`}
                      />
                      {selectionMode && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
                      )}
                    </button>
                  )}

                  {/* Download Button */}
                  {(bulkDownloads || isBypassUser) && (
                    <button
                      onClick={handleDownload}
                      className="relative p-2.5 rounded-xl hover:bg-black/5 transition-all duration-300 group"
                      title={
                        selectedPhotos.size > 0
                          ? `Download ${selectedPhotos.size} selected`
                          : "Download All"
                      }
                    >
                      <Download className="relative w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                      {selectedPhotos.size > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-br from-[hsl(var(--fab-amber))] to-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg">
                          {selectedPhotos.size}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    className="relative p-2.5 rounded-xl hover:bg-black/5 transition-all duration-300 group"
                    title="Share Album"
                  >
                    <Share2 className="relative w-5 h-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                  </button>

                  {/* View Mode Toggle */}
                  {/* <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'folder' : 'grid')}
                    className="relative p-2.5 rounded-xl hover:bg-black/5 transition-all duration-300 group"
                    title={viewMode === 'grid' ? 'Folder View' : 'Grid View'}
                  >
                    {viewMode === 'grid' ? (
                      <FolderOpen className="relative w-5 h-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                    ) : (
                      <Image className="relative w-5 h-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                    )}
                  </button> */}

                  {/* Chat Button */}

                  {/* Settings Button */}
                  {canAccessSettings && (
                    <button
                      onClick={() => navigate(`/group-settings/${groupId}`)}
                      className="relative p-2.5 rounded-xl hover:bg-black/5 transition-all duration-300 group"
                      title="Group Settings"
                    >
                      <Settings className="relative w-5 h-5 text-muted-foreground group-hover:text-gray-700 transition-colors" />
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/chat/${groupId}`)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-primary transition-all duration-300 shadow-sm group"
                    title="Chats"
                  >
                    <MessageCircle className="w-4 h-4 text-primary  transition-colors" />
                    <span className="text-sm font-semibold text-primary  transition-colors">Chats</span>
                  </button>
                </div>
              </div>

              {/* Right - Business Branding Preview */}
              {resolvedBranding.show && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-6 shrink-0 pl-6 border-l border-border/60"
                >
                  {/* Studio Info & Socials */}
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      Album by{" "}
                      <span
                        className="font-bold text-foreground hover:text-primary cursor-pointer transition-colors"
                        onClick={() => navigate("/settings/portfolio")}
                      >
                        {resolvedBranding.name || "Fab-Photo Studio"}
                      </span>
                    </span>
                    <div className="flex items-center gap-4">
                      {resolvedBranding.website && (
                        <a
                          href={resolvedBranding.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe className="w-4 h-4 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                        </a>
                      )}
                      {resolvedBranding.socialLinks?.find(
                        (l: any) => l.platform === "instagram",
                      )?.url && (
                          <a
                            href={
                              resolvedBranding.socialLinks.find(
                                (l: any) => l.platform === "instagram",
                              )!.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg
                              className="w-4 h-4 text-muted-foreground hover:text-pink-600 cursor-pointer transition-colors"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                          </a>
                        )}
                      {resolvedBranding.socialLinks?.find(
                        (l: any) => l.platform === "facebook",
                      )?.url && (
                          <a
                            href={
                              resolvedBranding.socialLinks.find(
                                (l: any) => l.platform === "facebook",
                              )!.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg
                              className="w-4 h-4 text-muted-foreground hover:text-blue-600 cursor-pointer transition-colors"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-8.74h-2.94v-3.403h2.94v-2.511c0-2.91 1.777-4.496 4.375-4.496 1.244 0 2.315.093 2.626.134v3.044l-1.802.001c-1.412 0-1.686.671-1.686 1.656v2.172h3.369l-.438 3.403h-2.931v8.74h6.066c.732 0 1.325-.593 1.325-1.325v-21.351c0-.732-.593-1.325-1.325-1.325z" />
                            </svg>
                          </a>
                        )}
                      {resolvedBranding.phone && (
                        <a
                          href={`https://wa.me/${resolvedBranding.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageSquare className="w-4 h-4 text-muted-foreground hover:text-green-600 cursor-pointer transition-colors" />
                        </a>
                      )}
                      {resolvedBranding.email && (
                        <a href={`mailto:${resolvedBranding.email}`}>
                          <Mail className="w-4 h-4 text-muted-foreground hover:text-blue-500 cursor-pointer transition-colors" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Vertical Divider */}
                  <div className="h-12 w-px bg-border/60" />

                  {/* Logo */}
                  <div
                    className="relative w-20 h-20 flex items-center justify-center shrink-0 cursor-pointer overflow-hidden bg-white hover:border-primary/30 transition-all duration-300"
                    onClick={() => navigate("/settings/portfolio")}
                  >
                    <img
                      src={getImageUrl(resolvedBranding.logo || fableadLogo)}
                      alt="Studio Logo"
                      className="h-full w-full object-contain"
                      onError={handleImageError}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full border-b border-border/40 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: scrollable single row. md+: wrap into multiple rows */}
          <div className="flex overflow-x-auto scrollbar-hide md:flex-wrap px-4 md:px-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  if (tab.key === "flipbook") {
                    setShowFlipbook(true);
                    return;
                  }
                  if (tab.key.startsWith("folder-")) {
                    const folderId = tab.key.replace("folder-", "");
                    setSelectedFolder(folderId);
                    setViewMode("grid");
                    setActiveTab(tab.key);
                    if (groupId)
                      dispatch(fetchPhotos({ groupId, folder: folderId }));
                  } else {
                    setActiveTab(tab.key);
                    setSelectedFolder(null);
                    // "liked" and "all" tabs use client-side filtering via filteredPhotos —
                    // NO server fetch needed. Dispatching fetchPhotos here was wiping the
                    // Redux photo store, forcing a full reload every tab switch and
                    // re-triggering the matchMyPhotos cascade loop.
                    if (groupId && tab.key === "videos") {
                      dispatch(fetchVideos(groupId));
                    }
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-2.5 md:py-3 text-xs md:text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-all ${activeTab === tab.key
                  ? "border-[hsl(var(--fab-amber))] text-[hsl(var(--fab-amber))]"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                  }`}
              >
                {tab.icon} {tab.label}
                {tab.key === "my-photos" && myPhotosLoading && (
                  <Loader2 className="w-3 h-3 animate-spin ml-1 text-[hsl(var(--fab-amber))]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selection Mode Toolbar */}
      <AnimatePresence>
        {selectionMode && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 md:px-6 pb-3">
              <div className="bg-card/95 backdrop-blur-md rounded-xl border border-border shadow-sm">
                <div className="px-4 md:px-6 py-3 flex items-center gap-2 overflow-x-auto">
                  <div className="flex items-center gap-2 mr-2 shrink-0">
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-xl">
                      {selectedPhotos.size} Selected
                    </span>
                    <button
                      onClick={exitSelectionMode}
                      className="p-1.5 rounded-xl hover:bg-muted transition-colors"
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                  <div className="h-6 w-px bg-border shrink-0" />
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    <CheckSquare className="w-4 h-4" />
                    {selectedPhotos.size === filteredPhotos.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                  {(bulkDownloads || isBypassUser) && (
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors text-sm font-medium whitespace-nowrap"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                  )}
                  <button
                    onClick={handleFavorite}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    <Heart className="w-4 h-4" /> Favorite
                  </button>
                  <button
                    onClick={handleUnfavorite}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors text-sm font-medium whitespace-nowrap"
                  >
                    <HeartOff className="w-4 h-4 text-destructive" /> Unlike
                  </button>
                  {(hasPermission("delete_photos") || isTeamMember) && (
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-destructive/10 transition-colors text-sm font-medium text-destructive whitespace-nowrap"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Videos Section (conditional) */}
      {activeTab === "videos" && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <AnimatePresence mode="wait">
            {videosLoading ? (
              <motion.div
                key="loading-videos"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground text-sm font-medium">
                  Loading videos...
                </p>
              </motion.div>
            ) : videos.length === 0 ? (
              <motion.div
                key="empty-videos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Play className="w-12 h-12 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Videos Found</h3>
                <p className="text-muted-foreground text-sm max-w-md mb-6">
                  This group doesn't have any videos yet.
                </p>
                {isGroupOwner && (
                  <PhotoUpload
                    groupName={safeGroup.name}
                    onUploadComplete={handleUploadComplete}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="videos-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {videos.map((video, i) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="group relative aspect-video rounded-2xl overflow-hidden bg-black border border-border cursor-pointer"
                    onClick={() => setSelectedVideo(video.id)}
                  >
                    <video
                      src={video.url}
                      poster={video.thumbnail}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => e.currentTarget.pause()}
                      muted
                      loop
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-current" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-sm font-medium truncate">
                        {video.name || `Video ${video.id}`}
                      </p>
                    </div>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Folder View or Photo Grid */}
      <div
        className={`max-w-7xl mx-auto px-4 md:px-6 pb-8 ${activeTab === "videos" ? "hidden" : ""}`}
      >
        <AnimatePresence mode="wait">
          {isPhotosContentLoading ? (
            <motion.div
              key="loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground text-sm font-medium">
                {activeTab === "my-photos" && myPhotosLoading
                  ? "Loading your photos..."
                  : "Loading photos..."}
              </p>
            </motion.div>
          ) : filteredPhotos.length === 0 ? (
            activeTab === "my-photos" &&
              !((user as any)?.selfieUrl || (user as any)?.selfie_url || (user as any)?.faceRegistered || (user as any)?.avatar) ? (
              <motion.div
                key="no-selfie-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-16 px-6 max-w-md mx-auto text-center bg-gradient-to-br from-white to-amber-50/20 rounded-3xl border border-amber-100/60 shadow-xl shadow-black/5"
              >
                <div className="w-20 h-20 rounded-2xl bg-amber-100/60 flex items-center justify-center mb-6 relative">
                  <Camera className="w-10 h-10 text-[hsl(var(--fab-amber))] animate-pulse" />
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md">
                    +
                  </div>
                </div>
                <h3 className="text-2xl font-heading font-bold text-foreground mb-3">
                  Add Profile Image to Match Face
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                  Upload or capture a selfie reference photo so our smart AI facial recognition can find all your photos in this group instantly!
                </p>
                <button
                  onClick={() => setShowProfilePhotoModal(true)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-br from-[hsl(var(--fab-amber))] to-orange-500 hover:opacity-95 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
                >
                  <Camera className="w-5 h-5" />
                  Add Selfie
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Image className="w-12 h-12 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Photos Found</h3>
                <p className="text-muted-foreground text-sm max-w-md mb-6">
                  {selectedFolder
                    ? "No photos available for this date."
                    : activeTab === "highlights"
                      ? "No highlighted photos yet. Add some photos to highlights from the group settings."
                      : activeTab === "liked"
                        ? "You have not liked any photos yet. Click the heart icon on photos to like them."
                        : activeTab === "my-photos"
                          ? "No photos of you were found in this album. Make sure your profile photo is clear and try again."
                          : activeTab === "date"
                            ? "No photos available for this date."
                            : "This album is empty. Upload photos to get started!"}
                </p>
                {isGroupOwner && (
                  <PhotoUpload
                    groupName={safeGroup.name}
                    onUploadComplete={handleUploadComplete}
                  />
                )}
              </motion.div>
            )
          ) : viewMode === "folder" ? (
            <motion.div
              key="folder-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {apiMode === "live" && folders && folders.length > 0
                ? folders.map((folder, index) => {
                  const isSelected = selectedFolder === folder.id;
                  const folderPhotos = folder.photos || [];
                  return (
                    <motion.div
                      key={folder.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedFolder(null);
                          setViewMode("folder");
                          if (groupId) dispatch(fetchPhotos({ groupId }));
                        } else {
                          setSelectedFolder(folder.id);
                          setViewMode("grid");
                          setActiveTab("all");
                          if (groupId)
                            dispatch(
                              fetchPhotos({
                                groupId,
                                folder: String(folder.id),
                              }),
                            );
                        }
                      }}
                      className={`group relative bg-card rounded-xl border-2 border-border p-6 cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg ${isSelected ? "border-primary bg-primary/5 shadow-md" : ""}`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-xl transition-colors ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}
                        >
                          {isSelected ? (
                            <FolderOpen className="w-8 h-8" />
                          ) : (
                            <Folder className="w-8 h-8" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-heading font-semibold mb-1 truncate">
                            {folder.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {folder.photoCount || folderPhotos.length}{" "}
                            {(folder.photoCount || folderPhotos.length) === 1
                              ? "photo"
                              : "photos"}
                          </p>
                          <div className="flex gap-1 mt-3">
                            {folderPhotos
                              .slice(0, 3)
                              .map((photo: any, i: number) => (
                                <div
                                  key={i}
                                  className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted"
                                >
                                  <img
                                    src={getImageUrl(photo.url)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={handleImageError}
                                  />
                                </div>
                              ))}
                            {(folder.photoCount || folderPhotos.length) >
                              3 && (
                                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    +
                                    {(folder.photoCount ||
                                      folderPhotos.length) - 3}
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
                : sortedDates.map((date, index) => {
                  const photos = photosByDate[date];
                  const isSelected = selectedFolder === date;
                  return (
                    <motion.div
                      key={date}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedFolder(null);
                          setViewMode("folder");
                        } else {
                          setSelectedFolder(date);
                          setViewMode("grid");
                          setActiveTab("all");
                        }
                      }}
                      className={`group relative bg-card rounded-xl border-2 border-border p-6 cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg ${isSelected ? "border-primary bg-primary/5 shadow-md" : ""}`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-xl transition-colors ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}
                        >
                          {isSelected ? (
                            <FolderOpen className="w-8 h-8" />
                          ) : (
                            <Folder className="w-8 h-8" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-heading font-semibold mb-1 truncate">
                            {formatFolderName(date)}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {photos.length}{" "}
                            {photos.length === 1 ? "photo" : "photos"}
                          </p>
                          <div className="flex gap-1 mt-3">
                            {photos.slice(0, 3).map((photo, i) => (
                              <div
                                key={i}
                                className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted"
                              >
                                <img
                                  src={getImageUrl(photo.url)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  onError={handleImageError}
                                />
                              </div>
                            ))}
                            {photos.length > 3 && (
                              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-muted-foreground">
                                  +{photos.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </motion.div>
          ) : (
            <>
              <motion.div
                key="grid-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="columns-2 sm:columns-3 lg:columns-4 gap-3"
              >
                {filteredPhotos.map((photo, i) => {
                  const isSelected = selectedPhotos.has(photo.id);
                  return (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`group relative mb-3 break-inside-avoid rounded-xl overflow-hidden cursor-pointer ${isSelected ? "ring-3 ring-primary" : ""}`}
                      onClick={() =>
                        selectionMode
                          ? toggleSelect(photo.id)
                          : setSelectedPhoto(photo.id)
                      }
                    >
                      {
                        /* Shimmer skeleton shown while image loads */
                      }
                      <div
                        className={`absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-xl ${
                          // We track loaded state via onLoad on the img below
                          "photo-skeleton-" + photo.id
                          }`}
                        style={{ aspectRatio: "4/3" }}
                        aria-hidden
                      />
                      <img
                        src={getImageUrl(photo.thumbnail || photo.url)}
                        alt=""
                        className="w-full h-auto group-hover:scale-105 transition-transform duration-500 relative z-10"
                        loading="lazy"
                        decoding="async"
                        onLoad={(e) => {
                          // Hide the shimmer skeleton once the image has loaded
                          const skeleton = e.currentTarget.previousElementSibling as HTMLElement | null;
                          if (skeleton) skeleton.style.display = "none";
                          // If thumbnail loaded, swap to full-res in background
                          if (photo.thumbnail && photo.url && e.currentTarget.src.includes(getImageUrl(photo.thumbnail))) {
                            const imageElement = e.currentTarget;
                            const fullImg = new window.Image();
                            fullImg.src = getImageUrl(photo.url);
                            fullImg.onload = () => {
                              imageElement.src = fullImg.src;
                            };
                          }
                        }}
                        onError={(e) => {
                          // Hide skeleton and show placeholder on error
                          const skeleton = e.currentTarget.previousElementSibling as HTMLElement | null;
                          if (skeleton) skeleton.style.display = "none";
                          e.currentTarget.src = placeholderImage;
                        }}
                      />

                      <div
                        className={`absolute inset-0 transition-colors ${isSelected ? "bg-primary/20" : "bg-foreground/0 group-hover:bg-foreground/20"} z-20`}
                      />

                      {selectionMode && (
                        <div className="absolute top-2 left-2 z-30">
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-primary drop-shadow-lg" />
                          ) : (
                            <Square className="w-5 h-5 text-white drop-shadow-lg" />
                          )}
                        </div>
                      )}

                      {!selectionMode && (
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                          {isMonetizationEnabled && (
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-white text-xs font-semibold">
                                {currency}
                                {pricePerPhoto}
                              </span>
                            </div>
                          )}
                          {isMonetizationEnabled && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePurchasePhoto(photo.id);
                              }}
                              className="p-1.5 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
                              title={`Purchase for ${currency}${pricePerPhoto}`}
                            >
                              <DollarSign className="w-4 h-4 text-primary" />
                            </button>
                          )}
                          {(allowDownloading || isBypassUser) && (
                            <button
                              disabled={downloadingPhotoId === photo.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!hasPermission("download_photos")) {
                                  toast({
                                    title: "Permission Denied",
                                    description:
                                      "You do not have permission to download photos.",
                                    variant: "destructive",
                                  });
                                  return;
                                }
                                // If paid download, show purchase dialog (skip for owners/team members)
                                if (
                                  isMonetizationEnabled &&
                                  (group.monetization as any)?.paidDownloads &&
                                  !isGroupOwner
                                ) {
                                  handlePurchasePhoto(photo.id);
                                  return;
                                }

                                if (apiMode === "live") {
                                  handleDownloadPhoto(photo.id);
                                } else {
                                  toast({
                                    title: "Downloading",
                                    description: "Photo downloading...",
                                  });
                                  // Create a temporary link to download the image (Mock fallback)
                                  const link = document.createElement("a");
                                  link.href = photo.url;
                                  link.download = `photo-${photo.id}.jpg`;
                                  link.target = "_blank";
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }
                              }}
                              className="p-1.5 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors disabled:opacity-50"
                            >
                              {downloadingPhotoId === photo.id ? (
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                              ) : (
                                <Download className="w-4 h-4 text-foreground" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(photo.id);
                            }}
                            className="p-1.5 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
                          >
                            <Heart
                              className={`w-4 h-4 ${likedPhotos.has(photo.id) || photo.liked ? "fill-destructive text-destructive" : "text-foreground"}`}
                            />
                          </button>
                          {/* <button
                            onClick={e => { e.stopPropagation(); toggleSelectionAction(photo.id); }}
                            className="p-1.5 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
                            title="Add to Highlights"
                          >
                            <Star className={`w-4 h-4 ${(photo.isSelectedByClient || photo.is_selected_by_client) ? 'fill-amber-500 text-amber-500' : 'text-foreground'}`} />
                          </button> */}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {apiMode === "live" && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 pb-12">
                  <Button
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() => {
                      if (groupId)
                        dispatch(
                          fetchPhotos({
                            groupId,
                            page: currentPage - 1,
                          }),
                        );
                    }}
                    className="rounded-xl h-10 px-4"
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium px-4 py-2 bg-muted rounded-xl border border-border h-10 flex items-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage >= totalPages}
                    onClick={() => {
                      if (groupId)
                        dispatch(
                          fetchPhotos({
                            groupId,
                            page: currentPage + 1,
                          }),
                        );
                    }}
                    className="rounded-xl h-10 px-4"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Video Lightbox */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoLightbox
            selectedVideo={selectedVideo}
            videos={videos}
            onClose={() => setSelectedVideo(null)}
            onPrev={handlePrevVideo}
            onNext={handleNextVideo}
            allowDownloading={allowDownloading || isBypassUser}
            groupId={groupId}
          />
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && !selectionMode && (
          <PhotoLightbox
            selectedPhoto={selectedPhoto}
            filteredPhotos={filteredPhotos}
            localPhotos={localPhotos}
            likedPhotos={likedPhotos}
            isSlideshow={isSlideshow}
            zoomLevel={zoomLevel}
            isDragging={isDragging}
            imagePosition={imagePosition}
            selectionMode={selectionMode}
            onClose={() => {
              resetZoom();
              setSelectedPhoto(null);
            }}
            onToggleSelection={toggleSelectionAction}
            onPrevPhoto={handlePrevPhoto}
            onNextPhoto={handleNextPhoto}
            onToggleSlideshow={toggleSlideshow}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onResetZoom={resetZoom}
            onDownload={async () => {
              if (selectedPhoto) {
                const photo = localPhotos.find((p) => p.id === selectedPhoto);
                if (apiMode === "live") {
                  // Always download clean (no watermark) — watermark is display-only
                  handleDownloadPhoto(selectedPhoto);
                } else {
                  // Mock mode fallback
                  if (photo) {
                    const link = document.createElement("a");
                    link.href = photo.url;
                    link.download = `photo-${photo.id}.jpg`;
                    link.target = "_blank";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }
                }
              }
            }}
            onShare={handleShare}
            onToggleLike={toggleLike}
            onDelete={handleDeletePhoto}
            onImageClick={handleImageClick}
            onImageDoubleClick={(e) => {
              resetZoom();
            }}
            onWheel={handleWheel}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            downloadingPhotoId={downloadingPhotoId}
            allowDownloading={allowDownloading}
            enableScreenshots={enableScreenshots}
            isBypassUser={isBypassUser}
            enableWatermark={group?.enableWatermark}
            groupUpdatedAt={group?.updatedAt}
            canDelete={isGroupOwner}
          />
        )}
      </AnimatePresence>

      {/* Download Confirmation Dialog */}
      <AnimatePresence>
        {showDownloadConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDownloadConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-card rounded-xl p-6 max-w-md w-full fab-shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-heading font-semibold mb-1">
                    {selectedPhotos.size > 0
                      ? "Download Selected Photos?"
                      : "Download All?"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPhotos.size > 0
                      ? `Are you sure you want to download ${selectedPhotos.size} selected photo(s)?`
                      : `Are you sure you want to download all ${localPhotos.length} photo(s) and video(s)? This may take a while.`}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowDownloadConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDownload}
                  disabled={bulkDownloadLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl fab-gradient text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {bulkDownloadLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {selectedPhotos.size > 0
                    ? "Download Selected"
                    : "Download All"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ShareAlbumPopup
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        shareLink={shareLink}
        joinCode={(group as any)?.joinCode}
        copiedLink={copiedLink}
        onCopyShareLink={copyShareLink}
        onOpenQRPopup={() => {
          if (group?.id) {
            dispatch(fetchGroupQR(group.id));
          }
          setShowQRDialog(true);
        }}
      />
      <QRCodePopup
        open={showQRDialog}
        onOpenChange={setShowQRDialog}
        inviteLink={shareLink}
        groupName={group?.name || ""}
        qrLink={qrLink}
      />
      {/* Flipbook Viewer Modal */}
      {showFlipbook && (
        <div className="fixed inset-0 z-[100] bg-black">
          <FlipbookViewer
            onClose={() => setShowFlipbook(false)}
            images={
              reduxPhotos.length > 0
                ? reduxPhotos.filter((p) => p.is_in_flipbook).map((p) => p.url)
                : [
                  "https://images.unsplash.com/photo-1519741497674-611481863552",
                  "https://images.unsplash.com/photo-1606216794079-73f85bbd57d5",
                  "https://images.unsplash.com/photo-1529634597503-139d3726fed5",
                ]
            }
            title={`${safeGroup.name} Flipbook`}
            businessName={group.businessName}
          />
        </div>
      )}
      {/* Profile Photo Modal for Selfie Registration */}
      <ProfilePhotoModal
        open={showProfilePhotoModal}
        onOpenChange={setShowProfilePhotoModal}
      />
    </div>
  );
}
