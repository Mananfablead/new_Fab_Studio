import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { setPassword } from '@/store/slices/authSlice';
import { fetchGroups } from '@/store/slices/groupsSlice';
import { toast } from '@/hooks/use-toast';
import { joinGroup } from '@/services/api';

export default function SetPasswordModal() {
  const dispatch = useAppDispatch();
  const { user, isPasswordSet, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Only show if authenticated and we know for sure password is NOT set
  if (!isAuthenticated || isPasswordSet !== false) return null;

  const handleSetPassword = async () => {
    if (!newPassword) { 
      setPasswordError('Password is required.'); 
      return; 
    }
    if (newPassword.length < 6) { 
      setPasswordError('Password must be at least 6 characters.'); 
      return; 
    }
    if (newPassword !== confirmPassword) { 
      setPasswordError('Passwords do not match.'); 
      return; 
    }
    
    setPasswordError('');
    setPasswordLoading(true);
    
    try {
      const result = await dispatch(setPassword({
        user_id: String(user?.id),
        password: newPassword,
        password_confirmation: confirmPassword
      })).unwrap();
      
      // After password is set, join pending group invite if any
      const pendingToken = localStorage.getItem('pendingInviteToken');
      if (pendingToken) {
        try { await joinGroup(pendingToken); } catch (_) {}
        localStorage.removeItem('pendingInviteToken');
      }

      // Refresh groups list so newly joined group appears without page reload
      dispatch(fetchGroups());

      toast({ title: "Success", description: "Password created successfully!" });
    } catch (err: any) {
      setPasswordError(err || 'Failed to set password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md" 
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-6 z-10"
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[hsl(var(--fab-amber))]/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-[hsl(var(--fab-amber))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-foreground">Set Your Password</h2>
            <p className="text-sm text-muted-foreground mt-2 px-4">
              Your account is currently secured by OTP only. Please create a password for direct access.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setPasswordError(''); }}
                  placeholder="Min. 6 characters"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/80 mb-1.5 block">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setPasswordError(''); }}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {passwordError && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-xs font-medium bg-destructive/10 p-2.5 rounded-lg border border-destructive/20"
              >
                {passwordError}
              </motion.p>
            )}
          </div>

          <div className="pt-2">
            <button 
              onClick={handleSetPassword} 
              disabled={passwordLoading}
              className="w-full px-6 py-3.5 rounded-xl fab-gradient text-primary-foreground font-bold shadow-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              {passwordLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Setting Password...</>
                : <>Create Password & Continue <ArrowRight className="w-4 h-4" /></>
              }
            </button>
            <p className="text-[10px] text-center text-muted-foreground mt-4 uppercase tracking-widest font-medium">
              Mandatory Security Requirement
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
