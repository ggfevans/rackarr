<!--
  CategoryIcon Component
  Simple SVG icons for each device category
  Geometric shapes acceptable for v0.1
-->
<script lang="ts">
	import type { DeviceCategory } from '$lib/types';

	interface Props {
		category: DeviceCategory;
		size?: number;
	}

	let { category, size = 16 }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 16 16"
	fill="currentColor"
	aria-hidden="true"
	class="category-icon"
>
	{#if category === 'server'}
		<!-- Server: Horizontal lines (like rack server front) -->
		<rect x="2" y="3" width="12" height="3" rx="0.5" />
		<rect x="2" y="7" width="12" height="3" rx="0.5" />
		<rect x="2" y="11" width="12" height="2" rx="0.5" />
	{:else if category === 'network'}
		<!-- Network: Connected nodes -->
		<circle cx="8" cy="4" r="2" />
		<circle cx="4" cy="12" r="2" />
		<circle cx="12" cy="12" r="2" />
		<line x1="8" y1="6" x2="4" y2="10" stroke="currentColor" stroke-width="1.5" />
		<line x1="8" y1="6" x2="12" y2="10" stroke="currentColor" stroke-width="1.5" />
	{:else if category === 'patch-panel'}
		<!-- Patch Panel: Grid of dots -->
		<circle cx="4" cy="5" r="1.5" />
		<circle cx="8" cy="5" r="1.5" />
		<circle cx="12" cy="5" r="1.5" />
		<circle cx="4" cy="11" r="1.5" />
		<circle cx="8" cy="11" r="1.5" />
		<circle cx="12" cy="11" r="1.5" />
	{:else if category === 'power'}
		<!-- Power: Lightning bolt -->
		<polygon points="9,1 5,8 8,8 7,15 11,6 8,6" />
	{:else if category === 'storage'}
		<!-- Storage: Stacked drives -->
		<rect x="2" y="2" width="12" height="3" rx="0.5" />
		<rect x="2" y="6" width="12" height="3" rx="0.5" />
		<rect x="2" y="10" width="12" height="3" rx="0.5" />
		<circle cx="12" cy="3.5" r="0.75" fill="var(--neutral-950)" />
		<circle cx="12" cy="7.5" r="0.75" fill="var(--neutral-950)" />
		<circle cx="12" cy="11.5" r="0.75" fill="var(--neutral-950)" />
	{:else if category === 'kvm'}
		<!-- KVM: Monitor with keyboard -->
		<rect x="3" y="2" width="10" height="7" rx="0.5" />
		<rect x="4" y="3" width="8" height="5" fill="var(--neutral-950)" />
		<rect x="2" y="11" width="12" height="3" rx="0.5" />
	{:else if category === 'av-media'}
		<!-- AV/Media: Speaker/wave -->
		<rect x="3" y="4" width="4" height="8" rx="0.5" />
		<path
			d="M8 3 L12 1 L12 15 L8 13 Z"
			stroke="currentColor"
			stroke-width="1"
			fill="currentColor"
		/>
	{:else if category === 'cooling'}
		<!-- Cooling: Fan blades -->
		<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5" />
		<circle cx="8" cy="8" r="1.5" />
		<line x1="8" y1="3" x2="8" y2="6" stroke="currentColor" stroke-width="1.5" />
		<line x1="8" y1="10" x2="8" y2="13" stroke="currentColor" stroke-width="1.5" />
		<line x1="3" y1="8" x2="6" y2="8" stroke="currentColor" stroke-width="1.5" />
		<line x1="10" y1="8" x2="13" y2="8" stroke="currentColor" stroke-width="1.5" />
	{:else if category === 'shelf'}
		<!-- Shelf: Horizontal platform with angled supports -->
		<rect x="2" y="7" width="12" height="2" rx="0.3" />
		<line x1="3" y1="9" x2="4" y2="13" stroke="currentColor" stroke-width="1.5" />
		<line x1="13" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="1.5" />
	{:else if category === 'blank'}
		<!-- Blank: Empty rectangle -->
		<rect
			x="2"
			y="4"
			width="12"
			height="8"
			rx="0.5"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
		/>
	{:else}
		<!-- Other: Question mark -->
		<circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.5" />
		<text x="8" y="11" text-anchor="middle" font-size="8" font-weight="bold">?</text>
	{/if}
</svg>

<style>
	.category-icon {
		display: inline-block;
		vertical-align: middle;
	}
</style>
