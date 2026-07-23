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
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]/20">● Low Priority</span>;
      case "medium":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase bg-[#FFFBEB] text-[#D97706] border-[#D97706]/20">● Medium Severity</span>;
      case "high":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase bg-[#FFF7ED] text-[#EA580C] border-[#EA580C]/20">● High Severity</span>;
      case "critical":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/20">● Critical Emergency</span>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-[#F8FAFC] h-8 w-1/4 animate-pulse rounded border border-[#E2E8F0]" />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-[#F8FAFC] h-96 animate-pulse rounded border border-[#E2E8F0] md:col-span-2" />
            <div className="bg-[#F8FAFC] h-96 animate-pulse rounded border border-[#E2E8F0]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!incident) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-[#CBD5E1] border-dashed p-6 text-center bg-white">
          <AlertTriangle className="text-[#DC2626] mb-3 size-10" />
          <h3 className="text-lg font-bold text-[#0F172A]">Incident Not Found</h3>
          <p className="text-[#475569] mt-1 max-w-xs text-xs font-semibold">
            This incident ID does not exist or has been removed from the system.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="mt-4 font-bold"
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
                <BreadcrumbLink href="/dashboard" className="text-[#475569] font-semibold">Overview</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#0F172A] font-bold">Incident Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="w-fit cursor-pointer h-8 px-3 text-xs font-bold"
            >
              <ArrowLeft className="size-3.5 mr-1" />
              Back
            </Button>

            {role === "authority" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleIncidentDelete}
                className="w-fit cursor-pointer h-8 px-3 text-xs font-bold"
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
            <Card className="border-[#E2E8F0] bg-white shadow-none">
              <CardHeader className="pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold border uppercase ${
                    incident.status === "active" 
                      ? "bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/20"
                      : incident.status === "resolved"
                        ? "bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20"
                        : "bg-[#FFFBEB] text-[#D97706] border-[#D97706]/20"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      incident.status === "active" 
                        ? "bg-[#DC2626]" 
                        : incident.status === "resolved" 
                          ? "bg-[#16A34A]" 
                          : "bg-[#D97706]"
                    }`} />
                    {statusConfig.label}
                  </span>
                  {getSeverityBadge(incident.severity)}
                </div>
                <CardTitle className="pt-2 text-2xl font-extrabold capitalize text-[#0F172A]">
                  {incident.type} Incident
                </CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs text-[#475569] mt-1 font-semibold">
                  <Clock className="size-3" />
                  Reported on {new Date(incident.createdAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                {/* Scene image if present */}
                {incident.imageUrl && (
                  <div className="border border-[#E2E8F0] bg-slate-50 flex max-h-[300px] w-full items-center justify-center overflow-hidden rounded-md">
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
                  <span className="text-[#0F172A] block text-[10px] font-bold uppercase tracking-wider">
                    Situation Description
                  </span>
                  <p className="text-[#0F172A] text-sm leading-relaxed whitespace-pre-wrap font-semibold">
                    {incident.description}
                  </p>
                </div>

                {/* Geospatial Coordinates and Affected Stats */}
                <div className="border-t border-[#E2E8F0] grid gap-4 pt-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-4 text-[#475569] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#0F172A] block text-[10px] font-bold uppercase tracking-wider">
                        Location Coordinates
                      </span>
                      <p className="text-[#0F172A] text-xs font-bold mt-0.5">
                        {incident.location}
                      </p>
                      <p className="text-[#475569] font-mono text-[9px] mt-0.5 font-bold">
                        GPS: {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="size-4 text-[#475569] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#0F172A] block text-[10px] font-bold uppercase tracking-wider">
                        Estimated Affected
                      </span>
                      <p className="text-[#0F172A] text-sm font-extrabold mt-0.5">
                        {incident.peopleAffected} People
                      </p>
                    </div>
                  </div>
                </div>

                {/* Support Requests list */}
                <div className="border-t border-[#E2E8F0] space-y-3 pt-4">
                  <span className="text-[#0F172A] block text-[10px] font-bold uppercase tracking-wider">
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
                            ? "border-[#CBD5E1] bg-white text-[#0F172A] font-bold"
                            : "border-[#E2E8F0] bg-slate-50 text-[#64748B] opacity-50 select-none"
                        }`}
                      >
                        <item.icon className={`size-4 shrink-0 ${item.check ? "text-[#2563EB]" : "text-[#64748B]"}`} />
                        <span className="font-bold">{item.text}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ml-auto ${item.check ? "text-[#2563EB]" : "text-[#64748B]"}`}>
                          {item.check ? "Requested" : "None"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reporter information */}
                <div className="border-t border-[#E2E8F0] text-[#475569] flex flex-col gap-2 pt-4 text-[11px] sm:flex-row sm:justify-between font-semibold">
                  <span className="flex items-center gap-1">
                    <User className="size-3.5" />
                    <span>
                      Reported by: <strong className="text-[#0F172A] font-extrabold">{incident.reportedBy}</strong>
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
              <Card className="border-[#E2E8F0] bg-white shadow-none">
                <CardHeader className="pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-[#0F172A]">
                        AI Decision Support Assessment
                      </CardTitle>
                      <CardDescription className="text-xs text-[#475569] font-medium">
                        Triage suggestion, resource modeling, and hazard escalation forecast.
                      </CardDescription>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase ${
                      incident.aiAnalysis.approved 
                        ? "bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20" 
                        : "bg-[#FFFBEB] text-[#D97706] border-[#D97706]/20"
                    }`}>
                      ● {incident.aiAnalysis.approved ? "Approved" : "Awaiting Command"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-4">
                  {/* Recommended Priority / Response time */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-md p-3">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                        Recommended Triage
                      </span>
                      <span className="text-sm font-bold capitalize text-[#0F172A]">
                        {incident.aiAnalysis.priority} Priority
                      </span>
                    </div>

                    <div className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-md p-3">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                        Estimated Response Window
                      </span>
                      <span className="text-sm font-bold text-[#0F172A]">
                        {incident.aiAnalysis.estimatedResponseTime}
                      </span>
                    </div>
                  </div>

                  {/* Tactical Summary */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider">
                      Assessment Summary
                    </span>
                    <p className="text-xs text-[#0F172A] bg-slate-50 border border-[#CBD5E1] p-3 rounded-md leading-relaxed font-semibold">
                      {incident.aiAnalysis.summary}
                    </p>
                  </div>

                  {/* Justification details */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider">
                      Triage Rationales
                    </span>
                    <p className="text-xs text-[#475569] leading-relaxed whitespace-pre-wrap font-semibold">
                      {incident.aiAnalysis.reason}
                    </p>
                  </div>

                  {/* Supplies & Hazards Grid */}
                  <div className="border-t border-[#E2E8F0] grid gap-4 pt-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block">
                        Suggested Supply Logistics
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {incident.aiAnalysis.requiredResources.map((res, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-[10px] font-bold bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0]"
                          >
                            {res}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-[#0F172A] uppercase tracking-wider block">
                        Potential Hazard Escalations
                      </span>
                      <ul className="list-disc pl-4 text-xs text-[#475569] space-y-1 font-semibold">
                        {incident.aiAnalysis.potentialRisks.map((risk, idx) => (
                          <li key={idx} className="leading-relaxed">{risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Commander approval triggers */}
                  {role === "authority" && !incident.aiAnalysis.approved && (
                    <div className="border-t border-[#E2E8F0] pt-4">
                      <Button
                        onClick={handleApproveAIRecommendations}
                        disabled={statusUpdating}
                        className="w-full cursor-pointer h-9 text-xs font-bold"
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
              <Card className="border-[#E2E8F0] bg-white shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                    Telemetry Dispatch Log
                  </CardTitle>
                  <CardDescription className="text-xs text-[#475569] font-medium">
                    Log dispatcher progress reports and status updates.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleStatusUpdate} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[#0F172A] block text-[10px] font-bold uppercase">
                        Operational Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value as IncidentStatus)}
                        className="border-[#CBD5E1] bg-white text-[#0F172A] focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-xs font-semibold outline-none focus:ring-1"
                      >
                        <option value="reported">Reported</option>
                        <option value="investigating">Investigating</option>
                        <option value="active">Active Emergency</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[#0F172A] block text-[10px] font-bold uppercase">
                        Progress Notes
                      </label>
                      <textarea
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="E.g., Safety perimeter staging set up. Operations on-duty."
                        className="border-[#CBD5E1] bg-white text-[#0F172A] focus:border-primary w-full rounded-md border p-2.5 text-xs font-semibold outline-none focus:ring-1"
                        rows={3}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="default"
                      size="sm"
                      className="w-full text-xs font-bold cursor-pointer h-9"
                      disabled={statusUpdating}
                    >
                      Update State
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Status timeline audit history */}
            <Card className="border-[#E2E8F0] bg-white shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                  Audit Timeline
                </CardTitle>
                <CardDescription className="text-xs text-[#475569] font-medium">
                  Chronological logs of tactical changes.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="border-[#E2E8F0] relative ml-2.5 space-y-6 border-l py-2 pl-4">
                  {incident.statusHistory?.map((hist, idx) => {
                    const conf = getStatusConfig(hist.status);

                    return (
                      <div key={idx} className="group relative">
                        {/* Bullet node */}
                        <div className="bg-white border-[#E2E8F0] group-last:border-primary absolute top-1.5 -left-[24px] flex h-3 w-3 items-center justify-center rounded-full border">
                          <div className={`h-1.5 w-1.5 rounded-full ${
                            hist.status === "active" 
                              ? "bg-[#DC2626]" 
                              : hist.status === "resolved" 
                                ? "bg-[#16A34A]" 
                                : "bg-[#D97706]"
                          }`} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="text-[#0F172A] text-xs font-bold capitalize">
                              {conf.label}
                            </span>
                            <span className="text-[#64748B] font-mono text-[9px] font-semibold">
                              {new Date(hist.updatedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-[#475569] text-[10px] font-semibold">
                            Logged by: {hist.updatedBy}
                          </p>
                          {hist.note && (
                            <div className="bg-[#F8FAFC] text-[#0F172A] mt-1 rounded border border-[#E2E8F0] p-2.5 text-xs font-semibold leading-relaxed italic">
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
