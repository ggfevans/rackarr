# Refactor: Remove V02 Suffix from Types

## Overview

Remove the unnecessary "V02" suffix from all type and schema names. The versioning is implicit in the codebase structure and doesn't need to be in the type names.

## Architecture Context

There are TWO type systems in the codebase:

1. **V02 Types** (`src/lib/types/v02.ts`) - The canonical data model:
   - Used for serialization (YAML)
   - Internal state management
   - NetBox-compatible structure with snake_case

2. **Legacy Types** (`src/lib/types/index.ts`) - Compatibility layer:
   - Used by some components via layout store's compatibility getters
   - Different structure (e.g., `Device.id` vs `DeviceType.slug`)
   - Export-related types (ExportOptions, etc.)

The layout store maps V02 → Legacy for component consumption.

## Scope

### Types to Rename (src/lib/types/v02.ts)

| Current Name                   | New Name                    | Notes                                                        |
| ------------------------------ | --------------------------- | ------------------------------------------------------------ |
| DeviceTypeV02                  | DeviceType                  | Template/library entry                                       |
| DeviceV02                      | PlacedDevice                | Placed instance in rack (avoids conflict with legacy Device) |
| LayoutV02                      | ProjectLayout               | Main layout structure (avoids conflict with legacy Layout)   |
| RackV02                        | RackData                    | Rack structure (avoids conflict with legacy Rack)            |
| DeviceFaceV02                  | DeviceFace                  | Already exists in index.ts - keep V02 version                |
| AirflowV02                     | Airflow                     | Already exists in index.ts - merge                           |
| WeightUnitV02                  | WeightUnit                  | Already exists in index.ts - keep V02 version                |
| LayoutSettingsV02              | ProjectSettings             | Settings structure                                           |
| CreateRackDataV02              | CreateRackInput             | Helper type                                                  |
| CreateDeviceTypeDataV02        | CreateDeviceTypeInput       | Helper type                                                  |
| DisplayModeV02                 | DisplayMode                 | Already exists - keep V02 version                            |
| RackarrDeviceTypeExtensionsV02 | RackarrDeviceTypeExtensions | Extensions                                                   |

### Schemas to Rename (src/lib/schemas/v02.ts)

Remove V02 suffix from all schemas:

| Current Name               | New Name                |
| -------------------------- | ----------------------- |
| SlugSchemaV02              | SlugSchema              |
| DeviceCategorySchemaV02    | DeviceCategorySchema    |
| FormFactorSchemaV02        | FormFactorSchema        |
| AirflowSchemaV02           | AirflowSchema           |
| DeviceFaceSchemaV02        | DeviceFaceSchema        |
| WeightUnitSchemaV02        | WeightUnitSchema        |
| RackarrExtensionsSchemaV02 | RackarrExtensionsSchema |
| DeviceTypeSchemaV02        | DeviceTypeSchema        |
| DeviceSchemaV02            | PlacedDeviceSchema      |
| RackSchemaV02              | RackDataSchema          |
| LayoutSettingsSchemaV02    | ProjectSettingsSchema   |
| LayoutSchemaV02            | ProjectLayoutSchema     |
| DisplayModeSchemaV02       | DisplayModeSchema       |

### Files - Keep Same Names But Update Content

Files will NOT be renamed to avoid breaking imports. Just update the content:

- `src/lib/types/v02.ts` - Update type names
- `src/lib/schemas/v02.ts` - Update schema names
- Test files - Update references

### Legacy Types (src/lib/types/index.ts)

Keep as-is for now - they serve the compatibility layer and export functionality.

---

## Prompt Plan

### Prompt 1: Rename Type File and Update Type Names

1. Rename `src/lib/types/v02.ts` to `src/lib/types/layout.ts`
2. Update all type names to remove V02 suffix
3. Update the barrel export in `src/lib/types/index.ts`

### Prompt 2: Rename Schema File and Update Schema Names

1. Rename `src/lib/schemas/v02.ts` to `src/lib/schemas/layout.ts`
2. Update all schema names to remove V02 suffix
3. Update any barrel exports

### Prompt 3: Update All Imports - Stores

Update imports in:

- `src/lib/stores/layout.svelte.ts`
- `src/lib/stores/commands/*.ts`
- Other store files

### Prompt 4: Update All Imports - Components

Update imports in all component files that reference V02 types.

### Prompt 5: Update All Imports - Utils

Update imports in utility files:

- `src/lib/utils/serialization-v02.ts` → rename to `serialization.ts`
- `src/lib/utils/migrate-v02.ts`
- Other utility files

### Prompt 6: Update Test Files

1. Rename test files
2. Update type references in tests
3. Run tests to verify

### Prompt 7: Resolve Legacy Type Conflicts

Review `src/lib/types/index.ts` and either:

- Remove duplicate legacy types
- Create compatibility layer
- Update components using legacy types

### Prompt 8: Final Cleanup

1. Search for any remaining V02 references
2. Update documentation
3. Run full test suite

---

## Implementation Notes

- Use IDE refactoring or find-replace with care
- Run tests after each prompt
- The legacy types in `index.ts` may still be used by some components - need to check before removing
