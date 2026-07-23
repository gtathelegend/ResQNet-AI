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

  const [volunteersCount, setVolunteersCount] = useState(0);
  const [resourcesAvailableSum, setResourcesAvailableSum] = useState(0);

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

  // Fetch volunteers and resources stats dynamically
  useEffect(() => {
    async function loadStats() {
      try {
        const { data: vols, error: volErr } = await supabase
          .from("volunteers")
          .select("id, status");
        if (!volErr && vols) {
          const availableVols = vols.filter((v: any) => v.status === "on-duty").length;
          setVolunteersCount(availableVols);
        }

        const { data: res, error: resErr } = await supabase
          .from("resources")
          .select("availableStock");
        if (!resErr && res) {
          const totalAvail = res.reduce((acc: number, r: any) => acc + (r.availableStock || 0), 0);
          setResourcesAvailableSum(totalAvail);
        }
      } catch (e) {
        console.error("Error loading stats counts:", e);
      }
    }
    loadStats();
  }, []);

  // Calculations based on database state
  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  const activeCount = activeIncidents.length;
  const criticalCount = activeIncidents.filter(
    (i) => i.severity === "critical" || i.severity === "high"
  ).length;
  const totalAffected = activeIncidents.reduce(
    (sum, i) => sum + i.peopleAffected,
    0
  );

  // Staging units per sector
  const getSectorUnits = (sectorName: string) => {
    const sectorIncidents = activeIncidents.filter((i) =>
      i.location.toLowerCase().includes(sectorName.toLowerCase())
    );
    return sectorIncidents.reduce((sum, inc) => {
      if (inc.severity === "critical") return sum + 20;
      if (inc.severity === "high") return sum + 12;
      if (inc.severity === "medium") return sum + 6;
      return sum + 2;
    }, 5);
  };

  const sectorAUnits = getSectorUnits("Sector A");
  const sectorBUnits = getSectorUnits("Sector B");
  const sectorCUnits = getSectorUnits("Sector C");
  const sectorDUnits = getSectorUnits("Sector D");

  // Notifications
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            HQ Command Hub
          </h1>
          <p className="text-sm text-muted-foreground">
            Tactical oversight and situational awareness briefing for Director <span className="font-semibold text-foreground">{user?.fullName}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/incidents/create" passHref>
            <Button variant="destructive" size="sm" className="h-9 px-4 text-xs font-semibold cursor-pointer">
              Report Disaster
            </Button>
          </Link>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="default"
            size="sm"
            className="h-9 px-4 text-xs font-semibold cursor-pointer"
          >
            Deploy Unit
          </Button>
        </div>
      </div>

      {/* 5 Stats Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { title: "Active Incidents", value: activeCount, desc: "Requires dispatch team" },
          { title: "Critical Incidents", value: criticalCount, desc: "Immediate warning status", isCritical: criticalCount > 0 },
          { title: "People Affected", value: totalAffected.toLocaleString(), desc: "Across active incidents" },
          { title: "Available Volunteers", value: volunteersCount, desc: "On-duty field responders" },
          { title: "Available Resources", value: resourcesAvailableSum.toLocaleString(), desc: "Total stock units" },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`border border-border bg-card rounded-lg p-5 transition-shadow duration-150 hover:shadow-sm ${
              card.isCritical ? "border-l-4 border-l-destructive" : ""
            }`}
          >
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

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart 1: Incident Trends Area Chart */}
        <Card className="border-border bg-card shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="text-primary h-4 w-4" />
              Incident Volume Trends
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Disaster reports logged in the past hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative flex h-52 items-center justify-center pt-2">
            <svg viewBox="0 0 500 200" className="h-full w-full text-muted-foreground/10" fill="none">
              <line x1="40" y1="20" x2="460" y2="20" stroke="currentColor" strokeWidth="1" />
              <line x1="40" y1="70" x2="460" y2="70" stroke="currentColor" strokeWidth="1" />
              <line x1="40" y1="120" x2="460" y2="120" stroke="currentColor" strokeWidth="1" />
              <line x1="40" y1="170" x2="460" y2="170" stroke="currentColor" strokeWidth="1" strokeOpacity="2" />

              <path
                d={`M 50 146 L 130 110 L 210 134 L 290 ${Math.max(40, 160 - activeCount * 8)} L 370 ${Math.max(30, 150 - activeCount * 10)} L 450 ${Math.max(50, 165 - activeCount * 6)}`}
                stroke="var(--primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {[
                { x: 50, y: 146, label: "02:00" },
                { x: 130, y: 110, label: "06:00" },
                { x: 210, y: 134, label: "10:00" },
                { x: 290, y: Math.max(40, 160 - activeCount * 8), label: "14:00" },
                { x: 370, y: Math.max(30, 150 - activeCount * 10), label: "18:00" },
                { x: 450, y: Math.max(50, 165 - activeCount * 6), label: "22:00" },
              ].map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    fill="var(--card)"
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                  />
                  <text
                    x={pt.x}
                    y="190"
                    fill="currentColor"
                    className="fill-muted-foreground font-medium"
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
        <Card className="border-border bg-card shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Compass className="text-primary h-4 w-4" />
              Resource Distribution
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Number of staging units deployed per regional sector.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative flex h-52 items-center justify-center pt-2">
            <svg viewBox="0 0 500 200" className="h-full w-full text-muted-foreground/10" fill="none">
              <line x1="50" y1="20" x2="450" y2="20" stroke="currentColor" strokeWidth="1" />
              <line x1="50" y1="70" x2="450" y2="70" stroke="currentColor" strokeWidth="1" />
              <line x1="50" y1="120" x2="450" y2="120" stroke="currentColor" strokeWidth="1" />
              <line x1="50" y1="170" x2="450" y2="170" stroke="currentColor" strokeWidth="1" strokeOpacity="2" />

              {[
                { sector: "Sector A", units: sectorAUnits },
                { sector: "Sector B", units: sectorBUnits },
                { sector: "Sector C", units: sectorCUnits },
                { sector: "Sector D", units: sectorDUnits },
              ].map((bar, idx) => {
                const xPos = 80 + idx * 100;
                const barHeight = (bar.units / 60) * 150;
                const yPos = 170 - barHeight;

                return (
                  <g key={idx} className="group">
                    <rect
                      x={xPos}
                      y={yPos}
                      width="36"
                      height={barHeight}
                      rx="2"
                      fill="var(--primary)"
                      fillOpacity="0.8"
                      className="hover:fill-opacity-100 transition-all duration-150 cursor-pointer"
                    />
                    <text
                      x={xPos + 18}
                      y={yPos - 6}
                      fill="var(--foreground)"
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {bar.units} U
                    </text>
                    <text
                      x={xPos + 18}
                      y="190"
                      fill="currentColor"
                      className="fill-muted-foreground"
                      fontSize="9"
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

      {/* Main Grid: Active Incidents Table and Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Active Incidents Table */}
        <Card className="border-border lg:col-span-2 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <AlertTriangle className="text-foreground h-4 w-4 shrink-0" />
              Active Incident Staging Feed
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Emergency reports logged in database. Click to view full dashboard details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2 py-4">
                <div className="bg-muted h-6 w-full animate-pulse rounded" />
                <div className="bg-muted h-6 w-full animate-pulse rounded" />
              </div>
            ) : incidents.length === 0 ? (
              <div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-xs bg-muted/5">
                No active incidents reported.
              </div>
            ) : (
              <div className="border border-border rounded-md overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10">
                      <TableHead className="font-semibold text-xs text-muted-foreground">Type</TableHead>
                      <TableHead className="font-semibold text-xs text-muted-foreground">Location</TableHead>
                      <TableHead className="font-semibold text-xs text-muted-foreground">Severity</TableHead>
                      <TableHead className="font-semibold text-xs text-muted-foreground">Status</TableHead>
                      <th className="p-3 text-right font-semibold text-xs text-muted-foreground">Actions</th>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((inc) => {
                      const isCritical = inc.severity === "critical" || inc.severity === "high";
                      const severityColor = inc.severity === "critical" 
                        ? "destructive" 
                        : inc.severity === "high" 
                          ? "warning" 
                          : inc.severity === "medium" 
                            ? "warning" 
                            : "outline";
                            
                      return (
                        <tr key={inc.id} className="hover:bg-muted/5 transition-colors border-b border-border">
                          <td className="p-3 font-semibold text-foreground capitalize flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                inc.status === "active"
                                  ? "bg-destructive animate-pulse"
                                  : inc.status === "resolved"
                                    ? "bg-success"
                                    : "bg-warning"
                              }`}
                            />
                            {inc.type}
                          </td>
                          <td className="p-3 text-muted-foreground max-w-[160px] truncate">
                            {inc.location}
                          </td>
                          <td className="p-3">
                            <Badge
                              variant={severityColor}
                              className="h-4.5 px-1.5 py-0 text-[9px] uppercase font-semibold tracking-wider"
                            >
                              {inc.severity}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className="h-4.5 px-1.5 py-0 text-[9px] uppercase font-medium"
                            >
                              {inc.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Link href={`/dashboard/incidents/${inc.id}`}>
                              <Button
                                size="xs"
                                variant="outline"
                                className="cursor-pointer h-7 text-xs px-2.5"
                              >
                                Details
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Telemetry Notifications Center */}
        <div className="space-y-4">
          <Card className="border-border bg-card shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BellRing className="text-foreground h-4 w-4" />
                Notification Feed
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Tactical operations center logs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {notifications.map((notif, idx) => {
                const getAlertStatusClass = (type: string) => {
                  switch (type) {
                    case "critical":
                      return "bg-destructive/5 border-destructive/10 text-destructive";
                    case "warning":
                      return "bg-warning/5 border-warning/10 text-warning";
                    case "success":
                      return "bg-success/5 border-success/10 text-success";
                    default:
                      return "bg-primary/5 border-primary/10 text-primary";
                  }
                };

                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded-md border p-3 text-xs leading-relaxed ${getAlertStatusClass(
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
                      className="bg-card text-muted-foreground border-border ml-1 h-4 shrink-0 px-1 py-0 text-[8px]"
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
          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
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
              variant="default"
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
