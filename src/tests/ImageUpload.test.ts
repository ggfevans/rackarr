import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import ImageUpload from '$lib/components/ImageUpload.svelte';
import type { ImageData } from '$lib/types/images';

// Setup URL mocks for jsdom
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

beforeAll(() => {
	// @ts-expect-error - polyfill for jsdom
	URL.createObjectURL = vi.fn(() => 'blob:mock-url');
	// @ts-expect-error - polyfill for jsdom
	URL.revokeObjectURL = vi.fn();
});

afterAll(() => {
	URL.createObjectURL = originalCreateObjectURL;
	URL.revokeObjectURL = originalRevokeObjectURL;
});

// Helper to create mock ImageData
function createMockImageData(face: 'front' | 'rear' = 'front'): ImageData {
	return {
		blob: new Blob(['test'], { type: 'image/png' }),
		dataUrl: 'data:image/png;base64,dGVzdA==',
		filename: `device-${face}.png`
	};
}

// Helper to create mock File
function createMockFile(
	name: string = 'test.png',
	type: string = 'image/png',
	size: number = 1024
): File {
	const content = new Array(size).fill('a').join('');
	return new File([content], name, { type });
}

describe('ImageUpload Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders file input', () => {
			render(ImageUpload, { props: { face: 'front' } });
			const input = document.querySelector('input[type="file"]');
			expect(input).toBeInTheDocument();
		});

		it('hides file input visually', () => {
			render(ImageUpload, { props: { face: 'front' } });
			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			expect(input).toBeInTheDocument();
			// File inputs are typically visually hidden but accessible via sr-only class
			expect(input.className).toContain('sr-only');
		});

		it('renders "Choose File" button', () => {
			render(ImageUpload, { props: { face: 'front' } });
			expect(screen.getByRole('button', { name: /choose/i })).toBeInTheDocument();
		});

		it('shows "Front Image" label for front face', () => {
			render(ImageUpload, { props: { face: 'front' } });
			expect(screen.getByText(/front image/i)).toBeInTheDocument();
		});

		it('shows "Rear Image" label for rear face', () => {
			render(ImageUpload, { props: { face: 'rear' } });
			expect(screen.getByText(/rear image/i)).toBeInTheDocument();
		});
	});

	describe('File Type Acceptance', () => {
		it('accepts only image files', () => {
			render(ImageUpload, { props: { face: 'front' } });
			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			expect(input.accept).toBe('image/png,image/jpeg,image/webp');
		});
	});

	describe('Preview', () => {
		it('shows preview when currentImage is provided', () => {
			const imageData = createMockImageData();
			render(ImageUpload, {
				props: { face: 'front', currentImage: imageData }
			});

			const preview = screen.getByRole('img');
			expect(preview).toBeInTheDocument();
			expect(preview).toHaveAttribute('src', imageData.dataUrl);
		});

		it('does not show preview when no image', () => {
			render(ImageUpload, { props: { face: 'front' } });
			const preview = screen.queryByRole('img');
			expect(preview).not.toBeInTheDocument();
		});

		it('shows preview alt text with face', () => {
			const imageData = createMockImageData();
			render(ImageUpload, {
				props: { face: 'front', currentImage: imageData }
			});

			const preview = screen.getByRole('img');
			expect(preview).toHaveAttribute('alt', expect.stringContaining('front'));
		});
	});

	describe('Remove Button', () => {
		it('shows remove button when image exists', () => {
			const imageData = createMockImageData();
			render(ImageUpload, {
				props: { face: 'front', currentImage: imageData }
			});

			expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
		});

		it('does not show remove button when no image', () => {
			render(ImageUpload, { props: { face: 'front' } });
			expect(screen.queryByRole('button', { name: /remove/i })).not.toBeInTheDocument();
		});

		it('emits onremove when remove button clicked', async () => {
			const imageData = createMockImageData();
			const onremove = vi.fn();
			render(ImageUpload, {
				props: { face: 'front', currentImage: imageData, onremove }
			});

			const removeButton = screen.getByRole('button', { name: /remove/i });
			await fireEvent.click(removeButton);

			expect(onremove).toHaveBeenCalledTimes(1);
		});
	});

	describe('Upload Event', () => {
		it('emits onupload with ImageData when valid file selected', async () => {
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
				props: { face: 'front', onupload }
			});

			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			const file = createMockFile('test.png', 'image/png');

			Object.defineProperty(input, 'files', {
				value: [file],
				writable: false
			});

			await fireEvent.change(input);

			await waitFor(() => {
				expect(onupload).toHaveBeenCalledTimes(1);
			});

			const callArg = onupload.mock.calls[0][0];
			expect(callArg).toHaveProperty('blob');
			expect(callArg).toHaveProperty('dataUrl');
			expect(callArg).toHaveProperty('filename');
		});
	});

	describe('Error Handling', () => {
		it('shows error for invalid file type', async () => {
			render(ImageUpload, { props: { face: 'front' } });

			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			const invalidFile = createMockFile('test.gif', 'image/gif');

			Object.defineProperty(input, 'files', {
				value: [invalidFile],
				writable: false
			});

			await fireEvent.change(input);

			await waitFor(() => {
				expect(screen.getByRole('alert')).toBeInTheDocument();
			});

			expect(screen.getByRole('alert')).toHaveTextContent(/unsupported/i);
		});

		it('shows error for oversized file', async () => {
			render(ImageUpload, { props: { face: 'front' } });

			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			// Create file larger than 5MB
			const oversizedFile = createMockFile('big.png', 'image/png', 6 * 1024 * 1024);

			Object.defineProperty(input, 'files', {
				value: [oversizedFile],
				writable: false
			});

			await fireEvent.change(input);

			await waitFor(() => {
				expect(screen.getByRole('alert')).toBeInTheDocument();
			});

			expect(screen.getByRole('alert')).toHaveTextContent(/too large/i);
		});

		it('clears error when valid file selected', async () => {
			// First trigger an error
			render(ImageUpload, { props: { face: 'front' } });

			const input = document.querySelector('input[type="file"]') as HTMLInputElement;

			// Invalid file first
			const invalidFile = createMockFile('test.gif', 'image/gif');
			Object.defineProperty(input, 'files', {
				value: [invalidFile],
				configurable: true
			});

			await fireEvent.change(input);

			await waitFor(() => {
				expect(screen.getByRole('alert')).toBeInTheDocument();
			});

			// Now select valid file
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

			const validFile = createMockFile('valid.png', 'image/png');
			Object.defineProperty(input, 'files', {
				value: [validFile],
				configurable: true
			});

			await fireEvent.change(input);

			await waitFor(() => {
				expect(screen.queryByRole('alert')).not.toBeInTheDocument();
			});
		});
	});

	describe('Accessibility', () => {
		it('has accessible label for file input', () => {
			render(ImageUpload, { props: { face: 'front' } });
			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			expect(input).toHaveAccessibleName();
		});

		it('choose button is keyboard accessible', () => {
			render(ImageUpload, { props: { face: 'front' } });
			const button = screen.getByRole('button', { name: /choose/i });
			expect(button).not.toHaveAttribute('tabindex', '-1');
		});

		it('remove button is keyboard accessible', () => {
			const imageData = createMockImageData();
			render(ImageUpload, {
				props: { face: 'front', currentImage: imageData }
			});

			const button = screen.getByRole('button', { name: /remove/i });
			expect(button).not.toHaveAttribute('tabindex', '-1');
		});

		it('error message has role="alert"', async () => {
			render(ImageUpload, { props: { face: 'front' } });

			const input = document.querySelector('input[type="file"]') as HTMLInputElement;
			const invalidFile = createMockFile('test.gif', 'image/gif');

			Object.defineProperty(input, 'files', {
				value: [invalidFile],
				writable: false
			});

			await fireEvent.change(input);

			await waitFor(() => {
				expect(screen.getByRole('alert')).toBeInTheDocument();
			});
		});
	});
});
