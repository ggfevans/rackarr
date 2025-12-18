/**
 * DrawerHeader Component Tests
 * Tests for drawer header with title and close button
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import DrawerHeader from '$lib/components/DrawerHeader.svelte';

describe('DrawerHeader', () => {
	describe('Rendering', () => {
		it('renders without crashing', () => {
			render(DrawerHeader, { props: { title: 'Test Header' } });
			expect(document.querySelector('.drawer-header')).toBeTruthy();
		});

		it('renders title in an h2 element', () => {
			render(DrawerHeader, { props: { title: 'My Drawer' } });
			const title = screen.getByRole('heading', { level: 2 });
			expect(title).toBeTruthy();
			expect(title.textContent).toBe('My Drawer');
		});
	});

	describe('Title Prop', () => {
		it('displays the provided title', () => {
			render(DrawerHeader, { props: { title: 'Device Library' } });
			expect(screen.getByText('Device Library')).toBeTruthy();
		});

		it('displays different titles correctly', () => {
			const { unmount } = render(DrawerHeader, { props: { title: 'Settings' } });
			expect(screen.getByText('Settings')).toBeTruthy();
			unmount();

			render(DrawerHeader, { props: { title: 'Edit Device' } });
			expect(screen.getByText('Edit Device')).toBeTruthy();
		});

		it('handles long titles', () => {
			render(DrawerHeader, { props: { title: 'A Very Long Drawer Header Title That Might Wrap' } });
			expect(screen.getByText('A Very Long Drawer Header Title That Might Wrap')).toBeTruthy();
		});
	});

	describe('Close Button', () => {
		it('shows close button by default', () => {
			render(DrawerHeader, { props: { title: 'Test' } });
			const closeButton = screen.getByRole('button', { name: /close drawer/i });
			expect(closeButton).toBeTruthy();
		});

		it('hides close button when showClose is false', () => {
			render(DrawerHeader, { props: { title: 'Test', showClose: false } });
			const closeButton = screen.queryByRole('button', { name: /close drawer/i });
			expect(closeButton).toBeNull();
		});

		it('shows close button when showClose is true', () => {
			render(DrawerHeader, { props: { title: 'Test', showClose: true } });
			const closeButton = screen.getByRole('button', { name: /close drawer/i });
			expect(closeButton).toBeTruthy();
		});

		it('close button has correct aria-label', () => {
			render(DrawerHeader, { props: { title: 'Test' } });
			const closeButton = screen.getByRole('button', { name: /close drawer/i });
			expect(closeButton.getAttribute('aria-label')).toBe('Close drawer');
		});

		it('close button contains an SVG icon', () => {
			render(DrawerHeader, { props: { title: 'Test' } });
			const closeButton = screen.getByRole('button', { name: /close drawer/i });
			const svg = closeButton.querySelector('svg');
			expect(svg).toBeTruthy();
		});

		it('SVG icon has aria-hidden for accessibility', () => {
			render(DrawerHeader, { props: { title: 'Test' } });
			const closeButton = screen.getByRole('button', { name: /close drawer/i });
			const svg = closeButton.querySelector('svg');
			expect(svg?.getAttribute('aria-hidden')).toBe('true');
		});
	});

	describe('onclose Callback', () => {
		it('calls onclose when close button is clicked', async () => {
			const handleClose = vi.fn();
			render(DrawerHeader, { props: { title: 'Test', onclose: handleClose } });

			const closeButton = screen.getByRole('button', { name: /close drawer/i });
			await fireEvent.click(closeButton);

			expect(handleClose).toHaveBeenCalledTimes(1);
		});

		it('does not throw when clicked without onclose callback', async () => {
			render(DrawerHeader, { props: { title: 'Test' } });

			const closeButton = screen.getByRole('button', { name: /close drawer/i });
			// Should not throw
			await expect(fireEvent.click(closeButton)).resolves.toBe(true);
		});

		it('calls onclose each time close button is clicked', async () => {
			const handleClose = vi.fn();
			render(DrawerHeader, { props: { title: 'Test', onclose: handleClose } });

			const closeButton = screen.getByRole('button', { name: /close drawer/i });
			await fireEvent.click(closeButton);
			await fireEvent.click(closeButton);
			await fireEvent.click(closeButton);

			expect(handleClose).toHaveBeenCalledTimes(3);
		});
	});

	describe('Styling', () => {
		it('has drawer-header class on container', () => {
			render(DrawerHeader, { props: { title: 'Test' } });
			expect(document.querySelector('.drawer-header')).toBeTruthy();
		});

		it('has drawer-title class on title element', () => {
			render(DrawerHeader, { props: { title: 'Test' } });
			expect(document.querySelector('.drawer-title')).toBeTruthy();
		});

		it('has close-button class on close button', () => {
			render(DrawerHeader, { props: { title: 'Test' } });
			expect(document.querySelector('.close-button')).toBeTruthy();
		});
	});

	describe('Button Type', () => {
		it('close button has type="button" to prevent form submission', () => {
			render(DrawerHeader, { props: { title: 'Test' } });
			const closeButton = screen.getByRole('button', { name: /close drawer/i });
			expect(closeButton.getAttribute('type')).toBe('button');
		});
	});
});
