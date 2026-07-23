const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse env file (checking .env.local first, then .env)
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');
let envContent = '';

if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8');
  console.log('Loading configuration from .env.local');
} else if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Loading configuration from .env');
} else {
  console.error('Error: Neither .env.local nor .env was found at project root.');
  process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const equalIdx = trimmed.indexOf('=');
  if (equalIdx === -1) return;
  const key = trimmed.slice(0, equalIdx).trim();
  let val = trimmed.slice(equalIdx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  env[key] = val;
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase URL and Anon Key must be defined in your environment file.');
  process.exit(1);
}

if (supabaseUrl.includes('your-project') || supabaseUrl.includes('your-supabase-project')) {
  console.error('Error: The Supabase credentials are still placeholder values. Please check your env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const incidents = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    type: "flooding",
    location: "River Basin, Sector A",
    latitude: 40.7128,
    longitude: -74.006,
    severity: "critical",
    peopleAffected: 450,
    description: "Sluice gate failure causing massive flooding in residential sectors. Sandbag barriers are leaking.",
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
      reason: "Breach of river basin sluice gate threatens immediate residential drowning risks and evacuations. 450 people are currently impacted.",
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
      summary: "Critical flood breach in Sector A. Commenced evacuation dispatches and staging barrier logistics.",
      approved: true,
    },
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    type: "fire",
    location: "Warehouse District, Sector C",
    latitude: 40.7589,
    longitude: -73.9851,
    severity: "high",
    peopleAffected: 50,
    description: "Chemical warehouse structural fire. Plume of smoke visible. Evacuation routes being set.",
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
      reason: "Chemical components present dynamic containment risks and smoke toxicity threats near neighboring commercial zones.",
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
      summary: "High hazard chemical fire at Sector C warehouse. First responders en route.",
      approved: false,
    },
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    type: "medical",
    location: "Downtown Subway, Sector B",
    latitude: 40.7306,
    longitude: -73.9352,
    severity: "medium",
    peopleAffected: 12,
    description: "Heat exhaustion and structural congestion in subway tunnels during grid failure. Need water and medical triage.",
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
      reason: "Subway heat levels during grid shutdown pose dehydration and collapse hazards for stranded commuters.",
      requiredResources: [
        "ALS Paramedic Ambulances",
        "Drinking Water Supply crates",
      ],
      estimatedResponseTime: "10-15 minutes",
      potentialRisks: ["Commuter panic", "Dehydration scaling"],
      summary: "Commuter distress logged in Sector B subway tunnels. Water dispatches initiated.",
      approved: false,
    },
  },
];

