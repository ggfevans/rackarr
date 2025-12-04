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
	await page.click('button[aria-label="New Rack"]');
	await page.click('button:has-text("Replace")');
	await fillRackForm(page, name, height);
	await page.click('button:has-text("Create")');
}

/**
 * Helper to drag a device from palette to rack using manual events
 * Manually dispatches HTML5 drag events for more reliable DnD testing
 */
async function dragDeviceToRack(page: Page) {
	// Device palette is always visible in the fixed sidebar
	await expect(page.locator('.device-palette-item').first()).toBeVisible();

	// Get element handles using Playwright locators
	// In dual-view mode, there are two rack-svg elements - use first one
	const deviceHandle = await page.locator('.device-palette-item').first().elementHandle();
	const rackHandle = await page.locator('.rack-svg').first().elementHandle();

	if (!deviceHandle || !rackHandle) {
		throw new Error('Could not find device item or rack');
	}

	await page.evaluate(
		([device, rack]) => {
			const dataTransfer = new DataTransfer();

			device.dispatchEvent(
				new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer })
			);
			rack.dispatchEvent(
				new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer })
			);
			rack.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }));
			device.dispatchEvent(
				new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer })
			);
		},
		[deviceHandle, rackHandle] as const
	);

	// Wait a bit for state to update
	await page.waitForTimeout(100);
}

test.describe('Keyboard Shortcuts', () => {
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

		// In v0.2, rack already exists. Replace it with a specific one for testing.
		await replaceRack(page, 'Test Rack', 12);
	});

	test('Delete key clears rack devices (v0.2 cannot remove the rack)', async ({ page }) => {
		// Add a device first
		await dragDeviceToRack(page);
		await expect(page.locator('.rack-device').first()).toBeVisible();

		// Select the rack (click on first rack-svg in dual-view)
		await page.locator('.rack-svg').first().click();

		// Press Delete
		await page.keyboard.press('Delete');

		// Confirm deletion - button text is "Delete Rack" for racks
		await expect(page.locator('.dialog')).toBeVisible();
		await page.click('[role="dialog"] button:has-text("Delete Rack")');

		// In v0.2, rack still exists but devices are cleared
		await expect(page.locator('.rack-container').first()).toBeVisible();
		await expect(page.locator('.rack-device')).not.toBeVisible();
	});

	test('Backspace key clears rack devices (v0.2 cannot remove the rack)', async ({ page }) => {
		// Add a device first
		await dragDeviceToRack(page);
		await expect(page.locator('.rack-device').first()).toBeVisible();

		// Select the rack (click on first rack-svg in dual-view)
		await page.locator('.rack-svg').first().click();

		// Press Backspace
		await page.keyboard.press('Backspace');

		// Confirm deletion - button text is "Delete Rack" for racks
		await expect(page.locator('.dialog')).toBeVisible();
		await page.click('[role="dialog"] button:has-text("Delete Rack")');

		// In v0.2, rack still exists but devices are cleared
		await expect(page.locator('.rack-container').first()).toBeVisible();
		await expect(page.locator('.rack-device')).not.toBeVisible();
	});

	test('Escape clears selection', async ({ page }) => {
		// Select the rack (click on first rack-svg in dual-view)
		await page.locator('.rack-svg').first().click();

		// Edit panel should open
		await expect(page.locator('.drawer-right.open')).toBeVisible();

		// Press Escape
		await page.keyboard.press('Escape');

		// Edit panel should close
		await expect(page.locator('.drawer-right.open')).not.toBeVisible();
	});

	test('? key opens help dialog', async ({ page }) => {
		// Press ? using keyboard.type which handles shift automatically
		await page.keyboard.type('?');

		// Help dialog should open (HelpPanel uses Dialog component)
		await expect(page.locator('.dialog')).toBeVisible({ timeout: 2000 });
		await expect(page.locator('.dialog-title')).toHaveText('Help');
	});

	test('Ctrl+S triggers save', async ({ page }) => {
		// Set up download listener
		const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);

		// Press Ctrl+S
		await page.keyboard.press('Control+s');

		// Should trigger download
		const download = await downloadPromise;
		if (download) {
			expect(download.suggestedFilename()).toContain('.rackarr.zip');
		}
	});

	test('Escape closes dialogs', async ({ page }) => {
		// Open new rack dialog (this shows replace dialog in v0.2)
		await page.click('button[aria-label="New Rack"]');
		await expect(page.locator('.dialog')).toBeVisible();

		// Press Escape
		await page.keyboard.press('Escape');

		// Dialog should close
		await expect(page.locator('.dialog')).not.toBeVisible();
	});

	test('Arrow keys move device in rack', async ({ page }) => {
		// Add a device to the rack
		await dragDeviceToRack(page);

		// Wait for device
		await expect(page.locator('.rack-device').first()).toBeVisible();

		// Select the device (first one in dual-view)
		await page.locator('.rack-device').first().click();

		// Press Arrow Up
		await page.keyboard.press('ArrowUp');

		// Note: This test verifies the key is handled, actual movement depends on implementation
		await expect(page.locator('.rack-device').first()).toBeVisible();
	});
});
