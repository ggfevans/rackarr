/**
 * Browser API Mocks
 *
 * Centralized mocks for browser APIs not available in jsdom.
 * Import these in tests that need Canvas, FileReader, or Image mocking.
 *
 * @example
 * import { createMockCanvas, createMockImage, createMockFileReader } from './mocks/browser';
 *
 * const canvas = createMockCanvas();
 * vi.spyOn(document, 'createElement').mockImplementation((tag) => {
 *   if (tag === 'canvas') return canvas;
 *   return originalCreateElement(tag);
 * });
 */

import { vi } from 'vitest';

// =============================================================================
// Canvas Mock
// =============================================================================

export interface MockCanvasContext {
	drawImage: ReturnType<typeof vi.fn>;
	fillRect: ReturnType<typeof vi.fn>;
	clearRect: ReturnType<typeof vi.fn>;
	getImageData: ReturnType<typeof vi.fn>;
	putImageData: ReturnType<typeof vi.fn>;
}

export interface MockCanvas {
	getContext: ReturnType<typeof vi.fn>;
	toBlob: ReturnType<typeof vi.fn>;
	toDataURL: ReturnType<typeof vi.fn>;
	width: number;
	height: number;
}

/**
 * Creates a mock canvas element with 2D context.
 *
 * @param options.blobType - MIME type for toBlob callback (default: 'image/png')
 * @param options.blobContent - Content for the blob (default: 'test')
 */
export function createMockCanvas(options: { blobType?: string; blobContent?: string } = {}): MockCanvas {
	const { blobType = 'image/png', blobContent = 'test' } = options;

	const mockContext: MockCanvasContext = {
		drawImage: vi.fn(),
		fillRect: vi.fn(),
		clearRect: vi.fn(),
		getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })),
		putImageData: vi.fn()
	};

	return {
		getContext: vi.fn(() => mockContext),
		toBlob: vi.fn((callback: (blob: Blob | null) => void) => {
			callback(new Blob([blobContent], { type: blobType }));
		}),
		toDataURL: vi.fn(() => `data:${blobType};base64,dGVzdA==`),
		width: 0,
		height: 0
	};
}

// =============================================================================
// Image Mock
// =============================================================================

export interface MockImage {
	onload: (() => void) | null;
	onerror: ((error: Error) => void) | null;
	src: string;
	width: number;
	height: number;
}

/**
 * Creates a mock Image that triggers onload after a microtask.
 *
 * @param dimensions - Width and height of the mock image
 * @param shouldFail - If true, triggers onerror instead of onload
 */
export function createMockImage(
	dimensions: { width: number; height: number } = { width: 100, height: 100 },
	shouldFail = false
): MockImage {
	const mockImage: MockImage = {
		onload: null,
		onerror: null,
		src: '',
		width: dimensions.width,
		height: dimensions.height
	};

	// Use Object.defineProperty to trigger load/error when src is set
	let srcValue = '';
	Object.defineProperty(mockImage, 'src', {
		get: () => srcValue,
		set: (value: string) => {
			srcValue = value;
			setTimeout(() => {
				if (shouldFail) {
					mockImage.onerror?.(new Error('Failed to load image'));
				} else {
					mockImage.onload?.();
				}
			}, 0);
		}
	});

	return mockImage;
}

/**
 * Sets up Image constructor mock.
 * Returns a cleanup function to restore the original.
 *
 * @example
 * const cleanup = setupImageMock({ width: 200, height: 100 });
 * // ... run tests
 * cleanup();
 */
export function setupImageMock(
	dimensions: { width: number; height: number } = { width: 100, height: 100 },
	shouldFail = false
): () => void {
	const originalImage = globalThis.Image;

	vi.spyOn(globalThis, 'Image').mockImplementation(() => {
		return createMockImage(dimensions, shouldFail) as unknown as HTMLImageElement;
	});

	return () => {
		globalThis.Image = originalImage;
		vi.restoreAllMocks();
	};
}

// =============================================================================
// FileReader Mock
// =============================================================================

