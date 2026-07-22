"use client";

import React, { useState } from "react";
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
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Database,
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
import { UserSession } from "@/types/auth";

interface AuthorityDashboardProps {
  user: UserSession["user"];
  triggerToast: () => void;
  triggerAlertToast: () => void;
}

export function AuthorityDashboard({
  user,
}: AuthorityDashboardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  // Stats definition for the 6 cards
  const statsCards = [
    {
      title: "Active Incidents",
      value: "14",
      icon: AlertTriangle,
      badgeText: "Critical State",
      badgeVariant: "destructive" as const,
      desc: "Requires dispatch team",
      color: "text-destructive",
    },
    {
      title: "Critical Alerts",
      value: "3",
      icon: AlertCircle,
      badgeText: "High Winds",
      badgeVariant: "warning" as const,
      desc: "Severe weather alert",
      color: "text-warning",
    },
    {
      title: "Resources Dispatched",
      value: "92%",
      icon: Activity,
      badgeText: "Optimized",
      badgeVariant: "info" as const,
      desc: "88 units deployed",
      color: "text-primary",
    },
    {
      title: "Active Volunteers",
      value: "142",
      icon: Users,
      badgeText: "Staged",
      badgeVariant: "success" as const,
      desc: "12 field groups",
      color: "text-accent",
    },
    {
      title: "Open Shelters",
      value: "8",
      icon: Home,
      badgeText: "Stable",
      badgeVariant: "success" as const,
      desc: "4 shelters at limit",
      color: "text-[#008080]", // Teal
    },
    {
      title: "People Affected",
      value: "1,280",
      icon: UserCheck,
      badgeText: "Evac Staged",
      badgeVariant: "warning" as const,
      desc: "Sector A evac routing",
      color: "text-purple-500",
    },
  ];

  // Mock data for charts

  const resourceDistribution = [
    { sector: "Sector A", units: 35, color: "var(--primary)" },
    { sector: "Sector B", units: 28, color: "var(--accent)" },
    { sector: "Sector C", units: 15, color: "var(--warning)" },
    { sector: "Sector D", units: 10, color: "var(--destructive)" },
  ];

  // Activities list
  const recentActivities = [
    {
      title: "Rescue team alpha dispatched",
      subtitle: "Tactical Response Unit sent to Flooding Sector A.",
      time: "10m ago",
      icon: Send,
      iconColor: "text-primary bg-primary/10",
    },
    {
      title: "Water supply staging completed",
      subtitle: "2,000 Gallons staged at Depot 2 for community release.",
      time: "45m ago",
      icon: CheckCircle,
      iconColor: "text-accent bg-accent/10",
    },
    {
      title: "Weather alert issued",
      subtitle: "Broadcasting storm path warning to Volunteer networks.",
      time: "2h ago",
      icon: AlertTriangle,
      iconColor: "text-warning bg-warning/10",
    },
    {
      title: "Evac Route B marked secure",
      subtitle: "Volunteers completed clearance logs on primary highway.",
      time: "4h ago",
      icon: Compass,
      iconColor: "text-info bg-info/10",
    },
  ];

  // Live telemetry notifications list
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
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="default"
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
              <span>Incident Trends (24h)</span>
            </CardTitle>
            <CardDescription>
              Visual analytics representing active incident tickets in the
              system.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative flex h-64 items-center justify-center pt-4">
            {/* Custom SVG Area Chart */}
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

              {/* Grid Lines */}
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

              {/* Area path */}
              <path
                d="M 50 170 L 50 146 L 130 110 L 210 134 L 290 62 L 370 38 L 450 74 L 450 170 Z"
                fill="url(#chartGradient)"
              />

              {/* Line path */}
              <path
                d="M 50 146 L 130 110 L 210 134 L 290 62 L 370 38 L 450 74"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Node Dots */}
              {[
                { x: 50, y: 146, val: 4, label: "02:00" },
                { x: 130, y: 110, val: 8, label: "06:00" },
                { x: 210, y: 134, val: 6, label: "10:00" },
                { x: 290, y: 62, val: 12, label: "14:00" },
                { x: 370, y: 38, val: 14, label: "18:00" },
                { x: 450, y: 74, val: 11, label: "22:00" },
              ].map((pt, idx) => (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredNode === idx ? "7" : "5"}
                    fill="var(--background)"
                    stroke="var(--primary)"
                    strokeWidth="2.5"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredNode(idx)}
                    onMouseLeave={() => setHoveredNode(null)}
                  />
                  {hoveredNode === idx && (
                    <g>
                      <rect
                        x={pt.x - 20}
                        y={pt.y - 30}
                        width="40"
                        height="20"
                        rx="4"
                        fill="var(--secondary)"
                        className="shadow"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 16}
                        fill="var(--secondary-foreground)"
                        fontSize="10"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {pt.val}
                      </text>
                    </g>
                  )}
                  {/* Axis Label */}
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
            {/* Custom SVG Bar Chart */}
            <svg
              viewBox="0 0 500 200"
              className="text-foreground h-full w-full"
              fill="none"
            >
              {/* Grid Lines */}
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

              {/* Vertical Bars */}
              {resourceDistribution.map((bar, idx) => {
                const xPos = 90 + idx * 100;
                const barHeight = (bar.units / 40) * 150; // Max units scale is 40
                const yPos = 170 - barHeight;

                return (
                  <g key={idx} className="group">
                    {/* Animated rect bar */}
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
                    {/* Value text above bar */}
                    <text
                      x={xPos + 20}
                      y={yPos - 6}
                      fill="currentColor"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {bar.units} units
                    </text>
                    {/* Sector Label */}
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

      {/* Main Grid: Recent Activity Feed and Telemetry Warnings Panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Recent Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="text-primary size-4" />
              <span>Operations Activity Feed</span>
            </CardTitle>
            <CardDescription>
              Live telemetry and tactical updates logged by field responders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((act, idx) => (
              <div
                key={idx}
                className="border-border/40 flex items-start gap-4 border-b pb-3 last:border-0 last:pb-0"
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${act.iconColor}`}
                >
                  <act.icon className="size-4" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <h4 className="text-foreground text-sm font-semibold">
                    {act.title}
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    {act.subtitle}
                  </p>
                </div>
                <div className="text-muted-foreground pt-0.5 text-[10px] whitespace-nowrap">
                  {act.time}
                </div>
              </div>
            ))}
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
          <div className="bg-muted text-muted-foreground space-y-1 rounded p-3 font-mono text-xs">
            <div>Target: Sector A - Flooding Perimeter</div>
            <div>Asset class: Rapid Rescue Vehicle - Type B</div>
            <div>Signaling status: Secured via HMAC</div>
          </div>
          <p className="text-muted-foreground text-xs">
            This deployment leverages verified satellite telemetry. Responders
            will receive coordinates instantly on activation.
          </p>
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
                  description: "Unit RRV-B is on-route. Telemetry active.",
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
