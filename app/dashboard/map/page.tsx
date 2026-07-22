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
    <div className="bg-muted border-border flex h-[550px] w-full animate-pulse items-center justify-center rounded-lg border">
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

  // Fetch telemetry coordinates
  const loadMapData = async () => {
    // Delay state setting to run outside synchronous React 19 render ticks
    await new Promise((resolve) => setTimeout(resolve, 0));
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMapData();
  }, []);

  // Compute live statistics for mapping sidebar
  const activeDisasters = incidents.filter(
    (i) => i.status !== "resolved"
  ).length;
  const totalShelterCapacity = shelters.reduce(
    (acc, cur) => acc + cur.capacity,
    0
  );
  const currentShelterOccupancy = shelters.reduce(
    (acc, cur) => acc + cur.currentOccupancy,
    0
  );
  const activeHospitals = hospitals.filter(
    (h) => h.status === "operating"
  ).length;
  const activeResponders = volunteers.filter(
    (v) => v.status === "on-duty"
  ).length;

  const toggleLayer = (layer: keyof typeof filterLayers) => {
    setFilterLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
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
              <BreadcrumbPage>Live Map</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header Block */}
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-2xl font-bold tracking-tight">
            <MapIcon className="text-primary size-6" />
            <span>Interactive Operations Mapping</span>
          </h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Geographic Command Panel mapping active hazards, shelter vacancies,
            hospital beds, and staged dispatch coordinates.
          </p>
        </div>

        {/* Main Grid View */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Left Column: Leaflet Map Canvas */}
          <div className="border-border relative h-[580px] overflow-hidden rounded-lg border shadow-sm lg:col-span-3">
            {loading ? (
              <div className="bg-muted flex h-full w-full animate-pulse items-center justify-center">
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
          </div>

          {/* Right Column: Layer Toggles & Stats */}
          <div className="space-y-6 lg:col-span-1">
            {/* Map Filters Overlay */}
            <Card className="border-border">
              <CardHeader className="border-border border-b pb-3">
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold tracking-wider uppercase">
                  <Filter className="text-primary size-4" />
                  <span>Layer Controls</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Filter dashboard coordinates dynamically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Switchable Layer Options */}
                <div className="space-y-2.5">
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
                      label: "Supply Warehouses",
                      color: "text-emerald-500",
                      icon: Database,
                    },
                  ].map((layer) => {
                    const isVisible =
                      filterLayers[layer.id as keyof typeof filterLayers];
                    return (
                      <button
                        key={layer.id}
                        onClick={() =>
                          toggleLayer(layer.id as keyof typeof filterLayers)
                        }
                        className={`hover:bg-muted/40 flex w-full cursor-pointer items-center justify-between rounded-lg border p-2 text-xs font-semibold transition-all ${
                          isVisible
                            ? "bg-primary/5 border-primary/20 text-foreground"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <layer.icon className={`size-4 ${layer.color}`} />
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

                {/* Heatmap Overlay Toggle */}
                <div className="border-border border-t pt-4">
                  <button
                    onClick={() => setHeatmapEnabled(!heatmapEnabled)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-lg border p-2.5 text-xs font-bold transition-all ${
                      heatmapEnabled
                        ? "border-orange-500/25 bg-orange-500/10 text-orange-600 dark:text-orange-400"
                        : "border-border text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <EmergencyIcon className="size-4 animate-pulse" />
                      <span>Severity Density Heatmap</span>
                    </span>
                    {heatmapEnabled ? (
                      <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[10px] font-extrabold uppercase">
                        Active
                      </span>
                    ) : (
                      <span className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                        Off
                      </span>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Staging Summaries */}
            <Card className="border-border">
              <CardHeader className="border-border border-b pb-3">
                <CardTitle className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                  Staging Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Active Disasters:
                  </span>
                  <strong className="font-bold text-red-500">
                    {activeDisasters}
                  </strong>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      Shelter Occupancy:
                    </span>
                    <strong className="font-mono">
                      {currentShelterOccupancy} / {totalShelterCapacity}
                    </strong>
                  </div>
                  <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${
                          totalShelterCapacity > 0
                            ? (currentShelterOccupancy / totalShelterCapacity) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="border-border flex items-center justify-between border-t border-dashed pt-3 text-xs">
                  <span className="text-muted-foreground">
                    Operating Hospitals:
                  </span>
                  <strong className="font-bold text-indigo-600">
                    {activeHospitals}
                  </strong>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    On-Duty Volunteers:
                  </span>
                  <strong className="font-bold text-orange-500">
                    {activeResponders}
                  </strong>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
