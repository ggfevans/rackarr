# Rackarr GitHub Pages Deployment — Prompt Plan

**Created:** 2025-12-02
**Target:** GitHub Pages with GoatCounter Analytics
**Methodology:** Incremental implementation with verification at each step

---

## Overview

This prompt plan implements GitHub Pages deployment with GoatCounter analytics for Rackarr. The implementation is broken into small, verifiable steps.

### Prerequisites

Before starting:

1. GoatCounter account created at `rackarr.goatcounter.com`
2. GitHub repository exists at `github.com/ggfevans/rackarr`
3. GitHub Pages enabled in repo settings (Source: GitHub Actions)

---

## Phase 1: Build Configuration

### Prompt 1.1: Configure Vite for GitHub Pages Subpath

```text
Configure Vite for GitHub Pages subpath deployment.

CONTEXT:
- GitHub Pages serves from: https://ggfevans.github.io/rackarr/
- Assets must use relative paths with /rackarr/ base
- Current vite.config.ts has no base path configured

REQUIREMENTS:
1. Update vite.config.ts:
   - Add base: '/rackarr/' for production builds
   - Use conditional base: '/' for dev, '/rackarr/' for prod

2. Test locally:
   - Run npm run build
   - Run npm run preview
   - Verify assets load correctly at localhost

3. Verify no breaking changes to existing functionality

DO NOT:
- Change any other Vite configuration
- Modify source code
```

---

## Phase 2: Analytics Integration

### Prompt 2.1: Add GoatCounter Script to index.html

```text
Add GoatCounter analytics script to index.html.

CONTEXT:
- GoatCounter site: rackarr.goatcounter.com
- Script should only run in production
- No cookies, privacy-focused

REQUIREMENTS:
1. Add to index.html before </body>:
   <script
     data-goatcounter="https://rackarr.goatcounter.com/count"
     async
     src="//gc.zgo.at/count.js">
   </script>

2. Add noscript fallback (optional, for non-JS tracking):
   <noscript>
     <img src="https://rackarr.goatcounter.com/count?p=/rackarr/">
   </noscript>

3. Verify script doesn't block page load (async attribute)

DO NOT:
- Add cookie consent banners (not needed for GoatCounter)
- Create separate analytics module (keep it simple)
```

### Prompt 2.2: Create Analytics Development Guard (Optional)

```text
Create utility to prevent analytics in development mode.

CONTEXT:
- GoatCounter script is in index.html (always loads)
- Want to prevent dev visits from skewing stats
- GoatCounter respects localhost by default, but be explicit

REQUIREMENTS:
1. GoatCounter automatically ignores localhost, but verify this behavior

2. Optionally add to index.html script:
   <script>
     // Disable GoatCounter in development
     if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
       window.goatcounter = { no_onload: true };
     }
   </script>
   (Place BEFORE the GoatCounter script)

3. Test:
   - Run npm run dev
   - Check browser console for GoatCounter activity
   - Verify no requests to goatcounter.com in dev

DO NOT:
- Over-engineer this - GoatCounter handles localhost already
- Create complex analytics abstraction
```

---

## Phase 3: SPA Routing Support

### Prompt 3.1: Add 404.html for GitHub Pages SPA Support

```text
Create 404.html to handle direct navigation in SPA.

CONTEXT:
- GitHub Pages returns 404 for non-root paths
- Rackarr is SPA but currently has no client-side routing
- Adding this for future-proofing and best practice

REQUIREMENTS:
1. Create public/404.html:
   - Redirect to index.html preserving the path
   - Use sessionStorage to pass original URL
   - Keep it minimal

2. Add redirect handler to index.html <head>:
   - Check sessionStorage for redirect
   - Update browser history with original URL
   - Clean up sessionStorage

3. Test:
   - Build and preview
   - Navigate directly to /rackarr/some-path
   - Should load app without 404 error

NOTE: This is defensive - Rackarr doesn't use routes yet, but it's
a common GitHub Pages pattern worth implementing.

DO NOT:
- Add client-side routing library
- Change existing navigation behavior
```

---

## Phase 4: GitHub Actions Deployment

### Prompt 4.1: Create GitHub Actions Deployment Workflow

