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
                <BreadcrumbLink href="/dashboard" className="text-[#475569] font-semibold">Overview</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-[#0F172A] font-bold">Live Map</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
              Live Map
            </h1>
            <p className="text-sm text-[#475569] font-medium">
              Geographic Command Panel mapping active hazards, shelter vacancies, hospital capacities, and deployed resources.
            </p>
          </div>
        </div>

        {/* Main Map Container with Floating Control Panel */}
        <div className="relative border border-[#CBD5E1] bg-white rounded-lg overflow-hidden h-[620px] shadow-sm w-full">
          {loading ? (
            <div className="bg-[#F8FAFC] flex h-full w-full items-center justify-center">
              <Loader2 className="text-[#2563EB] size-9 animate-spin" />
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
          <div className="absolute top-4 right-4 z-[1000] w-64 bg-white border border-[#CBD5E1] rounded-lg shadow-lg p-4 space-y-4 max-h-[calc(100%-2rem)] overflow-y-auto">
            {/* Layers Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 pb-2 border-b border-[#E2E8F0]">
                <Filter className="size-3.5 text-[#475569]" />
                <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                  Layer Controls
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                {[
                  {
                    id: "disasters",
                    label: "Active Incidents",
                    color: "text-[#DC2626]",
                    icon: ShieldAlert,
                  },
                  {
                    id: "shelters",
                    label: "Emergency Shelters",
                    color: "text-[#2563EB]",
                    icon: Home,
                  },
                  {
                    id: "hospitals",
                    label: "Hospitals & Clinics",
                    color: "text-indigo-600",
                    icon: Activity,
                  },
                  {
                    id: "volunteers",
                    label: "Responders On-Duty",
                    color: "text-[#EA580C]",
                    icon: Users,
                  },
                  {
                    id: "depots",
                    label: "Supply Depots",
                    color: "text-[#16A34A]",
                    icon: Database,
                  },
                ].map((layer) => {
                  const isVisible = filterLayers[layer.id as keyof typeof filterLayers];
                  return (
                    <button
                      key={layer.id}
                      onClick={() => toggleLayer(layer.id as keyof typeof filterLayers)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-md border p-2 text-xs font-bold transition-all ${
                        isVisible
                          ? "bg-[#EFF6FF] border-[#2563EB]/30 text-[#0F172A]"
                          : "border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] bg-white"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <layer.icon className={`size-3.5 ${layer.color}`} />
                        <span>{layer.label}</span>
                      </span>
                      {isVisible ? (
                        <Eye className="text-[#2563EB] size-3.5" />
                      ) : (
                        <EyeOff className="text-[#64748B] size-3.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Heatmap Section */}
            <div className="border-t border-[#E2E8F0] pt-3">
              <button
                onClick={() => setHeatmapEnabled(!heatmapEnabled)}
                className={`flex w-full cursor-pointer items-center justify-between rounded-md border p-2 text-xs font-bold transition-all ${
                  heatmapEnabled
                    ? "border-[#EA580C]/30 bg-[#FFF7ED] text-[#EA580C]"
                    : "border-[#CBD5E1] text-[#475569] hover:bg-[#F8FAFC] bg-white"
                }`}
              >
                <span className="flex items-center gap-1.5 font-bold">
                  <EmergencyIcon className="size-3.5" />
                  <span>Severity Heatmap</span>
                </span>
                {heatmapEnabled ? (
                  <span className="rounded bg-[#FFF7ED] text-[#EA580C] border border-[#EA580C]/20 px-1.5 py-0.5 text-[9px] font-bold uppercase">
                    On
                  </span>
                ) : (
                  <span className="bg-[#F1F5F9] text-[#475569] rounded px-1.5 py-0.5 text-[9px] font-bold uppercase">
                    Off
                  </span>
                )}
              </button>
            </div>

            {/* Staging Metrics Section */}
            <div className="border-t border-[#E2E8F0] pt-3 space-y-2">
              <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider block">
                Staging Metrics
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#475569] font-semibold">Active Incidents:</span>
                  <span className="font-bold text-[#DC2626]">{activeDisasters}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#475569] font-semibold">Shelter Occupancy:</span>
                    <span className="font-bold font-mono text-[10.5px] text-[#0F172A]">
                      {currentShelterOccupancy} / {totalShelterCapacity}
                    </span>
                  </div>
                  <div className="bg-[#F1F5F9] h-1.5 w-full overflow-hidden rounded-full border border-[#E2E8F0]">
                    <div
                      className="h-full bg-[#2563EB]"
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
                  <span className="text-[#475569] font-semibold">Operating Hospitals:</span>
                  <span className="font-bold text-indigo-700">{activeHospitals}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#475569] font-semibold">On-Duty Responders:</span>
                  <span className="font-bold text-[#EA580C]">{activeResponders}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
