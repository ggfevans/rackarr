import { test, expect, Page } from '@playwright/test';

/**
 * Helper to drag a device from palette to rack using manual events
 */
async function dragDeviceToRack(page: Page) {
	await expect(page.locator('.device-palette-item').first()).toBeVisible();

	await page.evaluate(() => {
		const deviceItem = document.querySelector('.device-palette-item');
		const rack = document.querySelector('.rack-svg');

		if (!deviceItem || !rack) {
			throw new Error('Could not find device item or rack');
		}

		const dataTransfer = new DataTransfer();

		const dragStartEvent = new DragEvent('dragstart', {
			bubbles: true,
			cancelable: true,
			dataTransfer
		});
		deviceItem.dispatchEvent(dragStartEvent);

		const dragOverEvent = new DragEvent('dragover', {
			bubbles: true,
			cancelable: true,
			dataTransfer
		});
		rack.dispatchEvent(dragOverEvent);

		const dropEvent = new DragEvent('drop', {
			bubbles: true,
			cancelable: true,
			dataTransfer
		});
		rack.dispatchEvent(dropEvent);

		const dragEndEvent = new DragEvent('dragend', {
			bubbles: true,
			cancelable: true,
			dataTransfer
		});
		deviceItem.dispatchEvent(dragEndEvent);
	});

	await page.waitForTimeout(100);
}

test.describe('Device Custom Names', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => {
			sessionStorage.clear();
			localStorage.clear();
			localStorage.setItem('rackarr_has_started', 'true');
		});
		await page.reload();
		await page.waitForTimeout(500);
	});

	test('can edit device display name', async ({ page }) => {
		// Place a device
		await dragDeviceToRack(page);
		await expect(page.locator('.rack-device').first()).toBeVisible();

		// Click on the device to select it (use the foreignObject drag-handle inside)
		await page.locator('.rack-device .drag-handle').first().click();

		// Wait for edit panel drawer to open
		await expect(page.locator('aside.drawer-right.open')).toBeVisible();

		// Find and click the display name field to start editing
		const displayNameSection = page.locator('.display-name-section');
		await expect(displayNameSection).toBeVisible({ timeout: 10000 });

		// Click on the name display to start editing
		await displayNameSection.locator('.display-name-display').click();

		// Input field should appear
		const nameInput = displayNameSection.locator('.display-name-input');
		await expect(nameInput).toBeVisible();

		// Clear and type new name
		await nameInput.fill('Primary Database Server');

		// Press Enter to save
		await nameInput.press('Enter');

		// Wait for update to apply
		await page.waitForTimeout(100);

		// The new name should be visible in the rack device
		await expect(page.locator('.rack-device .device-name').first()).toHaveText(
			'Primary Database Server'
		);
	});

	test.skip('display name persists after save/load', async ({ page }) => {
		// Place a device and give it a custom name
		await dragDeviceToRack(page);
		await expect(page.locator('.rack-device').first()).toBeVisible();
		await page.locator('.rack-device').first().click();

		// Wait for edit panel to open
		await expect(page.locator('aside.drawer-right.open')).toBeVisible();
		await expect(page.locator('.display-name-section')).toBeVisible();

		// Edit the name
		await page.locator('.display-name-display').click();
		const nameInput = page.locator('.display-name-input');
		await expect(nameInput).toBeVisible();
		await nameInput.fill('Storage Server');
		await nameInput.press('Enter');
		await page.waitForTimeout(100);

		// Verify the name shows
		await expect(page.locator('.rack-device .device-name').first()).toHaveText('Storage Server');

		// Save the layout (Ctrl+S)
		const downloadPromise = page.waitForEvent('download');
		await page.keyboard.press('Control+s');
		const download = await downloadPromise;
		const downloadPath = await download.path();
		expect(downloadPath).toBeTruthy();

		// Clear and reload
		await page.evaluate(() => {
			sessionStorage.clear();
			localStorage.clear();
			localStorage.setItem('rackarr_has_started', 'true');
		});
		await page.reload();
		await page.waitForTimeout(500);

		// Load the saved file
		const fileChooserPromise = page.waitForEvent('filechooser');
		await page.keyboard.press('Control+o');
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles(downloadPath!);

		// Wait for load to complete and rack to appear
		await page.waitForTimeout(1000);
		await expect(page.locator('.rack-device').first()).toBeVisible({ timeout: 10000 });

		// Verify the custom name is restored
		await expect(page.locator('.rack-device .device-name').first()).toHaveText('Storage Server');
	});

	test.skip('undo/redo works for display name changes', async ({ page }) => {
		// Place a device
		await dragDeviceToRack(page);
		await expect(page.locator('.rack-device').first()).toBeVisible();
		await page.locator('.rack-device').first().click();

		// Wait for edit panel to open
		await expect(page.locator('aside.drawer-right.open')).toBeVisible();
		await expect(page.locator('.display-name-section')).toBeVisible();

		// Get the original device type name
		const originalName = await page.locator('.rack-device .device-name').first().textContent();

		// Edit the name
		await page.locator('.display-name-display').click();
		const nameInput = page.locator('.display-name-input');
		await expect(nameInput).toBeVisible();
		await nameInput.fill('Custom Name');
		await nameInput.press('Enter');
		await page.waitForTimeout(100);

		// Verify new name
		await expect(page.locator('.rack-device .device-name').first()).toHaveText('Custom Name');

		// Click on canvas area to ensure keyboard shortcuts work (not in input)
		await page.locator('.canvas').first().click();
		await page.waitForTimeout(100);

		// Undo (Ctrl+Z)
		await page.keyboard.press('Control+z');
		await page.waitForTimeout(300);

		// Should restore original name
		await expect(page.locator('.rack-device .device-name').first()).toHaveText(originalName!);

		// Redo (Ctrl+Shift+Z)
		await page.keyboard.press('Control+Shift+z');
		await page.waitForTimeout(300);

		// Should restore custom name
		await expect(page.locator('.rack-device .device-name').first()).toHaveText('Custom Name');
	});

	test('clearing display name reverts to device type name', async ({ page }) => {
		// Place a device
		await dragDeviceToRack(page);
		await expect(page.locator('.rack-device').first()).toBeVisible();
		await page.locator('.rack-device').first().click();

		// Wait for edit panel to open
		await expect(page.locator('aside.drawer-right.open')).toBeVisible();
		await expect(page.locator('.display-name-section')).toBeVisible();

		// Get the original device type name
		const originalName = await page.locator('.rack-device .device-name').first().textContent();

		// Edit the name to something custom
		await page.locator('.display-name-display').click();
		let nameInput = page.locator('.display-name-input');
		await expect(nameInput).toBeVisible();
		await nameInput.fill('Custom Name');
		await nameInput.press('Enter');
		await page.waitForTimeout(100);

		// Verify custom name is shown
		await expect(page.locator('.rack-device .device-name').first()).toHaveText('Custom Name');

		// Click again and clear the name
		await page.locator('.display-name-display').click();
		nameInput = page.locator('.display-name-input');
		await expect(nameInput).toBeVisible();
		await nameInput.fill('');
		await nameInput.press('Enter');
		await page.waitForTimeout(100);

		// Should revert to device type name
		await expect(page.locator('.rack-device .device-name').first()).toHaveText(originalName!);
	});
});
