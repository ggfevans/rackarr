<!--
  AirflowIndicator Component
  Displays airflow direction indicators on devices (Pure SVG version)
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

	// Determine if this is the intake or exhaust side based on airflow and view
	const isIntake = $derived.by(() => {
		if (airflow === 'passive') return false;
		if (airflow === 'front-to-rear') return view === 'front';
		if (airflow === 'rear-to-front') return view === 'rear';
		if (airflow === 'side-to-rear') return view === 'front';
		return false;
	});

	// Get the color based on intake/exhaust
	const color = $derived.by(() => {
		if (airflow === 'passive') return 'var(--colour-airflow-passive, #9ca3af)';
		if (airflow === 'front-to-rear') {
			return view === 'front'
				? 'var(--colour-airflow-intake, #60a5fa)'
				: 'var(--colour-airflow-exhaust, #f87171)';
		}
		if (airflow === 'rear-to-front') {
			return view === 'rear'
				? 'var(--colour-airflow-intake, #60a5fa)'
				: 'var(--colour-airflow-exhaust, #f87171)';
		}
		if (airflow === 'side-to-rear') {
			return view === 'front'
				? 'var(--colour-airflow-intake, #60a5fa)'
				: 'var(--colour-airflow-exhaust, #f87171)';
		}
		// Lateral flows - use neutral
		return 'var(--colour-airflow-passive, #9ca3af)';
	});

	// Get arrow direction
	const arrowDirection = $derived.by(() => {
		if (airflow === 'passive') return 'none';
		if (airflow === 'front-to-rear') return 'right';
		if (airflow === 'rear-to-front') return 'left';
		if (airflow === 'left-to-right') return 'right';
		if (airflow === 'right-to-left') return 'left';
		if (airflow === 'side-to-rear') return view === 'front' ? 'corner' : 'right';
		return 'none';
	});

	// Background tint color with low opacity
	const bgColor = $derived.by(() => {
		if (airflow === 'passive') return 'transparent';
		return isIntake
			? 'var(--colour-airflow-intake, #60a5fa)'
			: 'var(--colour-airflow-exhaust, #f87171)';
	});
</script>

<g class="airflow-indicator">
	<!-- Subtle background tint -->
	{#if airflow !== 'passive'}
		<rect x="0" y="0" {width} {height} fill={bgColor} opacity="0.1" rx="2" />
	{/if}

	{#if airflow === 'passive'}
		<!-- Passive: hollow circle -->
		<circle
			cx={width / 2}
			cy={height / 2}
			r={Math.min(width, height) / 4}
			stroke={color}
			stroke-width="2"
			fill="none"
			opacity="0.6"
		/>
	{:else if arrowDirection === 'corner'}
		<!-- Side-to-rear corner indicator -->
		<path
			d="M {width * 0.2} {height * 0.3} L {width * 0.5} {height * 0.7} L {width * 0.8} {height *
				0.5}"
			stroke={color}
			stroke-width="2.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			fill="none"
		/>
	{:else if arrowDirection === 'right'}
		<!-- Right-pointing arrows (front-to-rear from front, etc.) -->
		<g>
			<!-- First arrow -->
			<line
				x1={width * 0.2}
				y1={height * 0.5}
				x2={width * 0.4}
				y2={height * 0.5}
				stroke={color}
				stroke-width="2.5"
				stroke-linecap="round"
			/>
			<polyline
				points="{width * 0.32},{height * 0.32} {width * 0.45},{height * 0.5} {width *
					0.32},{height * 0.68}"
				stroke={color}
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				fill="none"
			/>
			<!-- Second arrow -->
			<line
				x1={width * 0.55}
				y1={height * 0.5}
				x2={width * 0.75}
				y2={height * 0.5}
				stroke={color}
				stroke-width="2.5"
				stroke-linecap="round"
			/>
			<polyline
				points="{width * 0.67},{height * 0.32} {width * 0.8},{height * 0.5} {width * 0.67},{height *
					0.68}"
				stroke={color}
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				fill="none"
			/>
		</g>
	{:else if arrowDirection === 'left'}
		<!-- Left-pointing arrows (rear-to-front from front, etc.) -->
		<g>
			<!-- First arrow -->
			<line
				x1={width * 0.8}
				y1={height * 0.5}
				x2={width * 0.6}
				y2={height * 0.5}
				stroke={color}
				stroke-width="2.5"
				stroke-linecap="round"
			/>
			<polyline
				points="{width * 0.68},{height * 0.32} {width * 0.55},{height * 0.5} {width *
					0.68},{height * 0.68}"
				stroke={color}
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				fill="none"
			/>
			<!-- Second arrow -->
			<line
				x1={width * 0.45}
				y1={height * 0.5}
				x2={width * 0.25}
				y2={height * 0.5}
				stroke={color}
				stroke-width="2.5"
				stroke-linecap="round"
			/>
			<polyline
				points="{width * 0.33},{height * 0.32} {width * 0.2},{height * 0.5} {width * 0.33},{height *
					0.68}"
				stroke={color}
				stroke-width="2.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				fill="none"
			/>
		</g>
	{/if}
</g>
