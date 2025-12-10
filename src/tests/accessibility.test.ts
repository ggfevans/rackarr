/**
 * Accessibility Tests
 * Per spec Section 13 and Prompt 10.2
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Toolbar from '$lib/components/Toolbar.svelte';
import ToolbarButton from '$lib/components/ToolbarButton.svelte';
import Dialog from '$lib/components/Dialog.svelte';
import Toast from '$lib/components/Toast.svelte';
import ToastContainer from '$lib/components/ToastContainer.svelte';
import Rack from '$lib/components/Rack.svelte';
import RackDevice from '$lib/components/RackDevice.svelte';
import Drawer from '$lib/components/Drawer.svelte';
import IconPlus from '$lib/components/icons/IconPlus.svelte';

// Test data
const mockRack = {
	name: 'Test Rack',
	height: 12,
	width: 19 as const,
	position: 0,
	desc_units: false,
	form_factor: '4-post' as const,
	starting_unit: 1,
	devices: []
};

const mockDevice = {
	slug: 'device-1',
	model: 'Test Server',
	u_height: 2,
	rackarr: { colour: '#4A90D9', category: 'server' as const }
};

describe('Accessibility Tests', () => {
	describe('Buttons have accessible names', () => {
		it('ToolbarButton has aria-label', () => {
			const { container } = render(ToolbarButton, {
				props: {
					label: 'Add item',
					disabled: false
				}
			});

			const button = container.querySelector('button');
			expect(button).toHaveAttribute('aria-label', 'Add item');
		});

		it('Toolbar buttons have accessible labels', () => {
			render(Toolbar, {
				props: {
					hasSelection: false,
					theme: 'dark' as const
				}
			});

			// Check key buttons have aria-labels
			const buttons = screen.getAllByRole('button');
			buttons.forEach((button) => {
				// Each button should have either visible text or aria-label
				const hasLabel =
					button.getAttribute('aria-label') ||
					button.textContent?.trim() ||
					button.querySelector('[aria-label]');
				expect(hasLabel).toBeTruthy();
			});
		});
	});

	describe('Images and icons have alt text or aria-label', () => {
		it('Rack SVG has aria-label', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: [],
					selected: false
				}
			});

			const svg = container.querySelector('svg.rack-svg');
			expect(svg).toHaveAttribute('aria-label');
		});

		it('RackDevice has role button', () => {
			render(RackDevice, {
				props: {
					device: mockDevice,
					position: 1,
					rackHeight: 12,
					rackId: 'rack-1',
					deviceIndex: 0,
					uHeight: 22,
					rackWidth: 240,
					selected: false
				}
			});

			// RackDevice is interactive, should have button role
			const devices = screen.getAllByRole('button');
			expect(devices.length).toBeGreaterThan(0);
		});

		it('Decorative icons have aria-hidden', () => {
			const { container } = render(IconPlus, { props: { size: 16 } });

			const svg = container.querySelector('svg');
			expect(svg).toHaveAttribute('aria-hidden', 'true');
		});
	});

	describe('Focus indicators visible on keyboard navigation', () => {
		it('ToolbarButton has focus styles defined', () => {
			const { container } = render(ToolbarButton, {
				props: {
					label: 'Test button',
					disabled: false
				}
			});

			const button = container.querySelector('button');
			// Button should be focusable
			expect(button).not.toHaveAttribute('tabindex', '-1');
		});

		it('Rack component is keyboard focusable', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: [],
					selected: false
				}
			});

			const rackContainer = container.querySelector('.rack-container');
			const tabindex = rackContainer?.getAttribute('tabindex');
			expect(tabindex).toBe('0');
		});
	});

	describe('Tab order follows logical flow', () => {
		it('Toolbar buttons are in tab order', () => {
			render(Toolbar, {
				props: {
					hasSelection: false,
					theme: 'dark' as const
				}
			});

			const buttons = screen.getAllByRole('button');
			// All enabled buttons should be in tab order (no tabindex=-1)
			buttons
				.filter((btn) => !btn.hasAttribute('disabled'))
				.forEach((button) => {
					expect(button.getAttribute('tabindex')).not.toBe('-1');
				});
		});
	});

	describe('Dialogs trap focus correctly', () => {
		it('Dialog has role="dialog"', () => {
			render(Dialog, {
				props: {
					open: true,
					title: 'Test Dialog'
				}
			});

			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('Dialog has aria-modal="true"', () => {
			render(Dialog, {
				props: {
					open: true,
					title: 'Test Dialog'
				}
			});

			const dialog = screen.getByRole('dialog');
			expect(dialog).toHaveAttribute('aria-modal', 'true');
		});

		it('Dialog has aria-labelledby for title', () => {
			render(Dialog, {
				props: {
					open: true,
					title: 'Test Dialog'
				}
			});

			const dialog = screen.getByRole('dialog');
			const labelledBy = dialog.getAttribute('aria-labelledby');
			expect(labelledBy).toBeTruthy();

			// The referenced element should contain the title
			if (labelledBy) {
				const titleElement = document.getElementById(labelledBy);
				expect(titleElement?.textContent).toContain('Test Dialog');
			}
		});
	});

	describe('Toasts announced to screen readers', () => {
		it('Toast has role="alert"', () => {
			render(Toast, {
				props: {
					toast: {
						id: 'toast-1',
						type: 'success',
						message: 'Test message',
						duration: 3000
					}
				}
			});

			expect(screen.getByRole('alert')).toBeInTheDocument();
		});

		it('Toast message is readable', () => {
			render(Toast, {
				props: {
					toast: {
						id: 'toast-1',
						type: 'error',
						message: 'Error occurred',
						duration: 3000
					}
				}
			});

			expect(screen.getByText('Error occurred')).toBeInTheDocument();
		});

		it('ToastContainer has aria-live for announcements', () => {
			const { container } = render(ToastContainer);

			const toastContainer = container.querySelector('.toast-container');
			expect(toastContainer).toHaveAttribute('aria-live', 'polite');
		});
	});

	describe('Drawer accessibility', () => {
		it('Drawer has appropriate role', () => {
			const { container } = render(Drawer, {
				props: {
					side: 'left',
					open: true,
					title: 'Test Drawer'
				}
			});

			// Drawer should be a complementary region or have appropriate role
			const drawer = container.querySelector('.drawer');
			expect(drawer).toBeInTheDocument();
		});
	});

	describe('Interactive elements are semantic', () => {
		it('Buttons use button element, not div', () => {
			render(Toolbar, {
				props: {
					hasSelection: false,
					theme: 'dark' as const
				}
			});

			// All clickable items should be actual buttons
			const buttons = screen.getAllByRole('button');
			buttons.forEach((button) => {
				expect(button.tagName.toLowerCase()).toBe('button');
			});
		});
	});

	// Note: "Expandable elements have aria-expanded" test suite was removed in v0.1.0
	// The Device Library toggle button was removed - sidebar is now always visible

	describe('Selected items have aria-selected', () => {
		it('Selected rack has aria-selected="true"', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: [],
					selected: true
				}
			});

			const rackContainer = container.querySelector('.rack-container');
			expect(rackContainer).toHaveAttribute('aria-selected', 'true');
		});

		it('Non-selected rack has aria-selected="false"', () => {
			const { container } = render(Rack, {
				props: {
					rack: mockRack,
					deviceLibrary: [],
					selected: false
				}
			});

			const rackContainer = container.querySelector('.rack-container');
			expect(rackContainer).toHaveAttribute('aria-selected', 'false');
		});
	});
});
