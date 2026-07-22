export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus =
  "reported" | "investigating" | "active" | "resolved";

export interface StatusHistoryItem {
  status: IncidentStatus;
  updatedAt: string;
  updatedBy: string;
  note?: string;
}

export interface Incident {
  id: string;
  type: string; // e.g. "flooding" | "fire" | "earthquake" | "medical" | "storm" | "other"
  location: string;
  latitude: number;
  longitude: number;
  severity: IncidentSeverity;
  peopleAffected: number;
  description: string;
  imageUrl?: string; // base64 or external url
  medicalEmergency: boolean;
  waterNeeded: boolean;
  foodNeeded: boolean;
  shelterNeeded: boolean;
  status: IncidentStatus;
  reportedBy: string; // user email
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusHistoryItem[];
}
