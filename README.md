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
