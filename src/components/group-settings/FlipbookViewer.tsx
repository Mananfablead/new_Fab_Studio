import { useState, useRef, useEffect } from 'react';
import { 
  BookOpen,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Share2,
  Maximize,
  Minimize,
  Settings,
  Download,
  Music,
  Grid,
  Layout,
  Play,
  Pause,
  X,
  SkipBack,
  SkipForward
} from 'lucide-react';
import HTMLFlipBook from 'react-pageflip';
import { toast } from '@/hooks/use-toast';

interface FlipbookViewerProps {
  images: string[];
  title?: string;
  businessName?: string;
  logoUrl?: string | null;
  onClose?: () => void;
  autoPlayInterval?: number;
}

export default function FlipbookViewer({ 
  images, 
  title = 'Photo Album',
  businessName,
  logoUrl,
  onClose,
  autoPlayInterval = 3000
}: FlipbookViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [singlePageMode, setSinglePageMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const flipbookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalPages = images.length + 2; // +2 for cover and back cover

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayTimerRef.current = setInterval(() => {
        if (currentPage < totalPages - 1) {
          handleNextPage();
        } else {
          handleGoToFirstPage();
          setIsAutoPlaying(false); // Stop at the end or loop? Let's loop but maybe stop is safer.
          // For now, let's just go to first page and continue if loop is desired.
        }
      }, autoPlayInterval);
    } else {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    }

    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [isAutoPlaying, currentPage, totalPages]);

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
    toast({
      title: isAutoPlaying ? 'Auto Play Paused' : 'Auto Play Started',
      description: isAutoPlaying ? 'Automatic page turning stopped' : `Turning pages every ${autoPlayInterval / 1000} seconds`
    });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleNextPage = () => {
    if (flipbookRef.current) {
      flipbookRef.current.pageFlip().flipNext();
    }
  };

  const handlePrevPage = () => {
    if (flipbookRef.current) {
      flipbookRef.current.pageFlip().flipPrev();
    }
  };

  const handleGoToFirstPage = () => {
    if (flipbookRef.current) {
      flipbookRef.current.pageFlip().flip(0);
    }
  };

  const handleGoToLastPage = () => {
    if (flipbookRef.current) {
      flipbookRef.current.pageFlip().flip(totalPages - 1);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: 'Check out this amazing photo flipbook!',
        url: window.location.href,
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link copied to clipboard!' });
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard!' });
    }
  };

  const handleDownload = () => {
    toast({ 
      title: 'Download Started', 
      description: 'Your flipbook is being prepared for download.' 
    });
  };

  const toggleSinglePageMode = () => {
    setSinglePageMode(!singlePageMode);
    setShowSettings(false);
    toast({ 
      title: singlePageMode ? 'Double Page Mode' : 'Single Page Mode',
      description: `Switched to ${!singlePageMode ? 'single' : 'double'} page view`
    });
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    setShowSettings(false);
    toast({ 
      title: soundEnabled ? 'Sound Off' : 'Sound On',
      description: `Page flip sound ${!soundEnabled ? 'enabled' : 'disabled'}`
    });
  };

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      {/* Top Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className={`flex ${isMobile ? 'flex-wrap' : 'flex-wrap lg:flex-nowrap items-center'} justify-between px-3 md:px-4 py-2 md:py-3 gap-2`}>
          {/* Left - Title */}
          <div className="flex items-center gap-2 md:gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={businessName} className="w-5 h-5 md:w-6 md:h-6 object-contain rounded-md" />
            ) : (
              <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
            )}
            <h1 className="text-white font-semibold text-base md:text-lg truncate max-w-[120px] md:max-w-none">
              {businessName ? `${businessName} Flipbook Demo` : title}
            </h1>
            {onClose && (
              <button
                onClick={onClose}
                className="ml-2 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-1.5"
                title="Close Book"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            )}
          </div>

          {/* Center - Navigation */}
          <div className="flex items-center gap-1 md:gap-2 order-3 md:order-2 w-full md:w-auto justify-center md:mx-auto lg:mx-0">
            <button
              onClick={handleGoToFirstPage}
              className="p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-white/10 text-white transition-colors"
              title="First Page"
            >
              <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={handlePrevPage}
              className="p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-white/10 text-white transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Auto Play Button */}
            <button
              onClick={toggleAutoPlay}
              className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all ${isAutoPlaying ? 'bg-orange-500 text-white' : 'hover:bg-white/10 text-white'}`}
              title={isAutoPlaying ? 'Pause Auto Play' : 'Start Auto Play'}
            >
              {isAutoPlaying ? (
                <Pause className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <Play className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>

            <span className="text-white text-xs md:text-sm px-2 md:px-3 min-w-[60px] md:min-w-[80px] text-center">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              className="p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-white/10 text-white transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={handleGoToLastPage}
              className="p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-white/10 text-white transition-colors"
              title="Last Page"
            >
              <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Right - Controls */}
          <div className="flex items-center gap-1 md:gap-2 order-2 md:order-3">
            <button
              onClick={handleZoomOut}
              className="p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-white/10 text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <span className="text-white text-xs md:text-sm px-1 md:px-2 min-w-[40px] md:min-w-[50px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-white/10 text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            
            <div className="w-px h-5 md:h-6 bg-white/20 mx-0.5 md:mx-1 hidden md:block" />
            
            {/* <button
              onClick={handleShare}
              className="p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-white/10 text-white transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4 md:w-5 md:h-5" />
            </button> */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-white/10 text-white transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
            {/* <button
              onClick={handleDownload}
              className="p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-white/10 text-white transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4 md:w-5 md:h-5" />
            </button> */}
            
            {/* Settings Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-white/10 text-white transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              
              {showSettings && (
                <div className={`absolute top-full mt-2 ${isMobile ? '-right-12 w-56' : 'right-0 w-64'} bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50`}>
                  <div className="p-2">
                    <button
                      onClick={toggleSinglePageMode}
                      className="w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl hover:bg-white/10 text-white transition-colors min-w-0"
                    >
                      <Layout className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-xs md:text-sm font-medium truncate">{singlePageMode ? 'Double Page' : 'Single Page'}</div>
                        <div className="text-[10px] md:text-xs text-gray-400 truncate">Switch view mode</div>
                      </div>
                      <div className={`w-8 md:w-10 h-4 md:h-5 rounded-full transition-colors ${singlePageMode ? 'bg-orange-500' : 'bg-gray-600'} relative shrink-0`}>
                        <div className={`absolute top-0.5 w-3 md:w-4 h-3 md:h-4 rounded-full bg-white transition-transform ${singlePageMode ? 'left-4 md:left-5' : 'left-0.5'}`} />
                      </div>
                    </button>
                    
                    <button
                      onClick={toggleSound}
                      className="w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl hover:bg-white/10 text-white transition-colors min-w-0"
                    >
                      <Music className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-xs md:text-sm font-medium truncate">{soundEnabled ? 'Sound On' : 'Sound Off'}</div>
                        <div className="text-[10px] md:text-xs text-gray-400 truncate">Page flip sound</div>
                      </div>
                      <div className={`w-8 md:w-10 h-4 md:h-5 rounded-full transition-colors ${soundEnabled ? 'bg-orange-500' : 'bg-gray-600'} relative shrink-0`}>
                        <div className={`absolute top-0.5 w-3 md:w-4 h-3 md:h-4 rounded-full bg-white transition-transform ${soundEnabled ? 'left-4 md:left-5' : 'left-0.5'}`} />
                      </div>
                    </button>
                    
                    <div className="border-t border-white/10 my-1" />
                    
                    <button
                      onClick={handleGoToFirstPage}
                      className="w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl hover:bg-white/10 text-white transition-colors min-w-0"
                    >
                      <SkipBack className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                      <div className="text-xs md:text-sm truncate">Go to First Page</div>
                    </button>
                    
                    <button
                      onClick={handleGoToLastPage}
                      className="w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl hover:bg-white/10 text-white transition-colors min-w-0"
                    >
                      <SkipForward className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
                      <div className="text-xs md:text-sm truncate">Go to Last Page</div>
                    </button>
                    
                    {/* <div className="border-t border-white/10 my-1" />
                    
                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 md:py-2.5 rounded-lg md:rounded-xl hover:bg-white/10 text-white transition-colors"
                    >
                      <Download className="w-4 h-4 md:w-5 md:h-5" />
                      <div className="text-xs md:text-sm">Download Flipbook</div>
                    </button> */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Flipbook Content */}
      <div className={`flex-1 flex items-center justify-center ${isMobile ? 'p-2 pt-16 pb-2' : 'p-8 pt-20 pb-4'}`}>
        <div 
          style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease' }}
          className="origin-center"
        >
          <HTMLFlipBook
            ref={flipbookRef}
            width={isMobile ? (singlePageMode ? 320 : 280) : (singlePageMode ? 500 : 500)}
            height={isMobile ? 450 : 600}
            size="stretch"
            minWidth={isMobile ? 280 : 300}
            maxWidth={isMobile ? 400 : 1000}
            minHeight={isMobile ? 350 : 400}
            maxHeight={isMobile ? 600 : 1200}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            className="mx-auto"
            style={{}}
            startPage={0}
            drawShadow={true}
            flippingTime={isMobile ? 800 : 1000}
            usePortrait={isMobile ? true : singlePageMode}
            startZIndex={0}
            autoSize={true}
            clickEventForward={true}
            useMouseEvents={true}
            swipeDistance={isMobile ? 20 : 30}
            showPageCorners={true}
            disableFlipByClick={false}
            onFlip={(e: any) => setCurrentPage(e.data)}
          >
            {/* Cover Page */}
            <div className={`bg-gradient-to-br from-orange-500 to-orange-600 flex flex-col items-center justify-center text-center text-white ${isMobile ? 'p-6' : 'p-12'}`}>
              {logoUrl ? (
                <img src={logoUrl} alt={businessName} className={`${isMobile ? 'w-16 h-16 mb-4' : 'w-24 h-24 mb-6'} object-contain brightness-0 invert`} />
              ) : (
                <BookOpen className={`${isMobile ? 'w-16 h-16 mb-4' : 'w-24 h-24 mb-6'}`} />
              )}
              <h2 className={`${isMobile ? 'text-2xl mb-2' : 'text-4xl font-bold mb-3'}`}>
                {businessName ? `${businessName} Flipbook Demo` : title}
              </h2>
              <p className={`${isMobile ? 'text-sm' : 'text-lg'} opacity-90`}>Your memories in a digital flipbook</p>
              <p className={`${isMobile ? 'text-xs mt-2' : 'text-sm mt-4'} opacity-75`}>{images.length} Beautiful Moments</p>
            </div>

            {/* Photo Pages */}
            {images.map((photoUrl, index) => (
              <div key={index} className="flex flex-col items-center justify-center bg-white">
                <img
                  src={`${photoUrl}?w=${isMobile ? 400 : 800}&h=${isMobile ? 450 : 600}&fit=crop`}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
            ))}

            {/* Back Cover */}
            <div className={`bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center text-center text-white ${isMobile ? 'p-6' : 'p-12'}`}>
              <h3 className={`${isMobile ? 'text-xl mb-2' : 'text-3xl font-bold mb-3'}`}>The End</h3>
              <p className={`${isMobile ? 'text-sm mb-1' : 'text-lg opacity-90 mb-2'}`}>Thank you for viewing</p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm opacity-75'}`}>{images.length} Memories Preserved</p>
              <BookOpen className={`${isMobile ? 'w-12 h-12 mt-4' : 'w-16 h-16 mt-6'} opacity-50`} />
            </div>
          </HTMLFlipBook>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-white/10 px-3 md:px-4 py-1.5 md:py-2">
        <div className="flex items-center justify-between text-[10px] md:text-xs text-white/70">
          <span className="truncate">{isMobile ? 'Swipe to flip pages' : 'Use arrow keys or drag corners to flip pages'}</span>
          <span className="ml-2">Page {currentPage + 1} of {totalPages}</span>
        </div>
      </div>
    </div>
  );
}
