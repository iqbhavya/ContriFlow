
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, Navigate } from "react-router-dom";

import { signup, verifyOtp } from "../../services/auth.service";
import {
  signupSchema,
  type SignupFormData,
} from "../../lib/validations/auth";
import { useAuth } from "../../context/AuthContext";

import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

import { toast } from "sonner";
import ContriFlowLogo from "../../components/common/ContriFlowLogo";

function SignupPage() {
  const navigate = useNavigate();
  const { token, authLoading } = useAuth();

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  if (!authLoading && token) {
    return <Navigate to="/projects" replace />;
  }

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup(data.name, data.email, data.password);

      setEmail(data.email.trim().toLowerCase());
      setOtpSent(true);

      toast.success("OTP sent to your Gmail address.");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to send OTP."
      );
    }
  };

  const onVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter a valid 6-digit OTP.");
      return;
    }

    try {
      await verifyOtp(email, otp);

      toast.success("Email verified! Account created successfully.");
      navigate("/login");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "OTP verification failed."
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link
            to="/"
            className="inline-block hover:opacity-90 transition-opacity"
          >
            <ContriFlowLogo className="w-10 h-10 mb-1 mx-auto" />
          </Link>

          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {otpSent ? "Verify your email" : "Create an account"}
          </h1>

          <p className="text-xs text-muted-foreground">
            {otpSent
              ? `Enter the 6-digit code sent to ${email}`
              : "Get started tracking project contributions"}
          </p>
        </div>

        <Card className="border border-border/70 shadow-sm bg-card">
          <CardContent className="pt-6">
            {!otpSent ? (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium">
                    Full name
                  </Label>
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
                  <Label htmlFor="email" className="text-xs font-medium">
                    Gmail address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@gmail.com"
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
                  <Label htmlFor="password" className="text-xs font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="At least 8 characters"
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

                <Button
                  type="submit"
                  className="w-full h-9 text-xs font-medium cursor-pointer"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending OTP..." : "Send verification code"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp" className="text-xs font-medium">
                    Verification code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="h-9 text-sm tracking-widest"
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                  />
                </div>

                <Button
                  type="button"
                  className="w-full h-9 text-xs font-medium cursor-pointer"
                  disabled={isSubmitting || otp.length !== 6}
                  onClick={onVerifyOtp}
                >
                  Verify OTP
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-9 text-xs"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                  }}
                >
                  Back to signup
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-foreground hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
