# Rackarr

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.5.8-blue.svg)](https://github.com/Rackarr/Rackarr/releases)
[![Demo](https://img.shields.io/badge/demo-app.rackarr.com-green.svg)](https://app.rackarr.com/)

**Rack Layout Designer for Homelabbers**

A browser-based visual tool for planning and documenting server rack layouts. Design your homelab rack configurations with an intuitive drag-and-drop interface, then export them for documentation.

<!-- TODO: Add hero screenshot/GIF here -->
<!-- ![Rackarr Screenshot](docs/images/hero.png) -->

**[Try the Live Demo →](https://app.rackarr.com/)**

## Features

- **Drag-and-Drop**: Intuitive device placement from the device library sidebar
- **Rack Width Support**: Both 10" and 19" rack form factors
- **Device Images**: Upload front/rear images with label/image display toggle
- **Export Options**: PNG, JPEG, SVG export with optional bundled metadata
- **Save/Load**: ZIP archive format (`.rackarr.zip`) with embedded device images
- **Device Library**: 12 device categories with starter devices, plus custom device creation
- **Dark/Light Themes**: Full theme support with system preference detection
- **Keyboard Shortcuts**: Full keyboard navigation for power users
- **Offline Ready**: Runs entirely in the browser, no server required

## AI Transparency

This project is developed using AI-assisted workflows (primarily [Claude Code](https://claude.com/claude-code) via [Happy](https://happy.engineering)). We believe in transparent collaboration between human developers and AI tools.

- Substantial AI contributions are marked with `Co-authored-by` tags in commits
- All AI-generated code undergoes human review and comprehensive testing
- The AI assists development but humans maintain architectural decisions and project vision

Both traditional and AI-assisted contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

Access the app at `http://localhost:5173`

### Docker

```bash
# One-liner
docker run -d -p 8080:80 ghcr.io/rackarr/rackarr:latest

# Or with docker compose
curl -O https://raw.githubusercontent.com/Rackarr/Rackarr/main/docker-compose.yml
docker compose up -d
```

Access the app at `http://localhost:8080`

## Keyboard Shortcuts

| Key                    | Action                          |
| ---------------------- | ------------------------------- |
| `Ctrl/Cmd + Z`         | Undo                            |
| `Ctrl/Cmd + Shift + Z` | Redo                            |
| `Ctrl/Cmd + S`         | Save layout                     |
| `Ctrl/Cmd + O`         | Load layout                     |
| `Ctrl/Cmd + E`         | Export dialog                   |
| `Delete` / `Backspace` | Delete selected item            |
| `Arrow Up/Down`        | Move device up/down 1U          |
| `I`                    | Toggle label/image display      |
| `F`                    | Fit rack to viewport            |
| `Escape`               | Clear selection / Close dialogs |
| `?`                    | Show About & shortcuts          |

## Tech Stack

- **Framework**: Svelte 5 with runes (`$state`, `$derived`, `$effect`)
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **Testing**: Vitest + @testing-library/svelte + Playwright
- **Styling**: CSS custom properties (no external CSS frameworks)
- **Rendering**: SVG for rack visualization

## Project Structure

```
src/
├── lib/
│   ├── components/     # Svelte components
│   ├── stores/         # State management (Svelte 5 runes)
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── data/           # Starter device library
├── tests/              # Unit and component tests
└── App.svelte          # Main application component

e2e/                    # Playwright E2E tests
```

## File Format

Rackarr saves layouts as ZIP archives with the `.rackarr.zip` extension, containing:

```
my-layout.rackarr.zip
├── project.json      # Layout data (racks, devices, library)
└── images/           # Device images (front/rear)
    ├── device-abc-front.png
    └── device-abc-rear.jpg
```

## Documentation

- **[Architecture Overview](docs/ARCHITECTURE.md)** — High-level design and entry points
- **[Technical Specification](docs/reference/SPEC.md)** — Complete technical specification
- **[Testing Guide](docs/guides/TESTING.md)** — Testing patterns and commands
- **[Accessibility](docs/guides/ACCESSIBILITY.md)** — A11y compliance checklist

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## Privacy & Analytics

The hosted demo uses [Umami](https://umami.is/) for privacy-focused analytics:

- **No cookies** - No consent banner needed
- **No personal data** - Only page views, feature usage, and browser stats
- **Self-hosted** - Analytics server at analytics.rackarr.com
- **Open source** - Umami is fully open source
- **Privacy first** - GDPR/CCPA compliant by design

Self-hosted or local instances have analytics disabled by default. Configure via environment variables:

```bash
VITE_UMAMI_ENABLED=true
VITE_UMAMI_SCRIPT_URL=https://your-umami-instance.com/script.js
VITE_UMAMI_WEBSITE_ID=your-website-id
```

### Events Tracked

| Event | Purpose |
|-------|---------|
| File save/load | Usage patterns |
| Export (image/PDF/CSV) | Feature adoption |
| Custom device creation | Workflow insights |
| Display mode toggle | UI preferences |
| Keyboard shortcuts | Power user metrics |

## License

[MIT License](LICENSE) - Copyright (c) 2025 Gareth Evans (ggfevans)
