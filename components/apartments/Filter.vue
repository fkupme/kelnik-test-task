<template>
	<aside class="filter" role="complementary" aria-label="Фильтры квартир">
		<!-- Заголовок и сброс фильтров -->
		<header class="filter__header">
			<h2 class="filter__main-title">Фильтры</h2>
			<button 
				v-if="apartmentsStore.activeFiltersCount > 0"
				class="filter__reset-all"
				@click="resetFilters"
				:aria-label="`Сбросить все фильтры (активно ${apartmentsStore.activeFiltersCount})`"
			>
				Сбросить ({{ apartmentsStore.activeFiltersCount }})
			</button>
		</header>

		<!-- Фильтр по комнатам -->
		<section class="filter__section" aria-labelledby="rooms-title">
			<h3 id="rooms-title" class="filter__title">Количество комнат</h3>
			<div class="filter__rooms-buttons" role="group" aria-labelledby="rooms-title">
				<UIControlsRoomButton
					v-for="room in allPossibleRooms"
					:key="room"
					:room="room"
					:active="selectedRooms.includes(room)"
					:disabled="!availableRooms.includes(room)"
					@click="toggleRoom"
					:aria-pressed="selectedRooms.includes(room)"
					:aria-describedby="`room-${room}-desc`"
				/>
			</div>
			<!-- Скрытые описания для screen readers -->
			<div class="sr-only">
				<div v-for="room in allPossibleRooms" :key="room" :id="`room-${room}-desc`">
					{{ room }}-комнатная квартира
				</div>
			</div>
		</section>

		<!-- Фильтр по цене -->
		<section class="filter__section" aria-labelledby="price-title">
			<h3 id="price-title" class="filter__title">Стоимость квартиры, ₽</h3>
			<div class="filter__range" aria-live="polite">
				<span class="filter__range-label filter__range-label--min" aria-label="Минимальная цена">
					от {{ formatPrice(priceRange[0]) }}
				</span>
				<span class="filter__range-label filter__range-label--max" aria-label="Максимальная цена">
					до {{ formatPrice(priceRange[1]) }}
				</span>
			</div>
			<UIControlsRangeSlider
				v-model="priceRange"
				:min="minPrice"
				:max="maxPrice"
				:step="priceStep"
				@commit="commitPrice"
				aria-labelledby="price-title"
				aria-describedby="price-range-desc"
			/>
			<div id="price-range-desc" class="sr-only">
				Диапазон цен от {{ formatPrice(minPrice) }} до {{ formatPrice(maxPrice) }} рублей
			</div>
		</section>

		<!-- Фильтр по площади -->
		<section class="filter__section" aria-labelledby="area-title">
			<h3 id="area-title" class="filter__title">Площадь, м²</h3>
			<div class="filter__range" aria-live="polite">
				<span class="filter__range-label filter__range-label--min" aria-label="Минимальная площадь">
					от {{ areaRange[0] }}
				</span>
				<span class="filter__range-label filter__range-label--max" aria-label="Максимальная площадь">
					до {{ areaRange[1] }}
				</span>
			</div>
			<UIControlsRangeSlider
				v-model="areaRange"
				:min="minArea"
				:max="maxArea"
				:step="areaStep"
				@commit="commitArea"
				aria-labelledby="area-title"
				aria-describedby="area-range-desc"
			/>
			<div id="area-range-desc" class="sr-only">
				Диапазон площади от {{ minArea }} до {{ maxArea }} квадратных метров
			</div>
		</section>

		<!-- Главная кнопка сброса -->
		<footer class="filter__footer">
			<button 
				class="filter__reset" 
				@click="resetFilters"
				:disabled="apartmentsStore.activeFiltersCount === 0"
				:aria-label="apartmentsStore.activeFiltersCount > 0 ? 'Сбросить все фильтры' : 'Нет активных фильтров для сброса'"
			>
				Сбросить фильтры
			</button>
		</footer>
	</aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useApartmentsStore } from '../../stores/apartments';

const apartmentsStore = useApartmentsStore();

const availableRooms = computed(() => {
	if (apartmentsStore.apartments.length === 0) return [1, 2, 3, 4];
	const rooms = [...new Set(apartmentsStore.apartments.map(apt => apt.rooms))];
	return rooms.sort((a: number, b: number) => a - b);
});

const allPossibleRooms = computed(() => {
	if (apartmentsStore.apartments.length === 0) return [1, 2, 3, 4];
	const rooms = [...new Set(apartmentsStore.apartments.map(apt => apt.rooms))];
	return rooms.sort((a: number, b: number) => a - b);
});

const selectedRooms = ref<number[]>([...apartmentsStore.draftFilters.rooms]);
const priceRange = ref<[number, number]>([
	apartmentsStore.draftFilters.priceRange[0] || apartmentsStore.priceRange[0] || 5500000,
	apartmentsStore.draftFilters.priceRange[1] || apartmentsStore.priceRange[1] || 18900000,
]);
const areaRange = ref<[number, number]>([
	apartmentsStore.draftFilters.areaRange[0] || apartmentsStore.areaRange[0] || 33,
	apartmentsStore.draftFilters.areaRange[1] || apartmentsStore.areaRange[1] || 123,
]);

const minPrice = computed(() => apartmentsStore.priceRange[0] || 5500000);
const maxPrice = computed(() => apartmentsStore.priceRange[1] || 18900000);
const minArea = computed(() => apartmentsStore.areaRange[0] || 33);
const maxArea = computed(() => apartmentsStore.areaRange[1] || 123);

