# Rackarr

**Rack Layout Designer for Homelabbers**

A browser-based visual tool for planning and documenting server rack layouts. Design your homelab rack configurations with an intuitive drag-and-drop interface, then export them for documentation.

**[Live Demo](https://ggfevans.github.io/rackarr/)**

## Features

- **Visual Rack Editor**: Single rack editing with heights from 1U to 100U (multi-rack support planned for v0.3)
- **Drag-and-Drop**: Intuitive device placement from palette to rack
- **Device Library**: Starter library with common devices, plus custom device creation
- **Smart Collision Detection**: Prevents device overlap with visual feedback
- **Multi-Rack File Loading**: Opens multi-rack files (loads first rack only with warning)
- **Export Options**: PNG, JPEG, SVG, and PDF export with customizable options
- **Dark/Light Themes**: Full theme support with system preference detection
- **Keyboard Shortcuts**: Full keyboard navigation for power users
- **Session Persistence**: Auto-saves work to browser storage
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

### Docker

```bash
# Build and run with Docker Compose
docker-compose up

# Or build and run manually
docker build -t rackarr .
docker run -p 8080:80 rackarr
```

Access the app at `http://localhost:8080`

## Keyboard Shortcuts

| Key                    | Action                          |
| ---------------------- | ------------------------------- |
| `Delete` / `Backspace` | Delete selected item            |
| `Arrow Up`             | Move device up 1U               |
| `Arrow Down`           | Move device down 1U             |
| `Escape`               | Clear selection / Close drawers |
| `D`                    | Toggle device palette           |
| `Ctrl/Cmd + S`         | Save layout                     |
| `Ctrl/Cmd + O`         | Load layout                     |
| `Ctrl/Cmd + E`         | Export dialog                   |
| `?`                    | Show help                       |

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

Rackarr saves layouts as JSON files with the `.rackarr.json` extension:

```json
{
  "version": "1.0",
  "name": "My Homelab",
  "racks": [...],
  "deviceLibrary": [...]
}
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## Privacy & Analytics

The hosted demo uses [GoatCounter](https://www.goatcounter.com/) for basic, privacy-focused analytics:

- **No cookies** - No consent banner needed
- **No personal data** - Only page views, referrers, and browser/device stats
- **Open source** - GoatCounter is fully open source
- **Minimal tracking** - Just basic usage metrics to understand if people find this useful

Self-hosted or local instances have no analytics. The GoatCounter script only runs on the GitHub Pages demo.

## License

[MIT License](LICENSE) - Copyright (c) 2025 gvns

## Repository

- **Primary**: https://git.falcon-wahoe.ts.net/ggfevans/rackarr
- **Mirror**: https://github.com/ggfevans/rackarr
