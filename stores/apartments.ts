import { defineStore } from 'pinia';
import type { Apartment, FilterState, PaginationState } from '~/types';

 
export const useApartmentsStore = defineStore('apartments', () => {
	// Референсные сущности (id -> объект). Обновляем in-place, не пересоздаём массив объектов
	const entities = reactive<Record<string, Apartment>>({});
	// Текущий порядок id для отображения
	const currentIds = ref<string[]>([]);
	// Устаревшее: прямой массив; оставляем для совместимости (computed)
	const apartments = computed<Apartment[]>(() =>
		currentIds.value.map(id => entities[id]).filter((x): x is Apartment => !!x)
	);

	const appliedFilters = reactive<FilterState>({
		rooms: [],
		priceRange: [5500000, 18900000],
		areaRange: [33, 123],
	});
	const draftFilters = reactive<FilterState>({
		rooms: [],
		priceRange: [5500000, 18900000],
		areaRange: [33, 123],
	});

	const sort = ref({
		field: '',
		direction: 'asc' as 'asc' | 'desc',
	});

	const pagination = ref<PaginationState>({
		currentPage: 0,
		itemsPerPage: 5,
		totalItems: 0,
		hasMore: true,
	});

	// Диапазоны приходят из API при полном reset
	const priceRange = ref<[number, number]>([5500000, 18900000]);
	const areaRange = ref<[number, number]>([33, 123]);

	const isLoading = ref(false);
	const isAppending = ref(false);
	const isFiltering = ref(false);
	const error = ref<string | null>(null);

	// Для UI
	const filteredApartments = computed(() => apartments.value);

	const querySignature = computed(
		() =>
			`r:${[...appliedFilters.rooms].sort().join(',')}|p:${
				appliedFilters.priceRange[0]
			}-${appliedFilters.priceRange[1]}|a:${appliedFilters.areaRange[0]}-${
				appliedFilters.areaRange[1]
			}|s:${sort.value.field}:${sort.value.direction}`
	);

	type CacheEntry = {
		pages: Map<number, Apartment[]>;
		total: number;
		priceRange?: [number, number];
		areaRange?: [number, number];
		complete: boolean;
	};
	const cache = reactive<Map<string, CacheEntry>>(new Map());

	const lastLoadedSignature = ref<string | null>(null);
	const lastLoadedTotal = ref<number>(0);

	const activeFiltersCount = computed(() => {
		let c = 0;
		if (appliedFilters.rooms.length) c++;
		if (
			appliedFilters.priceRange[0] !== priceRange.value[0] ||
			appliedFilters.priceRange[1] !== priceRange.value[1]
		)
			c++;
		if (
			appliedFilters.areaRange[0] !== areaRange.value[0] ||
			appliedFilters.areaRange[1] !== areaRange.value[1]
		)
			c++;
		return c;
	});

	// Upsert батч: возвращает массив id
	const upsertBatch = (batch: Apartment[]): string[] => {
		const ids: string[] = [];
		for (const apt of batch) {
			const id = String((apt as any).id);
			ids.push(id);
			if (entities[id]) {
				Object.assign(entities[id], apt);
			} else {
				entities[id] = apt;
			}
		}
		return ids;
	};

	const syncResetList = (allBatches: Apartment[][]) => {
		const flat = allBatches.flat();
		const ids = upsertBatch(flat);
		// Формируем новый порядок, но сохраняем стабильность для уже существующих id (Vue diff по key)
		currentIds.value = ids;
	};

	const updateCacheAndList = (
		batch: Apartment[],
		isReset: boolean,
		pageIndex: number
	) => {
		const sig = querySignature.value;
		let entry = cache.get(sig);
		if (!entry) {
			entry = { pages: new Map(), total: 0, complete: false };
			cache.set(sig, entry);
		}
		if (isReset) entry.pages = new Map();
		entry.pages.set(pageIndex, batch);
		if (isReset) {
			const pagesSorted = [...entry.pages.entries()]
				.sort((a, b) => a[0] - b[0])
				.map(p => p[1]);
			syncResetList(pagesSorted);
		} else {
			const newIds = upsertBatch(batch);
			// Добавляем только те id, которых ещё нет в currentIds
			const existingSet = new Set(currentIds.value);
			let appended = false;
			for (const id of newIds) {
				if (!existingSet.has(id)) {
					currentIds.value.push(id);
					appended = true;
				}
			}
			if (appended) {
				// currentIds.value уже обновлён in-place; Vue увидит push => отрендерит только новые карточки
			}
		}
	};

	const buildQuery = (offset: number, limit: number) => {
		const params = new URLSearchParams();
		params.set('offset', String(offset));
		params.set('limit', String(limit));
		if (sort.value.field) {
			params.set('sortField', sort.value.field);
			params.set('sortDir', sort.value.direction);
		}
		if (appliedFilters.rooms.length)
			params.set('rooms', appliedFilters.rooms.join(','));
		params.set('priceMin', String(appliedFilters.priceRange[0]));
		params.set('priceMax', String(appliedFilters.priceRange[1]));
		params.set('areaMin', String(appliedFilters.areaRange[0]));
		params.set('areaMax', String(appliedFilters.areaRange[1]));
		return `/api/apartments?${params.toString()}`;
	};

	const loadApartments = async (reset = true) => {
		console.debug('[apartments] loadApartments start', {
			reset,
			currentPage: pagination.value.currentPage,
			hasMore: pagination.value.hasMore,
			sig: querySignature.value,
		});
		const sig = querySignature.value;
		const cacheEntry = cache.get(sig);
		if (reset && cacheEntry && cacheEntry.complete) {
			console.debug('[apartments] use full cache for signature (no fetch)');
			const pagesSorted = [...cacheEntry.pages.entries()]
				.sort((a, b) => a[0] - b[0])
				.map(p => p[1]);
			syncResetList(pagesSorted);
			pagination.value.totalItems = cacheEntry.total;
			pagination.value.hasMore = false;
			return;
		}
		try {
			if (reset) {
				isLoading.value = true;
				error.value = null;
				pagination.value.currentPage = 0;
				pagination.value.hasMore = true;
			}
			const offset =
				pagination.value.currentPage * pagination.value.itemsPerPage;
			const pageIndex = pagination.value.currentPage;
			if (!reset && cacheEntry && cacheEntry.pages.has(pageIndex)) {
				console.debug('[apartments] page from cache', { pageIndex });
				const batchCached = cacheEntry.pages.get(pageIndex)!;
				updateCacheAndList(batchCached, false, pageIndex);
				pagination.value.currentPage++;
				pagination.value.hasMore = currentIds.value.length < cacheEntry.total;
				return;
			}
			const url = buildQuery(offset, pagination.value.itemsPerPage);
			console.debug('[apartments] fetch($fetch)', { url });
			const response: any = await $fetch(url);
			console.debug('[apartments] response meta', {
				total: response?.total,
				batch: Array.isArray(response?.apartments)
					? response.apartments.length
					: 'NA',
			});
			const batch: Apartment[] = Array.isArray(response?.apartments)
				? response.apartments
				: [];
			if (reset) {
				pagination.value.totalItems = Number(response?.total) || batch.length;
				if (
					Number.isFinite(response?.priceMin) &&
					Number.isFinite(response?.priceMax) &&
					response.priceMin <= response.priceMax
				)
					priceRange.value = [response.priceMin, response.priceMax];
				if (
					Number.isFinite(response?.areaMin) &&
					Number.isFinite(response?.areaMax) &&
					response.areaMin <= response.areaMax
				)
					areaRange.value = [response.areaMin, response.areaMax];
				updateCacheAndList(batch, true, pageIndex);
			} else {
				updateCacheAndList(batch, false, pageIndex);
			}
			pagination.value.currentPage++;
			const total = Number(response?.total) || currentIds.value.length;
			pagination.value.hasMore = currentIds.value.length < total;
			const entry = cache.get(querySignature.value)!;
			entry.total = total;
			entry.priceRange = priceRange.value;
			entry.areaRange = areaRange.value;
			entry.complete = !pagination.value.hasMore;
			console.debug('[apartments] pagination update', {
				currentPage: pagination.value.currentPage,
				loaded: apartments.value.length,
				total: pagination.value.totalItems,
				hasMore: pagination.value.hasMore,
			});
			if (!pagination.value.hasMore) {
				lastLoadedSignature.value = querySignature.value;
				lastLoadedTotal.value = currentIds.value.length;
			}
		} catch (e) {
			error.value = 'Ошибка загрузки данных';
			console.error('[apartments] load error', e);
		} finally {
			isLoading.value = false;
			isAppending.value = false;
			isFiltering.value = false;
		}
	};

	const loadMore = async () => {
		if (!pagination.value.hasMore || isAppending.value || isLoading.value)
			return;
		isAppending.value = true;
		try {
			await loadApartments(false);
		} finally {
			isAppending.value = false;
		}
	};

	// --- Filters API ---
	const assignArr = (target: number[], src: number[]): boolean => {
		let changed = target.length !== src.length;
		if (changed) {
			target.length = 0;
			for (const v of src) target.push(v);
			return true;
		}
		for (let i = 0; i < src.length; i++)
			if (target[i] !== src[i]) {
				changed = true;
				break;
			}
		if (changed) {
			target.length = 0;
			for (const v of src) target.push(v);
		}
		return changed;
	};

	const setDraftFilters = (partial: Partial<FilterState>) => {
		if (partial.rooms) assignArr(draftFilters.rooms, partial.rooms);
		if (partial.priceRange) {
			if (draftFilters.priceRange[0] !== partial.priceRange[0])
				draftFilters.priceRange[0] = partial.priceRange[0];
			if (draftFilters.priceRange[1] !== partial.priceRange[1])
				draftFilters.priceRange[1] = partial.priceRange[1];
		}
		if (partial.areaRange) {
			if (draftFilters.areaRange[0] !== partial.areaRange[0])
				draftFilters.areaRange[0] = partial.areaRange[0];
			if (draftFilters.areaRange[1] !== partial.areaRange[1])
				draftFilters.areaRange[1] = partial.areaRange[1];
		}
	};
	const commitFilters = () => {
		let changed = false;
		changed = assignArr(appliedFilters.rooms, draftFilters.rooms) || changed;
		for (let i = 0; i < 2; i++) {
			const dv = draftFilters.priceRange[i] as number;
			if (appliedFilters.priceRange[i] !== dv) {
				appliedFilters.priceRange[i] = dv as number;
				changed = true;
			}
		}
		for (let i = 0; i < 2; i++) {
			const dv = draftFilters.areaRange[i] as number;
			if (appliedFilters.areaRange[i] !== dv) {
				appliedFilters.areaRange[i] = dv as number;
				changed = true;
			}
		}
		if (!changed) return; // ничего не поменялось – не запрашиваем
		isFiltering.value = true;
		loadApartments(true);
	};
	const resetFilters = () => {
		assignArr(draftFilters.rooms, []);
		draftFilters.priceRange[0] = priceRange.value[0];
		draftFilters.priceRange[1] = priceRange.value[1];
		draftFilters.areaRange[0] = areaRange.value[0];
		draftFilters.areaRange[1] = areaRange.value[1];
		commitFilters();
	};

	const updateSort = (field: string, direction: 'asc' | 'desc') => {
		sort.value = { field, direction };
		loadApartments(true);
	};

	// Инициализация (вызвать из компонента layout/page)
	const initialized = ref(false);
	const init = async () => {
		if (initialized.value) return;
		initialized.value = true;
		await loadApartments(true);
	};

	return {
		apartments: readonly(apartments),
		filteredApartments: readonly(filteredApartments),
		isLoading: readonly(isLoading),
		isAppending: readonly(isAppending),
		isFiltering: readonly(isFiltering),
		error: readonly(error),
		draftFilters,
		appliedFilters,
		sort: readonly(sort),
		pagination: readonly(pagination),
		priceRange,
		areaRange,
		activeFiltersCount,
		// methods
		init,
		loadApartments,
		loadMore,
		setDraftFilters,
		commitFilters,
		updateSort,
		resetFilters,
	};
});
