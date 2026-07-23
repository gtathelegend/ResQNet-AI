# ResQNet AI

ResQNet AI is an enterprise-grade AI-Powered Disaster Response & Resource Coordination Platform. Built on Next.js 15, TypeScript, and a modern design system utilizing IBM Blue, Charcoal Dark, and Green Accent colors.

---

## 🛠️ Tech Stack & Foundation

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescript.org/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) (Vanilla CSS Variables)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (with Radix / Base UI Primitives)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Formatting & Linting**: [Prettier](https://prettier.io/) & [ESLint](https://eslint.org/)

---

## 📁 Enterprise Architecture & Directory Structure

The project conforms to a modular enterprise folder layout, optimizing separation of concerns and features:

```text
ResQNet AI/
├── app/               # Next.js pages, routing layouts, and default entry page
├── components/        # Reusable UI component layer
│   ├── layout/        # Global layout shells (Navbar, Footer, Sidebar, DashboardLayout)
│   └── ui/            # shadcn/ui foundation components (Buttons, Badges, Tables, Modals, Breadcrumbs, Toasters)
├── features/          # Domain-driven feature modules (Incidents, Resources, Deployments)
├── hooks/             # Custom global React hooks (useTheme, etc.)
├── lib/               # Shared utility logic (utils, API clients, HMAC signers)
├── types/             # Project-wide TS interfaces
├── styles/            # Styling declarations (globals.css containing design tokens)
├── public/            # Static assets and media files
├── tsconfig.json      # TypeScript absolute imports configurations
├── components.json    # shadcn settings and directories mappings
└── .env.example       # Local development template variables
```

---

## 🎨 Design System Specifications

| Element        | Reference Color           | Purpose                                                          |
| :------------- | :------------------------ | :--------------------------------------------------------------- |
| **Primary**    | `#0F62FE` (IBM Blue)      | Call-to-actions, brand presence, active highlights.              |
| **Secondary**  | `#161616` (Charcoal Dark) | Dark mode backgrounds, high contrast texts.                      |
| **Accent**     | `#24A148` (Green Accent)  | Success badges, online system indicators, unit dispatch actions. |
| **Background** | `#F4F4F4` (Light Grey)    | Light mode layout backdrop.                                      |
| **Typography** | `Inter`                   | Sans-serif standard font.                                        |

Dark mode is built-in and respects both user system preferences and user manual toggle controls (manipulating class `.dark` on the document root).

---

## 🚀 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Dev Server**:
   ```bash
   npm run dev
   ```
3. **Format Code**:
   ```bash
   npx prettier --write .
   ```
4. **Lint Project**:
   ```bash
   npm run lint
   ```
5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Users["Users"]
        C[Citizens]
        V[Volunteers]
        A[Authorities / HQ]
    end

    subgraph Frontend["Next.js 15 Frontend"]
        APP[App Router]
        CP[Command Palette]
        PWA[PWA / Service Worker]
        UI[shadcn/ui Components]
        MAP[Leaflet Live Map]
    end

    subgraph Backend["API Layer"]
        API1[/api/analyze-incident]
        API2[/api/recommend-resources]
        API3[/api/recommend-volunteers]
    end

    subgraph AI["AI Services"]
        GEMINI[Google Gemini API]
    end

    subgraph Data["Data Layer"]
        SUPABASE[(Supabase PostgreSQL)]
        MOCK[Mock Client<br/>Development Mode]
    end

    C -->|Report Incidents| APP
    V -->|View Assignments| APP
    A -->|Manage Operations| APP

    APP --> CP
    APP --> PWA
    APP --> UI
    APP --> MAP

    APP --> API1
    APP --> API2
    APP --> API3

    API1 --> GEMINI
    API2 --> GEMINI
    API3 --> GEMINI

    APP --> SUPABASE
    APP --> MOCK

    style Users fill:#e1f5fe
    style Frontend fill:#fff3e0
    style Backend fill:#e8f5e9
    style AI fill:#fce4ec
    style Data fill:#f3e5f5
```

### Architecture Overview

- **Citizens** report incidents and track status through the public dashboard
- **Volunteers** receive assignments and update their availability
- **Authorities** manage resources, dispatch teams, and analyze incidents via AI
- **Gemini API** powers intelligent incident analysis, resource recommendations, and volunteer matching
- **Supabase** provides PostgreSQL database, authentication, and real-time subscriptions
- **Mock Client** enables offline development without external dependencies

---

## 📋 Quick Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Environment Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

For development without external services, the app automatically falls back to mock data.

### Mock Login Credentials

| Role      | Email                  | Password   |
| --------- | ---------------------- | ---------- |
| Citizen   | `citizen@resqnet.ai`   | `password` |
| Volunteer | `volunteer@resqnet.ai` | `password` |
| Authority | `authority@resqnet.ai` | `password` |

---

## 🧩 Features

- **Global Command Palette** — Press `Ctrl+K` or `Cmd+K` to search incidents, resources, volunteers, and navigate
- **PWA Support** — Offline-capable with service worker caching
- **Role-Based Dashboards** — Tailored views for Citizens, Volunteers, and Authorities
- **Live Incident Map** — Real-time geographic visualization with Leaflet
- **AI-Powered Analysis** — Gemini API for incident prioritization and resource recommendations
- **Resource Allocation** — Track inventory, allocations, and history
- **Volunteer Coordination** — Proximity-based dispatch and assignment tracking
- **Dark Mode** — System-aware and manual theme toggling

---

## 📄 Documentation

- [Deployment Guide](DEPLOYMENT.md) — Vercel, Supabase, and Gemini API setup
- [Contributing Guide](CONTRIBUTING.md) — Development workflow and coding standards
- [License](LICENSE) — MIT License

---

## 📸 Screenshots

> Screenshots will be added here after deployment. Placeholder sections for key views:

| View                       | Description                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------ |
| **Dashboard**              | Role-based overview with incident counts, resource status, and volunteer assignments |
| **Incident Map**           | Live geographic visualization with incident markers and heatmap layers               |
| **Command Palette**        | Global `Ctrl+K` / `Cmd+K` search overlay for incidents, resources, and navigation    |
| **Resource Management**    | Inventory tracking, allocation history, and warehouse stock levels                   |
| **Volunteer Coordination** | Proximity-based dispatch, assignment tracking, and availability status               |
| **AI Analysis**            | Gemini-powered incident prioritization and resource recommendations                  |

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct, development workflow, and pull request process.

---

## 📜 License

This project is licensed under the Apache License 2.0 — see the [LICENSE](LICENSE) file for details.