const resources = [
  {
    id: "a1111111-1111-1111-1111-111111111111",
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
    id: "a2222222-2222-2222-2222-222222222222",
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
    id: "a3333333-3333-3333-3333-333333333333",
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
    id: "a4444444-4444-4444-4444-444444444444",
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
    id: "a5555555-5555-5555-5555-555555555555",
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
    id: "a6666666-6666-6666-6666-666666666666",
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
    id: "a7777777-7777-7777-7777-777777777777",
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
    id: "a8888888-8888-8888-8888-888888888888",
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

const resourceAllocations = [
  {
    id: "c1111111-1111-1111-1111-111111111111",
    resourceId: "a1111111-1111-1111-1111-111111111111",
    resourceName: "Food",
    incidentId: "11111111-1111-1111-1111-111111111111",
    incidentType: "flooding",
    quantity: 500,
    status: "delivered",
    allocatedBy: "authority@resqnet.ai",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "c2222222-2222-2222-2222-222222222222",
    resourceId: "a2222222-2222-2222-2222-222222222222",
    resourceName: "Water",
    incidentId: "11111111-1111-1111-1111-111111111111",
    incidentType: "flooding",
    quantity: 1500,
    status: "delivered",
    allocatedBy: "authority@resqnet.ai",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "c3333333-3333-3333-3333-333333333333",
    resourceId: "a6666666-6666-6666-6666-666666666666",
    resourceName: "Boats",
    incidentId: "11111111-1111-1111-1111-111111111111",
    incidentType: "flooding",
    quantity: 3,
    status: "en-route",
    allocatedBy: "authority@resqnet.ai",
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
];

const resourceHistory = [
  {
    id: "d1111111-1111-1111-1111-111111111111",
    resourceId: "a1111111-1111-1111-1111-111111111111",
    resourceName: "Food",
    action: "allocate",
    quantity: 500,
    performedBy: "authority@resqnet.ai",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    note: "Dispatched to Sector A Flooding",
  },
  {
    id: "d2222222-2222-2222-2222-222222222222",
    resourceId: "a2222222-2222-2222-2222-222222222222",
    resourceName: "Water",
    action: "allocate",
    quantity: 1500,
    performedBy: "authority@resqnet.ai",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    note: "Dispatched to Sector A Flooding",
  },
  {
    id: "d3333333-3333-3333-3333-333333333333",
    resourceId: "a6666666-6666-6666-6666-666666666666",
    resourceName: "Boats",
    action: "allocate",
    quantity: 3,
    performedBy: "authority@resqnet.ai",
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    note: "Dispatched to Sector A Flooding",
  },
];

const volunteers = [
  {
    id: "b1111111-1111-1111-1111-111111111111",
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
    id: "b2222222-2222-2222-2222-222222222222",
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
    id: "b3333333-3333-3333-3333-333333333333",
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
    id: "b4444444-4444-4444-4444-444444444444",
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
    id: "b5555555-5555-5555-5555-555555555555",
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

const volunteerAssignments = [
  {
    id: "e1111111-1111-1111-1111-111111111111",
    volunteerId: "b5555555-5555-5555-5555-555555555555",
    volunteerName: "Michael Chang",
    incidentId: "11111111-1111-1111-1111-111111111111",
    incidentType: "flooding",
    incidentLocation: "River Basin, Sector A",
    role: "Evacuation Guide",
    status: "active",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

const shelters = [
  {
    id: "f1111111-1111-1111-1111-111111111111",
    name: "Sector A Emergency Shelter",
    capacity: 500,
    currentOccupancy: 320,
    latitude: 40.718,
    longitude: -74.008,
    status: "open",
  },
  {
    id: "f2222222-2222-2222-2222-222222222222",
    name: "Sector B Central School",
    capacity: 800,
    currentOccupancy: 450,
    latitude: 40.732,
    longitude: -73.94,
    status: "open",
  },
  {
    id: "f3333333-3333-3333-3333-333333333333",
    name: "Sector C Community Hub",
    capacity: 300,
    currentOccupancy: 120,
    latitude: 40.76,
    longitude: -73.99,
    status: "open",
  },
];

const hospitals = [
  {
    id: "ad111111-1111-1111-1111-111111111111",
    name: "St. Jude Disaster Clinic",
    capacity: 150,
    currentOccupancy: 110,
    latitude: 40.725,
    longitude: -73.945,
    status: "operating",
  },
  {
    id: "ad222222-2222-2222-2222-222222222222",
    name: "Sector A General Hospital",
    capacity: 400,
    currentOccupancy: 380,
    latitude: 40.71,
    longitude: -74.015,
    status: "operating",
  },
  {
    id: "ad333333-3333-3333-3333-333333333333",
    name: "Metropolitan Medical Center",
    capacity: 600,
    currentOccupancy: 420,
    latitude: 40.75,
    longitude: -73.98,
    status: "operating",
  },
];

async function seed() {
  console.log('Verifying connection and tables...');

  // Test if tables exist
  const testRes = await supabase.from('resources').select('id').limit(1);
  if (testRes.error) {
    console.error('Error querying resources table:', testRes.error.message);
    console.error('\n⚠️  It looks like the required tables do not exist in your Supabase database yet.');
    console.error('Please go to your Supabase SQL Editor and run the queries in the "supabase_schema.sql" file first.');
    process.exit(1);
  }

  console.log('Clearing old database records to prevent duplicate key violations...');
  
  // Clear in reverse dependency order
  await supabase.from('volunteer_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('resource_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('resource_allocations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('incidents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('volunteers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('resources').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('shelters').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('hospitals').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('Seeding table: resources');
  const resRes = await supabase.from('resources').insert(resources);
  if (resRes.error) throw new Error(`Resources seed failed: ${resRes.error.message}`);

  console.log('Seeding table: incidents');
  const incRes = await supabase.from('incidents').insert(incidents);
  if (incRes.error) throw new Error(`Incidents seed failed: ${incRes.error.message}`);

  console.log('Seeding table: volunteers');
  const volRes = await supabase.from('volunteers').insert(volunteers);
  if (volRes.error) throw new Error(`Volunteers seed failed: ${volRes.error.message}`);

  console.log('Seeding table: resource_allocations');
  const allocRes = await supabase.from('resource_allocations').insert(resourceAllocations);
  if (allocRes.error) throw new Error(`Resource Allocations seed failed: ${allocRes.error.message}`);

  console.log('Seeding table: resource_history');
  const histRes = await supabase.from('resource_history').insert(resourceHistory);
  if (histRes.error) throw new Error(`Resource History seed failed: ${histRes.error.message}`);

  console.log('Seeding table: volunteer_assignments');
  const vaRes = await supabase.from('volunteer_assignments').insert(volunteerAssignments);
  if (vaRes.error) throw new Error(`Volunteer Assignments seed failed: ${vaRes.error.message}`);

  console.log('Seeding table: shelters');
  const shRes = await supabase.from('shelters').insert(shelters);
  if (shRes.error) throw new Error(`Shelters seed failed: ${shRes.error.message}`);

  console.log('Seeding table: hospitals');
  const hospRes = await supabase.from('hospitals').insert(hospitals);
  if (hospRes.error) throw new Error(`Hospitals seed failed: ${hospRes.error.message}`);

  console.log('\n🎉 Supabase Database Seeded Successfully!');
  console.log('Your dashboard and map will now display the initial test data.');
}

seed().catch(err => {
  console.error('\n❌ Seeding failed with error:');
  console.error(err.message || err);
  process.exit(1);
});
