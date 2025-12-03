import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import HelpPanel from '$lib/components/HelpPanel.svelte';
import { VERSION } from '$lib/version';

describe('HelpPanel', () => {
	describe('Visibility', () => {
		it('renders when open=true', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('hidden when open=false', () => {
			render(HelpPanel, { props: { open: false } });

			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});
	});

	describe('App Information', () => {
		it('shows app name', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByText('Rackarr')).toBeInTheDocument();
		});

		it('shows version number', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByText(new RegExp(VERSION))).toBeInTheDocument();
		});

		it('shows app description', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByText(/rack layout designer/i)).toBeInTheDocument();
		});
	});

	describe('Keyboard Shortcuts', () => {
		it('shows keyboard shortcuts section', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
		});

		it('lists common shortcuts', () => {
			render(HelpPanel, { props: { open: true } });

			// Check for some key shortcuts from spec Section 8
			expect(screen.getByText(/escape/i)).toBeInTheDocument();
			// Check for Delete key in key-cell
			expect(screen.getByText(/delete.*backspace/i)).toBeInTheDocument();
		});

		it('shows Ctrl/Cmd shortcuts', () => {
			render(HelpPanel, { props: { open: true } });

			// Should show save shortcut (Ctrl/Cmd + S)
			expect(screen.getByText('Ctrl/Cmd + S')).toBeInTheDocument();
		});
	});

	describe('Links', () => {
		it('shows repository links', () => {
			render(HelpPanel, { props: { open: true } });

			const links = screen.getAllByRole('link');
			const repoLinks = links.filter(
				(link) =>
					link.getAttribute('href')?.includes('git') ||
					link.getAttribute('href')?.includes('github')
			);

			expect(repoLinks.length).toBeGreaterThan(0);
		});

		it('shows GitHub repository link', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
		});

		it('does not show Forgejo link', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.queryByText(/forgejo/i)).not.toBeInTheDocument();
			expect(screen.queryByText(/primary repository/i)).not.toBeInTheDocument();
		});

		it('links open in new tab', () => {
			render(HelpPanel, { props: { open: true } });

			const links = screen.getAllByRole('link');
			links.forEach((link) => {
				expect(link.getAttribute('target')).toBe('_blank');
			});
		});

		it('links have rel="noopener noreferrer" for security', () => {
			render(HelpPanel, { props: { open: true } });

			const links = screen.getAllByRole('link');
			links.forEach((link) => {
				expect(link.getAttribute('rel')).toContain('noopener');
			});
		});
	});

	describe('License', () => {
		it('shows MIT license', () => {
			render(HelpPanel, { props: { open: true } });

			expect(screen.getByText(/mit license/i)).toBeInTheDocument();
		});
	});

	describe('Close Actions', () => {
		it('close button dispatches close event', async () => {
			const onClose = vi.fn();

			render(HelpPanel, {
				props: { open: true, onclose: onClose }
			});

			// Get the primary close button (not the dialog X button)
			const closeButtons = screen.getAllByRole('button', { name: /close/i });
			// The main close button is the btn-primary one
			const mainCloseButton = closeButtons.find((btn) => btn.classList.contains('btn-primary'));
			expect(mainCloseButton).toBeDefined();
			await fireEvent.click(mainCloseButton!);

			expect(onClose).toHaveBeenCalledTimes(1);
		});

		it('escape key dispatches close event', async () => {
			const onClose = vi.fn();

			render(HelpPanel, {
				props: { open: true, onclose: onClose }
			});

			await fireEvent.keyDown(window, { key: 'Escape' });

			expect(onClose).toHaveBeenCalledTimes(1);
		});
	});
});
