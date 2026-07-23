"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Package,
  Activity,
  History,
  Plus,
  TrendingUp,
  Database,
  Truck,
  RotateCcw,
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
import {
  ResourceItem,
  ResourceAllocation,
  ResourceHistoryLog,
} from "@/types/resource";
import { Incident } from "@/types/incident";
import { AllocateResourceModal } from "@/components/resources/AllocateResourceModal";

export default function ResourceCenterPage() {
  const { user, role } = useAuth();
  const isCitizen = role === "citizen";

  // Data states
  const [inventory, setInventory] = useState<ResourceItem[]>([]);
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [historyLogs, setHistoryLogs] = useState<ResourceHistoryLog[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "inventory" | "allocations" | "history"
  >("inventory");

  // Stock Adjustment Form State
  const [adjustResourceId, setAdjustResourceId] = useState("");
  const [adjustQuantity, setAdjustQuantity] = useState<number>(0);
  const [adjustDepot, setAdjustDepot] = useState("Depot Alpha");
  const [isAddMode, setIsAddMode] = useState(true);

  // New Resource Form State
  const [newResourceOpen, setNewResourceOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<
    "supplies" | "vehicles" | "personnel"
  >("supplies");
  const [newTotalStock, setNewTotalStock] = useState<number>(100);
  const [newUnit, setNewUnit] = useState("units");
  const [newDepot, setNewDepot] = useState("Depot Alpha");

  // Load resources telemetry from Supabase
  const loadData = async () => {
    try {
      const resData = await supabase
        .from("resources")
        .select("*")
        .order("name", { ascending: true });
      if (resData.data) setInventory(resData.data as ResourceItem[]);

      const allocData = await supabase
        .from("resource_allocations")
        .select("*")
        .order("createdAt", { ascending: false });
      if (allocData.data)
        setAllocations(allocData.data as ResourceAllocation[]);

      const histData = await supabase
        .from("resource_history")
        .select("*")
        .order("createdAt", { ascending: false });
      if (histData.data) setHistoryLogs(histData.data as ResourceHistoryLog[]);

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
            incAllData.data.filter(
              (i: Incident) => i.status !== "resolved"
            ) as Incident[]
          );
        }
      }
    } catch (err) {
      console.error("Error loading resources data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute stats
  const totalStockItems = inventory.reduce(
    (sum, item) => sum + item.totalStock,
    0
  );
  const totalAllocatedItems = inventory.reduce(
    (sum, item) => sum + item.allocatedStock,
    0
  );
  const dispatchPercent =
    totalStockItems > 0
      ? Math.round((totalAllocatedItems / totalStockItems) * 100)
      : 0;
  const uniqueDepots = Array.from(
    new Set(inventory.map((item) => item.depot))
  ).length;

  // Handle stock levels update
  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !adjustResourceId || adjustQuantity <= 0) return;

    const resource = inventory.find((r) => r.id === adjustResourceId);
    if (!resource) return;

    try {
      let nextTotal = resource.totalStock;
      let nextAvail = resource.availableStock;

      if (isAddMode) {
        nextTotal += adjustQuantity;
        nextAvail += adjustQuantity;
      } else {
        if (adjustQuantity > resource.availableStock) {
          toast.error("Cannot reduce stock below active allocated quantities.");
          return;
        }
        nextTotal -= adjustQuantity;
        nextAvail -= adjustQuantity;
      }

      const resResult = await supabase
        .from("resources")
        .update({
          totalStock: nextTotal,
          availableStock: nextAvail,
          depot: adjustDepot,
        })
        .eq("id", resource.id)
        .single();
      if (resResult.error) throw new Error(resResult.error.message);

      const log = {
        resourceId: resource.id,
        resourceName: resource.name,
        action: isAddMode ? ("stock_add" as const) : ("stock_reduce" as const),
        quantity: adjustQuantity,
        performedBy: user.email,
        createdAt: new Date().toISOString(),
        note: isAddMode
          ? `Added ${adjustQuantity} ${resource.unit} to stock at ${adjustDepot}`
          : `Reduced stock by ${adjustQuantity} ${resource.unit} at ${adjustDepot}`,
      };

      const histResult = await supabase.from("resource_history").insert(log);
      if (histResult.error) throw new Error(histResult.error.message);

      toast.success("Stock adjusted successfully");
      setStockModalOpen(false);
      setAdjustQuantity(0);
      setAdjustResourceId("");
      loadData();
    } catch (err: unknown) {
      toast.error("Failed to adjust stock");
    }
  };

  // Handle resource category registration
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newName || newTotalStock <= 0) return;

    try {
      const resource = {
        name: newName,
        category: newCategory,
        totalStock: newTotalStock,
        allocatedStock: 0,
        availableStock: newTotalStock,
        unit: newUnit,
        depot: newDepot,
        updatedAt: new Date().toISOString(),
      };

      const resResult = await supabase.from("resources").insert(resource);
      if (resResult.error) throw new Error(resResult.error.message);

      const log = {
        resourceId: "new-resource",
        resourceName: newName,
        action: "stock_add" as const,
        quantity: newTotalStock,
        performedBy: user.email,
        createdAt: new Date().toISOString(),
        note: `Initialized new inventory item: ${newName} with ${newTotalStock} ${newUnit} at ${newDepot}`,
      };

      const histResult = await supabase.from("resource_history").insert(log);
      if (histResult.error) throw new Error(histResult.error.message);

      toast.success("New resource category registered");
      setNewResourceOpen(false);
      setNewName("");
      setNewTotalStock(100);
      setNewUnit("units");
      setNewDepot("Depot Alpha");
      loadData();
    } catch (err: unknown) {
      toast.error("Failed to register resource");
    }
  };

  // Update allocation status
  const handleUpdateAllocationStatus = async (
    allocId: string,
    nextStatus: "delivered" | "returned"
  ) => {
    if (!user) return;
    const allocation = allocations.find((a) => a.id === allocId);
    if (!allocation) return;

    try {
      const allocResult = await supabase
        .from("resource_allocations")
        .update({ status: nextStatus })
        .eq("id", allocation.id)
        .single();
      if (allocResult.error) throw new Error(allocResult.error.message);

      if (nextStatus === "returned") {
        const resource = inventory.find((r) => r.id === allocation.resourceId);
        if (resource) {
          const nextAllocStock = Math.max(
            0,
            resource.allocatedStock - allocation.quantity
          );
          const nextAvailStock = resource.totalStock - nextAllocStock;

          const resResult = await supabase
            .from("resources")
            .update({
              allocatedStock: nextAllocStock,
              availableStock: nextAvailStock,
            })
            .eq("id", resource.id)
            .single();
          if (resResult.error) throw new Error(resResult.error.message);
        }
      }

      const log = {
        resourceId: allocation.resourceId,
        resourceName: allocation.resourceName,
        action:
          nextStatus === "returned"
            ? ("deallocate" as const)
            : ("allocate" as const),
        quantity: allocation.quantity,
        performedBy: user.email,
        createdAt: new Date().toISOString(),
        note:
          nextStatus === "returned"
            ? `Returned ${allocation.quantity} units from ${allocation.incidentType} incident staging.`
            : `Dispatched units delivered to ${allocation.incidentType} scene.`,
      };

      const histResult = await supabase.from("resource_history").insert(log);
      if (histResult.error) throw new Error(histResult.error.message);

      toast.success(`Dispatch marked as ${nextStatus}`);
      loadData();
    } catch (err: unknown) {
      toast.error("Failed to update status");
    }
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
                <BreadcrumbPage className="text-[#0F172A] font-bold">Resources</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">
                Resources
              </h1>
              <p className="text-sm text-[#475569] font-medium">
                Manage depot inventories, check logistics telemetry, and authorize staging allocations.
              </p>
            </div>
            {!isCitizen && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setAllocateOpen(true)}
                  variant="default"
                  size="sm"
                  className="h-9 px-4 text-xs font-bold cursor-pointer"
                >
                  Allocate Resources
                </Button>
                <Button
                  onClick={() => setNewResourceOpen(true)}
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 text-xs font-bold cursor-pointer"
                >
                  Register Category
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Panels */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Depots Active", value: `${uniqueDepots} Centers`, desc: "Registered staging depots" },
            { title: "Resource Classes", value: `${inventory.length} Categories`, desc: "Supplies, vehicles, and teams" },
            { title: "Allocation Rate", value: `${dispatchPercent}%`, desc: `${totalAllocatedItems.toLocaleString()} / ${totalStockItems.toLocaleString()} units active` },
            { title: "Staged Dispatches", value: allocations.filter((a) => a.status !== "returned").length, desc: "Units currently en-route" },
          ].map((card, idx) => (
            <div key={idx} className="border border-[#E2E8F0] bg-white rounded-lg p-5">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                {card.title}
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-[#0F172A] block">
                {card.value}
              </span>
              <span className="text-xs text-[#475569] mt-1.5 block font-medium">
                {card.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Dispatch Cap Gauge */}
          <Card className="border border-[#E2E8F0] bg-white shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                Allocation Rate
              </CardTitle>
              <CardDescription className="text-xs text-[#475569] font-medium">
                Total proportion of total depot inventories currently staged.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative flex h-44 flex-col items-center justify-center pt-2">
              <svg viewBox="0 0 120 120" className="h-32 w-32 text-slate-100">
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="6"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * dispatchPercent) / 100}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  className="transition-all duration-300"
                />
                <text
                  x="60"
                  y="66"
                  textAnchor="middle"
                  fill="#0F172A"
                  className="fill-[#0F172A] font-mono text-base font-extrabold"
                >
                  {dispatchPercent}%
                </text>
              </svg>
            </CardContent>
          </Card>

          {/* comparative Stock Bar Chart */}
          <Card className="border border-[#E2E8F0] bg-white md:col-span-2 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                Stock Levels Comparison
              </CardTitle>
              <CardDescription className="text-xs text-[#475569] font-medium">
                Available stock (Solid Blue) vs Allocated stock (Gray/Neutral) per category.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-44 items-center justify-center pt-2">
              {loading ? (
                <div className="bg-[#F8FAFC] h-10 w-1/4 animate-pulse rounded" />
              ) : inventory.length === 0 ? (
                <div className="text-[#475569] text-xs font-semibold">
                  No inventory categories registered.
                </div>
              ) : (
                <svg viewBox="0 0 500 150" className="h-full w-full text-slate-100" fill="none">
                  <line x1="40" y1="15" x2="480" y2="15" stroke="currentColor" strokeWidth="1" />
                  <line x1="40" y1="60" x2="480" y2="60" stroke="currentColor" strokeWidth="1" />
                  <line x1="40" y1="110" x2="480" y2="110" stroke="currentColor" strokeWidth="1" strokeOpacity="2" />

                  {inventory.slice(0, 6).map((item, idx) => {
                    const xPos = 60 + idx * 72;
                    const maxVal = Math.max(
                      ...inventory.map((i) => i.totalStock),
                      1
                    );

                    const availHeight = (item.availableStock / maxVal) * 95;
                    const allocHeight = (item.allocatedStock / maxVal) * 95;

                    const yAvail = 110 - availHeight;
                    const yAlloc = 110 - allocHeight;

                    return (
                      <g key={idx}>
                        {/* Available Stock (Blue Bar) */}
                        <rect
                          x={xPos}
                          y={yAvail}
                          width="12"
                          height={availHeight}
                          rx="1.5"
                          fill="#2563EB"
                          fillOpacity="0.85"
                        />
                        {/* Allocated Stock (Neutral Bar) */}
                        <rect
                          x={xPos + 14}
                          y={yAlloc}
                          width="12"
                          height={allocHeight}
                          rx="1.5"
                          fill="#64748B"
                          fillOpacity="0.35"
                        />
                        {/* Label name */}
                        <text
                          x={xPos + 13}
                          y="130"
                          fill="#475569"
                          className="fill-[#475569] font-bold"
                          fontSize="8.5"
                          textAnchor="middle"
                        >
                          {item.name.substring(0, 8)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tab Selection */}
        <div className="space-y-4">
          <div className="border-b border-[#CBD5E1] flex gap-2">
            {[
              { id: "inventory", label: "Inventory Stock", icon: Package },
              { id: "allocations", label: "Active Dispatches", icon: Truck },
              { id: "history", label: "Audit Ledger", icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as "inventory" | "allocations" | "history")}
                className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
                  selectedTab === tab.id
                    ? "border-[#2563EB] text-[#2563EB]"
                    : "text-[#475569] hover:text-[#0F172A] border-transparent"
                }`}
              >
                <tab.icon className="size-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          {loading ? (
            <div className="space-y-2 py-4">
              <div className="bg-[#F8FAFC] h-6 w-full animate-pulse rounded" />
              <div className="bg-[#F8FAFC] h-6 w-full animate-pulse rounded" />
            </div>
          ) : (
            <div className="bg-white border border-[#E2E8F0] overflow-hidden rounded-md">
              {/* TAB 1: STOCK INVENTORY */}
              {selectedTab === "inventory" && (
                <div className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[#0F172A] text-sm font-bold">Stock Inventory</h3>
                      <p className="text-[#475569] text-xs mt-0.5 font-semibold">Adjust depot stock registers.</p>
                    </div>
                    {!isCitizen && (
                      <Button
                        onClick={() => setStockModalOpen(true)}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs font-bold cursor-pointer"
                      >
                        Adjust Stock
                      </Button>
                    )}
                  </div>

                  <div className="border border-[#CBD5E1] rounded-md overflow-hidden bg-white">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 border-b border-[#CBD5E1]">
                          <TableHead className="font-bold text-xs text-[#475569]">Resource</TableHead>
                          <TableHead className="font-bold text-xs text-[#475569]">Category</TableHead>
                          <TableHead className="font-bold text-xs text-[#475569]">Total Stock</TableHead>
                          <TableHead className="font-bold text-xs text-[#475569]">Allocated</TableHead>
                          <TableHead className="font-bold text-xs text-[#475569]">Available</TableHead>
                          <TableHead className="font-bold text-xs text-[#475569]">Depot Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventory.map((item) => {
                          const isLowStock = item.availableStock < item.totalStock * 0.15;
                          return (
                            <tr key={item.id} className="hover:bg-slate-50 transition-colors border-b border-[#E2E8F0]">
                              <td className="p-3 font-bold text-[#0F172A]">{item.name}</td>
                              <td className="p-3 text-[#475569] text-xs font-semibold capitalize">{item.category}</td>
                              <td className="p-3 text-xs font-bold text-[#0F172A]">{item.totalStock.toLocaleString()} {item.unit}</td>
                              <td className="p-3 text-xs font-semibold text-[#475569]">{item.allocatedStock.toLocaleString()} {item.unit}</td>
                              <td className="p-3">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                                  isLowStock 
                                    ? "text-[#DC2626] bg-[#FEF2F2] border border-[#DC2626]/20 px-2 py-0.5 rounded-full" 
                                    : "text-[#16A34A] bg-[#F0FDF4] border border-[#16A34A]/20 px-2 py-0.5 rounded-full"
                                }`}>
                                  {isLowStock ? (
                                    <>
                                      <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626] animate-pulse" />
                                      ⚠ LOW STOCK: {item.availableStock.toLocaleString()} {item.unit}
                                    </>
                                  ) : (
                                    <>
                                      <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                                      {item.availableStock.toLocaleString()} {item.unit}
                                    </>
                                  )}
                                </span>
                              </td>
                              <td className="p-3 text-[#475569] text-xs font-bold">{item.depot}</td>
                            </tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* TAB 2: ACTIVE DISPATCHES */}
              {selectedTab === "allocations" && (
                <div className="space-y-4 p-4">
                  <div>
                    <h3 className="text-[#0F172A] text-sm font-bold">Active Dispatches</h3>
                    <p className="text-[#475569] text-xs mt-0.5 font-semibold">Track staged supplies allocated to active incident centers.</p>
                  </div>

                  {allocations.length === 0 ? (
                    <div className="text-[#475569] py-8 text-center text-xs font-semibold bg-slate-50 border border-dashed border-[#CBD5E1] rounded-md">
                      No active resource dispatches recorded.
                    </div>
                  ) : (
                    <div className="border border-[#CBD5E1] rounded-md overflow-hidden bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 border-b border-[#CBD5E1]">
                            <TableHead className="font-bold text-xs text-[#475569]">Item</TableHead>
                            <TableHead className="font-bold text-xs text-[#475569]">Quantity</TableHead>
                            <TableHead className="font-bold text-xs text-[#475569]">Incident Allocation</TableHead>
                            <TableHead className="font-bold text-xs text-[#475569]">Status</TableHead>
                            <TableHead className="font-bold text-xs text-[#475569]">Staged By</TableHead>
                            {!isCitizen && <th className="p-3 text-right font-bold text-xs text-[#475569]">Actions</th>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allocations.map((alloc) => (
                            <tr key={alloc.id} className="hover:bg-slate-50 transition-colors border-b border-[#E2E8F0]">
                              <td className="p-3 font-bold text-[#0F172A]">{alloc.resourceName}</td>
                              <td className="p-3 text-xs font-bold text-[#0F172A]">{alloc.quantity}</td>
                              <td className="p-3 text-[#475569] text-xs font-semibold capitalize">
                                {alloc.incidentType} (ID: {alloc.incidentId.substring(0, 6)})
                              </td>
                              <td className="p-3">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                  alloc.status === "delivered"
                                    ? "bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20"
                                    : alloc.status === "en-route"
                                      ? "bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]/20"
                                      : alloc.status === "returned"
                                        ? "bg-[#F8FAFC] text-[#475569] border-[#CBD5E1]"
                                        : "bg-[#FFFBEB] text-[#D97706] border-[#D97706]/20"
                                }`}>
                                  ● {alloc.status}
                                </span>
                              </td>
                              <td className="p-3 text-[#475569] text-[10.5px] font-semibold">{alloc.allocatedBy}</td>
                              {!isCitizen && (
                                <td className="p-3 text-right">
                                  <div className="inline-flex gap-1.5">
                                    {alloc.status === "staged" && (
                                      <Button
                                        size="xs"
                                        variant="default"
                                        onClick={() => handleUpdateAllocationStatus(alloc.id, "delivered")}
                                        className="h-7 text-xs px-2.5 font-bold cursor-pointer"
                                      >
                                        Deliver
                                      </Button>
                                    )}
                                    {alloc.status !== "returned" && (
                                      <Button
                                        size="xs"
                                        variant="outline"
                                        onClick={() => handleUpdateAllocationStatus(alloc.id, "returned")}
                                        className="h-7 text-xs px-2.5 font-bold text-[#475569] hover:text-[#DC2626] cursor-pointer"
                                      >
                                        Return
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: AUDIT LEDGER */}
              {selectedTab === "history" && (
                <div className="space-y-4 p-4">
                  <div>
                    <h3 className="text-[#0F172A] text-sm font-bold">Staging Audit Timeline</h3>
                    <p className="text-[#475569] text-xs mt-0.5 font-semibold">Chronological operations ledger of depot transactions.</p>
                  </div>

                  {historyLogs.length === 0 ? (
                    <div className="text-[#475569] py-8 text-center text-xs font-semibold bg-slate-50 border border-dashed border-[#CBD5E1] rounded-md">
                      No audit logs registered yet.
                    </div>
                  ) : (
                    <div className="border border-[#CBD5E1] rounded-md overflow-hidden bg-white">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 border-b border-[#CBD5E1]">
                            <TableHead className="font-bold text-xs text-[#475569]">Time</TableHead>
                            <TableHead className="font-bold text-xs text-[#475569]">Resource</TableHead>
                            <TableHead className="font-bold text-xs text-[#475569]">Action</TableHead>
                            <TableHead className="font-bold text-xs text-[#475569]">Quantity</TableHead>
                            <TableHead className="font-bold text-xs text-[#475569]">Note</TableHead>
                            <TableHead className="font-bold text-xs text-[#475569]">Operator</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historyLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors border-b border-[#E2E8F0]">
                              <td className="p-3 text-[#475569] text-[10.5px] font-semibold whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleString()}
                              </td>
                              <td className="p-3 font-bold text-[#0F172A]">{log.resourceName}</td>
                              <td className="p-3">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                                  log.action === "stock_add"
                                    ? "bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/20"
                                    : log.action === "allocate"
                                      ? "bg-[#FFFBEB] text-[#D97706] border-[#D97706]/20"
                                      : log.action === "stock_reduce"
                                        ? "bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/20"
                                        : "bg-[#F8FAFC] text-[#475569] border-[#CBD5E1]"
                                }`}>
                                  ● {log.action.replace("_", " ")}
                                </span>
                              </td>
                              <td className="p-3 text-xs font-bold text-[#0F172A]">{log.quantity}</td>
                              <td className="p-3 text-[#475569] max-w-[180px] truncate text-xs italic font-semibold">
                                {log.note}
                              </td>
                              <td className="p-3 text-[#475569] text-[10.5px] font-semibold">{log.performedBy}</td>
                            </tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Allocate Resource Modal */}
        {allocateOpen && (
          <AllocateResourceModal
            isOpen={allocateOpen}
            onClose={() => setAllocateOpen(false)}
            onSuccess={loadData}
            inventory={inventory}
            activeIncidents={activeIncidents}
          />
        )}

        {/* Stock Adjuster Modal */}
        {stockModalOpen && (
          <Modal
            isOpen={stockModalOpen}
            onClose={() => setStockModalOpen(false)}
            title="Adjust Depot Stock Levels"
            description="Add or reduce inventory stock levels in staging depots."
          >
            <form onSubmit={handleAdjustStock} className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                  Resource Item
                </label>
                <select
                  value={adjustResourceId}
                  onChange={(e) => setAdjustResourceId(e.target.value)}
                  className="border border-border bg-background text-foreground focus:border-primary w-full rounded-md px-3 py-2 text-xs outline-none"
                  required
                >
                  <option value="">Select Resource...</option>
                  {inventory.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.name} (Stock: {res.availableStock} {res.unit} / Depot: {res.depot})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                  Adjustment Mode
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={isAddMode ? "default" : "outline"}
                    className="h-9 flex-1 cursor-pointer text-xs font-semibold"
                    onClick={() => setIsAddMode(true)}
                  >
                    Add Stock
                  </Button>
                  <Button
                    type="button"
                    variant={!isAddMode ? "default" : "outline"}
                    className="h-9 flex-1 cursor-pointer text-xs font-semibold"
                    onClick={() => setIsAddMode(false)}
                  >
                    Reduce Stock
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                  Quantity
                </label>
                <input
                  type="number"
                  value={adjustQuantity || ""}
                  onChange={(e) => setAdjustQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="E.g. 500"
                  className="border border-border bg-background text-foreground focus:border-primary w-full rounded-md p-2 text-xs outline-none"
                  min={1}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                  Staging Depot
                </label>
                <select
                  value={adjustDepot}
                  onChange={(e) => setAdjustDepot(e.target.value)}
                  className="border border-border bg-background text-foreground focus:border-primary w-full rounded-md px-3 py-2 text-xs outline-none"
                  required
                >
                  <option value="Depot Alpha">Depot Alpha - Eastern Sector</option>
                  <option value="Depot Beta">Depot Beta - Western Sector</option>
                </select>
              </div>

              <div className="border-t border-border flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStockModalOpen(false)}
                  className="h-8 text-xs px-3 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="default" 
                  size="sm" 
                  className="h-8 text-xs px-3 cursor-pointer"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Register Category Modal */}
        {newResourceOpen && (
          <Modal
            isOpen={newResourceOpen}
            onClose={() => setNewResourceOpen(false)}
            title="Register Resource Category"
            description="Add a new class of inventory stock to the command telemetry grid."
          >
            <form onSubmit={handleCreateResource} className="space-y-4 py-2">
              <div className="space-y-1">
                <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                  Resource Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="E.g. Tented Shelters, Chemical Neutralizers"
                  className="border border-border bg-background text-foreground focus:border-primary w-full rounded-md p-2.5 text-xs outline-none"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    Category Type
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as "supplies" | "vehicles" | "personnel")}
                    className="border border-border bg-background text-foreground focus:border-primary w-full rounded-md px-3 py-2 text-xs outline-none"
                    required
                  >
                    <option value="supplies">Supplies (Food, water, kits)</option>
                    <option value="vehicles">Vehicles (Trucks, boats)</option>
                    <option value="personnel">Personnel (Medical, search units)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    Unit Measurement
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="E.g. crates, liters, units, teams"
                    className="border border-border bg-background text-foreground focus:border-primary w-full rounded-md p-2.5 text-xs outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    value={newTotalStock || ""}
                    onChange={(e) => setNewTotalStock(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="E.g. 100"
                    className="border border-border bg-background text-foreground focus:border-primary w-full rounded-md p-2.5 text-xs outline-none"
                    min={1}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground block text-xs font-semibold uppercase tracking-wider">
                    Staging Depot
                  </label>
                  <select
                    value={newDepot}
                    onChange={(e) => setNewDepot(e.target.value)}
                    className="border border-border bg-background text-foreground focus:border-primary w-full rounded-md px-3 py-2 text-xs outline-none"
                    required
                  >
                    <option value="Depot Alpha">Depot Alpha - Eastern</option>
                    <option value="Depot Beta">Depot Beta - Western</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-border flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewResourceOpen(false)}
                  className="h-8 text-xs px-3 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  className="h-8 text-xs px-3 cursor-pointer"
                >
                  Register Category
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
