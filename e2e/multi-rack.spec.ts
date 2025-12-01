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
 * Helper to drag a device from palette to rack using manual events
 * Manually dispatches HTML5 drag events for more reliable DnD testing
 */
async function dragDeviceToRack(page: Page, rackIndex = 0) {
	// Open palette if not already open
	const paletteOpen = await page.locator('.drawer-left.open').count();
	if (!paletteOpen) {
		await page.click('button[aria-label="Device Palette"]');
		await expect(page.locator('.drawer-left.open')).toBeVisible();
	}

	// Wait for palette content to be stable
	await page.waitForTimeout(200);

	// Use evaluate to simulate drag and drop via JavaScript
	await page.evaluate((targetRackIndex: number) => {
		const deviceItem = document.querySelector('.device-palette-item');
		const racks = document.querySelectorAll('.rack-container svg');
		const rack = racks[targetRackIndex];

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
	}, rackIndex);

	// Wait a bit for state to update
	await page.waitForTimeout(100);
}

// SKIPPED: Multi-rack support deferred to v0.3
// Tests preserved for future restoration
test.describe.skip('Multi-Rack Operations (v0.3)', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();
	});

	test('can create multiple racks of different heights', async ({ page }) => {
		// Create first rack (12U)
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'Short Rack', 12);
		await page.click('button:has-text("Create")');
		await expect(page.locator('.rack-container').first()).toBeVisible();

		// Create second rack (24U)
		await page.click('button[aria-label="New Rack"]');
		await fillRackForm(page, 'Medium Rack', 24);
		await page.click('button:has-text("Create")');

		// Create third rack (42U)
		await page.click('button[aria-label="New Rack"]');
		await fillRackForm(page, 'Tall Rack', 42);
		await page.click('button:has-text("Create")');

		// Verify all three racks exist
		await expect(page.locator('.rack-container')).toHaveCount(3);
		await expect(page.locator('text=Short Rack')).toBeVisible();
		await expect(page.locator('text=Medium Rack')).toBeVisible();
		await expect(page.locator('text=Tall Rack')).toBeVisible();
	});

	test('racks align at bottom', async ({ page }) => {
		// Create racks of different heights
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'Small', 12);
		await page.click('button:has-text("Create")');

		await page.click('button[aria-label="New Rack"]');
		await fillRackForm(page, 'Large', 42);
		await page.click('button:has-text("Create")');

		// Get the bounding boxes to check alignment
		const rackContainers = page.locator('.rack-container');
		const smallRackBox = await rackContainers.first().boundingBox();
		const largeRackBox = await rackContainers.last().boundingBox();

		// Both racks should align at the bottom (same bottom y-coordinate, approximately)
		if (smallRackBox && largeRackBox) {
			const smallBottom = smallRackBox.y + smallRackBox.height;
			const largeBottom = largeRackBox.y + largeRackBox.height;
			// Allow some margin for padding/transform differences
			expect(Math.abs(smallBottom - largeBottom)).toBeLessThan(50);
		}
	});

	// Cross-rack drag is difficult to test with synthetic events due to DataTransfer security restrictions
	// The feature works in real browser interaction but synthetic DragEvents have limitations
	// TODO: Consider using Playwright's native drag API when it supports cross-element drag properly
	test.skip('can move device between racks', async ({ page }) => {
		// Create two racks
		await page.click('.btn-primary:has-text("New Rack")');
		await fillRackForm(page, 'Source Rack', 12);
		await page.click('button:has-text("Create")');

		await page.click('button[aria-label="New Rack"]');
		await fillRackForm(page, 'Target Rack', 12);
		await page.click('button:has-text("Create")');

		// Add device to first rack (index 0)
		await dragDeviceToRack(page, 0);

		// Wait for device in source rack
		const sourceRack = page.locator('.rack-container').first();
		await expect(sourceRack.locator('.rack-device')).toBeVisible();

		// Close palette first
		await page.keyboard.press('d');
		await expect(page.locator('.drawer-left.open')).not.toBeVisible();

		// Move device to target rack using drag (via page.evaluate)
		// Need to properly set the drag data JSON for the handler to work
		await page.evaluate(() => {
			const device = document.querySelector('.rack-device');
			const targetRackSvg = document.querySelectorAll('.rack-container svg')[1];

			if (!device || !targetRackSvg) {
				throw new Error('Could not find device or target rack');
			}

			// Create a DataTransfer that will be populated by the actual dragstart handler
			const dataTransfer = new DataTransfer();

			// Trigger dragstart on the device
			device.dispatchEvent(
				new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer })
			);

			// Trigger dragover and drop on target rack
			targetRackSvg.dispatchEvent(
				new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer })
			);
			targetRackSvg.dispatchEvent(
				new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer })
			);

			// Trigger dragend
			device.dispatchEvent(
				new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer })
			);
		});

		await page.waitForTimeout(200);

		// Device should now be in target rack
		const targetRack = page.locator('.rack-container').last();
		await expect(targetRack.locator('.rack-device')).toBeVisible({ timeout: 5000 });
	});

	test('enforces maximum 6 racks', async ({ page }) => {
		// Create 6 racks
		for (let i = 1; i <= 6; i++) {
			if (i === 1) {
				await page.click('.btn-primary:has-text("New Rack")');
			} else {
				await page.click('button[aria-label="New Rack"]');
			}
			await fillRackForm(page, `Rack ${i}`, 12);
			await page.click('button:has-text("Create")');
		}

		// Verify 6 racks exist
		await expect(page.locator('.rack-container')).toHaveCount(6);

		// Try to create a 7th rack
		await page.click('button[aria-label="New Rack"]');
		await fillRackForm(page, 'Rack 7', 12);
		await page.click('button:has-text("Create")');

		// Should still have only 6 racks or show an error
		const rackCount = await page.locator('.rack-container').count();
		expect(rackCount).toBeLessThanOrEqual(6);
	});
});
