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

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["citizen", "volunteer", "authority"]),
  phone: z.string().optional(),
  skills: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { login, signUp, isLoading } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    setValue: setValueLogin,
    formState: { errors: errorsLogin },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register: registerSignUp,
    handleSubmit: handleSubmitSignUp,
    watch: watchSignUp,
    formState: { errors: errorsSignUp },
    reset: resetSignUp,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "citizen",
      phone: "",
      skills: "",
    },
  });

  const selectedRole = watchSignUp("role");

  const onLoginSubmit = async (data: LoginFormValues) => {
    setFormError(null);
    try {
      await login(data.email, data.password);
    } catch (err) {
      const error = err as Error;
      setFormError(error.message || "Invalid credentials.");
    }
  };

  const onSignUpSubmit = async (data: RegisterFormValues) => {
    setFormError(null);
    try {
      await signUp(
        data.email,
        data.password,
        data.fullName,
        data.role,
        data.phone,
        data.skills
      );
      setMode("login");
      resetSignUp();
    } catch (err) {
      const error = err as Error;
      setFormError(error.message || "Failed to register account.");
    }
  };

  const handleQuickLogin = (email: string) => {
    setValueLogin("email", email);
    setValueLogin("password", "password");
    handleSubmitLogin(onLoginSubmit)();
  };

  return (
    <div className="bg-[#F8FAFC] flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-primary flex size-12 items-center justify-center rounded-lg text-white">
            <ShieldAlert className="size-6" />
          </div>
          <h2 className="text-[#0F172A] mt-4 text-2xl font-bold tracking-tight">
            ResQNet AI Command
          </h2>
          <p className="text-[#475569] mt-1 text-xs max-w-xs leading-relaxed font-semibold">
            Emergency Operations & Resource Coordination Command Center
          </p>
        </div>

        {/* Auth form Card */}
        <Card className="border border-[#CBD5E1] bg-white shadow-sm overflow-hidden">
          {/* Tabs header */}
          <div className="grid w-full grid-cols-2 border-b border-[#CBD5E1] bg-[#F1F5F9]/50">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setFormError(null);
              }}
              className={`py-3 text-center text-xs font-bold uppercase tracking-wider transition-all ${
                mode === "login"
                  ? "bg-white border-b border-transparent text-[#2563EB]"
                  : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] border-r border-[#CBD5E1]"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setFormError(null);
              }}
              className={`py-3 text-center text-xs font-bold uppercase tracking-wider transition-all ${
                mode === "register"
                  ? "bg-white border-b border-transparent text-[#2563EB]"
                  : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] border-l border-[#CBD5E1]"
              }`}
            >
              Register
            </button>
          </div>

          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-[#0F172A]">
              {mode === "login" ? "Access Command Center" : "Register Profile"}
            </CardTitle>
            <CardDescription className="text-xs text-[#475569] font-medium">
              {mode === "login"
                ? "Enter your credentials to access operations dashboard."
                : "Create a coordination profile for disaster dispatch."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formError && (
              <div className="bg-destructive/10 text-destructive rounded p-3 text-xs font-bold mb-4 border border-destructive/10">
                {formError}
              </div>
            )}

            {mode === "login" ? (
              <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-1">
                  <label className="text-[#0F172A] block text-[10px] font-bold uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="text-[#64748B] absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="name@agency.gov"
                      className="border border-[#CBD5E1] bg-background text-foreground placeholder:text-[#64748B] w-full rounded-md py-2 pr-4 pl-10 text-xs transition-all outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                      {...registerLogin("email")}
                    />
                  </div>
                  {errorsLogin.email && (
                    <p className="text-destructive mt-1 text-xs font-semibold">
                      {errorsLogin.email.message}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label className="text-[#0F172A] block text-[10px] font-bold uppercase tracking-wider">
                    Security Token (Password)
                  </label>
                  <div className="relative">
                    <Lock className="text-[#64748B] absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="border border-[#CBD5E1] bg-background text-foreground placeholder:text-[#64748B] w-full rounded-md py-2 pr-4 pl-10 text-xs transition-all outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                      {...registerLogin("password")}
                    />
                  </div>
                  {errorsLogin.password && (
                    <p className="text-destructive mt-1 text-xs font-semibold">
                      {errorsLogin.password.message}
                    </p>
                  )}
                </div>

                {/* Sign In CTA */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 h-9 w-full gap-2 text-xs font-bold cursor-pointer bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Verifying Session...</span>
                    </>
                  ) : (
                    <span>Access Command Center</span>
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmitSignUp(onSignUpSubmit)} className="space-y-4">
                {/* Full Name Input */}
                <div className="space-y-1">
                  <label className="text-[#0F172A] block text-[10px] font-bold uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="text-[#64748B] absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      className="border border-[#CBD5E1] bg-background text-foreground placeholder:text-[#64748B] w-full rounded-md py-2 pr-4 pl-10 text-xs transition-all outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                      {...registerSignUp("fullName")}
                    />
                  </div>
                  {errorsSignUp.fullName && (
                    <p className="text-destructive mt-1 text-xs font-semibold">
                      {errorsSignUp.fullName.message}
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div className="space-y-1">
                  <label className="text-[#0F172A] block text-[10px] font-bold uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="text-[#64748B] absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="name@agency.gov"
                      className="border border-[#CBD5E1] bg-background text-foreground placeholder:text-[#64748B] w-full rounded-md py-2 pr-4 pl-10 text-xs transition-all outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                      {...registerSignUp("email")}
                    />
                  </div>
                  {errorsSignUp.email && (
                    <p className="text-destructive mt-1 text-xs font-semibold">
                      {errorsSignUp.email.message}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label className="text-[#0F172A] block text-[10px] font-bold uppercase tracking-wider">
                    Password (Security Token)
                  </label>
                  <div className="relative">
                    <Lock className="text-[#64748B] absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="Min 6 characters"
                      className="border border-[#CBD5E1] bg-background text-foreground placeholder:text-[#64748B] w-full rounded-md py-2 pr-4 pl-10 text-xs transition-all outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                      {...registerSignUp("password")}
                    />
                  </div>
                  {errorsSignUp.password && (
                    <p className="text-destructive mt-1 text-xs font-semibold">
                      {errorsSignUp.password.message}
                    </p>
                  )}
                </div>

                {/* Role Selection */}
                <div className="space-y-1">
                  <label className="text-[#0F172A] block text-[10px] font-bold uppercase tracking-wider">
                    Account Type / Role
                  </label>
                  <select
                    className="border border-[#CBD5E1] bg-background text-foreground w-full rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                    {...registerSignUp("role")}
                  >
                    <option value="citizen font-medium">Citizen (Report Incidents)</option>
                    <option value="volunteer font-medium">Volunteer (Accept Dispatches)</option>
                    <option value="authority font-medium">Authority (Operations Command)</option>
                  </select>
                  {errorsSignUp.role && (
                    <p className="text-destructive mt-1 text-xs font-semibold">
                      {errorsSignUp.role.message}
                    </p>
                  )}
                </div>

                {selectedRole === "volunteer" && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[#0F172A] block text-[10px] font-bold uppercase tracking-wider">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="border border-[#CBD5E1] bg-background text-foreground placeholder:text-[#64748B] w-full rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                        {...registerSignUp("phone")}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#0F172A] block text-[10px] font-bold uppercase tracking-wider">
                        Skills (Comma-separated)
                      </label>
                      <input
                        type="text"
                        placeholder="Medical, Logistics, Rescue, Swimmer"
                        className="border border-[#CBD5E1] bg-background text-foreground placeholder:text-[#64748B] w-full rounded-md px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                        {...registerSignUp("skills")}
                      />
                    </div>
                  </>
                )}

                {/* Sign Up CTA */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-2 h-9 w-full gap-2 text-xs font-bold cursor-pointer bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <span>Register Account</span>
                  )}
                </Button>
              </form>
            )}
          </CardContent>

          {/* Quick mock selectors (Only visible during Sign In) */}
          {mode === "login" && (
            <CardFooter className="border-t border-[#CBD5E1] bg-[#F1F5F9]/50 flex flex-col gap-3 pt-4">
              <div className="w-full space-y-2">
                <span className="text-[#475569] block text-center text-[10px] font-bold tracking-wider uppercase">
                  Development Quick Login (Offline Mode)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => handleQuickLogin("citizen@resqnet.ai")}
                    variant="outline"
                    size="sm"
                    className="border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] flex h-14 flex-col items-center justify-center p-1 text-center transition-all cursor-pointer font-bold"
                  >
                    <User className="text-[#475569] size-4 mb-0.5" />
                    <span className="text-[10px] font-bold text-foreground">Citizen</span>
                    <Badge
                      variant="outline"
                      className="border-[#CBD5E1] text-[8px] bg-white px-1 py-0 scale-90 text-[#475569] font-bold"
                    >
                      Jane
                    </Badge>
                  </Button>
                  <Button
                    onClick={() => handleQuickLogin("volunteer@resqnet.ai")}
                    variant="outline"
                    size="sm"
                    className="border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] flex h-14 flex-col items-center justify-center p-1 text-center transition-all cursor-pointer font-bold"
                  >
                    <Users className="text-[#475569] size-4 mb-0.5" />
                    <span className="text-[10px] font-bold text-foreground">Volunteer</span>
                    <Badge
                      variant="outline"
                      className="border-[#CBD5E1] text-[8px] bg-white px-1 py-0 scale-90 text-[#475569] font-bold"
                    >
                      John
                    </Badge>
                  </Button>
                  <Button
                    onClick={() => handleQuickLogin("authority@resqnet.ai")}
                    variant="outline"
                    size="sm"
                    className="border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] flex h-14 flex-col items-center justify-center p-1 text-center transition-all cursor-pointer font-bold"
                  >
                    <ShieldCheck className="text-[#475569] size-4 mb-0.5" />
                    <span className="text-[10px] font-bold text-foreground">Authority</span>
                    <Badge
                      variant="outline"
                      className="border-[#CBD5E1] text-[8px] bg-white px-1 py-0 scale-90 text-[#475569] font-bold"
                    >
                      Command
                    </Badge>
                  </Button>
                </div>
              </div>
              <p className="text-[#64748B] text-center text-[10px] leading-relaxed font-semibold">
                Mock logins bypass external API. Password is <strong className="font-bold text-[#0F172A]">password</strong>.
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
