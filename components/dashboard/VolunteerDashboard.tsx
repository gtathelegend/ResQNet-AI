"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Plus,
  BellRing,
  Activity,
  Users,
  Compass,
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

interface VolunteerDashboardProps {
  user: UserSession["user"];
  triggerToast: () => void;
  triggerAlertToast: () => void;
}

export function VolunteerDashboard({
  user,
  triggerToast,
  triggerAlertToast,
}: VolunteerDashboardProps) {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

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

  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  const myAssignedCount = activeIncidents.filter(
    (i) => i.status === "investigating"
  ).length;

  return (
    <>
      {/* Title block */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-bold tracking-tight">
            Responder Taskboard
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Command Center Telemetry for Volunteer Responder{" "}
            <strong className="text-foreground">{user?.fullName}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/incidents/create" passHref>
            <Button variant="accent" size="sm" className="gap-2">
              <Plus className="size-4" />
              <span>Report Status</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid of KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-semibold">
              My Investigating Tasks
            </CardTitle>
            <Activity className="text-primary size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myAssignedCount}</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="warning">Action Needed</Badge>
              <span className="text-muted-foreground text-xs">
                Check status details
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-semibold">
              Total Responders
            </CardTitle>
            <Users className="text-accent size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="success">Active</Badge>
              <span className="text-muted-foreground text-xs">
                12 field groups
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-semibold">
              Active Sector Incidents
            </CardTitle>
            <AlertTriangle className="text-destructive size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeIncidents.length}</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="destructive">Priority</Badge>
              <span className="text-muted-foreground text-xs">
                Needs response team
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-semibold">
              Staging Depot Health
            </CardTitle>
            <Compass className="text-info size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Normal</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="info">Stocked</Badge>
              <span className="text-muted-foreground text-xs">
                94% capacity
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Data Table and Component Playground */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Table of Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Assigned Responder Tasks</CardTitle>
            <CardDescription>
              Emergency incident tickets active on the telemetry grid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2 py-4">
                <div className="bg-muted h-6 w-full animate-pulse rounded" />
                <div className="bg-muted h-6 w-full animate-pulse rounded" />
              </div>
            ) : incidents.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center text-xs">
                No active incidents found on the grid.
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
                        <TableCell className="max-w-[150px] truncate">
                          {inc.location}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              inc.severity === "critical"
                                ? "destructive"
                                : "outline"
                            }
                            className="px-1.5 py-0 text-[9px] uppercase"
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
                              variant="accent"
                              className="cursor-pointer gap-1"
                            >
                              <span>Audit</span>
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

        {/* Right 1 Column: Controller */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Controller</CardTitle>
              <CardDescription>
                Verify micro-animations and toast notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="space-y-2">
                <span className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                  Notify Feed (Sonner)
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={triggerToast}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <BellRing className="text-primary size-4" />
                    <span>Info Toast</span>
                  </Button>
                  <Button
                    onClick={triggerAlertToast}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                  >
                    <AlertTriangle className="text-destructive size-4" />
                    <span>Alert Toast</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
