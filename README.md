# Useful Tools

> A suite of accessible, intuitive calculators and utilities for energy management, financial planning, and customer interaction scoring.

[![Docker Hub](https://img.shields.io/badge/docker-jimdhope/useful--tools-2496ED?logo=docker&logoColor=white)](https://hub.docker.com/r/jimdhope/useful-tools)
[![Node](https://img.shields.io/badge/node-22-339933?logo=node.js&logoColor=white)]()
[![Next.js](https://img.shields.io/badge/next-16-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/typescript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)]()

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
- [Docker](#docker)
  - [Build Locally](#build-locally)
  - [Pull from Docker Hub](#pull-from-docker-hub)
  - [Portainer Deployment](#portainer-deployment)
- [Calculators](#calculators)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Auto-Calculating** — all results are computed in real-time as you type. No submit buttons needed.
- **Shared Results Panel** — every calculator pushes output to a unified right-side drawer. Form areas stay clean — just inputs.
- **Responsive Layout** — two-column grid on desktop (form + sticky results), single-column on mobile with inline results.
- **Dark Mode** — theme toggle in the top-right corner.
- **Type-Safe Forms** — all forms use Zod schemas with react-hook-form for validation.
- **Accessible** — built with Radix UI primitives and semantic HTML.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, static generation) |
| UI Library | [React 19](https://react.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Forms | [react-hook-form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Charts | [Recharts](https://recharts.org) (tariff comparison) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Icons | [Lucide](https://lucide.dev) |
| Container | Docker (Alpine-based, multi-stage build) |
| Language | TypeScript |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 22+
- npm 10+
- (Optional) [Docker](https://docker.com) for containerised deployment

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/jimdhope/Useful-Tools.git
cd Useful-Tools

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser.

To create a production build:

```bash
npm run build
npm start
```

## Docker

### Build Locally

```bash
docker compose up --build -d
```

The app will be served on [http://localhost:9002](http://localhost:9002).

### Pull from Docker Hub

Pre-built images are available on Docker Hub. No local build required.

```yaml
# docker-compose.yml
services:
  useful-tools:
    image: jimdhope/useful-tools:latest
    ports:
      - "9002:3000"
    environment:
      - NODE_ENV=production
```

```bash
docker compose up -d
```

A `docker-compose.hub.yml` with this configuration is included in the repository.

### Portainer Deployment

1. In your Portainer instance, navigate to **App Templates** or **Stacks**.
2. Create a new stack with the following compose definition:

```yaml
services:
  useful-tools:
    image: jimdhope/useful-tools:latest
    ports:
      - "9002:3000"
    environment:
      - NODE_ENV=production
```

3. Deploy the stack. Portainer will pull the image and start the container automatically.

To update to the latest image:

```bash
docker compose pull
docker compose up -d
```

Or in Portainer, click **Recreate** on the container.

## Calculators

| Calculator | Description |
|-----------|-------------|
| **Instalment Plan** | Calculate repayment plans for outstanding balances with usage costs and optional instalment amounts. |
| **Energy Usage & Cost** | Estimate energy costs from meter readings or direct kWh input. Supports single/multi-rate electricity and gas with standing charges. |
| **Burns Test** | Compare meter readings against given rates to detect discrepancies. |
| **Dual Fuel** | Combine electricity and gas costs to see total usage, account balance, and suggested payment plans. |
| **Tariff Comparison** | Compare multiple energy tariffs side-by-side using annual usage data. |
| **Agreed Reads** | Estimate meter readings at a proposed date based on billing period history. Shows units used, daily average, and proposed reading per fuel/rate. |
| **Call Flow** | Interactive decision-tree guides for common customer service scenarios. |

Each calculator is fully self-contained and pushes computed results to the shared **ResultsPanel** via React context.

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Home page (tabs + results panel)
│   ├── about/
│   │   └── page.tsx
│   ├── scoring/
│   │   ├── page.tsx
│   │   └── slideshow/
│   └── globals.css               # Tailwind CSS entry point
├── components/
│   ├── calculators/              # All calculator components
│   │   ├── results-panel.tsx     # Shared results display
│   │   ├── instalment-plan-calculator.tsx
│   │   ├── energy-usage-calculator.tsx
│   │   ├── burns-test-calculator.tsx
│   │   ├── dual-fuel-calculator.tsx
│   │   ├── tariff-comparison-tool.tsx
│   │   ├── agreed-reads-calculator.tsx
│   │   └── call-flows/           # Decision-tree flow components
│   ├── ui/                       # shadcn/ui primitives
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
└── lib/
    ├── results-context.tsx        # React context for shared results
    ├── schemas.ts                 # Zod validation schemas
    └── utils.ts                   # Tailwind utility (cn)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 9002 |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking (`tsc --noEmit`) |

## Contributing

Contributions are welcome. This project follows a standard pull request workflow:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code passes linting and type checking before submitting.

## License

Distributed under the MIT License. See `LICENSE` for more information.
