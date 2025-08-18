import { defineStore } from 'pinia';
import type { Apartment, FilterState, PaginationState } from '~/types';

export const useApartmentsStore = defineStore('apartments', () => {
	const apartments = ref<Apartment[]>([]);
	const filteredApartments = ref<Apartment[]>([]);
	const displayedApartments = ref<Apartment[]>([]);
	const isLoading = ref(false);
	const error = ref<string | null>(null);

	const filter = ref<FilterState>({
		rooms: [],
		priceRange: [5500000, 18900000],
		areaRange: [33, 123],
	});

	const pagination = ref<PaginationState>({
		currentPage: 1,
		itemsPerPage: 5,
		totalItems: 0,
		hasMore: true,
	});

	const priceRange = computed(() => {
		if (apartments.value.length === 0) return [5500000, 18900000];
		const prices = apartments.value.map(apt => apt.price);
		return [Math.min(...prices), Math.max(...prices)];
	});

	const areaRange = computed(() => {
		if (apartments.value.length === 0) return [33, 123];
		const areas = apartments.value.map(apt => apt.area);
		return [Math.min(...areas), Math.max(...areas)];
	});

	const loadApartments = async () => {
		try {
			isLoading.value = true;
			error.value = null;

			await new Promise(resolve => setTimeout(resolve, 500));

			const response = await $fetch<{ apartments: Apartment[] }>(
				'/apartments.json'
			);
			apartments.value = response.apartments;

			applyFilters();
		} catch (err) {
			error.value = 'Ошибка загрузки данных';
			console.error('Error loading apartments:', err);
		} finally {
			isLoading.value = false;
		}
	};

	const applyFilters = async () => {
		try {
			isLoading.value = true;

			await new Promise(resolve => setTimeout(resolve, 300));

			filteredApartments.value = apartments.value.filter(apartment => {
				const roomsMatch =
					filter.value.rooms.length === 0 ||
					filter.value.rooms.includes(apartment.rooms);
				const priceMatch =
					apartment.price >= filter.value.priceRange[0] &&
					apartment.price <= filter.value.priceRange[1];
				const areaMatch =
					apartment.area >= filter.value.areaRange[0] &&
					apartment.area <= filter.value.areaRange[1];

				return roomsMatch && priceMatch && areaMatch;
			});

			pagination.value.totalItems = filteredApartments.value.length;
			pagination.value.currentPage = 1;
			updateDisplayedApartments();
		} finally {
			isLoading.value = false;
		}
	};

	const updateDisplayedApartments = () => {
		const startIndex = 0;
		const endIndex =
			pagination.value.currentPage * pagination.value.itemsPerPage;

		displayedApartments.value = filteredApartments.value.slice(
			startIndex,
			endIndex
		);
		pagination.value.hasMore = endIndex < filteredApartments.value.length;
	};

	const loadMore = async () => {
		if (!pagination.value.hasMore || isLoading.value) return;

		try {
			isLoading.value = true;

			await new Promise(resolve => setTimeout(resolve, 300));

			pagination.value.currentPage++;
			updateDisplayedApartments();
		} finally {
			isLoading.value = false;
		}
	};

	const updateFilter = (newFilter: Partial<FilterState>) => {
		filter.value = { ...filter.value, ...newFilter };
		applyFilters();
	};

	const resetFilters = () => {
		filter.value = {
			rooms: [],
			priceRange: priceRange.value as [number, number],
			areaRange: areaRange.value as [number, number],
		};
		applyFilters();
	};

	return {
		apartments: readonly(apartments),
		filteredApartments: readonly(filteredApartments),
		displayedApartments: readonly(displayedApartments),
		isLoading: readonly(isLoading),
		error: readonly(error),
		filter: readonly(filter),
		pagination: readonly(pagination),
		priceRange,
		areaRange,
		loadApartments,
		applyFilters,
		loadMore,
		updateFilter,
		resetFilters,
	};
});
