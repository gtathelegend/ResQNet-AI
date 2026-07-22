"use client";

import React from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSkeleton } from "@/components/ui/loading";
import { AuthorityDashboard } from "@/components/dashboard/AuthorityDashboard";
import { VolunteerDashboard } from "@/components/dashboard/VolunteerDashboard";
import { CitizenDashboard } from "@/components/dashboard/CitizenDashboard";

export default function DashboardRouterPage() {
  const { user, role, isLoading } = useAuth();

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

  if (isLoading || !user) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-muted h-10 w-1/4 animate-pulse rounded" />
          <LoadingSkeleton rows={4} />
        </div>
      </DashboardLayout>
    );
  }

  // Choose the dashboard UI corresponding to the active role
  const renderDashboardContent = () => {
    switch (role) {
      case "authority":
        return <AuthorityDashboard user={user} />;
      case "volunteer":
        return (
          <VolunteerDashboard
            user={user}
            triggerToast={triggerToast}
            triggerAlertToast={triggerAlertToast}
          />
        );
      case "citizen":
        return (
          <CitizenDashboard
            user={user}
            triggerToast={triggerToast}
            triggerAlertToast={triggerAlertToast}
          />
        );
      default:
        return (
          <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
            <h3 className="text-foreground text-lg font-bold">Guest Mode</h3>
            <p className="text-muted-foreground mt-2 max-w-xs text-xs">
              Configure security clearances in your profile to view operations
              panels.
            </p>
          </div>
        );
    }
  };

  return <DashboardLayout>{renderDashboardContent()}</DashboardLayout>;
}
