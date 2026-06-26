import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Camera, Upload, X, Check, ShieldCheck, Sparkles } from "lucide-react";
import SelfieCapture from "@/components/SelfieCapture";
import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch } from "@/store";
import {
  fetchUserFullProfile,
  updateUserProfile,
} from "@/store/slices/authSlice";

interface ProfilePhotoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Mode = "selection" | "upload" | "camera";

export default function ProfilePhotoModal({
  open,
  onOpenChange,
}: ProfilePhotoModalProps) {
  const [mode, setMode] = useState<Mode>("selection");
  const [preview, setPreview] = useState<string | null>(null);
  const { updateAvatar } = useAuth();
  const dispatch = useAppDispatch();

  const handleCapture = (imageData: string) => {
    setPreview(imageData);
    setMode("upload");
  };

  const { user } = useAuth();

  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const [header, base64] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const ext = mime.split("/")[1] ?? "jpg";
    return new File([bytes], `${filename}.${ext}`, { type: mime });
  };

  const handleSave = async (isLiveScan: boolean = false) => {
    if (preview && user?.id) {
      try {
        const avatarFile = dataUrlToFile(preview, "avatar");
        const formData = new FormData();
        formData.append("avatar", avatarFile);

        const updatedProfile = await dispatch(
          updateUserProfile({ userId: String(user.id), payload: formData }),
        ).unwrap();
        const refreshedProfile = await dispatch(
          fetchUserFullProfile(String(user.id)),
        ).unwrap();
        const normalizedProfile =
          (refreshedProfile as any)?.user ??
          (refreshedProfile as any)?.data ??
          (updatedProfile as any)?.user ??
          (updatedProfile as any)?.data ??
          updatedProfile;
        const nextAvatar =
          normalizedProfile?.avatar ||
          normalizedProfile?.avatar_url ||
          normalizedProfile?.profile_image ||
          normalizedProfile?.profile_picture ||
          preview;

        updateAvatar(nextAvatar, isLiveScan);
      } catch (err) {
        console.error("Failed to persist avatar to backend:", err);
        return;
      }

      onOpenChange(false);
      setTimeout(() => {
        setMode("selection");
        setPreview(null);
      }, 300);
    }
  };

  const reset = () => {
    setMode("selection");
    setPreview(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setTimeout(reset, 300);
      }}
    >
      {/* <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-0 overflow-hidden"> */}
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-0 overflow-hidden [&>button]:text-white [&>button]:opacity-100 [&>button:hover]:text-white">
        <DialogHeader className="p-6 bg-gradient-to-br from-[hsl(var(--fab-navy))] to-[hsl(var(--fab-navy-light))] text-white">
          <DialogTitle className="text-xl font-heading font-bold flex items-center gap-2">
            {mode === "camera" ? (
              <ShieldCheck className="w-5 h-5 text-[hsl(var(--fab-amber))]" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
            {mode === "camera"
              ? "Face Scan Registration"
              : "Update Profile Photo"}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {mode === "camera"
              ? "Register your biometric data for facial recognition"
              : "Choose how you would like to update your photo"}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {mode === "selection" && (
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => setMode("camera")}
                className="group relative h-40 rounded-2xl border-2 border-[hsl(var(--fab-amber))]/30 bg-[hsl(var(--fab-amber))]/5 hover:bg-[hsl(var(--fab-amber))]/10 hover:border-[hsl(var(--fab-amber))]/50 transition-all flex flex-col items-center justify-center gap-3 overflow-hidden"
              >
                <div className="absolute top-2 right-2">
                  <Sparkles className="w-4 h-4 text-[hsl(var(--fab-amber))]" />
                </div>
                <div className="w-12 h-12 rounded-full bg-[hsl(var(--fab-amber))]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6 text-[hsl(var(--fab-amber))]" />
                </div>
                <div className="text-center px-2">
                  <span className="text-sm font-semibold block text-[hsl(var(--fab-amber))]">
                    Live Face Scan
                  </span>
                  <span className="text-[10px] text-[hsl(var(--fab-amber))]/70">
                    For Facial Recognition
                  </span>
                </div>
              </button>
            </div>
          )}

          {mode === "camera" && (
            <div className="relative">
              <SelfieCapture
                onCapture={handleCapture}
                onCancel={() => setMode("selection")}
              />
              <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Your biometric data is encrypted and used only for private
                  photo selection and event identification.
                </p>
              </div>
            </div>
          )}

          {mode === "upload" && preview && (
            <div className="space-y-6">
              <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-white shadow-xl">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    setPreview(null);
                    setMode("selection");
                  }}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <X className="w-8 h-8 !text-white" />
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setMode("selection")}
                  className="flex-1 py-3 rounded-xl border border-border font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(preview.startsWith("data:image"))}
                  className="flex-1 py-3 rounded-xl fab-gradient text-white font-medium hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Apply Photo
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
