"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Plus,
  BellRing,
  Activity,
  ShieldAlert,
  Server,
  Layers,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
import { LoadingSkeleton } from "@/components/ui/loading";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorBoundaryView } from "@/components/ui/error-boundary-view";

export default function HomePage() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoState, setDemoState] = useState<
    "ready" | "loading" | "empty" | "error"
  >("ready");

  const triggerToast = () => {
    toast.success("Intelligence Feed Synchronized", {
      description:
        "Successfully fetched latest incident updates from Regional HQ.",
      duration: 4000,
    });
  };

  const triggerAlertToast = () => {
    toast.error("Critical Alert Issued", {
      description: "Severe weather condition detected in Eastern Sector.",
      duration: 5000,
    });
  };

  return (
    <DashboardLayout>
      {/* Page Header and Breadcrumb */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight">
            Command Center Overview
          </h1>
        </div>

        {/* Global Action CTA */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsDemoModalOpen(true)}
            variant="default"
            className="gap-2"
          >
            <Plus className="size-4" />
            <span>Deploy Unit</span>
          </Button>
        </div>
      </div>

      {/* Grid of KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-semibold">
              Active Incidents
            </CardTitle>
            <AlertTriangle className="text-destructive size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="destructive">Critical State</Badge>
              <span className="text-muted-foreground text-xs">
                Requires attention
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-semibold">
              Resource Dispatch
            </CardTitle>
            <Activity className="text-primary size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="info">Optimized</Badge>
              <span className="text-muted-foreground text-xs">
                88 units deployed
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-semibold">
              Network Security
            </CardTitle>
            <ShieldAlert className="text-success size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Secure</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="success">Normal</Badge>
              <span className="text-muted-foreground text-xs">
                Zero intrusions
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-semibold">
              Data Pipeline
            </CardTitle>
            <Server className="text-warning size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Degraded</div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="warning">Sync Delay</Badge>
              <span className="text-muted-foreground text-xs">23s latency</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Data Table and Component Playground */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Table of Incidents */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Regional Incidents Monitor</CardTitle>
            <CardDescription>
              Live telemetry tracking disaster incidents and coordination
              states.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-border rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Incident</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      Flooding - Sector A
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">Severe</Badge>
                    </TableCell>
                    <TableCell>Dispatched</TableCell>
                    <TableCell className="text-right">
                      <Button size="xs" variant="outline">
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Wildfire Perimeter 3
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">Severe</Badge>
                    </TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell className="text-right">
                      <Button size="xs" variant="outline">
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Power Grid Outage
                    </TableCell>
                    <TableCell>
                      <Badge variant="warning">Moderate</Badge>
                    </TableCell>
                    <TableCell>Staging</TableCell>
                    <TableCell className="text-right">
                      <Button size="xs" variant="outline">
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      Medical Evacuation
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">Minor</Badge>
                    </TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell className="text-right">
                      <Button size="xs" variant="outline">
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Column: Component Controls Playground */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Controller</CardTitle>
              <CardDescription>
                Verify micro-animations, notifications, and modal triggers.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {/* Notification Triggers */}
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

              {/* Button Variant Demonstrations */}
              <div className="border-border/80 space-y-2 border-t pt-2">
                <span className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                  Button & Accent Variants
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" size="xs">
                    Default
                  </Button>
                  <Button variant="secondary" size="xs">
                    Secondary
                  </Button>
                  <Button variant="accent" size="xs">
                    Accent
                  </Button>
                  <Button variant="outline" size="xs">
                    Outline
                  </Button>
                  <Button variant="destructive" size="xs">
                    Destructive
                  </Button>
                </div>
              </div>

              {/* State Toggles */}
              <div className="border-border/80 space-y-2 border-t pt-2">
                <span className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                  Toggle Layout State Previews
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setDemoState("ready")}
                    variant={demoState === "ready" ? "default" : "outline"}
                    size="xs"
                  >
                    Normal Grid
                  </Button>
                  <Button
                    onClick={() => setDemoState("loading")}
                    variant={demoState === "loading" ? "default" : "outline"}
                    size="xs"
                  >
                    Loading state
                  </Button>
                  <Button
                    onClick={() => setDemoState("empty")}
                    variant={demoState === "empty" ? "default" : "outline"}
                    size="xs"
                  >
                    Empty state
                  </Button>
                  <Button
                    onClick={() => setDemoState("error")}
                    variant={demoState === "error" ? "default" : "outline"}
                    size="xs"
                  >
                    Error state
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dynamic State Preview Panel */}
      <div className="border-border border-t pt-6">
        <h2 className="text-foreground mb-4 text-xl font-bold tracking-tight">
          Integrated UI State Previews
        </h2>

        {demoState === "ready" && (
          <div className="border-border bg-card/40 text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
            Toggle alternative dashboard states (Loading, Empty, Error) in the
            Platform Controller above to review their premium layouts.
          </div>
        )}

        {demoState === "loading" && (
          <div className="space-y-4">
            <h3 className="text-muted-foreground text-sm font-semibold">
              Demo state: Skeleton Loader
            </h3>
            <LoadingSkeleton rows={3} />
          </div>
        )}

        {demoState === "empty" && (
          <div className="space-y-4">
            <h3 className="text-muted-foreground text-sm font-semibold">
              Demo state: Empty Incident State
            </h3>
            <EmptyState
              icon={Layers}
              title="No Incidents Logged in Sector"
              description="This sector has no currently active incidents or dispatch logs. Verify filters or check default region settings."
              actionLabel="Sync Region Data"
              onAction={triggerToast}
            />
          </div>
        )}

        {demoState === "error" && (
          <div className="space-y-4">
            <h3 className="text-muted-foreground text-sm font-semibold">
              Demo state: Error Boundary View
            </h3>
            <ErrorBoundaryView
              title="Failed to Reach Regional Hub API"
              error={{
                message:
                  "The server returned a 503 Service Unavailable code. Inter-service HMAC signatures could not be verified.",
              }}
              reset={() => setDemoState("ready")}
            />
          </div>
        )}
      </div>

      {/* Reusable Demo Modal */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
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
              onClick={() => setIsDemoModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setIsDemoModalOpen(false);
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
    </DashboardLayout>
  );
}
