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
- `npm run images` - Optimise images from `_originals/` (incremental)
- `npm run images:clean` - Full rebuild of optimised images

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

## Image optimisation workflow

Raw photos are kept outside the repo and processed into committed WebP assets.

```
_originals/          ← gitignored, drop raw photos here
  {parkId}/
    overview_1.jpg
    other_1.jpg
    ...

assets/images/parks/ ← committed, generated output
  {parkId}/
    thumb/           ← 200 px wide, WebP q75  (used in list cards)
      overview_1.webp
    med/             ← 800 px wide, WebP q80  (used in modal gallery)
      overview_1.webp
```

### Adding photos for a park

1. Create `_originals/{parkId}/` and drop the raw files in.
2. Add the base names (no extension) to `assets/data/parks.json` under `park_images` or `equipment[].images`.
3. Run `npm run images` — only new or changed files are processed.
4. Commit the generated files under `assets/images/parks/`.

### Rebuilding everything from scratch

```bash
npm run images:clean
```

## Local web server

Serve the site locally:

```bash
npx serve .
```

Open `http://localhost:3000`.
