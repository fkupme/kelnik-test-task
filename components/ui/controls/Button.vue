<template>
	<button
		:class="buttonClasses"
		:disabled="disabled"
		:type="type"
		v-bind="$attrs"
		@click="handleClick"
	>
		<span v-if="loading" class="button__spinner">
			<svg
				class="button__spinner-icon"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle
					class="button__spinner-circle"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					stroke-width="4"
				/>
			</svg>
		</span>
		<span v-if="!loading || !hideTextOnLoading" class="button__content">
			<slot />
		</span>
	</button>
</template>

<script setup lang="ts">
interface Props {
	variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link' | 'outline';
	size?: 'sm' | 'md' | 'lg' | 'large';
	disabled?: boolean;
	loading?: boolean;
	hideTextOnLoading?: boolean;
	type?: 'button' | 'submit' | 'reset';
	fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'primary',
	size: 'md',
	disabled: false,
	loading: false,
	hideTextOnLoading: false,
	type: 'button',
	fullWidth: false,
});

const emit = defineEmits<{
	click: [event: MouseEvent];
}>();

const buttonClasses = computed(() => {
	return [
		'button',
		`button--${props.variant}`,
		`button--${props.size}`,
		{
			'button--disabled': props.disabled,
			'button--loading': props.loading,
			'button--full-width': props.fullWidth,
		},
	];
});

const handleClick = (event: MouseEvent) => {
	if (!props.disabled && !props.loading) {
		emit('click', event);
	}
};
</script>

<style lang="scss" scoped>
.button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: $spacing-xs;
	border: none;
	border-radius: $spacing-xs;
	font-family: $font-family;
	font-weight: $font-weight-bold;
	text-decoration: none;
	cursor: pointer;
	transition: all $transition-fast;
	outline: none;
	position: relative;

	&:focus-visible {
		outline: 2px solid $accent;
		outline-offset: 2px;
	}

	// Sizes
	&--sm {
		padding: $spacing-xs / 2 $spacing-sm;
		font-size: $font-size-sm;
		line-height: 1.4;
	}

	&--md {
		padding: $spacing-sm - 2px $spacing-md;
		font-size: $font-size-base;
		line-height: 1.5;
	}

	&--lg {
		padding: $spacing-md - 2px $spacing-lg - 4px;
		font-size: $font-size-lg;
		line-height: 1.5;
	}

	&--large {
		padding: $spacing-lg $spacing-xl;
		font-size: $font-size-lg;
		line-height: 1.5;
	}

	// Variants
	&--primary {
		background-color: $accent;
		color: $surface;

		&:hover:not(.button--disabled):not(.button--loading) {
			background-color: darken($accent, 10%);
		}

		&:active:not(.button--disabled):not(.button--loading) {
			background-color: darken($accent, 20%);
		}
	}

	&--secondary {
		background-color: $background-light;
		color: $text-primary;
		border: 1px solid $border-color;

		&:hover:not(.button--disabled):not(.button--loading) {
			background-color: darken($background-light, 5%);
			border-color: darken($border-color, 10%);
		}

		&:active:not(.button--disabled):not(.button--loading) {
			background-color: darken($background-light, 10%);
		}
	}

	&--danger {
		background-color: #dc3545;
		color: $surface;

		&:hover:not(.button--disabled):not(.button--loading) {
			background-color: #c82333;
		}

		&:active:not(.button--disabled):not(.button--loading) {
			background-color: #bd2130;
		}
	}

	&--ghost {
		background-color: transparent;
		color: $accent;
		border: 1px solid $accent;

		&:hover:not(.button--disabled):not(.button--loading) {
			background-color: $accent;
			color: $surface;
		}
	}

	&--link {
		background-color: transparent;
		color: $accent;
		padding: $spacing-xs / 2 $spacing-xs;

		&:hover:not(.button--disabled):not(.button--loading) {
			text-decoration: underline;
		}
	}

	&--outline {
		background-color: transparent;
		color: $text-primary;
		border: 1px solid $border-color;

		&:hover:not(.button--disabled):not(.button--loading) {
			background-color: $surface;
			border-color: $accent;
		}
	}

	// States
	&--disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	&--loading {
		cursor: wait;
	}

	&--full-width {
		width: 100%;
	}

	// Spinner
	&__spinner {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	&__spinner-icon {
		width: 1em;
		height: 1em;
		animation: button-spin 1s linear infinite;
	}

	&__spinner-circle {
		fill: none;
		stroke-dasharray: 16 16;
		stroke-dashoffset: 32;
		stroke-linecap: round;
		animation: button-spin-dash 1.5s ease-in-out infinite;
	}

	&__content {
		display: flex;
		align-items: center;
		gap: inherit;
	}
}

@keyframes button-spin {
	to {
		transform: rotate(360deg);
	}
}

@keyframes button-spin-dash {
	0% {
		stroke-dasharray: 1 32;
		stroke-dashoffset: 0;
	}
	50% {
		stroke-dasharray: 16 16;
		stroke-dashoffset: -16;
	}
	100% {
		stroke-dasharray: 1 32;
		stroke-dashoffset: -32;
	}
}
</style>
