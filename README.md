<p align="center">
  <img src="assets/rackarr-lockup-staggered-light.svg#gh-light-mode-only" alt="Rackarr" width="400">
  <img src="assets/rackarr-lockup-staggered-dark.svg#gh-dark-mode-only" alt="Rackarr" width="400">
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-bd93f9?style=for-the-badge&labelColor=44475a" alt="License: MIT"></a>
  <img src="https://img.shields.io/github/v/release/Rackarr/Rackarr?style=for-the-badge&labelColor=44475a&color=ff79c6" alt="GitHub Release">
  <a href="https://github.com/rackarr/Rackarr/pkgs/container/rackarr"><img src="https://img.shields.io/github/v/release/Rackarr/Rackarr?style=for-the-badge&labelColor=44475a&color=50fa7b&label=docker&logo=docker&logoColor=white" alt="Docker"></a>
</p>

<p align="center">
  <strong>Visual rack layout designer for homelabbers</strong>
</p>

// insert hero images here

---

## What _Is_ This

Every other rack planner is either expensive, complicated, or requires you to create an account just to move a rectangle around. We wanted something simple. You get in, you drag your stuff, you export it, you're done. That's the whole thing.

It ends with "arr" because it makes rhyming easier.

## What It Do

- **Drag and drop devices** into your rack like a normal person
- **Real device images** so it actually looks like your gear, not sad grey boxes
- **Export to PNG, PDF, SVG** for your documentation or for printing and staring at
- **Runs in your browser** with no account, no server, no nonsense

## Get Started

**Use it right now:** [app.rackarr.com](https://app.rackarr.com)

**Selfhost with that boxed whale thing:**

```bash
docker run -d -p 8080:80 ghcr.io/rackarr/rackarr:latest
```

Or with Compose:

```bash
curl -O https://raw.githubusercontent.com/Rackarr/Rackarr/main/docker-compose.yml
docker compose up -d
```

Then open `http://localhost:8080` and get after it.

**Build from source:**

```bash
git clone https://github.com/Rackarr/Rackarr.git
cd Rackarr && npm install && npm run build
```

Serve the `dist/` folder however you like. It's just files.

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Technical Specification](docs/planning/SPEC.md)
- [Contributing Guide](CONTRIBUTING.md)

## Built With Claude

This project was built using AI-assisted development with Claude. The human did the thinking and the deciding and the "no, not like that" parts. The AI did a lot of typing. Commits with substantial AI contributions are marked with `Co-authored-by` tags because we're not going to pretend otherwise.

## Acknowledgements

Built for the [r/homelab](https://reddit.com/r/homelab) and [r/selfhosted](https://reddit.com/r/selfhosted) communities.

Device types and images ~~are stolen from~~ are compatible with the [NetBox devicetype-library](https://github.com/netbox-community/devicetype-library) because why reinvent that wheel.

## Licence

[MIT](LICENSE) - Copyright (c) 2025 Gareth Evans
