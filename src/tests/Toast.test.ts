/**
 * Toast Component Tests
 * Tests for individual toast notification rendering
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Toast from '$lib/components/Toast.svelte';
import { resetToastStore, getToastStore } from '$lib/stores/toast.svelte';
import type { Toast as ToastType } from '$lib/stores/toast.svelte';

describe('Toast', () => {
	beforeEach(() => {
		resetToastStore();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	// Helper to create toast props
	function createToast(overrides: Partial<ToastType> = {}): ToastType {
		return {
			id: 'test-toast-1',
			type: 'info',
			message: 'Test message',
			duration: 5000,
			...overrides
		};
	}

	describe('Rendering', () => {
		it('renders without crashing', () => {
			render(Toast, { props: { toast: createToast() } });
			expect(document.querySelector('.toast')).toBeTruthy();
		});

		it('displays the toast message', () => {
			render(Toast, { props: { toast: createToast({ message: 'Hello World' }) } });
			expect(screen.getByText('Hello World')).toBeTruthy();
		});

		it('has role="alert" for accessibility', () => {
			render(Toast, { props: { toast: createToast() } });
			const alert = screen.getByRole('alert');
			expect(alert).toBeTruthy();
		});
	});

	describe('Toast Types', () => {
		it('renders success toast with correct class and icon', () => {
			render(Toast, { props: { toast: createToast({ type: 'success' }) } });
			const toast = document.querySelector('.toast');
			expect(toast?.classList.contains('toast--success')).toBe(true);
			expect(screen.getByText('✓')).toBeTruthy();
		});

		it('renders error toast with correct class and icon', () => {
			render(Toast, { props: { toast: createToast({ type: 'error' }) } });
			const toast = document.querySelector('.toast');
			expect(toast?.classList.contains('toast--error')).toBe(true);
			// Error icon is ✕ in the icon span (dismiss button also uses ✕)
			const icon = document.querySelector('.toast__icon');
			expect(icon?.textContent?.trim()).toBe('✕');
		});

		it('renders warning toast with correct class and icon', () => {
			render(Toast, { props: { toast: createToast({ type: 'warning' }) } });
			const toast = document.querySelector('.toast');
			expect(toast?.classList.contains('toast--warning')).toBe(true);
			expect(screen.getByText('⚠')).toBeTruthy();
		});

		it('renders info toast with correct class and icon', () => {
			render(Toast, { props: { toast: createToast({ type: 'info' }) } });
			const toast = document.querySelector('.toast');
			expect(toast?.classList.contains('toast--info')).toBe(true);
			expect(screen.getByText('ℹ')).toBeTruthy();
		});
	});

	describe('Icons', () => {
		it('icon has aria-hidden for accessibility', () => {
			render(Toast, { props: { toast: createToast() } });
			const icon = document.querySelector('.toast__icon');
			expect(icon?.getAttribute('aria-hidden')).toBe('true');
		});
	});

	describe('Dismiss Button', () => {
		it('has dismiss button with accessible label', () => {
			render(Toast, { props: { toast: createToast() } });
			const dismissBtn = screen.getByRole('button', { name: /dismiss notification/i });
			expect(dismissBtn).toBeTruthy();
		});

		it('dismiss button has type="button"', () => {
			render(Toast, { props: { toast: createToast() } });
			const dismissBtn = screen.getByRole('button', { name: /dismiss notification/i });
			expect(dismissBtn.getAttribute('type')).toBe('button');
		});

		it('clicking dismiss starts exit animation', async () => {
			vi.useRealTimers(); // Need real timers for this test
			const toast = createToast({ id: 'dismiss-test' });
			render(Toast, { props: { toast } });

			const dismissBtn = screen.getByRole('button', { name: /dismiss notification/i });
			await fireEvent.click(dismissBtn);

			// Check for exit class
			const toastEl = document.querySelector('.toast');
			expect(toastEl?.classList.contains('toast--exiting')).toBe(true);
		});

		it('dismiss removes toast from store after animation', async () => {
			const toastStore = getToastStore();
			const toastId = toastStore.showToast('Test', 'info', 0); // Permanent toast
			const toast = toastStore.toasts.find((t) => t.id === toastId)!;

			render(Toast, { props: { toast } });
			expect(toastStore.toasts.length).toBe(1);

			const dismissBtn = screen.getByRole('button', { name: /dismiss notification/i });
			await fireEvent.click(dismissBtn);

			// Fast-forward animation time
			vi.advanceTimersByTime(300);

			expect(toastStore.toasts.length).toBe(0);
		});
	});

	describe('Success Glow Animation', () => {
		it('success toast has glow class initially', () => {
			render(Toast, { props: { toast: createToast({ type: 'success' }) } });
			const toast = document.querySelector('.toast');
			expect(toast?.classList.contains('toast--success-glow')).toBe(true);
		});

		it('non-success toasts do not have glow class', () => {
			render(Toast, { props: { toast: createToast({ type: 'error' }) } });
			const toast = document.querySelector('.toast');
			expect(toast?.classList.contains('toast--success-glow')).toBe(false);
		});
	});

	describe('Styling Classes', () => {
		it('has toast__icon class for icon element', () => {
			render(Toast, { props: { toast: createToast() } });
			expect(document.querySelector('.toast__icon')).toBeTruthy();
		});

		it('has toast__message class for message element', () => {
			render(Toast, { props: { toast: createToast() } });
			expect(document.querySelector('.toast__message')).toBeTruthy();
		});

		it('has toast__dismiss class for dismiss button', () => {
			render(Toast, { props: { toast: createToast() } });
			expect(document.querySelector('.toast__dismiss')).toBeTruthy();
		});
	});
});
