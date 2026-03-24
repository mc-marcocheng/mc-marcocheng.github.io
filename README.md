# Portfolio Page for mc-marcocheng

Portfolio site with Tailwind CSS build workflows.

## Prerequisites

- Node.js (v16+ recommended)
- npm (bundled with Node.js)

## Install dependencies

```bash
npm install
```

## Tailwind build workflow

The project includes these npm scripts in `package.json`:

- `npm run start:tailwind` : development watch mode
- `npm run build:tailwind` : production build + minify

### Development (watch + auto-rebuild)

```bash
npm run start:tailwind
```

- Watches `tailwind.css` (source) and recompiles to `tailwind-runtime.css`.
- Use while editing UI styles.

### Production build

```bash
npm run build:tailwind
```

- Compiles `tailwind.css` to `tailwind-build.css` with minification.

## Local web server

You can serve the site locally using any static server.

### Option 1: Python 3 built-in server

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

### Option 2: Node `http-server`

```bash
npm install --global http-server
http-server -p 8000
```
