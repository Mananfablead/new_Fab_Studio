import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  sendOtp,
  verifyOtp,
  registerUser,
  loginWithPassword,
  checkPassword,
  clearError,
  forgotPassword,
  registerFace,
  checkFaceStatus,
} from "@/store/slices/authSlice";
import api, { joinGroup } from "@/services/api";
import { fetchGroups } from "@/store/slices/groupsSlice";
import type { AppDispatch, RootState } from "@/store";
import {
  Mail,
  Phone,
  ArrowRight,
  Camera,
  User,
  ChevronLeft,
  Loader2,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  requestNotificationPermission,
  onMessageListener,
} from "../notification";
import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
const professionalBg =
  "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920&q=80";
import fableadLogo from "@/assets/iamges/fabstudio_logo.png";
import SelfieCapture from "@/components/SelfieCapture";
import SEOHead from "@/components/SEOHead";

// ─── Country Data ─────────────────────────────────────────────────────────────
const COUNTRIES = [
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "AE", name: "UAE", dial: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { code: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { code: "PK", name: "Pakistan", dial: "+92", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", dial: "+880", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka", dial: "+94", flag: "🇱🇰" },
  { code: "NP", name: "Nepal", dial: "+977", flag: "🇳🇵" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
];

function detectCountryCode(): string {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const region = locale.split("-")[1]?.toUpperCase();
    const found = COUNTRIES.find((c) => c.code === region);
    return found?.dial ?? "+91";
  } catch {
    return "+91";
  }
}

// ─── Phone Input with Country Code ───────────────────────────────────────────
function PhoneInput({
  value,
  onChange,
  countryDial,
  onCountryChange,
  placeholder = "9876543210",
  className = "",
}: {
  value: string;
  onChange: (val: string) => void;
  countryDial: string;
  onCountryChange: (dial: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected =
    COUNTRIES.find((c) => c.dial === countryDial) ?? COUNTRIES[0];

  return (
    <div
      ref={ref}
      className={`flex rounded-xl overflow-visible border border-gray-300 bg-gray-50 focus-within:ring-2 focus-within:ring-[hsl(var(--fab-amber))] focus-within:border-transparent transition-all ${className}`}
    >
      {/* Country selector */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 px-3 py-3.5 border-r border-gray-300 text-gray-700 text-sm shrink-0 hover:bg-gray-100 transition-colors"
      >
        <span>{selected.flag}</span>
        <span className="font-mono text-xs">{selected.dial}</span>
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-12 w-56 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-2xl">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                onCountryChange(c.dial);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors ${c.dial === countryDial ? "bg-gray-100" : ""}`}
            >
              <span>{c.flag}</span>
              <span className="flex-1 text-left">{c.name}</span>
              <span className="font-mono text-xs text-gray-400">{c.dial}</span>
            </button>
          ))}
        </div>
      )}

      {/* Number input */}
      <input
        type="tel"
        value={value}
        onChange={(e) => {
          let v = e.target.value.replace(/\D/g, "");
          if (v.length > 10) v = v.slice(0, 10);
          onChange(v);
        }}
        placeholder={placeholder}
        className="flex-1 px-3 py-3.5 bg-transparent text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none"
      />
    </div>
  );
}

type InputMode = "email" | "phone";
type Step =
  | "input"
  | "otp"
  | "password"
  | "role"
  | "details"
  | "selfie"
  | "forgot-password";

