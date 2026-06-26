import { useState, useEffect, useMemo } from "react";
import {
  HardDrive,
  CreditCard,
  Plus,
  Eye,
  Camera,
  ShieldCheck,
  Sparkles,
  Loader2,
  KeyRound,
  EyeOff,
  Share2,
  Video,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserFullProfile,
  updateUserProfile,
  changePassword,
} from "@/store/slices/authSlice";
import { useUserFullProfile } from "@/hooks/useUserFullProfile";
import { toast } from "sonner";
import type { RootState } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchPlans } from "@/store/slices/plansSlice";
import { selectActivePlan, selectPlansLoading } from "@/store/selectors";
import SubscriptionPlansModal from "@/components/modals/SubscriptionPlansModal";
import AddFeaturesModal from "@/components/modals/AddFeaturesModal";
import StorageInfoModal from "@/components/modals/StorageInfoModal";
import ProfilePhotoModal from "@/components/modals/ProfilePhotoModal";
import PhoneInput, {
  splitPhone,
  detectCountryDial,
} from "@/components/ui/PhoneInput";

export default function ProfileSettings() {
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [showStorageInfoModal, setShowStorageInfoModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useUserFullProfile();
  const activePlan = useAppSelector(selectActivePlan);
  const plansLoading = useAppSelector(selectPlansLoading);
  const resolvedRole = user?.role === "admin" ? "photographer" : user?.role;

  const socialLinks = useMemo(() => {
    const raw = user?.business?.socialLinks;
    if (!raw) return [] as { platform: string; url: string }[];
    if (Array.isArray(raw)) {
      return raw
        .map((link) => ({
          platform: String(link.platform || link.name || '').trim().toLowerCase(),
          url: String(link.url || link.value || link.link || '').trim(),
        }))
        .filter((link) => link.platform && link.url);
    }

    return Object.entries(raw)
      .map(([platform, url]) => ({
        platform: String(platform).trim().toLowerCase(),
        url: String(url || '').trim(),
      }))
      .filter((link) => link.platform && link.url);
  }, [user?.business?.socialLinks]);

  const getSocialLinkUrl = (platform: string, url: string) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return '';
    if (/^https?:\/\//i.test(trimmedUrl)) return trimmedUrl;
    switch (platform) {
      case 'instagram':
        return `https://instagram.com/${trimmedUrl.replace(/^@/, '')}`;
      case 'facebook':
        return `https://facebook.com/${trimmedUrl.replace(/^@/, '')}`;
      case 'twitter':
        return `https://twitter.com/${trimmedUrl.replace(/^@/, '')}`;
      case 'youtube':
        return `https://youtube.com/${trimmedUrl}`;
      case 'whatsapp':
        return `https://wa.me/${trimmedUrl.replace(/\D/g, '')}`;
      default:
        return trimmedUrl;
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return Share2;
      case 'facebook':
        return Share2;
      case 'twitter':
        return Share2;
      case 'youtube':
        return Video;
      case 'whatsapp':
        return Send;
      default:
        return Share2;
    }
  };

  // Fetch plans on mount so the active plan card is populated
  useEffect(() => {
    if (resolvedRole === "user" || resolvedRole === "photographer") {
      dispatch(fetchPlans(resolvedRole));
    }
  }, [dispatch, resolvedRole]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryDial, setCountryDial] = useState(detectCountryDial());
  const [isSaving, setIsSaving] = useState(false);

  // Validation errors
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const validateEmail = (value: string) => {
    if (!value) return "Email is required";
    // Strict: localpart@domain.tld — TLD must be 2-6 alpha chars only, no trailing characters
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(value.trim()))
      return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (value: string) => {
    if (!value) return "Phone number is required";
    if (value.replace(/\D/g, "").length < 7)
      return "Please enter a valid phone number";
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Block spaces anywhere in email
    if (val.includes(" ")) return;
    setEmail(val);
    setEmailError(validateEmail(val));
  };

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      // Split stored phone (e.g. "+919876543210") into dial + number
      const { dial, number } = splitPhone(
        user.phone || "",
        detectCountryDial(),
      );
      setCountryDial(dial);
      setPhone(number);
      setEmailError("");
      setPhoneError("");
    }
  }, [user]);

  const handleSaveChanges = async () => {
    if (!user?.id) return;

    // Run validation before saving
    const emailErr = validateEmail(email);
    const phoneErr = validatePhone(phone);
    setEmailError(emailErr);
    setPhoneError(phoneErr);
    if (emailErr || phoneErr) return;

    setIsSaving(true);
    try {
      const result = await dispatch(
        updateUserProfile({
          userId: user.id,
          payload: {
            firstName,
            lastName,
            email,
            phone: `${countryDial}${phone}`,
            name: `${firstName} ${lastName}`.trim(),
          },
        }),
      );

      if (updateUserProfile.fulfilled.match(result)) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error((result.payload as string) || "Failed to update profile");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    setIsChangingPassword(true);
    try {
      const result = await dispatch(
        changePassword({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      );

      if (changePassword.fulfilled.match(result)) {
        toast.success(
          result.payload?.message || "Password changed successfully!",
        );
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error((result.payload as string) || "Failed to change password");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Show loading state while fetching profile
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state if API call fails
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => user?.id && dispatch(fetchUserFullProfile(user.id))}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Profile Form */}
        <div className="bg-card rounded-xl border border-border fab-shadow p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[hsl(var(--fab-amber))] to-[hsl(var(--fab-navy))] p-[2px] shadow-lg group-hover:shadow-[hsl(var(--fab-amber))]/20 transition-all duration-500">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                  {user?.avatar &&
                  (user.avatar.startsWith("data:image") ||
                    user.avatar.startsWith("http") ||
                    user.avatar.includes("/") ||
                    user.avatar.includes(".")) ? (
                    <img
                      src={
                        user.avatar.startsWith("http") ||
                        user.avatar.startsWith("data:")
                          ? user.avatar
                          : `${import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || ""}/${user.avatar}`
                      }
                      alt={user.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-2xl font-bold bg-gradient-to-br from-[hsl(var(--fab-amber))] to-[hsl(var(--fab-navy))] bg-clip-text text-transparent">
                      {user?.avatar ||
                        (user?.name
                          ? user.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                          : "U")}
                    </span>
                  )}
                  <button
                    onClick={() => setShowPhotoModal(true)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowPhotoModal(true)}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[hsl(var(--fab-amber))] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-4 border-white"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-heading font-bold">{user?.name}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                {user?.facialRecognitionRegistered && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    Facial Recognition Registered
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowPhotoModal(true)}
                className="mt-3 text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[hsl(var(--fab-amber))]" />
                Change Profile Photo
              </button>
            </div>
          </div>

          {/* Grid Layout: Personal Info (Left) and Business Info (Right) */}
          <div
            className={`grid grid-cols-1 gap-8 ${user?.role !== "user" ? "lg:grid-cols-2 lg:divide-x lg:divide-border" : ""}`}
          >
            {/* Personal Information */}
            <div className={user?.role !== "user" ? "lg:pr-8" : ""}>
              <h2 className="font-heading font-semibold mb-4 pt-4 border-t border-border">
                Personal Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      First Name
                    </label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Last Name
                    </label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={handleEmailChange}
                    type="email"
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring ${emailError ? "border-red-500 focus:ring-red-400" : "border-input"}`}
                  />
                  {emailError && (
                    <p className="text-xs text-red-500 mt-1.5">{emailError}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Phone
                  </label>
                  <PhoneInput
                    value={phone}
                    onChange={(val) => {
                      setPhone(val);
                      setPhoneError(validatePhone(val));
                    }}
                    countryDial={countryDial}
                    onCountryChange={setCountryDial}
                    wrapperClassName={phoneError ? "border-red-500" : ""}
                  />
                  {phoneError && (
                    <p className="text-xs text-red-500 mt-1.5">{phoneError}</p>
                  )}
                </div>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl fab-gradient text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>

            {/* Business Information — only for photographers and admins */}
            {user?.business && user?.role !== "user" && (
              <div className="lg:pl-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--fab-amber))]/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[hsl(var(--fab-amber))]" />
                    </div>
                    <h3 className="font-heading font-semibold">
                      Business Information
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/settings/branding')}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                  >
                    {user?.business ? 'Edit Branding' : 'Add Branding'}
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Business Name
                    </label>
                    <p className="text-sm font-medium mt-1">
                      {user.business.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Business Email
                    </label>
                    <p className="text-sm font-medium mt-1">
                      {user.business.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">
                      Business Phone
                    </label>
                    <p className="text-sm font-medium mt-1">
                      {user.business.phone}
                    </p>
                  </div>
                  {user.business.website && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Website
                      </label>
                      <a
                        href={user.business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium mt-1 text-primary hover:underline block"
                      >
                        {user.business.website}
                      </a>
                    </div>
                  )}
                  {socialLinks.length > 0 && (
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Social Links
                      </label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {socialLinks.map((link) => {
                          const href = getSocialLinkUrl(link.platform, link.url);
                          if (!href) return null;
                          const Icon = getSocialIcon(link.platform);
                          return (
                            <a
                              key={link.platform}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:opacity-90 transition-opacity"
                            >
                              <Icon className="w-4 h-4" />
                              {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Change Password Section */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[hsl(var(--fab-amber))]/10 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-[hsl(var(--fab-amber))]" />
              </div>
              <h2 className="font-heading font-semibold">Change Password</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {confirmPassword &&
                  newPassword &&
                  confirmPassword !== newPassword && (
                    <p className="text-xs text-red-500 mt-1.5">
                      Passwords do not match
                    </p>
                  )}
              </div>
            </div>
            <button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="mt-4 px-6 py-3 rounded-xl fab-gradient text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isChangingPassword && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Update Password
            </button>
          </div>
        </div>

        {/* Right - Storage, Subscription & Additional Info */}
        <div className="space-y-6"></div>
      </div>

      {/* Modals */}
      <SubscriptionPlansModal
        open={showPlansModal}
        onOpenChange={setShowPlansModal}
      />
      <AddFeaturesModal
        open={showFeaturesModal}
        onOpenChange={setShowFeaturesModal}
      />
      <StorageInfoModal
        open={showStorageInfoModal}
        onOpenChange={setShowStorageInfoModal}
      />
      <ProfilePhotoModal
        open={showPhotoModal}
        onOpenChange={setShowPhotoModal}
      />
    </>
  );
}
