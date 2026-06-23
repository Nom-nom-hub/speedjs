# Quickstart

Get up and running with Speed.js in 5 minutes.

## Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher

## Installation

Create a new Speed.js app:

```bash
pnpm create @speedjs/app my-app
cd my-app
pnpm install
```

Or use the CLI directly:

```bash
npm install -g @speedjs/cli
speed create my-app
cd my-app
pnpm install
```

## Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

```
my-app/
├── src/
│   ├── app.tsx          # Main entry point
│   └── routes/          # File-based routes
│       ├── index.tsx    # Home page
│       ├── about.tsx    # About page
│       └── api/         # API routes
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── speed.config.ts      # Speed.js configuration
```

## Building

Build for production:

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

## Testing

Run tests:

```bash
pnpm test
```

## Next Steps

- [Signals](./signals.md) - Learn the reactive system
- [Components](./components.md) - Build UI components
- [Routing](./routing.md) - Set up file-based routing
- [API Routes](./api-routes.md) - Create backend endpoints
