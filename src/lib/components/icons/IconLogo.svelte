<!--
  Rackarr logo icon - uses design tokens for theming
-->
<script lang="ts">
	interface Props {
		size?: number;
	}

	let { size = 20 }: Props = $props();
</script>

<svg
	class="logo-icon"
	width={size}
	height={size}
	viewBox="0 0 48 48"
	fill="none"
	aria-hidden="true"
>
	<!-- Rack frame -->
	<rect x="8" y="4" width="32" height="40" rx="2" class="logo-frame" />
	<rect x="12" y="8" width="24" height="32" class="logo-interior" />
	<!-- Devices -->
	<rect x="14" y="10" width="20" height="6" rx="1" class="logo-device-1" />
	<rect x="14" y="18" width="20" height="4" rx="1" class="logo-device-2" />
	<rect x="14" y="24" width="20" height="8" rx="1" class="logo-device-3" />
</svg>

<style>
	.logo-frame {
		fill: var(--logo-frame);
	}
	.logo-interior {
		fill: var(--logo-interior);
	}
	.logo-device-1 {
		fill: var(--logo-device-1);
	}
	.logo-device-2 {
		fill: var(--logo-device-2);
	}
	.logo-device-3 {
		fill: var(--logo-device-3);
	}
</style>
