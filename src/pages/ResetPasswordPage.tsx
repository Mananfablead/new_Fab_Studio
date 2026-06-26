import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearError } from "@/store/slices/authSlice";
import type { AppDispatch, RootState } from "@/store";
import { ArrowRight, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import fableadLogo from "@/assets/iamges/fabstudio_logo.png";
import SEOHead from "@/components/SEOHead";

const professionalBg =
  "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1920&q=80";

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

export default function ResetPasswordPage() {
  const { userId, token } = useParams<{ userId: string; token: string }>();
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    password?: string;
    confirm?: string;
  }>({});

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error: apiError } = useSelector(
    (state: RootState) => state.auth,
  );
  const navigate = useNavigate();

  // No need to validate here - if route matched, params will exist
  // If they don't exist, React Router won't match this route

  const validatePasswords = () => {
    const errors: { password?: string; confirm?: string } = {};

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      errors.confirm = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirm = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validatePasswords() || !userId) return;

    try {
      dispatch(clearError());

      // Debug logging
      const payload = {
        user_id: userId,
        password,
        confirm_password: confirmPassword,
        token: token || "",
      };
      console.log("Sending payload:", payload);

      const result = await dispatch(resetPassword(payload));

      if (resetPassword.fulfilled.match(result)) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err) {
      console.error("Error resetting password:", err);
    }
  };

  return (
    <div className="min-h-screen flex">
      <SEOHead pageKey="/reset-password" />
      {/* Full Screen Background */}
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xl overflow-hidden">
            {/* Header with Logo */}
            <div className="relative px-6 pt-8 pb-6 text-center">
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
                  {success
                    ? "Password Reset Successfully"
                    : "Reset Your Password"}
                </h1>
                <p className="text-sm text-gray-500">
                  {success
                    ? "Your password has been updated. Redirecting to login..."
                    : "Create a new password for your account"}
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="px-6 pb-8">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">All set!</p>
                    <p className="text-sm text-gray-500 mt-1">
                      You can now sign in with your new password.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full text-sm text-[hsl(var(--fab-amber))] hover:underline font-medium py-2 transition-colors"
                  >
                    Go to Sign In
                  </button>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                    <svg
                      className="w-8 h-8 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Invalid Reset Link
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{error}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Password Field */}
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPasswordValue(e.target.value);
                          if (validationErrors.password)
                            setValidationErrors({
                              ...validationErrors,
                              password: undefined,
                            });
                        }}
                        placeholder="Enter new password"
                        className={`w-full px-4 py-3.5 rounded-xl bg-gray-50 border ${validationErrors.password ? "border-red-400 bg-red-50" : "border-gray-300"} text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 ${validationErrors.password ? "focus:ring-red-400" : "focus:ring-[hsl(var(--fab-amber))]"} focus:border-transparent transition-all pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-red-500 text-xs mt-2 ml-1">
                        {validationErrors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label className="text-sm font-medium mb-2 block text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (validationErrors.confirm)
                            setValidationErrors({
                              ...validationErrors,
                              confirm: undefined,
                            });
                        }}
                        placeholder="Confirm new password"
                        className={`w-full px-4 py-3.5 rounded-xl bg-gray-50 border ${validationErrors.confirm ? "border-red-400 bg-red-50" : "border-gray-300"} text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 ${validationErrors.confirm ? "focus:ring-red-400" : "focus:ring-[hsl(var(--fab-amber))]"} focus:border-transparent transition-all pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {validationErrors.confirm && (
                      <p className="text-red-500 text-xs mt-2 ml-1">
                        {validationErrors.confirm}
                      </p>
                    )}
                  </div>

                  {apiError && (
                    <p className="text-red-500 text-xs text-center">
                      {apiError}
                    </p>
                  )}

                  <AnimatedButton
                    onClick={handleResetPassword}
                    disabled={!password || !confirmPassword || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />{" "}
                        Resetting...
                      </>
                    ) : (
                      <>
                        Reset Password{" "}
                        <ArrowRight className="w-4 h-4 inline ml-1" />
                      </>
                    )}
                  </AnimatedButton>
                </motion.div>
              )}
            </div>

            <p className="text-center text-black text-xs pb-6 tracking-wide">
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
        </motion.div>
      </div>
    </div>
  );
}
