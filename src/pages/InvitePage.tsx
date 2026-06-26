import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import type { RootState } from "@/store";
import { joinGroup } from "@/services/api";
import SEOHead from "@/components/SEOHead";

const InvitePage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    if (!isAuthenticated) {
      // Not logged in — go to login page with invite token stored, no loader shown here
      navigate(`/login?invite=${token}`, { replace: true });
      return;
    }

    // User is already logged in — call joinGroup directly
    const handleJoin = async () => {
      setJoining(true);
      try {
        const result = await joinGroup(token);
        if (result.success || result.status === "success") {
          setTimeout(() => navigate("/dashboard", { replace: true }), 500);
        } else {
          setTimeout(() => navigate("/dashboard", { replace: true }), 500);
        }
      } catch (err: any) {
        setTimeout(() => navigate("/dashboard", { replace: true }), 500);
      } finally {
        setJoining(false);
      }
    };

    handleJoin();
  }, [token, isAuthenticated, navigate]);

  // Only show UI when user is authenticated and we're processing the join
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <SEOHead pageKey="/join" />
      <div className="w-full max-w-lg px-6">
        {joining && (
          <div className="text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 bg-amber-100 rounded-full animate-pulse" />
              <Loader2 className="absolute inset-0 m-auto w-12 h-12 text-amber-500 animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">
                Joining Group
              </h1>
              <p className="text-gray-600">
                Please wait while we add you to the group
              </p>
            </div>
            <div className="flex justify-center space-x-1">
              <div
                className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <div
                className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <div
                className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitePage;
