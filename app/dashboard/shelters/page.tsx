"use client";

import React, { useState, useEffect } from "react";
import { Home, Plus, Search, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ShelterItem } from "@/types/map";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SheltersPage() {
  const [shelters, setShelters] = useState<ShelterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchShelters = async () => {
    try {
      const { data, error } = await supabase
        .from("shelters")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      if (data) setShelters(data as ShelterItem[]);
    } catch (err: any) {
      console.error("Error loading shelters:", err.message);
      toast.error("Failed to load shelters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, []);

  const handleUpdateOccupancy = async (id: string, current: number, capacity: number, change: number) => {
    const newVal = current + change;
    if (newVal < 0 || newVal > capacity) {
      toast.error("Invalid occupancy level");
      return;
    }

    setUpdatingId(id);
    try {
      const status = newVal === capacity ? "full" : "open";
      const { error } = await supabase
        .from("shelters")
        .update({ currentOccupancy: newVal, status })
        .eq("id", id);

      if (error) throw error;

      setShelters(prev => prev.map(s => s.id === id ? { ...s, currentOccupancy: newVal, status } : s));
      toast.success("Occupancy updated");
    } catch (err: any) {
      toast.error("Failed to update occupancy");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredShelters = shelters.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">Shelters</h1>
            <p className="text-sm text-[#475569] font-medium">
              Monitor evacuation capacities, shelter status, and resource distribution.
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="border border-[#E2E8F0] bg-white rounded-lg p-5">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Total Shelters
            </span>
            <span className="text-2xl font-extrabold text-[#0F172A]">
              {shelters.length}
            </span>
          </div>
          <div className="border border-[#E2E8F0] bg-white rounded-lg p-5">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Total Capacity
            </span>
            <span className="text-2xl font-extrabold text-[#0F172A]">
              {shelters.reduce((acc, s) => acc + s.capacity, 0)} Spaces
            </span>
          </div>
          <div className="border border-[#E2E8F0] bg-white rounded-lg p-5">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block mb-1">
              Total Occupancy
            </span>
            <span className="text-2xl font-extrabold text-[#0F172A]">
              {shelters.reduce((acc, s) => acc + s.currentOccupancy, 0)} Commuters
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#475569]" />
            <input
              type="text"
              placeholder="Search shelters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-[#CBD5E1] bg-white text-[#0F172A] py-2 pl-9 pr-4 text-sm rounded-md placeholder:text-[#64748B] font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Main List */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#475569]" />
          </div>
        ) : filteredShelters.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-[#CBD5E1] border-dashed rounded-lg p-12 text-center bg-white">
            <Home className="h-8 w-8 text-[#475569] mb-3" />
            <h3 className="font-bold text-[#0F172A] text-base">No Shelters Found</h3>
            <p className="text-sm text-[#475569] mt-1 max-w-xs font-semibold">
              {searchQuery ? "Try refining your search query." : "No emergency shelters have been registered in this sector yet."}
            </p>
          </div>
        ) : (
          <div className="border border-[#E2E8F0] bg-white rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#CBD5E1] bg-slate-50 text-[#475569] font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">Shelter Details</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Occupancy</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredShelters.map((shelter) => {
                    const occupancyRate = Math.round((shelter.currentOccupancy / shelter.capacity) * 100);
                    const isFull = shelter.status === "full" || occupancyRate >= 100;
                    
                    return (
                      <tr key={shelter.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-[#0F172A] flex items-center gap-2">
                            <Home className="h-4 w-4 text-[#475569] shrink-0" />
                            {shelter.name}
                          </div>
                          <div className="text-xs text-[#475569] mt-0.5 font-semibold">
                            Coords: {shelter.latitude.toFixed(4)}, {shelter.longitude.toFixed(4)}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold border uppercase ${
                            isFull 
                              ? "bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/20"
                              : "bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20"
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${isFull ? "bg-[#DC2626]" : "bg-[#16A34A]"}`} />
                            {isFull ? "Full" : "Open"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="w-full max-w-[200px]">
                            <div className="flex justify-between text-xs text-[#475569] mb-1 font-bold">
                              <span>{shelter.currentOccupancy} / {shelter.capacity} spaces</span>
                              <span>{occupancyRate}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  occupancyRate >= 90 ? "bg-[#DC2626]" : occupancyRate >= 70 ? "bg-[#EA580C]" : "bg-[#2563EB]"
                                }`} 
                                style={{ width: `${Math.min(100, occupancyRate)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="inline-flex gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingId === shelter.id || shelter.currentOccupancy <= 0}
                              onClick={() => handleUpdateOccupancy(shelter.id, shelter.currentOccupancy, shelter.capacity, -10)}
                              className="h-8 px-2.5 text-xs text-[#475569] font-bold cursor-pointer"
                            >
                              -10
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingId === shelter.id || shelter.currentOccupancy >= shelter.capacity}
                              onClick={() => handleUpdateOccupancy(shelter.id, shelter.currentOccupancy, shelter.capacity, 10)}
                              className="h-8 px-2.5 text-xs text-[#475569] font-bold cursor-pointer"
                            >
                              +10
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
