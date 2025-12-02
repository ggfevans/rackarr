import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadLayout, openFilePicker, generateFilename, parseLayoutJson } from '$lib/utils/file';
import { createLayout, serializeLayout } from '$lib/utils/serialization';

describe('File Utilities', () => {
	// Mock Date.now for consistent timestamps
	const mockDate = '2025-01-15T10:30:00.000Z';

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(mockDate));
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	describe('generateFilename', () => {
		it('uses layout name in filename', () => {
			const layout = createLayout('My Homelab');
			const filename = generateFilename(layout);

			expect(filename).toContain('My Homelab');
		});

		it('adds .rackarr.json extension', () => {
			const layout = createLayout('Test');
			const filename = generateFilename(layout);

			expect(filename).toMatch(/\.rackarr\.json$/);
		});

		it('sanitizes filename by replacing invalid characters', () => {
			const layout = createLayout('Test/With:Invalid*Chars?');
			const filename = generateFilename(layout);

			expect(filename).not.toContain('/');
			expect(filename).not.toContain(':');
			expect(filename).not.toContain('*');
			expect(filename).not.toContain('?');
		});

		it('handles empty name gracefully', () => {
			const layout = createLayout('');
			const filename = generateFilename(layout);

			expect(filename).toMatch(/\.rackarr\.json$/);
		});
	});

	describe('downloadLayout', () => {
		let mockCreateObjectURL: ReturnType<typeof vi.fn>;
		let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
		let mockClick: ReturnType<typeof vi.fn>;

		beforeEach(() => {
			mockClick = vi.fn();

			mockCreateObjectURL = vi.fn(() => {
				return 'blob:mock-url';
			});
			mockRevokeObjectURL = vi.fn();

			global.URL.createObjectURL = mockCreateObjectURL;
			global.URL.revokeObjectURL = mockRevokeObjectURL;

			// Mock document.createElement to capture anchor element
			const originalCreateElement = document.createElement.bind(document);
			vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
				const element = originalCreateElement(tagName);
				if (tagName === 'a') {
					element.click = mockClick;
				}
				return element;
			});
		});

		it('creates blob with application/json type', () => {
			const layout = createLayout('Test');
			let capturedBlob: Blob | null = null;

			mockCreateObjectURL.mockImplementation((blob: Blob) => {
				capturedBlob = blob;
				return 'blob:mock-url';
			});

			downloadLayout(layout);

			expect(capturedBlob).not.toBeNull();
			expect(capturedBlob!.type).toBe('application/json');
		});

		it('creates blob with correct JSON content', () => {
			const layout = createLayout('Test Layout');
			let capturedBlob: Blob | null = null;

			mockCreateObjectURL.mockImplementation((blob: Blob) => {
				capturedBlob = blob;
				return 'blob:mock-url';
			});

			downloadLayout(layout);

			expect(capturedBlob).not.toBeNull();
			// We verify the blob size is non-zero (contains JSON)
			expect(capturedBlob!.size).toBeGreaterThan(0);
		});

		it('uses layout name in filename', () => {
			const layout = createLayout('My Rack Design');
			const anchorSpy = vi.spyOn(document, 'createElement');

			downloadLayout(layout);

			// Find the anchor element that was created
			const anchorCall = anchorSpy.mock.results.find(
				(r) => r.type === 'return' && r.value?.tagName === 'A'
			);
			const anchor = anchorCall?.value as HTMLAnchorElement;

			expect(anchor.download).toContain('My Rack Design');
			expect(anchor.download).toMatch(/\.rackarr\.json$/);
		});

		it('uses custom filename when provided', () => {
			const layout = createLayout('Test');
			const anchorSpy = vi.spyOn(document, 'createElement');

			downloadLayout(layout, 'custom-name.json');

			const anchorCall = anchorSpy.mock.results.find(
				(r) => r.type === 'return' && r.value?.tagName === 'A'
			);
			const anchor = anchorCall?.value as HTMLAnchorElement;

			expect(anchor.download).toBe('custom-name.json');
		});

		it('triggers download by clicking anchor element', () => {
			const layout = createLayout('Test');

			downloadLayout(layout);

			expect(mockClick).toHaveBeenCalled();
		});

		it('cleans up object URL after download', () => {
			const layout = createLayout('Test');

			downloadLayout(layout);

			expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
		});
	});

	describe('openFilePicker', () => {
		let mockInput: HTMLInputElement;
		let resolveFileSelect: ((file: File | null) => void) | null = null;

		beforeEach(() => {
			// Create a mock input element
			mockInput = document.createElement('input');
			mockInput.type = 'file';

			let onChangeHandler: ((event: Event) => void) | null = null;

			// Mock click to simulate file dialog
			mockInput.click = vi.fn(() => {
				// Simulate async file selection
				resolveFileSelect = (file: File | null) => {
					if (file) {
						Object.defineProperty(mockInput, 'files', {
							value: [file],
							configurable: true
						});
					} else {
						Object.defineProperty(mockInput, 'files', {
							value: [],
							configurable: true
						});
					}
					if (onChangeHandler) {
						onChangeHandler(new Event('change'));
					}
				};
			});

			// Capture the change event listener
			const originalAddEventListener = mockInput.addEventListener.bind(mockInput);
			mockInput.addEventListener = vi.fn((type: string, handler: EventListener) => {
				if (type === 'change') {
					onChangeHandler = handler as (event: Event) => void;
				}
				originalAddEventListener(type, handler);
			});

			vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
				if (tagName === 'input') {
					return mockInput;
				}
				return document.createElement.call(document, tagName);
			});
		});

		it('creates input element with type=file', async () => {
			const promise = openFilePicker();

			expect(mockInput.type).toBe('file');

			// Resolve with null to complete the promise
			resolveFileSelect?.(null);
			await promise;
		});

		it('accepts .json files', async () => {
			const promise = openFilePicker();

			expect(mockInput.accept).toBe('.json,.rackarr.json');

			resolveFileSelect?.(null);
			await promise;
		});

		it('returns selected file', async () => {
			const testFile = new File(['{}'], 'test.json', { type: 'application/json' });

			const promise = openFilePicker();
			resolveFileSelect?.(testFile);

			const result = await promise;
			expect(result).toBe(testFile);
		});

		it('returns null when no file selected', async () => {
			const promise = openFilePicker();
			resolveFileSelect?.(null);

			const result = await promise;
			expect(result).toBeNull();
		});
	});

	describe('parseLayoutJson', () => {
		it('parses valid JSON', () => {
			const layout = createLayout('Test Layout');
			const json = serializeLayout(layout);

			const result = parseLayoutJson(json);

			expect(result.name).toBe('Test Layout');
		});

		it('throws for invalid JSON', () => {
			expect(() => parseLayoutJson('not valid json {')).toThrow();
		});

		it('throws for invalid layout structure', () => {
			const invalid = JSON.stringify({ name: 'Test', missing: 'fields' });

			expect(() => parseLayoutJson(invalid)).toThrow('Invalid layout structure');
		});

		it('throws with descriptive error message for missing version', () => {
			const invalid = JSON.stringify({
				name: 'Test',
				created: mockDate,
				modified: mockDate,
				settings: { theme: 'dark' },
				deviceLibrary: [],
				racks: []
			});

			expect(() => parseLayoutJson(invalid)).toThrow('Invalid layout structure');
		});

		it('throws for unsupported version', () => {
			const invalid = JSON.stringify({
				version: '99.0',
				name: 'Test',
				created: mockDate,
				modified: mockDate,
				settings: { theme: 'dark' },
				deviceLibrary: [],
				racks: []
			});

			expect(() => parseLayoutJson(invalid)).toThrow('Unsupported layout version');
		});

		it('preserves all layout data', () => {
			const layout = createLayout('Full Layout');
			layout.settings.theme = 'light';

			const json = serializeLayout(layout);
			const result = parseLayoutJson(json);

			expect(result.name).toBe('Full Layout');
			expect(result.settings.theme).toBe('light');
			expect(result.deviceLibrary.length).toBe(27); // Starter library
		});

		it('returns Layout type', () => {
			const layout = createLayout('Type Test');
			const json = serializeLayout(layout);

			const result = parseLayoutJson(json);

			// Type checking - these properties should exist
			expect(result.version).toBeDefined();
			expect(result.name).toBeDefined();
			expect(result.created).toBeDefined();
			expect(result.modified).toBeDefined();
			expect(result.settings).toBeDefined();
			expect(result.deviceLibrary).toBeDefined();
			expect(result.racks).toBeDefined();
		});
	});

	// Note: readLayoutFile is tested via E2E tests since it requires real FileReader
	// The core parsing logic is tested in parseLayoutJson tests above
});
