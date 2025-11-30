/**
 * Debug logging utilities
 * Automatically enabled in development mode (npm run dev)
 * Can be manually toggled in production via window.RACKARR_DEBUG
 */

// Extend Window interface for debug flag
declare global {
	interface Window {
		RACKARR_DEBUG?: boolean;
		enableRackarrDebug?: () => void;
		disableRackarrDebug?: () => void;
	}
}

// Check for debug flag - automatically enabled in dev mode
const getDebugFlag = (): boolean => {
	// Always enable in development mode
	if (import.meta.env.DEV) {
		return true;
	}

	// In production, check for manual override
	if (typeof window === 'undefined') return false;

	// Check window flag (manual override in production)
	if (window.RACKARR_DEBUG !== undefined) {
		return window.RACKARR_DEBUG === true;
	}

	return false;
};

export const debug = {
	log(...args: unknown[]) {
		if (getDebugFlag()) {
			console.log('[RACKARR DEBUG]', ...args);
		}
	},

	warn(...args: unknown[]) {
		if (getDebugFlag()) {
			console.warn('[RACKARR DEBUG]', ...args);
		}
	},

	error(...args: unknown[]) {
		if (getDebugFlag()) {
			console.error('[RACKARR DEBUG]', ...args);
		}
	},

	group(label: string) {
		if (getDebugFlag()) {
			console.group(`[RACKARR DEBUG] ${label}`);
		}
	},

	groupEnd() {
		if (getDebugFlag()) {
			console.groupEnd();
		}
	},

	isEnabled(): boolean {
		return getDebugFlag();
	}
};

// Expose control functions to window (for production debugging)
if (typeof window !== 'undefined') {
	window.enableRackarrDebug = () => {
		window.RACKARR_DEBUG = true;
		console.log('[RACKARR] Debug logging enabled.');
	};

	window.disableRackarrDebug = () => {
		window.RACKARR_DEBUG = false;
		console.log('[RACKARR] Debug logging disabled.');
	};

	// Log mode on startup
	if (import.meta.env.DEV) {
		console.log('[RACKARR] Running in development mode - debug logging enabled');
	}
}
