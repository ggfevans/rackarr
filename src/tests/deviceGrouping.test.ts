import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage before importing the module
const localStorageMock = {
	store: {} as Record<string, string>,
	getItem: vi.fn((key: string) => localStorageMock.store[key] ?? null),
	setItem: vi.fn((key: string, value: string) => {
		localStorageMock.store[key] = value;
	}),
	removeItem: vi.fn((key: string) => {
		delete localStorageMock.store[key];
	}),
	clear: vi.fn(() => {
		localStorageMock.store = {};
	})
};

Object.defineProperty(globalThis, 'localStorage', {
	value: localStorageMock,
	writable: true
});

// Import after mocking
import {
	loadGroupingModeFromStorage,
	saveGroupingModeToStorage,
	type DeviceGroupingMode
} from '$lib/utils/deviceGrouping';

describe('deviceGrouping utilities', () => {
	beforeEach(() => {
		localStorageMock.clear();
		vi.clearAllMocks();
	});

	describe('loadGroupingModeFromStorage', () => {
		it('returns brand as default when no mode stored', () => {
			const mode = loadGroupingModeFromStorage();
			expect(mode).toBe('brand');
		});

		it('returns brand when stored value is brand', () => {
			localStorageMock.store['rackarr-device-grouping'] = 'brand';
			const mode = loadGroupingModeFromStorage();
			expect(mode).toBe('brand');
		});

		it('returns category when stored value is category', () => {
			localStorageMock.store['rackarr-device-grouping'] = 'category';
			const mode = loadGroupingModeFromStorage();
			expect(mode).toBe('category');
		});

		it('returns flat when stored value is flat', () => {
			localStorageMock.store['rackarr-device-grouping'] = 'flat';
			const mode = loadGroupingModeFromStorage();
			expect(mode).toBe('flat');
		});

		it('returns brand for invalid stored value', () => {
			localStorageMock.store['rackarr-device-grouping'] = 'invalid-mode';
			const mode = loadGroupingModeFromStorage();
			expect(mode).toBe('brand');
		});

		it('returns brand when localStorage throws', () => {
			localStorageMock.getItem.mockImplementationOnce(() => {
				throw new Error('Storage error');
			});
			const mode = loadGroupingModeFromStorage();
			expect(mode).toBe('brand');
		});
	});

	describe('saveGroupingModeToStorage', () => {
		it('saves brand mode to localStorage', () => {
			saveGroupingModeToStorage('brand');
			expect(localStorageMock.setItem).toHaveBeenCalledWith('rackarr-device-grouping', 'brand');
		});

		it('saves category mode to localStorage', () => {
			saveGroupingModeToStorage('category');
			expect(localStorageMock.setItem).toHaveBeenCalledWith('rackarr-device-grouping', 'category');
		});

		it('saves flat mode to localStorage', () => {
			saveGroupingModeToStorage('flat');
			expect(localStorageMock.setItem).toHaveBeenCalledWith('rackarr-device-grouping', 'flat');
		});

		it('does not throw when localStorage throws', () => {
			localStorageMock.setItem.mockImplementationOnce(() => {
				throw new Error('Storage error');
			});
			expect(() => saveGroupingModeToStorage('brand')).not.toThrow();
		});
	});

	describe('DeviceGroupingMode type', () => {
		it('accepts valid modes', () => {
			const modes: DeviceGroupingMode[] = ['brand', 'category', 'flat'];
			expect(modes).toHaveLength(3);
		});
	});
});
