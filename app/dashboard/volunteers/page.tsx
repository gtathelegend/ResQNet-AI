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

// Proximity calculation helper using Haversine formula
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
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

  // Load telemetry data from local mock Supabase
  const loadData = async () => {
    try {
      // 1. Fetch Volunteers
      const volData = await supabase
        .from("volunteers")
        .select("*")
        .order("name", { ascending: true });
      if (volData.data) setVolunteers(volData.data as VolunteerProfile[]);

      // 2. Fetch Assignments
      const assignData = await supabase
        .from("volunteer_assignments")
        .select("*")
        .order("createdAt", { ascending: false });
      if (assignData.data)
        setAssignments(assignData.data as VolunteerAssignment[]);

      // 3. Fetch Active Incidents
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
            incAllData.data.filter((i: Incident) => i.status !== "resolved") as Incident[]
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const assignedCount = volunteers.filter(
    (v) => v.status === "assigned"
  ).length;
  const activeAssignmentsCount = assignments.filter(
    (a) => a.status === "active"
  ).length;

  // Toggle availability status (for self or authorities)
  const handleToggleAvailability = async (volId: string) => {
    const vol = volunteers.find((v) => v.id === volId);
    if (!vol) return;

    // Permissions check
    if (!isAuthority && user?.email !== vol.email) {
      toast.error("Access Denied", {
        description: "You can only update your own availability status.",
      });
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

      toast.success("Availability Updated", {
        description: `${vol.name} is now ${nextStatus.toUpperCase()}.`,
      });
      loadData();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Database write error.";
      toast.error("Operation Failed", { description: errorMsg });
    }
  };

  // Create new volunteer profile (CRUD Register)
  const handleRegisterVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPhone) return;

    try {
      const skillsArray = newSkillsString
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "");

      // Geocode mock positions depending on selected sector
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

      toast.success("Volunteer Responder Registered");
      setNewVolunteerOpen(false);
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewSkillsString("");
      loadData();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Database write error.";
      toast.error("Registration Failed", { description: errorMsg });
    }
  };

  // Update assignment statuses (Active -> Complete)
  const handleUpdateAssignmentStatus = async (
    assignId: string,
    nextStatus: "active" | "completed" | "released"
  ) => {
    const assignment = assignments.find((a) => a.id === assignId);
    if (!assignment) return;

    try {
      // Update Assignment status
      const assignResult = await supabase
        .from("volunteer_assignments")
        .update({ status: nextStatus })
        .eq("id", assignment.id)
        .single();
      if (assignResult.error) throw new Error(assignResult.error.message);

      // If completed or released, free up the volunteer to "on-duty"
      if (nextStatus === "completed" || nextStatus === "released") {
        const volResult = await supabase
          .from("volunteers")
          .update({ status: "on-duty" })
          .eq("id", assignment.volunteerId)
          .single();
        if (volResult.error) throw new Error(volResult.error.message);

        // Append log to Incident status History
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

      toast.success(`Assignment marked as ${nextStatus.toUpperCase()}`);
      loadData();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed updating assignment.";
      toast.error("Operation Failed", { description: errorMsg });
    }
  };

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
              <BreadcrumbPage>Volunteer Coordination</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title Block */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-foreground text-2xl font-bold tracking-tight">
              Volunteer Coordination Command
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Deploy on-duty responders, view proximity allocations, and run
              Gemini AI profile matching.
            </p>
          </div>
          {isAuthority && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setDispatchOpen(true)}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <Send className="size-4" />
                <span>Dispatch Responder</span>
              </Button>
              <Button
                onClick={() => setNewVolunteerOpen(true)}
                variant="outline"
                size="sm"
                className="border-border/80 gap-2"
              >
                <Plus className="size-4" />
                <span>Register Profile</span>
              </Button>
            </div>
          )}
        </div>

        {/* Statistics Panels */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Registered Responders
              </CardTitle>
              <Users className="text-primary size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalVolunteers} Volunteers
              </div>
              <p className="text-muted-foreground mt-1 text-[10px]">
                Total registered capacity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                On-Duty Telemetry
              </CardTitle>
              <Compass className="text-accent size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onDutyCount} On-Duty</div>
              <p className="text-muted-foreground mt-1 text-[10px]">
                Ready for immediate dispatch
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Currently Deployed
              </CardTitle>
              <Activity className="text-warning size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedCount} Assigned</div>
              <p className="text-muted-foreground mt-1 text-[10px]">
                Deployments currently staged
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Active Incidents Managed
              </CardTitle>
              <Shield className="text-destructive size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeAssignmentsCount} Active
              </div>
              <p className="text-muted-foreground mt-1 text-[10px]">
                Coordination sectors dispatched
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Proximity Matcher Card */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
              <MapPin className="text-primary size-4" />
              <span>Proximity & Skill Matching Matrix</span>
            </CardTitle>
            <CardDescription>
              Select an active incident location to automatically locate and
              sort the closest on-duty responders.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-md space-y-1.5">
              <label className="text-muted-foreground block text-[10px] font-bold uppercase">
                Select Active Staging Area
              </label>
              <select
                value={proximityIncidentId}
                onChange={(e) => setProximityIncidentId(e.target.value)}
                className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border px-3 py-2 text-xs outline-none"
              >
                <option value="">Choose incident...</option>
                {activeIncidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {inc.location} ({inc.type.toUpperCase()} - Severity:{" "}
                    {inc.severity.toUpperCase()})
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
                <div className="border-border rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Volunteer Name</TableHead>
                        <TableHead>Primary Skills</TableHead>
                        <TableHead>Location Depot</TableHead>
                        <TableHead>Proximity Distance</TableHead>
                        {isAuthority && (
                          <TableHead className="text-right">
                            Quick Dispatch
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proximityVolunteers.map((vol) => (
                        <TableRow key={vol.id}>
                          <TableCell className="text-foreground font-semibold">
                            {vol.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {vol.skills.slice(0, 2).map((s, idx) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="border-primary/20 text-primary px-1 py-0 text-[9.5px]"
                                >
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {vol.locationName}
                          </TableCell>
                          <TableCell className="text-foreground font-mono text-xs font-bold">
                            {vol.distance === 0
                              ? "Under 0.5 km"
                              : `${vol.distance} km away`}
                          </TableCell>
                          {isAuthority && (
                            <TableCell className="text-right">
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() => {
                                  setDispatchOpen(true);
                                }}
                                className="cursor-pointer gap-1"
                              >
                                <Send className="size-3" />
                                <span>Deploy</span>
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )
            ) : (
              <div className="border-border/80 text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center text-xs">
                <AlertTriangle className="text-muted-foreground/60 mb-2 size-6" />
                <p>
                  Please select an incident coordinates area above to run the
                  proximity locator grid.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tab Selection */}
        <div className="space-y-4">
          <div className="border-border flex gap-2 border-b">
            {[
              {
                id: "directory",
                label: "Active Responders Ledger",
                icon: Users,
              },
              {
                id: "assignments",
                label: "Deployment Assignments",
                icon: Briefcase,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setSelectedTab(tab.id as "directory" | "assignments")
                }
                className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
                  selectedTab === tab.id
                    ? "border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                <tab.icon className="size-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {loading ? (
            <div className="space-y-2 py-4">
              <div className="bg-muted h-6 w-full animate-pulse rounded" />
              <div className="bg-muted h-6 w-full animate-pulse rounded" />
            </div>
          ) : (
            <div className="bg-card border-border overflow-hidden rounded-lg border">
              {/* ================= TAB 1: VOLUNTEERS DIRECTORY ================= */}
              {selectedTab === "directory" && (
                <div className="space-y-4 p-4">
                  <div className="space-y-0.5">
                    <h3 className="text-foreground text-sm font-bold">
                      Responder Directory
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Command capabilities list, contact numbers, and duty
                      statuses.
                    </p>
                  </div>

                  <div className="border-border rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Skills</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Staging Depot</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {volunteers.map((vol) => {
                          const canToggle =
                            isAuthority || user?.email === vol.email;
                          return (
                            <TableRow key={vol.id}>
                              <TableCell className="space-y-0.5">
                                <div className="text-foreground font-semibold">
                                  {vol.name}
                                </div>
                                <div className="text-muted-foreground flex items-center gap-1 text-[10px]">
                                  <Phone className="text-muted-foreground size-2.5" />
                                  <span>{vol.phone}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {vol.skills.map((s, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="outline"
                                      className="border-border bg-muted/20 px-1.5 py-0 text-[9px]"
                                    >
                                      {s}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs font-medium">
                                {vol.availabilityHours}
                              </TableCell>
                              <TableCell className="text-foreground text-xs font-medium">
                                {vol.locationName}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    vol.status === "on-duty"
                                      ? "success"
                                      : vol.status === "assigned"
                                        ? "warning"
                                        : "outline"
                                  }
                                  className="h-4.5 px-1.5 py-0 text-[9px] font-bold uppercase"
                                >
                                  {vol.status.replace("-", " ")}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {canToggle && vol.status !== "assigned" ? (
                                  <Button
                                    size="xs"
                                    variant="outline"
                                    onClick={() =>
                                      handleToggleAvailability(vol.id)
                                    }
                                    className="cursor-pointer text-xs"
                                  >
                                    Toggle Duty
                                  </Button>
                                ) : (
                                  <span className="text-muted-foreground text-[10.5px] italic">
                                    Restricted
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: ACTIVE ASSIGNMENTS ================= */}
              {selectedTab === "assignments" && (
                <div className="space-y-4 p-4">
                  <div className="space-y-0.5">
                    <h3 className="text-foreground text-sm font-bold">
                      Volunteer Assignments
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Track dispatched personnel assignments across sectors.
                    </p>
                  </div>

                  {assignments.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center text-xs">
                      No volunteer assignments currently active.
                    </div>
                  ) : (
                    <div className="border-border rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Volunteer</TableHead>
                            <TableHead>Incident Location</TableHead>
                            <TableHead>Assigned Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assignments.map((assign) => {
                            const isAssignedToThisVol =
                              user?.fullName === assign.volunteerName;
                            const canChange =
                              isAuthority || isAssignedToThisVol;
                            return (
                              <TableRow key={assign.id}>
                                <TableCell className="text-foreground font-semibold">
                                  {assign.volunteerName}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                  {assign.incidentLocation} (
                                  {assign.incidentType.toUpperCase()})
                                </TableCell>
                                <TableCell className="text-foreground text-xs font-semibold">
                                  {assign.role}
                                </TableCell>
                                <TableCell>
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
                                </TableCell>
                                <TableCell className="flex justify-end gap-1.5 text-right">
                                  {canChange &&
                                    assign.status === "assigned" && (
                                      <Button
                                        size="xs"
                                        variant="default"
                                        onClick={() =>
                                          handleUpdateAssignmentStatus(
                                            assign.id,
                                            "active"
                                          )
                                        }
                                        className="cursor-pointer gap-1"
                                      >
                                        <Activity className="size-3" />
                                        <span>Activate</span>
                                      </Button>
                                    )}
                                  {canChange && assign.status === "active" && (
                                    <Button
                                      size="xs"
                                      variant="accent"
                                      onClick={() =>
                                        handleUpdateAssignmentStatus(
                                          assign.id,
                                          "completed"
                                        )
                                      }
                                      className="cursor-pointer gap-1"
                                    >
                                      <CheckCircle className="size-3" />
                                      <span>Complete</span>
                                    </Button>
                                  )}
                                  {isAuthority &&
                                    assign.status !== "completed" &&
                                    assign.status !== "released" && (
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        onClick={() =>
                                          handleUpdateAssignmentStatus(
                                            assign.id,
                                            "released"
                                          )
                                        }
                                        className="text-muted-foreground hover:text-destructive hover:border-destructive/30 cursor-pointer gap-1"
                                      >
                                        <RotateCcw className="size-3" />
                                        <span>Release</span>
                                      </Button>
                                    )}
                                </TableCell>
                              </TableRow>
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
            description="Add a new responder profile to the coordination database grid."
          >
            <form onSubmit={handleRegisterVolunteer} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                  Volunteer Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="E.g. Clara Oswald"
                  className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border p-2.5 text-xs outline-none"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="E.g. responder@gmail.com"
                    className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border p-2.5 text-xs outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="E.g. +1-555-0150"
                    className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border p-2.5 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                  Skills / Specializations (Comma separated)
                </label>
                <input
                  type="text"
                  value={newSkillsString}
                  onChange={(e) => setNewSkillsString(e.target.value)}
                  placeholder="E.g. Medical, Water Rescue, First Aid"
                  className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border p-2.5 text-xs outline-none"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                    Initial Depot Base
                  </label>
                  <select
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border px-3 py-2 text-xs outline-none"
                    required
                  >
                    <option value="Sector A, Riverfront">
                      Sector A - Riverfront (East)
                    </option>
                    <option value="Sector B, Downtown">
                      Sector B - Downtown (Central)
                    </option>
                    <option value="Sector C, Warehouse">
                      Sector C - Warehouse (West)
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                    Availability Hours
                  </label>
                  <select
                    value={newHours}
                    onChange={(e) => setNewHours(e.target.value)}
                    className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border px-3 py-2 text-xs outline-none"
                    required
                  >
                    <option value="24/7">24/7 Availability</option>
                    <option value="Weekends">Weekends Only</option>
                    <option value="Weekdays">Weekdays Only</option>
                    <option value="Evenings">Evenings Only</option>
                  </select>
                </div>
              </div>

              <div className="border-border flex justify-end gap-2 border-t pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewVolunteerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  className="gap-1.5"
                >
                  <Plus className="size-3.5" />
                  <span>Register Responder</span>
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
