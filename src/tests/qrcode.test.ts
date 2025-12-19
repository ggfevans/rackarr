/**
 * QR Code Utilities Tests
 * Tests for QR code generation with fixed spec
 */

import { describe, it, expect } from 'vitest';
import {
	generateQRCode,
	canFitInQR,
	QR_VERSION,
	QR_ERROR_CORRECTION,
	QR_MAX_CHARS,
	QR_MIN_PRINT_CM
} from '$lib/utils/qrcode';

describe('QR Code Utilities', () => {
	describe('Constants', () => {
		it('uses QR Version 24', () => {
			expect(QR_VERSION).toBe(24);
		});

		it('uses Error Correction Level L', () => {
			expect(QR_ERROR_CORRECTION).toBe('L');
		});

		it('has max chars capacity of 1588', () => {
			expect(QR_MAX_CHARS).toBe(1588);
		});

		it('recommends 4cm minimum print size', () => {
			expect(QR_MIN_PRINT_CM).toBe(4);
		});
	});

	describe('canFitInQR', () => {
		it('returns true for short data', () => {
			expect(canFitInQR('hello')).toBe(true);
		});

		it('returns true for data exactly at limit', () => {
			const data = 'a'.repeat(QR_MAX_CHARS);
			expect(canFitInQR(data)).toBe(true);
		});

		it('returns false for data over limit', () => {
			const data = 'a'.repeat(QR_MAX_CHARS + 1);
			expect(canFitInQR(data)).toBe(false);
		});

		it('returns true for empty string', () => {
			expect(canFitInQR('')).toBe(true);
		});

		it('returns true for typical share URL length (~500 chars)', () => {
			const typicalUrl = 'https://app.rackarr.com/?l=' + 'a'.repeat(450);
			expect(canFitInQR(typicalUrl)).toBe(true);
		});

		it('returns true for medium share URL length (~1000 chars)', () => {
			const mediumUrl = 'https://app.rackarr.com/?l=' + 'a'.repeat(950);
			expect(canFitInQR(mediumUrl)).toBe(true);
		});

		it('returns true for large share URL length (~1500 chars)', () => {
			const largeUrl = 'https://app.rackarr.com/?l=' + 'a'.repeat(1450);
			expect(canFitInQR(largeUrl)).toBe(true);
		});

		it('returns false for URL exceeding QR capacity', () => {
			const hugeUrl = 'https://app.rackarr.com/?l=' + 'a'.repeat(1600);
			expect(canFitInQR(hugeUrl)).toBe(false);
		});
	});

	describe('generateQRCode', () => {
		it('returns a data URL', async () => {
			const dataUrl = await generateQRCode('test');

			expect(dataUrl).toMatch(/^data:image\/png;base64,/);
		});

		it('generates valid base64 image data', async () => {
			const dataUrl = await generateQRCode('test');
			const base64Part = dataUrl.split(',')[1];

			// Should be valid base64
			expect(base64Part).toBeDefined();
			expect(base64Part!.length).toBeGreaterThan(0);
		});

		it('respects width option', async () => {
			const smallQR = await generateQRCode('test', { width: 100 });
			const largeQR = await generateQRCode('test', { width: 500 });

			// Larger width should produce more base64 data
			const smallBase64 = smallQR.split(',')[1]!;
			const largeBase64 = largeQR.split(',')[1]!;

			expect(largeBase64.length).toBeGreaterThan(smallBase64.length);
		});

		it('generates QR code for URL-like strings', async () => {
			const url = 'https://app.rackarr.com/?l=eJxLy0zNAQADwwFp';
			const dataUrl = await generateQRCode(url);

			expect(dataUrl).toMatch(/^data:image\/png;base64,/);
		});

		it('generates QR code for alphanumeric content', async () => {
			const alphanumeric = 'ABC123XYZ789';
			const dataUrl = await generateQRCode(alphanumeric);

			expect(dataUrl).toMatch(/^data:image\/png;base64,/);
		});

		it('uses default width of 200 when not specified', async () => {
			// We can't directly verify the width, but we can verify it works
			const dataUrl = await generateQRCode('test');
			expect(dataUrl).toBeDefined();
		});

		it('handles special characters in data', async () => {
			const specialChars = 'test-data_with+special/chars=';
			const dataUrl = await generateQRCode(specialChars);

			expect(dataUrl).toMatch(/^data:image\/png;base64,/);
		});

		it('throws error for data exceeding capacity', async () => {
			const hugeData = 'a'.repeat(QR_MAX_CHARS + 100);

			await expect(generateQRCode(hugeData)).rejects.toThrow();
		});

		it('generates different QR codes for different data', async () => {
			const qr1 = await generateQRCode('data1');
			const qr2 = await generateQRCode('data2');

			expect(qr1).not.toBe(qr2);
		});

		it('generates consistent QR codes for same data', async () => {
			const qr1 = await generateQRCode('consistent-data', { width: 200 });
			const qr2 = await generateQRCode('consistent-data', { width: 200 });

			expect(qr1).toBe(qr2);
		});
	});

	describe('Integration with share URLs', () => {
		it('handles typical Rackarr share URL', async () => {
			// Simulate a typical encoded layout (around 400-600 chars)
			const mockEncodedLayout = 'eJx1kE1uwzAMhK9ieJ0FbCdZ5Bg' + 'x'.repeat(400);
			const shareUrl = `https://app.rackarr.com/?l=${mockEncodedLayout}`;

			expect(canFitInQR(shareUrl)).toBe(true);

			const qrCode = await generateQRCode(shareUrl);
			expect(qrCode).toMatch(/^data:image\/png;base64,/);
		});

		it('can generate QR for large but valid URL', async () => {
			// Create a URL with substantial encoded data (within QR v24 capacity)
			// QR v24 with EC level L can hold ~1273 alphanumeric chars
			const encodedData = 'x'.repeat(800);
			const url = `https://app.rackarr.com/?l=${encodedData}`;

			expect(canFitInQR(url)).toBe(true);

			const qrCode = await generateQRCode(url);
			expect(qrCode).toMatch(/^data:image\/png;base64,/);
		});
	});
});
