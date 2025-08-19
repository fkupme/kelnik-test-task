import { defineStore } from 'pinia';
import { computed, nextTick, reactive, readonly, ref } from 'vue';
import type { Apartment, FilterState, PaginationState } from '~/types';

interface ApartmentHash {
  id: string;
  hash: string;
  apartment: Apartment;
}

interface ApartmentStorageState {
  hashMap: Map<string, ApartmentHash>;
  rawData: Apartment[]; 
  filteredIds: Set<string>; 
  lastFilterHash: string;
}

export const useApartmentsStore = defineStore(
  'apartments',
  () => {
    const storageState = reactive<ApartmentStorageState>({
      hashMap: new Map(),
      rawData: [],
      filteredIds: new Set(),
      lastFilterHash: '',
    });

    const fullyLoadedRooms = reactive<Set<number>>(new Set());

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

    const priceRange = ref<[number, number]>([5500000, 18900000]);
    const areaRange = ref<[number, number]>([33, 123]);

    const isLoading = ref(false);
    const isAppending = ref(false);
    const isFiltering = ref(false);
    const error = ref<string | null>(null);
    const initialized = ref(false);

    const toBase64 = (str: string): string => {
      try {
        return btoa(str); 
      } catch {
        if (typeof window === 'undefined') {
          return Buffer.from(str, 'utf-8').toString('base64');
        }
        const utf8 = encodeURIComponent(str).replace(
          /%([0-9A-F]{2})/g,
          (_, p1) => String.fromCharCode(parseInt(p1, 16))
        );
        return btoa(utf8);
      }
    };
    const createApartmentHash = (apartment: Apartment): string => {
      const data = `${apartment.id}|${apartment.name}|${apartment.area}|${apartment.floor}|${apartment.price}|${apartment.rooms}`;
    };

    const createFilterHash = (
      filters: FilterState,
      sortField: string,
      sortDirection: string
    ): string => {
      const roomsStr = [...filters.rooms].sort().join(',');
      const data = `r:${roomsStr}|p:${filters.priceRange[0]}-${filters.priceRange[1]}|a:${filters.areaRange[0]}-${filters.areaRange[1]}|s:${sortField}:${sortDirection}`;
      return toBase64(data).replace(/[+/=]/g, '');
    };

    const upsertApartments = (
      apartments: Apartment[],
      purgeMissing = false
    ): boolean => {
      let hasChanges = false;
      const currentIds = new Set(storageState.hashMap.keys());
      const newIds = new Set<string>();

      for (const apartment of apartments) {
        const id = String(apartment.id);
        const hash = createApartmentHash(apartment);
        newIds.add(id);

        const existing = storageState.hashMap.get(id);

        if (!existing || existing.hash !== hash) {
          storageState.hashMap.set(id, {
            id,
            hash,
            apartment: { ...apartment },
          });
          hasChanges = true;
        }
      }

      if (purgeMissing && apartments.length > 0) {
        for (const id of currentIds) {
          if (!newIds.has(id)) {
            storageState.hashMap.delete(id);
            hasChanges = true;
          }
        }
      }

      return hasChanges;
    };

    const matchesFilters = (
      apartment: Apartment,
      filters: FilterState
    ): boolean => {
      if (filters.rooms.length && !filters.rooms.includes(apartment.rooms))
        return false;
      if (
        apartment.price < filters.priceRange[0] ||
        apartment.price > filters.priceRange[1]
      )
        return false;
      if (
        apartment.area < filters.areaRange[0] ||
        apartment.area > filters.areaRange[1]
      )
        return false;
      return true;
    };

    const applyFiltersAndSort = (): string[] => {
      const filterHash = createFilterHash(
        appliedFilters,
        sort.value.field,
        sort.value.direction
      );

      if (
        filterHash === storageState.lastFilterHash &&
        storageState.filteredIds.size > 0
      ) {
        return Array.from(storageState.filteredIds);
      }

      const filtered: { id: string; apartment: Apartment }[] = [];
      for (const [id, apartmentHash] of storageState.hashMap) {
        if (matchesFilters(apartmentHash.apartment, appliedFilters)) {
          filtered.push({ id, apartment: apartmentHash.apartment });
        }
      }

      if (sort.value.field) {
        const field = sort.value.field as keyof Apartment;
        const direction = sort.value.direction === 'asc' ? 1 : -1;

        filtered.sort((a, b) => {
          const aVal = a.apartment[field];
          const bVal = b.apartment[field];
          if (aVal === bVal) return 0;
          return aVal > bVal ? direction : -direction;
        });
      }

      const resultIds = filtered.map(item => item.id);
      storageState.filteredIds = new Set(resultIds);
      storageState.lastFilterHash = filterHash;

      return resultIds;
    };

    const allApartments = computed<Apartment[]>(() => {
      return Array.from(storageState.hashMap.values()).map(
        item => item.apartment
      );
    });

    const visibleApartments = computed<Apartment[]>(() => {
      const filteredIds = applyFiltersAndSort();
      return filteredIds
        .map(id => storageState.hashMap.get(id)?.apartment)
        .filter((apartment): apartment is Apartment => !!apartment);
    });

    const activeFiltersCount = computed(() => {
      let count = 0;
      if (appliedFilters.rooms.length) count++;
      if (
        appliedFilters.priceRange[0] !== priceRange.value[0] ||
        appliedFilters.priceRange[1] !== priceRange.value[1]
      )
        count++;
      if (
        appliedFilters.areaRange[0] !== areaRange.value[0] ||
        appliedFilters.areaRange[1] !== areaRange.value[1]
      )
        count++;
      return count;
    });

    const loadApartments = async (reset = true) => {
      try {
        if (reset) {
          isLoading.value = true;
          error.value = null;
          pagination.value.currentPage = 0;
          pagination.value.hasMore = true;
        } else {
          isAppending.value = true;
        }

        const offset =
          pagination.value.currentPage * pagination.value.itemsPerPage;
        const params = new URLSearchParams({
          offset: String(offset),
          limit: String(pagination.value.itemsPerPage),
        });

        if (sort.value.field) {
          params.set('sortField', sort.value.field);
          params.set('sortDir', sort.value.direction);
        }

        const response: any = await $fetch(
          `/api/apartments?${params.toString()}`
        );
        const apartments: Apartment[] = Array.isArray(response?.apartments)
          ? response.apartments
          : [];

        if (reset) {
          storageState.hashMap.clear();
          storageState.filteredIds.clear();
          storageState.lastFilterHash = '';
        }

        const hasChanges = upsertApartments(apartments, reset);

        if (hasChanges || reset) {
          storageState.filteredIds.clear();
          storageState.lastFilterHash = '';
        }

        if (reset) {
          pagination.value.totalItems =
            Number(response?.total) || apartments.length;

          if (
            Number.isFinite(response?.priceMin) &&
            Number.isFinite(response?.priceMax)
          ) {
            priceRange.value = [response.priceMin, response.priceMax];
          }

          if (
            Number.isFinite(response?.areaMin) &&
            Number.isFinite(response?.areaMax)
          ) {
            areaRange.value = [response.areaMin, response.areaMax];
          }
        }

        pagination.value.currentPage++;
        pagination.value.hasMore =
          pagination.value.currentPage * pagination.value.itemsPerPage <
          (Number(response?.total) || apartments.length);
      } catch (e) {
        error.value = 'Ошибка загрузки данных';
        console.error('Load apartments error:', e);
      } finally {
        isLoading.value = false;
        isAppending.value = false;
        isFiltering.value = false;
      }
    };

    const loadMore = async () => {
      if (!pagination.value.hasMore || isAppending.value || isLoading.value)
        return;
      await loadApartments(false);
    };

    const loadRoom = async (room: number) => {
      if (fullyLoadedRooms.has(room)) return;
      try {
        let offset = 0;
        const limit = 50;
        let total = Infinity;
        while (offset < total) {
          const params = new URLSearchParams({
            offset: String(offset),
            limit: String(limit),
            rooms: String(room),
          });
          if (sort.value.field) {
            params.set('sortField', sort.value.field);
            params.set('sortDir', sort.value.direction);
          }
          const resp: any = await $fetch(
            `/api/apartments?${params.toString()}`
          );
          const batch: Apartment[] = Array.isArray(resp?.apartments)
            ? resp.apartments
            : [];
          if (!batch.length) break;
          upsertApartments(batch, false);
          storageState.filteredIds.clear();
          storageState.lastFilterHash = '';
          total = Number(resp?.total) || offset + batch.length;
          offset += batch.length;
          if (batch.length < limit) break;
        }
        fullyLoadedRooms.add(room);
      } catch (e) {
        console.warn('loadRoom failed', room, e);
      }
    };

    const ensureRoomsLoaded = async (rooms: number[]) => {
      for (const r of rooms) if (typeof r === 'number') await loadRoom(r);
    };

    const assignArray = (target: number[], source: number[]): boolean => {
      if (target.length !== source.length) {
        target.splice(0, target.length, ...source);
        return true;
      }

      let changed = false;
      for (let i = 0; i < source.length; i++) {
        if (target[i] !== source[i]) {
          changed = true;
          break;
        }
      }

      if (changed) {
        target.splice(0, target.length, ...source);
      }

      return changed;
    };

    const setDraftFilters = (partial: Partial<FilterState>) => {
      if (partial.rooms) {
        assignArray(draftFilters.rooms, partial.rooms);
      }
      if (partial.priceRange) {
        draftFilters.priceRange[0] = partial.priceRange[0];
        draftFilters.priceRange[1] = partial.priceRange[1];
      }
      if (partial.areaRange) {
        draftFilters.areaRange[0] = partial.areaRange[0];
        draftFilters.areaRange[1] = partial.areaRange[1];
      }
    };

    const commitFilters = () => {
      let changed = false;

      changed =
        assignArray(appliedFilters.rooms, draftFilters.rooms) || changed;

      if (appliedFilters.priceRange[0] !== draftFilters.priceRange[0]) {
        appliedFilters.priceRange[0] = draftFilters.priceRange[0];
        changed = true;
      }
      if (appliedFilters.priceRange[1] !== draftFilters.priceRange[1]) {
        appliedFilters.priceRange[1] = draftFilters.priceRange[1];
        changed = true;
      }

      if (appliedFilters.areaRange[0] !== draftFilters.areaRange[0]) {
        appliedFilters.areaRange[0] = draftFilters.areaRange[0];
        changed = true;
      }
      if (appliedFilters.areaRange[1] !== draftFilters.areaRange[1]) {
        appliedFilters.areaRange[1] = draftFilters.areaRange[1];
        changed = true;
      }

      if (changed) {
        isFiltering.value = true;
        storageState.filteredIds.clear();
        storageState.lastFilterHash = '';
        saveFiltersToLocalStorage();

        nextTick(() => {
          isFiltering.value = false;
        });
      }
    };

    const resetFilters = () => {
      assignArray(draftFilters.rooms, []);
      draftFilters.priceRange[0] = priceRange.value[0];
      draftFilters.priceRange[1] = priceRange.value[1];
      draftFilters.areaRange[0] = areaRange.value[0];
      draftFilters.areaRange[1] = areaRange.value[1];
      commitFilters();
    };

    const updateSort = (field: string, direction: 'asc' | 'desc') => {
      sort.value = { field, direction };
      storageState.filteredIds.clear();
      storageState.lastFilterHash = '';
    };

    const STORAGE_KEY = 'apartments-filters';

    const saveFiltersToLocalStorage = () => {
      if (process.client) {
        try {
          const data = {
            rooms: appliedFilters.rooms,
            priceRange: appliedFilters.priceRange,
            areaRange: appliedFilters.areaRange,
            sort: sort.value,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
          console.warn('Failed to save filters to localStorage:', e);
        }
      }
    };

    const loadFiltersFromLocalStorage = () => {
      if (process.client) {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const data = JSON.parse(saved);

            if (data.rooms && Array.isArray(data.rooms)) {
              assignArray(appliedFilters.rooms, data.rooms);
              assignArray(draftFilters.rooms, data.rooms);
            }

            if (data.priceRange && Array.isArray(data.priceRange)) {
              appliedFilters.priceRange[0] = data.priceRange[0];
              appliedFilters.priceRange[1] = data.priceRange[1];
              draftFilters.priceRange[0] = data.priceRange[0];
              draftFilters.priceRange[1] = data.priceRange[1];
            }

            if (data.areaRange && Array.isArray(data.areaRange)) {
              appliedFilters.areaRange[0] = data.areaRange[0];
              appliedFilters.areaRange[1] = data.areaRange[1];
              draftFilters.areaRange[0] = data.areaRange[0];
              draftFilters.areaRange[1] = data.areaRange[1];
            }

            if (data.sort && typeof data.sort === 'object') {
              sort.value = { ...data.sort };
            }
          }
        } catch (e) {
          console.warn('Failed to load filters from localStorage:', e);
        }
      }
    };

    const init = async () => {
      if (initialized.value) return;
      initialized.value = true;

      loadFiltersFromLocalStorage();

      await loadApartments(true);
    };

    return {
      apartments: readonly(allApartments),
      visibleApartments: readonly(visibleApartments),

      isLoading: readonly(isLoading),
      isAppending: readonly(isAppending),
      isFiltering: readonly(isFiltering),
      error: readonly(error),

      draftFilters,
      appliedFilters: readonly(appliedFilters),
      activeFiltersCount,

      sort: readonly(sort),

      pagination: readonly(pagination),

      priceRange: readonly(priceRange),
      areaRange: readonly(areaRange),

      init,
      loadApartments,
      loadMore,
      setDraftFilters,
      commitFilters,
      resetFilters,
      updateSort,
      loadRoom,
      ensureRoomsLoaded,
    };
  }
);
