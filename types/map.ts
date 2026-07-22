export interface ShelterItem {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  latitude: number;
  longitude: number;
  status: "open" | "full" | "closed";
}

export interface HospitalItem {
  id: string;
  name: string;
  capacity: number;
  currentOccupancy: number;
  latitude: number;
  longitude: number;
  status: "operating" | "surging" | "closed";
}
