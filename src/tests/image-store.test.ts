import { describe, it, expect, beforeEach } from 'vitest';
import { getImageStore, resetImageStore } from '$lib/stores/images.svelte';
import type { ImageData } from '$lib/types/images';

// Helper to create mock ImageData (user upload)
function createMockImageData(filename = 'test-front.png'): ImageData {
	return {
		blob: new Blob(['test'], { type: 'image/png' }),
		dataUrl: 'data:image/png;base64,dGVzdA==',
		filename
	};
}

// Helper to create mock URL-based ImageData (bundled)
function createMockUrlImageData(filename = 'test-front.webp'): ImageData {
	return {
		url: '/assets/device-images/test.webp',
		filename,
		isBundled: true
	};
}

describe('Image Store', () => {
	beforeEach(() => {
		resetImageStore();
	});

	describe('setDeviceImage', () => {
		it('stores front image for device', () => {
			const store = getImageStore();
			const imageData = createMockImageData('server-1u-front.png');

			store.setDeviceImage('device-1', 'front', imageData);

			expect(store.hasImage('device-1', 'front')).toBe(true);
		});

		it('stores rear image for device', () => {
			const store = getImageStore();
			const imageData = createMockImageData('server-1u-rear.png');

			store.setDeviceImage('device-1', 'rear', imageData);

			expect(store.hasImage('device-1', 'rear')).toBe(true);
		});

		it('can store both front and rear for same device', () => {
			const store = getImageStore();
			const frontImage = createMockImageData('server-1u-front.png');
			const rearImage = createMockImageData('server-1u-rear.png');

			store.setDeviceImage('device-1', 'front', frontImage);
			store.setDeviceImage('device-1', 'rear', rearImage);

			expect(store.hasImage('device-1', 'front')).toBe(true);
			expect(store.hasImage('device-1', 'rear')).toBe(true);
		});

		it('overwrites existing image for same face', () => {
			const store = getImageStore();
			const image1 = createMockImageData('old.png');
			const image2 = createMockImageData('new.png');

			store.setDeviceImage('device-1', 'front', image1);
			store.setDeviceImage('device-1', 'front', image2);

			const retrieved = store.getDeviceImage('device-1', 'front');
			expect(retrieved?.filename).toBe('new.png');
		});
	});

	describe('getDeviceImage', () => {
		it('retrieves stored front image', () => {
			const store = getImageStore();
			const imageData = createMockImageData('server-1u-front.png');

			store.setDeviceImage('device-1', 'front', imageData);
			const retrieved = store.getDeviceImage('device-1', 'front');

			expect(retrieved).toBeDefined();
			expect(retrieved?.filename).toBe('server-1u-front.png');
			expect(retrieved?.dataUrl).toBe(imageData.dataUrl);
		});

		it('retrieves stored rear image', () => {
			const store = getImageStore();
			const imageData = createMockImageData('server-1u-rear.png');

			store.setDeviceImage('device-1', 'rear', imageData);
			const retrieved = store.getDeviceImage('device-1', 'rear');

			expect(retrieved).toBeDefined();
			expect(retrieved?.filename).toBe('server-1u-rear.png');
		});

		it('returns undefined for non-existent device', () => {
			const store = getImageStore();

			const result = store.getDeviceImage('non-existent', 'front');

			expect(result).toBeUndefined();
		});

		it('returns undefined for non-existent face', () => {
			const store = getImageStore();
			const imageData = createMockImageData();
			store.setDeviceImage('device-1', 'front', imageData);

			const result = store.getDeviceImage('device-1', 'rear');

			expect(result).toBeUndefined();
		});
	});

	describe('removeDeviceImage', () => {
		it('removes specific face image', () => {
			const store = getImageStore();
			const frontImage = createMockImageData('front.png');
			const rearImage = createMockImageData('rear.png');

			store.setDeviceImage('device-1', 'front', frontImage);
			store.setDeviceImage('device-1', 'rear', rearImage);

			store.removeDeviceImage('device-1', 'front');

			expect(store.hasImage('device-1', 'front')).toBe(false);
			expect(store.hasImage('device-1', 'rear')).toBe(true);
		});

		it('does nothing for non-existent device', () => {
			const store = getImageStore();

			// Should not throw
			expect(() => store.removeDeviceImage('non-existent', 'front')).not.toThrow();
		});
	});

	describe('removeAllDeviceImages', () => {
		it('removes both front and rear images', () => {
			const store = getImageStore();
			const frontImage = createMockImageData('front.png');
			const rearImage = createMockImageData('rear.png');

			store.setDeviceImage('device-1', 'front', frontImage);
			store.setDeviceImage('device-1', 'rear', rearImage);

			store.removeAllDeviceImages('device-1');

			expect(store.hasImage('device-1', 'front')).toBe(false);
			expect(store.hasImage('device-1', 'rear')).toBe(false);
		});

		it('does not affect other devices', () => {
			const store = getImageStore();
			const image1 = createMockImageData('device1.png');
			const image2 = createMockImageData('device2.png');

			store.setDeviceImage('device-1', 'front', image1);
			store.setDeviceImage('device-2', 'front', image2);

			store.removeAllDeviceImages('device-1');

			expect(store.hasImage('device-1', 'front')).toBe(false);
			expect(store.hasImage('device-2', 'front')).toBe(true);
		});
	});

	describe('clearAllImages', () => {
		it('removes all images from store', () => {
			const store = getImageStore();

			store.setDeviceImage('device-1', 'front', createMockImageData());
			store.setDeviceImage('device-1', 'rear', createMockImageData());
			store.setDeviceImage('device-2', 'front', createMockImageData());

			store.clearAllImages();

			expect(store.hasImage('device-1', 'front')).toBe(false);
			expect(store.hasImage('device-1', 'rear')).toBe(false);
			expect(store.hasImage('device-2', 'front')).toBe(false);
		});

		it('results in empty getAllImages map', () => {
			const store = getImageStore();

			store.setDeviceImage('device-1', 'front', createMockImageData());
			store.clearAllImages();

			const allImages = store.getAllImages();
			expect(allImages.size).toBe(0);
		});
	});

	describe('hasImage', () => {
		it('returns true when image exists', () => {
			const store = getImageStore();
			store.setDeviceImage('device-1', 'front', createMockImageData());

			expect(store.hasImage('device-1', 'front')).toBe(true);
		});

		it('returns false when device does not exist', () => {
			const store = getImageStore();

			expect(store.hasImage('non-existent', 'front')).toBe(false);
		});

		it('returns false when face does not exist for device', () => {
			const store = getImageStore();
			store.setDeviceImage('device-1', 'front', createMockImageData());

			expect(store.hasImage('device-1', 'rear')).toBe(false);
		});
	});

	describe('getAllImages', () => {
		it('returns empty map when no images stored', () => {
			const store = getImageStore();

			const allImages = store.getAllImages();

			expect(allImages).toBeInstanceOf(Map);
			expect(allImages.size).toBe(0);
		});

		it('returns map with all stored images', () => {
			const store = getImageStore();
			const image1 = createMockImageData('device1-front.png');
			const image2 = createMockImageData('device2-front.png');

			store.setDeviceImage('device-1', 'front', image1);
			store.setDeviceImage('device-2', 'front', image2);

			const allImages = store.getAllImages();

			expect(allImages.size).toBe(2);
			expect(allImages.get('device-1')?.front?.filename).toBe('device1-front.png');
			expect(allImages.get('device-2')?.front?.filename).toBe('device2-front.png');
		});

		it('returns a copy of the internal map', () => {
			const store = getImageStore();
			store.setDeviceImage('device-1', 'front', createMockImageData());

			const allImages = store.getAllImages();
			allImages.delete('device-1');

			// Original store should not be affected
			expect(store.hasImage('device-1', 'front')).toBe(true);
		});
	});

	describe('imageCount', () => {
		it('returns 0 when no images stored', () => {
			const store = getImageStore();
			expect(store.imageCount).toBe(0);
		});

		it('counts individual images correctly', () => {
			const store = getImageStore();

			store.setDeviceImage('device-1', 'front', createMockImageData());
			expect(store.imageCount).toBe(1);

			store.setDeviceImage('device-1', 'rear', createMockImageData());
			expect(store.imageCount).toBe(2);

			store.setDeviceImage('device-2', 'front', createMockImageData());
			expect(store.imageCount).toBe(3);
		});
	});

	describe('resetImageStore', () => {
		it('clears all images and resets state', () => {
			const store = getImageStore();
			store.setDeviceImage('device-1', 'front', createMockImageData());

			resetImageStore();

			const freshStore = getImageStore();
			expect(freshStore.imageCount).toBe(0);
			expect(freshStore.hasImage('device-1', 'front')).toBe(false);
		});
	});

	describe('getImageUrl', () => {
		it('returns dataUrl for user-uploaded images', () => {
			const store = getImageStore();
			const imageData = createMockImageData();
			store.setDeviceImage('device-1', 'front', imageData);

			const url = store.getImageUrl('device-1', 'front');
			expect(url).toBe('data:image/png;base64,dGVzdA==');
		});

		it('returns url for bundled images', () => {
			const store = getImageStore();
			const imageData = createMockUrlImageData();
			store.setDeviceImage('device-1', 'front', imageData);

			const url = store.getImageUrl('device-1', 'front');
			expect(url).toBe('/assets/device-images/test.webp');
		});

		it('returns undefined for non-existent device', () => {
			const store = getImageStore();
			expect(store.getImageUrl('non-existent', 'front')).toBeUndefined();
		});

		it('prefers url over dataUrl when both present', () => {
			const store = getImageStore();
			store.setDeviceImage('device-1', 'front', {
				url: '/assets/preferred.webp',
				dataUrl: 'data:image/png;base64,dGVzdA==',
				filename: 'test.webp'
			});

			const url = store.getImageUrl('device-1', 'front');
			expect(url).toBe('/assets/preferred.webp');
		});
	});

	describe('loadBundledImages', () => {
		it('loads bundled images into store', () => {
			const store = getImageStore();
			store.loadBundledImages();

			// Should have images for bundled devices
			expect(store.hasImage('1u-server', 'front')).toBe(true);
			expect(store.hasImage('2u-server', 'front')).toBe(true);
			expect(store.hasImage('4u-server', 'front')).toBe(true);
		});

		it('bundled images have URL and isBundled flag', () => {
			const store = getImageStore();
			store.loadBundledImages();

			const image = store.getDeviceImage('1u-server', 'front');
			expect(image).toBeDefined();
			expect(image?.url).toBeDefined();
			expect(image?.isBundled).toBe(true);
		});

		it('bundled images return valid URL from getImageUrl', () => {
			const store = getImageStore();
			store.loadBundledImages();

			const url = store.getImageUrl('1u-server', 'front');
			expect(url).toBeDefined();
			expect(typeof url).toBe('string');
		});
	});

	describe('getUserImages', () => {
		it('returns only user-uploaded images', () => {
			const store = getImageStore();

			// Add a bundled image
			store.setDeviceImage('bundled-device', 'front', createMockUrlImageData());

			// Add a user-uploaded image
			store.setDeviceImage('user-device', 'front', createMockImageData());

			const userImages = store.getUserImages();

			expect(userImages.has('user-device')).toBe(true);
			expect(userImages.has('bundled-device')).toBe(false);
		});

		it('excludes bundled images after loadBundledImages', () => {
			const store = getImageStore();
			store.loadBundledImages();

			// Add a user-uploaded image
			store.setDeviceImage('my-custom-server', 'front', createMockImageData());

			const userImages = store.getUserImages();

			// Should have user image
			expect(userImages.has('my-custom-server')).toBe(true);

			// Should not have bundled images
			expect(userImages.has('1u-server')).toBe(false);
			expect(userImages.has('2u-server')).toBe(false);
		});

		it('returns empty map when only bundled images exist', () => {
			const store = getImageStore();
			store.loadBundledImages();

			const userImages = store.getUserImages();
			expect(userImages.size).toBe(0);
		});
	});
});
