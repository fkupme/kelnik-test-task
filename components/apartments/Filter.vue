<template>
	<aside class="filter">
		<div class="filter__rooms">
			<div class="filter__rooms-buttons">
				<UIControlsRoomButton
					v-for="room in allPossibleRooms"
					:key="room"
					:room="room"
					:active="selectedRooms.includes(room)"
					:disabled="!availableRooms.includes(room)"
					@click="toggleRoom"
				/>
			</div>
		</div>

		<div class="filter__section">
			<h3 class="filter__title">Стоимость квартиры, ₽</h3>
			<div class="filter__range">
				<span class="filter__range-label"
					>от {{ formatPrice(priceRange[0]) }}</span
				>
				<span class="filter__range-label"
					>до {{ formatPrice(priceRange[1]) }}</span
				>
			</div>
			<UIControlsRangeSlider
				v-model="priceRange"
				:min="minPrice"
				:max="maxPrice"
				:step="priceStep"
				@commit="commitPrice"
			/>
		</div>

		<div class="filter__section">
			<h3 class="filter__title">Площадь, м²</h3>
			<div class="filter__range">
				<span class="filter__range-label">от {{ areaRange[0] }}</span>
				<span class="filter__range-label">до {{ areaRange[1] }}</span>
			</div>
			<UIControlsRangeSlider
				v-model="areaRange"
				:min="minArea"
				:max="maxArea"
				:step="areaStep"
				@commit="commitArea"
			/>
		</div>

		<button class="filter__reset" @click="resetFilters">
			Сбросить параметры
		</button>
	</aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useApartmentsStore } from '../../stores/apartments';

const apartmentsStore = useApartmentsStore();

const allPossibleRooms = computed(() => [1, 2, 3, 4]);

const availableRooms = computed(() => {
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
@import '~/assets/scss/variables';

.filter {
	background: $background-primary;
	border-radius: $border-radius-lg;
	padding: $spacing-lg;

	@media (max-width: $breakpoint-desktop) {
		margin-bottom: $spacing-lg;
	}

	&__rooms {
		margin-bottom: $spacing-xxl;
	}

	&__rooms-buttons {
		display: flex;
		gap: $spacing-sm;
	}

	&__section {
		margin-bottom: $spacing-xxl;

		&:last-child {
			margin-bottom: 0;
		}
	}

	&__title {
		font-size: $font-size-base;
		font-weight: $font-weight-regular;
		color: $text-primary;
		margin-bottom: $spacing-md;
		font-family: $font-family;
	}

	&__range {
		display: flex;
		justify-content: space-between;
		margin-bottom: $spacing-md;
	}

	&__range-label {
		font-size: $font-size-sm;
		color: $text-secondary;
		font-family: $font-family;
	}

	&__reset {
		width: 100%;
		padding: $spacing-sm;
		background: transparent;
		border: none;
		color: $text-secondary;
		font-family: $font-family;
		font-size: $font-size-sm;
		cursor: pointer;
		text-decoration: underline;
		transition: $transition-fast;

		&:hover {
			color: $text-primary;
		}

		&:focus {
			outline: 2px solid $accent;
			outline-offset: 2px;
		}
	}
}
</style>
