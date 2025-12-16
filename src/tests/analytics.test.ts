import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initAnalytics, trackEvent, isAnalyticsEnabled, analytics } from '$lib/utils/analytics';

describe('analytics', () => {
	beforeEach(() => {
		// Reset module state by re-importing would be ideal, but for now
		// we test the public API behavior
		vi.stubGlobal('__UMAMI_ENABLED__', false);
		vi.stubGlobal('__APP_VERSION__', '0.5.7');
		vi.stubGlobal('__UMAMI_SCRIPT_URL__', '');
		vi.stubGlobal('__UMAMI_WEBSITE_ID__', '');
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('isAnalyticsEnabled', () => {
		it('returns false when umami is not loaded', () => {
			expect(isAnalyticsEnabled()).toBe(false);
		});

		it('returns false when disabled via config', () => {
			vi.stubGlobal('__UMAMI_ENABLED__', false);
			expect(isAnalyticsEnabled()).toBe(false);
		});
	});

	describe('initAnalytics', () => {
		it('does not throw when called', () => {
			expect(() => initAnalytics()).not.toThrow();
		});

		it('can be called multiple times safely', () => {
			expect(() => {
				initAnalytics();
				initAnalytics();
				initAnalytics();
			}).not.toThrow();
		});
	});

	describe('trackEvent', () => {
		it('does not throw when analytics disabled', () => {
			expect(() => trackEvent('file:save', { device_count: 5 })).not.toThrow();
		});

		it('does not throw with empty properties', () => {
			expect(() => trackEvent('export:csv', {})).not.toThrow();
		});
	});

	describe('analytics convenience functions', () => {
		it('trackSave does not throw', () => {
			expect(() => analytics.trackSave(10)).not.toThrow();
		});

		it('trackLoad does not throw', () => {
			expect(() => analytics.trackLoad(5)).not.toThrow();
		});

		it('trackExportImage does not throw', () => {
			expect(() => analytics.trackExportImage('png', 'both')).not.toThrow();
		});

		it('trackExportPDF does not throw', () => {
			expect(() => analytics.trackExportPDF('front')).not.toThrow();
		});

		it('trackExportCSV does not throw', () => {
			expect(() => analytics.trackExportCSV()).not.toThrow();
		});

		it('trackDevicePlace does not throw', () => {
			expect(() => analytics.trackDevicePlace('server')).not.toThrow();
		});

		it('trackCustomDeviceCreate does not throw', () => {
			expect(() => analytics.trackCustomDeviceCreate('network')).not.toThrow();
		});

		it('trackDisplayModeToggle does not throw', () => {
			expect(() => analytics.trackDisplayModeToggle('image')).not.toThrow();
		});

		it('trackAirflowView does not throw', () => {
			expect(() => analytics.trackAirflowView(true)).not.toThrow();
		});

		it('trackRackResize does not throw', () => {
			expect(() => analytics.trackRackResize(42)).not.toThrow();
		});

		it('trackKeyboardShortcut does not throw', () => {
			expect(() => analytics.trackKeyboardShortcut('Ctrl+S')).not.toThrow();
		});
	});
});
