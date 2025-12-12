/**
 * CollapsibleSection Component Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import CollapsibleSection from '$lib/components/CollapsibleSection.svelte';

describe('CollapsibleSection Component', () => {
	describe('Rendering', () => {
		it('renders title and count', () => {
			render(CollapsibleSection, {
				props: {
					title: 'Ubiquiti',
					count: 18
				}
			});

			expect(screen.getByText('Ubiquiti')).toBeInTheDocument();
			expect(screen.getByText('(18)')).toBeInTheDocument();
		});

		it('renders with zero count', () => {
			render(CollapsibleSection, {
				props: {
					title: 'Empty Section',
					count: 0
				}
			});

			expect(screen.getByText('Empty Section')).toBeInTheDocument();
			expect(screen.getByText('(0)')).toBeInTheDocument();
		});
	});

	describe('Default State', () => {
		it('starts collapsed when defaultExpanded is false', () => {
			render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5,
					defaultExpanded: false
				}
			});

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('aria-expanded', 'false');
		});

		it('starts collapsed by default (no defaultExpanded prop)', () => {
			render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5
				}
			});

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('aria-expanded', 'false');
		});

		it('starts expanded when defaultExpanded is true', () => {
			render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5,
					defaultExpanded: true
				}
			});

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('aria-expanded', 'true');
		});
	});

	describe('Toggle Behavior', () => {
		it('clicking header toggles expanded state', async () => {
			render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5,
					defaultExpanded: false
				}
			});

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('aria-expanded', 'false');

			await fireEvent.click(button);
			expect(button).toHaveAttribute('aria-expanded', 'true');

			await fireEvent.click(button);
			expect(button).toHaveAttribute('aria-expanded', 'false');
		});

		it('pressing Enter toggles expanded state', async () => {
			render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5,
					defaultExpanded: false
				}
			});

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('aria-expanded', 'false');

			await fireEvent.keyDown(button, { key: 'Enter' });
			expect(button).toHaveAttribute('aria-expanded', 'true');
		});

		it('pressing Space toggles expanded state', async () => {
			render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5,
					defaultExpanded: false
				}
			});

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('aria-expanded', 'false');

			await fireEvent.keyDown(button, { key: ' ' });
			expect(button).toHaveAttribute('aria-expanded', 'true');
		});
	});

	describe('Accessibility', () => {
		it('header has button role', () => {
			render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5
				}
			});

			expect(screen.getByRole('button')).toBeInTheDocument();
		});

		it('button has aria-expanded attribute', () => {
			render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5
				}
			});

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('aria-expanded');
		});

		it('button has aria-controls pointing to content region', () => {
			render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5
				}
			});

			const button = screen.getByRole('button');
			const controlsId = button.getAttribute('aria-controls');
			expect(controlsId).toBeTruthy();

			// Find the content region by id
			const content = document.getElementById(controlsId!);
			expect(content).toBeInTheDocument();
		});

		it('content region has role="region"', () => {
			render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5,
					defaultExpanded: true
				}
			});

			expect(screen.getByRole('region')).toBeInTheDocument();
		});
	});

	describe('Content Visibility', () => {
		it('content is hidden when collapsed', () => {
			const { container } = render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5,
					defaultExpanded: false
				}
			});

			const content = container.querySelector('.collapsible-content');
			expect(content).toHaveAttribute('aria-hidden', 'true');
		});

		it('content is visible when expanded', () => {
			const { container } = render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5,
					defaultExpanded: true
				}
			});

			const content = container.querySelector('.collapsible-content');
			expect(content).toHaveAttribute('aria-hidden', 'false');
		});

		it('content visibility toggles with expansion', async () => {
			const { container } = render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5,
					defaultExpanded: false
				}
			});

			const button = screen.getByRole('button');
			const content = container.querySelector('.collapsible-content');

			expect(content).toHaveAttribute('aria-hidden', 'true');

			await fireEvent.click(button);
			expect(content).toHaveAttribute('aria-hidden', 'false');

			await fireEvent.click(button);
			expect(content).toHaveAttribute('aria-hidden', 'true');
		});
	});

	describe('Visual Elements', () => {
		it('has chevron indicator', () => {
			const { container } = render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5
				}
			});

			const chevron = container.querySelector('.chevron');
			expect(chevron).toBeInTheDocument();
		});

		it('chevron has rotated class when expanded', async () => {
			const { container } = render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5,
					defaultExpanded: true
				}
			});

			const chevron = container.querySelector('.chevron');
			expect(chevron).toHaveClass('rotated');
		});

		it('chevron does not have rotated class when collapsed', () => {
			const { container } = render(CollapsibleSection, {
				props: {
					title: 'Test Section',
					count: 5,
					defaultExpanded: false
				}
			});

			const chevron = container.querySelector('.chevron');
			expect(chevron).not.toHaveClass('rotated');
		});
	});
});
