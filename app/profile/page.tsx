"use client";

import React from "react";
import { User, Shield, Mail, Calendar, LogOut, Cpu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { user, session, role, logout } = useAuth();

  const getRoleBadge = (userRole: string | null) => {
    switch (userRole) {
      case "authority":
        return (
          <Badge variant="destructive">Authority Clearance (Level 3)</Badge>
        );
      case "volunteer":
        return <Badge variant="warning">Volunteer Clearance (Level 2)</Badge>;
      case "citizen":
        return <Badge variant="success">Citizen Account (Level 1)</Badge>;
      default:
        return <Badge variant="outline">Guest</Badge>;
    }
  };

  const getRoleCardDescription = (userRole: string | null) => {
    switch (userRole) {
      case "authority":
        return "You have unrestricted access to dispatch units, deploy resources, review reports, and coordinate emergency responses across all sectors.";
      case "volunteer":
        return "You have permissions to accept field dispatch tasks, report deployment logs, and view resource staging allocations.";
      case "citizen":
        return "You have basic access to submit local incident reports, request emergency assistance, and track evacuation/resource alerts.";
      default:
        return "No active security clearances configured.";
    }
  };

  return (
    <DashboardLayout>
      {/* Breadcrumb and Page Title */}
      <div className="flex flex-col gap-2">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Profile</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Account Profile
        </h1>
      </div>

      {/* Profile Details Layout */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-full">
                <User className="size-8" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl">
                  {user?.fullName || "Command Center User"}
                </CardTitle>
                <div className="mt-0.5 flex items-center gap-2">
                  {getRoleBadge(role)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="border-border/60 space-y-4 border-t pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border-border/40 bg-card flex items-center gap-3 rounded-lg border p-3">
                <Mail className="text-muted-foreground size-4" />
                <div className="space-y-0.5">
                  <span className="text-muted-foreground block text-[10px] font-semibold tracking-wider uppercase">
                    Email Address
                  </span>
                  <span className="text-foreground text-sm font-medium">
                    {user?.email}
                  </span>
                </div>
              </div>
              <div className="border-border/40 bg-card flex items-center gap-3 rounded-lg border p-3">
                <Calendar className="text-muted-foreground size-4" />
                <div className="space-y-0.5">
                  <span className="text-muted-foreground block text-[10px] font-semibold tracking-wider uppercase">
                    Joined Platform
                  </span>
                  <span className="text-foreground text-sm font-medium">
                    July 22, 2026
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-muted/40 border-border/20 rounded-lg border p-4">
              <span className="text-foreground mb-1 block text-xs font-bold">
                Clearance Privileges
              </span>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {getRoleCardDescription(role)}
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-border/40 bg-muted/20 flex justify-end gap-2 border-t py-4">
            <Button
              onClick={logout}
              variant="destructive"
              size="sm"
              className="gap-2"
            >
              <LogOut className="size-4" />
              <span>Sign Out Session</span>
            </Button>
          </CardFooter>
        </Card>

        {/* Right Column: Security/Telemetry Card */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="text-primary size-4" />
                <span>Security Token</span>
              </CardTitle>
              <CardDescription>Active encryption token data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground block font-sans text-[10px] font-semibold tracking-wider uppercase">
                  Access Token Prefix
                </span>
                <div className="bg-muted text-muted-foreground truncate rounded p-2 select-all">
                  {session?.accessToken || "Null"}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground block font-sans text-[10px] font-semibold tracking-wider uppercase">
                  Session Expires At
                </span>
                <div className="bg-muted text-muted-foreground rounded p-2">
                  {session
                    ? new Date(session.expiresAt).toLocaleString()
                    : "Null"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Cpu className="text-accent size-4" />
                <span>Local Platform Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode:</span>
                <Badge
                  variant="outline"
                  className="border-accent/20 bg-accent/5 text-accent font-bold"
                >
                  Mock Local Server
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment:</span>
                <span className="text-foreground font-medium">
                  {process.env.NODE_ENV}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telemetry:</span>
                <span className="text-success font-medium">Normal</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
