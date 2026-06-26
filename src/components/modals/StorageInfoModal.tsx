import { HardDrive, Image, Video, Folder, ArrowUp, ArrowDown, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface StorageInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface StorageStat {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  color: string;
}

export default function StorageInfoModal({ open, onOpenChange }: StorageInfoModalProps) {
  const storageStats: StorageStat[] = [
    {
      label: 'Storage Used',
      value: '0.00 GB',
      subtext: 'of 10 GB total',
      icon: <HardDrive className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Total Groups',
      value: '0',
      subtext: 'active groups',
      icon: <Folder className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-0 bg-transparent shadow-none scrollbar-hide [&>button]:text-white [&>button]:hover:text-[hsl(var(--fab-amber))] [&>button]:bg-white/10 [&>button]:hover:bg-white/20 [&>button]:rounded-full [&>button]:p-2 [&>button]:transition-colors [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Glass Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 bg-gradient-to-br from-[hsl(var(--fab-navy))] to-[hsl(var(--fab-navy))]/90">
            <div className="absolute top-0 right-0 w-32 sm:w-48 h-32 sm:h-48 bg-[hsl(var(--fab-amber))]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <DialogHeader className="relative">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[hsl(var(--fab-amber))] to-orange-500 flex items-center justify-center shadow-lg shrink-0">
                  <HardDrive className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg sm:text-xl font-heading font-bold text-white">
                    Storage Utilization
                  </DialogTitle>
                  <p className="text-white/70 text-xs sm:text-sm">Monitor your storage usage</p>
                </div>
              </div>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {storageStats.map((stat, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-xl sm:rounded-xl bg-gradient-to-br p-4 sm:p-5 group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10 group-hover:opacity-15 transition-opacity`} />
                  <div className="relative">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">{stat.label}</p>
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      <div>
                        <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-0.5">{stat.subtext}</p>
                      </div>
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md shrink-0`}>
                        <span className="text-white">{stat.icon}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Photos Section */}
            <div className="rounded-xl sm:rounded-xl border border-border p-4 sm:p-5 bg-muted/20">
              <div className="flex items-start sm:items-center justify-between gap-2 mb-3 sm:mb-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md shrink-0">
                    <Image className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base">Photos</h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Image storage breakdown</p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-semibold shrink-0">0 of 1,000</span>
              </div>

              <Progress value={0} className="h-2.5 mb-4 bg-muted" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <div className="rounded-xl sm:rounded-xl bg-white p-3 sm:p-4 border border-border">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-xs sm:text-sm font-medium">Standard Quality</span>
                    <span className="text-xs sm:text-sm font-bold">0</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500" /> 0 uploads
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500" /> 0 deletes
                    </span>
                  </div>
                </div>

                <div className="rounded-xl sm:rounded-xl bg-white p-3 sm:p-4 border border-border">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-xs sm:text-sm font-medium">High Res Quality</span>
                    <span className="text-xs sm:text-sm font-bold">0</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500" /> 0 uploads
                    </span>
                    <span className="flex items-center gap-1">
                      <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500" /> 0 deletes
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Videos Section */}
            <div className="rounded-xl sm:rounded-xl border border-border p-4 sm:p-5 bg-muted/20">
              <div className="flex items-start sm:items-center justify-between gap-2 mb-3 sm:mb-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md shrink-0">
                    <Video className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base">Videos</h4>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Video storage breakdown</p>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-semibold shrink-0">0 of 300 MB</span>
              </div>

              <Progress value={0} className="h-2.5 mb-4 bg-muted" />

              <div className="rounded-xl sm:rounded-xl bg-white p-3 sm:p-4 border border-border">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span className="text-xs sm:text-sm font-medium">Video Storage</span>
                  <span className="text-xs sm:text-sm font-bold">0 MB</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ArrowUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500" /> 0 MB uploads
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500" /> 0 MB deletes
                  </span>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-xl bg-[hsl(var(--fab-amber))]/10 border border-[hsl(var(--fab-amber))]/20">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[hsl(var(--fab-amber))] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                You can delete and re-upload up to <span className="font-semibold text-foreground">2,000 photos</span> and <span className="font-semibold text-foreground">600 MB</span> of videos.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
