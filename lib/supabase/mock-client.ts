import { UserRole, UserSession } from "@/types/auth";

// Predefined mock users for local development
export const MOCK_USERS = {
  "citizen@resqnet.ai": {
    id: "mock-citizen-id-123",
    email: "citizen@resqnet.ai",
    role: "citizen" as UserRole,
    fullName: "Jane Doe",
  },
  "volunteer@resqnet.ai": {
    id: "mock-volunteer-id-456",
    email: "volunteer@resqnet.ai",
    role: "volunteer" as UserRole,
    fullName: "John Smith",
  },
  "authority@resqnet.ai": {
    id: "mock-authority-id-789",
    email: "authority@resqnet.ai",
    role: "authority" as UserRole,
    fullName: "Commander Alert",
  },
};

const COOKIE_NAME = "resqnet-auth-session";

// Helper utilities for managing session cookie in browser
function setSessionCookie(session: UserSession | null) {
  if (typeof window === "undefined") return;

  if (session) {
    const expires = new Date(session.expiresAt).toUTCString();
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(session))}; path=/; expires=${expires}; SameSite=Lax`;
  } else {
    document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}

function getSessionCookie(): UserSession | null {
  if (typeof window === "undefined") return null;

  const match = document.cookie.match(
    new RegExp("(^| )" + COOKIE_NAME + "=([^;]*)")
  );
  if (match && match[2]) {
    try {
      return JSON.parse(decodeURIComponent(match[2])) as UserSession;
    } catch {
      return null;
    }
  }
  return null;
}

type AuthListener = (event: string, session: UserSession | null) => void;

class MockAuthClient {
  private listeners: Set<AuthListener> = new Set();
  private currentSession: UserSession | null = getSessionCookie();

  async signInWithPassword({
    email,
    password,
  }: {
    email: string;
    password?: string;
  }) {
    // Simulate minor network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const userEntry = Object.values(MOCK_USERS).find(
      (u) => u.email === email.toLowerCase()
    );

    if (!userEntry || password !== "password") {
      throw new Error(
        "Invalid login credentials. Use citizen@resqnet.ai, volunteer@resqnet.ai, or authority@resqnet.ai with 'password'."
      );
    }

    const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours expiry
    const newSession: UserSession = {
      accessToken: `mock-jwt-token-for-${userEntry.role}`,
      user: userEntry,
      expiresAt,
    };

    this.currentSession = newSession;
    setSessionCookie(newSession);
    this.notify("SIGNED_IN", newSession);

    return { data: { session: newSession, user: userEntry }, error: null };
  }

  async signOut() {
    await new Promise((resolve) => setTimeout(resolve, 300));

    this.currentSession = null;
    setSessionCookie(null);
    this.notify("SIGNED_OUT", null);

    return { error: null };
  }

  async getSession() {
    // Return cached session
    return { data: { session: this.currentSession }, error: null };
  }

  async getUser() {
    return { data: { user: this.currentSession?.user || null }, error: null };
  }

  onAuthStateChange(callback: AuthListener) {
    this.listeners.add(callback);
    // Instantly notify listener of current state on subscribe
    callback("INITIAL_SESSION", this.currentSession);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners.delete(callback);
          },
        },
      },
    };
  }

  private notify(event: string, session: UserSession | null) {
    this.listeners.forEach((listener) => {
      try {
        listener(event, session);
      } catch (err) {
        console.error("Error in auth listener:", err);
      }
    });
  }
}

// LocalStorage Persisted SQL Builder Simulation
class MockQueryBuilder {
  private tableName: string;
  private filterField: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private filterValue: any = null;
  private isSingle = false;
  private sortField: string | null = null;
  private sortAscending = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getData(): any[] {
    if (typeof window === "undefined") return [];

    if (this.tableName === "incidents") {
      const dataStr = localStorage.getItem("resqnet-incidents");
      if (!dataStr) {
        const defaultIncidents = [
          {
            id: "inc-1",
            type: "flooding",
            location: "River Basin, Sector A",
            latitude: 40.7128,
            longitude: -74.006,
            severity: "critical",
            peopleAffected: 450,
            description:
              "Sluice gate failure causing massive flooding in residential sectors. Sandbag barriers are leaking.",
            imageUrl: "",
            medicalEmergency: true,
            waterNeeded: true,
            foodNeeded: true,
            shelterNeeded: true,
            status: "active",
            reportedBy: "citizen@resqnet.ai",
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            statusHistory: [
              {
                status: "reported",
                updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
                updatedBy: "Jane Doe",
              },
              {
                status: "investigating",
                updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
                updatedBy: "John Smith",
                note: "Dispatching team for evaluation.",
              },
              {
                status: "active",
                updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
                updatedBy: "Commander Alert",
                note: "Barriers failed. Deploying emergency units.",
              },
            ],
            aiAnalysis: {
              priority: "critical",
              reason:
                "Breach of river basin sluice gate threatens immediate residential drowning risks and evacuations. 450 people are currently impacted.",
              requiredResources: [
                "Amphibious Search & Rescue Units",
                "Sandbag Deployment Staging Vehicles",
                "Freshwater Supply Tankers",
              ],
              estimatedResponseTime: "20-30 minutes",
              potentialRisks: [
                "Submerged grid electrocution",
                "Sewer line contamination",
                "Mudslides",
              ],
              summary:
                "Critical flood breach in Sector A. Commenced evacuation dispatches and staging barrier logistics.",
              approved: true,
            },
          },
          {
            id: "inc-2",
            type: "fire",
            location: "Warehouse District, Sector C",
            latitude: 40.7589,
            longitude: -73.9851,
            severity: "high",
            peopleAffected: 50,
            description:
              "Chemical warehouse structural fire. Plume of smoke visible. Evacuation routes being set.",
            imageUrl: "",
            medicalEmergency: true,
            waterNeeded: false,
            foodNeeded: false,
            shelterNeeded: false,
            status: "investigating",
            reportedBy: "volunteer@resqnet.ai",
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            statusHistory: [
              {
                status: "reported",
                updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
                updatedBy: "John Smith",
              },
              {
                status: "investigating",
                updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
                updatedBy: "John Smith",
                note: "En route to warehouse district.",
              },
            ],
            aiAnalysis: {
              priority: "high",
              reason:
                "Chemical components present dynamic containment risks and smoke toxicity threats near neighboring commercial zones.",
              requiredResources: [
                "HQ Pumper Fire Engines",
                "Smoke Inhalation Oxygen Kits",
                "Police Blockade Units",
              ],
              estimatedResponseTime: "15-20 minutes",
              potentialRisks: [
                "Toxicity expansion",
                "Chemical container explosions",
              ],
              summary:
                "High hazard chemical fire at Sector C warehouse. First responders en route.",
              approved: false,
            },
          },
          {
            id: "inc-3",
            type: "medical",
            location: "Downtown Subway, Sector B",
            latitude: 40.7306,
            longitude: -73.9352,
            severity: "medium",
            peopleAffected: 12,
            description:
              "Heat exhaustion and structural congestion in subway tunnels during grid failure. Need water and medical triage.",
            imageUrl: "",
            medicalEmergency: true,
            waterNeeded: true,
            foodNeeded: false,
            shelterNeeded: false,
            status: "reported",
            reportedBy: "citizen@resqnet.ai",
            createdAt: new Date(Date.now() - 600000).toISOString(),
            updatedAt: new Date(Date.now() - 600000).toISOString(),
            statusHistory: [
              {
                status: "reported",
                updatedAt: new Date(Date.now() - 600000).toISOString(),
                updatedBy: "Jane Doe",
              },
            ],
            aiAnalysis: {
              priority: "medium",
              reason:
                "Subway heat levels during grid shutdown pose dehydration and collapse hazards for stranded commuters.",
              requiredResources: [
                "ALS Paramedic Ambulances",
                "Drinking Water Supply crates",
              ],
              estimatedResponseTime: "10-15 minutes",
              potentialRisks: ["Commuter panic", "Dehydration scaling"],
              summary:
                "Commuter distress logged in Sector B subway tunnels. Water dispatches initiated.",
              approved: false,
            },
          },
        ];
        localStorage.setItem(
          "resqnet-incidents",
          JSON.stringify(defaultIncidents)
        );
        return defaultIncidents;
      }
      return JSON.parse(dataStr);
    }

    if (this.tableName === "resources") {
      const dataStr = localStorage.getItem("resqnet-resources");
      if (!dataStr) {
        const defaultResources = [
          {
            id: "res-1",
            name: "Food",
            category: "supplies",
            totalStock: 5000,
            allocatedStock: 500,
            availableStock: 4500,
            unit: "rations (crates)",
            depot: "Depot Alpha",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "res-2",
            name: "Water",
            category: "supplies",
            totalStock: 10000,
            allocatedStock: 1500,
            availableStock: 8500,
            unit: "liters",
            depot: "Depot Alpha",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "res-3",
            name: "Medicine",
            category: "supplies",
            totalStock: 200,
            allocatedStock: 0,
            availableStock: 200,
            unit: "triage kits",
            depot: "Depot Beta",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "res-4",
            name: "Fuel",
            category: "supplies",
            totalStock: 1500,
            allocatedStock: 0,
            availableStock: 1500,
            unit: "liters",
            depot: "Depot Alpha",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "res-5",
            name: "Blankets",
            category: "supplies",
            totalStock: 800,
            allocatedStock: 0,
            availableStock: 800,
            unit: "units",
            depot: "Depot Beta",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "res-6",
            name: "Boats",
            category: "vehicles",
            totalStock: 20,
            allocatedStock: 3,
            availableStock: 17,
            unit: "rescue boats",
            depot: "Depot Alpha",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "res-7",
            name: "Vehicles",
            category: "vehicles",
            totalStock: 30,
            allocatedStock: 0,
            availableStock: 30,
            unit: "pickup trucks",
            depot: "Depot Alpha",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "res-8",
            name: "Medical Teams",
            category: "personnel",
            totalStock: 15,
            allocatedStock: 0,
            availableStock: 15,
            unit: "triage teams",
            depot: "Depot Beta",
            updatedAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(
          "resqnet-resources",
          JSON.stringify(defaultResources)
        );
        return defaultResources;
      }
      return JSON.parse(dataStr);
    }

    if (this.tableName === "resource_allocations") {
      const dataStr = localStorage.getItem("resqnet-resource-allocations");
      if (!dataStr) {
        const defaultAllocations = [
          {
            id: "alloc-1",
            resourceId: "res-1",
            resourceName: "Food",
            incidentId: "inc-1",
            incidentType: "flooding",
            quantity: 500,
            status: "delivered",
            allocatedBy: "authority@resqnet.ai",
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          },
          {
            id: "alloc-2",
            resourceId: "res-2",
            resourceName: "Water",
            incidentId: "inc-1",
            incidentType: "flooding",
            quantity: 1500,
            status: "delivered",
            allocatedBy: "authority@resqnet.ai",
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          },
          {
            id: "alloc-3",
            resourceId: "res-6",
            resourceName: "Boats",
            incidentId: "inc-1",
            incidentType: "flooding",
            quantity: 3,
            status: "en-route",
            allocatedBy: "authority@resqnet.ai",
            createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
          },
        ];
        localStorage.setItem(
          "resqnet-resource-allocations",
          JSON.stringify(defaultAllocations)
        );
        return defaultAllocations;
      }
      return JSON.parse(dataStr);
    }

    if (this.tableName === "resource_history") {
      const dataStr = localStorage.getItem("resqnet-resource-history");
      if (!dataStr) {
        const defaultHistory = [
          {
            id: "hist-1",
            resourceId: "res-1",
            resourceName: "Food",
            action: "allocate",
            quantity: 500,
            performedBy: "authority@resqnet.ai",
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
            note: "Dispatched to Sector A Flooding",
          },
          {
            id: "hist-2",
            resourceId: "res-2",
            resourceName: "Water",
            action: "allocate",
            quantity: 1500,
            performedBy: "authority@resqnet.ai",
            createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
            note: "Dispatched to Sector A Flooding",
          },
          {
            id: "hist-3",
            resourceId: "res-6",
            resourceName: "Boats",
            action: "allocate",
            quantity: 3,
            performedBy: "authority@resqnet.ai",
            createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
            note: "Dispatched to Sector A Flooding",
          },
        ];
        localStorage.setItem(
          "resqnet-resource-history",
          JSON.stringify(defaultHistory)
        );
        return defaultHistory;
      }
      return JSON.parse(dataStr);
    }

    if (this.tableName === "volunteers") {
      const dataStr = localStorage.getItem("resqnet-volunteers");
      if (!dataStr) {
        const defaultVolunteers = [
          {
            id: "vol-1",
            name: "John Smith",
            email: "volunteer@resqnet.ai",
            phone: "+1-555-0199",
            skills: ["Medical", "Logistics", "First Aid"],
            status: "on-duty",
            latitude: 40.7306,
            longitude: -73.9352,
            locationName: "Downtown, Sector B",
            availabilityHours: "Weekends",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "vol-2",
            name: "Jane Miller",
            email: "jane.miller@resqnet.ai",
            phone: "+1-555-0188",
            skills: ["Water Rescue", "Swimmer", "Logistics"],
            status: "on-duty",
            latitude: 40.7128,
            longitude: -74.006,
            locationName: "River Basin, Sector A",
            availabilityHours: "24/7",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "vol-3",
            name: "Dave Carter",
            email: "dave.carter@resqnet.ai",
            phone: "+1-555-0177",
            skills: ["Debris Removal", "Heavy Equipment"],
            status: "off-duty",
            latitude: 40.7589,
            longitude: -73.9851,
            locationName: "Warehouse District, Sector C",
            availabilityHours: "Weekdays",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "vol-4",
            name: "Sarah Jenkins",
            email: "sarah.jenkins@resqnet.ai",
            phone: "+1-555-0166",
            skills: ["Triage", "First Aid", "Psychology"],
            status: "on-duty",
            latitude: 40.725,
            longitude: -73.95,
            locationName: "Subway Station, Sector B",
            availabilityHours: "Evenings",
            updatedAt: new Date().toISOString(),
          },
          {
            id: "vol-5",
            name: "Michael Chang",
            email: "michael.chang@resqnet.ai",
            phone: "+1-555-0155",
            skills: ["First Aid", "Radio Operator", "Logistics"],
            status: "assigned",
            latitude: 40.718,
            longitude: -74.01,
            locationName: "Waterfront Park, Sector A",
            availabilityHours: "24/7",
            updatedAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(
          "resqnet-volunteers",
          JSON.stringify(defaultVolunteers)
        );
        return defaultVolunteers;
      }
      return JSON.parse(dataStr);
    }

    if (this.tableName === "volunteer_assignments") {
      const dataStr = localStorage.getItem("resqnet-volunteer-assignments");
      if (!dataStr) {
        const defaultAssignments = [
          {
            id: "val-1",
            volunteerId: "vol-5",
            volunteerName: "Michael Chang",
            incidentId: "inc-1",
            incidentType: "flooding",
            incidentLocation: "River Basin, Sector A",
            role: "Evacuation Guide",
            status: "active",
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          },
        ];
        localStorage.setItem(
          "resqnet-volunteer-assignments",
          JSON.stringify(defaultAssignments)
        );
        return defaultAssignments;
      }
      return JSON.parse(dataStr);
    }

    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private saveData(data: any[]) {
    if (typeof window === "undefined") return;
    if (this.tableName === "incidents") {
      localStorage.setItem("resqnet-incidents", JSON.stringify(data));
    } else if (this.tableName === "resources") {
      localStorage.setItem("resqnet-resources", JSON.stringify(data));
    } else if (this.tableName === "resource_allocations") {
      localStorage.setItem(
        "resqnet-resource-allocations",
        JSON.stringify(data)
      );
    } else if (this.tableName === "resource_history") {
      localStorage.setItem("resqnet-resource-history", JSON.stringify(data));
    } else if (this.tableName === "volunteers") {
      localStorage.setItem("resqnet-volunteers", JSON.stringify(data));
    } else if (this.tableName === "volunteer_assignments") {
      localStorage.setItem(
        "resqnet-volunteer-assignments",
        JSON.stringify(data)
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  select(fields?: string) {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eq(field: string, value: any) {
    this.filterField = field;
    this.filterValue = value;
    return this;
  }

  order(field: string, { ascending = false } = {}) {
    this.sortField = field;
    this.sortAscending = ascending;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  // Support await and promises
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    let list = this.getData();

    if (this.filterField && this.filterValue !== null) {
      list = list.filter(
        (item) => item[this.filterField!] === this.filterValue
      );
    }

    if (this.sortField) {
      list.sort((a, b) => {
        const valA = a[this.sortField!];
        const valB = b[this.sortField!];
        if (valA < valB) return this.sortAscending ? -1 : 1;
        if (valA > valB) return this.sortAscending ? 1 : -1;
        return 0;
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = list;
    if (this.isSingle) {
      result = list.length > 0 ? list[0] : null;
    }

    return Promise.resolve({ data: result, error: null }).then(
      onfulfilled,
      onrejected
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async insert(item: any | any[]) {
    const list = this.getData();
    const itemsToInsert = Array.isArray(item) ? item : [item];

    itemsToInsert.forEach((itm) => {
      if (!itm.id) {
        const prefix =
          this.tableName === "resources"
            ? "res-"
            : this.tableName === "resource_allocations"
              ? "alloc-"
              : "hist-";
        itm.id = prefix + Math.random().toString(36).substring(2, 11);
      }
      if (!itm.createdAt) {
        itm.createdAt = new Date().toISOString();
      }
      if (!itm.updatedAt) {
        itm.updatedAt = new Date().toISOString();
      }
    });

    const newList = [...list, ...itemsToInsert];
    this.saveData(newList);
    return {
      data: Array.isArray(item) ? itemsToInsert : itemsToInsert[0],
      error: null,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async update(updates: any) {
    let list = this.getData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedItems: any[] = [];

    list = list.map((item) => {
      if (this.filterField && item[this.filterField] === this.filterValue) {
        const updated = {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        if (
          this.tableName === "incidents" &&
          updates.status &&
          updates.status !== item.status
        ) {
          const history = updated.statusHistory || [];
          updated.statusHistory = [
            ...history,
            {
              status: updates.status,
              updatedAt: updated.updatedAt,
              updatedBy: updates.updatedBy || "System Operator",
              note: updates.statusNote || "",
            },
          ];
        }

        updatedItems.push(updated);
        return updated;
      }
      return item;
    });

    this.saveData(list);
    return {
      data: this.isSingle ? updatedItems[0] || null : updatedItems,
      error: null,
    };
  }

  async delete() {
    const list = this.getData();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deletedItems: any[] = [];

    const newList = list.filter((item) => {
      if (this.filterField && item[this.filterField] === this.filterValue) {
        deletedItems.push(item);
        return false;
      }
      return true;
    });

    this.saveData(newList);
    return {
      data: this.isSingle ? deletedItems[0] || null : deletedItems,
      error: null,
    };
  }
}

export const mockSupabaseClient = {
  auth: new MockAuthClient(),
  from(tableName: string) {
    return new MockQueryBuilder(tableName);
  },
};

export default mockSupabaseClient;
