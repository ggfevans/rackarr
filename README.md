# Rackarr

**Rack Layout Designer for Homelabbers**

A browser-based visual tool for planning and documenting server rack layouts. Design your homelab rack configurations with an intuitive drag-and-drop interface, then export them for documentation.

**[Live Demo](https://ggfevans.github.io/rackarr/)**

## Features

- **Visual Rack Editor**: Single rack editing with heights from 1U to 100U, supporting both 10" and 19" rack widths
- **Drag-and-Drop**: Intuitive device placement from a fixed device library sidebar
- **Device Library**: 12 device categories with starter devices, plus custom device creation
- **Device Images**: Upload front/rear images for devices with label/image display toggle
- **Smart Collision Detection**: Prevents device overlap with visual feedback
- **Export Options**: PNG, JPEG, SVG, and PDF export with bundled metadata option
- **Save/Load**: ZIP archive format (`.rackarr.zip`) with embedded device images
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

Access the app at `http://localhost:5173`

## Keyboard Shortcuts

| Key                    | Action                          |
| ---------------------- | ------------------------------- |
| `Ctrl/Cmd + S`         | Save layout                     |
| `Ctrl/Cmd + O`         | Load layout                     |
| `Ctrl/Cmd + E`         | Export dialog                   |
| `Delete` / `Backspace` | Delete selected item            |
| `Arrow Up/Down`        | Move device up/down 1U          |
| `I`                    | Toggle label/image display      |
| `F`                    | Fit rack to viewport            |
| `Escape`               | Clear selection / Close dialogs |
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

Rackarr saves layouts as ZIP archives with the `.rackarr.zip` extension, containing:

```
my-layout.rackarr.zip
├── project.json      # Layout data (racks, devices, library)
└── images/           # Device images (front/rear)
    ├── device-abc-front.png
    └── device-abc-rear.jpg
```

Legacy `.rackarr.json` files are also supported for backwards compatibility.

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

[MIT License](LICENSE) - Copyright (c) 2025 Gareth Evans (ggfevans)
