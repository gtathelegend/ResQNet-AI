"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ShieldAlert,
  Clock,
  User,
  MapPin,
  Users,
  AlertTriangle,
  FileText,
  Activity,
  Heart,
  Droplet,
  Trash2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Incident, IncidentStatus, IncidentSeverity } from "@/types/incident";

export default function IncidentDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, role } = useAuth();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<IncidentStatus>("reported");

  // Fetch incident details from Supabase (backed by localStorage in mock mode)
  useEffect(() => {
    async function fetchIncident() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("incidents")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          setIncident(data as Incident);
          setSelectedStatus(data.status);
        } else {
          toast.error("Incident Not Found");
          router.push("/dashboard");
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Error fetching details.";
        toast.error("Fetch Error", { description: errorMsg });
      } finally {
        setLoading(false);
      }
    }

    fetchIncident();
  }, [id, router]);

  // Handle CRUD update for status
  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incident || !user) return;

    setStatusUpdating(true);
    try {
      const updates = {
        status: selectedStatus,
        statusNote:
          statusNote || `Status changed to ${selectedStatus.toUpperCase()}`,
        updatedBy: user.fullName || user.email,
      };

      const { data, error } = await supabase
        .from("incidents")
        .update(updates)
        .eq("id", incident.id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setIncident(data as Incident);
        setStatusNote("");
        toast.success("Incident Status Updated", {
          description: `Dispatched logs to field responders.`,
        });
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed updating status.";
      toast.error("Update Error", { description: errorMsg });
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handle CRUD delete for incident
  const handleIncidentDelete = async () => {
    if (
      !incident ||
      !window.confirm(
        "Are you sure you want to delete/cancel this disaster incident?"
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("incidents")
        .delete()
        .eq("id", incident.id);

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Incident Deleted", {
        description:
          "Disaster report cancelled and purged from telemetry grid.",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed deleting incident.";
      toast.error("Deletion Error", { description: errorMsg });
    }
  };

  // Status styling colors
  const getStatusConfig = (status: IncidentStatus) => {
    switch (status) {
      case "reported":
        return {
          label: "Reported",
          variant: "warning" as const,
          color: "text-warning",
        };
      case "investigating":
        return {
          label: "Investigating",
          variant: "info" as const,
          color: "text-primary",
        };
      case "active":
        return {
          label: "Active Emergency",
          variant: "destructive" as const,
          color: "text-destructive",
        };
      case "resolved":
        return {
          label: "Resolved",
          variant: "success" as const,
          color: "text-accent",
        };
    }
  };

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case "low":
        return <Badge variant="outline">Low Priority</Badge>;
      case "medium":
        return <Badge variant="info">Medium Severity</Badge>;
      case "high":
        return <Badge variant="warning">High Severity</Badge>;
      case "critical":
        return <Badge variant="destructive">Critical Emergency</Badge>;
    }
  };

  // Render Loader Skeleton
  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-muted h-10 w-1/4 animate-pulse rounded" />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-muted h-96 animate-pulse rounded md:col-span-2" />
            <div className="bg-muted h-96 animate-pulse rounded" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!incident) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
          <AlertTriangle className="text-destructive mb-3 size-10" />
          <h3 className="text-lg font-semibold">Incident Not Found</h3>
          <p className="text-muted-foreground mt-1 max-w-xs text-xs">
            This incident ID does not exist or has been removed from the system.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="mt-4"
          >
            Return to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const statusConfig = getStatusConfig(incident.status);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Incident details</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Link */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="w-fit cursor-pointer gap-2"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Dashboard</span>
          </Button>

          {role === "authority" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleIncidentDelete}
              className="w-fit cursor-pointer gap-2"
            >
              <Trash2 className="size-4" />
              <span>Cancel & Delete Incident</span>
            </Button>
          )}
        </div>

        {/* Main Details Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Incident Report details card */}
          <div className="space-y-6 md:col-span-2">
            <Card className="border-border">
              <CardHeader className="border-border flex flex-row items-start justify-between border-b pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={statusConfig.variant}
                      className="px-2 py-0.5 text-[10px] font-bold uppercase"
                    >
                      {statusConfig.label}
                    </Badge>
                    {getSeverityBadge(incident.severity)}
                  </div>
                  <CardTitle className="pt-1.5 text-xl capitalize">
                    {incident.type} Incident
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Clock className="text-muted-foreground size-3" />
                    <span>
                      Reported on{" "}
                      {new Date(incident.createdAt).toLocaleString()}
                    </span>
                  </CardDescription>
                </div>
                <div className="bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-lg shadow-sm">
                  <ShieldAlert className="size-6" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Image display */}
                {incident.imageUrl && (
                  <div className="border-border bg-muted flex max-h-[300px] w-full items-center justify-center overflow-hidden rounded-lg border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={incident.imageUrl}
                      alt="Incident scene"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* Description details */}
                <div className="space-y-1.5">
                  <h4 className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                    <FileText className="size-3.5" />
                    <span>Situation Description</span>
                  </h4>
                  <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {incident.description}
                  </p>
                </div>

                {/* Geographic coordinates */}
                <div className="border-border grid gap-4 border-t pt-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                      <MapPin className="size-4.5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                        Location Coordinates
                      </h4>
                      <p className="text-foreground text-xs font-semibold">
                        {incident.location}
                      </p>
                      <p className="text-muted-foreground font-mono text-[10px]">
                        GPS: {incident.latitude.toFixed(4)},{" "}
                        {incident.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-accent/10 text-accent flex size-8 shrink-0 items-center justify-center rounded-lg">
                      <Users className="size-4.5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                        People Affected
                      </h4>
                      <p className="text-foreground text-sm font-bold">
                        {incident.peopleAffected} People
                      </p>
                      <p className="text-muted-foreground text-[10px]">
                        Evacuation status monitored
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checklist of support details */}
                <div className="border-border space-y-3 border-t pt-4">
                  <h4 className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Emergency Support Requests
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        check: incident.medicalEmergency,
                        text: "Medical Evacuation Staging",
                        icon: Heart,
                        activeColor: "text-destructive bg-destructive/10",
                      },
                      {
                        check: incident.waterNeeded,
                        text: "Drinking Water Supply",
                        icon: Droplet,
                        activeColor: "text-primary bg-primary/10",
                      },
                      {
                        check: incident.foodNeeded,
                        text: "Emergency Food Rations",
                        icon: FileText,
                        activeColor: "text-warning bg-warning/10",
                      },
                      {
                        check: incident.shelterNeeded,
                        text: "Temporary Shelter Allocation",
                        icon: Activity,
                        activeColor: "text-accent bg-accent/10",
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 rounded-lg border p-3 text-xs leading-relaxed transition-colors duration-200 ${
                          item.check
                            ? "border-border/80 bg-card"
                            : "border-border/40 bg-muted/20 opacity-50"
                        }`}
                      >
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                            item.check
                              ? item.activeColor
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <item.icon className="size-4" />
                        </div>
                        <span className="font-semibold">{item.text}</span>
                        <span className="text-muted-foreground ml-auto font-mono text-[10px] font-bold uppercase">
                          {item.check ? "Needed" : "Not Requested"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reporter information */}
                <div className="border-border text-muted-foreground flex flex-col gap-2 border-t pt-4 text-[11px] sm:flex-row sm:justify-between">
                  <span className="flex items-center gap-1">
                    <User className="size-3.5" />
                    <span>
                      Reported by: <strong>{incident.reportedBy}</strong>
                    </span>
                  </span>
                  <span>
                    Last system update:{" "}
                    {new Date(incident.updatedAt).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Timeline & Update Forms */}
          <div className="space-y-6">
            {/* Status Update Panel (Authorities/Volunteers only) */}
            {(role === "authority" || role === "volunteer") && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                    <Activity className="text-primary size-4" />
                    <span>Command Telemetry Log</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Update operations status for responders.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStatusUpdate} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-muted-foreground block text-[10px] font-bold uppercase">
                        Select New Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) =>
                          setSelectedStatus(e.target.value as IncidentStatus)
                        }
                        className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-1"
                      >
                        <option value="reported">Reported</option>
                        <option value="investigating">Investigating</option>
                        <option value="active">Active Emergency</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-muted-foreground block text-[10px] font-bold uppercase">
                        Tactical Progress Notes
                      </label>
                      <textarea
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="E.g., Rescue team deployed. Sandbags positioned."
                        className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border p-2.5 text-xs outline-none"
                        rows={3}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="default"
                      size="sm"
                      className="w-full"
                      disabled={statusUpdating}
                    >
                      {statusUpdating
                        ? "Transmitting Log..."
                        : "Update Incident State"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Status Timeline history logs */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                  <Clock className="text-primary size-4" />
                  <span>Incident Status Timeline</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Audit log of tactical dispatches.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="border-border relative ml-2.5 space-y-6 border-l py-2 pl-5">
                  {incident.statusHistory?.map((hist, idx) => {
                    const conf = getStatusConfig(hist.status);

                    return (
                      <div key={idx} className="group relative">
                        {/* Bullet point node */}
                        <div className="bg-background border-border group-last:border-primary absolute top-1.5 -left-[27px] flex size-3.5 items-center justify-center rounded-full border-2">
                          <div
                            className={`size-1.5 rounded-full ${conf.color.replace("text-", "bg-")}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="text-foreground text-xs font-bold capitalize">
                              {conf.label}
                            </span>
                            <span className="text-muted-foreground font-mono text-[9px]">
                              {new Date(hist.updatedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-[10px]">
                            Logged by: {hist.updatedBy}
                          </p>
                          {hist.note && (
                            <div className="bg-muted text-foreground mt-1 rounded border p-2 font-sans text-xs leading-relaxed italic">
                              {hist.note}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
