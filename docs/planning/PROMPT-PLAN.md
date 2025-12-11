# Rackarr Development Prompt Plan

**Created:** 2025-12-11
**Updated:** 2025-12-11
**Feature:** Starter Library Rationalization

---

## Overview

This document contains prompts for implementing the starter library rationalization in a test-driven, incremental manner. Each prompt builds on the previous ones, ensuring no orphaned code and continuous integration.

### Implementation Principles

1. **TDD Protocol**: Write tests first, then implement to pass
2. **Incremental Progress**: Small, focused changes that build on each other
3. **No Big Jumps**: Each step is testable and verifiable
4. **Integration First**: Wire up changes immediately after implementation

### Changes Summary

From research in `docs/planning/research/starter-library-rationalization.md`:

**Add (6 items):** 8-Port Switch, 24-Port Switch, 48-Port Switch, 1U Storage, 1U Brush Panel, 1U Cable Management

**Remove (5 items):** 4U Shelf, 1U Generic, 2U Generic, 0.5U Blanking Fan, 1U Router, 1U Firewall

**Rename (3 items):** 1U Switch → 1U Router/Firewall, 1U Patch Panel → 24-Port Patch Panel, 2U Patch Panel → 48-Port Patch Panel

**New Category:** `cable-management` (Steel Blue #4682B4)

---

## Phase 1: Add cable-management Category

### Prompt 1.1 — Add cable-management Category Type and Color

````text
Add the new 'cable-management' category to support cable management devices in the starter library.

**Context:**
The starter library rationalization adds "1U Brush Panel" and "1U Cable Management" devices. These need a new category since 'other' is too generic and doesn't provide meaningful grouping.

**Task:**
1. Read `src/lib/types/index.ts` to understand DeviceCategory type
2. Read `src/lib/types/constants.ts` to understand CATEGORY_COLOURS and ALL_CATEGORIES
3. Read `src/lib/schemas/index.ts` to understand DeviceCategorySchema

**Implementation (TDD):**

First, write tests in `src/tests/types.test.ts` (create if needed):

```typescript
import { describe, it, expect } from 'vitest';
import { CATEGORY_COLOURS, ALL_CATEGORIES } from '$lib/types/constants';

describe('DeviceCategory', () => {
  it('includes cable-management category', () => {
    expect(ALL_CATEGORIES).toContain('cable-management');
  });

  it('has color defined for cable-management', () => {
    expect(CATEGORY_COLOURS['cable-management']).toBeDefined();
    expect(CATEGORY_COLOURS['cable-management']).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('cable-management color is Steel Blue (#4682B4)', () => {
    expect(CATEGORY_COLOURS['cable-management']).toBe('#4682B4');
  });

  it('has 12 categories total', () => {
    expect(ALL_CATEGORIES.length).toBe(12);
  });
});
````

Then, implement the changes:

1. In `src/lib/types/index.ts`, add `'cable-management'` to `DeviceCategory` type:

   ```typescript
   export type DeviceCategory =
   	| 'server'
   	| 'network'
   	| 'patch-panel'
   	| 'power'
   	| 'storage'
   	| 'kvm'
   	| 'av-media'
   	| 'cooling'
   	| 'shelf'
   	| 'blank'
   	| 'cable-management' // NEW
   	| 'other';
   ```

2. In `src/lib/types/constants.ts`, add to `CATEGORY_COLOURS`:

   ```typescript
   'cable-management': '#4682B4',  // Steel Blue
   ```

3. In `src/lib/types/constants.ts`, add to `ALL_CATEGORIES`:

   ```typescript
   'cable-management',
   ```

4. In `src/lib/schemas/index.ts`, update `DeviceCategorySchema` if it's an enum:
   ```typescript
   export const DeviceCategorySchema = z.enum([
   	'server',
   	'network',
   	'patch-panel',
   	'power',
   	'storage',
   	'kvm',
   	'av-media',
   	'cooling',
   	'shelf',
   	'blank',
   	'cable-management',
   	'other'
   ]);
   ```

**Verification:**

1. Run `npm run test:run` — category tests pass
2. Run `npm run check` — no TypeScript errors
3. Run `npm run lint` — no lint warnings

**Acceptance Criteria:**

- [ ] DeviceCategory type includes 'cable-management'
- [ ] CATEGORY_COLOURS has '#4682B4' for cable-management
- [ ] ALL_CATEGORIES includes 'cable-management'
- [ ] Schema validates 'cable-management' as valid category
- [ ] Total of 12 categories
- [ ] All tests pass

````

---

## Phase 2: Update Starter Library Tests

### Prompt 2.1 — Write Tests for New Starter Library

```text
Write comprehensive tests for the updated starter library BEFORE making changes.

**Context:**
The starter library is changing from 26 items to a different 26 items. We need tests that verify the exact device types expected.

**Task:**
1. Read current tests in `src/tests/` for any existing starterLibrary tests
2. Read `src/lib/data/starterLibrary.ts` to understand the structure
3. Read the approved library in `docs/planning/research/starter-library-rationalization.md`

**Implementation:**

Create or update `src/tests/starterLibrary.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getStarterLibrary } from '$lib/data/starterLibrary';

describe('Starter Library', () => {
  const library = getStarterLibrary();

  describe('library size', () => {
    it('contains exactly 26 device types', () => {
      expect(library.length).toBe(26);
    });
  });

  describe('server category (3 items)', () => {
    it('includes 1U Server', () => {
      const device = library.find(d => d.model === '1U Server');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(1);
      expect(device?.rackarr.category).toBe('server');
    });

    it('includes 2U Server', () => {
      const device = library.find(d => d.model === '2U Server');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(2);
      expect(device?.rackarr.category).toBe('server');
    });

    it('includes 4U Server', () => {
      const device = library.find(d => d.model === '4U Server');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(4);
      expect(device?.rackarr.category).toBe('server');
    });
  });

  describe('network category (4 items)', () => {
    it('includes 8-Port Switch', () => {
      const device = library.find(d => d.model === '8-Port Switch');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(1);
      expect(device?.rackarr.category).toBe('network');
    });

    it('includes 24-Port Switch', () => {
      const device = library.find(d => d.model === '24-Port Switch');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(1);
      expect(device?.rackarr.category).toBe('network');
    });

    it('includes 48-Port Switch', () => {
      const device = library.find(d => d.model === '48-Port Switch');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(1);
      expect(device?.rackarr.category).toBe('network');
    });

    it('includes 1U Router/Firewall', () => {
      const device = library.find(d => d.model === '1U Router/Firewall');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(1);
      expect(device?.rackarr.category).toBe('network');
    });
  });

  describe('patch-panel category (2 items)', () => {
    it('includes 24-Port Patch Panel', () => {
      const device = library.find(d => d.model === '24-Port Patch Panel');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(1);
      expect(device?.rackarr.category).toBe('patch-panel');
    });

    it('includes 48-Port Patch Panel', () => {
      const device = library.find(d => d.model === '48-Port Patch Panel');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(2);
      expect(device?.rackarr.category).toBe('patch-panel');
    });
  });

  describe('storage category (3 items)', () => {
    it('includes 1U Storage', () => {
      const device = library.find(d => d.model === '1U Storage');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(1);
      expect(device?.rackarr.category).toBe('storage');
    });

    it('includes 2U Storage', () => {
      const device = library.find(d => d.model === '2U Storage');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(2);
      expect(device?.rackarr.category).toBe('storage');
    });

    it('includes 4U Storage', () => {
      const device = library.find(d => d.model === '4U Storage');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(4);
      expect(device?.rackarr.category).toBe('storage');
    });
  });

  describe('power category (3 items)', () => {
    it('includes 1U PDU', () => {
      const device = library.find(d => d.model === '1U PDU');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(1);
      expect(device?.rackarr.category).toBe('power');
    });

    it('includes 2U UPS', () => {
      const device = library.find(d => d.model === '2U UPS');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(2);
      expect(device?.rackarr.category).toBe('power');
    });

    it('includes 4U UPS', () => {
      const device = library.find(d => d.model === '4U UPS');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(4);
      expect(device?.rackarr.category).toBe('power');
    });
  });

  describe('kvm category (2 items)', () => {
    it('includes 1U KVM', () => {
      const device = library.find(d => d.model === '1U KVM');
      expect(device).toBeDefined();
      expect(device?.rackarr.category).toBe('kvm');
    });

    it('includes 1U Console Drawer', () => {
      const device = library.find(d => d.model === '1U Console Drawer');
      expect(device).toBeDefined();
      expect(device?.rackarr.category).toBe('kvm');
    });
  });

  describe('av-media category (2 items)', () => {
    it('includes 1U Receiver', () => {
      const device = library.find(d => d.model === '1U Receiver');
      expect(device).toBeDefined();
      expect(device?.rackarr.category).toBe('av-media');
    });

    it('includes 2U Amplifier', () => {
      const device = library.find(d => d.model === '2U Amplifier');
      expect(device).toBeDefined();
      expect(device?.rackarr.category).toBe('av-media');
    });
  });

  describe('cooling category (1 item)', () => {
    it('includes 1U Fan Panel', () => {
      const device = library.find(d => d.model === '1U Fan Panel');
      expect(device).toBeDefined();
      expect(device?.rackarr.category).toBe('cooling');
    });

    it('does NOT include 0.5U Blanking Fan (removed)', () => {
      const device = library.find(d => d.model === '0.5U Blanking Fan');
      expect(device).toBeUndefined();
    });
  });

  describe('blank category (3 items)', () => {
    it('includes 0.5U Blank', () => {
      const device = library.find(d => d.model === '0.5U Blank');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(0.5);
      expect(device?.rackarr.category).toBe('blank');
    });

    it('includes 1U Blank', () => {
      const device = library.find(d => d.model === '1U Blank');
      expect(device).toBeDefined();
      expect(device?.rackarr.category).toBe('blank');
    });

    it('includes 2U Blank', () => {
      const device = library.find(d => d.model === '2U Blank');
      expect(device).toBeDefined();
      expect(device?.rackarr.category).toBe('blank');
    });
  });

  describe('shelf category (2 items)', () => {
    it('includes 1U Shelf', () => {
      const device = library.find(d => d.model === '1U Shelf');
      expect(device).toBeDefined();
      expect(device?.rackarr.category).toBe('shelf');
    });

    it('includes 2U Shelf', () => {
      const device = library.find(d => d.model === '2U Shelf');
      expect(device).toBeDefined();
      expect(device?.rackarr.category).toBe('shelf');
    });

    it('does NOT include 4U Shelf (removed)', () => {
      const device = library.find(d => d.model === '4U Shelf');
      expect(device).toBeUndefined();
    });
  });

  describe('cable-management category (2 items)', () => {
    it('includes 1U Brush Panel', () => {
      const device = library.find(d => d.model === '1U Brush Panel');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(1);
      expect(device?.rackarr.category).toBe('cable-management');
    });

    it('includes 1U Cable Management', () => {
      const device = library.find(d => d.model === '1U Cable Management');
      expect(device).toBeDefined();
      expect(device?.u_height).toBe(1);
      expect(device?.rackarr.category).toBe('cable-management');
    });
  });

  describe('removed items', () => {
    it('does NOT include 1U Generic (removed)', () => {
      const device = library.find(d => d.model === '1U Generic');
      expect(device).toBeUndefined();
    });

    it('does NOT include 2U Generic (removed)', () => {
      const device = library.find(d => d.model === '2U Generic');
      expect(device).toBeUndefined();
    });

    it('does NOT include 1U Router (merged)', () => {
      const device = library.find(d => d.model === '1U Router');
      expect(device).toBeUndefined();
    });

    it('does NOT include 1U Firewall (merged)', () => {
      const device = library.find(d => d.model === '1U Firewall');
      expect(device).toBeUndefined();
    });

    it('does NOT include 1U Switch (renamed)', () => {
      const device = library.find(d => d.model === '1U Switch');
      expect(device).toBeUndefined();
    });
  });

  describe('slug generation', () => {
    it('generates correct slug for 1U Router/Firewall', () => {
      const device = library.find(d => d.model === '1U Router/Firewall');
      expect(device?.slug).toBe('1u-router-firewall');
    });

    it('generates correct slug for 24-Port Switch', () => {
      const device = library.find(d => d.model === '24-Port Switch');
      expect(device?.slug).toBe('24-port-switch');
    });

    it('generates correct slug for 0.5U Blank', () => {
      const device = library.find(d => d.model === '0.5U Blank');
      expect(device?.slug).toBe('0-5u-blank');
    });

    it('generates correct slug for 1U Cable Management', () => {
      const device = library.find(d => d.model === '1U Cable Management');
      expect(device?.slug).toBe('1u-cable-management');
    });
  });

  describe('all devices have required properties', () => {
    it('every device has a slug', () => {
      library.forEach(device => {
        expect(device.slug).toBeDefined();
        expect(device.slug.length).toBeGreaterThan(0);
      });
    });

    it('every device has u_height > 0', () => {
      library.forEach(device => {
        expect(device.u_height).toBeGreaterThan(0);
      });
    });

    it('every device has a category color', () => {
      library.forEach(device => {
        expect(device.rackarr.colour).toBeDefined();
        expect(device.rackarr.colour).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });
});
````

**Note:** These tests should FAIL until the implementation is complete.

**Verification:**

1. Run `npm run test:run` — tests fail (expected)
2. Confirm test file is valid TypeScript

**Acceptance Criteria:**

- [ ] Test file created with all 26 device checks
- [ ] Tests verify removed items are gone
- [ ] Tests verify renamed items
- [ ] Tests verify slug generation
- [ ] Tests fail initially (TDD)

````

---

## Phase 3: Update Starter Library Implementation

### Prompt 3.1 — Update starterLibrary.ts

```text
Update the starter library to match the approved 26-item list.

**Context:**
Tests from Prompt 2.1 are failing. Now implement the changes to make them pass.

**Task:**
1. Read failing tests from `src/tests/starterLibrary.test.ts`
2. Read current `src/lib/data/starterLibrary.ts`
3. Make changes to match approved library

**Implementation:**

Update `src/lib/data/starterLibrary.ts`:

```typescript
/**
 * Starter Device Type Library
 * Common device types pre-populated in new layouts
 */

import type { DeviceType, DeviceCategory } from '$lib/types';
import { CATEGORY_COLOURS } from '$lib/types/constants';
import { slugify } from '$lib/utils/slug';

interface StarterDeviceSpec {
  name: string;
  u_height: number;
  category: DeviceCategory;
}

const STARTER_DEVICES: StarterDeviceSpec[] = [
  // Server devices (3)
  { name: '1U Server', u_height: 1, category: 'server' },
  { name: '2U Server', u_height: 2, category: 'server' },
  { name: '4U Server', u_height: 4, category: 'server' },

  // Network devices (4)
  { name: '8-Port Switch', u_height: 1, category: 'network' },
  { name: '24-Port Switch', u_height: 1, category: 'network' },
  { name: '48-Port Switch', u_height: 1, category: 'network' },
  { name: '1U Router/Firewall', u_height: 1, category: 'network' },

  // Patch panels (2)
  { name: '24-Port Patch Panel', u_height: 1, category: 'patch-panel' },
  { name: '48-Port Patch Panel', u_height: 2, category: 'patch-panel' },

  // Storage devices (3)
  { name: '1U Storage', u_height: 1, category: 'storage' },
  { name: '2U Storage', u_height: 2, category: 'storage' },
  { name: '4U Storage', u_height: 4, category: 'storage' },

  // Power devices (3)
  { name: '1U PDU', u_height: 1, category: 'power' },
  { name: '2U UPS', u_height: 2, category: 'power' },
  { name: '4U UPS', u_height: 4, category: 'power' },

  // KVM devices (2)
  { name: '1U KVM', u_height: 1, category: 'kvm' },
  { name: '1U Console Drawer', u_height: 1, category: 'kvm' },

  // AV/Media devices (2)
  { name: '1U Receiver', u_height: 1, category: 'av-media' },
  { name: '2U Amplifier', u_height: 2, category: 'av-media' },

  // Cooling devices (1)
  { name: '1U Fan Panel', u_height: 1, category: 'cooling' },

  // Blank panels (3)
  { name: '0.5U Blank', u_height: 0.5, category: 'blank' },
  { name: '1U Blank', u_height: 1, category: 'blank' },
  { name: '2U Blank', u_height: 2, category: 'blank' },

  // Shelf devices (2)
  { name: '1U Shelf', u_height: 1, category: 'shelf' },
  { name: '2U Shelf', u_height: 2, category: 'shelf' },

  // Cable management (2)
  { name: '1U Brush Panel', u_height: 1, category: 'cable-management' },
  { name: '1U Cable Management', u_height: 1, category: 'cable-management' },
];

/**
 * Get the starter device type library
 * These are the default device types available in a new layout
 */
export function getStarterLibrary(): DeviceType[] {
  return STARTER_DEVICES.map((spec) => ({
    slug: slugify(spec.name),
    u_height: spec.u_height,
    model: spec.name,
    rackarr: {
      colour: CATEGORY_COLOURS[spec.category],
      category: spec.category
    }
  }));
}
````

**Verification:**

1. Run `npm run test:run` — all starterLibrary tests pass
2. Run `npm run check` — no TypeScript errors
3. Run `npm run lint` — no lint warnings
4. Run `npm run dev` and verify Device Library sidebar shows new devices

**Acceptance Criteria:**

- [ ] All 26 devices in library
- [ ] 6 new items added (switches, storage, cable mgmt)
- [ ] 5 items removed (shelf, generic, cooling)
- [ ] 3 items renamed (router/firewall, patch panels)
- [ ] All tests pass
- [ ] Device Library shows correct devices in UI

````

---

## Phase 4: Integration Testing

### Prompt 4.1 — E2E Test for Starter Library

```text
Add E2E test to verify the starter library works correctly in the application.

**Task:**
1. Read existing E2E tests in `e2e/`
2. Add tests for starter library in device palette

**Implementation:**

Create or update `e2e/deviceLibrary.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Starter Library', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('device palette shows all starter library items', async ({ page }) => {
    // Device palette should be visible
    const palette = page.locator('[data-testid="device-palette"]');
    await expect(palette).toBeVisible();

    // Check for some key devices
    await expect(palette.getByText('1U Server')).toBeVisible();
    await expect(palette.getByText('24-Port Switch')).toBeVisible();
    await expect(palette.getByText('1U Router/Firewall')).toBeVisible();
    await expect(palette.getByText('1U Brush Panel')).toBeVisible();
  });

  test('removed devices are not shown', async ({ page }) => {
    const palette = page.locator('[data-testid="device-palette"]');

    // These should NOT be present
    await expect(palette.getByText('1U Generic', { exact: true })).not.toBeVisible();
    await expect(palette.getByText('4U Shelf', { exact: true })).not.toBeVisible();
    await expect(palette.getByText('0.5U Blanking Fan')).not.toBeVisible();
  });

  test('can drag new switch device to rack', async ({ page }) => {
    // Find 24-Port Switch
    const device = page.locator('[data-testid="device-palette"]').getByText('24-Port Switch');
    await expect(device).toBeVisible();

    // Drag to rack (basic interaction test)
    // Implementation depends on existing drag-drop test patterns
  });

  test('cable management category exists', async ({ page }) => {
    const palette = page.locator('[data-testid="device-palette"]');

    // Both cable management items should exist
    await expect(palette.getByText('1U Brush Panel')).toBeVisible();
    await expect(palette.getByText('1U Cable Management')).toBeVisible();
  });
});
````

**Verification:**

1. Run `npm run test:e2e` — E2E tests pass
2. Manually verify in browser

**Acceptance Criteria:**

- [ ] E2E tests verify device palette content
- [ ] New devices appear correctly
- [ ] Removed devices don't appear
- [ ] Basic drag-drop still works

````

---

## Phase 5: Final Verification

### Prompt 5.1 — Final Review and Cleanup

```text
Perform final review and cleanup of all starter library changes.

**Task:**
1. Run all tests: `npm run test:run`
2. Run E2E tests: `npm run test:e2e`
3. Run type checking: `npm run check`
4. Run linting: `npm run lint`
5. Manual testing in browser

**Checklist:**
- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] No TypeScript errors
- [ ] No lint warnings
- [ ] No console.log statements
- [ ] Device palette shows 26 devices
- [ ] Categories are colored correctly
- [ ] Cable management devices have Steel Blue color
- [ ] Devices can be dragged to rack
- [ ] Save/load preserves custom device placement

**Manual Testing:**
1. Start dev server: `npm run dev`
2. Verify Device Library shows all 26 devices
3. Verify devices are grouped by category
4. Verify colors match category colors
5. Drag a "24-Port Switch" to rack
6. Drag a "1U Brush Panel" to rack
7. Save layout
8. Reload page
9. Load layout
10. Verify devices are preserved

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Manual testing successful
- [ ] Ready for commit
````

---

## Summary

| Phase | Prompts | Focus                          |
| ----- | ------- | ------------------------------ |
| 1     | 1.1     | Add cable-management category  |
| 2     | 2.1     | Write starter library tests    |
| 3     | 3.1     | Update starterLibrary.ts       |
| 4     | 4.1     | E2E integration tests          |
| 5     | 5.1     | Final verification and cleanup |

**Total: 5 prompts across 5 phases**

Each prompt is self-contained but builds on previous work. Tests are written first (TDD), then implementation, then integration testing.
