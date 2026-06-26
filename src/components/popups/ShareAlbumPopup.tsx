import { motion, AnimatePresence } from 'framer-motion';
import { Share2, X, Users, Link, Copy, CheckCheck, QrCode } from 'lucide-react';

interface ShareAlbumPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareLink: string;
  joinCode?: string;
  copiedLink: boolean;
  onCopyShareLink: () => void;
  onOpenQRPopup: () => void;
}

export default function ShareAlbumPopup({ open, onOpenChange, shareLink, joinCode, copiedLink, onCopyShareLink, onOpenQRPopup }: ShareAlbumPopupProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="bg-card rounded-xl p-6 max-w-lg w-full fab-shadow-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-semibold">Share Album</h3>
                  <p className="text-xs text-muted-foreground">Invite others to view photos</p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* What users can do */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <h4 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                What can users do with the share link?
              </h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-x">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="text-muted-foreground">View all photos and videos in the album</span>
                </li>
                <li className="flex items-start gap-2 text-x">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="text-muted-foreground">Download photos (if permitted by owner)</span>
                </li>
                <li className="flex items-start gap-2 text-x">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="text-muted-foreground">Like and favorite their favorite moments</span>
                </li>
                <li className="flex items-start gap-2 text-x">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <span className="text-muted-foreground">Use AI face matching to find their photos</span>
                </li>
              </ul>
            </div>

            {/* Share Link */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Link className="w-4 h-4 text-primary" />
                Share Link
              </label>
              <div className="relative">
                <div className="flex items-center px-4 py-3 rounded-xl border border-input bg-muted/30 text-sm font-mono truncate pr-12">
                  <span className="truncate">{shareLink}</span>
                </div>
                <button
                  onClick={onCopyShareLink}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                    copiedLink 
                      ? 'bg-[hsl(var(--fab-success))] text-white' 
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                  title="Copy link"
                >
                  {copiedLink ? (
                    <CheckCheck className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              {copiedLink && (
                <p className="text-xs text-[hsl(var(--fab-success))] mt-1.5 font-medium">Copied</p>
              )}
            </div>

            {joinCode && (
              <div className="mb-6">
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Join Code
                </label>
                <div className="flex items-center px-4 py-3 rounded-xl border border-input bg-muted/30 text-sm font-mono font-bold text-center justify-center">
                  <span>{joinCode}</span>
                </div>
              </div>
            )}

            {/* OR Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">OR</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* QR Code Section */}
            <div className="mb-6">
              <button
                onClick={onOpenQRPopup}
                className="w-full px-4 py-3 rounded-xl border-2 border border-primary/50 hover:border-primary/50 hover:bg-primary/10 transition-all flex items-center justify-center gap-2 text-sm font-medium text-primary"
              >
                <QrCode className="w-4 h-4" />
                Scan by QR
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}