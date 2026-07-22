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
  const [isAddMode, setIsAddMode] = useState(true); // true = Add stock, false = Reduce/Reduce Stock

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
    // Delay state changes to run in a separate tick to avoid synchronous React 19 cascading renders
    await new Promise((resolve) => setTimeout(resolve, 0));
    try {
      // 1. Fetch Inventory Items
      const resData = await supabase
        .from("resources")
        .select("*")
        .order("name", { ascending: true });
      if (resData.data) setInventory(resData.data as ResourceItem[]);

      // 2. Fetch Allocations
      const allocData = await supabase
        .from("resource_allocations")
        .select("*")
        .order("createdAt", { ascending: false });
      if (allocData.data)
        setAllocations(allocData.data as ResourceAllocation[]);

      // 3. Fetch History Logs
      const histData = await supabase
        .from("resource_history")
        .select("*")
        .order("createdAt", { ascending: false });
      if (histData.data) setHistoryLogs(histData.data as ResourceHistoryLog[]);

      // 4. Fetch Active Incidents
      const incData = await supabase
        .from("incidents")
        .select("*")
        .eq("status", "active");
      if (incData.data) {
        setActiveIncidents(incData.data as Incident[]);
      } else {
        // Fallback: Fetch all reported incidents if none are active
        const incAllData = await supabase.from("incidents").select("*");
        if (incAllData.data) {
          setActiveIncidents(
            incAllData.data.filter((i: Incident) => i.status !== "resolved") as Incident[]
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  // Compute operational statistics
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

  // Handle CRUD update for stock levels (Adjust Stock Modal)
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
          toast.error("Invalid Reduction", {
            description:
              "Cannot reduce stock below active allocated quantities.",
          });
          return;
        }
        nextTotal -= adjustQuantity;
        nextAvail -= adjustQuantity;
      }

      // Update Resource stock levels
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

      // Log Stock transaction history
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

      toast.success("Stock Adjusted Successfully");
      setStockModalOpen(false);
      setAdjustQuantity(0);
      setAdjustResourceId("");
      loadData();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Database write error.";
      toast.error("Operation Failed", { description: errorMsg });
    }
  };

  // Handle CRUD create for new inventory items
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

      // Log history
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

      toast.success("New Resource Item Added");
      setNewResourceOpen(false);
      setNewName("");
      setNewTotalStock(100);
      setNewUnit("units");
      setNewDepot("Depot Alpha");
      loadData();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Database save failure.";
      toast.error("Operation Failed", { description: errorMsg });
    }
  };

  // Handle CRUD update for dispatches (Delivered / Return)
  const handleUpdateAllocationStatus = async (
    allocId: string,
    nextStatus: "delivered" | "returned"
  ) => {
    if (!user) return;
    const allocation = allocations.find((a) => a.id === allocId);
    if (!allocation) return;

    try {
      // Update Allocation Status
      const allocResult = await supabase
        .from("resource_allocations")
        .update({ status: nextStatus })
        .eq("id", allocation.id)
        .single();
      if (allocResult.error) throw new Error(allocResult.error.message);

      // If returned, restore stock levels
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

      // Log transaction history
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

      toast.success(`Dispatch marked as ${nextStatus.toUpperCase()}`);
      loadData();
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed updating dispatch status.";
      toast.error("Operation Failed", { description: errorMsg });
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
              <BreadcrumbPage>Resources Center</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title Block */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-foreground text-2xl font-bold tracking-tight">
              Resource Operations Center
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Command depot stock management, active incident staging, and
              Gemini AI dispatch recommendation logic.
            </p>
          </div>
          {!isCitizen && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setAllocateOpen(true)}
                variant="default"
                size="sm"
                className="gap-2"
              >
                <Truck className="size-4" />
                <span>Allocate Resources</span>
              </Button>
              <Button
                onClick={() => setNewResourceOpen(true)}
                variant="outline"
                size="sm"
                className="border-border/80 gap-2"
              >
                <Plus className="size-4" />
                <span>Register Category</span>
              </Button>
            </div>
          )}
        </div>

        {/* Statistics Panels */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Depot Operations
              </CardTitle>
              <Database className="text-primary size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueDepots} Depots</div>
              <p className="text-muted-foreground mt-1 text-[10px]">
                Staging warehouses synced
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Total Inventory Categories
              </CardTitle>
              <Package className="text-accent size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventory.length} Classes
              </div>
              <p className="text-muted-foreground mt-1 text-[10px]">
                Supplies, vehicles, and teams
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Dispatched Telemetry
              </CardTitle>
              <Activity className="text-warning size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dispatchPercent}%</div>
              <p className="text-muted-foreground mt-1 text-[10px]">
                {totalAllocatedItems.toLocaleString()} /{" "}
                {totalStockItems.toLocaleString()} units active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Active Staging Dispatches
              </CardTitle>
              <Truck className="text-destructive size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allocations.filter((a) => a.status !== "returned").length}{" "}
                Staged
              </div>
              <p className="text-muted-foreground mt-1 text-[10px]">
                Staged or en-route to sectors
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Radial Dispatch Gauge */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold tracking-wider uppercase">
                Dispatch Cap Gauge
              </CardTitle>
              <CardDescription>
                Total percentage of inventory allocated to active disaster
                sectors.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative flex h-48 flex-col items-center justify-center">
              {/* Custom SVG Radial Gauge */}
              <svg viewBox="0 0 120 120" className="text-primary size-36">
                {/* Background track circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.08"
                  strokeWidth="8"
                />
                {/* Stroked value arc */}
                <circle
                  cx="60"
                  cy="60"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * dispatchPercent) / 100}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  className="text-primary transition-all duration-500"
                />
                {/* Centered text */}
                <text
                  x="60"
                  y="66"
                  textAnchor="middle"
                  fill="currentColor"
                  className="text-foreground font-mono text-base font-extrabold"
                >
                  {dispatchPercent}%
                </text>
              </svg>
              <span className="text-muted-foreground mt-2 text-[10px] font-bold tracking-wider uppercase">
                Allocated Stock Load
              </span>
            </CardContent>
          </Card>

          {/* Available vs Allocated comparative Stock Bar Chart */}
          <Card className="border-border bg-card md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-1.5 text-sm font-bold tracking-wider uppercase">
                <TrendingUp className="text-accent size-4" />
                <span>Depot Capacity & Allocation Status</span>
              </CardTitle>
              <CardDescription>
                Visual comparison of available stock (Blue) vs allocated stock
                (Orange) per category.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex h-48 items-center justify-center pt-2">
              {loading ? (
                <div className="bg-muted h-10 w-1/4 animate-pulse rounded" />
              ) : inventory.length === 0 ? (
                <div className="text-muted-foreground text-xs">
                  No inventory categories registered.
                </div>
              ) : (
                <svg
                  viewBox="0 0 500 150"
                  className="text-foreground h-full w-full"
                  fill="none"
                >
                  {/* Grid Lines */}
                  <line
                    x1="40"
                    y1="15"
                    x2="480"
                    y2="15"
                    stroke="currentColor"
                    strokeOpacity="0.05"
                  />
                  <line
                    x1="40"
                    y1="60"
                    x2="480"
                    y2="60"
                    stroke="currentColor"
                    strokeOpacity="0.05"
                  />
                  <line
                    x1="40"
                    y1="110"
                    x2="480"
                    y2="110"
                    stroke="currentColor"
                    strokeOpacity="0.1"
                  />

                  {/* Draw comparative bars for first 6 items */}
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
                          rx="2"
                          fill="var(--primary)"
                          fillOpacity="0.85"
                        />
                        {/* Allocated Stock (Orange Bar) */}
                        <rect
                          x={xPos + 14}
                          y={yAlloc}
                          width="12"
                          height={allocHeight}
                          rx="2"
                          fill="var(--warning)"
                          fillOpacity="0.85"
                        />
                        {/* Label name */}
                        <text
                          x={xPos + 13}
                          y="130"
                          fill="currentColor"
                          fillOpacity="0.4"
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

        {/* Modular Tabs Area */}
        <div className="space-y-4">
          {/* Tab Buttons */}
          <div className="border-border flex gap-2 border-b">
            {[
              {
                id: "inventory",
                label: "Depot Stock Inventory",
                icon: Package,
              },
              {
                id: "allocations",
                label: "Active Staging Dispatches",
                icon: Truck,
              },
              { id: "history", label: "Staging Audit Logs", icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setSelectedTab(
                    tab.id as "inventory" | "allocations" | "history"
                  )
                }
                className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all ${
                  selectedTab === tab.id
                    ? "border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground border-transparent"
                }`}
              >
                <tab.icon className="size-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Loading view */}
          {loading ? (
            <div className="space-y-2 py-4">
              <div className="bg-muted h-6 w-full animate-pulse rounded" />
              <div className="bg-muted h-6 w-full animate-pulse rounded" />
            </div>
          ) : (
            <div className="bg-card border-border overflow-hidden rounded-lg border">
              {/* ================= TAB 1: STOCK INVENTORY ================= */}
              {selectedTab === "inventory" && (
                <div className="space-y-4 p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-foreground text-sm font-bold">
                        Depot Stock Levels
                      </h3>
                      <p className="text-muted-foreground text-xs">
                        Adjust quantities or register new classes.
                      </p>
                    </div>
                    {!isCitizen && (
                      <Button
                        onClick={() => setStockModalOpen(true)}
                        variant="accent"
                        size="xs"
                        className="gap-1.5"
                      >
                        <Plus className="size-3.5" />
                        <span>Adjust Stock</span>
                      </Button>
                    )}
                  </div>

                  <div className="border-border rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Resource Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Total Stock</TableHead>
                          <TableHead>Allocated Stock</TableHead>
                          <TableHead>Available Stock</TableHead>
                          <TableHead>Depot Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-foreground font-semibold">
                              {item.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs capitalize">
                              {item.category}
                            </TableCell>
                            <TableCell className="text-xs font-medium">
                              {item.totalStock.toLocaleString()} {item.unit}
                            </TableCell>
                            <TableCell className="text-warning text-xs font-semibold">
                              {item.allocatedStock.toLocaleString()} {item.unit}
                            </TableCell>
                            <TableCell className="text-accent text-xs font-bold">
                              {item.availableStock.toLocaleString()} {item.unit}
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs font-semibold">
                              {item.depot}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: ACTIVE DISPATCHES ================= */}
              {selectedTab === "allocations" && (
                <div className="space-y-4 p-4">
                  <div className="space-y-0.5">
                    <h3 className="text-foreground text-sm font-bold">
                      Active Dispatch Allocations
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Track staged supply lines en-route to emergency zones.
                    </p>
                  </div>

                  {allocations.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center text-xs">
                      No active resource dispatches recorded.
                    </div>
                  ) : (
                    <div className="border-border rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Incident Allocation</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Staged By</TableHead>
                            {!isCitizen && (
                              <TableHead className="text-right">
                                Action
                              </TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allocations.map((alloc) => (
                            <TableRow key={alloc.id}>
                              <TableCell className="text-foreground font-semibold">
                                {alloc.resourceName}
                              </TableCell>
                              <TableCell className="text-xs font-medium">
                                {alloc.quantity}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs capitalize">
                                {alloc.incidentType} (ID:{" "}
                                {alloc.incidentId.substring(0, 6)})
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    alloc.status === "delivered"
                                      ? "success"
                                      : alloc.status === "en-route"
                                        ? "info"
                                        : alloc.status === "returned"
                                          ? "outline"
                                          : "warning"
                                  }
                                  className="h-4.5 px-1.5 py-0 text-[9px] font-bold uppercase"
                                >
                                  {alloc.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-[10px]">
                                {alloc.allocatedBy}
                              </TableCell>
                              {!isCitizen && (
                                <TableCell className="flex justify-end gap-1.5 text-right">
                                  {alloc.status === "staged" && (
                                    <Button
                                      size="xs"
                                      variant="default"
                                      onClick={() =>
                                        handleUpdateAllocationStatus(
                                          alloc.id,
                                          "delivered"
                                        )
                                      }
                                      className="cursor-pointer gap-1"
                                    >
                                      <Truck className="size-3" />
                                      <span>Deliver</span>
                                    </Button>
                                  )}
                                  {alloc.status !== "returned" && (
                                    <Button
                                      size="xs"
                                      variant="outline"
                                      onClick={() =>
                                        handleUpdateAllocationStatus(
                                          alloc.id,
                                          "returned"
                                        )
                                      }
                                      className="text-muted-foreground hover:text-destructive hover:border-destructive/30 cursor-pointer gap-1"
                                    >
                                      <RotateCcw className="size-3" />
                                      <span>Return</span>
                                    </Button>
                                  )}
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 3: AUDIT LEDGER ================= */}
              {selectedTab === "history" && (
                <div className="space-y-4 p-4">
                  <div className="space-y-0.5">
                    <h3 className="text-foreground text-sm font-bold">
                      Depot Transaction History
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      Timeline audit of resource allocations and inventory stock
                      adjustments.
                    </p>
                  </div>

                  {historyLogs.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center text-xs">
                      No audit history logged.
                    </div>
                  ) : (
                    <div className="border-border rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Resource</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Note</TableHead>
                            <TableHead>Operator</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {historyLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="text-muted-foreground text-[10px] whitespace-nowrap">
                                {new Date(log.createdAt).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-foreground font-semibold">
                                {log.resourceName}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    log.action === "stock_add"
                                      ? "success"
                                      : log.action === "allocate"
                                        ? "warning"
                                        : log.action === "stock_reduce"
                                          ? "destructive"
                                          : "outline"
                                  }
                                  className="h-4.5 px-1.5 py-0 text-[9px] font-bold uppercase"
                                >
                                  {log.action.replace("_", " ")}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs font-semibold">
                                {log.quantity}
                              </TableCell>
                              <TableCell className="text-muted-foreground max-w-[200px] truncate font-sans text-xs italic">
                                {log.note}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-[10px]">
                                {log.performedBy}
                              </TableCell>
                            </TableRow>
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

        {/* Stock Adjuster Modal (CRUD updates) */}
        {stockModalOpen && (
          <Modal
            isOpen={stockModalOpen}
            onClose={() => setStockModalOpen(false)}
            title="Adjust Depot Stock levels"
            description="Add or reduce total inventory stock parameters dynamically."
          >
            <form onSubmit={handleAdjustStock} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                  Select Item to Adjust
                </label>
                <select
                  value={adjustResourceId}
                  onChange={(e) => setAdjustResourceId(e.target.value)}
                  className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border px-3 py-2 text-xs outline-none"
                  required
                >
                  <option value="">Select Resource...</option>
                  {inventory.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.name} (Stock: {res.availableStock} {res.unit} /
                      Depot: {res.depot})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                  Adjustment Mode
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={isAddMode ? "default" : "outline"}
                    className="h-9 flex-1 cursor-pointer text-xs font-semibold"
                    onClick={() => setIsAddMode(true)}
                  >
                    Add Stock (crates, liters, etc.)
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

              <div className="space-y-1.5">
                <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                  Quantity
                </label>
                <input
                  type="number"
                  value={adjustQuantity || ""}
                  onChange={(e) =>
                    setAdjustQuantity(
                      Math.max(0, parseInt(e.target.value) || 0)
                    )
                  }
                  placeholder="E.g. 500"
                  className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border p-2 text-xs outline-none"
                  min={1}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                  Staging Depot
                </label>
                <select
                  value={adjustDepot}
                  onChange={(e) => setAdjustDepot(e.target.value)}
                  className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border px-3 py-2 text-xs outline-none"
                  required
                >
                  <option value="Depot Alpha">
                    Depot Alpha - Eastern Sector
                  </option>
                  <option value="Depot Beta">
                    Depot Beta - Western Sector
                  </option>
                </select>
              </div>

              <div className="border-border flex justify-end gap-2 border-t pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStockModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="accent" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Register Category Modal (CRUD creates) */}
        {newResourceOpen && (
          <Modal
            isOpen={newResourceOpen}
            onClose={() => setNewResourceOpen(false)}
            title="Register Resource Category"
            description="Add a new class of inventory stock to the command telemetry grid."
          >
            <form onSubmit={handleCreateResource} className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                  Resource Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="E.g. Tented Shelters, Chemical Neutralizers"
                  className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border p-2.5 text-xs outline-none"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                    Category Type
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(
                        e.target.value as "supplies" | "vehicles" | "personnel"
                      )
                    }
                    className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border px-3 py-2 text-xs outline-none"
                    required
                  >
                    <option value="supplies">
                      Supplies (Food, water, kits)
                    </option>
                    <option value="vehicles">Vehicles (Trucks, boats)</option>
                    <option value="personnel">
                      Personnel (Medical, search units)
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                    Unit Measurement
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="E.g. crates, liters, units, teams"
                    className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border p-2.5 text-xs outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    value={newTotalStock || ""}
                    onChange={(e) =>
                      setNewTotalStock(
                        Math.max(0, parseInt(e.target.value) || 0)
                      )
                    }
                    placeholder="E.g. 100"
                    className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border p-2.5 text-xs outline-none"
                    min={1}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-muted-foreground block text-xs font-semibold tracking-wider uppercase">
                    Staging Depot
                  </label>
                  <select
                    value={newDepot}
                    onChange={(e) => setNewDepot(e.target.value)}
                    className="border-border bg-background text-foreground focus:border-primary w-full rounded-lg border px-3 py-2 text-xs outline-none"
                    required
                  >
                    <option value="Depot Alpha">Depot Alpha - Eastern</option>
                    <option value="Depot Beta">Depot Beta - Western</option>
                  </select>
                </div>
              </div>

              <div className="border-border flex justify-end gap-2 border-t pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setNewResourceOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  className="gap-1.5"
                >
                  <Plus className="size-3.5" />
                  <span>Register Category</span>
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
