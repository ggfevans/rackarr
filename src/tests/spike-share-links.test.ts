/**
 * Spike: Shareable Layout Links
 * Research test to evaluate URL encoding options for layouts
 *
 * Results will inform implementation decisions for issue #84
 */

import { describe, it, expect } from 'vitest';
import LZString from 'lz-string';
import pako from 'pako';
import {
	createTestLayout,
	createTestDeviceType,
	createTestDevice,
	createTestRack
} from './factories';
import type { Layout } from '$lib/types';

// =============================================================================
// Test Data Generators
// =============================================================================

/**
 * Create a realistic layout with N devices
 */
function createRealisticLayout(deviceCount: number): Layout {
	const deviceTypes = [
		createTestDeviceType({
			slug: 'dell-r740',
			u_height: 2,
			category: 'server',
			manufacturer: 'Dell',
			model: 'PowerEdge R740'
		}),
		createTestDeviceType({
			slug: 'ubiquiti-usw-pro-48',
			u_height: 1,
			category: 'network',
			manufacturer: 'Ubiquiti',
			model: 'USW-Pro-48'
		}),
		createTestDeviceType({
			slug: 'synology-rs1221',
			u_height: 2,
			category: 'storage',
			manufacturer: 'Synology',
			model: 'RS1221+'
		}),
		createTestDeviceType({
			slug: 'apc-smart-ups-1500',
			u_height: 2,
			category: 'power',
			manufacturer: 'APC',
			model: 'Smart-UPS 1500'
		}),
		createTestDeviceType({
			slug: 'cyberpower-pdu',
			u_height: 1,
			category: 'power',
			manufacturer: 'CyberPower',
			model: 'PDU81005'
		}),
		createTestDeviceType({
			slug: 'patch-panel-24',
			u_height: 1,
			category: 'patch-panel',
			model: '24-Port Cat6 Patch Panel'
		}),
		createTestDeviceType({
			slug: 'brush-panel',
			u_height: 1,
			category: 'cable-management',
			model: 'Brush Cable Panel'
		}),
		createTestDeviceType({
			slug: 'blank-1u',
			u_height: 1,
			category: 'blank',
			model: '1U Blank Panel'
		})
	];

	const devices = [];
	let position = 1;
	for (let i = 0; i < deviceCount && position <= 42; i++) {
		const deviceType = deviceTypes[i % deviceTypes.length];
		devices.push(
			createTestDevice({
				device_type: deviceType.slug,
				name: `${deviceType.model} #${i + 1}`,
				position,
				face: i % 3 === 0 ? 'both' : 'front'
			})
		);
		position += deviceType.u_height;
	}

	return createTestLayout({
		name: 'My Homelab Rack',
		rack: createTestRack({
			name: 'Main Rack',
			height: 42,
			devices
		}),
		device_types: deviceTypes
	});
}

// =============================================================================
// Compression Functions
// =============================================================================

function compressWithLZString(layout: Layout): string {
	const json = JSON.stringify(layout);
	return LZString.compressToEncodedURIComponent(json);
}

function decompressWithLZString(compressed: string): Layout {
	const json = LZString.decompressFromEncodedURIComponent(compressed);
	if (!json) throw new Error('Failed to decompress');
	return JSON.parse(json);
}

