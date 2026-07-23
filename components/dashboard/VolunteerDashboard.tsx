"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Plus,
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Responder Taskboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Operational coordinates and safety briefing for Responder <span className="font-semibold text-foreground">{user?.fullName}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/incidents/create" passHref>
            <Button variant="default" size="sm" className="h-9 px-4 text-xs font-semibold cursor-pointer">
              Report Status
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid of KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "My Tasks", value: myAssignedCount, desc: "Pending investigation" },
          { title: "Total Responders", value: "142", desc: "Active in sector" },
          { title: "Active Incidents", value: activeIncidents.length, desc: "Requires emergency response" },
          { title: "Depot Status", value: "Normal", desc: "94% supply capacity" },
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

      {/* Main Grid: Data Table and Component Playground */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Table of Tasks */}
        <Card className="lg:col-span-2 shadow-none border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Assigned Responder Tasks</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Emergency incidents active on the telemetry network.
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
                No active incidents found.
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
                      <th className="p-3 text-right font-semibold text-xs text-muted-foreground">Action</th>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {incidents.map((inc) => {
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
                          <td className="p-3 text-muted-foreground max-w-[150px] truncate">
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
                                Audit
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

        {/* Right Column: Controller */}
        <div className="space-y-4">
          <Card className="shadow-none border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Ops Diagnostics</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Verify micro-animations and system toast alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="space-y-1.5">
                <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
                  Trigger Alert Feed
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={triggerToast}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 cursor-pointer"
                  >
                    Info Toast
                  </Button>
                  <Button
                    onClick={triggerAlertToast}
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-8 cursor-pointer"
                  >
                    Alert Toast
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
export default VolunteerDashboard;
