import { test, expect, Page } from '@playwright/test';

/**
 * Helper to fill the rack creation form
 */
async function fillRackForm(page: Page, name: string, height: number) {
	await page.fill('#rack-name', name);

	const presetHeights = [12, 18, 24, 42];
	if (presetHeights.includes(height)) {
		await page.click(`.height-btn:has-text("${height}U")`);
	} else {
		await page.click('.height-btn:has-text("Custom")');
		await page.fill('#custom-height', String(height));
	}
}

/**
 * Helper to replace the current rack (v0.2 flow)
 */
async function replaceRack(page: Page, name: string, height: number) {
	await page.click('.toolbar-action-btn[aria-label="New Rack"]');
	await page.click('button:has-text("Replace")');
	await fillRackForm(page, name, height);
	await page.click('button:has-text("Create")');
}

/**
 * Helper to get the current panzoom transform
 */
async function getPanzoomTransform(page: Page) {
	return page.evaluate(() => {
		const panzoomContainer = document.querySelector('.panzoom-container');
		if (!panzoomContainer) return null;
		const style = (panzoomContainer as HTMLElement).style.transform;
		// Parse "matrix(a, b, c, d, tx, ty)" format
		const match = style.match(/matrix\(([^)]+)\)/);
		if (!match) return null;
		const values = match[1].split(',').map((v) => parseFloat(v.trim()));
		return { scale: values[0], x: values[4], y: values[5] };
	});
}

test.describe('View Reset on Rack Changes', () => {
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

	test('view resets when creating a new rack', async ({ page }) => {
		// Pan the view to an offset position first
		const canvas = page.locator('.canvas');
		await canvas.click();

		// Use keyboard to pan (simulate user interaction that changes view)
		// Or we can directly set a transform via evaluate
		await page.evaluate(() => {
			const panzoomContainer = document.querySelector('.panzoom-container');
			if (panzoomContainer) {
				(panzoomContainer as HTMLElement).style.transform = 'matrix(0.5, 0, 0, 0.5, -500, -500)';
			}
		});

		// Get transform before creating rack
		const transformBefore = await getPanzoomTransform(page);
		expect(transformBefore).toBeTruthy();

		// Create a new rack (replace existing)
		await replaceRack(page, 'Test Rack', 24);

		// Wait for the view to reset
		await page.waitForTimeout(300);

		// Get transform after creating rack
		const transformAfter = await getPanzoomTransform(page);
		expect(transformAfter).toBeTruthy();

		// The transform should have changed (view was reset)
		// We can't predict exact values, but the offset should be different
		// from our manually set -500, -500
		if (transformBefore && transformAfter) {
			// After fitAll, the view should be centered, not at -500,-500
			const viewChanged =
				transformAfter.x !== transformBefore.x || transformAfter.y !== transformBefore.y;
			expect(viewChanged).toBe(true);
		}
	});

	test('view resets when resizing rack height in EditPanel', async ({ page }) => {
		// First create a rack with specific height
		await replaceRack(page, 'Resize Test', 12);
		await page.waitForTimeout(300);

		// Select the rack to open EditPanel BEFORE panning away
		await page.locator('.rack-svg').first().click();
		await expect(page.locator('.drawer-right.open')).toBeVisible();

		// Pan the view to an offset position using keyboard shortcut or direct manipulation
		// We'll use the panzoom API through evaluate
		await page.evaluate(() => {
			const panzoomContainer = document.querySelector('.panzoom-container');
			if (panzoomContainer) {
				// Directly manipulate transform to simulate user panning away
				(panzoomContainer as HTMLElement).style.transform = 'matrix(1, 0, 0, 1, -300, -300)';
			}
		});

		// Get transform before resize (should be our panned position)
		const transformBefore = await getPanzoomTransform(page);
		expect(transformBefore).toBeTruthy();
		expect(transformBefore?.x).toBe(-300);

		// Find height preset button and change height
		// Click on a different height preset (e.g., 42U)
		await page.locator('.drawer-right .preset-btn:has-text("42U")').click();

		// Wait for the view to reset
		await page.waitForTimeout(300);

		// Get transform after resize
		const transformAfter = await getPanzoomTransform(page);

		// The transform should have changed (view was reset to center new rack size)
		// It should NOT still be at -300,-300
		expect(transformAfter).toBeTruthy();
		if (transformBefore && transformAfter) {
			const viewChanged =
				transformAfter.x !== transformBefore.x || transformAfter.y !== transformBefore.y;
			expect(viewChanged).toBe(true);
		}
	});

	test('view resets when resizing rack with numeric height input', async ({ page }) => {
		// Create a rack
		await replaceRack(page, 'Custom Height Test', 24);
		await page.waitForTimeout(300);

		// Select the rack BEFORE panning away
		await page.locator('.rack-svg').first().click();
		await expect(page.locator('.drawer-right.open')).toBeVisible();

		// Pan away after selection
		await page.evaluate(() => {
			const panzoomContainer = document.querySelector('.panzoom-container');
			if (panzoomContainer) {
				(panzoomContainer as HTMLElement).style.transform = 'matrix(1, 0, 0, 1, -200, -200)';
			}
		});

		const transformBefore = await getPanzoomTransform(page);
		expect(transformBefore).toBeTruthy();
		expect(transformBefore?.x).toBe(-200);

		// Use the numeric height input field to change height
		await page.locator('.drawer-right #rack-height').fill('36');
		// Trigger onchange by blurring
		await page.locator('.drawer-right #rack-height').blur();

		await page.waitForTimeout(300);

		const transformAfter = await getPanzoomTransform(page);

		// View should have reset, not still at -200,-200
		expect(transformAfter).toBeTruthy();
		if (transformBefore && transformAfter) {
			const viewChanged =
				transformAfter.x !== transformBefore.x || transformAfter.y !== transformBefore.y;
			expect(viewChanged).toBe(true);
		}
	});
});
