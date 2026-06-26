import { Search, Bell, Settings, BarChart3, HelpCircle, Shield, BookOpen, Info, LogOut, User, ChevronDown, Sparkles, TestTube } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserFullProfile } from '@/hooks/useUserFullProfile';
import { useSelector } from 'react-redux';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout as reduxLogout, logoutUser } from '@/store/slices/authSlice';
import { selectUser, selectNotifications, selectUnreadCount } from '@/store/selectors';
import { fetchNotifications } from '@/store/slices/notificationsSlice';
import { sendTestNotification, sendOTPNotification } from '@/notification';
import fableadLogo from '@/assets/iamges/fabstudio_logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export default function AppHeader() {
  const { logout } = useAuth();
  
  // Use Redux user state instead of AuthContext - this gets updated by useUserFullProfile
  const user = useSelector(selectUser);
  
  // Fetch full profile with business info
  useUserFullProfile();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showNotifications, setShowNotifications] = useState(false);

  // Use Redux notifications state
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);

  // Only unread notifications for the dropdown preview
  const unreadNotifications = notifications.filter(n => !n.read);

  // Fetch notifications on mount
  useEffect(() => {
    dispatch(fetchNotifications({}));
  }, [dispatch]);

  return (
    <header className="sticky top-0 z-50">
      {/* Glassmorphism background with blur */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-black/5" />

      <div className="relative flex items-center justify-between px-4 md:px-6 h-24">
        {/* Logo */}
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 z-10 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--fab-amber))]/30 to-[hsl(var(--fab-navy))]/30 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500" />
            <img
              src={fableadLogo}
              alt="Fablead Logo"
              className="relative h-24 w-auto object-contain rounded-xl"
            />
          </div>
        </button>

        {/* Center Tagline */}
        <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <span className="text-md text-muted-foreground">
            Welcome to{' '}
            <a href="/" className="font-bold text-md text-[hsl(var(--fab-amber))]  transition-all">
              Fablead Studio
            </a>
            {' '}- Create, Share & Preserve Your Beautiful Memories
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 md:gap-2 z-10">
          
          {/* Profile Shortcut Button */}
          <button
            onClick={() => navigate('/settings/profile')}
            className="relative p-2.5 rounded-xl hover:bg-black/5 transition-all duration-300 group"
            title="Profile Settings"
          >
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[hsl(var(--fab-amber))]/0 to-[hsl(var(--fab-navy))]/0 group-hover:from-[hsl(var(--fab-amber))]/10 group-hover:to-[hsl(var(--fab-navy))]/10 transition-all duration-300" />
            <User className="relative w-6 h-6 text-foreground/70 group-hover:text-foreground transition-colors" />
          </button>
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl hover:bg-black/5 transition-all duration-300 group"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[hsl(var(--fab-amber))]/0 to-[hsl(var(--fab-navy))]/0 group-hover:from-[hsl(var(--fab-amber))]/10 group-hover:to-[hsl(var(--fab-navy))]/10 transition-all duration-300" />
              <Bell className="relative w-6 h-6 text-foreground/70 group-hover:text-foreground transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[hsl(var(--fab-amber))] ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="fixed left-2 right-2 sm:absolute sm:left-auto sm:right-0 sm:w-96 mt-3 bg-white/80 backdrop-blur-xl rounded-xl border border-white/50 shadow-2xl shadow-black/10 animate-scale-in z-50 overflow-hidden">
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-gradient-to-r from-[hsl(var(--fab-navy))]/5 to-transparent">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[hsl(var(--fab-amber))]" />
                    <h3 className="font-heading font-semibold text-sm">Notifications</h3>
                  </div>
                  <button
                    onClick={() => { setShowNotifications(false); navigate('/notifications'); }}
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {unreadNotifications.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">All caught up!</p>
                      <p className="text-xs text-muted-foreground mt-0.5">No unread notifications</p>
                    </div>
                  ) : (
                    unreadNotifications.slice(0, 5).map(n => (
                      <div key={n.id} className="p-4 border-b border-border/30 last:border-0 hover:bg-black/5 cursor-pointer transition-colors bg-[hsl(var(--fab-amber))]/5">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-[hsl(var(--fab-amber))]" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{n.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                            <p className="text-xs text-muted-foreground/60 mt-1.5">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {unreadNotifications.length > 5 && (
                  <div className="p-3 border-t border-border/50 text-center bg-muted/30">
                    <button
                      onClick={() => { setShowNotifications(false); navigate('/notifications'); }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                    >
                      +{unreadNotifications.length - 5} more unread
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-black/5 transition-all duration-300 ml-1">
                <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--fab-amber))] to-[hsl(var(--fab-navy))] p-[1px] overflow-hidden">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {user?.avatar && (user.avatar.startsWith('data:image') || user.avatar.startsWith('http') || user.avatar.includes('/') || user.avatar.includes('.')) ? (
                      <img 
                        src={user.avatar.startsWith('http') || user.avatar.startsWith('data:') ? user.avatar : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}/${user.avatar}`} 
                        alt={user.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-xs font-bold bg-gradient-to-br from-[hsl(var(--fab-amber))] to-[hsl(var(--fab-navy))] bg-clip-text text-transparent">
                        {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                </div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-md font-semibold leading-tight">{user?.firstName || user?.name?.split(' ')[0]}</p>
                  <p className="text-[12px] text-muted-foreground capitalize leading-tight">{user?.role}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground sm:w-5 sm:h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-black/10 rounded-xl p-0 overflow-hidden">
              {/* User Info Header with Gradient */}
              <div className="relative px-3 py-2 bg-gradient-to-br from-[hsl(var(--fab-navy))] to-[hsl(var(--fab-navy-light))]">
                <div className="absolute inset-0 bg-white/10" />
                <div className="relative flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 overflow-hidden">
                    {user?.avatar && (user.avatar.startsWith('data:image') || user.avatar.startsWith('http') || user.avatar.includes('/') || user.avatar.includes('.')) ? (
                      <img 
                        src={user.avatar.startsWith('http') || user.avatar.startsWith('data:') ? user.avatar : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}/${user.avatar}`} 
                        alt={user.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-sm font-bold text-white">
                        {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-white/70 truncate">{user?.email}</p>
                  </div>
                </div>
                <Badge className="mt-2 text-[9px] bg-[hsl(var(--fab-amber))] text-[hsl(var(--fab-navy))] border-0 font-semibold px-1.5 py-0">
                  {user?.role}
                </Badge>
              </div>

              {/* Menu Items */}
              <div className="p-1">
                {user?.role === 'user' && (
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer rounded-xl px-2 py-1.5 hover:bg-gradient-to-r hover:from-[hsl(var(--fab-amber))]/10 hover:to-transparent transition-all">
                    <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center mr-2">
                      <User className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <span className="text-xs font-medium">Profile Settings</span>
                  </DropdownMenuItem>
                )}

                {user?.role !== 'user' && (
                  <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer rounded-xl px-2 py-1.5 hover:bg-gradient-to-r hover:from-[hsl(var(--fab-amber))]/10 hover:to-transparent transition-all">
                    <div className="w-6 h-6 rounded-md bg-purple-500/10 flex items-center justify-center mr-2">
                      <Settings className="h-3.5 w-3.5 text-purple-500" />
                    </div>
                    <span className="text-xs font-medium">Business Settings</span>
                  </DropdownMenuItem>
                )}

                {user?.role !== 'user' && (
                  <DropdownMenuItem onClick={() => navigate('/analytics')} className="cursor-pointer rounded-xl px-2 py-1.5 hover:bg-gradient-to-r hover:from-[hsl(var(--fab-amber))]/10 hover:to-transparent transition-all">
                    <div className="w-6 h-6 rounded-md bg-green-500/10 flex items-center justify-center mr-2">
                      <BarChart3 className="h-3.5 w-3.5 text-green-500" />
                    </div>
                    <span className="text-xs font-medium">Analytics</span>
                  </DropdownMenuItem>
                )}

                <div className="my-1 border-t border-border/30" />

                <DropdownMenuItem onClick={() => navigate('/help')} className="cursor-pointer rounded-xl px-2 py-1.5 hover:bg-gradient-to-r hover:from-[hsl(var(--fab-amber))]/10 hover:to-transparent transition-all">
                  <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center mr-2">
                    <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  <span className="text-xs font-medium">Help & Support</span>
                </DropdownMenuItem>

                {/* <DropdownMenuItem onClick={() => navigate('/tutorials')} className="cursor-pointer rounded-xl px-2 py-1.5 hover:bg-gradient-to-r hover:from-[hsl(var(--fab-amber))]/10 hover:to-transparent transition-all">
                  <div className="w-6 h-6 rounded-md bg-pink-500/10 flex items-center justify-center mr-2">
                    <BookOpen className="h-3.5 w-3.5 text-pink-500" />
                  </div>
                  <span className="text-xs font-medium">Tutorials</span>
                </DropdownMenuItem> */}

                <DropdownMenuItem onClick={() => navigate('/privacy-security')} className="cursor-pointer rounded-xl px-2 py-1.5 hover:bg-gradient-to-r hover:from-[hsl(var(--fab-amber))]/10 hover:to-transparent transition-all">
                  <div className="w-6 h-6 rounded-md bg-cyan-500/10 flex items-center justify-center mr-2">
                    <Shield className="h-3.5 w-3.5 text-cyan-500" />
                  </div>
                  <span className="text-xs font-medium">Privacy & Security</span>
                </DropdownMenuItem>

                {/* <DropdownMenuItem onClick={() => navigate('/about')} className="cursor-pointer rounded-xl px-2 py-1.5 hover:bg-gradient-to-r hover:from-[hsl(var(--fab-amber))]/10 hover:to-transparent transition-all">
                  <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center mr-2">
                    <Info className="h-3.5 w-3.5 text-indigo-500" />
                  </div>
                  <span className="text-xs font-medium">About</span>
                </DropdownMenuItem> */}
              </div>

              {/* Logout Section */}
              <div className="p-1.5 border-t border-border/30 bg-red-50/50">
                <DropdownMenuItem onClick={() => { logout(); dispatch(logoutUser()).finally(() => navigate('/login')); }} className="cursor-pointer rounded-xl px-2 py-1.5 hover:bg-red-100 transition-all text-red-600">
                  <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center mr-2">
                    <LogOut className="h-3.5 w-3.5 text-red-500" />
                  </div>
                  <span className="text-xs font-medium">Logout</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
