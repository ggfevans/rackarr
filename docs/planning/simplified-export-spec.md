# Simplified Export Spec

**Date:** 2025-12-05
**Status:** Draft
**Goal:** Simplify export to KISS principle - remove bundled export complexity

---

## Problem Statement

Current export has two modes:

1. **Quick Export** - Single image file (PNG/JPG/SVG)
2. **Bundled Export** - ZIP containing multiple formats + metadata.json + source.rackarr.zip

This is confusing because:

- Both "Save" and "Export Bundle" produce `.rackarr.zip` files
- Bundled export nests a source file inside (unnecessary complexity)
- `metadata.json` solves a problem nobody has
- Users don't understand when to use which option

---

## Solution

Remove bundled export entirely. Two simple actions:

| Action              | Output            | Use Case               |
| ------------------- | ----------------- | ---------------------- |
| **Save** (Ctrl+S)   | `.rackarr.zip`    | Continue working later |
| **Export** (Ctrl+E) | Single image file | Share/document rack    |

### Export Options (Simplified)

```
Format:     [PNG] [JPEG] [SVG]
Background: [Dark] [Light] [Transparent*]
View:       [Front] [Rear] [Both]
□ Include rack name
□ Include legend

[Export]
```

\*Transparent only available for PNG/SVG

### Removed Features

1. ~~Export Mode toggle (Quick/Bundled)~~
2. ~~Include Source Layout checkbox~~
3. ~~metadata.json generation~~
4. ~~Multi-format ZIP bundle~~
5. ~~BundledExportOptions interface~~
6. ~~ExportDeviceMetadata interface~~
7. ~~ExportMetadata interface~~

### If User Wants Multiple Formats

Export multiple times. This is acceptable because:

- Most users want one format
- Exporting is fast (< 1 second)
- Reduces UI complexity significantly

---

## File Changes

### Remove

1. `ExportMode` type from `src/lib/types/index.ts`
2. `BundledExportOptions` interface
3. `ExportDeviceMetadata` interface
4. `ExportMetadata` interface
5. `BundledExportData` interface from `src/lib/utils/export.ts`
6. `generateExportMetadata()` function
7. `generateBundledExportFilename()` function
8. `createBundledExport()` function
9. Bundled export UI in `ExportMenu.svelte`
10. Related tests

### Keep

1. `ExportFormat` type (png | jpeg | svg | pdf)
2. `ExportScope` type (all | selected) - keep for future multi-rack
3. `ExportBackground` type (dark | light | transparent)
4. `ExportView` type (front | rear | both)
5. `ExportOptions` interface (simplified)
6. `generateExportSVG()` function
7. `exportAsSVG()`, `exportAsPNG()`, `exportAsJPEG()` functions
8. `downloadBlob()` function
9. `generateExportFilename()` function

### Modify

1. `ExportOptions` interface - remove `exportMode` field
2. `ExportMenu.svelte` - remove bundled mode UI
3. `App.svelte` - remove bundled export handler

---

## Updated ExportOptions Interface

```typescript
export interface ExportOptions {
	/** Output format */
	format: ExportFormat;
	/** Which racks to include */
	scope: ExportScope;
	/** Include rack names in export */
	includeNames: boolean;
	/** Include device legend */
	includeLegend: boolean;
	/** Background style */
	background: ExportBackground;
	/** Which view(s) to export */
	exportView?: ExportView;
}
```

---

## UI Changes

### Before (Complex)

```
Export Mode: [Quick Export] [Bundled Export]

--- Quick Export ---
Format: [PNG]
...

--- Bundled Export ---
□ Include Source Layout
Format: [PNG] (primary)
...
```

### After (Simple)

```
Format:     [PNG] [JPEG] [SVG]
Background: [Dark] [Light] [Transparent]
View:       [Front] [Rear] [Both]
□ Include rack name
□ Include legend

[Export]
```

---

## Test Changes

### Remove Tests

- `generateExportMetadata` tests
- `generateBundledExportFilename` tests
- `createBundledExport` tests
- Any bundled export related tests

### Keep Tests

- `generateExportSVG` tests
- `exportAsSVG` tests
- `exportAsPNG` / `exportAsJPEG` function existence tests
- `downloadBlob` tests
- `generateExportFilename` tests
- Device positioning tests
- Dual-view export tests
- Legend tests

---

## Migration

No migration needed - bundled exports were never persisted. Users who created bundled exports just have ZIP files with images they can still use.

---

## Success Criteria

1. Export menu shows single, simple interface
2. User can export to PNG, JPEG, or SVG with one click
3. No "bundled" terminology anywhere in UI
4. All export tests pass
5. Code is simpler (fewer types, fewer functions)
