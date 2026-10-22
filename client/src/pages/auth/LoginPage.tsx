import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useNavigate, Link, Navigate } from "react-router-dom";
import { login } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

import {
  loginSchema,
  type LoginFormData,
} from "../../lib/validations/auth";

import {
  Card,
  CardContent,
} from "../../components/ui/card";

import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

import { toast } from "sonner";

function LoginPage() {
  const navigate = useNavigate();
  const { login: saveToken, token, authLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  if (!authLoading && token) {
    return <Navigate to="/projects" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(data.email, data.password);
      saveToken(response.token);
      toast.success("Welcome back! Logged in successfully.");
      navigate("/projects");
    } catch (error) {
      console.error(error);
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs mb-1 mx-auto">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 3h5v5" />
                <path d="M8 21H3v-5" />
                <path d="M21 3l-7.5 7.5" />
                <path d="M3 21l7.5-7.5" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            </div>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Welcome to ContriFlow</h1>
          <p className="text-xs text-muted-foreground">Sign in to your team and project workspace</p>
        </div>

        <Card className="border border-border/70 shadow-sm bg-card">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-9 text-sm"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-9 text-sm"
                  autoComplete="current-password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full h-9 text-xs font-medium cursor-pointer" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-foreground hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;