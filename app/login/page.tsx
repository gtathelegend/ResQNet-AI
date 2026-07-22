"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ShieldAlert,
  User,
  Users,
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Form validation schema with Zod
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setFormError(null);
    try {
      await login(data.email, data.password);
    } catch (err) {
      const error = err as Error;
      setFormError(error.message || "Invalid credentials.");
    }
  };

  // Preset mock login helper
  const handleQuickLogin = (email: string) => {
    setValue("email", email);
    setValue("password", "password");
    handleSubmit(onSubmit)();
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-primary shadow-primary/30 flex size-14 items-center justify-center rounded-xl text-white shadow-lg">
            <ShieldAlert className="size-7" />
          </div>
          <h2 className="text-foreground mt-6 text-3xl font-extrabold tracking-tight">
            ResQNet AI Portal
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xs text-sm">
            Disaster Coordination & Resource Intelligence Command Center
          </p>
        </div>

        {/* Login form Card */}
        <Card className="border-border/80 bg-card border shadow-lg backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Sign In</CardTitle>
            <CardDescription>
              Access coordinates, incident feeds, and resource logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Form level error */}
              {formError && (
                <div className="bg-destructive/10 text-destructive rounded p-3 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="name@agency.gov"
                    className="border-border bg-background text-foreground focus:border-primary focus:ring-primary/20 placeholder:text-muted-foreground w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-all outline-none focus:ring-2"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive mt-1 text-xs">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                  Security Token (Password)
                </label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="border-border bg-background text-foreground focus:border-primary focus:ring-primary/20 placeholder:text-muted-foreground w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm transition-all outline-none focus:ring-2"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-destructive mt-1 text-xs">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Sign In CTA */}
              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 h-10 w-full gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <span>Access Platform</span>
                )}
              </Button>
            </form>
          </CardContent>

          {/* Quick mock selectors */}
          <CardFooter className="border-border/60 bg-muted/30 flex flex-col gap-4 border-t pt-6">
            <div className="w-full space-y-2">
              <span className="text-muted-foreground block text-center text-xs font-semibold tracking-wider uppercase">
                Development Quick Login (Mock Mode)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={() => handleQuickLogin("citizen@resqnet.ai")}
                  variant="outline"
                  size="sm"
                  className="border-border/80 hover:bg-card hover:text-primary flex h-16 flex-col items-center justify-center px-1 py-2 text-center transition-all"
                >
                  <User className="text-muted-foreground mb-1 size-4" />
                  <span className="text-[10px] font-bold">Citizen</span>
                  <Badge
                    variant="outline"
                    className="border-muted text-muted-foreground mt-0.5 h-3 px-1 py-0 text-[8px]"
                  >
                    Jane
                  </Badge>
                </Button>
                <Button
                  onClick={() => handleQuickLogin("volunteer@resqnet.ai")}
                  variant="outline"
                  size="sm"
                  className="border-border/80 hover:bg-card hover:text-accent flex h-16 flex-col items-center justify-center px-1 py-2 text-center transition-all"
                >
                  <Users className="text-muted-foreground mb-1 size-4" />
                  <span className="text-[10px] font-bold">Volunteer</span>
                  <Badge
                    variant="outline"
                    className="border-muted text-muted-foreground mt-0.5 h-3 px-1 py-0 text-[8px]"
                  >
                    John
                  </Badge>
                </Button>
                <Button
                  onClick={() => handleQuickLogin("authority@resqnet.ai")}
                  variant="outline"
                  size="sm"
                  className="border-border/80 hover:bg-card hover:text-destructive flex h-16 flex-col items-center justify-center px-1 py-2 text-center transition-all"
                >
                  <ShieldCheck className="text-muted-foreground mb-1 size-4" />
                  <span className="text-[10px] font-bold">Authority</span>
                  <Badge
                    variant="outline"
                    className="border-muted text-muted-foreground mt-0.5 h-3 px-1 py-0 text-[8px]"
                  >
                    HQ
                  </Badge>
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground text-center text-[10px]">
              Mock logins run offline. Standard password is{" "}
              <strong>password</strong>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
