import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import ImageUpload from '$lib/components/ImageUpload.svelte';
import type { ImageData } from '$lib/types/images';
import { MAX_IMAGE_SIZE_BYTES } from '$lib/types/constants';

// Setup URL mocks for jsdom
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

beforeAll(() => {
	URL.createObjectURL = vi.fn(() => 'blob:mock-url');
	URL.revokeObjectURL = vi.fn();
});

afterAll(() => {
	URL.createObjectURL = originalCreateObjectURL;
	URL.revokeObjectURL = originalRevokeObjectURL;
});

beforeEach(() => {
	cleanup();
	vi.clearAllMocks();
});

// Helper to create mock File objects
function createMockFile(name: string, type: string, size: number = 1024): File {
	const content = new Array(size).fill('a').join('');
	return new File([content], name, { type });
}

// Helper to create mock ImageData
function createMockImageData(face: 'front' | 'rear'): ImageData {
	return {
		blob: createMockFile(`test-${face}.png`, 'image/png'),
		dataUrl: 'data:image/png;base64,mockdata',
		filename: `device-${face}.png`
	};
}

describe('ImageUpload Component', () => {
	describe('Initial State', () => {
		it('renders upload button when no image exists', () => {
			render(ImageUpload, { props: { face: 'front' } });

			expect(screen.getByRole('button', { name: 'Choose File' })).toBeInTheDocument();
		});

		it('displays correct label for front face', () => {
			render(ImageUpload, { props: { face: 'front' } });

			expect(screen.getByText('Front Image')).toBeInTheDocument();
		});

		it('displays correct label for rear face', () => {
			render(ImageUpload, { props: { face: 'rear' } });

			expect(screen.getByText('Rear Image')).toBeInTheDocument();
		});

		it('has hidden file input for accessibility', () => {
			render(ImageUpload, { props: { face: 'front' } });

			const fileInput = document.querySelector('input[type="file"]');
			expect(fileInput).toBeInTheDocument();
			expect(fileInput).toHaveClass('sr-only');
		});

		it('file input accepts correct image types', () => {
			render(ImageUpload, { props: { face: 'front' } });

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			expect(fileInput?.accept).toContain('image/png');
			expect(fileInput?.accept).toContain('image/jpeg');
			expect(fileInput?.accept).toContain('image/webp');
		});
	});

	describe('Image Preview', () => {
		it('shows preview when currentImage is provided', () => {
			const mockImage = createMockImageData('front');

			render(ImageUpload, {
				props: {
					face: 'front',
					currentImage: mockImage
				}
			});

			const preview = screen.getByRole('img', { name: 'front view preview' });
			expect(preview).toBeInTheDocument();
			expect(preview).toHaveAttribute('src', mockImage.dataUrl);
		});

		it('shows remove button when image exists', () => {
			const mockImage = createMockImageData('front');

			render(ImageUpload, {
				props: {
					face: 'front',
					currentImage: mockImage
				}
			});

			expect(screen.getByRole('button', { name: 'Remove image' })).toBeInTheDocument();
		});

		it('does not show Choose File button when image exists', () => {
			const mockImage = createMockImageData('front');

			render(ImageUpload, {
				props: {
					face: 'front',
					currentImage: mockImage
				}
			});

			expect(screen.queryByRole('button', { name: 'Choose File' })).not.toBeInTheDocument();
		});

		it('shows correct alt text for rear preview', () => {
			const mockImage = createMockImageData('rear');

			render(ImageUpload, {
				props: {
					face: 'rear',
					currentImage: mockImage
				}
			});

			expect(screen.getByRole('img', { name: 'rear view preview' })).toBeInTheDocument();
		});
	});

	describe('File Upload Flow', () => {
		it('clicking Choose File triggers file input click', async () => {
			render(ImageUpload, { props: { face: 'front' } });

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			const clickSpy = vi.spyOn(fileInput, 'click');

			const button = screen.getByRole('button', { name: 'Choose File' });
			await fireEvent.click(button);

			expect(clickSpy).toHaveBeenCalled();
		});

		it('calls onupload with ImageData when valid file selected', async () => {
			const onupload = vi.fn();

			// Mock FileReader
			const mockFileReader = {
				onload: null as ((e: { target: { result: string } }) => void) | null,
				onerror: null as (() => void) | null,
				readAsDataURL: vi.fn(function (this: typeof mockFileReader) {
					setTimeout(() => {
						if (this.onload) {
							this.onload({ target: { result: 'data:image/png;base64,test' } });
						}
					}, 0);
				}),
				result: 'data:image/png;base64,test'
			};

			vi.spyOn(globalThis, 'FileReader').mockImplementation(() => {
				return mockFileReader as unknown as FileReader;
			});

			render(ImageUpload, {
				props: {
					face: 'front',
					onupload
				}
			});

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = createMockFile('test.png', 'image/png', 1024);

			// Simulate file selection
			Object.defineProperty(fileInput, 'files', {
				value: [file],
				writable: false
			});

			await fireEvent.change(fileInput);

			// Wait for async operations
			await vi.waitFor(() => {
				expect(onupload).toHaveBeenCalled();
			});

			const callArg = onupload.mock.calls[0][0] as ImageData;
			expect(callArg.blob).toBe(file);
			expect(callArg.dataUrl).toBe('data:image/png;base64,test');
			expect(callArg.filename).toContain('front.png');

			vi.restoreAllMocks();
		});

		it('resets file input after successful upload', async () => {
			const onupload = vi.fn();

			const mockFileReader = {
				onload: null as ((e: { target: { result: string } }) => void) | null,
				onerror: null as (() => void) | null,
				readAsDataURL: vi.fn(function (this: typeof mockFileReader) {
					setTimeout(() => {
						if (this.onload) {
							this.onload({ target: { result: 'data:image/png;base64,test' } });
						}
					}, 0);
				}),
				result: 'data:image/png;base64,test'
			};

			vi.spyOn(globalThis, 'FileReader').mockImplementation(() => {
				return mockFileReader as unknown as FileReader;
			});

			render(ImageUpload, {
				props: {
					face: 'front',
					onupload
				}
			});

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = createMockFile('test.png', 'image/png', 1024);

			Object.defineProperty(fileInput, 'files', {
				value: [file],
				writable: false
			});

			await fireEvent.change(fileInput);

			await vi.waitFor(() => {
				expect(fileInput.value).toBe('');
			});

			vi.restoreAllMocks();
		});

		it('does nothing when no file selected', async () => {
			const onupload = vi.fn();

			render(ImageUpload, {
				props: {
					face: 'front',
					onupload
				}
			});

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

			// Simulate empty file selection
			Object.defineProperty(fileInput, 'files', {
				value: [],
				writable: false
			});

			await fireEvent.change(fileInput);

			expect(onupload).not.toHaveBeenCalled();
		});
	});

	describe('File Validation', () => {
		it('shows error for unsupported file type', async () => {
			render(ImageUpload, { props: { face: 'front' } });

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = createMockFile('test.gif', 'image/gif', 1024);

			Object.defineProperty(fileInput, 'files', {
				value: [file],
				writable: false
			});

			await fireEvent.change(fileInput);

			expect(screen.getByRole('alert')).toHaveTextContent(/Unsupported/);
		});

		it('shows error for oversized file', async () => {
			render(ImageUpload, { props: { face: 'front' } });

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = createMockFile('test.png', 'image/png', MAX_IMAGE_SIZE_BYTES + 1);

			Object.defineProperty(fileInput, 'files', {
				value: [file],
				writable: false
			});

			await fireEvent.change(fileInput);

			expect(screen.getByRole('alert')).toHaveTextContent(/too large/);
		});

		it('does not call onupload for invalid files', async () => {
			const onupload = vi.fn();

			render(ImageUpload, {
				props: {
					face: 'front',
					onupload
				}
			});

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = createMockFile('test.gif', 'image/gif', 1024);

			Object.defineProperty(fileInput, 'files', {
				value: [file],
				writable: false
			});

			await fireEvent.change(fileInput);

			expect(onupload).not.toHaveBeenCalled();
		});

		it('resets file input after validation error', async () => {
			render(ImageUpload, { props: { face: 'front' } });

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = createMockFile('test.gif', 'image/gif', 1024);

			Object.defineProperty(fileInput, 'files', {
				value: [file],
				writable: false
			});

			await fireEvent.change(fileInput);

			expect(fileInput.value).toBe('');
		});

		it('clears previous error when new file selected', async () => {
			const onupload = vi.fn();

			const mockFileReader = {
				onload: null as ((e: { target: { result: string } }) => void) | null,
				onerror: null as (() => void) | null,
				readAsDataURL: vi.fn(function (this: typeof mockFileReader) {
					setTimeout(() => {
						if (this.onload) {
							this.onload({ target: { result: 'data:image/png;base64,test' } });
						}
					}, 0);
				}),
				result: 'data:image/png;base64,test'
			};

			vi.spyOn(globalThis, 'FileReader').mockImplementation(() => {
				return mockFileReader as unknown as FileReader;
			});

			render(ImageUpload, {
				props: {
					face: 'front',
					onupload
				}
			});

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

			// First: invalid file
			const invalidFile = createMockFile('test.gif', 'image/gif', 1024);
			Object.defineProperty(fileInput, 'files', {
				value: [invalidFile],
				writable: true,
				configurable: true
			});
			await fireEvent.change(fileInput);

			expect(screen.getByRole('alert')).toBeInTheDocument();

			// Second: valid file
			const validFile = createMockFile('test.png', 'image/png', 1024);
			Object.defineProperty(fileInput, 'files', {
				value: [validFile],
				writable: true,
				configurable: true
			});
			await fireEvent.change(fileInput);

			await vi.waitFor(() => {
				expect(screen.queryByRole('alert')).not.toBeInTheDocument();
			});

			vi.restoreAllMocks();
		});

		it('shows error for BMP files', async () => {
			render(ImageUpload, { props: { face: 'front' } });

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = createMockFile('test.bmp', 'image/bmp', 1024);

			Object.defineProperty(fileInput, 'files', {
				value: [file],
				writable: false
			});

			await fireEvent.change(fileInput);

			expect(screen.getByRole('alert')).toBeInTheDocument();
		});
	});

	describe('Image Removal', () => {
		it('calls onremove when Remove button clicked', async () => {
			const onremove = vi.fn();
			const mockImage = createMockImageData('front');

			render(ImageUpload, {
				props: {
					face: 'front',
					currentImage: mockImage,
					onremove
				}
			});

			const removeButton = screen.getByRole('button', { name: 'Remove image' });
			await fireEvent.click(removeButton);

			expect(onremove).toHaveBeenCalledOnce();
		});

		it('does nothing if onremove not provided', async () => {
			const mockImage = createMockImageData('front');

			render(ImageUpload, {
				props: {
					face: 'front',
					currentImage: mockImage
				}
			});

			const removeButton = screen.getByRole('button', { name: 'Remove image' });

			// Should not throw
			await fireEvent.click(removeButton);
		});
	});

	describe('Error Handling', () => {
		it('shows error when file processing fails', async () => {
			// Mock FileReader to fail
			const mockFileReader = {
				onload: null as ((e: { target: { result: string } }) => void) | null,
				onerror: null as (() => void) | null,
				readAsDataURL: vi.fn(function (this: typeof mockFileReader) {
					setTimeout(() => {
						if (this.onerror) {
							this.onerror();
						}
					}, 0);
				}),
				result: null
			};

			vi.spyOn(globalThis, 'FileReader').mockImplementation(() => {
				return mockFileReader as unknown as FileReader;
			});

			render(ImageUpload, { props: { face: 'front' } });

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = createMockFile('test.png', 'image/png', 1024);

			Object.defineProperty(fileInput, 'files', {
				value: [file],
				writable: false
			});

			await fireEvent.change(fileInput);

			await vi.waitFor(() => {
				expect(screen.getByRole('alert')).toHaveTextContent(/Failed to process image/);
			});

			vi.restoreAllMocks();
		});
	});

	describe('Accessibility', () => {
		it('file input has correct aria-label for front face', () => {
			render(ImageUpload, { props: { face: 'front' } });

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			expect(fileInput).toHaveAttribute('aria-label', 'Upload front image');
		});

		it('file input has correct aria-label for rear face', () => {
			render(ImageUpload, { props: { face: 'rear' } });

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			expect(fileInput).toHaveAttribute('aria-label', 'Upload rear image');
		});

		it('error message has alert role', async () => {
			render(ImageUpload, { props: { face: 'front' } });

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = createMockFile('test.gif', 'image/gif', 1024);

			Object.defineProperty(fileInput, 'files', {
				value: [file],
				writable: false
			});

			await fireEvent.change(fileInput);

			const alert = screen.getByRole('alert');
			expect(alert).toBeInTheDocument();
		});

		it('remove button has accessible name', () => {
			const mockImage = createMockImageData('front');

			render(ImageUpload, {
				props: {
					face: 'front',
					currentImage: mockImage
				}
			});

			expect(screen.getByRole('button', { name: 'Remove image' })).toBeInTheDocument();
		});

		it('preview image has descriptive alt text', () => {
			const mockImage = createMockImageData('front');

			render(ImageUpload, {
				props: {
					face: 'front',
					currentImage: mockImage
				}
			});

			const img = screen.getByRole('img');
			expect(img).toHaveAttribute('alt', 'front view preview');
		});

		it('buttons are focusable', () => {
			render(ImageUpload, { props: { face: 'front' } });

			const button = screen.getByRole('button', { name: 'Choose File' });
			expect(button).not.toHaveAttribute('tabindex', '-1');
		});
	});

	describe('Multiple File Types', () => {
		it.each([
			['image/png', 'test.png'],
			['image/jpeg', 'test.jpg'],
			['image/webp', 'test.webp']
		])('accepts %s files', async (mimeType, filename) => {
			const onupload = vi.fn();

			const mockFileReader = {
				onload: null as ((e: { target: { result: string } }) => void) | null,
				onerror: null as (() => void) | null,
				readAsDataURL: vi.fn(function (this: typeof mockFileReader) {
					setTimeout(() => {
						if (this.onload) {
							this.onload({ target: { result: `data:${mimeType};base64,test` } });
						}
					}, 0);
				}),
				result: `data:${mimeType};base64,test`
			};

			vi.spyOn(globalThis, 'FileReader').mockImplementation(() => {
				return mockFileReader as unknown as FileReader;
			});

			render(ImageUpload, {
				props: {
					face: 'front',
					onupload
				}
			});

			const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = createMockFile(filename, mimeType, 1024);

			Object.defineProperty(fileInput, 'files', {
				value: [file],
				writable: false
			});

			await fireEvent.change(fileInput);

			await vi.waitFor(() => {
				expect(onupload).toHaveBeenCalled();
			});

			vi.restoreAllMocks();
			cleanup();
		});
	});

	describe('Filename Generation', () => {
		it.each([
			['front', 'image/png', 'front.png'],
			['front', 'image/jpeg', 'front.jpg'],
			['front', 'image/webp', 'front.webp'],
			['rear', 'image/png', 'rear.png'],
			['rear', 'image/jpeg', 'rear.jpg'],
			['rear', 'image/webp', 'rear.webp']
		] as const)(
			'generates correct filename for %s face with %s',
			async (face, mimeType, expectedSuffix) => {
				const onupload = vi.fn();

				const mockFileReader = {
					onload: null as ((e: { target: { result: string } }) => void) | null,
					onerror: null as (() => void) | null,
					readAsDataURL: vi.fn(function (this: typeof mockFileReader) {
						setTimeout(() => {
							if (this.onload) {
								this.onload({ target: { result: `data:${mimeType};base64,test` } });
							}
						}, 0);
					}),
					result: `data:${mimeType};base64,test`
				};

				vi.spyOn(globalThis, 'FileReader').mockImplementation(() => {
					return mockFileReader as unknown as FileReader;
				});

				render(ImageUpload, {
					props: {
						face,
						onupload
					}
				});

				const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
				const file = createMockFile(`test.${mimeType.split('/')[1]}`, mimeType, 1024);

				Object.defineProperty(fileInput, 'files', {
					value: [file],
					writable: false
				});

				await fireEvent.change(fileInput);

				await vi.waitFor(() => {
					expect(onupload).toHaveBeenCalled();
				});

				const callArg = onupload.mock.calls[0][0] as ImageData;
				expect(callArg.filename).toContain(expectedSuffix);

				vi.restoreAllMocks();
				cleanup();
			}
		);
	});
});
