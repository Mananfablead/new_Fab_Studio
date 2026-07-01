import { useState, useEffect, useRef } from "react";
import {
  Plus,
  UserPlus,
  Search,
  Grid,
  List,
  Camera,
  Users,
  SearchX,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import GroupCard from "@/components/GroupCard";

import EmptyState from "@/components/EmptyState";
import { useUserFullProfile } from "@/hooks/useUserFullProfile";
import { mockGroups, EventType } from "@/lib/mock-data";
import { toast } from "@/hooks/use-toast";
import JoinGroupPopup from "@/components/popups/JoinGroupPopup";
import CreateGroupPopup from "@/components/popups/CreateGroupPopup";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchGroups,
  createGroup,
  joinGroup,
  setGroupsFromMock,
} from "@/store/slices/groupsSlice";
import {
  selectGroups,
  selectGroupsLoading,
  selectGroupsError,
  selectApiMode,
  selectUser,
} from "@/store/selectors";

import { checkPassword } from "@/store/slices/authSlice";
import api from "@/services/api";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import SEOHead from "@/components/SEOHead";

interface FilteredEmptyStateProps {
  searchQuery: string;
  visibilityFilter: string;
}

const FilteredEmptyState = ({
  searchQuery,
  visibilityFilter,
}: FilteredEmptyStateProps) => {
  const getFilterDescription = () => {
    const filters: string[] = [];
    if (searchQuery) filters.push(`searching for "${searchQuery}"`);
    if (visibilityFilter !== "all")
      filters.push(`${visibilityFilter} groups only`);
    return filters.join(" and ");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="relative mb-6">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-[hsl(var(--fab-amber))]/10 flex items-center justify-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <SearchX className="w-16 h-16 text-primary/60" strokeWidth={1.5} />
          </motion.div>
        </motion.div>
        <motion.div
          animate={{ y: [0, -6, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0,
          }}
          className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[hsl(var(--fab-amber))]"
        />
        <motion.div
          animate={{ y: [0, 6, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          className="absolute bottom-6 right-6 w-1.5 h-1.5 rounded-full bg-primary"
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-center max-w-sm"
      >
        <h3 className="text-xl font-bold mb-2 text-foreground">
          No matching groups found
        </h3>
        <p className="text-muted-foreground text-sm mb-1">
          We couldn't find any groups matching your filters.
        </p>
        {getFilterDescription() && (
          <p className="text-xs text-muted-foreground/70 mb-2">
            Currently {getFilterDescription()}
          </p>
        )}
        <p className="text-xs text-primary/80 font-medium">
          Try adjusting your search or filter criteria
        </p>
      </motion.div>
    </motion.div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const apiMode = useAppSelector(selectApiMode);
  const groups = useAppSelector(selectGroups);
  const loading = useAppSelector(selectGroupsLoading);
  const error = useAppSelector(selectGroupsError);

  const [joinCode, setJoinCode] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [coverImageDataUrl, setCoverImageDataUrl] = useState<string | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<
    "grid" | "list" | "compact" | "masonry"
  >(
    typeof window !== "undefined" && window.innerWidth >= 640 ? "grid" : "list",
  );
  const [visibilityFilter, setVisibilityFilter] = useState<
    "all" | "private" | "public"
  >("all");
  const [groupType, setGroupType] = useState<"private" | "public">("private");
  const [eventType, setEventType] = useState<string>("wedding");
  const [enableMonetization, setEnableMonetization] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const user = useAppSelector(selectUser);

  // Plan limits
  const { checkEventLimit } = usePlanLimits();

  // Fetch full profile with business info
  useUserFullProfile();

  // Debounce ref for search
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Groups load karo - API ya mock data se
  // Single consolidated effect to avoid duplicate API calls on mount
  useEffect(() => {
    if (apiMode !== "live") {
      dispatch(setGroupsFromMock(mockGroups as any));
      return;
    }

    // For non-search changes (mode/filter), fetch immediately
    const doFetch = () => {
      dispatch(
        fetchGroups({
          search: searchQuery || undefined,
          visibility: visibilityFilter !== "all" ? visibilityFilter : undefined,
        }),
      );
    };

    // Debounce only when searchQuery is the changing factor
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(doFetch, searchQuery ? 400 : 0);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, apiMode, visibilityFilter, searchQuery]);

  // Error toast
  useEffect(() => {
    if (error) {
      toast({ title: "Error", description: error, variant: "destructive" });
    }
  }, [error]);

  // In live mode the API already filters; in mock mode filter client-side
  const filteredGroups =
    apiMode === "live"
      ? groups
      : groups.filter((group) => {
          const groupName = group.name || "";
          const gType = group.type || "private";
          const matchesSearch = groupName
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const matchesVisibility =
            visibilityFilter === "all" || gType === visibilityFilter;
          return matchesSearch && matchesVisibility;
        });

  const hasGroups = filteredGroups.length > 0;

  const handleJoinDialogChange = (open: boolean) => {
    setShowJoinDialog(open);
    if (!open) setJoinCode("");
  };

  const handleJoinGroup = async () => {
    if (joinCode.length < 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      if (apiMode === "live") {
        const result = await dispatch(joinGroup(joinCode));
        if (joinGroup.fulfilled.match(result)) {
          toast({
            title: "Success",
            description: "Successfully joined the group!",
          });
          setShowJoinDialog(false);
          setJoinCode("");
          // Refresh groups list to ensure new group appears
          dispatch(
            fetchGroups({
              search: searchQuery || undefined,
              visibility:
                visibilityFilter !== "all" ? visibilityFilter : undefined,
            }),
          );
        } else {
          toast({
            title: "Error",
            description: result.payload as string,
            variant: "destructive",
          });
        }
      } else {
        // Mock mode
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
        toast({
          title: "Success",
          description: "Successfully joined the group! (Mock)",
        });
        setShowJoinDialog(false);
        setJoinCode("");
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateDialogChange = (open: boolean) => {
    setShowCreateDialog(open);
    if (!open) {
      setNewGroupName("");
      setGroupType("private");
      setEventType("wedding");
      setEnableMonetization(false);
      setCoverImageDataUrl(null);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    // Check plan event limit
    const eventCheck = checkEventLimit();
    if (!eventCheck.allowed) {
      toast({
        title: "Plan Limit Reached",
        description: eventCheck.message,
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      if (apiMode === "live") {
        const result = await dispatch(
          createGroup({
            name: newGroupName,
            description: "",
            eventDate: "",
            location: "",
            type: groupType,
            eventType: eventType as EventType,
            coverImage: coverImageDataUrl || undefined,
            monetization: {
              enabled: Boolean(enableMonetization),
              pricePerPhoto: enableMonetization ? 50 : 0,
              currency: "INR",
              clientAlbumSelection: Boolean(enableMonetization),
              maxSelections: enableMonetization ? 50 : 0,
              watermarkText: enableMonetization ? "John Doe Photography" : "",
            },
          }),
        );
        if (createGroup.fulfilled.match(result)) {
          toast({
            title: "Success",
            description: `Group "${newGroupName}" created successfully!`,
          });
          setShowCreateDialog(false);
          setNewGroupName("");
          setGroupType("private");
          setEventType("wedding");
          setEnableMonetization(false);
          setCoverImageDataUrl(null);
          // Refresh groups list to ensure new group appears
          dispatch(
            fetchGroups({
              search: searchQuery || undefined,
              visibility:
                visibilityFilter !== "all" ? visibilityFilter : undefined,
            }),
          );
        } else {
          toast({
            title: "Error",
            description: result.payload as string,
            variant: "destructive",
          });
        }
      } else {
        // Mock mode - local state mein add karo
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
        const mockNewGroup = {
          id: Date.now().toString(),
          name: newGroupName,
          description: "",
          eventDate: "",
          location: "",
          coverImage: "",
          photoCount: 0,
          participantCount: 0,
          createdAt: new Date().toISOString().split("T")[0],
          type: groupType,
          eventType: eventType as EventType,
          monetization: enableMonetization
            ? {
                enabled: true,
                pricePerPhoto: 50,
                currency: "INR",
                clientAlbumSelection: true,
                maxSelections: 50,
                watermarkText: "John Doe Photography",
              }
            : {
                enabled: false,
              },
        };
        dispatch(setGroupsFromMock([mockNewGroup, ...groups] as any));
        toast({
          title: "Success",
          description: `Group "${newGroupName}" created successfully!`,
        });
        setShowCreateDialog(false);
        setNewGroupName("");
        setGroupType("private");
        setEventType("wedding");
        setEnableMonetization(false);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEOHead pageKey="/dashboard" />
      <AppHeader />
      <JoinGroupPopup
        open={showJoinDialog}
        onOpenChange={handleJoinDialogChange}
        joinCode={joinCode}
        onJoinCodeChange={setJoinCode}
        onJoin={handleJoinGroup}
        isLoading={isJoining}
      />
      <CreateGroupPopup
        open={showCreateDialog}
        onOpenChange={handleCreateDialogChange}
        newGroupName={newGroupName}
        onGroupNameChange={setNewGroupName}
        groupType={groupType}
        onGroupTypeChange={setGroupType}
        eventType={eventType}
        onEventTypeChange={setEventType}
        enableMonetization={enableMonetization}
        onMonetizationChange={setEnableMonetization}
        coverImage={coverImageDataUrl}
        onCoverImageChange={setCoverImageDataUrl}
        onCreate={handleCreateGroup}
        isLoading={isCreating}
      />
      <main className="max-w-7xl mx-auto py-6">
        {loading && groups.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !hasGroups && !searchQuery && visibilityFilter === "all" ? (
          <EmptyState
            user={user}
            onJoinClick={() => setShowJoinDialog(true)}
            onCreateClick={() => setShowCreateDialog(true)}
          />
        ) : (
          <>
            <div className="px-3 md:px-6">
              {/* Mobile Layout */}
              <div className="flex flex-col gap-2 mb-4 md:hidden">
                <div>
                  <h1 className="text-lg font-heading font-bold">My Groups</h1>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {filteredGroups.length} groups •{" "}
                    {filteredGroups.reduce(
                      (a, g) => a + (g.photoCount || 0),
                      0,
                    )}{" "}
                    photos
                  </p>
                </div>
                <div className="flex flex-row gap-2">
                  <button
                    onClick={() => setShowJoinDialog(true)}
                    className="h-10 flex-1 text-sm font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Join Group
                  </button>
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="h-10 flex-1 text-sm font-medium bg-[hsl(var(--fab-amber))] text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Group
                  </button>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex flex-row items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-heading font-bold">My Groups</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredGroups.length} groups •{" "}
                    {filteredGroups.reduce(
                      (a, g) => a + (g.photoCount || 0),
                      0,
                    )}{" "}
                    photos
                  </p>
                </div>
                <div className="flex flex-row gap-4">
                  <button
                    onClick={() => setShowJoinDialog(true)}
                    className="group relative h-12 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <div className="flex items-center gap-2 relative z-10">
                      <UserPlus className="w-5 h-5" />
                      <span>Join Group</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="group relative h-12 px-6 rounded-xl bg-gradient-to-r from-[hsl(var(--fab-amber))] to-[hsl(var(--fab-amber))]/80 text-primary-foreground font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <div className="flex items-center gap-2 relative z-10">
                      <Plus className="w-5 h-5" />
                      <span>Create Group</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 px-4 md:px-6">
              <div className="relative w-full sm:w-56 md:w-96">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search..."
                  className="w-full pl-5 pr-11 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/70 shadow-sm transition-all"
                />
                <button
                  className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary p-2 rounded-full text-white hover:opacity-90 transition-opacity"
                  aria-label="Search"
                >
                  <Search className="w-3.5 h-3.5 font-black" />
                </button>
              </div>

              <div className="flex rounded-xl border border-border overflow-hidden w-full sm:w-auto">
                {(["all", "private", "public"] as const).map((filter, i) => (
                  <button
                    key={filter}
                    onClick={() => setVisibilityFilter(filter)}
                    className={`flex-1 sm:flex-none px-3 py-2.5 text-xs font-medium transition-colors ${i > 0 ? "border-l border-border" : ""} ${
                      visibilityFilter === filter
                        ? "fab-gradient-amber text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              <div className="hidden sm:flex rounded-xl border border-border overflow-hidden ml-auto w-full sm:w-auto">
                {[
                  {
                    mode: "grid",
                    icon: <Grid className="w-4 h-4 mx-auto" />,
                    label: "Grid view",
                  },
                  {
                    mode: "list",
                    icon: <List className="w-4 h-4 mx-auto" />,
                    label: "List view",
                  },
                  {
                    mode: "compact",
                    icon: <Users className="w-4 h-4 mx-auto" />,
                    label: "Compact view",
                  },
                  {
                    mode: "masonry",
                    icon: <Camera className="w-4 h-4 mx-auto" />,
                    label: "Masonry view",
                  },
                ].map(({ mode, icon, label }, i) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as any)}
                    className={`flex-1 sm:flex-none px-3 py-2.5 transition-colors ${i > 0 ? "border-l border-border" : ""} ${
                      viewMode === mode
                        ? "fab-gradient-amber text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                    aria-label={label}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {!hasGroups ? (
              <FilteredEmptyState
                searchQuery={searchQuery}
                visibilityFilter={visibilityFilter}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-4 md:px-6"
                    : viewMode === "list"
                      ? "flex flex-col gap-4 px-4 md:px-6"
                      : viewMode === "compact"
                        ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 px-4 md:px-6"
                        : "columns-1 sm:columns-2 lg:columns-3 gap-5 px-4 md:px-6 space-y-5"
                }
              >
                {filteredGroups.map((group, i) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={viewMode === "list" ? "w-full" : ""}
                  >
                    <GroupCard group={group as any} viewMode={viewMode} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
