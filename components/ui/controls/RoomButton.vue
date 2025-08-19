<template>
	<button
		:class="buttonClasses"
		:disabled="disabled"
		@click="handleClick"
		type="button"
		:aria-pressed="active"
		:aria-label="`${room}-комнатная квартира${active ? ', выбрано' : ''}${disabled ? ', недоступно' : ''}`"
		:title="`${room}-комнатная квартира`"
	>
		{{ room }}к
	</button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
	room: number;
	active?: boolean;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	active: false,
	disabled: false,
});

const emit = defineEmits<{
	click: [room: number];
}>();

const buttonClasses = computed(() => {
	return [
		'room-button',
		{
			'room-button--active': props.active,
			'room-button--disabled': props.disabled,
		},
	];
});

const handleClick = () => {
	if (!props.disabled) {
		emit('click', props.room);
	}
};
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as *;

.room-button {
	flex: 1;
	min-height: 44px;
	min-width: 44px; // Ensure minimum touch target
	padding: $spacing-sm;
	border: 1px solid $accent;
	border-radius: 50%;
	background-color: $surface;
	color: $accent;
	font-family: $font-family;
	font-size: $font-size-base;
	font-weight: $font-weight-medium;
	cursor: pointer;
	transition: all $transition-fast;
	aspect-ratio: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;

	// Focus styles for accessibility
	&:focus {
		outline: 2px solid $accent;
		outline-offset: 2px;
	}

	// Hover state
	&:hover:not(&--disabled):not(&--active) {
		background-color: $accent;
		color: $surface;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba($accent, 0.2);
	}

	// Active state (selected)
	&--active {
		background-color: $accent;
		color: $surface;
		box-shadow: 0px 6px 20px 0px $background-secondary;
		border: 2px solid $accent;
		transform: scale(1.05);

		// Add check icon for better visual feedback
		&::after {
			content: '✓';
			position: absolute;
			top: -2px;
			right: -2px;
			width: 16px;
			height: 16px;
			background: $success;
			color: $surface;
			border-radius: 50%;
			font-size: 10px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-weight: bold;
		}
	}

	// Disabled state
	&--disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: $background-light;
		border-color: $border-color;
		color: $text-secondary;

		&:hover {
			background-color: $background-light;
			color: $text-secondary;
			transform: none;
			box-shadow: none;
		}

		&:focus {
			outline-color: $border-color;
		}
	}

	// Press effect
	&:active:not(&--disabled) {
		transform: scale(0.95);
	}
}

// High contrast mode
@media (prefers-contrast: high) {
	.room-button {
		border-width: 2px;

		&--active {
			border-width: 3px;
		}
	}
}

// Reduced motion
@media (prefers-reduced-motion: reduce) {
	.room-button {
		transition: color $transition-fast, background-color $transition-fast;

		&:hover:not(&--disabled):not(&--active),
		&--active,
		&:active:not(&--disabled) {
			transform: none;
		}

		&--active::after {
			animation: none;
		}
	}
}

// Mobile adaptations
@include mobile {
	.room-button {
		min-height: 48px; // Larger touch target on mobile
		min-width: 48px;
		font-size: $font-size-sm;
	}
}
</style>
