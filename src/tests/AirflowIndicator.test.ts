import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import AirflowIndicator from '$lib/components/AirflowIndicator.svelte';

describe('AirflowIndicator Component', () => {
	describe('Passive airflow', () => {
		it('renders hollow circle for passive airflow', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'passive', view: 'front' }
			});

			expect(container.querySelector('circle')).toBeInTheDocument();
		});

		it('circle has stroke but no fill', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'passive', view: 'front' }
			});

			const circle = container.querySelector('circle');
			expect(circle).toHaveAttribute('fill', 'none');
			expect(circle).toHaveAttribute('stroke');
		});
	});

	describe('Front-to-rear airflow', () => {
		it('renders background tint on front view', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'front' }
			});

			// Check for background rect (intake tint)
			const rect = container.querySelector('rect');
			expect(rect).toBeInTheDocument();
		});

		it('renders background tint on rear view', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'rear' }
			});

			// Check for background rect (exhaust tint)
			const rect = container.querySelector('rect');
			expect(rect).toBeInTheDocument();
		});

		it('renders arrow lines', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'front' }
			});

			const lines = container.querySelectorAll('line');
			expect(lines.length).toBeGreaterThan(0);
		});

		it('renders arrow heads (polylines)', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'front' }
			});

			const polylines = container.querySelectorAll('polyline');
			expect(polylines.length).toBeGreaterThan(0);
		});
	});

	describe('Rear-to-front airflow', () => {
		it('renders arrow lines on front view', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'rear-to-front', view: 'front' }
			});

			const lines = container.querySelectorAll('line');
			expect(lines.length).toBeGreaterThan(0);
		});

		it('renders arrow lines on rear view', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'rear-to-front', view: 'rear' }
			});

			const lines = container.querySelectorAll('line');
			expect(lines.length).toBeGreaterThan(0);
		});
	});

	describe('Lateral airflow', () => {
		it('renders arrows for left-to-right', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'left-to-right', view: 'front' }
			});

			const lines = container.querySelectorAll('line');
			expect(lines.length).toBeGreaterThan(0);
		});

		it('renders arrows for right-to-left', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'right-to-left', view: 'front' }
			});

			const lines = container.querySelectorAll('line');
			expect(lines.length).toBeGreaterThan(0);
		});
	});

	describe('Side-to-rear airflow', () => {
		it('renders path for corner indicator on front', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'side-to-rear', view: 'front' }
			});

			const path = container.querySelector('path');
			expect(path).toBeInTheDocument();
		});

		it('renders arrows on rear view', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'side-to-rear', view: 'rear' }
			});

			const lines = container.querySelectorAll('line');
			expect(lines.length).toBeGreaterThan(0);
		});
	});

	describe('Dimensions', () => {
		it('uses provided width and height for circle', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'passive', view: 'front', width: 200, height: 80 }
			});

			const circle = container.querySelector('circle');
			// Circle should be centered at width/2, height/2
			expect(circle).toHaveAttribute('cx', '100');
			expect(circle).toHaveAttribute('cy', '40');
		});

		it('uses provided dimensions for background rect', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'front', width: 200, height: 80 }
			});

			const rect = container.querySelector('rect');
			expect(rect).toHaveAttribute('width', '200');
			expect(rect).toHaveAttribute('height', '80');
		});
	});

	describe('SVG structure', () => {
		it('renders as SVG group element', () => {
			const { container } = render(AirflowIndicator, {
				props: { airflow: 'front-to-rear', view: 'front' }
			});

			const group = container.querySelector('g.airflow-indicator');
			expect(group).toBeInTheDocument();
		});
	});
});
