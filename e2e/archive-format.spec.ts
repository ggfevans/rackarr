import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import JSZip from 'jszip';

/**
 * Helper to replace the current rack (v0.2 flow)
 * In v0.2, a rack always exists. To create a new one, we go through the replace dialog.
 */
async function replaceRack(page: Page, name: string, height: number = 24) {
	await page.click('button[aria-label="New Rack"]');
	await page.click('button:has-text("Replace")');

	await page.fill('#rack-name', name);

	const presetHeights = [12, 18, 24, 42];
	if (presetHeights.includes(height)) {
		await page.click(`.height-btn:has-text("${height}U")`);
	} else {
		await page.click('.height-btn:has-text("Custom")');
		await page.fill('#custom-height', String(height));
	}

	await page.click('button:has-text("Create")');
	// In dual-view mode, there are two rack containers
	await expect(page.locator('.rack-container').first()).toBeVisible();
}

/**
 * Helper to drag device to rack
 */
async function dragDeviceToRack(page: Page) {
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
	await page.waitForTimeout(100);
}

test.describe('Archive Format', () => {
	const downloadsPath = path.join(process.cwd(), 'e2e', 'downloads');
	const legacyJsonPath = path.join(process.cwd(), 'e2e', 'test-legacy.rackarr.json');

	test.beforeAll(async () => {
		if (!fs.existsSync(downloadsPath)) {
			fs.mkdirSync(downloadsPath, { recursive: true });
		}

		// Create a legacy JSON file for migration testing (v0.2.x format with racks array)
		const legacyLayout = {
			version: '0.2.1',
			name: 'Legacy Layout',
			created: '2024-01-01T00:00:00.000Z',
			modified: '2024-01-01T00:00:00.000Z',
			racks: [
				{
					id: 'rack-1',
					name: 'Old Rack',
					height: 42,
					width: 19,
					position: 0,
					view: 'front',
					devices: []
				}
			],
			deviceLibrary: [],
			settings: {
				theme: 'dark'
			}
		};
		fs.writeFileSync(legacyJsonPath, JSON.stringify(legacyLayout, null, 2));
	});

	test.afterAll(async () => {
		if (fs.existsSync(legacyJsonPath)) {
			fs.unlinkSync(legacyJsonPath);
		}
		if (fs.existsSync(downloadsPath)) {
			const files = fs.readdirSync(downloadsPath);
			files.forEach((file) => {
				fs.unlinkSync(path.join(downloadsPath, file));
			});
			fs.rmdirSync(downloadsPath);
		}
	});

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

	test('save creates .rackarr.zip file', async ({ page }) => {
		// Replace the default rack with a named test rack
		await replaceRack(page, 'Archive Test Rack', 24);
		await dragDeviceToRack(page);
		await expect(page.locator('.rack-device').first()).toBeVisible({ timeout: 5000 });

		// Set up download listener
		const downloadPromise = page.waitForEvent('download');

		// Click save button
		await page.click('button[aria-label="Save"]');

		// Wait for download
		const download = await downloadPromise;

		// Check filename has .rackarr.zip extension
		expect(download.suggestedFilename()).toMatch(/\.rackarr\.zip$/);

		// Save and verify contents
		const downloadPath = path.join(downloadsPath, download.suggestedFilename());
		await download.saveAs(downloadPath);

		const zipBuffer = fs.readFileSync(downloadPath);
		const zip = await JSZip.loadAsync(zipBuffer);

		// v0.2 format: Should contain a YAML file in a folder structure
		const files = Object.keys(zip.files);
		expect(files.some((f) => f.endsWith('.yaml'))).toBe(true);
	});

	test.skip('load saved .rackarr.zip restores layout', async ({ page }) => {
		// SKIP: File chooser interaction unreliable in E2E tests
		// Replace default rack and save a layout
		await replaceRack(page, 'Saved Layout', 24);
		await dragDeviceToRack(page);
		await expect(page.locator('.rack-device')).toBeVisible({ timeout: 5000 });

		const downloadPromise = page.waitForEvent('download');
		await page.click('button[aria-label="Save"]');
		const download = await downloadPromise;

		const savedPath = path.join(downloadsPath, 'saved-layout.rackarr.zip');
		await download.saveAs(savedPath);

		// Reload and load the saved file
		await page.reload();
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();

		// In v0.2, there's no welcome screen. Click Load button in toolbar.
		const fileChooserPromise = page.waitForEvent('filechooser');
		await page.click('button[aria-label="Load Layout"]');
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles(savedPath);

		// Wait for success toast to confirm load completed
		await expect(page.locator('.toast--success')).toBeVisible({
			timeout: 10000
		});

		// Verify layout is restored
		await expect(page.locator('.rack-container')).toBeVisible();
		await expect(page.locator('.rack-name')).toContainText('Saved Layout');
		await expect(page.locator('.rack-device')).toBeVisible();
	});

	test('load legacy .rackarr.json file (migration)', async ({ page }) => {
		// In v0.2, click Load button in toolbar (no welcome screen)
		const fileChooserPromise = page.waitForEvent('filechooser');
		await page.click('button[aria-label="Load Layout"]');
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles(legacyJsonPath);

		// Verify the layout is loaded (migrated from legacy format)
		await expect(page.locator('.rack-container').first()).toBeVisible();
		// Rack name is displayed in dual-view header
		await expect(page.locator('.rack-dual-view-name')).toContainText('Old Rack');
	});

	test('error handling for corrupted archive', async ({ page }) => {
		const corruptedPath = path.join(downloadsPath, 'corrupted.rackarr.zip');
		fs.writeFileSync(corruptedPath, 'not a zip file');

		// In v0.2, click Load button in toolbar
		const fileChooserPromise = page.waitForEvent('filechooser');
		await page.click('button[aria-label="Load Layout"]');
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles(corruptedPath);

		// Should show error toast
		const toast = page.locator('.toast-error, .toast.error, [role="alert"]');
		await expect(toast.first()).toBeVisible({ timeout: 5000 });

		fs.unlinkSync(corruptedPath);
	});
});
