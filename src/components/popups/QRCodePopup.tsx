import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Share2, Download, Check } from 'lucide-react';
import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from '@/hooks/use-toast';
import fableadLogo from '@/assets/iamges/fabstudio_logo.png';

interface QRCodePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inviteLink: string;
  groupName: string;
  qrLink?: string | null;
}

export default function QRCodePopup({ open, onOpenChange, inviteLink, groupName, qrLink }: QRCodePopupProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Invitation link has been copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${groupName} on PhotoFab`,
          text: `Hey! Join our photo group "${groupName}" to see and share photos.`,
          url: inviteLink,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopy();
    }
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${groupName.replace(/\s+/g, '_')}_QR.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    
    toast({
      title: "QR Code Downloaded",
      description: "The QR code has been saved to your device.",
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-card rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-heading">Invite Participants</h3>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-full hover:bg-muted transition-colors border border-transparent hover:border-border"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Pro tip */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6">
              <p className="text-[11px] text-primary font-medium text-center leading-relaxed">
                <span className="font-bold">PRO TIP:</span> Make photo sharing effortless—print this QR code on visiting cards for your event guests.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white rounded-[2rem] p-8 border border-border shadow-inner relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* QR Label */}
              <p className="text-center text-[10px] font-black tracking-[0.2em] text-primary/40 uppercase mb-6">
                Scan to access gallery
              </p>

              {/* QR Code */}
              <div ref={qrRef} className="relative z-10 w-48 h-48 mx-auto flex items-center justify-center bg-white p-2 rounded-xl mb-6">
                <QRCodeSVG 
                  value={inviteLink}
                  size={192}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: fableadLogo,
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>

              {/* Fablead Logo */}
              <div className="flex justify-center relative z-10">
                <img 
                  src={fableadLogo} 
                  alt="Fablead" 
                  className="h-10 object-contain grayscale opacity-50 contrast-125"
                />
              </div>
            </div>

            {/* Invite Link Section */}
            <div className="mt-8 space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 bg-muted/50 rounded-xl px-4 py-3 border border-border overflow-hidden">
                  <p className="text-xs font-medium text-muted-foreground truncate">
                    {inviteLink}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="p-3 rounded-xl bg-card border border-border hover:bg-muted transition-colors relative"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                >
                  <Share2 className="w-4 h-4" />
                  Share Link
                </button>
                <button
                  onClick={handleDownloadQR}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity border border-foreground"
                >
                  <Download className="w-4 h-4" />
                  Get QR
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}