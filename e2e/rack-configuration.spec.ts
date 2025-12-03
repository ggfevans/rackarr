import { test, expect, Page } from '@playwright/test';

/**
 * Helper to open the New Rack form via the replace flow (v0.2)
 * In v0.2, a rack always exists. Clicking New Rack opens replace dialog first.
 */
async function openNewRackForm(page: Page) {
	await page.click('button[aria-label="New Rack"]');
	await page.click('button:has-text("Replace")');
	await expect(page.locator('.dialog')).toBeVisible();
}

test.describe('Rack Configuration', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => sessionStorage.clear());
		await page.reload();
	});

	test('can create 10-inch rack with narrower render', async ({ page }) => {
		await openNewRackForm(page);

		// Fill in rack details
		await page.fill('#rack-name', 'Narrow Rack');
		await page.click('.height-btn:has-text("24U")');

		// Select 10" width using radio button
		await page.click('.width-option:has-text("10")');

		await page.click('button:has-text("Create")');

		// Rack should be visible
		await expect(page.locator('.rack-container')).toBeVisible();

		// The rack SVG should have a narrower viewBox for 10" rack
		const rackSvg = page.locator('.rack-svg').first();
		const viewBox = await rackSvg.getAttribute('viewBox');
		expect(viewBox).toBeDefined();

		if (viewBox) {
			const parts = viewBox.split(' ');
			const width = parseFloat(parts[2] || '0');
			// 10" rack should be narrower (roughly half of 19")
			expect(width).toBeLessThan(200);
		}
	});

	test('can create 19-inch rack with standard render', async ({ page }) => {
		await openNewRackForm(page);

		await page.fill('#rack-name', 'Standard Rack');
		await page.click('.height-btn:has-text("42U")');
		// 19" is default, no need to change

		await page.click('button:has-text("Create")');

		await expect(page.locator('.rack-container')).toBeVisible();

		const rackSvg = page.locator('.rack-svg').first();
		const viewBox = await rackSvg.getAttribute('viewBox');
		expect(viewBox).toBeDefined();

		if (viewBox) {
			const parts = viewBox.split(' ');
			const width = parseFloat(parts[2] || '0');
			// 19" rack should be standard width
			expect(width).toBeGreaterThan(200);
		}
	});

	// Descending units test removed - feature not in current UI

	test('rack with ascending units shows U1 at bottom', async ({ page }) => {
		await openNewRackForm(page);

		await page.fill('#rack-name', 'Ascending Rack');
		await page.click('.height-btn:has-text("Custom")');
		await page.fill('#custom-height', '10');

		await page.click('button:has-text("Create")');

		await expect(page.locator('.rack-container')).toBeVisible();

		// In ascending mode, U1 is at the bottom (last in DOM order typically)
		const uLabels = page.locator('.u-label');
		const lastLabel = uLabels.last();
		await expect(lastLabel).toHaveText('1');
	});

	test.skip('rack with custom starting unit displays correct labels', async ({ page }) => {
		// SKIP: Starting unit input not yet implemented in NewRackForm
		await openNewRackForm(page);

		await page.fill('#rack-name', 'Custom Start Rack');
		await page.click('.height-btn:has-text("Custom")');
		await page.fill('#custom-height', '10');

		// Set starting unit to 5
		const startingUnitInput = page.locator('#starting-unit, input[name="starting_unit"]');
		await startingUnitInput.fill('5');

		await page.click('button:has-text("Create")');

		await expect(page.locator('.rack-container')).toBeVisible();

		// U labels should start at 5 and go to 14 (5 + 10 - 1)
		// Labels show numbers only (no "U" prefix)
		await expect(page.locator('.u-label', { hasText: '5' })).toBeVisible();
		await expect(page.locator('.u-label', { hasText: '14' })).toBeVisible();

		// U1-U4 should not exist (1-4)
		await expect(page.locator('.u-label', { hasText: /^1$/ })).not.toBeVisible();
	});

	test.skip('form factor selection is available', async ({ page }) => {
		// SKIP: Form factor dropdown not yet implemented in NewRackForm
		await openNewRackForm(page);

		// Form factor dropdown should exist
		const formFactorSelect = page.locator('#form-factor');
		await expect(formFactorSelect).toBeVisible();

		// Check that options are attached (options in select aren't visible)
		await expect(formFactorSelect.locator('option:has-text("4-Post Cabinet")')).toBeAttached();
	});
});
