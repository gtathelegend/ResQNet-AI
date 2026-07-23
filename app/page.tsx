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
  Server,
  FileCode2,
  Home,
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
    <div className="bg-[#F8FAFC] text-[#0F172A] flex min-h-screen flex-col selection:bg-primary selection:text-white">
      {/* Global Navigation Header */}
      <Navbar />

      <main className="flex-1">
        {/* ================= HERO SECTION ================= */}
        <section className="relative overflow-hidden border-b border-border bg-white py-20 lg:py-28">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:20px_20px] opacity-60" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <motion.div
                className="flex flex-col items-start space-y-5 text-left"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge
                  variant="secondary"
                  className="gap-1.5 px-3 py-1 text-xs font-semibold text-primary bg-primary/5 border border-primary/10 rounded-full"
                >
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Emergency Staging & Telemetry Platform
                </Badge>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-[1.05]">
                  Coordinated Emergency <br />
                  <span className="text-[#2563EB] font-bold">Response Grid.</span>
                </h1>

                <p className="text-[#475569] text-sm sm:text-base leading-relaxed max-w-lg font-medium">
                  ResQNet AI connects citizens, volunteer responders, and dispatch authorities under a single telemetry matrix to prioritize incidents, track depot resources, and accelerate disaster recovery.
                </p>

                <div className="flex w-full flex-wrap gap-2.5 pt-2 sm:w-auto">
                  <Button
                    onClick={() => setReportModalOpen(true)}
                    variant="destructive"
                    size="sm"
                    className="h-10 px-4 text-xs font-semibold cursor-pointer shadow-none"
                  >
                    Report Emergency
                  </Button>

                  {isAuthenticated ? (
                    <Link href="/dashboard" passHref>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-10 px-4 text-xs font-semibold cursor-pointer shadow-none"
                      >
                        Access Command Center
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/login" passHref>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-4 text-xs font-semibold cursor-pointer"
                      >
                        Sign In Portal
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>

              {/* Graphic Node Network Map (Leaflet Staging Area Visualizer) */}
              <motion.div
                className="relative flex items-center justify-center lg:h-[400px]"
                initial={{ opacity: 1, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="border border-[#CBD5E1] rounded-lg bg-[#FFFFFF] p-4 shadow-sm w-full max-w-[420px] aspect-square relative overflow-hidden flex flex-col justify-between">
                  {/* Clean schematic grid */}
                  <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
                  
                  {/* Staging Nodes */}
                  <div className="z-10 flex justify-between items-center text-[10px] text-[#64748B] border-b border-[#E2E8F0] pb-2 bg-[#FFFFFF]/90 backdrop-blur-sm font-bold">
                    <span className="tracking-wider uppercase">Active Telemetry Grid</span>
                    <span className="font-mono text-[9px] font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#16A34A]/20 rounded px-1.5 py-0.5">Live Sync</span>
                  </div>

                  <div className="z-10 relative flex-1 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-4/5 h-4/5 text-[#CBD5E1]">
                      <line x1="50" y1="50" x2="20" y2="30" stroke="#CBD5E1" strokeWidth="0.75" strokeDasharray="1.5" />
                      <line x1="50" y1="50" x2="80" y2="30" stroke="#CBD5E1" strokeWidth="0.75" />
                      <line x1="50" y1="50" x2="50" y2="80" stroke="#CBD5E1" strokeWidth="0.75" />
                      {/* Center */}
                      <circle cx="50" cy="50" r="4" fill="#2563EB" className="opacity-20 animate-ping" />
                      <circle cx="50" cy="50" r="3" fill="#2563EB" />
                      {/* Node A (Critical) */}
                      <circle cx="20" cy="30" r="3.5" fill="#DC2626" />
                      {/* Node B (Warning) */}
                      <circle cx="80" cy="30" r="3.5" fill="#EA580C" />
                      {/* Node C (Success) */}
                      <circle cx="50" cy="80" r="3.5" fill="#16A34A" />
                    </svg>
                  </div>

                  <div className="z-10 border-t border-[#E2E8F0] pt-2 grid grid-cols-3 gap-2 text-center text-[9px] font-bold bg-[#FFFFFF]/90 backdrop-blur-sm">
                    <div>
                      <span className="text-[#64748B] block uppercase tracking-wider">Authorities</span>
                      <strong className="text-[#0F172A] text-[10.5px]">Command HQ</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block uppercase tracking-wider">Responders</span>
                      <strong className="text-[#0F172A] text-[10.5px]">On-Duty Units</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block uppercase tracking-wider">Logistics</span>
                      <strong className="text-[#0F172A] text-[10.5px]">Depot Stock</strong>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================= PROBLEM & CONTEXT SECTION ================= */}
        <section id="problem" className="bg-[#F8FAFC] border-b border-border py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-primary block text-[10px] font-bold tracking-widest uppercase">
                  Operation Obstacles
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  Decentralization slows disaster response.
                </h2>
                <p className="text-[#475569] text-sm leading-relaxed font-medium">
                  During emergency responses, coordinating multiple entities is highly complex. Isolated communication channels leave citizens stranded, field volunteers without clear directions, and area commanders blind to active ground levels.
                </p>
                <p className="text-[#475569] text-sm leading-relaxed font-medium">
                  ResQNet AI bridges this gap. By centralizing incident reports, resource logs, and live maps, we ensure that dispatch data is accurate, volunteer matching is immediate, and critical resources are allocated where they are needed most.
                </p>
              </motion.div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { title: "Isolated Reporting", desc: "Citizens lack direct channels to feed active coordinates to responders.", icon: ShieldAlert },
                  { title: "Depot Depletion", desc: "Warehouse dispatches are uncoordinated, leading to supply distribution imbalances.", icon: Lock },
                  { title: "Manual Scheduling", desc: "Volunteers are deployed without accounting for distance from incident bases.", icon: Users },
                  { title: "Data Tampering", desc: "Crisis response channels must be protected with cryptographically secure signatures.", icon: Activity }
                ].map((item, idx) => (
                  <div key={idx} className="border border-border bg-white rounded-lg p-5">
                    <item.icon className="size-5 text-primary mb-2.5" />
                    <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-xs text-[#475569] font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= HOW IT WORKS SECTION ================= */}
        <section id="how-it-works" className="bg-white border-b border-border py-20">
          <div className="mx-auto max-w-7xl space-y-12 px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-primary block text-[10px] font-bold tracking-widest uppercase">
                Workflow Loop
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Coordinated Emergency Lifecycle
              </h2>
              <p className="text-[#475569] font-medium mx-auto max-w-2xl text-xs sm:text-sm">
                A structured, synchronized loop bringing ground-level reports into high-level tactical deployments.
              </p>
            </motion.div>

            <div className="grid gap-6 text-left md:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Emergency Signals",
                  desc: "Citizens broadcast reports containing geo-coordinates, population numbers, and supply needs.",
                  icon: MapPin,
                },
                {
                  step: "02",
                  title: "Resource Check",
                  desc: "Logistics systems check available stock counts in the nearest supply depot bases.",
                  icon: Zap,
                },
                {
                  step: "03",
                  title: "Proximity Matching",
                  desc: "The system identifies and ranks available on-duty volunteers based on distance.",
                  icon: Users,
                },
                {
                  step: "04",
                  title: "Tactical Dispatch",
                  desc: "HQ reviews telemetry metrics and authorizes immediate dispatches to the incident area.",
                  icon: ShieldAlert,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="border border-border bg-[#F8FAFC] relative rounded-lg p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="text-[#64748B]/20 absolute top-4 right-4 font-mono text-2xl font-bold">
                    {item.step}
                  </div>
                  <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary mb-3">
                    <item.icon className="size-4.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#475569] font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= SDG TARGET 11.5 ALIGNMENT SECTION ================= */}
        <section id="sdg-alignment" className="bg-[#F8FAFC] border-b border-border py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="border border-border bg-white rounded-lg p-8 sm:p-12 grid gap-8 lg:grid-cols-12 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="text-[#F99D1C] block text-[10px] font-bold tracking-widest uppercase">
                  UN SDG Target 11.5 Commitment
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                  Reducing Disaster Impact & Protecting Communities
                </h2>
                <p className="text-[#475569] text-sm leading-relaxed font-medium">
                  Sustainable Development Goal 11 aims to make cities and human settlements inclusive, safe, resilient, and sustainable. Under target 11.5, the global mandate is to significantly reduce the number of deaths and the number of people affected by disasters.
                </p>
                <p className="text-[#475569] text-sm leading-relaxed font-medium">
                  ResQNet AI directly advances this mandate by providing emergency coordination tools. By optimizing volunteer response routes, managing emergency shelter occupancies, and tracking regional dispatch levels, the platform decreases staging delays and stabilizes disaster areas.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#F99D1C]/10 text-[#F99D1C] text-[10px] font-bold uppercase tracking-wider">
                  Target 11.5: Reduced Disaster Vulnerability
                </div>
              </div>
              <div className="lg:col-span-4 flex justify-center">
                {/* Clean Flat SVG Graphic representing SDG Goal 11 */}
                <div className="w-48 h-48 bg-[#F99D1C] rounded-lg text-white p-5 flex flex-col justify-between shadow-sm">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block">Goal 11</span>
                  <div className="flex-1 flex items-center justify-center">
                    <Home className="size-20 stroke-[1.25]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Sustainable Cities</span>
                    <span className="text-[9px] text-white/80 block">And Communities</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TECH STACK & ARCHITECTURE ================= */}
        <section id="tech-stack" className="bg-white border-b border-border py-20">
          <div className="mx-auto max-w-7xl space-y-12 px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-primary block text-[10px] font-bold tracking-widest uppercase">
                Technical Foundation
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Modern Operations Architecture
              </h2>
              <p className="text-[#475569] font-medium mx-auto max-w-2xl text-xs sm:text-sm">
                Engineered for strict environments that demand secure transmission and sub-second data synchronization.
              </p>
            </motion.div>

            <div className="grid gap-6 text-left md:grid-cols-3">
              {[
                { title: "Next.js Core", desc: "App router system utilizing Server Component rendering and route proxy configurations.", icon: FileCode2 },
                { title: "Supabase & Postgres", desc: "Real-time database handling operations coordinates, shelter occupancies, and volunteer profiles.", icon: Server },
                { title: "GIS Leaflet Integration", desc: "Client-side mapping engine routing incident locations and staging bases.", icon: Compass }
              ].map((tech, idx) => (
                <div key={idx} className="border border-border bg-[#F8FAFC] rounded-lg p-5">
                  <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary mb-3">
                    <tech.icon className="size-4.5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{tech.title}</h3>
                  <p className="text-xs text-[#475569] font-medium leading-relaxed">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= CALL TO ACTION SECTION ================= */}
        <section className="bg-[#F8FAFC] py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="border border-border bg-white rounded-xl p-8 sm:p-12 text-center space-y-5 shadow-sm">
              <ShieldAlert className="text-primary mx-auto size-9" />
              
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                Join the Tactical Operations Grid
              </h2>

              <p className="text-[#475569] font-medium mx-auto max-w-lg text-xs sm:text-sm leading-relaxed">
                Connect your local community, register volunteer profiles, and access coordinated disaster response networks. The built-in offline simulation mode allows full testing without configuration.
              </p>

              <div className="flex flex-col justify-center gap-2.5 pt-2 sm:flex-row max-w-md mx-auto">
                <Button
                  onClick={() => setReportModalOpen(true)}
                  variant="destructive"
                  size="sm"
                  className="h-10 px-5 text-xs font-semibold cursor-pointer shadow-none"
                >
                  Report Incident
                </Button>

                {isAuthenticated ? (
                  <Link href="/dashboard" passHref>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-10 px-5 text-xs font-semibold cursor-pointer shadow-none"
                    >
                      Go to Command Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login" passHref>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 px-5 text-xs font-semibold cursor-pointer"
                    >
                      Access Command Portal
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Emergency Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Emergency Signal"
        description="Broadcast an active emergency signal directly to Regional Command HQ."
      >
        <form onSubmit={handleReportSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
              Emergency Category
            </label>
            <select
              className="border border-border bg-background text-foreground w-full rounded-md px-3 py-2 text-xs outline-none"
              required
            >
              <option value="flooding">Severe Flooding / Inundation</option>
              <option value="fire">Wildfire / Structural Fire</option>
              <option value="medical">Mass Medical Emergency</option>
              <option value="power">Power Grid / Infrastructure Failure</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
              Coordinates
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Latitude (E.g. 40.7128)"
                className="border border-border bg-background text-foreground w-full rounded-md p-2.5 text-xs outline-none"
                required
              />
              <input
                type="text"
                placeholder="Longitude (E.g. -74.0060)"
                className="border border-border bg-background text-foreground w-full rounded-md p-2.5 text-xs outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
              Operational Status / Description
            </label>
            <textarea
              placeholder="State status, injuries, water level, blocks, etc."
              className="border border-border bg-background text-foreground w-full rounded-md p-2.5 text-xs outline-none"
              rows={3}
              required
            />
          </div>

          <div className="border-t border-border flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReportModalOpen(false)}
              className="h-8 text-xs px-3 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              className="h-8 text-xs px-3 cursor-pointer"
              disabled={reportSubmitting}
            >
              {reportSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Broadcasting...</span>
                </>
              ) : (
                <>
                  <Send className="size-3.5" />
                  <span>Transmit Signal</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
