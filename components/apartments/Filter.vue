<template>
	<aside class="filter" :class="{ 'filter--filtering': store.isFiltering }">
		<div class="filter__header">
			<h2 class="filter__title">Фильтры</h2>
		</div>

		<section class="filter__section">
			<h3 class="filter__section-title">Количество комнат</h3>
			<div class="filter__rooms">
				<UIControlsRoomButton
					v-for="room in allPossibleRooms"
					:key="room"
					:room="room"
					:active="selectedRooms.includes(room)"
					:disabled="store.isFiltering"
					@click="toggleRoom"
				/>
			</div>
		</section>

		<section class="filter__section">
			<h3 class="filter__section-title">Стоимость квартиры, ₽</h3>
			<div class="filter__range-labels">
				<span class="filter__range-label filter__range-label--min">
					<span class="from-to">от </span> {{ formatPrice(priceRange[0]) }}
				</span>
				<span class="filter__range-label filter__range-label--max">
					<span class="from-to">до </span> {{ formatPrice(priceRange[1]) }}
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

		<section class="filter__section">
			<h3 class="filter__section-title">Площадь, м²</h3>
			<div class="filter__range-labels">
				<span class="filter__range-label filter__range-label--min">
					<span class="from-to">от </span> {{ areaRange[0] }}
				</span>
				<span class="filter__range-label filter__range-label--max">
					<span class="from-to">до </span> {{ areaRange[1] }}
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

		<div class="filter__actions">
			<UIControlsButton
				@click="resetAllFilters"
				variant="outline"
				size="md"
				:disabled="store.isFiltering || store.activeFiltersCount === 0"
				class="filter__reset"
			>
				Сбросить фильтры
			</UIControlsButton>
		</div>
	</aside>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';

interface Props {
	store: any;
}

const props = defineProps<Props>();

const selectedRooms = ref<number[]>([...props.store.draftFilters.rooms]);
const priceRange = ref<[number, number]>([
	props.store.draftFilters.priceRange[0] ||
		props.store.priceRange[0] ||
		5500000,
	props.store.draftFilters.priceRange[1] ||
		props.store.priceRange[1] ||
		18900000,
]);
const areaRange = ref<[number, number]>([
	props.store.draftFilters.areaRange[0] || props.store.areaRange[0] || 33,
	props.store.draftFilters.areaRange[1] || props.store.areaRange[1] || 123,
]);

const allPossibleRooms = [1, 2, 3, 4];

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

const formatPrice = (price: number): string =>
	new Intl.NumberFormat('ru-RU').format(price);

const toggleRoom = async (room: number) => {
	if (props.store.isFiltering) return;

	const index = selectedRooms.value.indexOf(room);
	if (index > -1) {
		selectedRooms.value.splice(index, 1);
	} else {
		selectedRooms.value.push(room);
		await props.store.ensureRoomsLoaded([room]);
	}

	props.store.setDraftFilters({ rooms: [...selectedRooms.value] });

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

let isUpdatingFromStore = false;

watch(
	priceRange,
	newValue => {
		if (!isUpdatingFromStore && !props.store.isFiltering) {
			props.store.setDraftFilters({
				priceRange: [...newValue] as [number, number],
			});
		}
	},
	{ deep: true }
);

watch(
	areaRange,
	newValue => {
		if (!isUpdatingFromStore && !props.store.isFiltering) {
			props.store.setDraftFilters({
				areaRange: [...newValue] as [number, number],
			});
		}
	},
	{ deep: true }
);

watch(
	() => props.store.priceRange,
	newValue => {
		if (newValue[0] && newValue[1]) {
			isUpdatingFromStore = true;
			priceRange.value = [newValue[0], newValue[1]];
			nextTick(() => {
				isUpdatingFromStore = false;
			});
		}
	}
);

watch(
	() => props.store.areaRange,
	newValue => {
		if (newValue[0] && newValue[1]) {
			isUpdatingFromStore = true;
			areaRange.value = [newValue[0], newValue[1]];
			nextTick(() => {
				isUpdatingFromStore = false;
			});
		}
	}
);

watch(
	() => props.store.draftFilters.rooms,
	newValue => {
		if (!isUpdatingFromStore) {
			selectedRooms.value = [...newValue];
		}
	},
	{ deep: true }
);
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as *;

.filter {
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

	&__section {
		margin-bottom: $spacing-xl;

		&:last-of-type {
			margin-bottom: $spacing-lg;
		}
	}

	&__section-title {
		font-size: $font-size-sm;
		font-weight: $font-weight-regular;
		color: $text-primary;
		margin: 0 0 $spacing-md 0;
		font-family: $font-family;
	}

	&__rooms {
		display: flex;
		gap: $spacing-sm;
		flex-wrap: wrap;

		&__room-button {
			padding: $spacing-xs $spacing-sm;
			border: 1px solid $border-color;
			border-radius: $border-radius-sm;
			background: transparent;
			color: $text-primary;
			cursor: pointer;

			&:hover {
				background: darken($background-light, 5%);
			}
		}
	}

	&__range-labels {
		display: flex;
		justify-content: space-between;
		margin-bottom: $spacing-sm;
	}

	&__range-label {
		font-size: $font-size-base;
		color: $text-primary;
		font-family: $font-family;
    .from-to{
      color: $text-secondary;
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

.spinner-fade-enter-active,
.spinner-fade-leave-active {
	transition: opacity 0.2s ease;
}

.spinner-fade-enter-from,
.spinner-fade-leave-to {
	opacity: 0;
}

@include mobile {
	.filter {
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

@media (prefers-reduced-motion: reduce) {
	.filter {
		transition: none;
	}

	.spinner-fade-enter-active,
	.spinner-fade-leave-active {
		transition: none;
	}
}

@media (prefers-contrast: high) {
	.filter {
		border: 2px solid $text-primary;
	}
}
</style>
