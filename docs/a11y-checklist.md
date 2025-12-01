# Rackarr Accessibility Checklist

This document tracks accessibility compliance for the Rackarr application.

## ARIA Labels

- [x] All toolbar buttons have `aria-label` or visible text
- [x] All form inputs have associated labels (via `for`/`id` or `aria-label`)
- [x] All images have alt text (SVGs use `aria-label` or `aria-hidden`)
- [x] All dialogs have `aria-labelledby` pointing to title
- [x] All close buttons have `aria-label`
- [x] All interactive SVG elements have appropriate roles

## Focus Management

- [x] Focus order is logical (follows DOM order)
- [x] Focus indicators are visible (custom focus-visible styles)
- [x] Focus trap implemented for modal dialogs
- [x] Focus returns to trigger element when dialog closes

## Keyboard Navigation

- [x] All interactive elements are keyboard accessible
- [x] Escape key closes dialogs
- [x] Tab key navigates between focusable elements
- [x] Enter/Space activates buttons and links

## Visual Design

- [ ] Color is not the sole indicator of state (verified in 4.4)
- [ ] Contrast ratios meet WCAG AA (verified in 4.4)
- [ ] Reduced motion preference is respected (implemented in 6.2)

## Component Checklist

### Toolbar (`Toolbar.svelte`)

- [x] Library toggle: `aria-label`, `aria-expanded`, `aria-controls`
- [x] All action buttons: `aria-label` via `ToolbarButton`
- [x] Separators: `aria-hidden="true"`

### ToolbarButton (`ToolbarButton.svelte`)

- [x] `aria-label` from `label` prop
- [x] `aria-pressed` for toggle states
- [x] `aria-expanded` for expandable buttons
- [x] `disabled` attribute properly applied

### Dialog (`Dialog.svelte`)

- [x] `role="dialog"`
- [x] `aria-modal="true"`
- [x] `aria-labelledby` linked to title
- [x] Close button: `aria-label="Close dialog"`
- [x] Close icon: `aria-hidden="true"`
- [x] Focus trap via `use:trapFocus`
- [x] Focus management via `createFocusManager()`

### Drawer (`Drawer.svelte`)

- [x] `aria-label` matching title
- [x] `aria-hidden` when closed

### DrawerHeader (`DrawerHeader.svelte`)

- [x] Close button: `aria-label="Close drawer"`
- [x] Close icon: `aria-hidden="true"`

### DevicePalette (`DevicePalette.svelte`)

- [x] Search input: `aria-label="Search devices"`
- [x] File input: `aria-label="Import device library file"`
- [x] Import button: `aria-label="Import device library"`
- [x] Add device button: visible text label

### EditPanel (`EditPanel.svelte`)

- [x] Rack name input: `<label for="rack-name">`
- [x] Rack height input: `<label for="rack-height">`
- [x] Delete rack button: `aria-label="Delete rack"`
- [x] Remove device button: `aria-label="Remove from rack"`
- [x] Face selector: `<fieldset aria-label="Mounted face">`

### Canvas (`Canvas.svelte`)

- [x] `role="application"`
- [x] `aria-label="Rack layout canvas"`

### Rack (`Rack.svelte`)

- [x] Container: `role="option"`, `aria-selected`, `tabindex="0"`
- [x] SVG: `role="img"`, `aria-label` with rack name and details

### RackDevice (`RackDevice.svelte`)

- [x] Drag handle: `role="button"`, `aria-label`, `aria-pressed`, `tabindex="0"`

## Testing

Automated tests for ARIA attributes are in:

- `src/tests/AriaAudit.test.ts` - Comprehensive ARIA audit
- `src/tests/DialogA11y.test.ts` - Dialog accessibility
- `src/tests/focus.test.ts` - Focus management utilities

## Manual Testing Recommendations

1. **Screen Reader Testing**: Test with VoiceOver (macOS), NVDA (Windows), or Orca (Linux)
2. **Keyboard Navigation**: Navigate entire app using only keyboard
3. **High Contrast Mode**: Test in Windows High Contrast Mode
4. **Zoom Testing**: Test at 200% browser zoom
5. **Mobile Screen Reader**: Test with TalkBack (Android) or VoiceOver (iOS)
