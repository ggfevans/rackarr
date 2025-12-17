/**
 * Analytics utilities for Umami integration
 * Privacy-focused event tracking with TypeScript support
 */

// Typed event definitions
export interface AnalyticsEvents {
	// File operations
	'file:save': { device_count: number };
	'file:load': { device_count: number };

	// Export operations
	'export:image': { format: 'png' | 'jpeg' | 'svg'; view: 'front' | 'rear' | 'both' };
	'export:pdf': { view: 'front' | 'rear' | 'both' };
	'export:csv': Record<string, never>;

	// Device operations
	'device:place': { category: string };
	'device:create_custom': { category: string };

	// Feature usage
	'feature:display_mode': { mode: 'label' | 'image' | 'image-label' };
	'feature:rack_resize': { height: number };

	// Keyboard shortcuts
	'keyboard:shortcut': { shortcut: string };
}

// Session properties (privacy-compliant)
export interface SessionProperties {
	app_version: string;
	screen_category: 'mobile' | 'tablet' | 'desktop';
	color_scheme_preference: 'dark' | 'light' | 'no-preference';
}

// Internal state
let isInitialized = false;
let isEnabled = false;

/**
 * Check if analytics is available and enabled
 */
export function isAnalyticsEnabled(): boolean {
	return isEnabled && typeof window !== 'undefined' && !!window.umami;
}

/**
 * Initialize analytics - call once on app startup
 * Dynamically loads the Umami script if enabled and configured
 */
export function initAnalytics(): void {
	if (isInitialized) return;
	isInitialized = true;

	// Check if enabled via build-time constant
	isEnabled = typeof __UMAMI_ENABLED__ !== 'undefined' && __UMAMI_ENABLED__;
	if (!isEnabled) return;

	// Skip in development
	const host = location.hostname;
	if (host === 'localhost' || host === '127.0.0.1') return;

	// Validate configuration
	const scriptUrl = typeof __UMAMI_SCRIPT_URL__ !== 'undefined' ? __UMAMI_SCRIPT_URL__ : '';
	const websiteId = typeof __UMAMI_WEBSITE_ID__ !== 'undefined' ? __UMAMI_WEBSITE_ID__ : '';
	if (!scriptUrl || !websiteId) return;

	// Dynamically load Umami script
	const script = document.createElement('script');
	script.defer = true;
	script.src = scriptUrl;
	script.dataset.websiteId = websiteId;
	script.onload = () => identifySession();
	document.head.appendChild(script);
}

/**
 * Identify the session with privacy-compliant properties
 */
function identifySession(): void {
	if (!isAnalyticsEnabled()) return;

	const properties: SessionProperties = {
		app_version: typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'unknown',
		screen_category: getScreenCategory(),
		color_scheme_preference: getColorSchemePreference()
	};

	window.umami?.identify(properties);
}

/**
 * Track a typed analytics event
 */
export function trackEvent<E extends keyof AnalyticsEvents>(
	eventName: E,
	properties?: AnalyticsEvents[E]
): void {
	if (!isAnalyticsEnabled()) return;

	try {
		if (properties && Object.keys(properties).length > 0) {
			window.umami?.track(eventName, properties);
		} else {
			window.umami?.track(eventName);
		}
	} catch {
		// Silently fail - analytics should never break the app
	}
}

/**
 * Convenience functions for common events
 */
export const analytics = {
	// File operations
	trackSave: (deviceCount: number) => trackEvent('file:save', { device_count: deviceCount }),

	trackLoad: (deviceCount: number) => trackEvent('file:load', { device_count: deviceCount }),

	// Export operations
	trackExportImage: (format: 'png' | 'jpeg' | 'svg', view: 'front' | 'rear' | 'both') =>
		trackEvent('export:image', { format, view }),

	trackExportPDF: (view: 'front' | 'rear' | 'both') => trackEvent('export:pdf', { view }),

	trackExportCSV: () => trackEvent('export:csv', {}),

	// Device operations
	trackDevicePlace: (category: string) => trackEvent('device:place', { category }),

	trackCustomDeviceCreate: (category: string) => trackEvent('device:create_custom', { category }),

	// Feature usage
	trackDisplayModeToggle: (mode: 'label' | 'image' | 'image-label') =>
		trackEvent('feature:display_mode', { mode }),

	trackRackResize: (height: number) => trackEvent('feature:rack_resize', { height }),

	// Keyboard shortcuts
	trackKeyboardShortcut: (shortcut: string) => trackEvent('keyboard:shortcut', { shortcut })
};

// Helper functions

function getScreenCategory(): 'mobile' | 'tablet' | 'desktop' {
	const width = window.innerWidth;
	if (width < 768) return 'mobile';
	if (width < 1024) return 'tablet';
	return 'desktop';
}

function getColorSchemePreference(): 'dark' | 'light' | 'no-preference' {
	if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
	if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
	return 'no-preference';
}