export interface MockFileReader {
	onload: ((e: { target: { result: string } }) => void) | null;
	onerror: ((e: Error) => void) | null;
	readAsDataURL: ReturnType<typeof vi.fn>;
	readAsText: ReturnType<typeof vi.fn>;
	readAsArrayBuffer: ReturnType<typeof vi.fn>;
	result: string | ArrayBuffer | null;
}

/**
 * Creates a mock FileReader that resolves with the given result.
 *
 * @param result - The result to return (data URL string or ArrayBuffer)
 * @param shouldFail - If true, triggers onerror
 */
export function createMockFileReader(
	result: string = 'data:image/png;base64,dGVzdA==',
	shouldFail = false
): MockFileReader {
	const mockReader: MockFileReader = {
		onload: null,
		onerror: null,
		readAsDataURL: vi.fn(),
		readAsText: vi.fn(),
		readAsArrayBuffer: vi.fn(),
		result
	};

	// Set up each read method to trigger onload/onerror
	const setupReadMethod = (method: 'readAsDataURL' | 'readAsText' | 'readAsArrayBuffer') => {
		mockReader[method] = vi.fn(function (this: MockFileReader) {
			setTimeout(() => {
				if (shouldFail) {
					this.onerror?.(new Error('Failed to read file'));
				} else {
					this.onload?.({ target: { result } });
				}
			}, 0);
		});
	};

	setupReadMethod('readAsDataURL');
	setupReadMethod('readAsText');
	setupReadMethod('readAsArrayBuffer');

	return mockReader;
}

/**
 * Sets up FileReader constructor mock.
 * Returns a cleanup function to restore the original.
 */
export function setupFileReaderMock(
	result: string = 'data:image/png;base64,dGVzdA==',
	shouldFail = false
): () => void {
	const originalFileReader = globalThis.FileReader;

	vi.spyOn(globalThis, 'FileReader').mockImplementation(() => {
		return createMockFileReader(result, shouldFail) as unknown as FileReader;
	});

	return () => {
		globalThis.FileReader = originalFileReader;
		vi.restoreAllMocks();
	};
}

// =============================================================================
// URL Mock
// =============================================================================

/**
 * Sets up URL.createObjectURL and URL.revokeObjectURL mocks.
 * Returns cleanup function.
 */
export function setupURLMock(): () => void {
	const originalCreateObjectURL = URL.createObjectURL;
	const originalRevokeObjectURL = URL.revokeObjectURL;

	URL.createObjectURL = vi.fn(() => 'blob:mock-url-' + Math.random().toString(36).slice(2));
	URL.revokeObjectURL = vi.fn();

	return () => {
		URL.createObjectURL = originalCreateObjectURL;
		URL.revokeObjectURL = originalRevokeObjectURL;
	};
}

// =============================================================================
// File Mock
// =============================================================================

/**
 * Creates a mock File object.
 *
 * @param name - Filename
 * @param type - MIME type
 * @param size - File size in bytes
 */
export function createMockFile(name: string, type: string, size: number = 1024): File {
	const content = new Array(size).fill('a').join('');
	return new File([content], name, { type });
}

// =============================================================================
// Combined Setup
// =============================================================================

/**
 * Sets up all browser mocks commonly needed for image handling tests.
 * Returns a cleanup function.
 *
 * @example
 * describe('Image tests', () => {
 *   let cleanup: () => void;
 *
 *   beforeAll(() => {
 *     cleanup = setupBrowserMocks();
 *   });
 *
 *   afterAll(() => {
 *     cleanup();
 *   });
 * });
 */
export function setupBrowserMocks(options: {
	imageDimensions?: { width: number; height: number };
	fileReaderResult?: string;
} = {}): () => void {
	const cleanupURL = setupURLMock();
	const cleanupImage = setupImageMock(options.imageDimensions);
	const cleanupFileReader = setupFileReaderMock(options.fileReaderResult);

	return () => {
		cleanupURL();
		cleanupImage();
		cleanupFileReader();
	};
}