const priceStep = computed(() => Math.max(1000, Math.round((maxPrice.value - minPrice.value) / 100)));
const areaStep = computed(() => Math.max(1, Math.round((maxArea.value - minArea.value) / 100)));

const formatPrice = (price: number): string => new Intl.NumberFormat('ru-RU').format(price);

const toggleRoom = (room: number) => {
	const index = selectedRooms.value.indexOf(room);
	if (index > -1) selectedRooms.value.splice(index, 1);
	else selectedRooms.value.push(room);
	apartmentsStore.setDraftFilters({ rooms: [...selectedRooms.value] });
};

const commitPrice = () => apartmentsStore.commitFilters();
const commitArea = () => apartmentsStore.commitFilters();

const resetFilters = () => {
	selectedRooms.value = [];
	priceRange.value = [minPrice.value, maxPrice.value];
	areaRange.value = [minArea.value, maxArea.value];
	apartmentsStore.resetFilters();
};

let isUpdatingFromStore = false;

watch(priceRange, () => {
	if (!isUpdatingFromStore) {
		apartmentsStore.setDraftFilters({
			priceRange: [...priceRange.value] as [number, number],
		});
	}
}, { deep: true });

watch(areaRange, () => {
	if (!isUpdatingFromStore) {
		apartmentsStore.setDraftFilters({
			areaRange: [...areaRange.value] as [number, number],
		});
	}
}, { deep: true });

watch(() => apartmentsStore.priceRange, newPriceRange => {
	if (newPriceRange[0] && newPriceRange[1]) {
		isUpdatingFromStore = true;
		priceRange.value = [newPriceRange[0], newPriceRange[1]];
		isUpdatingFromStore = false;
	}
});

watch(() => apartmentsStore.areaRange, newAreaRange => {
	if (newAreaRange[0] && newAreaRange[1]) {
		isUpdatingFromStore = true;
		areaRange.value = [newAreaRange[0], newAreaRange[1]];
		isUpdatingFromStore = false;
	}
});
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as *;

.filter {
	background: $background-primary;
	border-radius: $border-radius-lg;
	padding: $spacing-lg;

	@media (max-width: $breakpoint-desktop) {
		margin-bottom: $spacing-lg;
	}

	// Header with main title and reset
	&__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: $spacing-lg;
		padding-bottom: $spacing-md;
		border-bottom: 1px solid $border-color;
	}

	&__main-title {
		font-size: $font-size-lg;
		font-weight: $font-weight-bold;
		color: $text-primary;
		margin: 0;
		font-family: $font-family;
	}

	&__reset-all {
		background: none;
		border: 1px solid $accent;
		color: $accent;
		padding: calc($spacing-xs / 2) $spacing-sm;
		border-radius: $border-radius-sm;
		font-size: $font-size-xs;
		font-weight: $font-weight-medium;
		cursor: pointer;
		transition: all $transition-fast;
		font-family: $font-family;

		&:hover {
			background: $accent;
			color: $surface;
		}

		&:focus {
			outline: 2px solid $accent;
			outline-offset: 2px;
		}
	}

	// Section containing filter groups
	&__section {
		margin-bottom: $spacing-xl;

		&:last-of-type {
			margin-bottom: $spacing-lg;
		}
	}

	&__rooms-buttons {
		display: flex;
		gap: $spacing-sm;
		flex-wrap: wrap;
	}

	&__title {
		font-size: $font-size-base;
		font-weight: $font-weight-medium;
		color: $text-primary;
		margin: 0 0 $spacing-md 0;
		font-family: $font-family;
	}

	&__range {
		display: flex;
		justify-content: space-between;
		margin-bottom: $spacing-sm;
	}

	&__range-label {
		font-size: $font-size-sm;
		color: $text-secondary;
		font-family: $font-family;
		font-weight: $font-weight-medium;

		&--min {
			color: $accent;
		}

		&--max {
			color: $accent;
		}
	}

	// Footer with main reset button
	&__footer {
		padding-top: $spacing-md;
		border-top: 1px solid $border-color;
	}

	&__reset {
		width: 100%;
		background: transparent;
		border: 1px solid $border-color;
		color: $text-secondary;
		padding: $spacing-sm $spacing-md;
		border-radius: $border-radius-md;
		font-size: $font-size-sm;
		font-weight: $font-weight-medium;
		cursor: pointer;
		transition: all $transition-fast;
		font-family: $font-family;

		&:hover:not(:disabled) {
			border-color: $accent;
			color: $accent;
		}

		&:focus {
			outline: 2px solid $accent;
			outline-offset: 2px;
		}

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
}

// Screen reader only content
.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
}

// High contrast mode support
@media (prefers-contrast: high) {
	.filter {
		border: 2px solid $text-primary;

		&__header {
			border-bottom-width: 2px;
		}

		&__footer {
			border-top-width: 2px;
		}

		&__reset-all,
		&__reset {
			border-width: 2px;
		}
	}
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
	.filter {
		&__reset-all,
		&__reset {
			transition: none;
		}
	}
}

// Mobile adaptations
@include mobile {
	.filter {
		padding: $spacing-md;

		&__header {
			flex-direction: column;
			align-items: stretch;
			gap: $spacing-sm;
		}

		&__reset-all {
			align-self: flex-end;
		}

		&__rooms-buttons {
			gap: $spacing-xs;
		}

		&__section {
			margin-bottom: $spacing-lg;
		}
	}
}
</style>