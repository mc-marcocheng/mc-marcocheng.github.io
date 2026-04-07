# Portfolio Page for mc-marcocheng

Portfolio site with Tailwind CSS build workflows.

## Prerequisites

- Node.js (v16+ recommended)
- npm (bundled with Node.js)

## Install dependencies

```bash
npm install
```

## Available npm scripts

- `npm run start:tailwind` - Tailwind dev watch mode
- `npm run build:tailwind` - Tailwind production build + minify
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format all files with Prettier

## Tailwind build workflow

### Development (watch + auto-rebuild)

```bash
npm run start:tailwind
```

- Watches `css/tailwind.css` and recompiles to `css/tailwind-runtime.css`.
- Use while editing UI styles.

### Production build

```bash
npm run build:tailwind
```

- Compiles `css/tailwind.css` to `css/tailwind-build.css` with minification.

## Local web server

Serve the site locally:

```bash
npx serve .
```

Open `http://localhost:3000`.
