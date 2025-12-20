# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.9] - 2025-12-20

### Added

- Device palette search with keyboard navigation and highlighting (#13)
- Notes field for racks in edit panel
- localStorage auto-save for session persistence (#85)
- Mobile view UI with touch gestures and viewport detection (#85)
- Shareable layout links via URL (#89)
- NetBox device import automation (#106)
- Ubiquiti brand pack device images (#6)
- Visual environment indicator in titlebar (#69)
- GitHub Issue Types and size label automation (#81)

### Changed

- Redesigned device edit panel UX (#12)
- Reduced visual noise in EditPanel (#11)
- Standardized mobile breakpoint to 1024px (#85)
- Migrated test environment from jsdom to happy-dom (#79)
- Improved mobile toolbar UX with hamburger menu (#85)
- Starter library now loads as runtime constant (#100)

### Fixed

- PlacedDevice UUID generation now uses generateId() (#114)
- App test stability for CI
- Share link crypto.randomUUID error
- File picker dialog race conditions (#45)
- Orphaned image cleanup for memory leaks (#46)
- Device auto-import reactivity (#43)
- Export preview error messages (#44)
- Rectangular mounting holes on rack rails (#18)
- Device images extend past rack rails for realism (#9)

### Security

- XSS defense measures and documentation
- Explicit permissions for GitHub workflows (CWE-275)

### Technical

- Comprehensive test coverage expansion
- Docker caching and CI workflow optimization (#77)
- Pre-commit hooks optimization (#76, #78)
- Documentation reorganization with ARCHITECTURE.md (#26)

## [0.2.1] - 2025-12-01

### Added

- WCAG AA accessibility compliance with ARIA audit
- Color contrast verification utilities
- Animation keyframes system (device-settle, drawer, toast, dialog, shake)
- Reduced motion support (CSS + JavaScript utilities)
- 5th U number highlighting for easier rack unit reading
- Tabular figures and monospace font for U numbers
- Comprehensive accessibility test suite

### Changed

- Design tokens system consolidated in `src/lib/styles/tokens.css`
- Edit panel visual hierarchy improved
- Form inputs consistent styling

### Technical

- Test suite expanded to 1043 tests
- Added accessibility checklist documentation

## [0.2.0] - 2025-11-30

### Added

- Front/rear rack view toggle with device face filtering
- Device face assignment (front, rear, or both)
- Fit All zoom button with F keyboard shortcut
- Rack duplication with Ctrl/Cmd+D shortcut
- Device library import from JSON files
- Layout migration from v0.1 to v0.2

### Changed

- Device Library toggle button replaces branding in toolbar
- Rack titles now positioned above racks (not below)
- Device icons vertically centered in rack slots
- Help panel shows only GitHub link

### Fixed

- Coordinate calculations now use getScreenCTM() for better zoom/pan handling
- Drag-and-drop works correctly at all zoom levels and pan positions

### Technical

- Integrated panzoom library for smooth canvas zoom/pan
- Added comprehensive test coverage (793 tests)

## [0.1.1] - 2025-12-01

### Changed

- Rescoped to single-rack editing for v0.1 stability
- Multi-rack support deferred to v0.3
- Removed rack reordering UI (drag handles)
- Simplified canvas layout for single rack (centered)

### Added

- Save-first confirmation dialog when replacing rack
- Warning toast when loading multi-rack files
- E2E tests for single-rack behavior

### Removed

- Multi-rack canvas display (deferred to v0.3)
- Cross-rack device moves (deferred to v0.3)
- Rack reordering controls (deferred to v0.3)

## [0.1.0] - 2025-11-28

### Added

- Initial release of Rackarr
- Visual rack editor with SVG rendering
- Support for up to 6 racks (1U-100U height)
- Drag-and-drop device placement from palette
- Device movement within and between racks
- Collision detection and prevention
- Starter device library with 23 common devices
- Custom device creation with category colors
- Edit panel for rack and device properties
- Dark and light theme support
- Keyboard shortcuts for all actions
- Save/load layouts as JSON files
- Export to PNG, JPEG, SVG, and PDF
- Session auto-save to browser storage
- Help panel with keyboard shortcuts reference
- Docker deployment configuration
- Comprehensive test suite (unit, component, E2E)
