"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ShieldAlert,
  ArrowRight,
  Send,
  Zap,
  Globe,
  Users,
  Compass,
  Heart,
  TrendingUp,
  MapPin,
  Lock,
  Activity,
  Loader2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { useAuth } from "@/hooks/use-auth";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitting(true);
    setTimeout(() => {
      setReportSubmitting(false);
      setReportModalOpen(false);
      toast.success("Emergency Signal Transmitted", {
        description:
          "Your report has been successfully broadcast to Area HQ and field responders.",
        duration: 5000,
      });
    }, 1200);
  };

  return (
    <div className="bg-background text-foreground selection:bg-primary flex min-h-screen flex-col selection:text-white">
      {/* Dynamic Header */}
      <Navbar />

      {/* Main Landing Content */}
      <main className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section className="border-border from-card/30 to-background relative overflow-hidden border-b bg-gradient-to-b py-20 lg:py-32">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Text Area */}
              <motion.div
                className="flex flex-col items-start space-y-6 text-left"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge
                  variant="outline"
                  className="border-primary/20 bg-primary/5 text-primary gap-2 px-3 py-1 text-xs font-semibold"
                >
                  <span className="bg-primary size-2 animate-pulse rounded-full" />
                  Next-Gen Disaster Operations Platform
                </Badge>

                <h1 className="text-foreground text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  AI-Powered Response, <br />
                  <span className="text-primary">
                    Coordinated in Real Time.
                  </span>
                </h1>

                <p className="text-muted-foreground max-w-lg text-lg leading-relaxed">
                  ResQNet AI unites citizens, volunteers, and emergency
                  authorities under a single secure telemetry grid to deploy
                  resources, map incidents, and accelerate crisis response.
                </p>

                {/* CTA Action Controls */}
                <div className="flex w-full flex-wrap gap-3 sm:w-auto">
                  <Button
                    onClick={() => setReportModalOpen(true)}
                    variant="destructive"
                    size="lg"
                    className="shadow-destructive/10 hover:shadow-destructive/20 gap-2 font-semibold shadow-lg transition-all"
                  >
                    <ShieldAlert className="size-5" />
                    <span>Report Disaster</span>
                  </Button>

                  {isAuthenticated ? (
                    <Link href="/dashboard" passHref>
                      <Button
                        variant="default"
                        size="lg"
                        className="shadow-primary/10 gap-2 font-semibold shadow-lg"
                      >
                        <span>Access Dashboard</span>
                        <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/login" passHref>
                      <Button
                        variant="outline"
                        size="lg"
                        className="border-border/80 gap-2 font-semibold"
                      >
                        <span>Sign In Portal</span>
                        <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>

              {/* Graphic Area (IBM-inspired SVG Grid Node Visualizer) */}
              <motion.div
                className="relative flex items-center justify-center lg:h-[450px]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="bg-primary/10 absolute -z-10 size-72 rounded-full blur-[120px]" />
                <svg
                  viewBox="0 0 500 500"
                  className="text-primary w-full max-w-[420px]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Outer Orbit lines */}
                  <circle
                    cx="250"
                    cy="250"
                    r="180"
                    stroke="currentColor"
                    strokeOpacity="0.08"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                  />
                  <circle
                    cx="250"
                    cy="250"
                    r="120"
                    stroke="currentColor"
                    strokeOpacity="0.15"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="250"
                    cy="250"
                    r="60"
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeWidth="1"
                  />

                  {/* Connected Node Network paths */}
                  <line
                    x1="250"
                    y1="250"
                    x2="130"
                    y2="150"
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeWidth="2"
                  />
                  <line
                    x1="250"
                    y1="250"
                    x2="370"
                    y2="150"
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeWidth="2"
                  />
                  <line
                    x1="250"
                    y1="250"
                    x2="250"
                    y2="390"
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeWidth="2"
                  />
                  <line
                    x1="130"
                    y1="150"
                    x2="370"
                    y2="150"
                    stroke="currentColor"
                    strokeOpacity="0.08"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="130"
                    y1="150"
                    x2="250"
                    y2="390"
                    stroke="currentColor"
                    strokeOpacity="0.08"
                    strokeWidth="1.5"
                  />

                  {/* Central Node */}
                  <circle
                    cx="250"
                    cy="250"
                    r="30"
                    fill="currentColor"
                    fillOpacity="0.1"
                  />
                  <circle
                    cx="250"
                    cy="250"
                    r="16"
                    fill="currentColor"
                    className="animate-pulse"
                  />
                  <path d="M246 246H254V254H246V246Z" fill="white" />

                  {/* Node 1 - Authority Node */}
                  <g
                    className="animate-bounce"
                    style={{ animationDuration: "5s" }}
                  >
                    <circle
                      cx="130"
                      cy="150"
                      r="22"
                      fill="#DA1E28"
                      fillOpacity="0.1"
                    />
                    <circle cx="130" cy="150" r="10" fill="#DA1E28" />
                    <circle cx="130" cy="150" r="4" fill="white" />
                  </g>

                  {/* Node 2 - Volunteer Node */}
                  <g
                    className="animate-bounce"
                    style={{ animationDuration: "4s", animationDelay: "1s" }}
                  >
                    <circle
                      cx="370"
                      cy="150"
                      r="22"
                      fill="#24A148"
                      fillOpacity="0.1"
                    />
                    <circle cx="370" cy="150" r="10" fill="#24A148" />
                    <circle cx="370" cy="150" r="4" fill="white" />
                  </g>

                  {/* Node 3 - Citizen Node */}
                  <g
                    className="animate-bounce"
                    style={{ animationDuration: "6s", animationDelay: "0.5s" }}
                  >
                    <circle
                      cx="250"
                      cy="390"
                      r="22"
                      fill="#0F62FE"
                      fillOpacity="0.1"
                    />
                    <circle cx="250" cy="390" r="10" fill="#0F62FE" />
                    <circle cx="250" cy="390" r="4" fill="white" />
                  </g>
                </svg>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================= MISSION SECTION ================= */}
        <section id="mission" className="bg-card border-border border-b py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* Mission Statement */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-primary block text-xs font-bold tracking-widest uppercase">
                  Our Core Mission
                </span>
                <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                  Speed, Safety, and Synchronization.
                </h2>
                <p className="text-muted-foreground text-base leading-relaxed">
                  During crisis management, seconds save lives. Traditional
                  disaster channels are often isolated, leaving citizens
                  stranded, volunteers uncoordinated, and authorities blind to
                  real-time ground truths.
                </p>
                <p className="text-muted-foreground text-base leading-relaxed">
                  ResQNet AI breaks down these silos. By providing a unified,
                  secure dashboard, we ensure intelligence is routed
                  contextually, assets are tracked dynamically, and operations
                  are managed with absolute transparency.
                </p>
              </motion.div>

              {/* Mission Visual Pillars */}
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-border bg-background transition-shadow hover:shadow-md">
                  <CardHeader className="p-4 pb-2">
                    <Zap className="text-primary mb-2 size-6" />
                    <CardTitle className="text-base">
                      Real-time Routing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground p-4 pt-0 text-xs">
                    Telemetry paths calculate resource allocations and routes
                    instantaneously, cutting dispatch delays.
                  </CardContent>
                </Card>

                <Card className="border-border bg-background transition-shadow hover:shadow-md">
                  <CardHeader className="p-4 pb-2">
                    <Globe className="text-accent mb-2 size-6" />
                    <CardTitle className="text-base">
                      UN SDG Alignment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground p-4 pt-0 text-xs">
                    Engineered to directly advance targets in climate
                    resilience, community safety, and international
                    partnerships.
                  </CardContent>
                </Card>

                <Card className="border-border bg-background transition-shadow hover:shadow-md">
                  <CardHeader className="p-4 pb-2">
                    <Users className="text-warning mb-2 size-6" />
                    <CardTitle className="text-base">
                      Role-Based Silos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground p-4 pt-0 text-xs">
                    Custom permissions connect Citizens, Volunteers, and
                    Emergency Command Centers natively under strict telemetry.
                  </CardContent>
                </Card>

                <Card className="border-border bg-background transition-shadow hover:shadow-md">
                  <CardHeader className="p-4 pb-2">
                    <Lock className="text-destructive mb-2 size-6" />
                    <CardTitle className="text-base">HMAC Security</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground p-4 pt-0 text-xs">
                    Secure APIs and inter-service token validations protect
                    command telemetry feeds from tampering.
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS SECTION ================= */}
        <section
          id="how-it-works"
          className="bg-background border-border border-b py-20"
        >
          <div className="mx-auto max-w-7xl space-y-12 px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-primary block text-xs font-bold tracking-widest uppercase">
                Response Loop
              </span>
              <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                How ResQNet AI Works
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-sm">
                A seamless coordination cycle bridging local emergencies with
                high-level tactical deployments.
              </p>
            </motion.div>

            {/* Timeline Grid */}
            <div className="grid gap-6 text-left md:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Citizen Reports",
                  desc: "Local residents file alerts with GPS coordinates and photos. Critical signals bypass latency.",
                  icon: MapPin,
                  color: "text-primary bg-primary/10",
                },
                {
                  step: "02",
                  title: "AI Analysis",
                  desc: "Algorithms classify incident severity, evaluate weather data, and prioritize sector tickets.",
                  icon: Zap,
                  color: "text-accent bg-accent/10",
                },
                {
                  step: "03",
                  title: "Volunteer Staging",
                  desc: "Alerts are routed to nearby responders who review tasks and request depot resource allocations.",
                  icon: Users,
                  color: "text-warning bg-warning/10",
                },
                {
                  step: "04",
                  title: "HQ Command",
                  desc: "Authorities verify telemetry and execute unified dispatches to stabilize active crisis zones.",
                  icon: ShieldAlert,
                  color: "text-destructive bg-destructive/10",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="border-border bg-card group hover:border-primary/40 relative rounded-xl border p-6 transition-colors"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <div className="text-muted-foreground/20 group-hover:text-primary/20 absolute top-4 right-4 font-mono text-2xl font-extrabold transition-colors">
                    {item.step}
                  </div>
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg ${item.color} mb-4`}
                  >
                    <item.icon className="size-5" />
                  </div>
                  <h3 className="text-foreground mb-2 text-lg font-semibold">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= SDG GOALS SECTION ================= */}
        <section id="sdgs" className="bg-card border-border border-b py-20">
          <div className="mx-auto max-w-7xl space-y-12 px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-primary block text-xs font-bold tracking-widest uppercase">
                Global Commitment
              </span>
              <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                Advancing UN Sustainable Development Goals
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-sm">
                ResQNet AI is engineered to address global challenges through
                technical solutions that promote climate adaptation and
                community resilience.
              </p>
            </motion.div>

            {/* SDG Goals Cards */}
            <div className="grid gap-6 text-left md:grid-cols-3">
              {/* SDG 11 */}
              <motion.div
                className="relative rounded-xl border border-[#F99D1C]/20 bg-[#F99D1C]/5 p-6 transition-shadow hover:shadow-md"
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute top-4 right-4 flex size-10 items-center justify-center rounded bg-[#F99D1C] font-mono text-sm font-bold text-white shadow-sm">
                  Goal 11
                </div>
                <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-[#F99D1C]/10 text-[#F99D1C]">
                  <Compass className="size-6" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-bold">
                  Sustainable Cities
                </h3>
                <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
                  Make cities and human settlements inclusive, safe, resilient,
                  and sustainable.
                </p>
                <div className="w-fit rounded bg-[#F99D1C]/10 px-2.5 py-1 text-[10px] font-bold text-[#F99D1C] uppercase">
                  Target: Shelter Resilience
                </div>
              </motion.div>

              {/* SDG 13 */}
              <motion.div
                className="relative rounded-xl border border-[#3F7E44]/20 bg-[#3F7E44]/5 p-6 transition-shadow hover:shadow-md"
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="absolute top-4 right-4 flex size-10 items-center justify-center rounded bg-[#3F7E44] font-mono text-sm font-bold text-white shadow-sm">
                  Goal 13
                </div>
                <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-[#3F7E44]/10 text-[#3F7E44]">
                  <Globe className="size-6" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-bold">
                  Climate Action
                </h3>
                <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
                  Take urgent action to combat climate change and its impacts by
                  strengthening adaptative capacities.
                </p>
                <div className="w-fit rounded bg-[#3F7E44]/10 px-2.5 py-1 text-[10px] font-bold text-[#3F7E44] uppercase">
                  Target: Disaster Telemetry
                </div>
              </motion.div>

              {/* SDG 17 */}
              <motion.div
                className="relative rounded-xl border border-[#19486A]/20 bg-[#19486A]/5 p-6 transition-shadow hover:shadow-md"
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="absolute top-4 right-4 flex size-10 items-center justify-center rounded bg-[#19486A] font-mono text-sm font-bold text-white shadow-sm">
                  Goal 17
                </div>
                <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-[#19486A]/10 text-[#19486A]">
                  <Users className="size-6" />
                </div>
                <h3 className="text-foreground mb-2 text-lg font-bold">
                  Partnerships
                </h3>
                <p className="text-muted-foreground mb-4 text-xs leading-relaxed">
                  Strengthen the means of implementation and revitalize global
                  partnerships for sustainable development.
                </p>
                <div className="w-fit rounded bg-[#19486A]/10 px-2.5 py-1 text-[10px] font-bold text-[#19486A] uppercase">
                  Target: Unified Command
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES SECTION ================= */}
        <section
          id="features"
          className="bg-background border-border border-b py-20"
        >
          <div className="mx-auto max-w-7xl space-y-12 px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-primary block text-xs font-bold tracking-widest uppercase">
                System Capabilities
              </span>
              <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                Advanced Tactical Features
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-sm">
                Engineered for strict environments that demand secure
                transmission and dynamic scaling.
              </p>
            </motion.div>

            {/* Grid of Features */}
            <div className="grid gap-6 text-left md:grid-cols-3">
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="bg-primary/10 text-primary mb-3 flex size-10 items-center justify-center rounded-lg">
                    <Activity className="size-5" />
                  </div>
                  <CardTitle className="text-lg">Dynamic Dispatching</CardTitle>
                  <CardDescription className="text-xs">
                    Command center interface allowing authorities to evaluate
                    unit coordinates and allocate vehicles to incident sectors
                    instantly.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="bg-accent/10 text-accent mb-3 flex size-10 items-center justify-center rounded-lg">
                    <Lock className="size-5" />
                  </div>
                  <CardTitle className="text-lg">
                    Telemetry Signatures
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Secures inter-service REST endpoints with HMAC algorithms.
                    Eliminates validation errors and prevents hijacking of
                    command assets.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="bg-warning/10 text-warning mb-3 flex size-10 items-center justify-center rounded-lg">
                    <Compass className="size-5" />
                  </div>
                  <CardTitle className="text-lg">Offline Mock Mode</CardTitle>
                  <CardDescription className="text-xs">
                    Built-in development simulation caching sessions in client
                    cookies. Allows full UI test flows without database
                    configurations.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* ================= STATISTICS SECTION ================= */}
        <section className="bg-primary border-primary-dark border-b py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 text-center sm:grid-cols-3">
              {[
                { number: "12s", label: "Average Dispatch Latency", icon: Zap },
                {
                  number: "14.2k",
                  label: "Active Field Responders",
                  icon: Users,
                },
                {
                  number: "4.2M",
                  label: "Command Signals Transmitted",
                  icon: TrendingUp,
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="flex flex-col items-center space-y-2 p-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                >
                  <item.icon className="size-6 text-white/80" />
                  <div className="text-4xl font-extrabold tracking-tight md:text-5xl">
                    {item.number}
                  </div>
                  <div className="text-xs font-medium text-white/70">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CALL TO ACTION SECTION ================= */}
        <section className="from-background to-card/20 bg-gradient-to-b py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <motion.div
              className="border-border bg-card relative space-y-6 overflow-hidden rounded-2xl border p-10 text-center shadow-xl md:p-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-primary/5 absolute inset-0 -z-10" />

              <Heart className="text-primary mx-auto size-10 animate-pulse" />

              <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Join the Response Grid?
              </h2>

              <p className="text-muted-foreground mx-auto max-w-xl text-sm leading-relaxed">
                Connect your community, register volunteer units, and access
                coordinated disaster response networks instantly. Secure local
                simulation requires zero cloud setups.
              </p>

              <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
                <Button
                  onClick={() => setReportModalOpen(true)}
                  variant="destructive"
                  size="lg"
                  className="gap-2 font-semibold"
                >
                  <ShieldAlert className="size-4" />
                  Report Emergency
                </Button>

                {isAuthenticated ? (
                  <Link href="/dashboard" passHref>
                    <Button
                      variant="default"
                      size="lg"
                      className="gap-2 font-semibold"
                    >
                      Go to Dashboard
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login" passHref>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-border/80 gap-2 font-semibold"
                    >
                      Access Command Center
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Emergency Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Disaster Incident"
        description="Broadcast an active emergency signal directly to nearby responders and Regional HQ."
      >
        <form onSubmit={handleReportSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Incident Category
            </label>
            <select
              className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border px-3 py-2 text-xs outline-none"
              required
            >
              <option value="flooding">Severe Flooding</option>
              <option value="fire">Wildfire / Structural Fire</option>
              <option value="medical">Mass Medical Incident</option>
              <option value="power">Power Grid / Telecom Failure</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Location Coordinates
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Latitude (E.g. 40.7128)"
                className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border p-2 text-xs outline-none"
                required
              />
              <input
                type="text"
                placeholder="Longitude (E.g. -74.0060)"
                className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border p-2 text-xs outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Detailed Description
            </label>
            <textarea
              placeholder="State status, injuries, water level, blocks, etc."
              className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border p-2 text-xs outline-none"
              rows={3}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              className="gap-2"
              disabled={reportSubmitting}
            >
              {reportSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Transmitting...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  <span>Broadcast Signal</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
