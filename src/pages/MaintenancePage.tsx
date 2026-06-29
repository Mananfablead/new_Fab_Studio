import { Wrench, RefreshCw, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

interface MaintenancePageProps {
  message?: string;
  onRetry: () => void;
  isRetrying: boolean;
}

export default function MaintenancePage({ message, onRetry, isRetrying }: MaintenancePageProps) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#0B0F19] px-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Mesh Gradients */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-[hsl(var(--fab-navy))]/30 blur-[120px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[hsl(var(--fab-amber))]/20 blur-[120px]"
        />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10 flex flex-col items-center">
        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
          className="w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-12 text-center shadow-2xl relative overflow-hidden group"
        >
          {/* Card Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

          {/* Icon Container */}
          <div className="relative w-28 h-28 mx-auto mb-8">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-[hsl(var(--fab-amber))]/30 border-dashed"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border border-[hsl(var(--fab-amber))]/20"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[hsl(var(--fab-navy))] to-[#1a2333] rounded-full shadow-[0_0_30px_rgba(245,158,11,0.2)] border border-white/10 overflow-hidden">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Wrench className="w-12 h-12 text-[hsl(var(--fab-amber))]" strokeWidth={1.5} />
              </motion.div>
            </div>
            
            {/* Floating Badges */}
            <motion.div 
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-2 -right-2 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md p-2 rounded-full text-emerald-400"
            >
              <ShieldCheck className="w-4 h-4" />
            </motion.div>
            <motion.div 
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-2 -left-2 bg-blue-500/10 border border-blue-500/20 backdrop-blur-md p-2 rounded-full text-blue-400"
            >
              <Zap className="w-4 h-4" />
            </motion.div>
          </div>

          {/* Typography */}
          <h1 className="text-4xl md:text-5xl font-black font-heading text-white mb-4 tracking-tight">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--fab-amber))] to-orange-400">Upgrade</span>
          </h1>
          
          <div className="max-w-md mx-auto relative">
            <Sparkles className="absolute -left-6 top-0 w-4 h-4 text-white/20" />
            <Sparkles className="absolute -right-6 bottom-0 w-4 h-4 text-white/20" />
            <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed mb-10">
              {message || "We are currently optimizing our infrastructure to provide you with a faster, more reliable experience. We'll be back online shortly."}
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white hover:bg-slate-50 text-[hsl(var(--fab-navy))] font-bold rounded-2xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(255,255,255,0.2)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[hsl(var(--fab-navy))]/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            {isRetrying ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="tracking-wide">Checking Status...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                <span className="tracking-wide uppercase text-sm">Check Connection</span>
              </>
            )}
          </button>
        </motion.div>

        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-8 flex items-center gap-2 text-slate-500 text-sm font-medium"
        >
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
          Maintenance in progress
        </motion.div>
      </div>
    </div>
  );
}
