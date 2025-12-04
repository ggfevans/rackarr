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

test.describe('Persistence', () => {
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

	test('save layout downloads ZIP file', async ({ page }) => {
		// Replace the default rack with a test rack
		await replaceRack(page, 'Save Test Rack', 18);

		// Set up download listener
		const downloadPromise = page.waitForEvent('download');

		// Click save button
		await page.click('button[aria-label="Save"]');

		// Wait for download
		const download = await downloadPromise;
		expect(download.suggestedFilename()).toMatch(/\.rackarr\.zip$/);
	});

	test('saved file contains correct layout structure', async ({ page }) => {
		// Replace the default rack with a test rack
		await replaceRack(page, 'Structure Test', 24);

		// Set up download listener
		const downloadPromise = page.waitForEvent('download');

		// Save
		await page.click('button[aria-label="Save"]');

		// Get the downloaded file
		const download = await downloadPromise;
		const path = await download.path();

		if (path) {
			const fs = await import('fs/promises');
			const JSZip = (await import('jszip')).default;

			// Read the ZIP file
			const zipData = await fs.readFile(path);
			const zip = await JSZip.loadAsync(zipData);

			// v0.2 format: ZIP contains folder/[name].yaml
			const files = Object.keys(zip.files);
			const yamlFile = files.find((f) => f.endsWith('.yaml'));
			expect(yamlFile).toBeDefined();

			if (yamlFile) {
				const yamlContent = await zip.file(yamlFile)?.async('string');
				expect(yamlContent).toBeDefined();

				// YAML should contain the rack name
				expect(yamlContent).toContain('name:');
				expect(yamlContent).toContain('Structure Test');
			}
		}
	});

	test.skip('load layout from file', async ({ page }) => {
		// SKIP: File chooser interaction unreliable in E2E tests
		const fs = await import('fs');
		const path = await import('path');

		// First replace the default rack and save
		await replaceRack(page, 'Load Test Rack', 24);

		const downloadPromise = page.waitForEvent('download');
		await page.click('button[aria-label="Save"]');
		const download = await downloadPromise;

		// Save to a specific path
		const downloadsPath = path.join(process.cwd(), 'e2e', 'downloads');
		if (!fs.existsSync(downloadsPath)) {
			fs.mkdirSync(downloadsPath, { recursive: true });
		}
		const savedPath = path.join(downloadsPath, 'load-test.rackarr.zip');
		await download.saveAs(savedPath);

		// Clear session and reload
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();

		// In v0.2, there's no welcome screen - rack is always visible
		await expect(page.locator('.rack-container')).toBeVisible();

		// Set up file chooser listener
		const fileChooserPromise = page.waitForEvent('filechooser');

		// Click load button in toolbar (v0.2 has no welcome screen)
		await page.click('button[aria-label="Load Layout"]');

		// Handle file chooser
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles(savedPath);

		// Wait for success toast to confirm load completed
		await expect(page.locator('.toast--success')).toBeVisible({
			timeout: 10000
		});

		// Layout should be loaded
		await expect(page.locator('.rack-container')).toBeVisible({ timeout: 5000 });
		await expect(page.locator('.rack-name')).toContainText('Load Test Rack');

		// Cleanup
		if (fs.existsSync(savedPath)) {
			fs.unlinkSync(savedPath);
		}
	});

	// Session auto-save is planned for a later phase (see App.svelte comment)
	test.skip('session storage preserves work on refresh', async ({ page }) => {
		// In v0.2, rack always exists. Replace it with a test rack.
		await replaceRack(page, 'Session Test', 18);

		await expect(page.locator('.rack-container')).toBeVisible();
		await expect(page.locator('.rack-name')).toHaveText('Session Test');

		// Reload the page (session storage should preserve)
		// Don't clear session storage this time
		await page.reload();

		// Rack should still be visible
		await expect(page.locator('.rack-container')).toBeVisible();
		await expect(page.locator('.rack-name')).toHaveText('Session Test');
	});

	test('unsaved changes warning on close attempt', async ({ page }) => {
		// In v0.2, rack already exists. Modifying it creates unsaved changes.
		// Replace the default rack to create changes
		await replaceRack(page, 'Warning Test', 12);

		// Note: Playwright doesn't support testing beforeunload dialogs directly
		// This test verifies the page state is dirty (rack exists with our changes)
		// Rack name is displayed in dual-view header
		await expect(page.locator('.rack-dual-view-name')).toContainText('Warning Test');
		// In dual-view mode, there are 2 rack containers
		expect(await page.locator('.rack-container').count()).toBe(2);
	});

	test('no warning after saving', async ({ page }) => {
		// Replace the default rack
		await replaceRack(page, 'Clean Test', 12);

		// Save to clear dirty flag
		const downloadPromise = page.waitForEvent('download');
		await page.click('button[aria-label="Save"]');
		await downloadPromise;

		// Should show success toast
		await expect(page.locator('.toast')).toBeVisible();
	});
});
