# Rackarr GitHub Pages Deployment Specification

**Version:** 1.0
**Created:** 2025-12-02
**Status:** Draft

---

## 1. Overview

Deploy Rackarr to GitHub Pages with privacy-focused analytics to track basic usage metrics.

### 1.1 Goals

- Host Rackarr publicly at `ggfevans.github.io/rackarr`
- Track basic usage: page views, unique visitors, referrers, device/browser stats
- Zero ongoing cost
- Privacy-focused: no cookies, no tracking scripts that require consent
- Automated deployment on push to main branch

### 1.2 Non-Goals

- Custom domain setup (future consideration)
- Feature-level analytics (which buttons clicked)
- Error/crash reporting
- User session tracking or flows

---

## 2. Technology Choices

### 2.1 Hosting: GitHub Pages

- **URL:** `https://ggfevans.github.io/rackarr`
- **Source:** GitHub mirror repository (`github.com/ggfevans/rackarr`)
- **Deployment:** GitHub Actions workflow
- **Branch Strategy:** Deploy from `gh-pages` branch (built artifacts)

### 2.2 Analytics: GoatCounter

**Why GoatCounter:**

- Free for personal/non-commercial projects
- No cookies - doesn't require consent banner
- Privacy-focused by design
- Simple integration (single script tag)
- Provides all basic metrics needed
- Open source

**GoatCounter Features:**

- Page views and unique visitors
- Referrer tracking
- Browser and device statistics
- Geographic data (country-level, from IP, not stored)
- Campaign tracking via URL parameters
- Public or private dashboard option

**Account Setup:**

- Sign up at: `https://www.goatcounter.com/signup`
- Site code: `rackarr` (resulting in `rackarr.goatcounter.com`)
- Dashboard: `https://rackarr.goatcounter.com`

---

## 3. Architecture

### 3.1 Deployment Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Push to main   │────▶│  GitHub Actions  │────▶│  GitHub Pages   │
│  (primary repo) │     │  - Build Vite    │     │  gh-pages branch│
└─────────────────┘     │  - Deploy        │     └─────────────────┘
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Sync to GitHub  │
                        │  mirror (manual  │
                        │  or automated)   │
                        └──────────────────┘
```

### 3.2 Analytics Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  User visits    │────▶│  Page loads      │────▶│  GoatCounter    │
│  rackarr site   │     │  analytics.js    │     │  receives ping  │
└─────────────────┘     │  (async, defer)  │     └─────────────────┘
                        └──────────────────┘              │
                                                          ▼
                                                  ┌─────────────────┐
                                                  │  Dashboard at   │
                                                  │  rackarr.       │
                                                  │  goatcounter.com│
                                                  └─────────────────┘
```

---

## 4. Implementation Details

### 4.1 Vite Configuration for GitHub Pages

Update `vite.config.ts` for subpath deployment:

```typescript
export default defineConfig({
	base: '/rackarr/' // Required for GitHub Pages subpath
	// ... existing config
});
```

### 4.2 GoatCounter Integration

Add script to `index.html` (before closing `</body>`):

```html
<script
	data-goatcounter="https://rackarr.goatcounter.com/count"
	async
	src="//gc.zgo.at/count.js"
></script>
```

**Script Attributes:**

- `data-goatcounter`: Endpoint for the specific site
- `async`: Non-blocking load
- `src`: GoatCounter's minimal tracking script (~1.5KB)

### 4.3 GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch: # Allow manual trigger

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### 4.4 SPA Routing Support

GitHub Pages doesn't natively support SPA routing. For Rackarr (single-page app), add a 404.html that redirects to index.html:

Create `public/404.html`:

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<title>Rackarr</title>
		<script>
			// Redirect to index.html with the path as a query parameter
			// This handles direct navigation to SPA routes
			sessionStorage.redirect = location.href;
			location.replace(location.pathname.split('/').slice(0, -1).join('/') + '/');
		</script>
	</head>
	<body></body>
</html>
```

Add redirect handler to `index.html` (in `<head>`):

```html
<script>
	(function () {
		var redirect = sessionStorage.redirect;
		delete sessionStorage.redirect;
		if (redirect && redirect !== location.href) {
			history.replaceState(null, null, redirect);
		}
	})();
