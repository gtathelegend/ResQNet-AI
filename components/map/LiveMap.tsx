"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Incident } from "@/types/incident";
import { VolunteerProfile } from "@/types/volunteer";
import { ResourceItem } from "@/types/resource";
import { ShelterItem, HospitalItem } from "@/types/map";

interface LiveMapProps {
  incidents: Incident[];
  volunteers: VolunteerProfile[];
  resources: ResourceItem[];
  shelters: ShelterItem[];
  hospitals: HospitalItem[];
  filterLayers: {
    disasters: boolean;
    shelters: boolean;
    hospitals: boolean;
    volunteers: boolean;
    depots: boolean;
  };
  heatmapEnabled: boolean;
}

export default function LiveMap({
  incidents,
  volunteers,
  resources,
  shelters,
  hospitals,
  filterLayers,
  heatmapEnabled,
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const heatmapLayerGroupRef = useRef<L.LayerGroup | null>(null);

  // 1. Initialize Map (only once)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center coordinates for New York/Sectors
    const initialMap = L.map(mapContainerRef.current, {
      center: [40.7306, -73.9352],
      zoom: 12.5,
      zoomControl: true,
    });

    // Dark-mode styled tile layer or standard OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(initialMap);

    mapRef.current = initialMap;
    markerLayerGroupRef.current = L.layerGroup().addTo(initialMap);
    heatmapLayerGroupRef.current = L.layerGroup().addTo(initialMap);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Redraw Markers when Filters/Data changes
  useEffect(() => {
    const map = mapRef.current;
    const markerGroup = markerLayerGroupRef.current;
    const heatmapGroup = heatmapLayerGroupRef.current;

    if (!map || !markerGroup || !heatmapGroup) return;

    // Clear previous drawings
    markerGroup.clearLayers();
    heatmapGroup.clearLayers();

    // Helper: Create custom CSS icons to bypass broken leaflet pin assets
    const createMarkerIcon = (colorClass: string, symbol: string) => {
      return L.divIcon({
        className: "custom-div-icon",
        html: `
          <div class="flex items-center justify-center size-8 rounded-full border-2 border-white shadow-md text-white text-xs font-bold transition-transform hover:scale-110 cursor-pointer ${colorClass}">
            <span>${symbol}</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });
    };

    // A. Add Incident Disasters
    if (filterLayers.disasters) {
      incidents.forEach((inc) => {
        const color =
          inc.severity === "critical"
            ? "bg-red-600 animate-pulse"
            : inc.severity === "high"
              ? "bg-orange-500"
              : inc.severity === "medium"
                ? "bg-yellow-500"
                : "bg-blue-500";

        const icon = createMarkerIcon(color, "🚨");

        const popupHTML = `
          <div class="p-2 font-sans text-xs min-w-[220px]">
            <div class="flex justify-between items-center mb-1 pb-1 border-b border-[#E2E8F0]">
              <span class="font-extrabold uppercase text-[#DC2626] text-[9px]">🚨 DISASTER IN PROGRESS</span>
              <span class="text-[9px] font-bold text-[#64748B]">${new Date(inc.createdAt).toLocaleDateString()}</span>
            </div>
            <h4 class="font-bold text-sm text-[#0F172A] capitalize mb-1">${inc.type}</h4>
            <p class="text-[#475569] font-semibold leading-relaxed mb-2">${inc.description.substring(0, 70)}...</p>
            <div class="grid grid-cols-2 gap-1 text-[10.5px] border-t border-[#E2E8F0] pt-1.5 mt-1.5 font-bold">
              <div>Severity: <strong class="text-[#DC2626] capitalize">${inc.severity}</strong></div>
              <div>Affected: <strong class="text-[#0F172A]">${inc.peopleAffected}</strong></div>
            </div>
            <div class="mt-2.5 flex items-center justify-between">
              <span class="text-[9px] bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20 px-1.5 py-0.5 rounded font-mono font-bold">${inc.status.toUpperCase()}</span>
              <a href="/dashboard/incidents/${inc.id}" class="text-[#2563EB] hover:underline font-bold text-[10px]">View Details &rarr;</a>
            </div>
          </div>
        `;

        L.marker([inc.latitude, inc.longitude], { icon })
          .bindPopup(popupHTML)
          .addTo(markerGroup);

        // Draw heat circles if enabled
        if (heatmapEnabled) {
          const heatColor =
            inc.severity === "critical"
              ? "#ef4444"
              : inc.severity === "high"
                ? "#f97316"
                : "#eab308";

          // Radius proportional to affected population
          const radius = Math.max(
            200,
            Math.min(1200, inc.peopleAffected * 1.5)
          );

          L.circle([inc.latitude, inc.longitude], {
            radius,
            color: heatColor,
            fillColor: heatColor,
            fillOpacity: 0.1,
            stroke: true,
            weight: 1,
          }).addTo(heatmapGroup);
        }
      });
    }

    // B. Add Shelters
    if (filterLayers.shelters) {
      shelters.forEach((shelter) => {
        const icon = createMarkerIcon("bg-blue-600", "🏠");
        const occupancyRate = Math.round(
          (shelter.currentOccupancy / shelter.capacity) * 100
        );

        const popupHTML = `
          <div class="p-2 font-sans text-xs min-w-[200px]">
            <div class="flex justify-between items-center mb-1 pb-1 border-b border-[#E2E8F0]">
              <span class="font-extrabold uppercase text-[#2563EB] text-[9px]">🏠 SHELTER</span>
              <span class="text-[9px] font-bold text-[#16A34A]">Open</span>
            </div>
            <h4 class="font-bold text-sm text-[#0F172A] mb-1">${shelter.name}</h4>
            <div class="space-y-1 mt-1 text-[11px] font-bold">
              <div>Occupancy: <strong class="text-[#0F172A]">${shelter.currentOccupancy} / ${shelter.capacity} (${occupancyRate}%)</strong></div>
              <div class="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                <div class="bg-[#2563EB] h-full" style="width: ${occupancyRate}%"></div>
              </div>
            </div>
            <div class="mt-2 text-right">
              <a href="/dashboard/shelters" class="text-[#2563EB] hover:underline font-bold text-[10px]">View Directory &rarr;</a>
            </div>
          </div>
        `;

        L.marker([shelter.latitude, shelter.longitude], { icon })
          .bindPopup(popupHTML)
          .addTo(markerGroup);
      });
    }

    // C. Add Hospitals
    if (filterLayers.hospitals) {
      hospitals.forEach((hosp) => {
        const icon = createMarkerIcon("bg-indigo-600", "🏥");
        const loadRate = Math.round(
          (hosp.currentOccupancy / hosp.capacity) * 100
        );

        const popupHTML = `
          <div class="p-2 font-sans text-xs min-w-[200px]">
            <div class="flex justify-between items-center mb-1 pb-1 border-b border-[#E2E8F0]">
              <span class="font-extrabold uppercase text-indigo-600 text-[9px]">🏥 HOSPITAL CENTER</span>
              <span class="text-[9px] font-bold text-indigo-600 capitalize">${hosp.status}</span>
            </div>
            <h4 class="font-bold text-sm text-[#0F172A] mb-1">${hosp.name}</h4>
            <div class="space-y-1 mt-1 text-[11px] font-bold">
              <div>ER Capacity: <strong class="text-[#0F172A]">${hosp.currentOccupancy} / ${hosp.capacity} Beds (${loadRate}%)</strong></div>
              <div class="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                <div class="bg-indigo-600 h-full" style="width: ${loadRate}%"></div>
              </div>
            </div>
          </div>
        `;

        L.marker([hosp.latitude, hosp.longitude], { icon })
          .bindPopup(popupHTML)
          .addTo(markerGroup);
      });
    }

    // D. Add Volunteers
    if (filterLayers.volunteers) {
      volunteers.forEach((vol) => {
        const icon = createMarkerIcon("bg-orange-500", "🙋");

        const popupHTML = `
          <div class="p-2 font-sans text-xs min-w-[180px]">
            <div class="flex justify-between items-center mb-1 pb-1 border-b border-[#E2E8F0]">
              <span class="font-extrabold uppercase text-orange-500 text-[9px]">🙋 VOLUNTEER</span>
              <span class="text-[9px] font-bold text-[#16A34A] capitalize">${vol.status}</span>
            </div>
            <h4 class="font-bold text-sm text-[#0F172A] mb-0.5">${vol.name}</h4>
            <div class="text-[9.5px] text-[#475569] mb-1.5 font-bold">Hours: ${vol.availabilityHours}</div>
            <div class="flex flex-wrap gap-1 mb-2">
              ${vol.skills
                .slice(0, 2)
                .map(
                  (s) =>
                    `<span class="text-[9px] bg-[#F1F5F9] text-[#475569] border border-[#E2E8F0] px-1 py-0.5 rounded font-bold">${s}</span>`
                )
                .join("")}
            </div>
            <div class="mt-2 text-right border-t border-[#E2E8F0] pt-1.5">
              <a href="/dashboard/volunteers" class="text-[#2563EB] hover:underline font-bold text-[10px]">View Directory &rarr;</a>
            </div>
          </div>
        `;

        L.marker([vol.latitude, vol.longitude], { icon })
          .bindPopup(popupHTML)
          .addTo(markerGroup);
      });
    }

    // E. Add Resources (Depots)
    if (filterLayers.depots) {
      const uniqueDepots = Array.from(new Set(resources.map((r) => r.depot)));

      uniqueDepots.forEach((depotName) => {
        let lat = 40.715;
        let lng = -74.001;
        if (depotName.includes("Beta")) {
          lat = 40.74;
          lng = -73.96;
        }

        const icon = createMarkerIcon("bg-emerald-600", "📦");
        const depotItems = resources.filter((r) => r.depot === depotName);

        const itemsHTML = depotItems
          .slice(0, 4)
          .map(
            (r) =>
              `<div class="flex justify-between text-[10.5px] font-bold text-[#475569]"><span>${r.name}:</span><strong class="text-[#0F172A] font-extrabold">${r.availableStock} / ${r.totalStock}</strong></div>`
          )
          .join("");

        const popupHTML = `
          <div class="p-2 font-sans text-xs min-w-[200px]">
            <div class="flex justify-between items-center mb-1.5 pb-1 border-b border-[#E2E8F0]">
              <span class="font-extrabold uppercase text-emerald-600 text-[9px]">📦 LOGISTICS DEPOT</span>
              <span class="text-[9px] font-bold text-emerald-600 font-mono">Synced</span>
            </div>
            <h4 class="font-bold text-sm text-[#0F172A] mb-1.5">${depotName}</h4>
            <div class="space-y-0.5 border-t pt-1 border-[#E2E8F0] border-dashed mt-1 mb-2">
              ${itemsHTML}
            </div>
            <div class="mt-2 text-right border-t border-[#E2E8F0] pt-1.5">
              <a href="/dashboard/resources" class="text-[#2563EB] hover:underline font-bold text-[10px]">View Resources &rarr;</a>
            </div>
          </div>
        `;

        L.marker([lat, lng], { icon }).bindPopup(popupHTML).addTo(markerGroup);
      });
    }
  }, [
    incidents,
    volunteers,
    resources,
    shelters,
    hospitals,
    filterLayers,
    heatmapEnabled,
  ]);

  return (
    <div className="border-border bg-muted relative h-full min-h-[500px] w-full overflow-hidden rounded-lg border">
      <div ref={mapContainerRef} className="z-0 h-full min-h-[500px] w-full" />
    </div>
  );
}
