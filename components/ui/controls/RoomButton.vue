<template>
	<button
		:class="buttonClasses"
		:disabled="disabled"
		@click="handleClick"
		type="button"
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
.room-button {
	flex: 1;
	min-height: 44px;
	padding: $spacing-sm;
	border: 1px solid $accent;
	border-radius: 50%;
	background-color: $surface;
	color: $accent;
	font-family: $font-family;
	font-size: $font-size-base;
	font-weight: $font-weight-regular;
	cursor: pointer;
	transition: $transition-fast;
	aspect-ratio: 1;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover:not(&--disabled):not(&--active) {
		background-color: $accent;
		color: $surface;
	}

	&--active {
		background-color: $accent;
		color: $surface;
		box-shadow: 0px 6px 20px 0px $background-secondary;
    border: none;
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
		}
	}
}
</style>
