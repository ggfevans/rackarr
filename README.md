# Rackarr

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.5.8-blue.svg)](https://github.com/Rackarr/Rackarr/releases)
[![Tests](https://img.shields.io/badge/tests-1800%2B-brightgreen.svg)](https://github.com/Rackarr/Rackarr/actions)
[![Demo](https://img.shields.io/badge/demo-app.rackarr.com-blue.svg)](https://app.rackarr.com/)

> Visual rack layout designer for homelabbers. Plan your server cabinet without moving heavy iron.

<!-- TODO: Add hero screenshot/GIF here (see issue #21) -->
<!-- ![Rackarr Screenshot](docs/images/hero.png) -->

**[Try the Live Demo →](https://app.rackarr.com/)**

## Features

- **Drag-and-drop** — Intuitive device placement from the sidebar library
- **Image mode** — Real device photos for visual accuracy (front/rear views)
- **Undo/Redo** — Experiment freely with full history support
- **Export** — PNG, JPEG, SVG, PDF for documentation
- **Save/Load** — ZIP archive format with embedded device images
- **Device library** — 12 categories with starter devices, plus custom creation
- **NetBox-compatible** — Data model aligns with NetBox device types
- **Keyboard shortcuts** — Full keyboard navigation for power users
- **Dark/Light themes** — System preference detection

## Philosophy

- **Offline-first** — Runs entirely in your browser, no server required
- **No accounts** — Your data stays on your device
- **No telemetry** — Self-hosted instances have zero tracking
- **Open source** — MIT licensed, fork-friendly

## Quick Start

### Use Online

The fastest way to try Rackarr:

**[app.rackarr.com](https://app.rackarr.com/)** — Production instance, always up-to-date

### Self-Host with Docker

```bash
docker run -d -p 8080:80 ghcr.io/rackarr/rackarr:latest
```

Then open `http://localhost:8080`

Or use Docker Compose:

```bash
curl -O https://raw.githubusercontent.com/Rackarr/Rackarr/main/docker-compose.yml
docker compose up -d
```

### Build from Source

```bash
git clone https://github.com/Rackarr/Rackarr.git
cd Rackarr && npm install && npm run build
# Serve the dist/ folder with any static file server
```

For development setup, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Keyboard Shortcuts

| Key                    | Action                       |
| ---------------------- | ---------------------------- |
| `Ctrl/Cmd + Z`         | Undo                         |
| `Ctrl/Cmd + Shift + Z` | Redo                         |
| `Ctrl/Cmd + S`         | Save layout                  |
| `Ctrl/Cmd + O`         | Load layout                  |
| `Ctrl/Cmd + E`         | Export dialog                |
| `Delete` / `Backspace` | Delete selected              |
| `Arrow Up/Down`        | Move device 1U               |
| `I`                    | Toggle label/image mode      |
| `A`                    | Toggle airflow visualization |
| `F`                    | Fit rack to viewport         |
| `?`                    | Show help                    |

## Documentation

- **[Architecture Overview](docs/ARCHITECTURE.md)** — System design and entry points
- **[Technical Specification](docs/reference/SPEC.md)** — Complete reference
- **[Testing Guide](docs/guides/TESTING.md)** — Testing patterns (1800+ tests)

## Contributing

Both traditional and AI-assisted contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

This project uses AI-assisted development workflows. Commits with substantial AI contributions are marked with `Co-authored-by` tags.

## Acknowledgments

Built for the [r/homelab](https://reddit.com/r/homelab) and [r/selfhosted](https://reddit.com/r/selfhosted) communities.

Inspired by [NetBox](https://netbox.dev/) — device types and images are compatible with the [NetBox devicetype-library](https://github.com/netbox-community/devicetype-library).

## License

[MIT License](LICENSE) — Copyright (c) 2025 Gareth Evans