// Animated Button Component
function AnimatedButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const baseStyles = `
    relative overflow-hidden w-full py-3.5 rounded-xl font-semibold text-sm
    transition-all duration-500 ease-out
    disabled:opacity-50 disabled:cursor-not-allowed
    before:content-[''] before:absolute before:left-[-50px] before:top-0
    before:w-0 before:h-full before:skew-x-12 before:-z-10 before:transition-all before:duration-500
    hover:before:w-[250%]
  `;

  const variants = {
    primary: `
      bg-[hsl(var(--fab-amber))] text-white
      hover:shadow-[0_0_30px_-5px_hsl(var(--fab-amber))]
      before:bg-orange-600
    `,
    secondary: `
      bg-white/10 text-white border border-white/30
      hover:bg-white/20 hover:border-white/50
      before:bg-white/20
    `,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const [inputMode, setInputMode] = useState<InputMode>("email");
  const [value, setValue] = useState("");
  const [countryDial, setCountryDial] = useState("+91");
  const [optionalCountryDial, setOptionalCountryDial] = useState("+91");
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [otp, setOtp] = useState("");
  const [selectedRole, setSelectedRole] = useState<
    "user" | "photographer" | null
  >(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [optionalField, setOptionalField] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState<"password" | "otp">("password");
  const [loginOtp, setLoginOtp] = useState("");
  const [localUserId, setLocalUserId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const {
    loading,
    otpLoading,
    error: apiError,
    otpUserId,
    isVerified,
    forgotPasswordLoading,
    forgotPasswordSuccess,
    isAuthenticated,
  } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // Handle invite token from URL — persist it so SetPasswordModal can use it after registration
  useEffect(() => {
    if (inviteToken) {
      localStorage.setItem("pendingInviteToken", inviteToken);
      console.log("Invite token saved:", inviteToken);
    }
  }, [inviteToken]);

  // Auto-fill OTP from localStorage if available
  useEffect(() => {
    if (step === "otp") {
      const storedOTP = localStorage.getItem("autoFillOTP");
      if (storedOTP) {
        console.log("Auto-filling OTP from localStorage:", storedOTP);
        setOtp(storedOTP);
        // Clear the stored OTP
        localStorage.removeItem("autoFillOTP");
      }
    }
  }, [step]);

  // Listen for OTP auto-fill event from notification
  useEffect(() => {
    const handleOTPAutoFill = (event: CustomEvent) => {
      const otp = event.detail?.otp;
      if (otp && step === "otp") {
        console.log("Auto-filling OTP from notification:", otp);
        setOtp(otp);
        // Clear the stored OTP
        localStorage.removeItem("autoFillOTP");
      }
    };

    window.addEventListener("otpAutoFill", handleOTPAutoFill);

    return () => {
      window.removeEventListener("otpAutoFill", handleOTPAutoFill);
    };
  }, [step]);
  useEffect(() => {
    const getFCMToken = async () => {
      try {
        if (messaging) {
          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
          });
          if (token) {
            setFcmToken(token);
            console.log("FCM Token for OTP:", token);
          }
        }
      } catch (error) {
        console.error("Error getting FCM token:", error);
      }
    };

    getFCMToken();
  }, []);

  // Start 30s countdown when OTP step is shown
  useEffect(() => {
    if (step === "otp") {
      setResendTimer(30);
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      dispatch(clearError());
      const payload =
        inputMode === "email"
          ? { email: value }
          : { phone: fullPhone, ...(fcmToken ? { fcm_token: fcmToken } : {}) };
      await dispatch(sendOtp(payload));
      // Restart countdown
      setResendTimer(30);
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error resending OTP:", error);
      // Error is already handled by Redux and will be displayed via apiError
    }
  };

  const validateInput = () => {
    if (inputMode === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setError("Please enter a valid email address");
        return false;
      }
    } else {
      const digits = value.replace(/\D/g, "");
      if (digits.length !== 10) {
        setError("Please enter exactly 10 digits");
        return false;
      }
    }
    setError("");
    return true;
  };

  // Full phone with country code for API
  const fullPhone = inputMode === "phone" ? `${countryDial}${value}` : "";

  const handleContinue = async () => {
    try {
      if (step === "input" && value) {
        if (!validateInput()) return;
        dispatch(clearError());
        const payload =
          inputMode === "email"
            ? { email: value }
            : {
                phone: fullPhone,
                ...(fcmToken ? { fcm_token: fcmToken } : {}),
              };
        const result = await dispatch(sendOtp(payload));
        if (sendOtp.fulfilled.match(result)) {
          // Extract user_id from response
          const uid =
            result.payload?.user_id ??
            result.payload?.userId ??
            result.payload?.data?.user_id ??
            result.payload?.data?.userId;
          if (uid) setLocalUserId(String(uid));

          // Check is_verified status directly from API response
          const isVerifiedValue =
            result.payload?.is_verified ?? result.payload?.data?.is_verified;
          console.log("sendOtp response:", result.payload);
          console.log("is_verified value:", isVerifiedValue);

          if (isVerifiedValue === 1 || isVerifiedValue === "1") {
            // User is verified (is_verified = 1) → show password screen
            console.log("Showing password screen");
            setLoginMode('password'); // always start with password field
            setLoginOtp('');
            setStep("password");
          } else {
            // New user or not verified → OTP screen
            console.log("Showing OTP screen");
            setStep("otp");
          }
        }
        // If sendOtp failed, stay on input screen (error will be shown)
      } else if (step === "otp" && otp.length >= 4) {
        dispatch(clearError());
        const payload =
          inputMode === "email"
            ? {
                email: value,
                otp,
                user_id: localUserId || otpUserId || undefined,
              }
            : {
                phone: fullPhone,
                otp,
                user_id: localUserId || otpUserId || undefined,
              };
        const result = await dispatch(verifyOtp(payload));
        if (verifyOtp.fulfilled.match(result)) {
          const resPayload = result.payload as any;
          const uid = resPayload?.user_id ?? resPayload?.data?.user_id;
          if (uid) setLocalUserId(String(uid));

          const user = resPayload?.user;
          if (user?.firstName && user?.lastName) {
            // Existing user login — check face status
            await dispatch(checkFaceStatus());
            // If invite token present, join the group first
            const token =
              inviteToken || localStorage.getItem("pendingInviteToken");
            if (token) {
              try {
                await joinGroup(token);
              } catch (_) {}
              localStorage.removeItem("pendingInviteToken");
            }
            // Refresh groups so dashboard shows latest data without reload
            dispatch(fetchGroups({}));
            navigate("/dashboard");
          } else {
            // New user or incomplete registration -> show role selection screen
            console.log("New user detected, showing role selection screen");
            setStep("role");
          }
        }
        // If verifyOtp failed, stay on otp screen (error will be shown)
      }
    } catch (error) {
      console.error("Unexpected error in handleContinue:", error);
      // Error is already handled by Redux and will be displayed via apiError
    }
  };

  const handlePasswordLogin = async () => {
    if (loginMode === "password" && !password) return;
    if (loginMode === "otp" && loginOtp.length < 4) return;
    try {
      dispatch(clearError());
      const base =
        inputMode === "email" ? { email: value } : { phone: fullPhone };
      const payload =
        loginMode === "password"
          ? { ...base, password, type: 1 as const }
          : { ...base, otp: loginOtp, type: 2 as const };
      const result = await dispatch(loginWithPassword(payload));
      if (loginWithPassword.fulfilled.match(result)) {
        await dispatch(checkFaceStatus());
        // If invite token present, join the group first
        const token = inviteToken || localStorage.getItem("pendingInviteToken");
        if (token) {
          try {
            await joinGroup(token);
          } catch (_) {}
          localStorage.removeItem("pendingInviteToken");
        }
        // Refresh groups so dashboard shows latest data without reload
        dispatch(fetchGroups({}));
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error in login:", error);
    }
  };

  const handleSendLoginOtp = async () => {
    try {
      dispatch(clearError());
      const payload =
        inputMode === "email"
          ? { email: value, type: 2 as const }
          : {
              phone: fullPhone,
              type: 2 as const,
              ...(fcmToken ? { fcm_token: fcmToken } : {}),
            };
      const result = await dispatch(sendOtp(payload));
      if (sendOtp.fulfilled.match(result)) {
        setLoginMode("otp");
        setLoginOtp("");
      }
    } catch (error) {
      console.error("Error sending login OTP:", error);
    }
  };

  const handleRoleContinue = () => {
    if (selectedRole) setStep("details");
  };

  const handleDetailsContinue = () => {
    if (firstName && lastName) {
      // Selfie only for users
      if (selectedRole === "user") {
        setStep("selfie");
      } else {
        handleComplete();
      }
    }
  };

  const handleComplete = async () => {
    dispatch(clearError());
    setError("");
    setPhoneError("");
    setEmailError("");

    let currentUserId = localUserId || otpUserId;

    // Call registerUser only if not already authenticated
    if (!isAuthenticated) {
      const result = await dispatch(
        registerUser({
          firstName,
          lastName,
          email: inputMode === "email" ? value : optionalField,
          phone:
            inputMode === "phone"
              ? fullPhone
              : optionalField
                ? `${optionalCountryDial}${optionalField}`
                : "",
          role: selectedRole!,
          otp,
          avatar: selfiePreview || undefined,
          user_id: localUserId || otpUserId || undefined,
        }),
      );

      if (!registerUser.fulfilled.match(result)) {
        // Extract phone and email specific errors from API response
        if (result.payload && typeof result.payload === "string") {
          const payload = result.payload as string;
          if (payload.toLowerCase().includes("phone")) {
            setPhoneError(payload);
          } else if (payload.toLowerCase().includes("email")) {
            setEmailError(payload);
          }
        }
        return; // Stop if registration failed
      }
      currentUserId = result.payload.user?.id || localUserId || otpUserId;
    }

    // Check if password is already set
    if (currentUserId) {
      await dispatch(checkPassword(String(currentUserId)));
    }

    // Register face for AI matching after successful registration
    if (selfiePreview) {
      try {
        const res = await fetch(selfiePreview);
        const blob = await res.blob();
        const file = new File([blob], "selfie.jpg", {
          type: blob.type || "image/jpeg",
        });

        const faceResult = await dispatch(registerFace({ selfie: file }));
        if (registerFace.rejected.match(faceResult)) {
          // If face registration fails, stay on the page and show error
          setError(
            (faceResult.payload as string) ||
              "Face registration failed. Please retake the selfie.",
          );
          return; // Stop registration process, don't navigate
        }
      } catch (err) {
        console.error("Failed to register face:", err);
        setError("Face registration failed. Please retake the selfie.");
        return; // Stop registration process, don't navigate
      }
    }

    // Check face registration status after successful registration
    await dispatch(checkFaceStatus());

    // If invite token present, join the group after registration
    const token = inviteToken || localStorage.getItem("pendingInviteToken");
    if (token) {
      try {
        await joinGroup(token);
      } catch (_) {}
      localStorage.removeItem("pendingInviteToken");
    }

    // Refresh groups so dashboard shows latest data without reload
    dispatch(fetchGroups({}));
    navigate("/dashboard");
  };

  const handleSetPassword = async () => {
    // Handled globally
  };

  const handleForgotPassword = async () => {
    if (!value) return;
    dispatch(clearError());
    const payload =
      inputMode === "email" ? { email: value } : { phone: fullPhone };
    await dispatch(forgotPassword(payload));
  };

  const goBack = () => {
    if (step === 'selfie') setStep('details');
    else if (step === 'details') setStep('role');
    else if (step === 'role') setStep('otp');
    else if (step === 'otp') setStep('input');
    else if (step === 'password') {
      setStep('input');
      setLoginMode('password'); // reset so password field shows next time
      setLoginOtp('');
      setPassword('');
    }
    else if (step === 'forgot-password') setStep('password');
  };

  const stepTitles: Record<Step, { title: string; desc: string }> = {
    input: {
      title: "Welcome back",
      desc: "Sign in to your account to continue",
    },
    otp: { title: "Verify your identity", desc: "Enter the code we sent you" },
    password: {
      title: "Welcome back!",
      desc: "Enter your password to sign in",
    },
    "forgot-password": {
      title: "Reset your password",
      desc: "We'll send you a reset link",
    },
    role: {
      title: "How will you use fab-photo?",
      desc: "This helps us personalize your experience",
    },
    details: {
      title: "Complete your profile",
      desc: "Just a few more details to get you started",
    },
    selfie: { title: "Add a profile photo", desc: "Help others recognize you" },
  };

  const stepProgress: Record<Step, number> = {
    input: 20,
    otp: 40,
    password: 40,
    "forgot-password": 40,
    role: 60,
    details: 80,
    selfie: 100,
  };

  return (
    <div className="min-h-screen flex">
      <SEOHead />
      {/* Full Screen Background - All Devices */}
      <div className="absolute inset-0">
        <img
          src={professionalBg}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-8 overflow-y-auto max-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md my-auto"
        >
          {/* Glass Card */}
          {/* <div className="bg-black/70 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl overflow-hidden"> */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden">
            {/* Header with Logo */}
            <div className="relative px-6 pt-8 pb-6 text-center">
              {/* Back to Website Button */}
              <button
                onClick={() => navigate("/home")}
                className="absolute top-5 left-6 z-20 text-xs font-medium text-gray-400 hover:text-[hsl(var(--fab-amber))] hover:underline transition-colors p-2 -ml-2 -mt-2"
              >
                Back to website
              </button>
              {/* Glow Effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/25 rounded-full blur-3xl" />
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-24 bg-orange-300/20 rounded-full blur-2xl" />

              <div className="relative">
                {/* Premium Logo Box */}
                <div className="mx-auto mb-5 w-fit">
                  <div
                    className="relative p-[2px] rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 cursor-pointer"
                    onClick={() => navigate("/home")}
                    title="Go to Home"
                  >
                    {/* Inner box */}
                    <div className="relative bg-white rounded-[14px] px-5 py-3 flex items-center justify-center overflow-hidden">
                      {/* Subtle shimmer layer */}
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 pointer-events-none" />
                      {/* Corner accents */}
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-400/60 rounded-tl-[14px]" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-400/60 rounded-tr-[14px]" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-400/60 rounded-bl-[14px]" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-400/60 rounded-br-[14px]" />
                      <img
                        src={fableadLogo}
                        alt="Fablead Logo"
                        className="relative h-16 w-auto object-contain"
                      />
                    </div>
                  </div>
                </div>
                <h1 className="text-2xl font-heading font-bold text-black mb-1">
                  {stepTitles[step].title}
                </h1>
                <p className="text-sm text-gray-500">{stepTitles[step].desc}</p>
              </div>
            </div>

            {/* Progress Bar */}
            {/* {(isNewUser || step !== 'input') && (
              <div className="px-6 mb-4">
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[hsl(var(--fab-amber))] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${stepProgress[step]}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                {isNewUser && (
                  <p className="text-xs text-white/50 mt-2 text-center">
                    Step {[...Object.keys(stepProgress)].indexOf(step) + 1} of 5
                  </p>
                )}
              </div>
            )} */}

            {/* Form Content */}
            <div className="px-6 pb-8">
              <AnimatePresence mode="wait">
                {step === "input" && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Toggle */}
                    <div className="flex gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200">
                      <button
                        onClick={() => {
                          setInputMode("email");
                          setValue("");
                          setError("");
                          dispatch(clearError());
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                          inputMode === "email"
                            ? "bg-[hsl(var(--fab-amber))] text-white shadow-lg"
                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        <Mail className="w-4 h-4" /> Email
                      </button>
                      <button
                        onClick={() => {
                          setInputMode("phone");
                          setValue("");
                          setError("");
                          dispatch(clearError());
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                          inputMode === "phone"
                            ? "bg-[hsl(var(--fab-amber))] text-white shadow-lg"
                            : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        <Phone className="w-4 h-4" /> Phone
                      </button>
                    </div>

                    {/* Input */}
                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-700">
                        {inputMode === "email"
                          ? "Email Address"
                          : "Phone Number"}
                      </label>
                      {inputMode === "email" ? (
                        <input
                          type="email"
                          value={value}
                          onChange={(e) => {
                            setValue(e.target.value);
                            if (error) setError("");
                          }}
                          placeholder="you@example.com"
                          className={`w-full px-4 py-3.5 rounded-xl bg-gray-50 border ${error ? "border-red-400 bg-red-50" : "border-gray-300"} text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 ${error ? "focus:ring-red-400" : "focus:ring-[hsl(var(--fab-amber))]"} focus:border-transparent transition-all`}
                        />
                      ) : (
                        <PhoneInput
                          value={value}
                          onChange={(v) => {
                            setValue(v);
                            if (error) setError("");
                          }}
                          countryDial={countryDial}
                          onCountryChange={setCountryDial}
                          placeholder="9876543210"
                          className={error ? "border-red-400 bg-red-50" : ""}
                        />
                      )}
                      {error && (
                        <p className="text-red-500 text-xs mt-2 ml-1">
                          {error}
                        </p>
                      )}
                    </div>

                    {apiError && (
                      <p className="text-red-500 text-xs text-center">
                        {apiError}
                      </p>
                    )}
                    <AnimatedButton
                      onClick={handleContinue}
                      disabled={!value || otpLoading}
                    >
                      {otpLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />{" "}
                          Please wait...
                        </>
                      ) : (
                        <>
                          Continue{" "}
                          <ArrowRight className="w-4 h-4 inline ml-1" />
                        </>
                      )}
                    </AnimatedButton>
                  </motion.div>
                )}

                {step === "otp" && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-sm text-gray-500">Code sent to</p>
                      <p className="font-medium text-gray-900 mt-1">{value}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-700">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="• • • • • •"
                        maxLength={6}
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-center tracking-[0.5em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))] focus:border-transparent transition-all"
                      />
                    </div>

                    {(apiError || error) && (
                      <p className="text-red-500 text-xs text-center">
                        {apiError || error}
                      </p>
                    )}

                    <AnimatedButton
                      onClick={handleContinue}
                      disabled={otp.length < 4 || loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />{" "}
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify & Continue{" "}
                          <ArrowRight className="w-4 h-4 inline ml-1" />
                        </>
                      )}
                    </AnimatedButton>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={goBack}
                        className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back
                      </button>
                      <button
                        onClick={handleResendOtp}
                        disabled={resendTimer > 0 || otpLoading}
                        className={`text-sm font-medium transition-colors ${resendTimer > 0 ? "text-gray-300 cursor-not-allowed" : "text-[hsl(var(--fab-amber))] hover:underline"}`}
                      >
                        {resendTimer > 0
                          ? `Resend OTP in ${resendTimer}s`
                          : "Resend OTP"}
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "password" && (
                  <motion.div
                    key="password"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <p className="text-sm text-gray-500">Signing in as</p>
                      <p className="font-medium text-gray-900 mt-1">{value}</p>
                    </div>

                    {/* Login mode toggle */}
                    {loginMode === "password" ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              dispatch(clearError());
                              setStep("forgot-password");
                            }}
                            className="text-xs text-[hsl(var(--fab-amber))] hover:underline font-medium transition-colors"
                          >
                            Forgot Password?
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handlePasswordLogin()
                            }
                            placeholder="Enter your password"
                            className="w-full px-4 py-3.5 pr-12 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))] focus:border-transparent transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={handleSendLoginOtp}
                          disabled={otpLoading}
                          className="mt-2 text-xs text-[hsl(var(--fab-amber))] hover:underline font-medium transition-colors disabled:opacity-50"
                        >
                          {otpLoading ? "Sending OTP..." : "Send OTP instead"}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            Enter OTP
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setLoginMode("password");
                              setPassword("");
                              dispatch(clearError());
                            }}
                            className="text-xs text-[hsl(var(--fab-amber))] hover:underline font-medium transition-colors"
                          >
                            Use Password instead
                          </button>
                        </div>
                        <input
                          type="text"
                          value={loginOtp}
                          onChange={(e) =>
                            setLoginOtp(
                              e.target.value.replace(/\D/g, "").slice(0, 6),
                            )
                          }
                          onKeyDown={(e) =>
                            e.key === "Enter" && handlePasswordLogin()
                          }
                          placeholder="• • • • • •"
                          maxLength={6}
                          className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 text-center tracking-[0.5em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))] focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-gray-400 mt-1.5 text-center">
                          OTP will be sent to your{" "}
                          {inputMode === "email" ? "email" : "phone"}
                        </p>
                      </div>
                    )}

                    {apiError && (
                      <p className="text-red-500 text-xs text-center">
                        {apiError}
                      </p>
                    )}

                    <AnimatedButton
                      onClick={handlePasswordLogin}
                      disabled={
                        (loginMode === "password"
                          ? !password
                          : loginOtp.length < 4) || loading
                      }
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />{" "}
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In <ArrowRight className="w-4 h-4 inline ml-1" />
                        </>
                      )}
                    </AnimatedButton>

                    <button
                      onClick={goBack}
                      className="w-full text-sm text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 py-2 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  </motion.div>
                )}

                {step === "forgot-password" && (
                  <motion.div
                    key="forgot-password"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {forgotPasswordSuccess ? (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                          <svg
                            className="w-8 h-8 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Reset link sent!
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Check your{" "}
                            {inputMode === "email" ? "email" : "phone"} for
                            instructions to reset your password.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            dispatch(clearError());
                            setStep("password");
                          }}
                          className="w-full text-sm text-[hsl(var(--fab-amber))] hover:underline font-medium py-2 transition-colors"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="text-center p-4 rounded-xl bg-gray-50 border border-gray-200">
                          <p className="text-sm text-gray-500">
                            We'll send a reset link to
                          </p>
                          <p className="font-medium text-gray-900 mt-1">
                            {value}
                          </p>
                        </div>

                        {apiError && (
                          <p className="text-red-500 text-xs text-center">
                            {apiError}
                          </p>
                        )}

                        <AnimatedButton
                          onClick={handleForgotPassword}
                          disabled={!value || forgotPasswordLoading}
                        >
                          {forgotPasswordLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />{" "}
                              Sending...
                            </>
                          ) : (
                            <>
                              Send Reset Link{" "}
                              <ArrowRight className="w-4 h-4 inline ml-1" />
                            </>
                          )}
                        </AnimatedButton>

                        <button
                          onClick={goBack}
                          className="w-full text-sm text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 py-2 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" /> Back to Sign In
                        </button>
                      </>
                    )}
                  </motion.div>
                )}

                {step === "role" && (
                  <motion.div
                    key="role"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <button
                      onClick={() => setSelectedRole("user")}
                      className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                        selectedRole === "user"
                          ? "border-[hsl(var(--fab-amber))] bg-[hsl(var(--fab-amber))]/10"
                          : "border-gray-200 hover:border-gray-300 bg-gray-50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-sm text-gray-900">
                          I'm a User
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Viewing & uploading photos
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedRole === "user"
                            ? "border-[hsl(var(--fab-amber))] bg-[hsl(var(--fab-amber))]"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedRole === "user" && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedRole("photographer")}
                      className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                        selectedRole === "photographer"
                          ? "border-[hsl(var(--fab-amber))] bg-[hsl(var(--fab-amber))]/10"
                          : "border-gray-200 hover:border-gray-300 bg-gray-50"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                        <Camera className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-sm text-gray-900">
                          I'm a Photographer
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Delivering photos professionally
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedRole === "photographer"
                            ? "border-[hsl(var(--fab-amber))] bg-[hsl(var(--fab-amber))]"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedRole === "photographer" && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </button>

                    <AnimatedButton
                      onClick={handleRoleContinue}
                      disabled={!selectedRole}
                    >
                      Continue <ArrowRight className="w-4 h-4 inline ml-1" />
                    </AnimatedButton>

                    <button
                      onClick={goBack}
                      className="w-full text-sm text-gray-500 hover:text-gray-800 text-center py-2"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}

                {step === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First name"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last name"
                          className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-gray-700">
                        {inputMode === "email"
                          ? "Phone (optional)"
                          : "Email (optional)"}
                      </label>
                      {inputMode === "email" ? (
                        <PhoneInput
                          value={optionalField}
                          onChange={(v) => {
                            setOptionalField(v);
                            if (phoneError) setPhoneError("");
                          }}
                          countryDial={optionalCountryDial}
                          onCountryChange={setOptionalCountryDial}
                          placeholder="9876543210"
                          className={
                            phoneError ? "border-red-400 bg-red-50" : ""
                          }
                        />
                      ) : (
                        <input
                          type="email"
                          value={optionalField}
                          onChange={(e) => {
                            setOptionalField(e.target.value);
                            if (emailError) setEmailError("");
                          }}
                          placeholder="you@example.com"
                          className={`w-full px-4 py-3 rounded-xl bg-gray-50 border ${emailError ? "border-red-400 bg-red-50" : "border-gray-300"} text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 ${emailError ? "focus:ring-red-400" : "focus:ring-[hsl(var(--fab-amber))]"} focus:border-transparent transition-all`}
                        />
                      )}
                      {phoneError && (
                        <p className="text-red-500 text-xs mt-2 ml-1">
                          {phoneError}
                        </p>
                      )}
                      {emailError && (
                        <p className="text-red-500 text-xs mt-2 ml-1">
                          {emailError}
                        </p>
                      )}
                    </div>
                    <AnimatedButton
                      onClick={handleDetailsContinue}
                      disabled={!firstName || !lastName || loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />{" "}
                          Please wait...
                        </>
                      ) : (
                        <>
                          Continue{" "}
                          <ArrowRight className="w-4 h-4 inline ml-1" />
                        </>
                      )}
                    </AnimatedButton>
                    <button
                      onClick={goBack}
                      className="w-full text-sm text-gray-500 hover:text-gray-800 text-center py-2"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}

                {step === "selfie" && (
                  <motion.div
                    key="selfie"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {!selfiePreview ? (
                      <>
                        <SelfieCapture
                          onCapture={(imageData) => {
                            setSelfiePreview(imageData);
                          }}
                          onCancel={() => goBack()}
                        />
                        <button
                          onClick={handleComplete}
                          disabled={loading}
                          className="w-full text-sm text-gray-400 hover:text-gray-600 text-center py-2 transition-colors"
                        >
                          Skip for now
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="relative aspect-[3/4] max-w-[200px] mx-auto rounded-xl overflow-hidden border-2 border-gray-200">
                          <img
                            src={selfiePreview}
                            alt="Captured selfie"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {(apiError || error) && (
                          <p className="text-red-500 text-xs text-center">
                            {apiError || error}
                          </p>
                        )}
                        <AnimatedButton
                          onClick={handleComplete}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />{" "}
                              Registering...
                            </>
                          ) : (
                            <>
                              Complete Registration{" "}
                              <ArrowRight className="w-4 h-4 inline ml-1" />
                            </>
                          )}
                        </AnimatedButton>
                        <button
                          onClick={() => setSelfiePreview(null)}
                          className="w-full text-sm text-gray-500 hover:text-gray-800 text-center py-2"
                        >
                          Retake Photo
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="text-center text-black text-xs mt-6 tracking-wide">
                © 2026{" "}
                <a
                  className="text-[hsl(var(--fab-amber))] hover:text-[hsl(var(--fab-amber))/80] transition-colors"
                  href="https://www.fableadtechnolabs.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Fablead Developers Technolab
                </a>
                . All rights reserved.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
