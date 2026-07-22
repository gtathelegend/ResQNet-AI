"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ShieldAlert, ArrowLeft, Send, Upload, Check } from "lucide-react";
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

  // Handle local image uploads via base64 encoding
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

  // Populate mock coordinates
  const useMockCoordinates = () => {
    // Sector A center coordinates
    setValue("latitude", 40.7128);
    setValue("longitude", -74.006);
    setValue("location", "Sector A, Riverfront");
    toast.info("Mock Coordinates Applied", {
      description: "Latitude 40.7128 and Longitude -74.0060 filled.",
    });
  };

  const onSubmit = async (values: IncidentFormValues) => {
    if (!user) {
      toast.error("Unauthenticated Session", {
        description: "You must be logged in to report disasters.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const incidentData = {
        ...values,
        imageUrl: imageBase64 || "",
        status: "reported",
        reportedBy: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { error } = await supabase.from("incidents").insert(incidentData);

      if (error) {
        throw new Error(error.message);
      }

      toast.success("Incident Staged and Logged", {
        description: "Broadcast signal has been initiated successfully.",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Database connection issue.";
      toast.error("Dispatch Failed", {
        description: errorMsg,
      });
    } finally {
      setSubmitting(false);
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
              <BreadcrumbPage>Report Incident</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Link */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="cursor-pointer gap-2"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>

        {/* Form Card */}
        <Card className="border-border mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2 text-xl">
              <ShieldAlert className="size-5 shrink-0" />
              <span>Report Disaster Incident</span>
            </CardTitle>
            <CardDescription>
              Filing this form transmits emergency telemetry to responders.
              Please input accurate coordinates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Form Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Disaster Type */}
                <div className="space-y-1.5">
                  <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                    Disaster Type
                  </label>
                  <select
                    {...register("type")}
                    className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-1"
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
                <div className="space-y-1.5">
                  <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                    Severity Level
                  </label>
                  <select
                    {...register("severity")}
                    className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-1"
                  >
                    <option value="low">Low - Minor Hazard</option>
                    <option value="medium">Medium - Staging Required</option>
                    <option value="high">High - Immediate Rescue</option>
                    <option value="critical">
                      Critical - Command Center Trigger
                    </option>
                  </select>
                  {errors.severity && (
                    <span className="text-destructive mt-0.5 block text-[10px]">
                      {errors.severity.message}
                    </span>
                  )}
                </div>

                {/* Location Name */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                    Location Description
                  </label>
                  <input
                    type="text"
                    {...register("location")}
                    placeholder="E.g., Intersection of Route 4 and Sector B Bridge"
                    className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-1"
                  />
                  {errors.location && (
                    <span className="text-destructive mt-0.5 block text-[10px]">
                      {errors.location.message}
                    </span>
                  )}
                </div>

                {/* Coordinate Fields */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                      Latitude
                    </label>
                    <button
                      type="button"
                      onClick={useMockCoordinates}
                      className="text-primary text-[10px] font-semibold hover:underline"
                    >
                      Fill Mock GPS
                    </button>
                  </div>
                  <input
                    type="text"
                    {...register("latitude")}
                    placeholder="E.g. 40.7128"
                    className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-1"
                  />
                  {errors.latitude && (
                    <span className="text-destructive mt-0.5 block text-[10px]">
                      {errors.latitude.message}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                    Longitude
                  </label>
                  <input
                    type="text"
                    {...register("longitude")}
                    placeholder="E.g. -74.0060"
                    className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-1"
                  />
                  {errors.longitude && (
                    <span className="text-destructive mt-0.5 block text-[10px]">
                      {errors.longitude.message}
                    </span>
                  )}
                </div>

                {/* People Affected */}
                <div className="space-y-1.5">
                  <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                    Estimated People Affected
                  </label>
                  <input
                    type="number"
                    {...register("peopleAffected")}
                    placeholder="E.g. 150"
                    className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-lg border px-3 py-2 text-xs outline-none focus:ring-1"
                  />
                  {errors.peopleAffected && (
                    <span className="text-destructive mt-0.5 block text-[10px]">
                      {errors.peopleAffected.message}
                    </span>
                  )}
                </div>

                {/* File/Image Upload Simulator */}
                <div className="space-y-1.5">
                  <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                    Incident Photo
                  </label>
                  <div className="border-border bg-background hover:bg-muted/30 relative flex h-[38px] items-center justify-center overflow-hidden rounded-lg border border-dashed p-2.5 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
                      {imageName ? (
                        <>
                          <Check className="text-accent size-4 shrink-0" />
                          <span className="max-w-[180px] truncate">
                            {imageName}
                          </span>
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

              {/* Checkbox Checklist for Resource Needs */}
              <div className="border-border space-y-3 border-t pt-4">
                <span className="text-muted-foreground block text-xs font-bold tracking-wider uppercase">
                  Support Resources Needed
                </span>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {/* Medical Need */}
                  <label className="border-border bg-card hover:bg-muted/20 flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition-all select-none">
                    <input
                      type="checkbox"
                      {...register("medicalEmergency")}
                      className="accent-primary size-4 shrink-0 rounded"
                    />
                    <span className="text-foreground text-xs font-semibold">
                      Medical Staging
                    </span>
                  </label>

                  {/* Water Need */}
                  <label className="border-border bg-card hover:bg-muted/20 flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition-all select-none">
                    <input
                      type="checkbox"
                      {...register("waterNeeded")}
                      className="accent-primary size-4 shrink-0 rounded"
                    />
                    <span className="text-foreground text-xs font-semibold">
                      Drinking Water
                    </span>
                  </label>

                  {/* Food Need */}
                  <label className="border-border bg-card hover:bg-muted/20 flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition-all select-none">
                    <input
                      type="checkbox"
                      {...register("foodNeeded")}
                      className="accent-primary size-4 shrink-0 rounded"
                    />
                    <span className="text-foreground text-xs font-semibold">
                      Food Rations
                    </span>
                  </label>

                  {/* Shelter Need */}
                  <label className="border-border bg-card hover:bg-muted/20 flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition-all select-none">
                    <input
                      type="checkbox"
                      {...register("shelterNeeded")}
                      className="accent-primary size-4 shrink-0 rounded"
                    />
                    <span className="text-foreground text-xs font-semibold">
                      Shelter Station
                    </span>
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="border-border space-y-1.5 border-t pt-4">
                <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                  Detailed Hazard Description
                </label>
                <textarea
                  {...register("description")}
                  placeholder="Please state current weather conditions, immediate injuries, accessibility issues, water heights, etc."
                  rows={4}
                  className="border-border bg-background text-foreground focus:border-primary focus:ring-primary w-full rounded-lg border p-3 text-xs outline-none focus:ring-1"
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
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                  disabled={submitting}
                >
                  <Send className="size-3.5" />
                  <span>
                    {submitting
                      ? "Broadcasting Alert..."
                      : "Transmit Emergency Alert"}
                  </span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