```text
Create GitHub Actions workflow for deploying to GitHub Pages.

CONTEXT:
- Repository: github.com/ggfevans/rackarr
- Deploy on push to main branch
- Use official GitHub Pages actions

REQUIREMENTS:
1. Create .github/workflows/deploy.yml:
   - Trigger on push to main
   - Allow manual trigger (workflow_dispatch)
   - Use Node.js 20
   - Run: npm ci, npm run build
   - Deploy dist/ to GitHub Pages

2. Include proper permissions:
   - contents: read
   - pages: write
   - id-token: write

3. Use concurrency to prevent parallel deployments

4. Use these actions:
   - actions/checkout@v4
   - actions/setup-node@v4
   - actions/upload-pages-artifact@v3
   - actions/deploy-pages@v4

DO NOT:
- Add test steps to this workflow (keep deployment fast)
- Use third-party deployment actions
- Deploy from a branch (use artifacts)
```

---

## Phase 5: Testing & Verification

### Prompt 5.1: Test Local Build for GitHub Pages

```text
Verify the build works correctly for GitHub Pages deployment.

REQUIREMENTS:
1. Run full test suite:
   npm run test:run
   npm run build

2. Preview the production build:
   npm run preview

3. Verify in browser:
   - App loads without errors
   - All assets load (check Network tab)
   - No 404 errors in console
   - App functionality works (create rack, add device, save, export)

4. Check GoatCounter script:
   - Script tag present in built HTML
   - Script loads (check Network tab in preview)
   - No console errors from GoatCounter

5. Document any issues found

DO NOT:
- Deploy yet (that's the next prompt)
- Make changes unless tests fail
```

### Prompt 5.2: Deploy to GitHub Pages

```text
Push to GitHub and trigger deployment.

CONTEXT:
- GitHub Actions workflow is ready
- Build has been tested locally
- GitHub Pages is configured in repo settings

REQUIREMENTS:
1. Ensure GitHub remote is configured:
   git remote -v
   # Should show github.com/ggfevans/rackarr

2. Push to GitHub:
   git push github main

3. Monitor deployment:
   - Go to GitHub repo > Actions tab
   - Watch the "Deploy to GitHub Pages" workflow
   - Verify it completes successfully

4. Verify live site:
   - Visit https://ggfevans.github.io/rackarr/
   - Test all major features
   - Check browser console for errors
   - Verify assets load correctly

5. Verify analytics:
   - Visit the site a few times
   - Check https://rackarr.goatcounter.com
   - Verify visits are being recorded

DO NOT:
- Force push
- Skip verification steps
```

---

## Phase 6: Documentation

### Prompt 6.1: Update Project Documentation

```text
Update documentation to reflect GitHub Pages deployment.

REQUIREMENTS:
1. Update CLAUDE.md:
   - Add "Live Demo" link to GitHub Pages URL
   - Add deployment command documentation

2. Update README.md (if it exists) or create minimal one:
   - Add live demo link
   - Add badge for GitHub Pages deployment status

3. Add deployment notes to docs/planning/:
   - How to trigger manual deployment
   - How to check analytics
   - Rollback procedure

DO NOT:
- Create extensive new documentation
- Change existing feature documentation
```

---

## Execution Notes

### Order of Execution

Execute prompts in order: 1.1 → 2.1 → 2.2 → 3.1 → 4.1 → 5.1 → 5.2 → 6.1

### Commit Strategy

Commit after each prompt:

- 1.1: `build: configure Vite base path for GitHub Pages`
- 2.1: `feat: add GoatCounter analytics`
- 2.2: `feat: add analytics development guard` (if implemented)
- 3.1: `feat: add 404.html for SPA routing support`
- 4.1: `ci: add GitHub Actions deployment workflow`
- 5.1: (no commit, just verification)
- 5.2: (deployment trigger, no code changes)
- 6.1: `docs: add deployment documentation`

### Rollback

If deployment fails:

1. Check GitHub Actions logs for errors
2. Fix issues locally
3. Push fix and redeploy
4. If urgent, can disable Pages in repo settings

### Prerequisites Checklist

Before starting implementation:

- [ ] Create GoatCounter account at goatcounter.com/signup
- [ ] Site code: `rackarr`
- [ ] Verify GitHub repo exists and you have push access
- [ ] Enable GitHub Pages in repo Settings > Pages > Source: GitHub Actions

---

## Success Criteria

Deployment is successful when:

1. Site accessible at `https://ggfevans.github.io/rackarr/`
2. All features work (create, edit, save, load, export)
3. No console errors
4. GoatCounter dashboard shows visits
5. Automated deployment triggers on push to main
