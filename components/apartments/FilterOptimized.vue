<template>
	<aside class="filter-optimized" :class="{ 'filter-optimized--filtering': store.isFiltering }">
		<!-- Заголовок с индикатором фильтрации -->
		<div class="filter-optimized__header">
			<h2 class="filter-optimized__title">Фильтры</h2>
			<Transition name="spinner-fade">
				<UIFeedbackSpinner 
					v-if="store.isFiltering"
					size="sm"
					class="filter-optimized__spinner"
				/>
			</Transition>
		</div>

		<!-- Счетчик активных фильтров -->
		<div v-if="store.activeFiltersCount > 0" class="filter-optimized__counter">
			<span class="filter-optimized__counter-text">
				Активных фильтров: {{ store.activeFiltersCount }}
			</span>
			<button 
				class="filter-optimized__counter-reset"
				@click="resetAllFilters"
				:disabled="store.isFiltering"
			>
				Сбросить все
			</button>
		</div>

		<!-- Фильтр по комнатам -->
		<section class="filter-optimized__section">
			<h3 class="filter-optimized__section-title">Количество комнат</h3>
			<div class="filter-optimized__rooms">
				<UIControlsRoomButton
					v-for="room in availableRooms"
					:key="room"
					:room="room"
					:active="selectedRooms.includes(room)"
					:disabled="store.isFiltering || !allPossibleRooms.includes(room)"
					@click="toggleRoom"
				/>
			</div>
		</section>

		<!-- Фильтр по цене -->
		<section class="filter-optimized__section">
			<h3 class="filter-optimized__section-title">Стоимость квартиры, ₽</h3>
			<div class="filter-optimized__range-labels">
				<span class="filter-optimized__range-label filter-optimized__range-label--min">
					от {{ formatPrice(priceRange[0]) }}
				</span>
				<span class="filter-optimized__range-label filter-optimized__range-label--max">
					до {{ formatPrice(priceRange[1]) }}
				</span>
			</div>
			<UIControlsRangeSlider
				v-model="priceRange"
				:min="minPrice"
				:max="maxPrice"
				:step="priceStep"
				:disabled="store.isFiltering"
				@commit="commitPriceFilter"
			/>
		</section>

		<!-- Фильтр по площади -->
		<section class="filter-optimized__section">
			<h3 class="filter-optimized__section-title">Площадь, м²</h3>
			<div class="filter-optimized__range-labels">
				<span class="filter-optimized__range-label filter-optimized__range-label--min">
					от {{ areaRange[0] }}
				</span>
				<span class="filter-optimized__range-label filter-optimized__range-label--max">
					до {{ areaRange[1] }}
				</span>
			</div>
			<UIControlsRangeSlider
				v-model="areaRange"
				:min="minArea"
				:max="maxArea"
				:step="areaStep"
				:disabled="store.isFiltering"
				@commit="commitAreaFilter"
			/>
		</section>

		<!-- Кнопка сброса фильтров -->
		<div class="filter-optimized__actions">
			<UIControlsButton
				@click="resetAllFilters"
				variant="outline"
				size="medium"
				:disabled="store.isFiltering || store.activeFiltersCount === 0"
				class="filter-optimized__reset"
			>
				Сбросить фильтры
			</UIControlsButton>
		</div>
	</aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';

interface Props {
	store: any; // Типизация может быть улучшена
}

const props = defineProps<Props>();

// === Локальное состояние ===
const selectedRooms = ref<number[]>([...props.store.draftFilters.rooms]);
const priceRange = ref<[number, number]>([
	props.store.draftFilters.priceRange[0] || props.store.priceRange[0] || 5500000,
	props.store.draftFilters.priceRange[1] || props.store.priceRange[1] || 18900000,
]);
const areaRange = ref<[number, number]>([
	props.store.draftFilters.areaRange[0] || props.store.areaRange[0] || 33,
	props.store.draftFilters.areaRange[1] || props.store.areaRange[1] || 123,
]);

// === Вычисляемые свойства ===
const availableRooms = computed(() => {
	if (props.store.apartments.length === 0) return [1, 2, 3, 4];
	const rooms = [...new Set(props.store.apartments.map((apt: any) => apt.rooms))];
	return rooms.sort((a: number, b: number) => a - b);
});

const allPossibleRooms = computed(() => [1, 2, 3, 4]); // Все возможные варианты

const minPrice = computed(() => props.store.priceRange[0] || 5500000);
const maxPrice = computed(() => props.store.priceRange[1] || 18900000);
const minArea = computed(() => props.store.areaRange[0] || 33);
const maxArea = computed(() => props.store.areaRange[1] || 123);

const priceStep = computed(() => 
	Math.max(1000, Math.round((maxPrice.value - minPrice.value) / 100))
);
const areaStep = computed(() => 
	Math.max(1, Math.round((maxArea.value - minArea.value) / 100))
);

// === Утилиты ===
const formatPrice = (price: number): string => 
	new Intl.NumberFormat('ru-RU').format(price);

// === Обработчики ===
const toggleRoom = (room: number) => {
	if (props.store.isFiltering) return;
	
	const index = selectedRooms.value.indexOf(room);
	if (index > -1) {
		selectedRooms.value.splice(index, 1);
	} else {
		selectedRooms.value.push(room);
	}
	
	// Немедленно обновляем draft фильтры
	props.store.setDraftFilters({ rooms: [...selectedRooms.value] });
	
	// Применяем фильтры с небольшой задержкой для лучшего UX
	nextTick(() => {
		props.store.commitFilters();
	});
};

