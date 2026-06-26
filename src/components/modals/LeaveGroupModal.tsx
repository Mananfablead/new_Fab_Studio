import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, LogOut, X } from 'lucide-react';

interface LeaveGroupModalProps {
  isOpen: boolean;
  isLoading: boolean;
  groupName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LeaveGroupModal({
  isOpen,
  isLoading,
  groupName,
  onConfirm,
  onCancel,
}: LeaveGroupModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60"
            onClick={onCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-background border border-border rounded-2xl shadow-2xl p-6 space-y-6 z-10"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-foreground">Leave Group?</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      Are you sure you want to leave this group? You will lose access to all photos.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={onCancel}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-6 py-3.5 rounded-xl border border-border bg-background text-foreground font-semibold hover:bg-muted transition-all active:scale-[0.98] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 px-6 py-3.5 rounded-xl bg-orange-500 text-white font-semibold shadow-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Leaving...
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Leave Group
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
