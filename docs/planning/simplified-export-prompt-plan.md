# Simplified Export - Prompt Plan

**Date:** 2025-12-05
**Spec:** simplified-export-spec.md

---

## Prompt 1: Remove bundled export types from types/index.ts

**Goal:** Clean up type definitions

**Tasks:**

1. Remove `ExportMode` type
2. Remove `BundledExportOptions` interface
3. Remove `ExportDeviceMetadata` interface
4. Remove `ExportMetadata` interface
5. Remove `exportMode` field from `ExportOptions` interface

**Files:**

- `src/lib/types/index.ts`

**Tests:** None yet - types only

---

## Prompt 2: Remove bundled export functions from export.ts

**Goal:** Remove bundled export utility functions

**Tasks:**

1. Remove `BundledExportData` interface
2. Remove `generateExportMetadata()` function
3. Remove `generateBundledExportFilename()` function
4. Remove `createBundledExport()` function
5. Remove `getImageExtension()` helper (only used by bundled)
6. Remove `slugify` import (only used by bundled)
7. Keep all other export functions intact

**Files:**

- `src/lib/utils/export.ts`

**Tests:** Will break - fix in Prompt 4

---

## Prompt 3: Simplify ExportMenu.svelte UI

**Goal:** Remove bundled export UI, simplify to single export flow

**Tasks:**

1. Remove export mode toggle (Quick/Bundled)
2. Remove "Include Source Layout" checkbox
3. Remove bundled-specific state variables
4. Simplify export handler to only do quick export
5. Clean up any bundled-related UI text/labels

**Files:**

- `src/lib/components/ExportMenu.svelte`

**Tests:** Component tests if any

---

## Prompt 4: Update App.svelte export handling

**Goal:** Remove bundled export handler from main app

**Tasks:**

1. Remove `handleBundledExport()` function
2. Remove bundled export imports (`BundledExportData`, etc.)
3. Simplify `handleExport()` to only handle single-file export
4. Remove any bundled-related state

**Files:**

- `src/App.svelte`

**Tests:** App tests if any

---

## Prompt 5: Update and clean up tests

**Goal:** Remove bundled export tests, ensure remaining tests pass

**Tasks:**

1. Remove `generateExportMetadata` describe block
2. Remove `generateBundledExportFilename` describe block
3. Remove `createBundledExport` describe block
4. Remove `BundledExportData` and related imports from test file
5. Remove `ImageStoreMap` import if no longer needed
6. Verify all remaining export tests pass
7. Run full test suite

**Files:**

- `src/tests/export.test.ts`

**Verification:**

```bash
npm run test:run -- src/tests/export.test.ts
npm run test:run
```

---

## Prompt 6: Final cleanup and verification

**Goal:** Ensure everything works, update docs

**Tasks:**

1. Run full test suite
2. Run linter
3. Run build
4. Test manually in browser (if possible)
5. Update ROADMAP.md - remove/simplify export items
6. Commit all changes

**Verification:**

```bash
npm run test:run
npm run lint
npm run build
```

---

## Summary

| Prompt | Focus                | Risk                      |
| ------ | -------------------- | ------------------------- |
| 1      | Types cleanup        | Low                       |
| 2      | Export utils cleanup | Medium - may break things |
| 3      | UI simplification    | Low                       |
| 4      | App handler cleanup  | Low                       |
| 5      | Test cleanup         | Low                       |
| 6      | Verification         | None                      |

**Total Prompts:** 6
**Estimated Complexity:** Medium (mostly deletion)
