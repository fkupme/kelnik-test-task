<template>
	<button
		:class="buttonClasses"
		:disabled="disabled"
		@click="handleClick"
		type="button"
		:aria-pressed="active"
		:aria-label="`${room}-комнатная квартира${active ? ', выбрано' : ''}${
			disabled ? ', недоступно' : ''
		}`"
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
	width: 44px;
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

	&:focus {
		outline: 2px solid $accent;
		outline-offset: 2px;
	}

	&:hover:not(&--disabled):not(&--active) {
		background-color: $accent;
		color: $surface;
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba($accent, 0.2);
	}

	&--active {
		background-color: $accent;
		color: $surface;
		box-shadow: 0px 6px 20px 0px $background-secondary;
		border: 2px solid $accent;
		transform: scale(1.05);
	}

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

	&:active:not(&--disabled) {
		transform: scale(0.95);
	}
}

@media (prefers-contrast: high) {
	.room-button {
		border-width: 2px;

		&--active {
			border-width: 3px;
		}
	}
}

@media (prefers-reduced-motion: reduce) {
	.room-button {
		transition: color $transition-fast, background-color $transition-fast;

		&:hover:not(&--disabled):not(&--active),
		&--active,
		&:active:not(&--disabled) {
			transform: none;
		}
	}
}

@include mobile {
	.room-button {
		min-height: 48px; 
		min-width: 48px;
		font-size: $font-size-sm;
	}
}
</style>
