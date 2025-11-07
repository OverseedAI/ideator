import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import * as authService from "@/services/authService";
import { authStorage } from "@/lib/authStorage";
import toast from "react-hot-toast";

export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");

        // Handle user cancellation
        if (error) {
          if (error === "access_denied") {
            toast.error("Google sign-in was cancelled");
            navigate("/login");
            return;
          }
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error("Missing authorization code or state");
        }

        // Verify state
        const storedState = sessionStorage.getItem("oauth_state");
        if (!storedState || storedState !== state) {
          throw new Error("Invalid state parameter. Possible CSRF attack.");
        }

        // Clean up stored state
        sessionStorage.removeItem("oauth_state");

        // Handle the callback
        const result = await authService.handleGoogleCallback(code, state);

        // Store token
        authStorage.setToken(result.token);

        setStatus("success");

        // Show appropriate success message
        if (result.accountLinked) {
          toast.success("Google account linked successfully!");
        } else if (result.isNewUser) {
          toast.success("Welcome! Your account has been created.");
        } else {
          toast.success("Welcome back!");
        }

        // Redirect to app
        setTimeout(() => {
          navigate("/app", { replace: true });
        }, 1000);
      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        const message =
          error instanceof Error ? error.message : "Failed to complete Google sign-in";
        setErrorMessage(message);
        toast.error(message);

        // Redirect to login after error
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {status === "processing" && "Completing sign-in..."}
            {status === "success" && "Success!"}
            {status === "error" && "Sign-in Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "processing" && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-text-secondary">
                Please wait while we complete your sign-in...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-sm text-text-secondary">Redirecting to your dashboard...</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
              <p className="text-xs text-text-secondary">Redirecting to login...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
