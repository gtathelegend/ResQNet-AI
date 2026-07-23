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
  Heart,
  Droplet,
  Trash2,
  Home,
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

  // Fetch incident details from Supabase
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
          toast.error("Incident not found");
          router.push("/dashboard");
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Error fetching details.";
        toast.error("Failed to load incident details");
      } finally {
        setLoading(false);
      }
    }

    fetchIncident();
  }, [id, router]);

  // Handle status update
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
        toast.success("Incident status updated");
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed updating status.";
      toast.error("Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handle AI recommendations approval by Authority
  const handleApproveAIRecommendations = async () => {
    if (!incident || !user) return;

    setStatusUpdating(true);
    try {
      const updatedAnalysis = {
        ...incident.aiAnalysis!,
        approved: true,
      };

      const updates = {
        aiAnalysis: updatedAnalysis,
        status: "active" as IncidentStatus,
        statusNote:
          "Approved emergency threat assessment recommendations and initiated responder dispatch.",
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
        setSelectedStatus("active");
        toast.success("Triage recommendations approved");
      }
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Failed approving AI recommendation.";
      toast.error("Failed to approve recommendations");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handle delete
  const handleIncidentDelete = async () => {
    if (
      !incident ||
      !window.confirm(
        "Are you sure you want to cancel this emergency incident report?"
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

      toast.success("Incident cancelled and removed");
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      toast.error("Failed to delete incident");
    }
  };

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
          color: "text-success",
        };
    }
  };

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case "low":
        return <Badge variant="outline" className="text-[10px]">Low Priority</Badge>;
      case "medium":
        return <Badge variant="warning" className="text-[10px]">Medium Severity</Badge>;
      case "high":
        return <Badge variant="warning" className="text-[10px]">High Severity</Badge>;
      case "critical":
        return <Badge variant="destructive" className="text-[10px]">Critical Emergency</Badge>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-muted h-8 w-1/4 animate-pulse rounded" />
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
        {/* Navigation & Header */}
        <div className="flex flex-col gap-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Overview</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Incident Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="w-fit cursor-pointer h-8 px-3 text-xs"
            >
              <ArrowLeft className="size-3.5 mr-1" />
              Back
            </Button>

            {role === "authority" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleIncidentDelete}
                className="w-fit cursor-pointer h-8 px-3 text-xs"
              >
                <Trash2 className="size-3.5 mr-1" />
                Cancel Report
              </Button>
            )}
          </div>
        </div>

        {/* Main Details Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Info Columns */}
          <div className="space-y-6 md:col-span-2">
            {/* Incident Details Card */}
            <Card className="border-border shadow-none">
              <CardHeader className="pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    incident.status === "active" 
                      ? "bg-destructive/10 text-destructive"
                      : incident.status === "resolved"
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      incident.status === "active" 
                        ? "bg-destructive" 
                        : incident.status === "resolved" 
                          ? "bg-success" 
                          : "bg-warning"
                    }`} />
                    {statusConfig.label}
                  </span>
                  {getSeverityBadge(incident.severity)}
                </div>
                <CardTitle className="pt-2 text-2xl font-extrabold capitalize text-foreground">
                  {incident.type} Incident
                </CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="size-3" />
                  Reported on {new Date(incident.createdAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                {/* Scene image if present */}
                {incident.imageUrl && (
                  <div className="border border-border bg-muted/20 flex max-h-[300px] w-full items-center justify-center overflow-hidden rounded-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={incident.imageUrl}
                      alt="Incident scene photograph"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                {/* Situation Description */}
                <div className="space-y-1.5">
                  <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                    Situation Description
                  </span>
                  <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap font-normal">
                    {incident.description}
                  </p>
                </div>

                {/* Geospatial Coordinates and Affected Stats */}
                <div className="border-t border-border grid gap-4 pt-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                        Location Coordinates
                      </span>
                      <p className="text-foreground text-xs font-semibold mt-0.5">
                        {incident.location}
                      </p>
                      <p className="text-muted-foreground font-mono text-[9px] mt-0.5">
                        GPS: {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                        Estimated Affected
                      </span>
                      <p className="text-foreground text-sm font-bold mt-0.5">
                        {incident.peopleAffected} People
                      </p>
                    </div>
                  </div>
                </div>

                {/* Support Requests list */}
                <div className="border-t border-border space-y-3 pt-4">
                  <span className="text-muted-foreground block text-[10px] font-bold uppercase tracking-wider">
                    Emergency Support Requests
                  </span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        check: incident.medicalEmergency,
                        text: "Medical Evacuation Staging",
                        icon: Heart,
                      },
                      {
                        check: incident.waterNeeded,
                        text: "Drinking Water Supply",
                        icon: Droplet,
                      },
                      {
                        check: incident.foodNeeded,
                        text: "Emergency Food Rations",
                        icon: FileText,
                      },
                      {
                        check: incident.shelterNeeded,
                        text: "Temporary Shelter Allocation",
                        icon: Home,
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 rounded-md border p-3 text-xs leading-relaxed transition-colors ${
                          item.check
                            ? "border-border bg-card"
                            : "border-border/40 bg-muted/10 opacity-40 select-none"
                        }`}
                      >
                        <item.icon className={`size-4 shrink-0 ${item.check ? "text-primary" : "text-muted-foreground"}`} />
                        <span className="font-semibold">{item.text}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider ml-auto text-muted-foreground">
                          {item.check ? "Requested" : "None"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reporter information */}
                <div className="border-t border-border text-muted-foreground flex flex-col gap-2 pt-4 text-[11px] sm:flex-row sm:justify-between">
                  <span className="flex items-center gap-1">
                    <User className="size-3.5" />
                    <span>
                      Reported by: <strong className="text-foreground">{incident.reportedBy}</strong>
                    </span>
                  </span>
                  <span>
                    Last system update: {new Date(incident.updatedAt).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* AI Assessment (Calm Decision-Support Representation) */}
            {incident.aiAnalysis && (
              <Card className="border-border shadow-none">
                <CardHeader className="pb-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-foreground">
                        AI Decision Support Assessment
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Triage suggestion, resource modeling, and hazard escalation forecast.
                      </CardDescription>
                    </div>
                    <Badge
                      variant={incident.aiAnalysis.approved ? "success" : "warning"}
                      className="px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider"
                    >
                      {incident.aiAnalysis.approved ? "Approved" : "Awaiting Command"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  {/* Recommended Priority / Response time */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="border border-border bg-muted/5 rounded-md p-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                        Recommended Triage
                      </span>
                      <span className="text-sm font-semibold capitalize text-foreground">
                        {incident.aiAnalysis.priority} Priority
                      </span>
                    </div>

                    <div className="border border-border bg-muted/5 rounded-md p-3">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                        Estimated Response Window
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {incident.aiAnalysis.estimatedResponseTime}
                      </span>
                    </div>
                  </div>

                  {/* Tactical Summary */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Assessment Summary
                    </span>
                    <p className="text-xs text-foreground bg-muted/20 border border-border p-3 rounded-md leading-relaxed font-normal">
                      {incident.aiAnalysis.summary}
                    </p>
                  </div>

                  {/* Justification details */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Triage Rationales
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {incident.aiAnalysis.reason}
                    </p>
                  </div>

                  {/* Supplies & Hazards Grid */}
                  <div className="border-t border-border grid gap-4 pt-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Suggested Supply Logistics
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {incident.aiAnalysis.requiredResources.map((res, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[10px] font-medium"
                          >
                            {res}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Potential Hazard Escalations
                      </span>
                      <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                        {incident.aiAnalysis.potentialRisks.map((risk, idx) => (
                          <li key={idx} className="leading-relaxed">{risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Commander approval triggers */}
                  {role === "authority" && !incident.aiAnalysis.approved && (
                    <div className="border-t border-border pt-4">
                      <Button
                        onClick={handleApproveAIRecommendations}
                        disabled={statusUpdating}
                        className="w-full cursor-pointer h-9 text-xs font-semibold"
                        variant="default"
                      >
                        Approve Triage & Dispatch Units
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Status Updates and Logs */}
          <div className="space-y-6">
            {/* Status updates panel */}
            {(role === "authority" || role === "volunteer") && (
              <Card className="border-border shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">
                    Telemetry Dispatch Log
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Log dispatcher progress reports and status updates.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStatusUpdate} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-muted-foreground block text-[10px] font-bold uppercase">
                        Operational Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as IncidentStatus)}
                        className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-1"
                      >
                        <option value="reported">Reported</option>
                        <option value="investigating">Investigating</option>
                        <option value="active">Active Emergency</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-muted-foreground block text-[10px] font-bold uppercase">
                        Progress Notes
                      </label>
                      <textarea
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="E.g., Safety perimeter staging set up. Operations on-duty."
                        className="border-border bg-background text-foreground focus:border-primary w-full rounded-md border p-2.5 text-xs outline-none focus:ring-1"
                        rows={3}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="default"
                      size="sm"
                      className="w-full text-xs cursor-pointer h-9"
                      disabled={statusUpdating}
                    >
                      Update State
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Status timeline audit history */}
            <Card className="border-border shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-foreground">
                  Audit Timeline
                </CardTitle>
                <CardDescription className="text-xs">
                  Chronological logs of tactical changes.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="border-border relative ml-2.5 space-y-6 border-l py-2 pl-4">
                  {incident.statusHistory?.map((hist, idx) => {
                    const conf = getStatusConfig(hist.status);

                    return (
                      <div key={idx} className="group relative">
                        {/* Bullet node */}
                        <div className="bg-background border-border group-last:border-primary absolute top-1.5 -left-[24px] flex h-3 w-3 items-center justify-center rounded-full border">
                          <div className={`h-1.5 w-1.5 rounded-full ${
                            hist.status === "active" 
                              ? "bg-destructive" 
                              : hist.status === "resolved" 
                                ? "bg-success" 
                                : "bg-warning"
                          }`} />
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
                            <div className="bg-muted/30 text-foreground mt-1 rounded border border-border p-2.5 text-xs font-normal leading-relaxed italic">
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
