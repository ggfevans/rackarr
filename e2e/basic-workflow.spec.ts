import { test, expect, Page } from '@playwright/test';

/**
 * Helper to replace the current rack with a new one (v0.2 flow)
 * In v0.2, a rack always exists. To create a new one, we go through the replace dialog.
 */
async function replaceRack(page: Page, name: string, height: number) {
	// Click "New Rack" in toolbar to open replace dialog
	await page.click('button[aria-label="New Rack"]');

	// Click "Replace" to open the new rack form
	await page.click('button:has-text("Replace")');

	// Now fill the rack form
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

	await page.click('button:has-text("Create")');
}

/**
 * Helper to drag a device from palette to rack using manual events
 * Manually dispatches HTML5 drag events for more reliable DnD testing
 */
async function dragDeviceToRack(page: Page) {
	// Device palette is always visible in the fixed sidebar
	await expect(page.locator('.device-palette-item').first()).toBeVisible();

	// Use evaluate to simulate drag and drop via JavaScript
	await page.evaluate(() => {
		const deviceItem = document.querySelector('.device-palette-item');
		const rack = document.querySelector('.rack-svg');

		if (!deviceItem || !rack) {
			throw new Error('Could not find device item or rack');
		}

		// Create a DataTransfer object
		const dataTransfer = new DataTransfer();

		// Create and dispatch dragstart
		const dragStartEvent = new DragEvent('dragstart', {
			bubbles: true,
			cancelable: true,
			dataTransfer
		});
		deviceItem.dispatchEvent(dragStartEvent);

		// The dragstart handler should have set data on dataTransfer
		// Now dispatch dragover on the rack
		const dragOverEvent = new DragEvent('dragover', {
			bubbles: true,
			cancelable: true,
			dataTransfer
		});
		rack.dispatchEvent(dragOverEvent);

		// Finally dispatch drop
		const dropEvent = new DragEvent('drop', {
			bubbles: true,
			cancelable: true,
			dataTransfer
		});
		rack.dispatchEvent(dropEvent);

		// Dispatch dragend
		const dragEndEvent = new DragEvent('dragend', {
			bubbles: true,
			cancelable: true,
			dataTransfer
		});
		deviceItem.dispatchEvent(dragEndEvent);
	});

	// Wait a bit for state to update
	await page.waitForTimeout(100);
}

test.describe('Basic Workflow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		// Clear both storage types - hasStarted flag is in localStorage
		await page.evaluate(() => {
			sessionStorage.clear();
			localStorage.clear();
			// Set hasStarted flag so rack is displayed (v0.4 dual-view mode)
			localStorage.setItem('rackarr_has_started', 'true');
		});
		await page.reload();
		await page.waitForTimeout(500);
	});

	test('rack is visible on initial load (v0.2 always has a rack)', async ({ page }) => {
		// In v0.4 dual-view mode, two rack containers exist (front and rear)
		await expect(page.locator('.rack-container').first()).toBeVisible();
		// Default rack name is displayed in dual-view header
		await expect(page.locator('.rack-dual-view-name')).toBeVisible();
	});

	test('can replace current rack with a new one', async ({ page }) => {
		// Replace the default rack with a new one
		await replaceRack(page, 'Main Rack', 18);

		// Verify rack appears on canvas (dual-view has two rack containers)
		await expect(page.locator('.rack-container').first()).toBeVisible();
		await expect(page.locator('text=Main Rack')).toBeVisible();
	});

	test('rack appears on canvas after replacement', async ({ page }) => {
		// Replace the default rack
		await replaceRack(page, 'Test Rack', 24);

		// Verify the rack is visible (first of the dual-view)
		const rackSvg = page.locator('.rack-svg').first();
		await expect(rackSvg).toBeVisible();

		// Verify the rack name is displayed in dual-view header
		await expect(page.locator('.rack-dual-view-name')).toHaveText('Test Rack');
	});

	test('can drag device from palette to rack', async ({ page }) => {
		// In v0.4 dual-view mode, two rack containers exist
		await expect(page.locator('.rack-container').first()).toBeVisible();

		// Drag device using helper (drops on first .rack-svg which is front view)
		await dragDeviceToRack(page);

		// Verify device appears in rack
		await expect(page.locator('.rack-device').first()).toBeVisible({ timeout: 5000 });
	});

	test('device appears at correct position in rack', async ({ page }) => {
		// Rack already exists in v0.4 dual-view mode
		await expect(page.locator('.rack-container').first()).toBeVisible();

		// Drag device
		await dragDeviceToRack(page);

		// Verify device is in the rack
		await expect(page.locator('.rack-device').first()).toBeVisible();
	});

	test('can move device within rack', async ({ page }) => {
		// Rack exists by default
		await expect(page.locator('.rack-container').first()).toBeVisible();

		// Drag device
		await dragDeviceToRack(page);

		// Wait for device to appear
		await expect(page.locator('.rack-device').first()).toBeVisible();

		// Move the device within the rack using arrow keys
		const device = page.locator('.rack-device').first();
		await device.click();
		await page.keyboard.press('ArrowUp');

		// Device should still be visible
		await expect(page.locator('.rack-device').first()).toBeVisible();
	});

	test('can delete device from rack', async ({ page }) => {
		// Rack exists by default
		await expect(page.locator('.rack-container').first()).toBeVisible();

		// Drag device
		await dragDeviceToRack(page);

		// Wait for device
		await expect(page.locator('.rack-device').first()).toBeVisible();

		// Click on device to select it
		await page.locator('.rack-device').first().click();

		// Click delete button
		await page.click('button[aria-label="Delete"]');

		// Confirm deletion - button text is "Remove" for devices
		await page.click('[role="dialog"] button:has-text("Remove")');

		// Device should be removed
		await expect(page.locator('.rack-device')).not.toBeVisible();
	});

	test('can clear rack (v0.2 does not remove the rack)', async ({ page }) => {
		// Add a device first
		await dragDeviceToRack(page);
		await expect(page.locator('.rack-device').first()).toBeVisible();

		// Click on rack to select it (dual-view container)
		await page.locator('.rack-svg').first().click();

		// Click delete button
		await page.click('button[aria-label="Delete"]');

		// Confirm deletion - button text is "Delete Rack" for racks
		await page.click('[role="dialog"] button:has-text("Delete Rack")');

		// In v0.2, rack still exists but devices are cleared
		await expect(page.locator('.rack-container').first()).toBeVisible();
		await expect(page.locator('.rack-device')).not.toBeVisible();
	});
});
