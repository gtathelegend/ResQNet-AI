"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Users,
  Compass,
  Activity,
  Shield,
  Plus,
  Send,
  MapPin,
  CheckCircle,
  RotateCcw,
  Phone,
  Briefcase,
  AlertTriangle,
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
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { VolunteerProfile, VolunteerAssignment } from "@/types/volunteer";
import { Incident } from "@/types/incident";
import { AssignVolunteerModal } from "@/components/volunteers/AssignVolunteerModal";

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

export default function VolunteerCenterPage() {
  const { user, role } = useAuth();
  const isAuthority = role === "authority";

  // Data states
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter Proximity States
  const [proximityIncidentId, setProximityIncidentId] = useState("");

  // Modals state
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [newVolunteerOpen, setNewVolunteerOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"directory" | "assignments">(
    "directory"
  );

  // New Volunteer Profile Form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newSkillsString, setNewSkillsString] = useState("");
  const [newLocationName, setNewLocationName] = useState(
    "Sector A, Riverfront"
  );
  const [newHours, setNewHours] = useState("24/7");

  // Load telemetry data from Supabase
  const loadData = async () => {
    try {
      const volData = await supabase
        .from("volunteers")
        .select("*")
        .order("name", { ascending: true });
      if (volData.data) setVolunteers(volData.data as VolunteerProfile[]);

      const assignData = await supabase
        .from("volunteer_assignments")
        .select("*")
        .order("createdAt", { ascending: false });
      if (assignData.data)
        setAssignments(assignData.data as VolunteerAssignment[]);

      const incData = await supabase
        .from("incidents")
        .select("*")
        .eq("status", "active");
      if (incData.data) {
        setActiveIncidents(incData.data as Incident[]);
      } else {
        const incAllData = await supabase.from("incidents").select("*");
        if (incAllData.data) {
          setActiveIncidents(
            incAllData.data.filter(
              (i: Incident) => i.status !== "resolved"
            ) as Incident[]
          );
        }
      }
    } catch (err) {
      console.error("Error loading volunteer coordination telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Proximity List generation
  const selectedProximityIncident = activeIncidents.find(
    (i) => i.id === proximityIncidentId
  );
  const proximityVolunteers = volunteers
    .filter((v) => v.status === "on-duty")
    .map((v) => {
      let distance = 0;
      if (selectedProximityIncident) {
        distance = getDistanceKm(
          selectedProximityIncident.latitude,
          selectedProximityIncident.longitude,
          v.latitude,
          v.longitude
        );
      }
      return { ...v, distance };
    })
    .sort((a, b) => a.distance - b.distance);

  // Statistics
  const totalVolunteers = volunteers.length;
  const onDutyCount = volunteers.filter((v) => v.status === "on-duty").length;
  const assignedCount = volunteers.filter((v) => v.status === "assigned").length;
  const activeAssignmentsCount = assignments.filter(
    (a) => a.status === "active"
  ).length;

  const handleToggleAvailability = async (volId: string) => {
    const vol = volunteers.find((v) => v.id === volId);
    if (!vol) return;

    if (!isAuthority && user?.email !== vol.email) {
      toast.error("You can only update your own availability status.");
      return;
    }

    try {
      const nextStatus = vol.status === "on-duty" ? "off-duty" : "on-duty";
      const { error } = await supabase
        .from("volunteers")
        .update({ status: nextStatus })
        .eq("id", vol.id)
        .single();

      if (error) throw new Error(error.message);

      toast.success("Availability updated successfully");
      loadData();
    } catch (err: unknown) {
      toast.error("Failed to update availability");
    }
  };

  const handleRegisterVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPhone) return;

    try {
      const skillsArray = newSkillsString
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");

      let lat = 40.7128;
      let lng = -74.006;
      if (newLocationName.includes("Sector B")) {
        lat = 40.7306;
        lng = -73.9352;
      } else if (newLocationName.includes("Sector C")) {
        lat = 40.7589;
        lng = -73.9851;
      }

      const profile = {
        name: newName,
        email: newEmail.toLowerCase(),
        phone: newPhone,
        skills: skillsArray.length > 0 ? skillsArray : ["General Support"],
        status: "on-duty" as const,
        latitude: lat,
        longitude: lng,
        locationName: newLocationName,
        availabilityHours: newHours,
        updatedAt: new Date().toISOString(),
      };

      const { error } = await supabase.from("volunteers").insert(profile);
      if (error) throw new Error(error.message);

      toast.success("Volunteer registered successfully");
      setNewVolunteerOpen(false);
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewSkillsString("");
      loadData();
    } catch (err: unknown) {
      toast.error("Registration failed");
    }
  };

  const handleUpdateAssignmentStatus = async (
    assignId: string,
    nextStatus: "active" | "completed" | "released"
  ) => {
    const assignment = assignments.find((a) => a.id === assignId);
    if (!assignment) return;

    try {
      const assignResult = await supabase
        .from("volunteer_assignments")
        .update({ status: nextStatus })
        .eq("id", assignment.id)
        .single();
      if (assignResult.error) throw new Error(assignResult.error.message);

      if (nextStatus === "completed" || nextStatus === "released") {
        const volResult = await supabase
          .from("volunteers")
          .update({ status: "on-duty" })
          .eq("id", assignment.volunteerId)
          .single();
        if (volResult.error) throw new Error(volResult.error.message);

        const timelinesNote = `Volunteer ${assignment.volunteerName} completed assignment: ${assignment.role}.`;

        const incidentData = await supabase
          .from("incidents")
          .select("*")
          .eq("id", assignment.incidentId)
          .single();
        if (incidentData.data) {
          const inc = incidentData.data as Incident;
          const currentHistory = inc.statusHistory || [];
          const updatedHistory = [
            ...currentHistory,
            {
              status: inc.status,
              updatedAt: new Date().toISOString(),
              updatedBy: user?.fullName || user?.email || "HQ Operator",
              note: timelinesNote,
            },
          ];
          await supabase
            .from("incidents")
            .update({ statusHistory: updatedHistory })
            .eq("id", inc.id)
            .single();
        }
      }

      toast.success(`Assignment marked as ${nextStatus}`);
      loadData();
    } catch (err: unknown) {
      toast.error("Failed to update assignment status");
    }
  };

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
                <BreadcrumbPage>Volunteers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Volunteers
              </h1>
              <p className="text-sm text-muted-foreground">
                Coordinate on-duty personnel, view regional dispatch areas, and manage field assignments.
              </p>
            </div>
            {isAuthority && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setDispatchOpen(true)}
                  variant="default"
                  size="sm"
                  className="h-9 px-4 text-xs font-semibold cursor-pointer"
                >
                  Dispatch Responder
                </Button>
                <Button
                  onClick={() => setNewVolunteerOpen(true)}
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 text-xs font-semibold cursor-pointer"
                >
                  Register Profile
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Panels */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Responders Registered", value: `${totalVolunteers} Profiles`, desc: "Total database capacity" },
            { title: "On-Duty Grid", value: `${onDutyCount} Available`, desc: "Ready for quick dispatch" },
            { title: "Field Deployed", value: `${assignedCount} Assigned`, desc: "Currently in disaster sectors" },
            { title: "Active Missions", value: activeAssignmentsCount, desc: "Sectors currently coordinated" },
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

        {/* Proximity Matcher Card */}
        <Card className="border border-border bg-card shadow-none">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-semibold">Proximity & Skill Matcher</CardTitle>
            <CardDescription className="text-xs">
              Select an active incident location to filter the nearest available volunteers on-duty.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="max-w-md space-y-1.5">
              <label className="text-muted-foreground block text-[10px] font-bold uppercase">
                Active Incident Coordinates
              </label>
              <select
                value={proximityIncidentId}
                onChange={(e) => setProximityIncidentId(e.target.value)}
                className="border border-border bg-background text-foreground focus:border-primary w-full rounded-md px-3 py-2 text-xs outline-none focus:ring-1"
              >
                <option value="">Choose incident area...</option>
                {activeIncidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {inc.location} ({inc.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {proximityIncidentId ? (
              proximityVolunteers.length === 0 ? (
                <div className="text-muted-foreground py-4 text-xs italic">
                  No on-duty volunteers available for proximity calculation.
                </div>
              ) : (
                <div className="border border-border rounded-md overflow-hidden bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/10">
                        <TableHead className="font-semibold text-xs text-muted-foreground">Responder Name</TableHead>
                        <TableHead className="font-semibold text-xs text-muted-foreground">Skills</TableHead>
                        <TableHead className="font-semibold text-xs text-muted-foreground">Location Base</TableHead>
                        <TableHead className="font-semibold text-xs text-muted-foreground">Estimated Proximity</TableHead>
                        {isAuthority && <th className="p-3 text-right font-semibold text-xs text-muted-foreground font-medium">Quick Dispatch</th>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proximityVolunteers.map((vol) => (
                        <tr key={vol.id} className="hover:bg-muted/5 transition-colors border-b border-border">
                          <td className="p-3 font-semibold text-foreground">{vol.name}</td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {vol.skills.slice(0, 2).map((s, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-[9.5px] px-1.5 py-0"
                                >
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground text-xs">{vol.locationName}</td>
                          <td className="p-3 text-foreground font-mono text-xs font-semibold">
                            {vol.distance === 0 ? "Under 0.5 km" : `${vol.distance} km away`}
                          </td>
                          {isAuthority && (
                            <td className="p-3 text-right">
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => setDispatchOpen(true)}
                                className="h-7 text-xs px-2.5 cursor-pointer"
                              >
                                Deploy
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            ) : (
              <div className="border border-border border-dashed text-muted-foreground flex flex-col items-center justify-center rounded-md py-8 text-center text-xs bg-muted/5">
                <AlertTriangle className="text-muted-foreground mb-2 size-5" />
                <p className="max-w-xs leading-relaxed">
                  Please select an incident area above to display the proximity matching grid.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tab Selection */}
        <div className="space-y-4">
          <div className="border-b border-border flex gap-2">
            {[
              { id: "directory", label: "Responder directory", icon: Users },
              { id: "assignments", label: "Missions & Assignments", icon: Briefcase },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as "directory" | "assignments")}
                className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
                  selectedTab === tab.id
                    ? "border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                <tab.icon className="size-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Panel */}
          {loading ? (
            <div className="space-y-2 py-4">
              <div className="bg-muted h-6 w-full animate-pulse rounded" />
              <div className="bg-muted h-6 w-full animate-pulse rounded" />
            </div>
          ) : (
            <div className="bg-card border border-border overflow-hidden rounded-md">
              {/* TAB 1: VOLUNTEERS DIRECTORY */}
              {selectedTab === "directory" && (
                <div className="space-y-4 p-4">
                  <div>
                    <h3 className="text-foreground text-sm font-semibold font-semibold">Active Directory</h3>
                    <p className="text-muted-foreground text-xs mt-0.5 font-medium">Volunteer profiles registered in database.</p>
                  </div>

                  <div className="border border-border rounded-md overflow-hidden bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/10">
                          <TableHead className="font-semibold text-xs text-muted-foreground">Name</TableHead>
                          <TableHead className="font-semibold text-xs text-muted-foreground">Skills</TableHead>
                          <TableHead className="font-semibold text-xs text-muted-foreground">Availability</TableHead>
                          <TableHead className="font-semibold text-xs text-muted-foreground">Depot Location</TableHead>
                          <TableHead className="font-semibold text-xs text-muted-foreground">Status</TableHead>
                          <th className="p-3 text-right font-semibold text-xs text-muted-foreground">Actions</th>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {volunteers.map((vol) => {
                          const canToggle = isAuthority || user?.email === vol.email;
                          return (
                            <tr key={vol.id} className="hover:bg-muted/5 transition-colors border-b border-border">
                              <td className="p-3">
                                <div className="text-foreground font-semibold">{vol.name}</div>
                                <div className="text-muted-foreground flex items-center gap-1 text-[10px] mt-0.5">
                                  <Phone className="size-2.5" />
                                  <span>{vol.phone}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-1">
                                  {vol.skills.map((s, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="px-1.5 py-0 text-[9px] font-medium"
                                    >
                                      {s}
                                    </Badge>
                                  ))}
                                </div>
                              </td>
                              <td className="p-3 text-muted-foreground text-xs font-semibold">{vol.availabilityHours}</td>
                              <td className="p-3 text-foreground text-xs font-medium">{vol.locationName}</td>
                              <td className="p-3">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  vol.status === "on-duty"
                                    ? "bg-success/10 text-success"
                                    : vol.status === "assigned"
                                      ? "bg-warning/10 text-warning"
                                      : "bg-muted text-muted-foreground border border-border"
                                }`}>
                                  {vol.status.replace("-", " ")}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                {canToggle && vol.status !== "assigned" ? (
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() => handleToggleAvailability(vol.id)}
                                    className="cursor-pointer h-7 text-xs px-2.5"
                                  >
                                    Toggle Duty
                                  </Button>
                                ) : (
                                  <span className="text-muted-foreground text-[10px] italic">Restricted</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* TAB 2: ACTIVE ASSIGNMENTS */}
              {selectedTab === "assignments" && (
                <div className="space-y-4 p-4">
                  <div>
                    <h3 className="text-foreground text-sm font-semibold">Field Deployments</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">Track personnel dispatched to operational sectors.</p>
                  </div>

                  {assignments.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center text-xs bg-muted/5 rounded-md">
                      No volunteer assignments currently active.
                    </div>
                  ) : (
                    <div className="border border-border rounded-md overflow-hidden bg-card">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/10">
                            <TableHead className="font-semibold text-xs text-muted-foreground">Volunteer</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground">Staging Incident</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground">Assigned Role</TableHead>
                            <TableHead className="font-semibold text-xs text-muted-foreground">Status</TableHead>
                            {!isAuthority && <th className="p-3 text-right font-semibold text-xs text-muted-foreground">Actions</th>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assignments.map((assign) => {
                            const isAssignedToThisVol = user?.fullName === assign.volunteerName;
                            const canChange = isAuthority || isAssignedToThisVol;
                            return (
                              <tr key={assign.id} className="hover:bg-muted/5 transition-colors border-b border-border">
                                <td className="p-3 font-semibold text-foreground">{assign.volunteerName}</td>
                                <td className="p-3 text-muted-foreground text-xs">
                                  {assign.incidentLocation} ({assign.incidentType.toUpperCase()})
                                </td>
                                <td className="p-3 text-foreground text-xs font-semibold">{assign.role}</td>
                                <td className="p-3">
                                  <Badge
                                    variant={
                                      assign.status === "completed"
                                        ? "success"
                                        : assign.status === "active"
                                          ? "info"
                                          : assign.status === "released"
                                            ? "outline"
                                            : "warning"
                                    }
                                    className="h-4.5 px-1.5 py-0 text-[9px] font-bold uppercase"
                                  >
                                    {assign.status}
                                  </Badge>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="inline-flex gap-1.5">
                                    {canChange && assign.status === "assigned" && (
                                      <Button
                                        size="xs"
                                        variant="default"
                                        onClick={() => handleUpdateAssignmentStatus(assign.id, "active")}
                                        className="h-7 text-xs px-2.5 cursor-pointer"
                                      >
                                        Activate
                                      </Button>
                                    )}
                                    {canChange && assign.status === "active" && (
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        onClick={() => handleUpdateAssignmentStatus(assign.id, "completed")}
                                        className="h-7 text-xs px-2.5 text-success hover:border-success/30 cursor-pointer"
                                      >
                                        Complete
                                      </Button>
                                    )}
                                    {isAuthority &&
                                      assign.status !== "completed" &&
                                      assign.status !== "released" && (
                                        <Button
                                          size="xs"
                                          variant="outline"
                                          onClick={() => handleUpdateAssignmentStatus(assign.id, "released")}
                                          className="h-7 text-xs px-2.5 text-muted-foreground hover:text-destructive cursor-pointer"
                                        >
                                          Release
                                        </Button>
                                      )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dispatch Volunteer Modal */}
        {dispatchOpen && (
          <AssignVolunteerModal
            isOpen={dispatchOpen}
            onClose={() => setDispatchOpen(false)}
            onSuccess={loadData}
            volunteers={volunteers.filter((v) => v.status === "on-duty")}
            activeIncidents={activeIncidents}
          />
        )}

        {/* Register Volunteer Modal */}
        {newVolunteerOpen && (
          <Modal
            isOpen={newVolunteerOpen}
            onClose={() => setNewVolunteerOpen(false)}
            title="Register Volunteer Responder"
            description="Add a new responder profile to the coordination database."
          >
            <form onSubmit={handleRegisterVolunteer} className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                  Volunteer Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="E.g. Clara Oswald"
                  className="border border-border bg-background text-foreground focus:border-primary w-full rounded-md p-2.5 text-xs outline-none"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="E.g. responder@gmail.com"
                    className="border border-border bg-background text-foreground focus:border-primary w-full rounded-md p-2.5 text-xs outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="E.g. +1-555-0150"
                    className="border border-border bg-background text-foreground focus:border-primary w-full rounded-md p-2.5 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                  Skills / Specializations (Comma separated)
                </label>
                <input
                  type="text"
                  value={newSkillsString}
                  onChange={(e) => setNewSkillsString(e.target.value)}
                  placeholder="E.g. Medical, Water Rescue, First Aid"
                  className="border border-border bg-background text-foreground focus:border-primary w-full rounded-md p-2.5 text-xs outline-none"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    Initial Depot Base
                  </label>
                  <select
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    className="border border-border bg-background text-foreground focus:border-primary w-full rounded-md px-3 py-2 text-xs outline-none"
                    required
                  >
                    <option value="Sector A, Riverfront">Sector A - Riverfront (East)</option>
                    <option value="Sector B, Downtown">Sector B - Downtown (Central)</option>
                    <option value="Sector C, Warehouse">Sector C - Warehouse (West)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    Availability Hours
                  </label>
                  <select
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    className="border border-border bg-background text-foreground focus:border-primary w-full rounded-md px-3 py-2 text-xs outline-none"
                    required
                  >
                    <option value="24/7">24/7 Availability</option>
                    <option value="Weekends">Weekends Only</option>
                    <option value="Weekdays">Weekdays Only</option>
                    <option value="Evenings">Evenings Only</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-border flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewVolunteerOpen(false)}
                  className="h-8 text-xs px-3 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  className="h-8 text-xs px-3 cursor-pointer"
                >
                  Register Responder
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
