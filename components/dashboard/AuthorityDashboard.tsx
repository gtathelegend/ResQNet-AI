"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertTriangle,
  Plus,
  BellRing,
  Activity,
  Users,
  Compass,
  Home,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Database,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserSession } from "@/types/auth";
import { supabase } from "@/lib/supabase/client";
import { Incident } from "@/types/incident";

interface AuthorityDashboardProps {
  user: UserSession["user"];
}

export function AuthorityDashboard({ user }: AuthorityDashboardProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dispatchSector, setDispatchSector] = useState("Sector A");
  const [dispatchType, setDispatchType] = useState("flooding");

  // Fetch incidents dynamically
  useEffect(() => {
    async function loadIncidents() {
      try {
        const { data, error } = await supabase
          .from("incidents")
          .select("*")
          .order("createdAt", { ascending: false });

        if (!error && data) {
          setIncidents(data as Incident[]);
        }
      } catch (err) {
        console.error("Error loading incidents:", err);
      } finally {
        setLoading(false);
      }
    }
    loadIncidents();
  }, []);

  // Dynamic calculations based on real database state
  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  const activeCount = activeIncidents.length;
  const criticalCount = activeIncidents.filter(
    (i) => i.severity === "critical" || i.severity === "high"
  ).length;
  const totalAffected = activeIncidents.reduce(
    (sum, i) => sum + i.peopleAffected,
    0
  );

  // Dynamic resource calculations per sector (based on incident severities in those sectors)
  const getSectorUnits = (sectorName: string) => {
    const sectorIncidents = activeIncidents.filter((i) =>
      i.location.toLowerCase().includes(sectorName.toLowerCase())
    );
    return sectorIncidents.reduce((sum, inc) => {
      if (inc.severity === "critical") return sum + 20;
      if (inc.severity === "high") return sum + 12;
      if (inc.severity === "medium") return sum + 6;
      return sum + 2;
    }, 5); // Base of 5 support units per sector
  };

  const sectorAUnits = getSectorUnits("Sector A");
  const sectorBUnits = getSectorUnits("Sector B");
  const sectorCUnits = getSectorUnits("Sector C");
  const sectorDUnits = getSectorUnits("Sector D");

  const totalUnits = sectorAUnits + sectorBUnits + sectorCUnits + sectorDUnits;
  const resourceDispatchPercent = Math.min(
    100,
    Math.round((totalUnits / 120) * 100)
  );

  const statsCards = [
    {
      title: "Active Incidents",
      value: activeCount.toString(),
      icon: AlertTriangle,
      badgeText: activeCount > 5 ? "Critical Load" : "Manageable",
      badgeVariant: (activeCount > 5 ? "destructive" : "info") as
        "destructive" | "info",
      desc: "Requires dispatch team",
      color: "text-destructive",
    },
    {
      title: "Critical Alerts",
      value: criticalCount.toString(),
      icon: AlertCircle,
      badgeText: criticalCount > 0 ? "High Warning" : "Clear Sky",
      badgeVariant: (criticalCount > 0 ? "warning" : "success") as
        "warning" | "success",
      desc: "Immediate dispatches active",
      color: "text-warning",
    },
    {
      title: "Resources Dispatched",
      value: `${resourceDispatchPercent}%`,
      icon: Activity,
      badgeText: `${totalUnits} Units Deployed`,
      badgeVariant: "info" as const,
      desc: "Staged across 4 sectors",
      color: "text-primary",
    },
    {
      title: "Active Volunteers",
      value: "142",
      icon: Users,
      badgeText: "Staged",
      badgeVariant: "success" as const,
      desc: "12 field groups active",
      color: "text-accent",
    },
    {
      title: "Open Shelters",
      value: "8",
      icon: Home,
      badgeText: "Stable",
      badgeVariant: "success" as const,
      desc: "4 shelters at capacity limit",
      color: "text-[#008080]",
    },
    {
      title: "People Affected",
      value: totalAffected.toLocaleString(),
      icon: UserCheck,
      badgeText: "Evac Staged",
      badgeVariant: "warning" as const,
      desc: "Sector coordinates active",
      color: "text-purple-500",
    },
  ];

  // Mock notifications
  const notifications = [
    {
      type: "critical",
      msg: "Sluice gate overflow warning in Sector A",
      status: "Active",
    },
    {
      type: "warning",
      msg: "HQ database connection latency",
      status: "23s delay",
    },
    {
      type: "success",
      msg: "Volunteer group check-in at Station 1",
      status: "Logged",
    },
    {
      type: "info",
      msg: "Telemetry sync completed with Regional Server",
      status: "Completed",
    },
  ];

  return (
    <>
      {/* Title block */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold tracking-tight">
            HQ Command Hub
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Operational Overview for Tactical Director{" "}
            <strong className="text-foreground">{user?.fullName}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/incidents/create" passHref>
            <Button variant="destructive" size="sm" className="gap-2">
              <AlertTriangle className="size-4" />
              <span>Report Disaster</span>
            </Button>
          </Link>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="default"
            size="sm"
            className="gap-2"
          >
            <Plus className="size-4" />
            <span>Deploy Unit</span>
          </Button>
        </div>
      </div>

      {/* 6 Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statsCards.map((card, idx) => (
          <Card
            key={idx}
            className="transition-shadow duration-200 hover:shadow-md"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-[11px] font-bold tracking-wider uppercase">
                {card.title}
              </CardTitle>
              <card.icon className={`size-4.5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {card.value}
              </div>
              <div className="mt-1.5 flex flex-col items-start gap-1">
                <Badge
                  variant={card.badgeVariant}
                  className="h-4.5 px-1.5 py-0 text-[9px]"
                >
                  {card.badgeText}
                </Badge>
                <span className="text-muted-foreground mt-0.5 text-[10px]">
                  {card.desc}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart 1: Incident Trends Area Chart */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="text-primary size-4" />
              <span>Incident Volume Trends</span>
            </CardTitle>
            <CardDescription>
              Visual representation of historical disaster reports logged in
              past hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative flex h-64 items-center justify-center pt-4">
            <svg
              viewBox="0 0 500 200"
              className="text-primary h-full w-full"
              fill="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity="0.3"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity="0.0"
                  />
                </linearGradient>
              </defs>
              <line
                x1="50"
                y1="20"
                x2="450"
                y2="20"
                stroke="currentColor"
                strokeOpacity="0.05"
              />
              <line
                x1="50"
                y1="70"
                x2="450"
                y2="70"
                stroke="currentColor"
                strokeOpacity="0.05"
              />
              <line
                x1="50"
                y1="120"
                x2="450"
                y2="120"
                stroke="currentColor"
                strokeOpacity="0.05"
              />
              <line
                x1="50"
                y1="170"
                x2="450"
                y2="170"
                stroke="currentColor"
                strokeOpacity="0.1"
              />

              <path
                d={`M 50 170 L 50 146 L 130 110 L 210 134 L 290 ${Math.max(40, 160 - activeCount * 8)} L 370 ${Math.max(30, 150 - activeCount * 10)} L 450 ${Math.max(50, 165 - activeCount * 6)} L 450 170 Z`}
                fill="url(#chartGradient)"
              />
              <path
                d={`M 50 146 L 130 110 L 210 134 L 290 ${Math.max(40, 160 - activeCount * 8)} L 370 ${Math.max(30, 150 - activeCount * 10)} L 450 ${Math.max(50, 165 - activeCount * 6)}`}
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {[
                { x: 50, y: 146, val: 4, label: "02:00" },
                { x: 130, y: 110, val: 8, label: "06:00" },
                { x: 210, y: 134, val: 6, label: "10:00" },
                {
                  x: 290,
                  y: Math.max(40, 160 - activeCount * 8),
                  val: Math.round(activeCount * 0.8),
                  label: "14:00",
                },
                {
                  x: 370,
                  y: Math.max(30, 150 - activeCount * 10),
                  val: activeCount,
                  label: "18:00",
                },
                {
                  x: 450,
                  y: Math.max(50, 165 - activeCount * 6),
                  val: Math.round(activeCount * 0.9),
                  label: "22:00",
                },
              ].map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    fill="var(--background)"
                    stroke="var(--primary)"
                    strokeWidth="2.5"
                  />
                  <text
                    x={pt.x}
                    y="190"
                    fill="currentColor"
                    fillOpacity="0.4"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </CardContent>
        </Card>

        {/* Chart 2: Resource Allocation Sector Bar Chart */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Compass className="text-accent size-4" />
              <span>Resource Allocation</span>
            </CardTitle>
            <CardDescription>
              Number of rescue vehicle / volunteer staging units per sector.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative flex h-64 items-center justify-center pt-4">
            <svg
              viewBox="0 0 500 200"
              className="text-foreground h-full w-full"
              fill="none"
            >
              <line
                x1="60"
                y1="20"
                x2="460"
                y2="20"
                stroke="currentColor"
                strokeOpacity="0.05"
              />
              <line
                x1="60"
                y1="70"
                x2="460"
                y2="70"
                stroke="currentColor"
                strokeOpacity="0.05"
              />
              <line
                x1="60"
                y1="120"
                x2="460"
                y2="120"
                stroke="currentColor"
                strokeOpacity="0.05"
              />
              <line
                x1="60"
                y1="170"
                x2="460"
                y2="170"
                stroke="currentColor"
                strokeOpacity="0.1"
              />

              {[
                {
                  sector: "Sector A",
                  units: sectorAUnits,
                  color: "var(--primary)",
                },
                {
                  sector: "Sector B",
                  units: sectorBUnits,
                  color: "var(--accent)",
                },
                {
                  sector: "Sector C",
                  units: sectorCUnits,
                  color: "var(--warning)",
                },
                {
                  sector: "Sector D",
                  units: sectorDUnits,
                  color: "var(--destructive)",
                },
              ].map((bar, idx) => {
                const xPos = 90 + idx * 100;
                const barHeight = (bar.units / 60) * 150; // Max units scale is 60
                const yPos = 170 - barHeight;

                return (
                  <g key={idx} className="group">
                    <rect
                      x={xPos}
                      y={yPos}
                      width="40"
                      height={barHeight}
                      rx="4"
                      fill={bar.color}
                      fillOpacity="0.85"
                      className="hover:fill-opacity-100 cursor-pointer transition-all"
                    />
                    <text
                      x={xPos + 20}
                      y={yPos - 6}
                      fill="currentColor"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {bar.units} U
                    </text>
                    <text
                      x={xPos + 20}
                      y="190"
                      fill="currentColor"
                      fillOpacity="0.4"
                      fontSize="10"
                      textAnchor="middle"
                    >
                      {bar.sector}
                    </text>
                  </g>
                );
              })}
            </svg>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Real Incidents Table and Telemetry Warnings Panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Active Incidents Table */}
        <Card className="border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 shrink-0" />
              <span>Active Incident Telemetry Grid</span>
            </CardTitle>
            <CardDescription>
              Live database queries for reported events. Click a row to view
              timeline and edit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2 py-4">
                <div className="bg-muted h-6 w-full animate-pulse rounded" />
                <div className="bg-muted h-6 w-full animate-pulse rounded" />
                <div className="bg-muted h-6 w-full animate-pulse rounded" />
              </div>
            ) : incidents.length === 0 ? (
              <div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-xs">
                No disaster incidents reported in database.
              </div>
            ) : (
              <div className="border-border rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((inc) => (
                      <TableRow key={inc.id}>
                        <TableCell className="flex items-center gap-1.5 font-semibold capitalize">
                          <span
                            className={`size-2 rounded-full ${
                              inc.status === "active"
                                ? "bg-destructive animate-ping"
                                : inc.status === "resolved"
                                  ? "bg-accent"
                                  : "bg-warning"
                            }`}
                          />
                          {inc.type}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate">
                          {inc.location}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              inc.severity === "critical"
                                ? "destructive"
                                : inc.severity === "high"
                                  ? "warning"
                                  : inc.severity === "medium"
                                    ? "info"
                                    : "outline"
                            }
                            className="h-4.5 px-1.5 py-0 text-[9px] uppercase"
                          >
                            {inc.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase"
                          >
                            {inc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/dashboard/incidents/${inc.id}`}>
                            <Button
                              size="xs"
                              variant="outline"
                              className="cursor-pointer gap-1"
                            >
                              <span>Details</span>
                              <ArrowRight className="size-3" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Telemetry Notifications Center */}
        <div className="space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BellRing className="text-destructive size-4" />
                <span>Ops Notification Center</span>
              </CardTitle>
              <CardDescription>
                Real-time system telemetry and alerts feed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notif, idx) => {
                const getAlertStatusClass = (type: string) => {
                  switch (type) {
                    case "critical":
                      return "bg-destructive/10 border-destructive/20 text-destructive";
                    case "warning":
                      return "bg-warning/10 border-warning/20 text-warning";
                    case "success":
                      return "bg-accent/10 border-accent/20 text-accent";
                    default:
                      return "bg-primary/10 border-primary/20 text-primary";
                  }
                };

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded-lg border p-3 text-xs leading-relaxed ${getAlertStatusClass(
                      notif.type
                    )}`}
                  >
                    <div className="flex items-center gap-2 font-medium">
                      {notif.type === "critical" && (
                        <AlertTriangle className="size-3.5 shrink-0" />
                      )}
                      {notif.type === "warning" && (
                        <AlertCircle className="size-3.5 shrink-0" />
                      )}
                      {notif.type === "success" && (
                        <CheckCircle className="size-3.5 shrink-0" />
                      )}
                      {notif.type === "info" && (
                        <Database className="size-3.5 shrink-0" />
                      )}
                      <span className="max-w-[170px] truncate">
                        {notif.msg}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-background border-muted text-muted-foreground ml-1 h-4 shrink-0 px-1 py-0 text-[9px]"
                    >
                      {notif.status}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tactical Dispatch Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Deploy Resource Unit"
        description="Verify dispatch details before sending coordinates to field responders."
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Dispatch Sector
            </label>
            <select
              value={dispatchSector}
              onChange={(e) => setDispatchSector(e.target.value)}
              className="border-border bg-background text-foreground w-full rounded border p-2 text-xs"
            >
              <option value="Sector A">Sector A - Riverfront</option>
              <option value="Sector B">Sector B - Subway</option>
              <option value="Sector C">Sector C - Warehouse District</option>
              <option value="Sector D">Sector D - Highway</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Asset Category
            </label>
            <select
              value={dispatchType}
              onChange={(e) => setDispatchType(e.target.value)}
              className="border-border bg-background text-foreground w-full rounded border p-2 text-xs"
            >
              <option value="flooding">Rapid Rescue Vehicle (Type B)</option>
              <option value="fire">Fire Engine Unit (Command Staged)</option>
              <option value="medical">Paramedic Triage Ambulance</option>
              <option value="water">Freshwater Staging Truck</option>
            </select>
          </div>

          <div className="bg-muted text-muted-foreground space-y-1 rounded p-3 font-mono text-[11px]">
            <div>Target: {dispatchSector} - Active Area</div>
            <div>Asset: {dispatchType.toUpperCase()} - Unit RRV-2</div>
            <div>Signaling status: HMAC Secured Token</div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setIsModalOpen(false);
                toast.success("Rescue Unit Dispatched", {
                  description: `Deployed ${dispatchType.toUpperCase()} unit to ${dispatchSector}.`,
                });
              }}
            >
              Confirm Dispatch
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
export default AuthorityDashboard;
