export type ResourceCategory = "supplies" | "vehicles" | "personnel";
export type AllocationStatus = "staged" | "en-route" | "delivered" | "returned";
export type HistoryAction =
  "stock_add" | "stock_reduce" | "allocate" | "deallocate";

export interface ResourceItem {
  id: string;
  name: string; // e.g. Food, Water, Medicine, Fuel, Blankets, Boats, Vehicles, Medical Teams
  category: ResourceCategory;
  totalStock: number;
  allocatedStock: number;
  availableStock: number;
  unit: string; // e.g. liters, crates, kits, units, teams
  depot: string; // e.g. Depot Alpha, Depot Beta
  updatedAt: string;
}

export interface ResourceAllocation {
  id: string;
  resourceId: string;
  resourceName: string;
  incidentId: string;
  incidentType: string;
  quantity: number;
  status: AllocationStatus;
  allocatedBy: string; // user email
  createdAt: string;
  updatedAt: string;
}

export interface ResourceHistoryLog {
  id: string;
  resourceId: string;
  resourceName: string;
  action: HistoryAction;
  quantity: number;
  performedBy: string; // user email
  createdAt: string;
  note?: string;
}
