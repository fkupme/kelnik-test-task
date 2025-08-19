<template>
	<button
		class="mobile-filter-button"
		@click="handleClick"
		:disabled="disabled"
	>
		<svg
			class="mobile-filter-button__icon"
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
		>
			<path
				d="M2.5 5.83333H17.5M5 10H15M7.5 14.1667H12.5"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
			/>
		</svg>
		<span class="mobile-filter-button__text">{{ text }}</span>
		<span v-if="activeFiltersCount > 0" class="mobile-filter-button__badge">
			{{ activeFiltersCount }}
		</span>
	</button>
</template>

<script setup lang="ts">
interface Props {
	text?: string;
	activeFiltersCount?: number;
	disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
	text: 'Фильтры',
	activeFiltersCount: 0,
	disabled: false,
});

const emit = defineEmits<{
	click: [];
}>();

const handleClick = () => {
	emit('click');
};
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as *;

.mobile-filter-button {
	display: none;
	position: relative;
	background: $surface;
	border: 1px solid $border-color;
	border-radius: $border-radius-md;
	padding: $spacing-sm $spacing-md;
	color: $text-primary;
	font-family: $font-family;
	font-size: $font-size-sm;
	font-weight: $font-weight-medium;
	cursor: pointer;
	transition: all 0.2s ease;
	align-items: center;
	gap: $spacing-xs;
	width: 100%;

	&:hover:not(:disabled) {
		background-color: $background-light;
		border-color: $accent;
	}

	&:active:not(:disabled) {
		transform: translateY(1px);
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	&__icon {
		flex-shrink: 0;
		color: $text-secondary;
		transition: color 0.2s ease;
	}

	&__text {
		flex: 1;
		text-align: left;
	}

	&__badge {
		background: $accent;
		color: $surface;
		font-size: $font-size-xs;
		font-weight: $font-weight-bold;
		border-radius: 50%;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	&:hover &__icon {
		color: $accent;
	}

	@include mobile {
		display: flex;
	}
}
</style>
