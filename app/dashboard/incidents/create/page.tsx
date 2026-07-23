"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ShieldAlert, ArrowLeft, Loader2, Upload, Check } from "lucide-react";
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Form Schema
const incidentFormSchema = z.object({
  type: z.string().min(1, "Please select a disaster type"),
  location: z
    .string()
    .min(3, "Location description must be at least 3 characters"),
  latitude: z.coerce
    .number()
    .min(-90, "Latitude must be between -90 and 90")
    .max(90, "Latitude must be between -90 and 90"),
  longitude: z.coerce
    .number()
    .min(-180, "Longitude must be between -180 and 180")
    .max(180, "Longitude must be between -180 and 180"),
  severity: z.enum(["low", "medium", "high", "critical"]),
  peopleAffected: z.coerce
    .number()
    .min(0, "People affected must be a positive number"),
  description: z
    .string()
    .min(10, "Please provide a detailed description (min 10 characters)"),
  medicalEmergency: z.boolean().default(false),
  waterNeeded: z.boolean().default(false),
  foodNeeded: z.boolean().default(false),
  shelterNeeded: z.boolean().default(false),
});

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

export default function CreateIncidentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [imageName, setImageName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      severity: "medium",
      peopleAffected: 0,
      medicalEmergency: false,
      waterNeeded: false,
      foodNeeded: false,
      shelterNeeded: false,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const useMockCoordinates = () => {
    setValue("latitude", 40.7128);
    setValue("longitude", -74.006);
    setValue("location", "Sector A, Riverfront");
    toast.info("Mock coordinates applied");
  };

  const onSubmit = async (values: IncidentFormValues) => {
    if (!user) {
      toast.error("You must be logged in to report disasters.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/analyze-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          reportedBy: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error("AI Triage Analysis failed.");
      }

      const { analysis } = await response.json();

      const incidentData = {
        ...values,
        imageUrl: imageBase64 || "",
        status: "reported",
        reportedBy: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        aiAnalysis: analysis,
      };

      const { error } = await supabase.from("incidents").insert(incidentData);

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Incident registered successfully.");
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Database connection issue.";
      toast.error("Failed to submit report", {
        description: errorMsg,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {submitting && (
        <div className="bg-background/95 fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <h3 className="text-foreground mt-4 text-base font-semibold">
            Analyzing Incident
          </h3>
          <p className="text-muted-foreground mt-1 max-w-xs text-center text-xs">
            Emergency telemetry is being parsed and triage risk levels evaluated...
          </p>
        </div>
      )}
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
                <BreadcrumbPage>Report Incident</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
              className="cursor-pointer h-8 px-3 text-xs"
            >
              <ArrowLeft className="size-3.5 mr-1" />
              Back
            </Button>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-border mx-auto max-w-3xl shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <ShieldAlert className="size-5 shrink-0 text-muted-foreground" />
              <span>Report Incident</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Provide incident details below. Transmission triggers an immediate AI-supported threat assessment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Form Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Disaster Type */}
                <div className="space-y-1">
                  <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    Disaster Type
                  </label>
                  <select
                    {...register("type")}
                    className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-1"
                  >
                    <option value="">Select Category...</option>
                    <option value="flooding">Severe Flooding</option>
                    <option value="fire">Wildfire / Structural Fire</option>
                    <option value="earthquake">Earthquake</option>
                    <option value="medical">Mass Medical Emergency</option>
                    <option value="storm">Severe Storm / Hurricane</option>
                    <option value="other">Other / General Hazard</option>
                  </select>
                  {errors.type && (
                    <span className="text-destructive mt-0.5 block text-[10px]">
                      {errors.type.message}
                    </span>
                  )}
                </div>

                {/* Severity Level */}
                <div className="space-y-1">
                  <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    Severity Level
                  </label>
                  <select
                    {...register("severity")}
                    className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-1"
                  >
                    <option value="low">Low - Minor Hazard</option>
                    <option value="medium">Medium - Staging Required</option>
                    <option value="high">High - Immediate Rescue</option>
                    <option value="critical">Critical - Command Center Trigger</option>
                  </select>
                  {errors.severity && (
                    <span className="text-destructive mt-0.5 block text-[10px]">
                      {errors.severity.message}
                    </span>
                  )}
                </div>

                {/* Location Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    Location Description
                  </label>
                  <input
                    type="text"
                    {...register("location")}
                    placeholder="E.g., Sector A, Riverfront Boulevard"
                    className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-1"
                  />
                  {errors.location && (
                    <span className="text-destructive mt-0.5 block text-[10px]">
                      {errors.location.message}
                    </span>
                  )}
                </div>

                {/* Coordinate Fields */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                      Latitude
                    </label>
                    <button
                      type="button"
                      onClick={useMockCoordinates}
                      className="text-primary text-[10px] font-semibold hover:underline"
                    >
                      Fill Mock Coordinates
                    </button>
                  </div>
                  <input
                    type="text"
                    {...register("latitude")}
                    placeholder="E.g. 40.7128"
                    className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-1"
                  />
                  {errors.latitude && (
                    <span className="text-destructive mt-0.5 block text-[10px]">
                      {errors.latitude.message}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    Longitude
                  </label>
                  <input
                    type="text"
                    {...register("longitude")}
                    placeholder="E.g. -74.0060"
                    className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-1"
                  />
                  {errors.longitude && (
                    <span className="text-destructive mt-0.5 block text-[10px]">
                      {errors.longitude.message}
                    </span>
                  )}
                </div>

                {/* People Affected */}
                <div className="space-y-1">
                  <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    People Affected
                  </label>
                  <input
                    type="number"
                    {...register("peopleAffected")}
                    placeholder="E.g. 150"
                    className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-xs outline-none focus:ring-1"
                  />
                  {errors.peopleAffected && (
                    <span className="text-destructive mt-0.5 block text-[10px]">
                      {errors.peopleAffected.message}
                    </span>
                  )}
                </div>

                {/* Photo Upload */}
                <div className="space-y-1">
                  <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    Incident Photo
                  </label>
                  <div className="border-border bg-background hover:bg-muted/30 relative flex h-[38px] items-center justify-center overflow-hidden rounded-md border border-dashed p-2 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                      {imageName ? (
                        <>
                          <Check className="text-success size-4 shrink-0" />
                          <span className="max-w-[180px] truncate">{imageName}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="size-4 shrink-0" />
                          <span>Choose image...</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource checklist */}
              <div className="border-border space-y-2 border-t pt-4">
                <span className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                  Support Resources Required
                </span>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {/* Medical */}
                  <label className="border-border bg-card hover:bg-muted/10 flex cursor-pointer items-center gap-2.5 rounded-md border p-3 transition-colors select-none">
                    <input
                      type="checkbox"
                      {...register("medicalEmergency")}
                      className="accent-primary size-4 shrink-0 rounded"
                    />
                    <span className="text-foreground text-xs font-medium">Medical Assistance</span>
                  </label>

                  {/* Water */}
                  <label className="border-border bg-card hover:bg-muted/10 flex cursor-pointer items-center gap-2.5 rounded-md border p-3 transition-colors select-none">
                    <input
                      type="checkbox"
                      {...register("waterNeeded")}
                      className="accent-primary size-4 shrink-0 rounded"
                    />
                    <span className="text-foreground text-xs font-medium">Drinking Water</span>
                  </label>

                  {/* Food */}
                  <label className="border-border bg-card hover:bg-muted/10 flex cursor-pointer items-center gap-2.5 rounded-md border p-3 transition-colors select-none">
                    <input
                      type="checkbox"
                      {...register("foodNeeded")}
                      className="accent-primary size-4 shrink-0 rounded"
                    />
                    <span className="text-foreground text-xs font-medium">Food Supplies</span>
                  </label>

                  {/* Shelter */}
                  <label className="border-border bg-card hover:bg-muted/10 flex cursor-pointer items-center gap-2.5 rounded-md border p-3 transition-colors select-none">
                    <input
                      type="checkbox"
                      {...register("shelterNeeded")}
                      className="accent-primary size-4 shrink-0 rounded"
                    />
                    <span className="text-foreground text-xs font-medium">Temporary Shelter</span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="border-border space-y-1 border-t pt-4">
                <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                  Incident Description
                </label>
                <textarea
                  {...register("description")}
                  placeholder="Provide a description of the event including current hazards, blockages, or urgent needs."
                  rows={4}
                  className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-md border p-3 text-xs outline-none focus:ring-1"
                />
                {errors.description && (
                  <span className="text-destructive mt-0.5 block text-[10px]">
                    {errors.description.message}
                  </span>
                )}
              </div>

              {/* Submit triggers */}
              <div className="border-border flex justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard")}
                  disabled={submitting}
                  className="cursor-pointer text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={submitting}
                  className="cursor-pointer text-xs"
                >
                  {submitting ? "Submitting Report..." : "Submit Incident Report"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
