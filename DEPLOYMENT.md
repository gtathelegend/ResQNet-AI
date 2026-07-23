# Deployment Guide

This guide covers deploying ResQNet AI to production using Vercel, Supabase, and Google Gemini AI.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Platform Configuration](#platform-configuration)
  - [Vercel](#vercel)
  - [Supabase](#supabase)
  - [Google Gemini AI](#google-gemini-ai)
- [Environment Variables](#environment-variables)
- [Local Build Verification](#local-build-verification)
- [Production Deployment](#production-deployment)
- [Post-Deployment Verification](#post-deployment-verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Vercel CLI](https://vercel.com/docs/cli) (optional but recommended)
- A [Supabase](https://supabase.com/) account
- A [Google AI Studio](https://aistudio.google.com/) account for Gemini API
- A [GitHub](https://github.com/) account (for Vercel Git integration)

---

## Platform Configuration

### Vercel

Vercel is the hosting platform for the Next.js frontend and API routes.

#### Option 1: Vercel Dashboard (Recommended)

1. **Push your code** to a GitHub repository
2. **Import the project** in the [Vercel Dashboard](https://vercel.com/dashboard)
3. **Configure project settings**:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. **Add environment variables** (see [Environment Variables](#environment-variables))
5. **Deploy**

#### Option 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Link project (first time only)
vercel link

# Deploy to production
vercel --prod
```

#### Vercel Project Settings

After creation, verify these settings in the Vercel dashboard:

| Setting          | Value           |
| ---------------- | --------------- |
| Node.js Version  | 18.x or 20.x    |
| Framework Preset | Next.js         |
| Build Command    | `npm run build` |
| Output Directory | `.next`         |
| Root Directory   | `./` (default)  |

---

### Supabase

Supabase provides the PostgreSQL database, authentication, and real-time subscriptions.

#### 1. Create a New Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click **"New Project"**
3. Choose your organization and set a project name (e.g., `resqnet-production`)
4. Select a region closest to your users (e.g., `us-east-1` for North America)
5. Set a secure database password and save it in a password manager

#### 2. Database Schema Setup

Run the following SQL in the Supabase SQL Editor (**SQL Editor > New Query**):

```sql
-- =============================================================================
-- ResQNet AI - Production Database Schema
-- =============================================================================

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

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_assignments ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for authenticated users
-- NOTE: Customize these policies based on your authentication requirements
CREATE POLICY "Allow all" ON incidents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON resources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON resource_allocations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON resource_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON volunteers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON volunteer_assignments FOR ALL USING (true) WITH CHECK (true);
```

#### 3. Get API Credentials

1. Go to **Project Settings > API** in the Supabase dashboard
2. Copy the following values:
   - **Project URL** (e.g., `https://abcdefgh12345678.supabase.co`)
   - **anon public** API key
3. Add these to your environment variables

---

### Google Gemini AI

Gemini powers the AI incident analysis, resource recommendations, and volunteer matching.

#### 1. Get API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select or create a project
5. Copy the generated API key

#### 2. Configure Model

The application uses `gemini-1.5-flash` by default. Ensure your API key has access to this model.

---

## Environment Variables

Create a `.env.local` file for local development or add these to your Vercel project settings (**Settings > Environment Variables**):

```env
# =============================================================================
# Required: Supabase Configuration
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# =============================================================================
# Required: Google Gemini AI
# =============================================================================
GEMINI_API_KEY=your-gemini-api-key

# =============================================================================
# Optional: Application Configuration
# =============================================================================
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_AGENCY_NAME="ResQNet AI Command Center"
```

### Vercel Environment Variables Setup

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add each variable from the table above
4. Ensure `NEXT_PUBLIC_*` variables are available in all environments (Production, Preview, Development)
5. Ensure `GEMINI_API_KEY` is only available in Production and Preview (keep it secret)

---

## Local Build Verification

Before deploying, verify the build works locally:

```bash
# Install dependencies
npm install

# Run linting
npm run lint

# Build for production
npm run build

# Start production server locally
npm start
```

The build should complete with no errors. Check for:

- Zero TypeScript errors
- Zero ESLint errors
- All static pages generated successfully

---

## Production Deployment

### Step 1: Connect Repository to Vercel

1. Push all changes to your GitHub repository
2. In Vercel, import the repository
3. Vercel will auto-detect Next.js and configure build settings

### Step 2: Configure Environment Variables

Add all environment variables in the Vercel dashboard before the first deploy.

### Step 3: Deploy

Vercel will automatically deploy on every push to the main branch.

For manual deployment:

```bash
vercel --prod
```

---

## Post-Deployment Verification

After deployment, verify the following:

### 1. Application Health

- [ ] Homepage loads without errors
- [ ] Login page accessible at `/login`
- [ ] Mock login works with test credentials
- [ ] Dashboard renders correctly for each role (Citizen, Volunteer, Authority)

### 2. Feature Verification

- [ ] **Command Palette**: Press `Ctrl+K` or `Cmd+K` to open search
- [ ] **Live Map**: Navigate to `/dashboard/map` and verify map loads
- [ ] **AI Analysis**: Create a test incident and verify AI recommendations generate
- [ ] **Resource Allocation**: Add stock and create allocations
- [ ] **Volunteer Dispatch**: Assign volunteers to incidents

### 3. PWA Verification

- [ ] **Service Worker**: Check browser DevTools > Application > Service Workers
- [ ] **Manifest**: Check DevTools > Application > Manifest
- [ ] **Offline**: Disconnect network and verify app still loads cached pages

### 4. API Verification

Test the following API endpoints:

```bash
curl -X POST https://your-domain.vercel.app/api/analyze-incident \
  -H "Content-Type: application/json" \
  -d '{"type":"flood","location":"Test","severity":"high","description":"Test","peopleAffected":10,"medicalEmergency":false,"waterNeeded":true,"foodNeeded":true,"shelterNeeded":false}'
```

---

## Troubleshooting

### Build Failures

| Symptom                        | Solution                                                            |
| ------------------------------ | ------------------------------------------------------------------- |
| `Module not found`             | Run `npm install` and ensure all dependencies are in `package.json` |
| `TypeScript errors`            | Run `npx tsc --noEmit` locally to identify and fix type issues      |
| `Environment variable missing` | Verify all required env vars are set in Vercel dashboard            |
| `Node.js version mismatch`     | Set Node.js version to 18+ in Vercel project settings               |

### Supabase Connection Issues

| Symptom                | Solution                                              |
| ---------------------- | ----------------------------------------------------- |
| `Failed to fetch`      | Confirm Project URL and Anon Key are correct          |
| `RLS policy violation` | Check that RLS policies allow the required operations |
| `Table does not exist` | Re-run the database schema SQL in Supabase SQL Editor |
| `CORS errors`          | Add your Vercel domain to Supabase allowed origins    |

### Gemini API Errors

| Symptom               | Solution                                                |
| --------------------- | ------------------------------------------------------- |
| `API key invalid`     | Regenerate key in Google AI Studio                      |
| `Model not found`     | Verify `gemini-1.5-flash` is available in your region   |
| `Rate limit exceeded` | Upgrade your Gemini API plan or implement rate limiting |
| `API not enabled`     | Enable Generative Language API in Google Cloud Console  |

### General Issues

| Symptom                        | Solution                                                  |
| ------------------------------ | --------------------------------------------------------- |
| Command Palette not opening    | Check for JavaScript errors in browser console            |
| Service Worker not registering | Verify `sw.js` is in `/public` and accessible at `/sw.js` |
| Styles not loading             | Check that `globals.css` is imported in `layout.tsx`      |

---

## Support

For deployment issues, please open an issue on GitHub with:

- Deployment platform and version
- Error messages or logs
- Environment details (Node.js version, OS)
- Steps to reproduce
