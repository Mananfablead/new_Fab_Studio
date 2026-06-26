import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Trash2,
  Filter,
  ArrowLeft,
  Clock,
  Image,
  MessageSquare,
  Star,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchNotifications,
  fetchUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification as deleteNotificationAction,
  clearAllNotifications,
} from "@/store/slices/notificationsSlice";
import {
  selectNotifications,
  selectUnreadNotifications,
  selectNotificationsLoading,
  selectUnreadNotificationsLoading,
  selectDeletingNotificationId,
  selectMarkingReadId,
  selectMarkingAllRead,
  selectUnreadCount,
} from "@/store/selectors";
import SEOHead from "@/components/SEOHead";

type NotificationType = "all" | "unread" | "system" | "photos" | "messages";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "photo":
      return <Image className="w-4 h-4" />;
    case "message":
      return <MessageSquare className="w-4 h-4" />;
    case "system":
      return <Star className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const notifications = useAppSelector(selectNotifications);
  const unreadNotifications = useAppSelector(selectUnreadNotifications);
  const loading = useAppSelector(selectNotificationsLoading);
  const unreadLoading = useAppSelector(selectUnreadNotificationsLoading);
  const deletingId = useAppSelector(selectDeletingNotificationId);
  const markingReadId = useAppSelector(selectMarkingReadId);
  const markingAllRead = useAppSelector(selectMarkingAllRead);
  const unreadCount = useAppSelector(selectUnreadCount);
  const [filter, setFilter] = useState<NotificationType>("all");

  // Fetch all notifications on mount
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  // When filter switches to 'unread', call the dedicated unread API
  useEffect(() => {
    if (filter === "unread") {
      dispatch(fetchUnreadNotifications());
    }
  }, [filter, dispatch]);

  // Derive the list to display based on active filter
  const filteredNotifications =
    filter === "unread"
      ? unreadNotifications
      : notifications.filter((n) => {
          if (filter === "system")
            return n.type === "system" || n.type === "payment";
          if (filter === "photos") return n.type === "photo";
          if (filter === "messages") return n.type === "invite";
          return true;
        });

  const isLoading = filter === "unread" ? unreadLoading : loading;

  const markAsRead = async (id: string) => {
    try {
      await dispatch(markNotificationRead(id)).unwrap();
      toast({ description: "Notification marked as read." });
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to mark as read. Please try again.",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await dispatch(markAllNotificationsRead()).unwrap();
      toast({ description: "All notifications marked as read." });
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to mark all as read. Please try again.",
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await dispatch(deleteNotificationAction(id)).unwrap();
      toast({ description: "Notification deleted." });
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to delete notification. Please try again.",
      });
    }
  };

  const clearAll = () => {
    dispatch(clearAllNotifications());
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead pageKey="/notifications" />
      <AppHeader />
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-6">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-muted transition-colors shrink-0 mt-1"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-heading font-bold flex items-center gap-2 flex-wrap">
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] sm:text-xs font-medium">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {notifications.length} total notifications
            </p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground shrink-0" />
            <Select
              value={filter}
              onValueChange={(v) => setFilter(v as NotificationType)}
            >
              <SelectTrigger className="w-full sm:w-[140px] text-xs sm:text-sm">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="photos">Photos</SelectItem>
                <SelectItem value="messages">Messages</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={markingAllRead}
                className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm px-2 sm:px-3 disabled:opacity-50"
              >
                {markingAllRead ? (
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                )}
                <span className="hidden sm:inline">Mark all read</span>
                <span className="sm:hidden">Mark all</span>
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                {/* <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none text-xs sm:text-sm text-destructive hover:text-destructive px-2 sm:px-3"
                                >
                                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Clear all</span><span className="sm:hidden">Clear</span>
                                </Button> */}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {notifications.length}{" "}
                    notifications. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearAll}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Clear all
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2 sm:space-y-3">
          {isLoading ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground text-xs sm:text-sm">
                Loading notifications...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-base sm:text-lg mb-1">
                No notifications
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {filter === "all"
                  ? "You're all caught up!"
                  : `No ${filter} notifications found.`}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group bg-card rounded-xl sm:rounded-xl border border-border p-3 sm:p-4 flex items-start gap-3 sm:gap-4 hover:shadow-md transition-all ${
                  !notification.read
                    ? "bg-fab-amber-light/30 border-fab-amber/30"
                    : ""
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                    notification.read ? "bg-muted" : "fab-gradient"
                  }`}
                >
                  <span
                    className={
                      notification.read
                        ? "text-muted-foreground"
                        : "text-primary-foreground"
                    }
                  >
                    {getNotificationIcon(notification.type)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-col sm:flex-row">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-xs sm:text-sm truncate">
                        {notification.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {notification.time}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2 sm:mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        disabled={markingReadId === notification.id}
                        className="text-[10px] sm:text-xs text-primary hover:underline font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {markingReadId === notification.id ? (
                          <Loader2 className="w-2.5 h-2.5 animate-spin" />
                        ) : null}
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      disabled={deletingId === notification.id}
                      className="text-[10px] sm:text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {deletingId === notification.id ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      ) : null}
                      Delete
                    </button>
                  </div>
                </div>

                {/* Unread Indicator */}
                {!notification.read && (
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary shrink-0 mt-1.5 sm:mt-2" />
                )}
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
