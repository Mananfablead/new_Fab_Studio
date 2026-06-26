import { useRef, useState, useCallback, useEffect } from 'react';
import { X, Check, Camera } from 'lucide-react';

interface SelfieCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

export default function SelfieCapture({ onCapture, onCancel }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
      console.error('Error accessing camera:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmPhoto = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  }, [capturedImage, onCapture]);



  // Start camera on mount
  useEffect(() => {
    // Small delay to ensure component is fully mounted
    const timer = setTimeout(() => {
      startCamera();
    }, 100);
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera Preview or Captured Image */}
      <div className="relative aspect-[3/4] max-w-[280px] mx-auto rounded-xl overflow-hidden bg-black/50 border-2 border-white/20">
        {capturedImage ? (
          // Show captured image
          <img
            src={capturedImage}
            alt="Captured selfie"
            className="w-full h-full object-cover"
          />
        ) : (
          // Show camera preview
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            onLoadedMetadata={() => setIsStreaming(true)}
          />
        )}

        {/* Camera overlay UI */}
        {!capturedImage && (
          <>
            {/* Corner brackets for face guide */}
            <div className="absolute inset-8 border-2 border-white/30 rounded-xl pointer-events-none">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[hsl(var(--fab-amber))] -mt-0.5 -ml-0.5" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[hsl(var(--fab-amber))] -mt-0.5 -mr-0.5" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[hsl(var(--fab-amber))] -mb-0.5 -ml-0.5" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[hsl(var(--fab-amber))] -mb-0.5 -mr-0.5" />
            </div>

            {/* Face guide text */}
            <div className="absolute top-1 left-0 right-0 text-center">
              <p className="text-xs text-white/80 bg-black/40 inline-block px-3 py-1 rounded-full">
                Position your face in the frame
              </p>
            </div>

            {/* Camera controls */}
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
              <button
                onClick={onCancel}
                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <button
                onClick={capturePhoto}
                disabled={!isStreaming}
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center disabled:opacity-50 hover:scale-105 transition-transform bg-white/10"
              >
                <div className="w-14 h-14 rounded-full bg-[hsl(var(--fab-amber))] flex items-center justify-center">
                  <Camera className="w-7 h-7 text-white" />
                </div>
              </button>

              <div className="w-12 h-12" />
            </div>
          </>
        )}

        {/* Captured image controls */}
        {capturedImage && (
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
            <button
              onClick={retakePhoto}
              className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={confirmPhoto}
              className="w-16 h-16 rounded-full bg-[hsl(var(--fab-amber))] flex items-center justify-center text-white hover:scale-105 transition-transform"
            >
              <Check className="w-8 h-8" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
