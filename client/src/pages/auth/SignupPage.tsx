import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";

import { signup } from "../../services/auth.service";
import { signupSchema, type SignupFormData } from "../../lib/validations/auth";

import {
  Card,
  CardContent,
} from "../../components/ui/card";

import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

import { toast } from "sonner";

function SignupPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup(data.name, data.email, data.password);
      toast.success("Account created successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("Failed to sign up. User may already exist.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-foreground text-background flex items-center justify-center font-bold shadow-sm mb-1">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Create an account</h1>
          <p className="text-xs text-muted-foreground">Get started tracking project contributions</p>
        </div>

        <Card className="border border-border/70 shadow-sm bg-card">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-medium">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Alex Rivera"
                  className="h-9 text-sm"
                  autoComplete="name"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

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
                <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  className="h-9 text-sm"
                  autoComplete="new-password"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-rose-500 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full h-9 text-xs font-medium cursor-pointer" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;