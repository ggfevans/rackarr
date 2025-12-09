import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import AirflowIndicator from '$lib/components/AirflowIndicator.svelte';

describe('AirflowIndicator - Edge Stripe Design', () => {
	const defaultProps = { width: 400, height: 50 };

	describe('passive airflow', () => {
		it('renders hollow circle for passive airflow', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'passive', view: 'front', ...defaultProps }
			});

			const circle = container.querySelector('circle');
			expect(circle).toBeInTheDocument();
			expect(circle).toHaveAttribute('fill', 'none');
			expect(circle).toHaveAttribute('stroke');
		});

		it('does not render edge stripe for passive', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'passive', view: 'front', ...defaultProps }
			});

			// Should not have rect elements (stripes)
			const rects = container.querySelectorAll('rect');
			expect(rects.length).toBe(0);
		});

		it('circle is centered in the device', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'passive', view: 'front', width: 200, height: 80 }
			});

			const circle = container.querySelector('circle');
			expect(circle).toHaveAttribute('cx', '100');
			expect(circle).toHaveAttribute('cy', '40');
		});

		it('renders same for front and rear view', () => {
			const { container: front } = render(AirflowIndicator, {
				props: { airflow: 'passive', view: 'front', ...defaultProps }
			});
			const { container: rear } = render(AirflowIndicator, {
				props: { airflow: 'passive', view: 'rear', ...defaultProps }
			});

			expect(front.querySelector('circle')).toBeInTheDocument();
			expect(rear.querySelector('circle')).toBeInTheDocument();
		});
	});

	describe('front-to-rear airflow', () => {
		it('renders stripe on LEFT in front view (intake)', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'front', ...defaultProps }
			});

			const stripe = container.querySelector('rect');
			expect(stripe).toBeInTheDocument();
			expect(stripe).toHaveAttribute('x', '0');
		});

		it('renders blue stripe (intake) in front view', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'front', ...defaultProps }
			});

			const stripe = container.querySelector('rect');
			const fill = stripe?.getAttribute('fill');
			// Accept either hex or CSS variable
			expect(fill).toMatch(/#60a5fa|var\(--colour-airflow-intake\)/i);
		});

		it('renders stripe on RIGHT in rear view (exhaust)', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'rear', ...defaultProps }
			});

			const stripe = container.querySelector('rect');
			expect(stripe).toBeInTheDocument();
			const x = parseFloat(stripe?.getAttribute('x') || '0');
			// Stripe should be at width - 4 (stripe width)
			expect(x).toBe(defaultProps.width - 4);
		});

		it('renders red stripe (exhaust) in rear view', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'rear', ...defaultProps }
			});

			const stripe = container.querySelector('rect');
			const fill = stripe?.getAttribute('fill');
			expect(fill).toMatch(/#f87171|var\(--colour-airflow-exhaust\)/i);
		});

		it('renders directional arrow', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'front', ...defaultProps }
			});

			const arrow = container.querySelector('polyline, path');
			expect(arrow).toBeInTheDocument();
		});
	});

	describe('rear-to-front airflow', () => {
		it('renders stripe on LEFT in front view (exhaust)', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'rear-to-front', view: 'front', ...defaultProps }
			});

			const stripe = container.querySelector('rect');
			expect(stripe).toBeInTheDocument();
			expect(stripe).toHaveAttribute('x', '0');
		});

		it('renders red stripe (exhaust) in front view', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'rear-to-front', view: 'front', ...defaultProps }
			});

			const stripe = container.querySelector('rect');
			const fill = stripe?.getAttribute('fill');
			expect(fill).toMatch(/#f87171|var\(--colour-airflow-exhaust\)/i);
		});

		it('renders stripe on RIGHT in rear view (intake)', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'rear-to-front', view: 'rear', ...defaultProps }
			});

			const stripe = container.querySelector('rect');
			const x = parseFloat(stripe?.getAttribute('x') || '0');
			expect(x).toBe(defaultProps.width - 4);
		});

		it('renders blue stripe (intake) in rear view', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'rear-to-front', view: 'rear', ...defaultProps }
			});

			const stripe = container.querySelector('rect');
			const fill = stripe?.getAttribute('fill');
			expect(fill).toMatch(/#60a5fa|var\(--colour-airflow-intake\)/i);
		});

		it('renders directional arrow', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'rear-to-front', view: 'front', ...defaultProps }
			});

			const arrow = container.querySelector('polyline, path');
			expect(arrow).toBeInTheDocument();
		});
	});

	describe('side-to-rear airflow', () => {
		it('renders stripe on LEFT in front view (intake from sides)', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'side-to-rear', view: 'front', ...defaultProps }
			});

			const stripe = container.querySelector('rect');
			expect(stripe).toBeInTheDocument();
			expect(stripe).toHaveAttribute('x', '0');
		});

		it('renders blue stripe (intake) in front view', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'side-to-rear', view: 'front', ...defaultProps }
			});

			const stripe = container.querySelector('rect');
			const fill = stripe?.getAttribute('fill');
			expect(fill).toMatch(/#60a5fa|var\(--colour-airflow-intake\)/i);
		});

		it('renders stripe on RIGHT in rear view (exhaust)', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'side-to-rear', view: 'rear', ...defaultProps }
			});

			const stripe = container.querySelector('rect');
			const x = parseFloat(stripe?.getAttribute('x') || '0');
			expect(x).toBe(defaultProps.width - 4);
		});

		it('renders red stripe (exhaust) in rear view', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'side-to-rear', view: 'rear', ...defaultProps }
			});

			const stripe = container.querySelector('rect');
			const fill = stripe?.getAttribute('fill');
			expect(fill).toMatch(/#f87171|var\(--colour-airflow-exhaust\)/i);
		});

		it('renders directional arrow', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'side-to-rear', view: 'front', ...defaultProps }
			});

			const arrow = container.querySelector('polyline, path');
			expect(arrow).toBeInTheDocument();
		});
	});

	describe('stripe dimensions', () => {
		it('stripe is 4px wide', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'front', ...defaultProps }
			});

			const stripe = container.querySelector('rect');
			expect(stripe).toHaveAttribute('width', '4');
		});

		it('stripe spans full device height', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'front', ...defaultProps }
			});

			const stripe = container.querySelector('rect');
			expect(stripe).toHaveAttribute('height', String(defaultProps.height));
		});

		it('stripe starts at y=0', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'front', ...defaultProps }
			});

			const stripe = container.querySelector('rect');
			expect(stripe).toHaveAttribute('y', '0');
		});
	});

	describe('arrow animation class', () => {
		it('arrow has airflow-arrow class for animation', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'front', ...defaultProps }
			});

			const arrow = container.querySelector('.airflow-arrow');
			expect(arrow).toBeInTheDocument();
		});

		it('arrow is a polyline element', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'front', ...defaultProps }
			});

			const polyline = container.querySelector('polyline.airflow-arrow');
			expect(polyline).toBeInTheDocument();
		});
	});

	describe('SVG structure', () => {
		it('renders as SVG group element', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'front', ...defaultProps }
			});

			const group = container.querySelector('g.airflow-indicator');
			expect(group).toBeInTheDocument();
		});

		it('renders as SVG group for passive too', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'passive', view: 'front', ...defaultProps }
			});

			const group = container.querySelector('g.airflow-indicator');
			expect(group).toBeInTheDocument();
		});
	});
});