const commitPriceFilter = () => {
	if (props.store.isFiltering) return;
	props.store.commitFilters();
};

const commitAreaFilter = () => {
	if (props.store.isFiltering) return;
	props.store.commitFilters();
};

const resetAllFilters = () => {
	if (props.store.isFiltering) return;
	
	selectedRooms.value = [];
	priceRange.value = [minPrice.value, maxPrice.value];
	areaRange.value = [minArea.value, maxArea.value];
	
	props.store.resetFilters();
};

// === Реактивное обновление локального состояния ===
let isUpdatingFromStore = false;

// Отслеживаем изменения ценового диапазона
watch(priceRange, (newValue) => {
	if (!isUpdatingFromStore && !props.store.isFiltering) {
		props.store.setDraftFilters({
			priceRange: [...newValue] as [number, number],
		});
	}
}, { deep: true });

// Отслеживаем изменения диапазона площади
watch(areaRange, (newValue) => {
	if (!isUpdatingFromStore && !props.store.isFiltering) {
		props.store.setDraftFilters({
			areaRange: [...newValue] as [number, number],
		});
	}
}, { deep: true });

// Синхронизируем с изменениями в сторе
watch(() => props.store.priceRange, (newValue) => {
	if (newValue[0] && newValue[1]) {
		isUpdatingFromStore = true;
		priceRange.value = [newValue[0], newValue[1]];
		nextTick(() => {
			isUpdatingFromStore = false;
		});
	}
});

watch(() => props.store.areaRange, (newValue) => {
	if (newValue[0] && newValue[1]) {
		isUpdatingFromStore = true;
		areaRange.value = [newValue[0], newValue[1]];
		nextTick(() => {
			isUpdatingFromStore = false;
		});
	}
});

// Синхронизируем выбранные комнаты
watch(() => props.store.draftFilters.rooms, (newValue) => {
	if (!isUpdatingFromStore) {
		selectedRooms.value = [...newValue];
	}
}, { deep: true });
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as *;

.filter-optimized {
	background: $background-primary;
	border-radius: $border-radius-lg;
	padding: $spacing-lg;
	position: relative;
	transition: opacity 0.2s ease;

	@media (max-width: $breakpoint-desktop) {
		margin-bottom: $spacing-lg;
	}

	&--filtering {
		pointer-events: none;
		opacity: 0.7;
	}

	&__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: $spacing-lg;
	}

	&__title {
		font-size: $font-size-lg;
		font-weight: $font-weight-bold;
		color: $text-primary;
		margin: 0;
		font-family: $font-family;
	}

	&__spinner {
		flex-shrink: 0;
	}

	&__counter {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: $spacing-sm $spacing-md;
		background: lighten($accent, 45%);
		border-radius: $border-radius-md;
		margin-bottom: $spacing-lg;
		border: 1px solid lighten($accent, 30%);

		&-text {
			font-size: $font-size-sm;
			color: $accent;
			font-weight: $font-weight-medium;
			font-family: $font-family;
		}

		&-reset {
			background: none;
			border: none;
			color: $accent;
			font-size: $font-size-xs;
			font-weight: $font-weight-medium;
			cursor: pointer;
			padding: $spacing-xs;
			border-radius: $border-radius-sm;
			font-family: $font-family;
			
			&:hover:not(:disabled) {
				background: lighten($accent, 35%);
			}

			&:disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}
		}
	}

	&__section {
		margin-bottom: $spacing-xl;

		&:last-of-type {
			margin-bottom: $spacing-lg;
		}
	}

	&__section-title {
		font-size: $font-size-base;
		font-weight: $font-weight-regular;
		color: $text-primary;
		margin: 0 0 $spacing-md 0;
		font-family: $font-family;
	}

	&__rooms {
		display: flex;
		gap: $spacing-sm;
		flex-wrap: wrap;
	}

	&__range-labels {
		display: flex;
		justify-content: space-between;
		margin-bottom: $spacing-sm;
	}

	&__range-label {
		font-size: $font-size-sm;
		color: $text-secondary;
		font-family: $font-family;
		
		&--min {
			color: $accent;
		}
		
		&--max {
			color: $accent;
		}
	}

	&__actions {
		margin-top: $spacing-lg;
		padding-top: $spacing-md;
		border-top: 1px solid $border-color;
	}

	&__reset {
		width: 100%;
	}
}

// Анимация для спиннера
.spinner-fade-enter-active,
.spinner-fade-leave-active {
	transition: opacity 0.2s ease;
}

.spinner-fade-enter-from,
.spinner-fade-leave-to {
	opacity: 0;
}

// Адаптивность
@include mobile {
	.filter-optimized {
		padding: $spacing-md;

		&__section {
			margin-bottom: $spacing-lg;
		}

		&__rooms {
			gap: $spacing-xs;
		}

		&__range-labels {
			font-size: $font-size-xs;
		}
	}
}

// Улучшения для доступности
@media (prefers-reduced-motion: reduce) {
	.filter-optimized {
		transition: none;
	}
	
	.spinner-fade-enter-active,
	.spinner-fade-leave-active {
		transition: none;
	}
}

// Стили для высококонтрастного режима
@media (prefers-contrast: high) {
	.filter-optimized {
		border: 2px solid $text-primary;
		
		&__counter {
			border-width: 2px;
		}
	}
}
</style>