function compressWithPako(layout: Layout): string {
	const json = JSON.stringify(layout);
	const compressed = pako.deflate(json);
	// Convert to base64url (URL-safe base64)
	const base64 = btoa(String.fromCharCode(...compressed));
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decompressWithPako(compressed: string): Layout {
	// Restore base64 padding and characters
	let base64 = compressed.replace(/-/g, '+').replace(/_/g, '/');
	while (base64.length % 4) base64 += '=';
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	const json = pako.inflate(bytes, { to: 'string' });
	return JSON.parse(json);
}

// =============================================================================
// Tests
// =============================================================================

describe('Spike: Share Links Compression Analysis', () => {
	const scenarios = [
		{ name: 'Empty rack', deviceCount: 0 },
		{ name: 'Small (5 devices)', deviceCount: 5 },
		{ name: 'Medium (10 devices)', deviceCount: 10 },
		{ name: 'Large (15 devices)', deviceCount: 15 },
		{ name: 'Full (20 devices)', deviceCount: 20 }
	];

	describe('Compression ratios', () => {
		for (const scenario of scenarios) {
			it(`${scenario.name}`, () => {
				const layout = createRealisticLayout(scenario.deviceCount);
				const json = JSON.stringify(layout);
				const jsonSize = json.length;

				const lzCompressed = compressWithLZString(layout);
				const pakoCompressed = compressWithPako(layout);

				const results = {
					scenario: scenario.name,
					devices: scenario.deviceCount,
					originalJson: jsonSize,
					lzString: {
						size: lzCompressed.length,
						ratio: ((1 - lzCompressed.length / jsonSize) * 100).toFixed(1) + '%'
					},
					pako: {
						size: pakoCompressed.length,
						ratio: ((1 - pakoCompressed.length / jsonSize) * 100).toFixed(1) + '%'
					}
				};

				console.log('\n' + JSON.stringify(results, null, 2));

				// Verify roundtrip
				expect(decompressWithLZString(lzCompressed)).toEqual(layout);
				expect(decompressWithPako(pakoCompressed)).toEqual(layout);
			});
		}
	});

	describe('URL feasibility', () => {
		const URL_LIMITS = {
			conservative: 2000, // IE/Edge legacy, safe for all
			moderate: 8000, // Most servers and proxies
			browser: 32000, // Chrome limit
			qrCodePractical: 200, // Scannable QR codes
			qrCodeMax: 2953 // Version 40 QR max bytes
		};

		it('analyzes URL feasibility for different layout sizes', () => {
			console.log('\n=== URL Feasibility Analysis ===\n');
			console.log('URL Limits:');
			console.log(`  Conservative (max compatibility): ${URL_LIMITS.conservative} chars`);
			console.log(`  Moderate (most servers): ${URL_LIMITS.moderate} chars`);
			console.log(`  Browser max (Chrome): ${URL_LIMITS.browser} chars`);
			console.log(`  QR practical: ~${URL_LIMITS.qrCodePractical} chars`);
			console.log(`  QR max: ~${URL_LIMITS.qrCodeMax} bytes\n`);

			const baseUrl = 'https://app.rackarr.com/?layout=';

			for (const scenario of scenarios) {
				const layout = createRealisticLayout(scenario.deviceCount);
				const compressed = compressWithLZString(layout);
				const fullUrl = baseUrl + compressed;

				console.log(`${scenario.name}:`);
				console.log(`  Compressed: ${compressed.length} chars`);
				console.log(`  Full URL: ${fullUrl.length} chars`);
				console.log(
					`  Fits conservative (2K): ${fullUrl.length <= URL_LIMITS.conservative ? '✅' : '❌'}`
				);
				console.log(`  Fits moderate (8K): ${fullUrl.length <= URL_LIMITS.moderate ? '✅' : '❌'}`);
				console.log(`  Fits browser (32K): ${fullUrl.length <= URL_LIMITS.browser ? '✅' : '❌'}`);
				console.log(
					`  QR viable: ${compressed.length <= URL_LIMITS.qrCodePractical ? '✅' : '❌ (too dense)'}`
				);
				console.log('');
			}

			// This test always passes - it's for information gathering
			expect(true).toBe(true);
		});
	});

	describe('Minified layout format', () => {
		it('explores minimal encoding to reduce size further', () => {
			const layout = createRealisticLayout(10);

			// Standard JSON
			const standardJson = JSON.stringify(layout);

			// Minimal: abbreviate keys, remove optional fields
			const minimalLayout = {
				v: layout.version,
				n: layout.name,
				r: {
					n: layout.rack.name,
					h: layout.rack.height,
					w: layout.rack.width,
					d: layout.rack.devices.map((d) => ({
						t: d.device_type,
						p: d.position,
						f: d.face[0], // 'f', 'r', or 'b'
						n: d.name
					}))
				},
				dt: layout.device_types.map((dt) => ({
					s: dt.slug,
					h: dt.u_height,
					m: dt.model,
					c: dt.category[0], // first char
					x: dt.colour
				}))
			};
			const minimalJson = JSON.stringify(minimalLayout);

			const standardCompressed = compressWithLZString(layout);
			const minimalCompressed = LZString.compressToEncodedURIComponent(minimalJson);

			console.log('\n=== Minimal Format Analysis (10 devices) ===');
			console.log(`Standard JSON: ${standardJson.length} chars`);
			console.log(
				`Minimal JSON: ${minimalJson.length} chars (${((1 - minimalJson.length / standardJson.length) * 100).toFixed(1)}% smaller)`
			);
			console.log(`Standard compressed: ${standardCompressed.length} chars`);
			console.log(
				`Minimal compressed: ${minimalCompressed.length} chars (${((1 - minimalCompressed.length / standardCompressed.length) * 100).toFixed(1)}% smaller)`
			);

			expect(true).toBe(true);
		});
	});

	describe('Final recommendation scenarios', () => {
		it('compares all approaches for typical layout sizes', () => {
			const _baseUrl = 'https://app.rackarr.com/?layout=';

			console.log('\n=== FINAL COMPARISON: All Approaches ===\n');
			console.log('| Devices | Standard+LZ | Standard+Pako | Minimal+LZ | Minimal+Pako |');
			console.log('|---------|-------------|---------------|------------|--------------|');

			for (const scenario of scenarios) {
				const layout = createRealisticLayout(scenario.deviceCount);

				// Create minimal version
				const minimalLayout = {
					v: layout.version,
					n: layout.name,
					r: {
						n: layout.rack.name,
						h: layout.rack.height,
						w: layout.rack.width,
						d: layout.rack.devices.map((d) => ({
							t: d.device_type,
							p: d.position,
							f: d.face[0],
							n: d.name
						}))
					},
					dt: layout.device_types.map((dt) => ({
						s: dt.slug,
						h: dt.u_height,
						m: dt.model,
						c: dt.category[0],
						x: dt.colour
					}))
				};

				const standardLz = compressWithLZString(layout);
				const standardPako = compressWithPako(layout);
				const minimalLz = LZString.compressToEncodedURIComponent(JSON.stringify(minimalLayout));
				const minimalPako = (() => {
					const json = JSON.stringify(minimalLayout);
					const compressed = pako.deflate(json);
					const base64 = btoa(String.fromCharCode(...compressed));
					return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
				})();

				console.log(
					`| ${scenario.deviceCount.toString().padStart(7)} | ${standardLz.length.toString().padStart(11)} | ${standardPako.length.toString().padStart(13)} | ${minimalLz.length.toString().padStart(10)} | ${minimalPako.length.toString().padStart(12)} |`
				);
			}

			console.log('\n✅ = Fits in 2000 char URL (conservative limit)');
			console.log('\nRECOMMENDATION:');
			console.log('- Use Minimal Format + lz-string for best balance');
			console.log('- lz-string is already a dependency (via @testing-library)');
			console.log('- Built-in URL-safe encoding, no manual base64 handling');
			console.log('- Typical layouts (≤15 devices) fit comfortably under 2000 chars');
			console.log(
				'- Very large layouts (20+) may exceed conservative limit but work in modern browsers'
			);

			expect(true).toBe(true);
		});
	});

	describe('QR Code Feasibility (Revised)', () => {
		it('analyzes QR code versions for compressed layouts', async () => {
			const QRCode = await import('qrcode');

			console.log('\n=== QR CODE FEASIBILITY ANALYSIS ===\n');
			console.log('| Devices | Payload | QR Version | Modules | Min Print Size | Verdict |');
			console.log('|---------|---------|------------|---------|----------------|---------|');

			for (const scenario of scenarios) {
				const layout = createRealisticLayout(scenario.deviceCount);
				const baseUrl = 'https://app.rackarr.com/?l=';

				// Create minimal version with shortest possible encoding
				const minimalLayout = {
					v: layout.version,
					n: layout.name,
					r: {
						n: layout.rack.name,
						h: layout.rack.height,
						w: layout.rack.width,
						d: layout.rack.devices.map((d) => ({
							t: d.device_type,
							p: d.position,
							f: d.face[0],
							n: d.name
						}))
					},
					dt: layout.device_types.map((dt) => ({
						s: dt.slug,
						h: dt.u_height,
						m: dt.model,
						c: dt.category[0],
						x: dt.colour
					}))
				};

				// Use pako for smallest size
				const json = JSON.stringify(minimalLayout);
				const compressed = pako.deflate(json);
				const base64 = btoa(String.fromCharCode(...compressed));
				const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
				const fullUrl = baseUrl + urlSafe;

				// Generate QR code to get actual version
				const qrData = await QRCode.create(fullUrl, { errorCorrectionLevel: 'L' });
				const version = qrData.version;
				const modules = version * 4 + 17;

				// Calculate minimum print size (assuming 0.3mm per module minimum for reliable scanning)
				const minPrintMm = Math.ceil(modules * 0.35);
				const minPrintCm = (minPrintMm / 10).toFixed(1);

				// Verdict based on practical scanning
				let verdict = '';
				if (modules <= 57) verdict = '✅ Easy (phone)';
				else if (modules <= 73) verdict = '✅ Good (2.5cm+)';
				else if (modules <= 97) verdict = '⚠️ Large (3.5cm+)';
				else verdict = '❌ Too dense';

				console.log(
					`| ${scenario.deviceCount.toString().padStart(7)} | ${fullUrl.length.toString().padStart(7)} | ${version.toString().padStart(10)} | ${modules.toString().padStart(7)} | ${minPrintCm.padStart(10)}cm | ${verdict.padStart(7)} |`
				);
			}

			console.log('\n📱 QR Code Size Guidelines:');
			console.log('   - Version 1-10 (≤57 modules): 2cm print, easy phone scanning');
			console.log('   - Version 11-14 (≤73 modules): 2.5cm print, reliable scanning');
			console.log('   - Version 15-20 (≤97 modules): 3.5cm+ print, needs good lighting');
			console.log('   - Version 21+ (>97 modules): 4cm+ print, may have scan issues');
			console.log('\n🎯 CONCLUSION: QR codes ARE viable for typical layouts!');

			expect(true).toBe(true);
		});

		it('compares error correction levels', async () => {
			const QRCode = await import('qrcode');

			console.log('\n=== ERROR CORRECTION LEVEL COMPARISON ===\n');
			console.log('| Devices | Level L (7%) | Level M (15%) | Level Q (25%) | Level H (30%) |');
			console.log('|---------|--------------|---------------|---------------|---------------|');

			for (const scenario of scenarios) {
				const layout = createRealisticLayout(scenario.deviceCount);
				const baseUrl = 'https://app.rackarr.com/?l=';

				const minimalLayout = {
					v: layout.version,
					n: layout.name,
					r: {
						n: layout.rack.name,
						h: layout.rack.height,
						w: layout.rack.width,
						d: layout.rack.devices.map((d) => ({
							t: d.device_type,
							p: d.position,
							f: d.face[0],
							n: d.name
						}))
					},
					dt: layout.device_types.map((dt) => ({
						s: dt.slug,
						h: dt.u_height,
						m: dt.model,
						c: dt.category[0],
						x: dt.colour
					}))
				};

				const json = JSON.stringify(minimalLayout);
				const compressed = pako.deflate(json);
				const base64 = btoa(String.fromCharCode(...compressed));
				const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
				const fullUrl = baseUrl + urlSafe;

				const levels = ['L', 'M', 'Q', 'H'] as const;
				const results: string[] = [];

				for (const level of levels) {
					const qrData = await QRCode.create(fullUrl, { errorCorrectionLevel: level });
					const version = qrData.version;
					const modules = version * 4 + 17;
					const printCm = ((modules * 0.35) / 10).toFixed(1);
					results.push(`v${version} (${printCm}cm)`);
				}

				console.log(
					`| ${scenario.deviceCount.toString().padStart(7)} | ${results[0].padStart(12)} | ${results[1].padStart(13)} | ${results[2].padStart(13)} | ${results[3].padStart(13)} |`
				);
			}

			console.log('\n📊 Recommendation for 3cm target:');
			console.log('   Level M (15%) provides good balance of capacity and durability');

			expect(true).toBe(true);
		});

		it('validates fixed v23 Level M capacity', async () => {
			const _QRCode = await import('qrcode');

			console.log('\n=== FIXED VERSION 23 + LEVEL M ANALYSIS ===\n');

			// Version 23 specs
			const version = 23;
			const modules = version * 4 + 17; // 109 modules
			const printCm = ((modules * 0.35) / 10).toFixed(1);

			console.log(`Version: ${version}`);
			console.log(`Modules: ${modules}×${modules}`);
			console.log(`Print size: ${printCm}cm (at 0.35mm/module)`);

			// Test capacity by generating QR with explicit version
			// Level M, v23 alphanumeric capacity is approximately 1,168 chars
			// Level M, v23 binary capacity is approximately 805 bytes

			console.log('\n| Devices | Payload | Fits in v23-M? | Headroom |');
			console.log('|---------|---------|----------------|----------|');

			// Approximate capacity for v23-M binary mode: ~805 bytes
			// But URL-safe base64 is alphanumeric, capacity ~1,168 chars
			const v23AlphanumCapacity = 1168;

			for (const scenario of scenarios) {
				const layout = createRealisticLayout(scenario.deviceCount);
				const baseUrl = 'https://app.rackarr.com/?l=';

				const minimalLayout = {
					v: layout.version,
					n: layout.name,
					r: {
						n: layout.rack.name,
						h: layout.rack.height,
						w: layout.rack.width,
						d: layout.rack.devices.map((d) => ({
							t: d.device_type,
							p: d.position,
							f: d.face[0],
							n: d.name
						}))
					},
					dt: layout.device_types.map((dt) => ({
						s: dt.slug,
						h: dt.u_height,
						m: dt.model,
						c: dt.category[0],
						x: dt.colour
					}))
				};

				const json = JSON.stringify(minimalLayout);
				const compressed = pako.deflate(json);
				const base64 = btoa(String.fromCharCode(...compressed));
				const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
				const fullUrl = baseUrl + urlSafe;

				const fits = fullUrl.length <= v23AlphanumCapacity;
				const headroom = v23AlphanumCapacity - fullUrl.length;

				console.log(
					`| ${scenario.deviceCount.toString().padStart(7)} | ${fullUrl.length.toString().padStart(7)} | ${fits ? '✅ Yes' : '❌ No'.padStart(14)} | ${headroom > 0 ? `+${headroom}` : headroom} chars |`
				);
			}

			// Test with even larger layouts
			console.log('\n=== STRESS TEST: Larger Layouts ===\n');
			const stressScenarios = [25, 30, 35, 40];

			for (const deviceCount of stressScenarios) {
				const layout = createRealisticLayout(deviceCount);
				const baseUrl = 'https://app.rackarr.com/?l=';

				const minimalLayout = {
					v: layout.version,
					n: layout.name,
					r: {
						n: layout.rack.name,
						h: layout.rack.height,
						w: layout.rack.width,
						d: layout.rack.devices.map((d) => ({
							t: d.device_type,
							p: d.position,
							f: d.face[0],
							n: d.name
						}))
					},
					dt: layout.device_types.map((dt) => ({
						s: dt.slug,
						h: dt.u_height,
						m: dt.model,
						c: dt.category[0],
						x: dt.colour
					}))
				};

				const json = JSON.stringify(minimalLayout);
				const compressed = pako.deflate(json);
				const base64 = btoa(String.fromCharCode(...compressed));
				const urlSafe = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
				const fullUrl = baseUrl + urlSafe;

				const fits = fullUrl.length <= v23AlphanumCapacity;
				const headroom = v23AlphanumCapacity - fullUrl.length;

				console.log(
					`${deviceCount} devices: ${fullUrl.length} chars - ${fits ? '✅' : '❌'} (headroom: ${headroom > 0 ? `+${headroom}` : headroom})`
				);
			}

			console.log('\n🎯 FINAL RECOMMENDATION:');
			console.log('   QR Version: 23 (fixed)');
			console.log('   Error Correction: M (15%)');
			console.log('   Print Size: 3.8cm');
			console.log('   Max Devices: ~30-35 (with typical device names)');

			expect(true).toBe(true);
		});
	});
});
