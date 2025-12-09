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

/**
 * Helper to replace the current rack (v0.2 flow)
 * In v0.2, a rack always exists. To create a new one, we go through the replace dialog.
 */
async function replaceRack(page: Page, name: string, height: number) {
	await page.click('.toolbar-action-btn[aria-label="New Rack"]');
	await page.click('button:has-text("Replace")');
	await fillRackForm(page, name, height);
	await page.click('button:has-text("Create")');
}

test.describe('Single Rack Mode (v0.2)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Clear both storage types - hasStarted flag is in localStorage
		await page.evaluate(() => {
			sessionStorage.clear();
			localStorage.clear();
			localStorage.setItem('rackarr_has_started', 'true');
		});
		await page.reload();
		await page.waitForTimeout(500);
	});

	test('rack exists on initial load (v0.2 always has a rack)', async ({ page }) => {
		// In v0.4 dual-view mode, there are 2 rack containers (front and rear)
		await expect(page.locator('.rack-container')).toHaveCount(2);
		// Rack name is displayed in dual-view header
		await expect(page.locator('.rack-dual-view-name')).toBeVisible();
	});

	test('shows confirmation dialog when clicking New Rack', async ({ page }) => {
		// In v0.2, clicking New Rack shows replace confirmation
		await page.click('.toolbar-action-btn[aria-label="New Rack"]');

		// Should show confirmation dialog
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).toBeVisible();
		await expect(page.locator('button:has-text("Save First")')).toBeVisible();
		await expect(page.locator('button:has-text("Replace")')).toBeVisible();
		await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
	});

	test('Replace button clears rack and opens form', async ({ page }) => {
		// First replace the default rack with a named one
		await replaceRack(page, 'Old Rack', 24);

		// Verify rack exists (dual-view header shows name)
		await expect(page.locator('.rack-dual-view-name')).toContainText('Old Rack');

		// Click New Rack, then Replace
		await page.click('.toolbar-action-btn[aria-label="New Rack"]');
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

		// Only new rack should exist (2 rack containers in dual-view mode)
		await expect(page.locator('.rack-container')).toHaveCount(2);
		await expect(page.locator('.rack-dual-view-name', { hasText: 'New Rack' })).toBeVisible();
		await expect(page.locator('.rack-dual-view-name', { hasText: 'Old Rack' })).not.toBeVisible();
	});

	test('Cancel preserves existing rack', async ({ page }) => {
		// First replace the default rack with a named one
		await replaceRack(page, 'My Rack', 42);

		// Verify rack exists (dual-view header shows name)
		await expect(page.locator('.rack-dual-view-name')).toContainText('My Rack');

		// Click New Rack, then Cancel
		await page.click('.toolbar-action-btn[aria-label="New Rack"]');
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).toBeVisible();
		await page.click('button:has-text("Cancel")');

		// Dialog should close
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).not.toBeVisible();

		// Rack should still exist (2 containers in dual-view)
		await expect(page.locator('.rack-container')).toHaveCount(2);
		await expect(page.locator('.rack-dual-view-name')).toContainText('My Rack');

		// New Rack form should NOT be open
		await expect(page.locator('h2:has-text("New Rack")')).not.toBeVisible();
	});

	test('Escape key triggers Cancel', async ({ page }) => {
		// First replace the default rack with a named one
		await replaceRack(page, 'Test Rack', 24);

		// Click New Rack to show dialog
		await page.click('.toolbar-action-btn[aria-label="New Rack"]');
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).toBeVisible();

		// Press Escape
		await page.keyboard.press('Escape');

		// Dialog should close
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).not.toBeVisible();

		// Rack should still exist (2 containers in dual-view)
		await expect(page.locator('.rack-container')).toHaveCount(2);
		await expect(page.locator('.rack-dual-view-name')).toContainText('Test Rack');
	});

	test('enforces maximum 1 rack', async ({ page }) => {
		// Verify rack exists (2 containers in dual-view for the single rack)
		await expect(page.locator('.rack-container')).toHaveCount(2);

		// Try to create a 2nd rack should show confirmation dialog
		await page.click('.toolbar-action-btn[aria-label="New Rack"]');

		// Should show replace confirmation, not allow direct creation
		await expect(page.locator('h2:has-text("Replace Current Rack?")')).toBeVisible();

		// Cancel the dialog
		await page.click('button:has-text("Cancel")');

		// Should still have only the dual-view containers (2)
		await expect(page.locator('.rack-container')).toHaveCount(2);
	});

	test('dialog shows correct rack name and device count', async ({ page }) => {
		// Replace default rack with a named one
		await replaceRack(page, 'Production Server Rack', 42);

		// Try to create second rack
		await page.click('.toolbar-action-btn[aria-label="New Rack"]');

		// Dialog should show rack name in message (use specific selector for replace dialog, not drawer)
		const dialog = page.locator('.dialog[role="dialog"]');
		await expect(dialog).toBeVisible();
		await expect(dialog.locator('text=/Production Server Rack/')).toBeVisible();

		// Should show 0 devices initially
		await expect(dialog.locator('text=/0 devices/')).toBeVisible();
	});
});
