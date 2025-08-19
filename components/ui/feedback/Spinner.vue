<template>
	<div :class="spinnerClasses">
		<svg
			class="spinner__icon"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle
				class="spinner__circle"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				stroke-width="2"
			/>
		</svg>
		<span v-if="label" class="spinner__label">{{ label }}</span>
	</div>
</template>

<script setup lang="ts">
interface Props {
	size?: 'sm' | 'md' | 'lg';
	label?: string;
}

const props = withDefaults(defineProps<Props>(), {
	size: 'md',
});

const spinnerClasses = computed(() => {
	return ['spinner', `spinner--${props.size}`];
});
</script>

<style lang="scss" scoped>
.spinner {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: $spacing-sm;

	&--sm {
		.spinner__icon {
			width: 20px;
			height: 20px;
		}
		.spinner__label {
			font-size: $font-size-sm;
		}
	}

	&--md {
		.spinner__icon {
			width: 32px;
			height: 32px;
		}
		.spinner__label {
			font-size: $font-size-base;
		}
	}

	&--lg {
		.spinner__icon {
			width: 48px;
			height: 48px;
		}
		.spinner__label {
			font-size: $font-size-lg;
		}
	}

	&__icon {
		animation: spinner-spin 1s linear infinite;
		color: $accent;
	}

	&__circle {
		fill: none;
		stroke-dasharray: 20 20;
		stroke-dashoffset: 40;
		stroke-linecap: round;
		animation: spinner-dash 1.5s ease-in-out infinite;
	}

	&__label {
		color: $text-secondary;
		text-align: center;
		font-family: $font-family;
	}
}

@keyframes spinner-spin {
	to {
		transform: rotate(360deg);
	}
}

@keyframes spinner-dash {
	0% {
		stroke-dasharray: 1 40;
		stroke-dashoffset: 0;
	}
	50% {
		stroke-dasharray: 20 20;
		stroke-dashoffset: -20;
	}
	100% {
		stroke-dasharray: 1 40;
		stroke-dashoffset: -40;
	}
}
</style>