</script>
```

**Note:** Rackarr currently has no client-side routing, so this may not be strictly necessary, but it's good practice for future-proofing.

---

## 5. Environment Configuration

### 5.1 Environment Variables

No secrets required for GoatCounter (public script).

For conditional analytics (dev vs prod):

```typescript
// In analytics utility
const isProduction = import.meta.env.PROD;
const GOATCOUNTER_URL = 'https://rackarr.goatcounter.com/count';

export function initAnalytics() {
	if (!isProduction) {
		console.log('[Analytics] Disabled in development');
		return;
	}
	// Load GoatCounter script dynamically or rely on static script tag
}
```

### 5.2 Development Mode

Analytics should NOT run in development:

- GoatCounter script only loads in production build
- Use environment check to skip in dev mode

---

## 6. Repository Sync Strategy

### 6.1 Current Setup

- **Primary:** `git.falcon-wahoe.ts.net/ggfevans/rackarr`
- **Mirror:** `github.com/ggfevans/rackarr`

### 6.2 Sync Options

**Option A: Manual Push (Recommended for simplicity)**

```bash
# Add GitHub as remote
git remote add github git@github.com:ggfevans/rackarr.git

# Push to GitHub
git push github main
```

**Option B: Automated Mirror (via primary repo CI)**

- Primary repo CI pushes to GitHub on successful build
- Requires SSH key or token setup

**Recommendation:** Start with manual push, automate later if needed.

---

## 7. Testing Strategy

### 7.1 Pre-Deployment Tests

Before deploying:

1. `npm run build` succeeds
2. `npm run test:run` passes
3. `npm run test:e2e` passes
4. Preview build locally: `npm run preview`

### 7.2 Post-Deployment Verification

After deployment:

1. Site loads at `https://ggfevans.github.io/rackarr`
2. All features work (create rack, add device, save/load, export)
3. GoatCounter dashboard shows visits
4. No console errors
5. Assets load correctly (check Network tab)

---

## 8. Rollback Strategy

If deployment fails or introduces issues:

1. GitHub Pages allows reverting to previous deployment via Actions UI
2. Can also manually deploy a previous commit
3. GoatCounter can be disabled by removing script tag

---

## 9. Metrics to Monitor

### 9.1 GoatCounter Dashboard

- **Daily/Weekly/Monthly visitors:** Track growth
- **Referrers:** Where traffic comes from
- **Top pages:** Should be mostly `/rackarr/` (main app)
- **Browsers:** Ensure compatibility with major browsers
- **Countries:** Geographic distribution

### 9.2 Success Criteria

- Site is accessible and functional
- Analytics are recording visits
- No privacy-invasive tracking

---

## 10. Future Considerations

### 10.1 Potential Enhancements

- Custom domain (`rackarr.dev` or similar)
- Feature usage tracking (opt-in, privacy-preserving)
- Error reporting (Sentry free tier)
- Performance monitoring (Lighthouse CI)

### 10.2 Not Planned

- User accounts or authentication
- Server-side functionality
- Database storage

---

## 11. Security Considerations

### 11.1 Content Security Policy

Consider adding CSP headers via `_headers` file:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' gc.zgo.at; connect-src 'self' *.goatcounter.com
```

### 11.2 No Sensitive Data

- Rackarr is a client-side only app
- All data stored locally in browser
- No user data transmitted except anonymous analytics

---

## Appendix A: GoatCounter Account Setup

1. Go to https://www.goatcounter.com/signup
2. Enter:
   - Site code: `rackarr`
   - Email: (your email)
   - Password: (create one)
3. Verify email
4. Dashboard available at: `https://rackarr.goatcounter.com`
5. Get tracking code from Settings > Tracking Code

---

## Appendix B: GitHub Pages Setup

1. Go to GitHub repo Settings > Pages
2. Source: GitHub Actions
3. No branch selection needed (Actions handles it)
4. Custom domain: Leave blank (use default)
5. Enforce HTTPS: Enable

---

## Appendix C: File Changes Summary

| File                           | Change                              |
| ------------------------------ | ----------------------------------- |
| `vite.config.ts`               | Add `base: '/rackarr/'`             |
| `index.html`                   | Add GoatCounter script              |
| `public/404.html`              | Create for SPA routing              |
| `.github/workflows/deploy.yml` | Create deployment workflow          |
| `src/lib/utils/analytics.ts`   | Create analytics utility (optional) |
