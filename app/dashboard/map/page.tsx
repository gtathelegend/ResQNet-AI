"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Map as MapIcon,
  ShieldAlert,
  Loader2,
  Filter,
  Eye,
  EyeOff,
  Home,
  Flame as EmergencyIcon,
  Activity,
  Users,
  Database,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabase/client";
import { Incident } from "@/types/incident";
import { VolunteerProfile } from "@/types/volunteer";
import { ResourceItem } from "@/types/resource";
import { ShelterItem, HospitalItem } from "@/types/map";
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

// Dynamically import Leaflet Map to prevent SSR build crashes
const LiveMapCanvas = dynamic(() => import("@/components/map/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-muted border border-border flex h-[620px] w-full animate-pulse items-center justify-center rounded-lg">
      <div className="space-y-3 text-center">
        <Loader2 className="text-primary mx-auto size-9 animate-spin" />
        <p className="text-muted-foreground text-xs font-semibold">
          Initializing Leaflet GIS mapping modules...
        </p>
      </div>
    </div>
  ),
});

export default function LiveDisasterMapPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [shelters, setShelters] = useState<ShelterItem[]>([]);
  const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Layers states
  const [filterLayers, setFilterLayers] = useState({
    disasters: true,
    shelters: true,
    hospitals: true,
    volunteers: true,
    depots: true,
  });
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);

  const loadMapData = async () => {
    try {
      const inc = await supabase.from("incidents").select("*");
      if (inc.data) setIncidents(inc.data as Incident[]);

      const vol = await supabase.from("volunteers").select("*");
      if (vol.data) setVolunteers(vol.data as VolunteerProfile[]);

      const res = await supabase.from("resources").select("*");
      if (res.data) setResources(res.data as ResourceItem[]);

      const sh = await supabase.from("shelters").select("*");
      if (sh.data) setShelters(sh.data as ShelterItem[]);

      const hosp = await supabase.from("hospitals").select("*");
      if (hosp.data) setHospitals(hosp.data as HospitalItem[]);
    } catch (err) {
      console.error("Error loading map telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const activeDisasters = incidents.filter((i) => i.status !== "resolved").length;
  const totalShelterCapacity = shelters.reduce((acc, cur) => acc + cur.capacity, 0);
  const currentShelterOccupancy = shelters.reduce((acc, cur) => acc + cur.currentOccupancy, 0);
  const activeHospitals = hospitals.filter((h) => h.status === "operating").length;
  const activeResponders = volunteers.filter((v) => v.status === "on-duty").length;

  const toggleLayer = (layer: keyof typeof filterLayers) => {
    setFilterLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
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
                <BreadcrumbPage>Live Map</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Live Map
            </h1>
            <p className="text-sm text-muted-foreground">
              Geographic Command Panel mapping active hazards, shelter vacancies, hospital capacities, and deployed resources.
            </p>
          </div>
        </div>

        {/* Main Map Container with Floating Control Panel */}
        <div className="relative border border-border bg-card rounded-lg overflow-hidden h-[620px] shadow-sm w-full">
          {loading ? (
            <div className="bg-muted flex h-full w-full items-center justify-center">
              <Loader2 className="text-primary size-9 animate-spin" />
            </div>
          ) : (
            <LiveMapCanvas
              incidents={incidents}
              volunteers={volunteers}
              resources={resources}
              shelters={shelters}
              hospitals={hospitals}
              filterLayers={filterLayers}
              heatmapEnabled={heatmapEnabled}
            />
          )}

          {/* Minimal Floating Layer Control & Stats Panel */}
          <div className="absolute top-4 right-4 z-[1000] w-64 bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-lg p-4 space-y-4 max-h-[calc(100%-2rem)] overflow-y-auto">
            {/* Layers Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 pb-2 border-b border-border">
                <Filter className="size-3.5 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Layer Controls
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                {[
                  {
                    id: "disasters",
                    label: "Active Incidents",
                    color: "text-red-500",
                    icon: ShieldAlert,
                  },
                  {
                    id: "shelters",
                    label: "Emergency Shelters",
                    color: "text-blue-500",
                    icon: Home,
                  },
                  {
                    id: "hospitals",
                    label: "Hospitals & Clinics",
                    color: "text-indigo-500",
                    icon: Activity,
                  },
                  {
                    id: "volunteers",
                    label: "Responders On-Duty",
                    color: "text-orange-500",
                    icon: Users,
                  },
                  {
                    id: "depots",
                    label: "Supply Depots",
                    color: "text-emerald-500",
                    icon: Database,
                  },
                ].map((layer) => {
                  const isVisible = filterLayers[layer.id as keyof typeof filterLayers];
                  return (
                    <button
                      key={layer.id}
                      onClick={() => toggleLayer(layer.id as keyof typeof filterLayers)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-md border p-2 text-xs font-semibold transition-all ${
                        isVisible
                          ? "bg-primary/5 border-primary/20 text-foreground"
                          : "border-border text-muted-foreground hover:bg-muted/5 bg-background"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <layer.icon className={`size-3.5 ${layer.color}`} />
                        <span>{layer.label}</span>
                      </span>
                      {isVisible ? (
                        <Eye className="text-primary size-3.5" />
                      ) : (
                        <EyeOff className="text-muted-foreground/60 size-3.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Heatmap Section */}
            <div className="border-t border-border pt-3">
              <button
                onClick={() => setHeatmapEnabled(!heatmapEnabled)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-md border p-2 text-xs font-bold transition-all ${
                  heatmapEnabled
                    ? "border-orange-500/20 bg-orange-500/5 text-orange-600 dark:text-orange-400"
                    : "border-border text-muted-foreground hover:bg-muted/5 bg-background"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <EmergencyIcon className="size-3.5" />
                  <span>Severity Heatmap</span>
                </span>
                {heatmapEnabled ? (
                  <span className="rounded bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase">
                    On
                  </span>
                ) : (
                  <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase">
                    Off
                  </span>
                )}
              </button>
            </div>

            {/* Staging Metrics Section */}
            <div className="border-t border-border pt-3 space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Staging Metrics
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active Incidents:</span>
                  <span className="font-semibold text-red-500">{activeDisasters}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shelter Occupancy:</span>
                    <span className="font-semibold font-mono text-[10.5px]">
                      {currentShelterOccupancy} / {totalShelterCapacity}
                    </span>
                  </div>
                  <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${
                          totalShelterCapacity > 0
                            ? (currentShelterOccupancy / totalShelterCapacity) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Operating Hospitals:</span>
                  <span className="font-semibold text-indigo-600">{activeHospitals}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">On-Duty Responders:</span>
                  <span className="font-semibold text-orange-500">{activeResponders}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
