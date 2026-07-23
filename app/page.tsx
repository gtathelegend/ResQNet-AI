"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ShieldAlert,
  Send,
  Zap,
  Globe,
  Users,
  Compass,
  Heart,
  Activity,
  Loader2,
  Server,
  FileCode2,
  Home,
  CheckCircle2,
  UserCheck,
  Package,
  ArrowDown,
  Eye,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
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
    <div className="bg-[#F8FAFC] text-[#0F172A] flex min-h-screen flex-col selection:bg-primary selection:text-white scroll-smooth">
      {/* Global Sticky Navigation Header */}
      <Navbar onReportClick={() => setReportModalOpen(true)} />

      <main className="flex-1">
        {/* ================= 1. HERO SECTION ================= */}
        <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-white py-20 lg:py-28">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:20px_20px] opacity-60" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <motion.div
                className="flex flex-col items-start space-y-6 text-left"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#2563EB]/10">
                  AI-Powered Disaster Response Platform
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] leading-[1.1]">
                  Coordinated Emergency <br />
                  Response, <span className="text-[#2563EB]">Powered by AI.</span>
                </h1>

                <p className="text-[#475569] text-sm sm:text-base leading-relaxed max-w-lg font-semibold">
                  ResQNet AI connects citizens, emergency authorities, NGOs and volunteers through an intelligent coordination platform that prioritizes incidents, recommends critical resources and supports faster disaster response.
                </p>

                <div className="flex w-full flex-wrap gap-3 pt-2">
                  <Button
                    onClick={() => setReportModalOpen(true)}
                    variant="destructive"
                    size="sm"
                    className="h-10 px-5 text-xs font-bold cursor-pointer shadow-none"
                  >
                    Report Emergency
                  </Button>

                  {isAuthenticated ? (
                    <Link href="/dashboard" passHref>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-10 px-5 text-xs font-bold cursor-pointer shadow-none bg-[#2563EB]"
                      >
                        Explore Platform
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/login" passHref>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-10 px-5 text-xs font-bold cursor-pointer"
                      >
                        Explore Platform
                      </Button>
                    </Link>
                  )}
                </div>

                <Link
                  href="#problem"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:underline pt-4"
                >
                  <span>See How It Works ↓</span>
                </Link>
              </motion.div>

              {/* Graphic Node Network Map (Leaflet Staging Area Visualizer) */}
              <motion.div
                className="relative flex items-center justify-center lg:h-[400px]"
                initial={{ opacity: 0.9, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="border border-[#CBD5E1] rounded-lg bg-[#FFFFFF] p-5 shadow-sm w-full max-w-[420px] aspect-square relative overflow-hidden flex flex-col justify-between">
                  {/* Clean schematic grid */}
                  <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />
                  
                  {/* Staging Nodes */}
                  <div className="z-10 flex justify-between items-center text-[10px] text-[#0F172A] border-b border-[#E2E8F0] pb-2 bg-[#FFFFFF]/90 backdrop-blur-sm font-extrabold">
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
                      <circle cx="80" cy="30" r="3.5" fill="#D97706" />
                      {/* Node C (Success) */}
                      <circle cx="50" cy="80" r="3.5" fill="#16A34A" />
                    </svg>
                  </div>

                  <div className="z-10 border-t border-[#E2E8F0] pt-2 grid grid-cols-3 gap-2 text-center text-[9px] font-bold bg-[#FFFFFF]/90 backdrop-blur-sm">
                    <div>
                      <span className="text-[#64748B] block uppercase tracking-wider">Authorities</span>
                      <strong className="text-[#0F172A] text-[10.5px] font-extrabold">Command HQ</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block uppercase tracking-wider">Responders</span>
                      <strong className="text-[#0F172A] text-[10.5px] font-extrabold">On-Duty Units</strong>
                    </div>
                    <div>
                      <span className="text-[#64748B] block uppercase tracking-wider">Logistics</span>
                      <strong className="text-[#0F172A] text-[10.5px] font-extrabold">Depot Stock</strong>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================= 2. THE PROBLEM ================= */}
        <section id="problem" className="bg-[#F8FAFC] border-b border-[#E2E8F0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 max-w-3xl mb-12">
              <span className="text-[#2563EB] block text-xs font-bold tracking-widest uppercase">
                THE CHALLENGE
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                Disaster response is often a coordination problem.
              </h2>
              <p className="text-[#475569] text-sm leading-relaxed font-semibold">
                During floods, earthquakes, cyclones, wildfires and other emergencies, information may arrive from many different sources while responders operate with limited time and resources.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 mb-8">
              {[
                {
                  title: "Delayed Response",
                  desc: "Critical information may take time to reach the right response teams.",
                  icon: ShieldAlert,
                },
                {
                  title: "Inefficient Resource Allocation",
                  desc: "Food, water, medicines, vehicles and rescue equipment may not reach the highest-priority locations first.",
                  icon: Package,
                },
                {
                  title: "Fragmented Coordination",
                  desc: "Citizens, authorities, NGOs, hospitals and volunteers may operate using disconnected information.",
                  icon: Users,
                },
              ].map((item, idx) => (
                <div key={idx} className="border border-[#CBD5E1] bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex size-10 items-center justify-center rounded-md bg-[#EFF6FF] text-[#2563EB] mb-4">
                    <item.icon className="size-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#0F172A] mb-2">{item.title}</h3>
                  <p className="text-xs text-[#475569] font-semibold leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <p className="text-[#0F172A] text-sm font-bold border-l-2 border-[#2563EB] pl-3 italic">
              &quot;When every minute matters, fragmented information can become a critical operational challenge.&quot;
            </p>
          </div>
        </section>

        {/* ================= 3. THE SOLUTION ================= */}
        <section id="solution" className="bg-white border-b border-[#E2E8F0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-[#2563EB] block text-xs font-bold tracking-widest uppercase">
                  THE SOLUTION
                </span>
                <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                  One intelligent coordination layer for disaster response.
                </h2>
                <p className="text-[#475569] text-sm leading-relaxed font-semibold">
                  ResQNet AI transforms incoming disaster information into structured, actionable recommendations that help emergency teams understand priorities, coordinate responders and allocate limited resources more effectively.
                </p>
                <div className="pt-2">
                  <Link href="/dashboard" passHref>
                    <Button variant="default" size="sm" className="bg-[#2563EB] text-white font-bold h-9 px-4">
                      Explore Dashboard
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <div className="space-y-4">
                {[
                  {
                    title: "AI Disaster Intelligence",
                    desc: "Analyzes incident information, identifies priority and recommends response actions.",
                  },
                  {
                    title: "Smart Resource Allocation",
                    desc: "Recommends how food, water, medicine, vehicles and rescue resources can be distributed.",
                  },
                  {
                    title: "Unified Coordination",
                    desc: "Provides authorities with a shared operational view of incidents, shelters, volunteers and resources.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-lg p-5 flex gap-4 items-start">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-extrabold">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A] mb-1">{item.title}</h3>
                      <p className="text-xs text-[#475569] font-semibold leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= 4. HOW IT WORKS ================= */}
        <section id="how-it-works" className="bg-[#F8FAFC] border-b border-[#E2E8F0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-16">
              <span className="text-[#2563EB] block text-xs font-bold tracking-widest uppercase">
                HOW IT WORKS
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                Coordinated Emergency Lifecycle
              </h2>
              <p className="text-[#475569] font-semibold mx-auto max-w-2xl text-xs sm:text-sm">
                A human-in-the-loop validation chain bringing raw ground telemetry into prioritized logistics dispatches.
              </p>
            </div>

            {/* Steps Container */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
              {[
                {
                  step: "01",
                  title: "Emergency Report",
                  desc: "A citizen or authorized user submits incident type, location, affected population and immediate requirements.",
                },
                {
                  step: "02",
                  title: "Data Validation",
                  desc: "The platform ingests and sanitizes telemetry coordinates and runs database integrity checks.",
                },
                {
                  step: "03",
                  title: "AI Incident Analysis",
                  desc: "The system processes incident information, extracts key details, and assesses severity.",
                },
                {
                  step: "04",
                  title: "Priority Assessment",
                  desc: "The AI decision-support layer generates an operational priority level (Low, Medium, High, Critical).",
                },
                {
                  step: "05",
                  title: "Resource Recommendation",
                  desc: "Food, water, medicine, vehicles and rescue supplies are dynamically recommended based on needs.",
                },
                {
                  step: "06",
                  title: "Responder Matching",
                  desc: "The platform scans for nearby available volunteers and emergency personnel with matching skills.",
                },
                {
                  step: "07",
                  title: "Authority Review",
                  desc: "Emergency authorities review AI recommendations before decisions are made, maintaining accountability.",
                },
                {
                  step: "08",
                  title: "Coordinated Response",
                  desc: "Incident status, assignments and resource inventories are updated and dispatched through the platform.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="border border-[#CBD5E1] bg-white rounded-lg p-4 relative hover:border-[#2563EB]/40 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] block uppercase tracking-wider mb-2">
                      Step {item.step}
                    </span>
                    <h3 className="text-xs font-extrabold text-[#0F172A] mb-1.5 uppercase leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[10px] text-[#475569] font-semibold leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#FFFBEB] text-[#D97706] text-[10px] font-bold uppercase tracking-wider border border-[#D97706]/20">
                ● AI recommendations assist human decision-makers rather than autonomously controlling emergency operations.
              </span>
            </div>
          </div>
        </section>

        {/* ================= 5. AGENTIC AI SYSTEM ================= */}
        <section id="ai-system" className="bg-white border-b border-[#E2E8F0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <div className="space-y-3">
                  <span className="text-[#2563EB] block text-xs font-bold tracking-widest uppercase">
                    AI COORDINATION
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                    Specialized AI capabilities working toward one response plan.
                  </h2>
                  <p className="text-[#475569] text-sm leading-relaxed font-semibold">
                    ResQNet AI uses specialized decision-support components to analyze different aspects of an emergency workflow and combine their outputs into actionable recommendations.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      name: "Incident Analysis Agent",
                      desc: "Analyzes incoming reports and identifies incident severity and priority.",
                    },
                    {
                      name: "Resource Allocation Agent",
                      desc: "Determines which categories of supplies and response resources may be required.",
                    },
                    {
                      name: "Volunteer Coordination Agent",
                      desc: "Matches available responders using relevant skills, availability and location.",
                    },
                    {
                      name: "Logistics Agent",
                      desc: "Supports route and deployment planning where routing information is available.",
                    },
                    {
                      name: "Decision Support Agent",
                      desc: "Combines operational information into a concise response recommendation for authorities.",
                    },
                  ].map((agent, idx) => (
                    <div key={idx} className="border-l-2 border-[#2563EB] pl-3.5 space-y-1">
                      <h3 className="text-xs font-extrabold text-[#0F172A] uppercase">{agent.name}</h3>
                      <p className="text-xs text-[#475569] font-semibold">{agent.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simple visual flowchart mapping */}
              <div className="border border-[#CBD5E1] bg-[#F8FAFC] rounded-lg p-6 flex flex-col justify-between h-[450px]">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0] pb-2 block">
                  AI Decision Pipeline
                </span>

                <div className="flex-1 flex flex-col justify-center items-center space-y-4 py-4">
                  {/* Step 1 */}
                  <div className="bg-white border border-[#CBD5E1] rounded px-3 py-1.5 text-center text-xs font-extrabold text-[#0F172A] shadow-sm w-44">
                    Incident
                  </div>
                  <ArrowDown className="size-4 text-[#64748B]" />

                  {/* Step 2 */}
                  <div className="bg-[#EFF6FF] border border-[#2563EB]/20 rounded px-3 py-1.5 text-center text-xs font-extrabold text-[#2563EB] shadow-sm w-44">
                    Incident Analysis
                  </div>
                  <ArrowDown className="size-4 text-[#64748B]" />

                  {/* Step 3 (Branch Grid) */}
                  <div className="grid grid-cols-3 gap-2 w-full max-w-[340px]">
                    <div className="bg-white border border-[#CBD5E1] rounded p-2 text-center text-[10px] font-bold text-[#475569] shadow-sm">
                      Resource Planning
                    </div>
                    <div className="bg-white border border-[#CBD5E1] rounded p-2 text-center text-[10px] font-bold text-[#475569] shadow-sm">
                      Volunteer Matching
                    </div>
                    <div className="bg-white border border-[#CBD5E1] rounded p-2 text-center text-[10px] font-bold text-[#475569] shadow-sm">
                      Logistics
                    </div>
                  </div>
                  <ArrowDown className="size-4 text-[#64748B]" />

                  {/* Step 4 */}
                  <div className="bg-[#EFF6FF] border border-[#2563EB]/20 rounded px-3 py-1.5 text-center text-xs font-extrabold text-[#2563EB] shadow-sm w-44">
                    Decision Support
                  </div>
                  <ArrowDown className="size-4 text-[#64748B]" />

                  {/* Step 5 */}
                  <div className="bg-[#F0FDF4] border border-[#16A34A]/20 rounded px-3 py-1.5 text-center text-xs font-extrabold text-[#16A34A] shadow-sm w-44">
                    Human Authority
                  </div>
                </div>

                <div className="border-t border-[#E2E8F0] pt-2 text-center text-[9px] text-[#64748B] font-bold">
                  AI recommendations support—not replace—human emergency decision-making.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 6. PLATFORM FEATURES ================= */}
        <section id="features" className="bg-[#F8FAFC] border-b border-[#E2E8F0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-16">
              <span className="text-[#2563EB] block text-xs font-bold tracking-widest uppercase">
                CAPABILITIES
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                Built around the emergency response workflow.
              </h2>
              <p className="text-[#475569] font-semibold mx-auto max-w-2xl text-xs sm:text-sm">
                A synchronized toolset supporting Area Command HQ, volunteers, and affected citizens.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Incident Reporting",
                  desc: "Submit disaster type, location, severity, affected population and emergency requirements.",
                },
                {
                  title: "AI Incident Assessment",
                  desc: "Generate priority classifications, summaries, risks and recommended actions.",
                },
                {
                  title: "Live Operations Dashboard",
                  desc: "Monitor active incidents and key response indicators.",
                },
                {
                  title: "Interactive Disaster Map",
                  desc: "Visualize incidents, shelters and operational locations geographically.",
                },
                {
                  title: "Resource Management",
                  desc: "Track availability and allocation of food, water, medicines, vehicles and other supplies.",
                },
                {
                  title: "Volunteer Coordination",
                  desc: "Manage responder availability, skills and assignments.",
                },
                {
                  title: "Shelter Management",
                  desc: "Track shelter capacity, occupancy and essential resource status.",
                },
                {
                  title: "Analytics",
                  desc: "Analyze incident trends, resource usage and response performance.",
                },
              ].map((feat, idx) => (
                <div key={idx} className="border border-[#E2E8F0] bg-white rounded-lg p-5 shadow-sm">
                  <span className="text-primary font-mono text-xs font-extrabold block mb-2">
                    FEAT // 0{idx + 1}
                  </span>
                  <h3 className="text-sm font-bold text-[#0F172A] mb-1">{feat.title}</h3>
                  <p className="text-xs text-[#475569] font-semibold leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 7. STAKEHOLDERS ================= */}
        <section id="stakeholders" className="bg-white border-b border-[#E2E8F0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-16">
              <span className="text-[#2563EB] block text-xs font-bold tracking-widest uppercase">
                STAKEHOLDERS
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                One platform. Multiple response teams.
              </h2>
              <p className="text-[#475569] font-semibold mx-auto max-w-2xl text-xs sm:text-sm">
                ResQNet AI is designed to support the entire disaster response ecosystem.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Citizens", desc: "Report incidents and request assistance.", icon: Users },
                { title: "Emergency Authorities", desc: "Monitor incidents, review recommendations and coordinate operations.", icon: ShieldAlert },
                { title: "NGOs", desc: "Coordinate humanitarian supplies and relief activities.", icon: Heart },
                { title: "Volunteers", desc: "Receive and manage response assignments.", icon: UserCheck },
                { title: "Shelters", desc: "Communicate occupancy and supply requirements.", icon: Home },
                { title: "Healthcare Providers", desc: "Support medical response coordination where integrated.", icon: Activity },
              ].map((stake, idx) => (
                <div key={idx} className="border border-[#CBD5E1] bg-[#F8FAFC] rounded-lg p-5 flex items-start gap-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded bg-[#EFF6FF] text-[#2563EB]">
                    <stake.icon className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] mb-1">{stake.title}</h3>
                    <p className="text-xs text-[#475569] font-semibold leading-relaxed">{stake.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 8. BENEFITS (IMPACT) ================= */}
        <section id="impact" className="bg-[#F8FAFC] border-b border-[#E2E8F0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-4 max-w-3xl mb-12">
              <span className="text-[#2563EB] block text-xs font-bold tracking-widest uppercase">
                IMPACT
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                From fragmented response to coordinated action.
              </h2>
            </div>

            {/* Comparison Matrix */}
            <div className="grid gap-6 md:grid-cols-2 mb-12">
              {/* Traditional */}
              <div className="border border-[#E2E8F0] bg-white rounded-lg p-6">
                <h3 className="text-sm font-extrabold text-[#DC2626] uppercase tracking-wider block mb-4 border-b border-[#E2E8F0] pb-2">
                  Traditional Challenges
                </h3>
                <ul className="space-y-3 text-xs text-[#475569] font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="text-[#DC2626] font-bold">✕</span> Manual prioritization
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#DC2626] font-bold">✕</span> Fragmented information
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#DC2626] font-bold">✕</span> Limited resource visibility
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#DC2626] font-bold">✕</span> Disconnected volunteer coordination
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#DC2626] font-bold">✕</span> Reactive shortage management
                  </li>
                </ul>
              </div>

              {/* ResQNet AI */}
              <div className="border border-[#2563EB]/20 bg-white rounded-lg p-6">
                <h3 className="text-sm font-extrabold text-[#16A34A] uppercase tracking-wider block mb-4 border-b border-[#E2E8F0] pb-2">
                  With ResQNet AI
                </h3>
                <ul className="space-y-3 text-xs text-[#475569] font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="text-[#16A34A] font-bold">✓</span> AI-assisted prioritization
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#16A34A] font-bold">✓</span> Shared operational information
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#16A34A] font-bold">✓</span> Centralized resource visibility
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#16A34A] font-bold">✓</span> Structured responder coordination
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#16A34A] font-bold">✓</span> Data-driven planning
                  </li>
                </ul>
              </div>
            </div>

            {/* Stakeholder Benefits List */}
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  role: "Authorities",
                  points: ["Faster situational understanding", "Better resource visibility", "Centralized coordination"],
                },
                {
                  role: "NGOs",
                  points: ["Better relief allocation", "Reduced duplication", "Improved operational visibility"],
                },
                {
                  role: "Communities",
                  points: ["Faster communication of needs", "Better access to coordinated relief", "Stronger disaster resilience"],
                },
              ].map((item, idx) => (
                <div key={idx} className="border border-[#CBD5E1] bg-white rounded-lg p-5">
                  <h4 className="text-xs font-extrabold text-[#0F172A] uppercase mb-3 tracking-wider">{item.role} Benefits</h4>
                  <ul className="space-y-2 text-xs text-[#475569] font-semibold">
                    {item.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <span className="text-[#2563EB] font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 9. UN SUSTAINABLE DEVELOPMENT GOALS ================= */}
        <section id="sdgs" className="bg-white border-b border-[#E2E8F0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-16">
              <span className="text-[#2563EB] block text-xs font-bold tracking-widest uppercase">
                SUSTAINABLE DEVELOPMENT
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                Technology aligned with humanitarian impact.
              </h2>
              <p className="text-[#475569] font-semibold mx-auto max-w-2xl text-xs sm:text-sm">
                How ResQNet AI supports international targets for resilience and relief.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { goal: "SDG 1 — No Poverty", desc: "Supports faster disaster recovery and helps reduce the secondary socioeconomic impact of emergencies." },
                { goal: "SDG 2 — Zero Hunger", desc: "Supports better allocation of food and essential relief supplies." },
                { goal: "SDG 3 — Good Health and Well-being", desc: "Supports prioritization of medical requirements and emergency assistance." },
                { goal: "SDG 11 — Sustainable Cities and Communities", desc: "Contributes to stronger and more resilient disaster-response systems." },
                { goal: "SDG 13 — Climate Action", desc: "Supports preparedness and response to climate-related emergencies." },
                { goal: "SDG 17 — Partnerships for the Goals", desc: "Creates a shared coordination layer for authorities, NGOs, volunteers, and other response organizations." },
              ].map((sdg, idx) => (
                <div key={idx} className="border border-[#CBD5E1] bg-[#F8FAFC] rounded-lg p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A] mb-2">{sdg.goal}</h3>
                    <p className="text-xs text-[#475569] font-semibold leading-relaxed">{sdg.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 10. TECHNOLOGY ================= */}
        <section id="technology" className="bg-[#F8FAFC] border-b border-[#E2E8F0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-16">
              <span className="text-[#2563EB] block text-xs font-bold tracking-widest uppercase">
                IMPLEMENTATION
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                Built as a modern, deployable web platform.
              </h2>
              <p className="text-[#475569] font-semibold mx-auto max-w-2xl text-xs sm:text-sm">
                The technical stack powering ResQNet AI and its coordination pipeline.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {[
                { title: "Application", desc: "Next.js, TypeScript, Tailwind CSS", icon: FileCode2 },
                { title: "Data Layer", desc: "Supabase, PostgreSQL", icon: Server },
                { title: "AI Model", desc: "Gemini API, Decision-support", icon: Zap },
                { title: "GIS Map", desc: "Leaflet, OpenStreetMap", icon: Compass },
                { title: "Visualization", desc: "SVG & Custom Metrics Charts", icon: Activity },
                { title: "Deployment", desc: "Vercel Web App Hosting", icon: Globe },
              ].map((tech, idx) => (
                <div key={idx} className="border border-[#E2E8F0] bg-white rounded-lg p-5 text-center">
                  <div className="flex size-9 items-center justify-center rounded-md bg-[#EFF6FF] text-[#2563EB] mx-auto mb-3">
                    <tech.icon className="size-4.5" />
                  </div>
                  <h3 className="text-xs font-bold text-[#0F172A] mb-1.5 uppercase">{tech.title}</h3>
                  <p className="text-[10px] text-[#475569] font-bold leading-normal">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 11. SYSTEM ARCHITECTURE ================= */}
        <section id="architecture" className="bg-white border-b border-[#E2E8F0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-16">
              <span className="text-[#2563EB] block text-xs font-bold tracking-widest uppercase">
                SYSTEM ARCHITECTURE
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                Tactical Topology
              </h2>
            </div>

            {/* Simple Visual Diagram */}
            <div className="border border-[#CBD5E1] bg-[#F8FAFC] rounded-lg p-8 max-w-xl mx-auto flex flex-col items-center space-y-4">
              <div className="bg-white border border-[#CBD5E1] rounded px-3 py-1.5 text-center text-xs font-extrabold text-[#0F172A] shadow-sm w-48">
                Citizen / Responder / Authority
              </div>
              <ArrowDown className="size-4 text-[#64748B]" />

              <div className="bg-white border border-[#CBD5E1] rounded px-3 py-1.5 text-center text-xs font-extrabold text-[#0F172A] shadow-sm w-48">
                ResQNet Web App
              </div>
              <ArrowDown className="size-4 text-[#64748B]" />

              <div className="bg-white border border-[#CBD5E1] rounded px-3 py-1.5 text-center text-xs font-extrabold text-[#0F172A] shadow-sm w-48">
                Application / API Layer
              </div>
              <ArrowDown className="size-4 text-[#64748B]" />

              <div className="grid grid-cols-3 gap-2 w-full text-center">
                <div className="bg-white border border-[#CBD5E1] rounded p-2 text-[10px] font-bold text-[#475569] shadow-sm">
                  Database
                </div>
                <div className="bg-white border border-[#CBD5E1] rounded p-2 text-[10px] font-bold text-[#475569] shadow-sm">
                  AI Engine
                </div>
                <div className="bg-white border border-[#CBD5E1] rounded p-2 text-[10px] font-bold text-[#475569] shadow-sm">
                  Map Services
                </div>
              </div>
              <ArrowDown className="size-4 text-[#64748B]" />

              <div className="bg-white border border-[#CBD5E1] rounded px-3 py-1.5 text-center text-xs font-extrabold text-[#0F172A] shadow-sm w-48">
                Decision Support Layer
              </div>
              <ArrowDown className="size-4 text-[#64748B]" />

              <div className="bg-[#EFF6FF] border border-[#2563EB]/20 rounded px-3 py-1.5 text-center text-xs font-extrabold text-[#2563EB] shadow-sm w-48 animate-pulse">
                Operations Dashboard
              </div>
            </div>
          </div>
        </section>

        {/* ================= 12. PROTOTYPE / LIVE SYSTEM ================= */}
        <section id="prototype" className="bg-[#F8FAFC] border-b border-[#E2E8F0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <div className="space-y-3">
                  <span className="text-[#2563EB] block text-xs font-bold tracking-widest uppercase">
                    WORKING PROTOTYPE
                  </span>
                  <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                    Explore ResQNet AI in action.
                  </h2>
                  <p className="text-[#475569] text-sm leading-relaxed font-semibold">
                    The current implementation demonstrates the core disaster-response workflow with a fully functioning telemetry portal.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    "Incident reporting",
                    "AI-assisted incident analysis",
                    "Priority classification",
                    "Resource recommendations",
                    "Operational dashboard",
                    "Volunteer coordination",
                    "Shelter/resource tracking",
                    "Interactive map",
                  ].map((cap, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                      <CheckCircle2 className="size-4 text-[#16A34A] shrink-0" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link href="/dashboard" passHref>
                    <Button variant="default" size="sm" className="bg-[#2563EB] font-bold h-9 px-4">
                      Open Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={() => setReportModalOpen(true)}
                    variant="destructive"
                    size="sm"
                    className="font-bold h-9 px-4"
                  >
                    Report Emergency
                  </Button>
                  <a
                    href="https://github.com/gtathelegend/ResQNet-AI"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="font-bold h-9 px-4 flex items-center gap-1">
                      <Eye className="size-3.5" />
                      <span>View Source on GitHub</span>
                    </Button>
                  </a>
                </div>
              </div>

              {/* Stakeholder Demo Mock Screen */}
              <div className="border border-[#CBD5E1] bg-white rounded-lg p-5 shadow-sm space-y-4">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                  Command Simulator Credentials
                </span>

                <div className="space-y-2">
                  <div className="border border-[#E2E8F0] rounded p-2.5 bg-[#F8FAFC] flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold text-[#64748B] block">AUTHORITY</span>
                      <strong className="text-xs text-[#0F172A] font-extrabold">authority@resqnet.ai</strong>
                    </div>
                    <span className="text-[10px] font-bold text-[#475569] bg-white px-2 py-0.5 border border-[#CBD5E1] rounded">
                      Password: password
                    </span>
                  </div>

                  <div className="border border-[#E2E8F0] rounded p-2.5 bg-[#F8FAFC] flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold text-[#64748B] block">VOLUNTEER</span>
                      <strong className="text-xs text-[#0F172A] font-extrabold">volunteer@resqnet.ai</strong>
                    </div>
                    <span className="text-[10px] font-bold text-[#475569] bg-white px-2 py-0.5 border border-[#CBD5E1] rounded">
                      Password: password
                    </span>
                  </div>

                  <div className="border border-[#E2E8F0] rounded p-2.5 bg-[#F8FAFC] flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold text-[#64748B] block">CITIZEN</span>
                      <strong className="text-xs text-[#0F172A] font-extrabold">citizen@resqnet.ai</strong>
                    </div>
                    <span className="text-[10px] font-bold text-[#475569] bg-white px-2 py-0.5 border border-[#CBD5E1] rounded">
                      Password: password
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 13. HUMAN-IN-THE-LOOP AI ================= */}
        <section className="bg-white border-b border-[#E2E8F0] py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
              AI assists. Humans remain accountable.
            </h2>
            <p className="text-[#475569] text-sm leading-relaxed max-w-2xl mx-auto font-semibold">
              Emergency response decisions can involve safety, medical priorities and limited critical resources. ResQNet AI is therefore designed as a decision-support platform. AI analyzes information and recommends actions, while authorized human responders retain responsibility for operational decisions.
            </p>

            {/* Flow block */}
            <div className="border border-[#CBD5E1] bg-[#F8FAFC] rounded-lg p-5 grid grid-cols-5 gap-2 max-w-xl mx-auto items-center text-center">
              {[
                { step: "DATA", color: "bg-white text-[#475569]" },
                { step: "AI ANALYSIS", color: "bg-[#EFF6FF] text-[#2563EB]" },
                { step: "RECOMMENDATION", color: "bg-[#EFF6FF] text-[#2563EB]" },
                { step: "HUMAN REVIEW", color: "bg-[#FFFBEB] text-[#D97706]" },
                { step: "ACTION", color: "bg-[#F0FDF4] text-[#16A34A]" },
              ].map((f, idx) => (
                <React.Fragment key={idx}>
                  <div className={`border border-[#CBD5E1] rounded py-2 px-1 text-[9px] font-extrabold shadow-sm ${f.color}`}>
                    {f.step}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 14. FUTURE ROADMAP ================= */}
        <section id="roadmap" className="bg-[#F8FAFC] border-b border-[#E2E8F0] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-16">
              <span className="text-[#2563EB] block text-xs font-bold tracking-widest uppercase">
                FUTURE SCOPE
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">
                Extending ResQNet beyond the prototype.
              </h2>
              <p className="text-[#475569] font-semibold mx-auto max-w-2xl text-xs sm:text-sm">
                Proposed extensions for production command operations (conceptual integrations).
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {[
                "Real-time weather feeds",
                "Government emergency APIs",
                "Satellite imagery",
                "Drone-based damage assessment",
                "IoT early-warning sensors",
                "SMS emergency notifications",
                "Offline-first emergency reporting",
                "Multilingual voice reporting",
                "Predictive flood and wildfire models",
                "Advanced route optimization",
              ].map((road, idx) => (
                <div key={idx} className="border border-[#E2E8F0] bg-white rounded-lg p-4 shadow-sm text-center">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB] text-[10px] font-bold mb-3">
                    +{idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-[#0F172A]">{road}</h4>
                  <span className="text-[9px] text-[#64748B] font-extrabold block mt-1.5 uppercase">Future Phase</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= 15. FINAL CALL TO ACTION ================= */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-4xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
              Better information.<br />
              Better coordination.<br />
              Faster response.
            </h2>

            <p className="text-[#475569] font-semibold mx-auto max-w-lg text-xs sm:text-sm leading-relaxed">
              ResQNet AI demonstrates how responsible AI and intelligent automation can support communities and emergency teams when coordination matters most.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/dashboard" passHref>
                <Button variant="default" size="sm" className="bg-[#2563EB] font-bold h-10 px-5">
                  Explore ResQNet AI
                </Button>
              </Link>
              <Button
                onClick={() => setReportModalOpen(true)}
                variant="destructive"
                size="sm"
                className="font-bold h-10 px-5"
              >
                Report Emergency
              </Button>
              <a
                href="https://github.com/gtathelegend/ResQNet-AI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <Button variant="outline" size="sm" className="font-bold h-10 px-5 flex items-center gap-1.5">
                  <Eye className="size-4" />
                  <span>View GitHub</span>
                </Button>
              </a>
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
            <label className="text-[#0F172A] block text-xs font-bold uppercase tracking-wider">
              Emergency Category
            </label>
            <select
              className="border border-[#CBD5E1] bg-white text-[#0F172A] w-full rounded-md px-3 py-2 text-xs outline-none"
              required
            >
              <option value="flooding">Severe Flooding / Inundation</option>
              <option value="fire">Wildfire / Structural Fire</option>
              <option value="medical">Mass Medical Emergency</option>
              <option value="power">Power Grid / Infrastructure Failure</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[#0F172A] block text-xs font-bold uppercase tracking-wider">
              Coordinates
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Latitude (E.g. 40.7128)"
                className="border border-[#CBD5E1] bg-white text-[#0F172A] w-full rounded-md p-2.5 text-xs outline-none"
                required
              />
              <input
                type="text"
                placeholder="Longitude (E.g. -74.0060)"
                className="border border-[#CBD5E1] bg-white text-[#0F172A] w-full rounded-md p-2.5 text-xs outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[#0F172A] block text-xs font-bold uppercase tracking-wider">
              Operational Status / Description
            </label>
            <textarea
              placeholder="State status, injuries, water level, blocks, etc."
              className="border border-[#CBD5E1] bg-white text-[#0F172A] w-full rounded-md p-2.5 text-xs outline-none"
              rows={3}
              required
            />
          </div>

          <div className="border-t border-[#E2E8F0] flex justify-end gap-2 pt-4">
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
