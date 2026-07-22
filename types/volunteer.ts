export type VolunteerStatus = "on-duty" | "off-duty" | "assigned";
export type AssignmentStatus = "assigned" | "active" | "completed" | "released";

export interface VolunteerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[]; // e.g. Medical, Search & Rescue, Logistics, Debris Removal, Water Safety
  status: VolunteerStatus;
  latitude: number;
  longitude: number;
  locationName: string;
  availabilityHours: string; // e.g. Weekends, 24/7, Evenings, Weekdays
  updatedAt: string;
}

export interface VolunteerAssignment {
  id: string;
  volunteerId: string;
  volunteerName: string;
  incidentId: string;
  incidentType: string;
  incidentLocation: string;
  role: string; // e.g. First Aider, Shelter Assistant, Evacuation Guide
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}
