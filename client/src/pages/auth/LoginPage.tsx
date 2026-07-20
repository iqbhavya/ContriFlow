import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

import {
  loginSchema,
  type LoginFormData,
} from "../../lib/validations/auth";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

import { toast } from "sonner";

function LoginPage() {

  const navigate = useNavigate();

  const { login: saveToken } = useAuth();


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await login(
        data.email,
        data.password
      );

      saveToken(response.token);
      toast.success("Welcome back! Logged in successfully.");

      navigate("/projects");

  } catch (error) {
    console.error(error);
    toast.error("Invalid email or password");
  }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-3xl">
            ContriFlow
          </CardTitle>

          <p className="text-center text-muted-foreground">
            Sign in to your account
          </p>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label>Email</Label>

              <Input
                type="email"
                placeholder="Enter your email"
                {...register("email")}
              />

              {errors.email && (
                <p className="text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Password</Label>

              <Input
                type="password"
                placeholder="Enter your password"
                {...register("password")}
              />

              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;