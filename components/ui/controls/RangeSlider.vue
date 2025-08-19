<template>
	<div class="range-slider">
		<div class="range-slider__track">
			<div
				class="range-slider__fill"
				:style="{
					left: `${minPercent}%`,
					width: `${maxPercent - minPercent}%`,
				}"
			></div>
			<input
				v-model.number="localMin"
				type="range"
				:min="min"
				:max="max"
				:step="step"
				class="range-slider__input range-slider__input--min"
				@input="updateMin"
				@change="emitCommit"
			/>
			<input
				v-model.number="localMax"
				type="range"
				:min="min"
				:max="max"
				:step="step"
				class="range-slider__input range-slider__input--max"
				@input="updateMax"
				@change="emitCommit"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface Props {
	modelValue: [number, number];
	min: number;
	max: number;
	step?: number;
}

interface Emits {
	(e: 'update:modelValue', value: [number, number]): void;
	(e: 'commit'): void; // пользователь закончил перетаскивание
}

const props = withDefaults(defineProps<Props>(), {
	step: 1,
});

const emit = defineEmits<Emits>();

const localMin = ref(props.modelValue[0]);
const localMax = ref(props.modelValue[1]);

const minPercent = computed(() => {
	return ((localMin.value - props.min) / (props.max - props.min)) * 100;
});

const maxPercent = computed(() => {
	return ((localMax.value - props.min) / (props.max - props.min)) * 100;
});

const updateMin = () => {
	if (localMin.value > localMax.value) {
		localMin.value = localMax.value;
	}
	emit('update:modelValue', [localMin.value, localMax.value]);
};

const updateMax = () => {
	if (localMax.value < localMin.value) {
		localMax.value = localMin.value;
	}
	emit('update:modelValue', [localMin.value, localMax.value]);
};

const emitCommit = () => {
	emit('commit');
};

// Синхронизация с внешними изменениями
watch(
	() => props.modelValue,
	newValue => {
		localMin.value = newValue[0];
		localMax.value = newValue[1];
	},
	{ deep: true }
);
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as *;

.range-slider {
	position: relative;
	margin: $spacing-md 0;

	&__track {
		position: relative;
		height: 4px;
		background: rgba($text-secondary, 0.3);
		border-radius: 2px;
	}

	&__fill {
		position: absolute;
		height: 100%;
		background: $accent;
		border-radius: 2px;
		top: 0;
		transition: $transition-fast;
	}

	&__input {
		position: absolute;
		width: 100%;
		height: 4px;
		top: 0;
		left: 0;
		background: transparent;
		pointer-events: none;
		-webkit-appearance: none;
		appearance: none;
		outline: none;
		border: none;

		&::-webkit-slider-track {
			background: transparent;
			border: none;
		}

		&::-moz-range-track {
			background: transparent;
			border: none;
		}

		&::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			width: 20px;
			height: 20px;
			border-radius: 50%;
			background: $accent;
			border: 2px solid $surface;
			box-shadow: 0 2px 4px rgba($text-primary, 0.1);
			cursor: pointer;
			pointer-events: all;
			position: relative;
			z-index: 2;
		}

		&::-moz-range-thumb {
			width: 20px;
			height: 20px;
			border-radius: 50%;
			background: $accent;
			border: 2px solid $surface;
			box-shadow: 0 2px 4px rgba($text-primary, 0.1);
			cursor: pointer;
			pointer-events: all;
			position: relative;
			z-index: 2;
		}

		&--max {
			z-index: 3;
		}

		&:focus::-webkit-slider-thumb {
			box-shadow: 0 0 0 3px rgba($accent, 0.3);
		}

		&:focus::-moz-range-thumb {
			box-shadow: 0 0 0 3px rgba($accent, 0.3);
		}
	}
}
</style>
