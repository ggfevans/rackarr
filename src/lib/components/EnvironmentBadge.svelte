<!--
  EnvironmentBadge Component
  Visual indicator for non-production environments (DEV, LOCAL)
  Features animated cylon-style gradient, respects prefers-reduced-motion
-->
<script lang="ts">
	// Build-time environment constant from vite.config.ts
	declare const __BUILD_ENV__: string;

	// Determine environment type
	const buildEnv = typeof __BUILD_ENV__ !== 'undefined' ? __BUILD_ENV__ : '';

	// Check if running locally
	const isLocalhost =
		typeof window !== 'undefined' &&
		(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

	// Determine badge text and visibility
	// LOCAL takes precedence over DEV
	const badgeText = $derived.by(() => {
		if (isLocalhost) return 'LOCAL';
		if (buildEnv === 'development') return 'DEV';
		return null;
	});

	// Aria label for accessibility
	const ariaLabel = $derived.by(() => {
		if (isLocalhost) return 'Local environment';
		if (buildEnv === 'development') return 'Development environment';
		return '';
	});
</script>

{#if badgeText}
	<span class="env-badge env-badge--animated" role="status" aria-label={ariaLabel}>
		{badgeText}
	</span>
{/if}

<style>
	.env-badge {
		display: inline-flex;
		align-items: center;
		padding: var(--space-1) var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--env-badge-text);
		background: var(--env-badge-bg);
		border-radius: var(--radius-sm);
		box-shadow: var(--env-badge-glow);
		user-select: none;
	}

	/* Cylon-style animated gradient */
	.env-badge--animated {
		background: linear-gradient(
			90deg,
			var(--env-badge-bg) 0%,
			var(--env-badge-gradient-start) 50%,
			var(--env-badge-bg) 100%
		);
		background-size: 200% 100%;
		animation: cylon var(--env-badge-anim-duration) ease-in-out infinite;
	}

	@keyframes cylon {
		0%,
		100% {
			background-position: 200% 0;
		}
		50% {
			background-position: 0% 0;
		}
	}

	/* Respect reduced motion preference - static badge */
	@media (prefers-reduced-motion: reduce) {
		.env-badge--animated {
			background: var(--env-badge-bg);
			animation: none;
		}
	}
</style>
