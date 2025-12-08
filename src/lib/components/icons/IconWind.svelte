<!--
  Wind/Airflow icon for airflow visualization toggle
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
	data-icon="wind"
>
	<!-- Wind/airflow lines -->
	<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
	<path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
	<path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
</svg>
