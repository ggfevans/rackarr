<!--
  QR Code icon
-->
<script lang="ts">
	interface Props {
		size?: number;
	}

	let { size = 20 }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<rect x="3" y="3" width="7" height="7" />
	<rect x="14" y="3" width="7" height="7" />
	<rect x="3" y="14" width="7" height="7" />
	<rect x="14" y="14" width="3" height="3" />
	<rect x="18" y="14" width="3" height="3" />
	<rect x="14" y="18" width="3" height="3" />
	<rect x="18" y="18" width="3" height="3" />
</svg>
