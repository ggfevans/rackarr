<!--
  AirflowIndicator Component
  Edge stripe + small arrow design for airflow visualization
-->
<script lang="ts">
	import type { Airflow, RackView } from '$lib/types';

	interface Props {
		airflow: Airflow;
		view: RackView;
		width?: number;
		height?: number;
	}

	let { airflow, view, width = 100, height = 40 }: Props = $props();

	// Constants
	const STRIPE_WIDTH = 4;
	const ARROW_SIZE = 8;

	// Determine if this view shows intake or exhaust
	const isIntakeSide = $derived.by(() => {
		if (airflow === 'passive') return false;
		if (airflow === 'front-to-rear') return view === 'front';
		if (airflow === 'rear-to-front') return view === 'rear';
		if (airflow === 'side-to-rear') return view === 'front'; // Side intake shown on front
		return false;
	});

	// Stripe color based on intake/exhaust
	const stripeColor = $derived(isIntakeSide ? '#60a5fa' : '#f87171');

	// Stripe position: LEFT for front view, RIGHT for rear view
	const stripeX = $derived(view === 'front' ? 0 : width - STRIPE_WIDTH);

	// Arrow positioning - next to stripe, centered vertically
	const arrowX = $derived(
		view === 'front' ? STRIPE_WIDTH + 8 : width - STRIPE_WIDTH - ARROW_SIZE - 8
	);
	const arrowY = $derived(height / 2);

	// Arrow points - chevron shape
	const arrowPoints = $derived.by(() => {
		const cx = arrowX;
		const cy = arrowY;
		const size = ARROW_SIZE;

		// Arrow direction: intake points INTO device (toward center), exhaust points OUT
		if (view === 'front') {
			if (isIntakeSide) {
				// Intake on front: arrow points right (into device)
				return `${cx},${cy - size / 2} ${cx + size},${cy} ${cx},${cy + size / 2}`;
			} else {
				// Exhaust on front: arrow points left (out of device)
				return `${cx + size},${cy - size / 2} ${cx},${cy} ${cx + size},${cy + size / 2}`;
			}
		} else {
			if (isIntakeSide) {
				// Intake on rear: arrow points left (into device)
				return `${cx + size},${cy - size / 2} ${cx},${cy} ${cx + size},${cy + size / 2}`;
			} else {
				// Exhaust on rear: arrow points right (out of device)
				return `${cx},${cy - size / 2} ${cx + size},${cy} ${cx},${cy + size / 2}`;
			}
		}
	});

	// Passive circle dimensions
	const circleRadius = $derived(Math.min(10, height / 4));
</script>

<g class="airflow-indicator">
	{#if airflow === 'passive'}
		<!-- Hollow circle for passive devices -->
		<circle
			cx={width / 2}
			cy={height / 2}
			r={circleRadius}
			stroke="#9ca3af"
			stroke-width="2"
			fill="none"
			opacity="0.7"
		/>
	{:else}
		<!-- Edge stripe -->
		<rect x={stripeX} y="0" width={STRIPE_WIDTH} {height} fill={stripeColor} opacity="0.85" />

		<!-- Directional arrow -->
		<polyline
			points={arrowPoints}
			stroke={stripeColor}
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			fill="none"
			class="airflow-arrow"
		/>
	{/if}
</g>

<style>
	@keyframes airflow-march {
		from {
			stroke-dashoffset: 8;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	.airflow-arrow {
		stroke-dasharray: 4 4;
		animation: airflow-march 0.8s linear infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.airflow-arrow {
			animation: none;
			stroke-dasharray: none;
		}
	}
</style>
