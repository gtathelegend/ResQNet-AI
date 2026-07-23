-- =============================================================================
-- ResQNet AI - Supabase Database Schema (camelCase Column Names)
-- =============================================================================

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist to start fresh
DROP TABLE IF EXISTS volunteer_assignments CASCADE;
DROP TABLE IF EXISTS volunteers CASCADE;
DROP TABLE IF EXISTS resource_history CASCADE;
DROP TABLE IF EXISTS resource_allocations CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS shelters CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;


-- 1. Incidents table
CREATE TABLE incidents (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "type" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "latitude" FLOAT NOT NULL,
  "longitude" FLOAT NOT NULL,
  "severity" TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  "peopleAffected" INTEGER DEFAULT 0,
  "description" TEXT,
  "imageUrl" TEXT,
  "medicalEmergency" BOOLEAN DEFAULT FALSE,
  "waterNeeded" BOOLEAN DEFAULT FALSE,
  "foodNeeded" BOOLEAN DEFAULT FALSE,
  "shelterNeeded" BOOLEAN DEFAULT FALSE,
  "status" TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'active', 'resolved')),
  "reportedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  "statusHistory" JSONB DEFAULT '[]',
  "aiAnalysis" JSONB
);

-- 2. Resources table
CREATE TABLE resources (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL CHECK (category IN ('supplies', 'vehicles', 'personnel')),
  "totalStock" INTEGER NOT NULL DEFAULT 0,
  "allocatedStock" INTEGER NOT NULL DEFAULT 0,
  "availableStock" INTEGER NOT NULL DEFAULT 0,
  "unit" TEXT NOT NULL,
  "depot" TEXT NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Resource allocations table
CREATE TABLE resource_allocations (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "resourceId" UUID REFERENCES resources("id") ON DELETE CASCADE,
  "resourceName" TEXT NOT NULL,
  "incidentId" UUID REFERENCES incidents("id") ON DELETE CASCADE,
  "incidentType" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'staged' CHECK (status IN ('staged', 'en-route', 'delivered', 'returned')),
  "allocatedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Resource history table
CREATE TABLE resource_history (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "resourceId" UUID REFERENCES resources("id") ON DELETE CASCADE,
  "resourceName" TEXT NOT NULL,
  "action" TEXT NOT NULL CHECK (action IN ('stock_add', 'stock_reduce', 'allocate', 'deallocate')),
  "quantity" INTEGER NOT NULL,
  "performedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "note" TEXT
);

-- 5. Volunteers table
CREATE TABLE volunteers (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT,
  "skills" TEXT[] DEFAULT '{}',
  "status" TEXT NOT NULL DEFAULT 'off-duty' CHECK (status IN ('on-duty', 'off-duty', 'assigned')),
  "latitude" FLOAT,
  "longitude" FLOAT,
  "locationName" TEXT,
  "availabilityHours" TEXT,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Volunteer assignments table
CREATE TABLE volunteer_assignments (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "volunteerId" UUID REFERENCES volunteers("id") ON DELETE CASCADE,
  "volunteerName" TEXT NOT NULL,
  "incidentId" UUID REFERENCES incidents("id") ON DELETE CASCADE,
  "incidentType" TEXT NOT NULL,
  "incidentLocation" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'active', 'completed', 'released')),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Shelters table
CREATE TABLE shelters (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL DEFAULT 0,
  "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
  "latitude" FLOAT NOT NULL,
  "longitude" FLOAT NOT NULL,
  "status" TEXT NOT NULL
);

-- 8. Hospitals table
CREATE TABLE hospitals (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "name" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL DEFAULT 0,
  "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
  "latitude" FLOAT NOT NULL,
  "longitude" FLOAT NOT NULL,
  "status" TEXT NOT NULL
);

-- =============================================================================
-- Row Level Security (RLS) Configuration
-- =============================================================================

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shelters ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Enable permissive access policies for development and production
CREATE POLICY "Allow all" ON incidents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON resources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON resource_allocations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON resource_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON volunteers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON volunteer_assignments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON shelters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON hospitals FOR ALL USING (true) WITH CHECK (true);
