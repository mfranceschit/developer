# mfranceschit/developer

Personal portfolio monorepo — portfolio site, shared UI library, and design system.

## Structure

```
apps/
  portfolio/         # Astro portfolio site
packages/
  ui/                # Shared React component library (Ark UI + Storybook)
  typescript-config/ # Shared TypeScript configs
```

## Tech stack

- **Monorepo**: pnpm workspaces + Turborepo
- **Portfolio**: Astro + Svelte islands
- **UI library**: React + Ark UI + Storybook
- **CMS**: Sanity (GROQ)
- **Styles**: Tailwind CSS
- **Linting/formatting**: Biome
- **Hosting**: Cloudflare Pages

## Getting started

```bash
pnpm install
pnpm dev
```
