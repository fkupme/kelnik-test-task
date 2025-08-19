<template>
	<div v-if="isOpen" class="bottom-sheet" @click="onBackdropClick">
		<div
			class="bottom-sheet__backdrop"
			:class="{ 'bottom-sheet__backdrop--visible': isVisible }"
		></div>

		<div
			class="bottom-sheet__content"
			:class="{ 'bottom-sheet__content--visible': isVisible }"
			@click.stop
		>
			<div class="bottom-sheet__handle"></div>

			<div class="bottom-sheet__header" v-if="title">
				<h3 class="bottom-sheet__title">{{ title }}</h3>
				<button class="bottom-sheet__close" @click="close" aria-label="Закрыть">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path
							d="M18 6L6 18M6 6L18 18"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
				</button>
			</div>

			<div class="bottom-sheet__body">
				<slot />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

interface Props {
	modelValue: boolean;
	title?: string;
	closeOnBackdrop?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	closeOnBackdrop: true,
});

const emit = defineEmits<{
	'update:modelValue': [value: boolean];
}>();

const isOpen = ref(false);
const isVisible = ref(false);
const canTeleport = ref(false);

onMounted(() => {
	canTeleport.value = typeof document !== 'undefined';
});

const open = async () => {
	console.log('open() called, current isOpen:', isOpen.value);
	if (isOpen.value) return; // Избегаем повторного открытия

	isOpen.value = true;
	console.log('Set isOpen to true');
	await nextTick();

	// Небольшая задержка для триггера анимации
	setTimeout(() => {
		isVisible.value = true;
		console.log('Set isVisible to true');
	}, 10);

	// Блокируем скролл body
	if (typeof document !== 'undefined') {
		document.body.style.overflow = 'hidden';
	}
};

const close = async () => {
	console.log('close() called, current isOpen:', isOpen.value);
	if (!isOpen.value) return; // Избегаем повторного закрытия

	isVisible.value = false;

	// Ждем окончания анимации перед удалением из DOM
	setTimeout(() => {
		isOpen.value = false;
		if (typeof document !== 'undefined') {
			document.body.style.overflow = '';
		}
		emit('update:modelValue', false);
	}, 300);
};

// Отслеживаем изменения modelValue
watch(
	() => props.modelValue,
	async (newValue, oldValue) => {
		console.log('BottomSheet watcher triggered:', { newValue, oldValue });

		if (newValue) {
			console.log('Opening bottom sheet...');
			await open();
		} else if (oldValue !== undefined) {
			// Закрываем только если oldValue определен (не первый вызов)
			console.log('Closing bottom sheet...');
			await close();
		}
	},
	{ immediate: true }
);

const onBackdropClick = () => {
	if (props.closeOnBackdrop) {
		close();
	}
};

// Очищаем overflow при размонтировании компонента
onUnmounted(() => {
	if (typeof document !== 'undefined') {
		document.body.style.overflow = '';
	}
});
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables';

.bottom-sheet {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 1000;
	pointer-events: auto;

	// Отладочный стиль
	border: 2px solid red !important;

	&__backdrop {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		opacity: 0;
		transition: opacity 0.3s ease;

		&--visible {
			opacity: 1;
		}
	}

	&__content {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: $surface;
		border-radius: $border-radius-lg $border-radius-lg 0 0;
		max-height: 90vh;
		transform: translateY(100%);
		transition: transform 0.3s ease;
		display: flex;
		flex-direction: column;
		box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);

		&--visible {
			transform: translateY(0);
		}
	}

	&__handle {
		width: 40px;
		height: 4px;
		background-color: $border-color;
		border-radius: 2px;
		margin: $spacing-sm auto;
		flex-shrink: 0;
	}

	&__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: $spacing-md $spacing-lg 0;
		flex-shrink: 0;
	}

	&__title {
		font-size: $font-size-lg;
		font-weight: $font-weight-bold;
		color: $text-primary;
		margin: 0;
		font-family: $font-family;
	}

	&__close {
		background: none;
		border: none;
		padding: $spacing-xs;
		color: $text-secondary;
		cursor: pointer;
		border-radius: $border-radius-sm;
		transition: background-color 0.2s ease, color 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;

		&:hover {
			background-color: $background-light;
			color: $text-primary;
		}
	}

	&__body {
		padding: $spacing-lg;
		flex: 1;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}
}

// Скрываем bottom sheet на больших экранах
@include desktop {
	.bottom-sheet {
		display: none;
	}
}

@include tablet {
	.bottom-sheet {
		display: none;
	}
}
@include mobile {
	.bottom-sheet {
		display: unset;
	}
}
</style>
