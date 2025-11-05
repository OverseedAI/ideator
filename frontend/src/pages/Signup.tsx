import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/common/Card";
import { useAuthRedirect, useSignup } from "@/hooks/queries/useAuth";
import { getErrorMessage } from "@/utils/error";

export const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const signupMutation = useSignup();
  useAuthRedirect({ requireAuth: false, redirectTo: "/app" });

  const errorMessage = signupMutation.error
    ? getErrorMessage(signupMutation.error, "Failed to sign up")
    : "";
  const isSubmitting = signupMutation.isPending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await signupMutation.mutateAsync({ email, password, name });
      navigate("/app");
    } catch (err) {
      console.error("Failed to sign up", err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Start evaluating your business ideas today</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{errorMessage}</div>
            )}

            <Input
              type="text"
              label="Name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              Sign up
            </Button>

            <p className="text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
