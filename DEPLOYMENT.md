# Deployment Guide

This guide covers deploying ResQNet AI to production using Vercel and Supabase.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Supabase Setup](#supabase-setup)
- [Gemini API Configuration](#gemini-api-configuration)
- [Environment Variables](#environment-variables)
- [Post-Deployment Verification](#post-deployment-verification)

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [Vercel CLI](https://vercel.com/docs/cli) (optional but recommended)
- A [Supabase](https://supabase.com/) account
- A [Google AI Studio](https://aistudio.google.com/) account for Gemini API

## Vercel Deployment

### Option 1: Vercel Dashboard (Recommended)

1. **Push your code** to a GitHub repository
2. **Import the project** in the [Vercel Dashboard](https://vercel.com/dashboard)
3. **Configure project settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Add environment variables** (see [Environment Variables](#environment-variables))
5. **Deploy**

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Supabase Setup

### 1. Create a New Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Choose your organization and set a project name
4. Select a region closest to your users
5. Set a secure database password

### 2. Database Schema

Run the following SQL in the Supabase SQL Editor to create the required tables:

```sql
-- Incidents table
CREATE TABLE incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  people_affected INTEGER DEFAULT 0,
  description TEXT,
  image_url TEXT,
  medical_emergency BOOLEAN DEFAULT FALSE,
  water_needed BOOLEAN DEFAULT FALSE,
  food_needed BOOLEAN DEFAULT FALSE,
  shelter_needed BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'active', 'resolved')),
  reported_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status_history JSONB DEFAULT '[]',
  ai_analysis JSONB
);

-- Resources table
CREATE TABLE resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('supplies', 'vehicles', 'personnel')),
  total_stock INTEGER NOT NULL DEFAULT 0,
  allocated_stock INTEGER NOT NULL DEFAULT 0,
  available_stock INTEGER GENERATED ALWAYS AS (total_stock - allocated_stock) STORED,
  unit TEXT NOT NULL,
  depot TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource allocations table
CREATE TABLE resource_allocations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES resources(id),
  resource_name TEXT NOT NULL,
  incident_id UUID REFERENCES incidents(id),
  incident_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'staged' CHECK (status IN ('staged', 'en-route', 'delivered', 'returned')),
  allocated_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resource history table
CREATE TABLE resource_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES resources(id),
  resource_name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('stock_add', 'stock_reduce', 'allocate', 'deallocate')),
  quantity INTEGER NOT NULL,
  performed_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  note TEXT
);

-- Volunteers table
CREATE TABLE volunteers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  skills TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'off-duty' CHECK (status IN ('on-duty', 'off-duty', 'assigned')),
  latitude FLOAT,
  longitude FLOAT,
  location_name TEXT,
  availability_hours TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Volunteer assignments table
CREATE TABLE volunteer_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id UUID REFERENCES volunteers(id),
  volunteer_name TEXT NOT NULL,
  incident_id UUID REFERENCES incidents(id),
  incident_type TEXT NOT NULL,
  incident_location TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'active', 'completed', 'released')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_assignments ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for authenticated users (customize as needed)
CREATE POLICY "Allow all" ON incidents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON resources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON resource_allocations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON resource_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON volunteers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON volunteer_assignments FOR ALL USING (true) WITH CHECK (true);
```

### 3. Get API Credentials

1. Go to **Project Settings > API**
2. Copy the **Project URL** and **anon public** API key
3. Add these to your environment variables

## Gemini API Configuration

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Create or select a project
3. Generate an API key
4. Add the key to your environment variables as `GEMINI_API_KEY`

## Environment Variables

Create a `.env.local` file for local development or add these to your Vercel project settings:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Optional: Analytics
# NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## Post-Deployment Verification

After deployment, verify the following:

1. **Homepage loads** without errors
2. **Mock login works** with test credentials
3. **Dashboard renders** correctly for each role
4. **Command Palette** opens with `Ctrl+K` or `Cmd+K`
5. **Service Worker** registers (check browser DevTools > Application > Service Workers)
6. **PWA manifest** is valid (check DevTools > Application > Manifest)
7. **API routes** respond correctly:
   - `/api/analyze-incident`
   - `/api/recommend-resources`
   - `/api/recommend-volunteers`

### Health Check Commands

```bash
# Verify build locally
npm run build

# Run linting
npm run lint

# Start production build locally
npm start
```

## Troubleshooting

### Build Failures

- Ensure all environment variables are set in Vercel
- Check that `next.config.ts` does not have invalid configurations
- Verify Node.js version compatibility (18+)

### Supabase Connection Issues

- Confirm the Project URL and Anon Key are correct
- Check that Row Level Security policies allow the required operations
- Verify the database schema matches the application expectations

### Gemini API Errors

- Ensure the API key is valid and has not expired
- Check that the Gemini API is available in your region
- Review API rate limits for your plan

## Support

For deployment issues, please open an issue on GitHub with:
- Deployment platform (Vercel)
- Error messages or logs
- Environment details (Node.js version, OS)
