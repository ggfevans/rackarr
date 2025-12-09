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
 * Note: In dual-view mode, there are two .rack-container elements
 */
async function replaceRack(page: Page, name: string, height: number) {
	await page.click('.toolbar-action-btn[aria-label="New Rack"]');
	await page.click('button:has-text("Replace")');
	await fillRackForm(page, name, height);
	await page.click('button:has-text("Create")');
	await expect(page.locator('.rack-container').first()).toBeVisible();
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

test.describe('Export Functionality', () => {
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

		// In v0.2, rack already exists. Replace it with a test rack for consistency.
		await replaceRack(page, 'Export Test Rack', 12);

		// Add a device (drag to first rack-svg which is front view)
		await dragDeviceToRack(page);
		await expect(page.locator('.rack-device').first()).toBeVisible();
	});

	test('export dialog opens', async ({ page }) => {
		// Click export button
		await page.click('.toolbar-action-btn[aria-label="Export"]');

		// Dialog should open
		await expect(page.locator('.dialog')).toBeVisible();
		await expect(page.locator('.dialog-title')).toHaveText('Export');
	});

	test('export dialog has format options', async ({ page }) => {
		await page.click('.toolbar-action-btn[aria-label="Export"]');

		// Should have format select dropdown with options
		const formatSelect = page.locator('#export-format');
		await expect(formatSelect).toBeVisible();

		// Verify options exist
		await expect(formatSelect.locator('option[value="png"]')).toBeAttached();
		await expect(formatSelect.locator('option[value="jpeg"]')).toBeAttached();
		await expect(formatSelect.locator('option[value="svg"]')).toBeAttached();
	});

	test('export PNG downloads file', async ({ page }) => {
		await page.click('.toolbar-action-btn[aria-label="Export"]');

		// Select PNG format (default, but be explicit)
		await page.selectOption('#export-format', 'png');

		// Set up download listener
		const downloadPromise = page.waitForEvent('download');

		// Click export button
		await page.click('button:has-text("Export"):not([aria-label])');

		// Wait for download
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toMatch(/\.png$/);
	});

	test('export SVG downloads file', async ({ page }) => {
		await page.click('.toolbar-action-btn[aria-label="Export"]');

		// Select SVG format
		await page.selectOption('#export-format', 'svg');

		// Set up download listener
		const downloadPromise = page.waitForEvent('download');

		// Click export button
		await page.click('button:has-text("Export"):not([aria-label])');

		// Wait for download
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toMatch(/\.svg$/);
	});

	test('export JPEG downloads file', async ({ page }) => {
		await page.click('.toolbar-action-btn[aria-label="Export"]');

		// Select JPEG format
		await page.selectOption('#export-format', 'jpeg');

		// Set up download listener
		const downloadPromise = page.waitForEvent('download');

		// Click export button
		await page.click('button:has-text("Export"):not([aria-label])');

		// Wait for download
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toMatch(/\.jpe?g$/);
	});

	test('export with legend option', async ({ page }) => {
		await page.click('.toolbar-action-btn[aria-label="Export"]');

		// Check include legend checkbox - the label contains the text
		const legendCheckbox = page.locator('label:has-text("Include legend") input[type="checkbox"]');
		await expect(legendCheckbox).toBeVisible();
		await legendCheckbox.check();

		// Set up download listener
		const downloadPromise = page.waitForEvent('download');

		// Export
		await page.click('button:has-text("Export"):not([aria-label])');

		await downloadPromise;
		// Legend inclusion is reflected in the exported file content
	});

	test('export dialog can be cancelled', async ({ page }) => {
		await page.click('.toolbar-action-btn[aria-label="Export"]');
		await expect(page.locator('.dialog')).toBeVisible();

		// Click cancel
		await page.click('button:has-text("Cancel")');

		// Dialog should close
		await expect(page.locator('.dialog')).not.toBeVisible();
	});
});
