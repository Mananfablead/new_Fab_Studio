import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCheck } from 'lucide-react';
import { useState } from 'react';

interface MediaSharePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareLink: string;
}

export default function MediaSharePopup({ open, onOpenChange, shareLink }: MediaSharePopupProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socialLinks = [
    { name: 'Facebook', icon: 'facebook', color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}` },
    { name: 'WhatsApp', icon: 'whatsapp', color: '#25D366', url: `https://wa.me/?text=${encodeURIComponent(shareLink)}` },
    { name: 'Twitter', icon: 'twitter', color: '#000000', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}` },
    { name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}` },
    { name: 'Email', icon: 'mail', color: '#888888', url: `mailto:?body=${encodeURIComponent(shareLink)}` },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#F4F7F9] rounded-xl p-6 max-w-sm w-full shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-gray-700 font-bold text-lg tracking-wider">SHARE</h3>
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Link Input */}
            <div className="flex gap-2 mb-8">
              <div className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-600 text-sm truncate overflow-hidden">
                {shareLink}
              </div>
              <button
                onClick={handleCopy}
                className={`px-4 py-3 rounded-lg font-bold text-sm transition-all min-w-[70px] flex items-center justify-center ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-[#CDE8F5] text-[#2C5E7B] hover:bg-[#B8DCEF]'
                }`}
              >
                {copied ? <CheckCheck className="w-4 h-4" /> : 'Copy'}
              </button>
            </div>

            {/* Social Icons */}
            <div className="flex items-center justify-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 active:scale-95 shadow-md"
                  style={{ backgroundColor: social.color }}
                >
                  {social.icon === 'facebook' && (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M9.101 24v-11.063h-3.842v-4.451h3.842v-3.286c0-3.805 2.324-5.877 5.719-5.877 1.627 0 3.024.121 3.431.176v3.979h-2.354c-1.847 0-2.203.878-2.203 2.164v2.844h4.408l-.573 4.451h-3.835v11.063h-4.401z"/></svg>
                  )}
                  {social.icon === 'whatsapp' && (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.301-.15-1.781-.879-2.057-.979-.275-.101-.476-.151-.675.15-.199.301-.771.979-.944 1.179-.173.201-.347.226-.648.076-.301-.151-1.27-.469-2.42-1.494-.894-.797-1.496-1.782-1.672-2.083-.176-.301-.019-.463.132-.613.135-.134.301-.351.451-.526.151-.176.201-.301.301-.502.101-.201.051-.376-.025-.526-.076-.151-.675-1.627-.925-2.228-.243-.588-.489-.507-.675-.516-.174-.008-.373-.01-.573-.01-.2 0-.527.075-.802.376-.275.301-1.053 1.028-1.053 2.507 0 1.479 1.078 2.912 1.228 3.112.15.201 2.122 3.241 5.143 4.542.718.31 1.279.494 1.716.633.721.23 1.378.198 1.897.121.579-.085 1.781-.728 2.032-1.43.252-.703.252-1.303.176-1.43-.076-.126-.276-.201-.576-.351z"/></svg>
                  )}
                  {social.icon === 'twitter' && (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  )}
                  {social.icon === 'linkedin' && (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  )}
                  {social.icon === 'mail' && (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 8.139h-18.893l5.627-8.134zm9.201-1.259l4.623-3.746v9.458l-4.623-5.712z"/></svg>
                  )}
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
