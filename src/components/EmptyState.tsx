import { Plus, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  user: { firstName?: string } | null;
  onJoinClick: () => void;
  onCreateClick: () => void;
}

export default function EmptyState({ user, onJoinClick, onCreateClick }: EmptyStateProps) {
  return (
    <div className="relative flex items-center justify-center min-h-screen px-8 lg:px-16 overflow-hidden">
      {/* Full Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1920&q=80" 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-[hsl(var(--fab-navy))]/75 to-[hsl(var(--fab-amber))]/60" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-left"
          >
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white"
            >
              Welcome,{" "}
              <span className="bg-gradient-to-r from-[hsl(var(--fab-amber))] to-yellow-400 bg-clip-text text-transparent">
                {user?.firstName || "User"}!
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed"
            >
              Start by creating a new group or joining an existing one to share and organize your photos effortlessly.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={onJoinClick}
                className="group relative px-10 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold text-base shadow-xl hover:bg-white/20 hover:border-white/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 min-w-[220px] justify-center overflow-hidden"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10">Join a Group</span>
              </button>

              <button
                onClick={onCreateClick}
                className="group relative px-10 py-4 bg-gradient-to-r from-[hsl(var(--fab-amber))] to-orange-500 text-white rounded-xl font-semibold text-base shadow-xl shadow-[hsl(var(--fab-amber))]/40 hover:shadow-2xl hover:shadow-[hsl(var(--fab-amber))]/50 hover:-translate-y-1 hover:scale-105 transition-all duration-300 flex items-center gap-3 min-w-[220px] justify-center overflow-hidden"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10">Create a Group</span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Side - Decorative Floating Images */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            className="hidden lg:flex justify-center items-center gap-6"
          >
            <div className="flex flex-col gap-6">
              <motion.img
                src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 0.7 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="h-48 w-36 object-cover rounded-2xl shadow-2xl"
              />
              <motion.img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 0.7 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="h-48 w-36 object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex flex-col gap-6 mt-12">
              <motion.img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?w=200"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 0.7 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="h-48 w-36 object-cover rounded-2xl shadow-2xl"
              />
              <motion.img
                src="https://images.unsplash.com/photo-1555255707-c07966088b7b?w=200"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 0.7 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="h-48 w-36 object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

