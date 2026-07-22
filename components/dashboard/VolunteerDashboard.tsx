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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="accent"
            className="gap-2"
          >
            <Plus className="size-4" />
            <span>Report Status</span>
          </Button>
        </div>
      </div>

      {/* Grid of KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-semibold">
              My Active Tasks
            </CardTitle>
            <Activity className="text-primary size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="warning">In Progress</Badge>
              <span className="text-muted-foreground text-xs">
                Sector B support
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
            <div className="text-2xl font-bold">8</div>
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
              Tasks currently coordinated to you for field response.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-border rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Detail</TableHead>
                    <TableHead>Target Location</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      Staging Depot A Stocking
                    </TableCell>
                    <TableCell>Warehouse Sector C</TableCell>
                    <TableCell>
                      <Badge variant="info">Medium</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="xs" variant="accent">
                        Complete
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Flood Perimeter Sandbags
                    </TableCell>
                    <TableCell>Sluice Gate Sector A</TableCell>
                    <TableCell>
                      <Badge variant="destructive">High</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="xs" variant="accent">
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
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

      {/* Field Report Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Report Field Telemetry"
        description="Log local weather or unit staging status."
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
              Status Note
            </label>
            <textarea
              placeholder="E.g., Staging area stocked. Rain level increasing."
              className="border-border bg-background text-foreground focus:border-primary w-full rounded border p-2 text-xs outline-none"
              rows={3}
            />
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
                toast.success("Field Log Recorded", {
                  description:
                    "Status successfully updated in commander operations feeds.",
                });
              }}
            >
              Submit Log
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
