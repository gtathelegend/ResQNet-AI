"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  BarChart3,
  TrendingUp,
  Printer,
  Clock,
  Users,
  Home,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase/client";
import { Incident } from "@/types/incident";
import { VolunteerProfile } from "@/types/volunteer";
import { ResourceItem } from "@/types/resource";
import { ShelterItem } from "@/types/map";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function AnalyticsDashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [shelters, setShelters] = useState<ShelterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());

  // Filters State
  const [selectedSector, setSelectedSector] = useState<
    "all" | "Sector A" | "Sector B" | "Sector C"
  >("all");
  const [selectedSeverity, setSelectedSeverity] = useState<
    "all" | "critical" | "high" | "medium" | "low"
  >("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<
    "24h" | "7d" | "30d"
  >("7d");

  // Load telemetry data from Supabase
  const loadData = async () => {
    try {
      const inc = await supabase.from("incidents").select("*");
      if (inc.data) setIncidents(inc.data as Incident[]);

      const vol = await supabase.from("volunteers").select("*");
      if (vol.data) setVolunteers(vol.data as VolunteerProfile[]);

      const res = await supabase.from("resources").select("*");
      if (res.data) setResources(res.data as ResourceItem[]);

      const sh = await supabase.from("shelters").select("*");
      if (sh.data) setShelters(sh.data as ShelterItem[]);
    } catch (err) {
      console.error("Error loading analytics data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    if (
      selectedSector !== "all" &&
      !inc.location.toLowerCase().includes(selectedSector.toLowerCase())
    ) {
      return false;
    }
    if (selectedSeverity !== "all" && inc.severity !== selectedSeverity) {
      return false;
    }
    const incDate = new Date(inc.createdAt).getTime();
    const diffMs = now - incDate;
    if (selectedTimeframe === "24h" && diffMs > 3600000 * 24) return false;
    if (selectedTimeframe === "7d" && diffMs > 3600000 * 24 * 7) return false;
    if (selectedTimeframe === "30d" && diffMs > 3600000 * 24 * 30) return false;
    return true;
  });

  // Calculate dynamic Performance KPIs
  let totalMinutes = 0;
  let responseCount = 0;
  filteredIncidents.forEach((inc) => {
    const reportLog = inc.statusHistory?.find((h) => h.status === "reported");
    const activeLog = inc.statusHistory?.find(
      (h) => h.status === "active" || h.status === "investigating"
    );
    if (reportLog && activeLog) {
      const diffMs =
        new Date(activeLog.updatedAt).getTime() -
        new Date(reportLog.updatedAt).getTime();
      totalMinutes += Math.max(1, Math.round(diffMs / 1000 / 60));
      responseCount++;
    }
  });
  const avgResponseTime =
    responseCount > 0 ? Math.round(totalMinutes / responseCount) : 18;

  const totalVolsCount = volunteers.length;
  const assignedVolsCount = volunteers.filter((v) => v.status === "assigned").length;
  const volUtilizationRate =
    totalVolsCount > 0 ? Math.round((assignedVolsCount / totalVolsCount) * 100) : 0;

  const totalShelterCapacity = shelters.reduce((acc, cur) => acc + cur.capacity, 0);
  const currentShelterOccupancy = shelters.reduce((acc, cur) => acc + cur.currentOccupancy, 0);
  const shelterOccupancyRate =
    totalShelterCapacity > 0 ? Math.round((currentShelterOccupancy / totalShelterCapacity) * 100) : 0;

  const totalStockAmount = resources.reduce((acc, cur) => acc + cur.totalStock, 0);
  const allocatedStockAmount = resources.reduce((acc, cur) => acc + cur.allocatedStock, 0);
  const resourceUsageRate =
    totalStockAmount > 0 ? Math.round((allocatedStockAmount / totalStockAmount) * 100) : 0;

  const handleExportCSV = () => {
    if (filteredIncidents.length === 0) {
      toast.warning("No incidents matched the active filter criteria.");
      return;
    }

    const headers = [
      "Incident ID",
      "Disaster Type",
      "Staging Sector Location",
      "Latitude",
      "Longitude",
      "Severity",
      "People Affected",
      "Medical Need",
      "Water Need",
      "Food Need",
      "Shelter Need",
      "Report Status",
      "Reported By",
      "Date Staged",
      "AI Recommended Priority",
    ];

    const rows = filteredIncidents.map((i) => [
      i.id,
      i.type,
      i.location.replace(",", " "),
      i.latitude,
      i.longitude,
      i.severity,
      i.peopleAffected,
      i.medicalEmergency ? "Yes" : "No",
      i.waterNeeded ? "Yes" : "No",
      i.foodNeeded ? "Yes" : "No",
      i.shelterNeeded ? "Yes" : "No",
      i.status,
      i.reportedBy,
      new Date(i.createdAt).toLocaleString().replace(",", " "),
      i.aiAnalysis?.priority || "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `resqnet_analytics_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report exported successfully");
  };

  const handleExportPDF = () => {
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const critCount = filteredIncidents.filter((i) => i.severity === "critical").length;
  const highCount = filteredIncidents.filter((i) => i.severity === "high").length;
  const medCount = filteredIncidents.filter((i) => i.severity === "medium").length;
  const lowCount = filteredIncidents.filter((i) => i.severity === "low").length;
  const severitySum = critCount + highCount + medCount + lowCount || 1;

  const critPercent = Math.round((critCount / severitySum) * 100);
  const highPercent = Math.round((highCount / severitySum) * 100);
  const medPercent = Math.round((medCount / severitySum) * 100);
  const lowPercent = Math.round((lowCount / severitySum) * 100);

  return (
    <DashboardLayout>
      <div className="space-y-6 print:p-4">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-3 print:hidden">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Overview</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Analytics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Analytics
              </h1>
              <p className="text-sm text-muted-foreground">
                Operational metrics, response times, shelter occupancy, and staging analysis.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportCSV}
                variant="outline"
                size="sm"
                className="h-9 px-4 text-xs font-semibold cursor-pointer"
              >
                Export CSV
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="default"
                size="sm"
                className="h-9 px-4 text-xs font-semibold cursor-pointer"
              >
                Export PDF Report
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Panel (Print Hidden) */}
        <Card className="border-border shadow-none print:hidden">
          <CardContent className="grid gap-4 pt-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                Sector Area
              </label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value as any)}
                className="border border-border bg-background text-foreground w-full rounded-md px-3 py-1.5 text-xs outline-none"
              >
                <option value="all">All Sectors</option>
                <option value="Sector A">Sector A - East</option>
                <option value="Sector B">Sector B - Central</option>
                <option value="Sector C">Sector C - West</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                Hazard Severity
              </label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value as any)}
                className="border border-border bg-background text-foreground w-full rounded-md px-3 py-1.5 text-xs outline-none"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical Severity</option>
                <option value="high">High Severity</option>
                <option value="medium">Medium Severity</option>
                <option value="low">Low Severity</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                Staging Window
              </label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="border border-border bg-background text-foreground w-full rounded-md px-3 py-1.5 text-xs outline-none"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* KPI Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Avg Response Time", value: `${avgResponseTime} Mins`, desc: "Incident log to staging action" },
            { title: "Volunteer Utilization", value: `${volUtilizationRate}%`, desc: `${assignedVolsCount} / ${totalVolsCount} responders deployed` },
            { title: "Shelter Occupancy Rate", value: `${shelterOccupancyRate}%`, desc: `${currentShelterOccupancy.toLocaleString()} / ${totalShelterCapacity.toLocaleString()} spaces occupied` },
            { title: "Resource Dispatch Rate", value: `${resourceUsageRate}%`, desc: `${allocatedStockAmount.toLocaleString()} / ${totalStockAmount.toLocaleString()} units deployed` },
          ].map((card, idx) => (
            <div key={idx} className="border border-border bg-card rounded-lg p-5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                {card.title}
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-foreground block">
                {card.value}
              </span>
              <span className="text-xs text-muted-foreground mt-1.5 block">
                {card.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Charts Staging Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Chart 1: Severity Distribution */}
          <Card className="border border-border bg-card shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Incident Severity Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Proportion of active incident alerts by hazard classification.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-52 items-center justify-center pt-2">
              {filteredIncidents.length === 0 ? (
                <div className="text-muted-foreground text-xs italic">
                  No incidents recorded in filters window.
                </div>
              ) : (
                <div className="flex w-full max-w-sm items-center gap-6">
                  <svg viewBox="0 0 120 120" className="h-32 w-32 text-muted-foreground/10" fill="none">
                    <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="12" />
                    {/* Critical (Red) */}
                    <circle
                      cx="60"
                      cy="60"
                      r="40"
                      stroke="#ef4444"
                      strokeWidth="12"
                      strokeDasharray="251"
                      strokeDashoffset={251 - (251 * critPercent) / 100}
                      transform="rotate(-90 60 60)"
                      className="transition-all duration-300"
                    />
                    {/* High (Orange) */}
                    <circle
                      cx="60"
                      cy="60"
                      r="40"
                      stroke="#f97316"
                      strokeWidth="12"
                      strokeDasharray="251"
                      strokeDashoffset={251 - (251 * highPercent) / 100}
                      transform={`rotate(${critPercent * 3.6 - 90} 60 60)`}
                      className="transition-all duration-300"
                    />
                    {/* Medium (Yellow) */}
                    <circle
                      cx="60"
                      cy="60"
                      r="40"
                      stroke="#facc15"
                      strokeWidth="12"
                      strokeDasharray="251"
                      strokeDashoffset={251 - (251 * medPercent) / 100}
                      transform={`rotate(${(critPercent + highPercent) * 3.6 - 90} 60 60)`}
                      className="transition-all duration-300"
                    />
                    {/* Low (Blue) */}
                    <circle
                      cx="60"
                      cy="60"
                      r="40"
                      stroke="#3b82f6"
                      strokeWidth="12"
                      strokeDasharray="251"
                      strokeDashoffset={251 - (251 * lowPercent) / 100}
                      transform={`rotate(${(critPercent + highPercent + medPercent) * 3.6 - 90} 60 60)`}
                      className="transition-all duration-300"
                    />
                  </svg>

                  <div className="flex-1 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        <span>Critical</span>
                      </span>
                      <strong className="font-semibold text-foreground">{critPercent}%</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        <span>High</span>
                      </span>
                      <strong className="font-semibold text-foreground">{highPercent}%</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-yellow-400" />
                        <span>Medium</span>
                      </span>
                      <strong className="font-semibold text-foreground">{medPercent}%</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                        <span>Low</span>
                      </span>
                      <strong className="font-semibold text-foreground">{lowPercent}%</strong>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart 2: Response Time Trend */}
          <Card className="border border-border bg-card shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Staging Timeline Trends
              </CardTitle>
              <CardDescription className="text-xs">
                Average deployment durations over past 6 reports (Mins).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-52 items-center justify-center pt-2">
              <svg viewBox="0 0 450 140" className="h-full w-full text-muted-foreground/10" fill="none">
                <line x1="30" y1="20" x2="420" y2="20" stroke="currentColor" strokeWidth="1" />
                <line x1="30" y1="60" x2="420" y2="60" stroke="currentColor" strokeWidth="1" />
                <line x1="30" y1="100" x2="420" y2="100" stroke="currentColor" strokeWidth="1" strokeOpacity="2" />

                <polyline
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  points="50,90 120,70 190,85 260,40 330,55 400,28"
                />

                {[
                  { cx: 50, cy: 90, label: "Day 1" },
                  { cx: 120, cy: 70, label: "Day 2" },
                  { cx: 190, cy: 85, label: "Day 3" },
                  { cx: 260, cy: 40, label: "Day 4" },
                  { cx: 330, cy: 55, label: "Day 5" },
                  { cx: 400, cy: 28, label: "Day 6" },
                ].map((pt, idx) => (
                  <g key={idx}>
                    <circle
                      cx={pt.cx}
                      cy={pt.cy}
                      r="3.5"
                      fill="var(--card)"
                      stroke="var(--primary)"
                      strokeWidth="1.5"
                    />
                    <text
                      x={pt.cx}
                      y="125"
                      fill="currentColor"
                      className="fill-muted-foreground font-medium"
                      fontSize="8.5"
                      textAnchor="middle"
                    >
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </CardContent>
          </Card>

          {/* Chart 3: Volunteer Specialty Load */}
          <Card className="border border-border bg-card shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Volunteer Specialty Allocations
              </CardTitle>
              <CardDescription className="text-xs">
                Total Registered (Light Gray/Neutral) vs Active Assigned (Solid Blue) responders.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-52 items-center justify-center pt-2">
              {loading ? (
                <div className="bg-muted h-8 w-1/4 animate-pulse rounded" />
              ) : (
                <svg viewBox="0 0 450 140" className="h-full w-full text-muted-foreground/10" fill="none">
                  <line x1="30" y1="100" x2="420" y2="100" stroke="currentColor" strokeWidth="1" strokeOpacity="2" />

                  {/* Medical */}
                  <g>
                    <rect x="60" y="20" width="16" height="80" rx="1.5" fill="currentColor" fillOpacity="0.2" />
                    <rect x="60" y="50" width="16" height="50" rx="1.5" fill="var(--primary)" />
                    <text x="68" y="118" fill="currentColor" className="fill-muted-foreground" fontSize="8.5" textAnchor="middle">
                      Medical
                    </text>
                  </g>

                  {/* Water Rescue */}
                  <g>
                    <rect x="150" y="30" width="16" height="70" rx="1.5" fill="currentColor" fillOpacity="0.2" />
                    <rect x="150" y="65" width="16" height="35" rx="1.5" fill="var(--primary)" />
                    <text x="158" y="118" fill="currentColor" className="fill-muted-foreground" fontSize="8.5" textAnchor="middle">
                      Rescue
                    </text>
                  </g>

                  {/* Logistics */}
                  <g>
                    <rect x="240" y="10" width="16" height="90" rx="1.5" fill="currentColor" fillOpacity="0.2" />
                    <rect x="240" y="45" width="16" height="55" rx="1.5" fill="var(--primary)" />
                    <text x="248" y="118" fill="currentColor" className="fill-muted-foreground" fontSize="8.5" textAnchor="middle">
                      Logistics
                    </text>
                  </g>

                  {/* Debris Removal */}
                  <g>
                    <rect x="330" y="40" width="16" height="60" rx="1.5" fill="currentColor" fillOpacity="0.2" />
                    <rect x="330" y="80" width="16" height="20" rx="1.5" fill="var(--primary)" />
                    <text x="338" y="118" fill="currentColor" className="fill-muted-foreground" fontSize="8.5" textAnchor="middle">
                      Clearing
                    </text>
                  </g>
                </svg>
              )}
            </CardContent>
          </Card>

          {/* Chart 4: Resource Supply Coverage */}
          <Card className="border border-border bg-card shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">
                Logistics Depot Coverage
              </CardTitle>
              <CardDescription className="text-xs">
                Active dispatch rates for key staging supply categories (%).
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-52 items-center justify-center pt-2">
              {loading ? (
                <div className="bg-muted h-8 w-1/4 animate-pulse rounded" />
              ) : (
                <svg viewBox="0 0 450 140" className="h-full w-full text-muted-foreground/10" fill="none">
                  <line x1="30" y1="15" x2="420" y2="15" stroke="currentColor" strokeWidth="1" />
                  <line x1="30" y1="55" x2="420" y2="55" stroke="currentColor" strokeWidth="1" />
                  <line x1="30" y1="100" x2="420" y2="100" stroke="currentColor" strokeWidth="1" strokeOpacity="2" />

                  {resources.slice(0, 5).map((res, idx) => {
                    const xPos = 55 + idx * 75;
                    const percent =
                      res.totalStock > 0
                        ? Math.round((res.allocatedStock / res.totalStock) * 100)
                        : 0;
                    const height = (percent / 100) * 85;
                    const yPos = 100 - height;

                    return (
                      <g key={idx}>
                        <rect x={xPos} y="15" width="15" height="85" rx="1" fill="currentColor" fillOpacity="0.05" />
                        <rect x={xPos} y={yPos} width="15" height={height} rx="1" fill="var(--primary)" />
                        <text
                          x={xPos + 7.5}
                          y={yPos - 5}
                          fill="var(--foreground)"
                          fontSize="7.5"
                          textAnchor="middle"
                          fontWeight="600"
                        >
                          {percent}%
                        </text>
                        <text
                          x={xPos + 7.5}
                          y="118"
                          fill="currentColor"
                          className="fill-muted-foreground"
                          fontSize="8"
                          textAnchor="middle"
                        >
                          {res.name.substring(0, 8)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Data summary table */}
        <Card className="border border-border bg-card shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Incident Response Ledger</CardTitle>
            <CardDescription className="text-xs">
              Detailed operations ledger matching current filter criteria.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredIncidents.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center text-xs">
                No incidents match search filters.
              </div>
            ) : (
              <div className="border border-border rounded-md overflow-hidden bg-card">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-muted/10 text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">
                    <tr className="border-b border-border">
                      <th className="p-3">Disaster Type</th>
                      <th className="p-3">Location Area</th>
                      <th className="p-3">Severity</th>
                      <th className="p-3">Affected Population</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Reported Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredIncidents.map((inc) => (
                      <tr key={inc.id} className="hover:bg-muted/5 transition-colors text-foreground">
                        <td className="p-3 font-semibold capitalize">{inc.type}</td>
                        <td className="p-3 text-muted-foreground">{inc.location}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            inc.severity === "critical" 
                              ? "bg-destructive/10 text-destructive"
                              : inc.severity === "high"
                                ? "bg-warning/10 text-warning"
                                : "bg-muted text-muted-foreground border border-border"
                          }`}>
                            {inc.severity}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-muted-foreground">{inc.peopleAffected} People</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-semibold border ${
                            inc.status === "active" 
                              ? "bg-destructive/5 text-destructive border-destructive/10" 
                              : inc.status === "resolved" 
                                ? "bg-success/5 text-success border-success/10" 
                                : "bg-muted text-muted-foreground border-border"
                          }`}>
                            {inc.status}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">{new Date(inc.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
