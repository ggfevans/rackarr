# Airflow Visualization - Prompt Plan

**Spec:** `docs/planning/spec-airflow-visualization.md`
**Target:** v0.5.0

---

## Prompts

### 1. Schema and Types

- [ ] Add `airflow` field to `LibraryDevice` interface in `src/lib/types/index.ts`
- [ ] Verify `Airflow` type is exported from schemas
- [ ] Write tests for default value behavior (undefined → 'passive')

### 2. UI Store

- [ ] Add `airflowMode: boolean` to UI store (`src/lib/stores/ui.svelte.ts`)
- [ ] Add `toggleAirflowMode()` function
- [ ] Write tests for toggle behavior

### 3. Design Tokens

- [ ] Add airflow color tokens to `src/lib/styles/tokens.css`:
  - `--colour-airflow-intake`
  - `--colour-airflow-exhaust`
  - `--colour-airflow-passive`
  - `--colour-airflow-conflict`

### 4. AddDeviceForm

- [ ] Add airflow dropdown field after Category, before Notes
- [ ] Default to 'passive'
- [ ] Write tests for form field

### 5. IconWind Component

- [ ] Create `src/lib/components/icons/IconWind.svelte`
- [ ] Simple wind/airflow icon for toolbar

### 6. Toolbar Toggle

- [ ] Add airflow toggle button to `Toolbar.svelte`
- [ ] Add to `ToolbarDrawer.svelte` for mobile
- [ ] Write tests for button behavior

### 7. Keyboard Shortcut

- [ ] Add `A` key binding to `KeyboardHandler.svelte`
- [ ] Update Help panel with new shortcut
- [ ] Write tests for keyboard toggle

### 8. AirflowIndicator Component

- [ ] Create `src/lib/components/AirflowIndicator.svelte`
- [ ] SVG arrows for each airflow type
- [ ] Marching animation CSS
- [ ] `prefers-reduced-motion` support
- [ ] Props: `airflow`, `view` ('front' | 'rear'), `isIntake`
- [ ] Write tests for indicator rendering

### 9. Device Integration

- [ ] Modify `Device.svelte` to render `AirflowIndicator` when mode active
- [ ] Pass view type (front/rear) for correct intake/exhaust display
- [ ] Write tests for conditional rendering

### 10. Conflict Detection

- [ ] Create utility function to detect adjacent conflicting devices
- [ ] Create `src/lib/components/AirflowConflict.svelte` for conflict indicator
- [ ] Write tests for conflict detection logic

### 11. Rack Integration

- [ ] Modify `Rack.svelte` to render `AirflowConflict` between conflicting devices
- [ ] Write tests for conflict rendering

### 12. EditPanel

- [ ] Add airflow field to device edit in `EditPanel.svelte`
- [ ] Write tests for edit functionality

### 13. Layout Store

- [ ] Ensure `airflow` field is persisted when saving device library
- [ ] Ensure `airflow` field is loaded from archive
- [ ] Write tests for persistence

### 14. Export Support

- [ ] Include airflow indicators in SVG export when mode enabled
- [ ] Write tests for export with airflow

### 15. Final Polish

- [ ] E2E test: create device with airflow, toggle mode, verify display
- [ ] E2E test: place conflicting devices, verify conflict indicator
- [ ] Update CLAUDE.md with v0.5.0 changes
- [ ] Manual testing and visual review

---

## Notes

- Follow TDD: write tests first, then implement
- Don't version bump until feature complete
- Spec reference: `docs/planning/spec-airflow-visualization.md`
