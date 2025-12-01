import { test, expect, Page } from '@playwright/test';

/**
 * Helper to fill the rack creation form
 * Uses #rack-name for name and height preset buttons or custom input
 */
async function fillRackForm(page: Page, name: string, height: number) {
	await page.fill('#rack-name', name);

	const presetHeights = [12, 18, 24, 42];
	if (presetHeights.includes(height)) {
		// Click the preset button
		await page.click(`.height-btn:has-text("${height}U")`);
	} else {
		// Click Custom and fill the input
		await page.click('.height-btn:has-text("Custom")');
		await page.fill('#custom-height', String(height));
	}
}

test.describe('Single Rack Mode (v0.1.1)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();
	});

	test('shows confirmation dialog when creating second rack', async ({ page }) => {
		// Create first rack
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'My Rack', 42);
		await page.click('button:has-text("Create")');

		// Verify rack exists
		await expect(page.locator('.rack-container')).toHaveCount(1);
		await expect(page.locator('text=My Rack')).toBeVisible();

		// Try to create second rack
		await page.click('button[aria-label="New Rack"]');

		// Should show confirmation dialog
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).toBeVisible();
		await expect(page.locator('button:has-text("Save First")')).toBeVisible();
		await expect(page.locator('button:has-text("Replace")')).toBeVisible();
		await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
	});

	test('Replace button clears rack and opens form', async ({ page }) => {
		// Create rack
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'Old Rack', 24);
		await page.click('button:has-text("Create")');

		// Verify rack exists
		await expect(page.locator('text=Old Rack')).toBeVisible();

		// Click New Rack, then Replace
		await page.click('button[aria-label="New Rack"]');
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).toBeVisible();
		await page.click('button:has-text("Replace")');

		// Dialog should close
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).not.toBeVisible();

		// New Rack form should appear
		await expect(page.locator('#rack-name')).toBeVisible();
		await expect(page.locator('h2:has-text("New Rack")')).toBeVisible();

		// Create new rack
		await fillRackForm(page, 'New Rack', 42);
		await page.click('button:has-text("Create")');

		// Only new rack should exist
		await expect(page.locator('.rack-container')).toHaveCount(1);
		await expect(page.locator('text=New Rack')).toBeVisible();
		await expect(page.locator('text=Old Rack')).not.toBeVisible();
	});

	test('Cancel preserves existing rack', async ({ page }) => {
		// Create rack
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'My Rack', 42);
		await page.click('button:has-text("Create")');

		// Verify rack exists
		await expect(page.locator('text=My Rack')).toBeVisible();

		// Click New Rack, then Cancel
		await page.click('button[aria-label="New Rack"]');
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).toBeVisible();
		await page.click('button:has-text("Cancel")');

		// Dialog should close
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).not.toBeVisible();

		// Rack should still exist
		await expect(page.locator('.rack-container')).toHaveCount(1);
		await expect(page.locator('text=My Rack')).toBeVisible();

		// New Rack form should NOT be open
		await expect(page.locator('h2:has-text("New Rack")')).not.toBeVisible();
	});

	test('Escape key triggers Cancel', async ({ page }) => {
		// Create rack
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'Test Rack', 24);
		await page.click('button:has-text("Create")');

		// Click New Rack to show dialog
		await page.click('button[aria-label="New Rack"]');
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).toBeVisible();

		// Press Escape
		await page.keyboard.press('Escape');

		// Dialog should close
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).not.toBeVisible();

		// Rack should still exist
		await expect(page.locator('.rack-container')).toHaveCount(1);
		await expect(page.locator('text=Test Rack')).toBeVisible();
	});

	test('enforces maximum 1 rack', async ({ page }) => {
		// Create first rack
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'Rack 1', 12);
		await page.click('button:has-text("Create")');

		// Verify 1 rack exists
		await expect(page.locator('.rack-container')).toHaveCount(1);

		// Try to create a 2nd rack should show confirmation dialog
		await page.click('button[aria-label="New Rack"]');

		// Should show replace confirmation, not allow direct creation
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).toBeVisible();

		// Cancel the dialog
		await page.click('button:has-text("Cancel")');

		// Should still have only 1 rack
		await expect(page.locator('.rack-container')).toHaveCount(1);
	});

	test('dialog shows correct rack name and device count', async ({ page }) => {
		// Create rack
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'Production Server Rack', 42);
		await page.click('button:has-text("Create")');

		// Try to create second rack
		await page.click('button[aria-label="New Rack"]');

		// Dialog should show rack name in message
		const dialog = page.locator('[role="dialog"]');
		await expect(dialog).toBeVisible();
		await expect(dialog.locator('text=/Production Server Rack/')).toBeVisible();

		// Should show 0 devices initially
		await expect(dialog.locator('text=/0 devices/')).toBeVisible();
	});
});
