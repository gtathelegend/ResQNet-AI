# Contributing to ResQNet AI

Thank you for your interest in contributing to ResQNet AI! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Guidelines](#coding-guidelines)
- [Pull Request Process](#pull-request-process)
- [Commit Message Convention](#commit-message-convention)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community and disaster response efforts

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/resqnet-ai.git
   cd resqnet-ai
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feat/your-feature-name
   ```

## Development Workflow

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

### Mock Authentication

For local development, use the following mock credentials:

| Role | Email | Password |
|------|-------|----------|
| Citizen | `citizen@resqnet.ai` | `password` |
| Volunteer | `volunteer@resqnet.ai` | `password` |
| Authority | `authority@resqnet.ai` | `password` |

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

## Coding Guidelines

### TypeScript

- Use strict TypeScript typing; avoid `any`
- Define interfaces in the `types/` directory
- Use absolute imports with `@/` aliases

### React & Next.js

- Use functional components with hooks
- Prefer Server Components unless client interactivity is required
- Use `"use client"` directive sparingly and only when necessary

### Styling

- Use TailwindCSS utility classes
- Follow the existing design system tokens in `styles/globals.css`
- Use `cn()` from `lib/utils.ts` for conditional class merging

### Components

- Place reusable UI components in `components/ui/`
- Place layout components in `components/layout/`
- Place feature-specific components in `components/[feature]/`
- Follow the shadcn/ui component patterns

### File Naming

- Use PascalCase for component files (e.g., `CommandPalette.tsx`)
- Use camelCase for utility files (e.g., `use-auth.tsx`)
- Use kebab-case for configuration files

## Pull Request Process

1. **Update documentation** if your changes affect usage or setup
2. **Run linting** before submitting:
   ```bash
   npm run lint
   ```
3. **Ensure the build passes**:
   ```bash
   npm run build
   ```
4. **Format your code**:
   ```bash
   npx prettier --write .
   ```
5. **Submit your pull request** with a clear description of:
   - What changes were made
   - Why the changes were made
   - How to test the changes

### PR Review Criteria

- Code follows the project's coding guidelines
- All CI checks pass
- Changes are adequately tested
- Documentation is updated if necessary

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding or correcting tests
- `chore`: Changes to the build process or auxiliary tools

### Examples

```
feat(command-palette): add global cmd+k search
fix(map): resolve marker clustering issue
docs(readme): update deployment instructions
```

## Questions?

If you have questions or need help, please open an issue on GitHub.

Thank you for contributing to ResQNet AI!
