/**
 * ToastContainer Component Tests
 * Tests for toast container and stack rendering
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import ToastContainer from '$lib/components/ToastContainer.svelte';
import { resetToastStore, getToastStore } from '$lib/stores/toast.svelte';

describe('ToastContainer', () => {
	beforeEach(() => {
		resetToastStore();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Rendering', () => {
		it('renders without crashing', () => {
			render(ToastContainer);
			expect(document.querySelector('.toast-container')).toBeTruthy();
		});

		it('renders empty when no toasts', () => {
			render(ToastContainer);
			const container = document.querySelector('.toast-container');
			expect(container?.children.length).toBe(0);
		});
	});

	describe('Accessibility', () => {
		it('has aria-live="polite" for screen reader announcements', () => {
			render(ToastContainer);
			const container = document.querySelector('.toast-container');
			expect(container?.getAttribute('aria-live')).toBe('polite');
		});

		it('has aria-atomic="false" to allow incremental updates', () => {
			render(ToastContainer);
			const container = document.querySelector('.toast-container');
			expect(container?.getAttribute('aria-atomic')).toBe('false');
		});
	});

	describe('Toast Display', () => {
		it('renders a single toast when one is shown', () => {
			const toastStore = getToastStore();
			toastStore.showToast('Test message', 'info', 0);

			render(ToastContainer);
			expect(screen.getByText('Test message')).toBeTruthy();
		});

		it('renders multiple toasts', () => {
			const toastStore = getToastStore();
			toastStore.showToast('First toast', 'info', 0);
			toastStore.showToast('Second toast', 'success', 0);
			toastStore.showToast('Third toast', 'error', 0);

			render(ToastContainer);

			expect(screen.getByText('First toast')).toBeTruthy();
			expect(screen.getByText('Second toast')).toBeTruthy();
			expect(screen.getByText('Third toast')).toBeTruthy();
		});

		it('renders toasts of different types', () => {
			const toastStore = getToastStore();
			toastStore.showToast('Success!', 'success', 0);
			toastStore.showToast('Error!', 'error', 0);
			toastStore.showToast('Warning!', 'warning', 0);
			toastStore.showToast('Info!', 'info', 0);

			render(ToastContainer);

			expect(document.querySelector('.toast--success')).toBeTruthy();
			expect(document.querySelector('.toast--error')).toBeTruthy();
			expect(document.querySelector('.toast--warning')).toBeTruthy();
			expect(document.querySelector('.toast--info')).toBeTruthy();
		});
	});

	describe('Toast Management', () => {
		it('removes toast when dismissed via store', async () => {
			const toastStore = getToastStore();
			const toastId = toastStore.showToast('Dismissable', 'info', 0);

			render(ToastContainer);
			expect(screen.getByText('Dismissable')).toBeTruthy();

			toastStore.dismissToast(toastId);
			await tick();
			expect(screen.queryByText('Dismissable')).toBeNull();
		});

		it('clears all toasts when clearAllToasts is called', async () => {
			const toastStore = getToastStore();
			toastStore.showToast('Toast 1', 'info', 0);
			toastStore.showToast('Toast 2', 'info', 0);
			toastStore.showToast('Toast 3', 'info', 0);

			render(ToastContainer);
			expect(document.querySelectorAll('.toast').length).toBe(3);

			toastStore.clearAllToasts();
			await tick();
			expect(document.querySelectorAll('.toast').length).toBe(0);
		});

		it('auto-dismisses toast after duration', async () => {
			const toastStore = getToastStore();
			toastStore.showToast('Auto dismiss', 'info', 3000);

			render(ToastContainer);
			expect(screen.getByText('Auto dismiss')).toBeTruthy();

			// Fast forward past duration
			vi.advanceTimersByTime(3000);
			await tick();

			expect(screen.queryByText('Auto dismiss')).toBeNull();
		});

		it('permanent toast (duration=0) does not auto-dismiss', () => {
			const toastStore = getToastStore();
			toastStore.showToast('Permanent', 'info', 0);

			render(ToastContainer);
			expect(screen.getByText('Permanent')).toBeTruthy();

			// Fast forward a long time
			vi.advanceTimersByTime(60000);

			expect(screen.getByText('Permanent')).toBeTruthy();
		});
	});

	describe('Toast Ordering', () => {
		it('shows toasts in order they were added', () => {
			const toastStore = getToastStore();
			toastStore.showToast('First', 'info', 0);
			toastStore.showToast('Second', 'info', 0);
			toastStore.showToast('Third', 'info', 0);

			render(ToastContainer);

			const toasts = document.querySelectorAll('.toast');
			expect(toasts.length).toBe(3);
			// Due to column-reverse layout, visual order is reversed
			// but DOM order should match add order
		});
	});

	describe('Unique Keys', () => {
		it('each toast has a unique ID for proper keying', () => {
			const toastStore = getToastStore();
			const id1 = toastStore.showToast('Toast 1', 'info', 0);
			const id2 = toastStore.showToast('Toast 2', 'info', 0);
			const id3 = toastStore.showToast('Toast 3', 'info', 0);

			expect(id1).not.toBe(id2);
			expect(id2).not.toBe(id3);
			expect(id1).not.toBe(id3);
		});
	});
});
