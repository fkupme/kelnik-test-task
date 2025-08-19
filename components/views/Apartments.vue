<template>
	<div class="apartments-view">
		<header class="apartments-view__header">
			<h1 class="apartments-view__title apartments-view__title--top">
				Квартиры
			</h1>

			<!-- Mobile Filter Button -->
			<UIMobileFilterButton
				class="apartments-view__mobile-filter"
				:active-filters-count="apartmentsStore.activeFiltersCount"
				@click="openMobileFilter"
			/>
		</header>

		<div class="apartments-view__content">
			<ApartmentFilter class="apartments-view__filter" />

			<section class="apartments-view__list">
				<h1 class="apartments-view__title apartments-view__title--section">
					Квартиры
				</h1>
				<!-- Sort Headers -->
				<UISortHeaders
					class="apartments-view__sort-headers"
					:headers="sortHeaders"
					:sort-field="apartmentsStore.sort.field"
					:sort-direction="apartmentsStore.sort.direction"
					@sort-change="apartmentsStore.updateSort"
				/>

				<!-- Loading State -->
				<div v-if="apartmentsStore.isLoading" class="apartments-view__loading">
					<UIFeedbackSpinner size="lg" label="Загрузка квартир" />
				</div>

				<!-- Error State -->
				<div v-else-if="apartmentsStore.error" class="apartments-view__error">
					<p class="apartments-view__error-text">{{ apartmentsStore.error }}</p>
					<UIControlsButton
						@click="apartmentsStore.loadApartments"
						variant="primary"
					>
						Попробовать снова
					</UIControlsButton>
				</div>

				<!-- Empty State -->
				<div
					v-else-if="apartmentsStore.filteredApartments.length === 0"
					class="apartments-view__empty"
				>
					<p class="apartments-view__empty-text">Квартиры не найдены</p>
					<UIControlsButton
						@click="apartmentsStore.resetFilters"
						variant="secondary"
					>
						Сбросить фильтры
					</UIControlsButton>
				</div>

				<!-- Apartments List -->
				<div v-else class="apartments-view__apartments">
					<ApartmentListSimple
						:apartments="apartmentsStore.filteredApartments"
					/>
				</div>
			</section>
		</div>

		<!-- Mobile Bottom Sheet Filter -->
		<UIBottomSheet v-model="showMobileFilter" title="Фильтры">
			<ApartmentFilter />
		</UIBottomSheet>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useApartmentsStore } from '../../stores/apartments';

// MVVM: подключаем ViewModel (store)
const apartmentsStore = useApartmentsStore();

// Mobile filter bottom sheet state
const showMobileFilter = ref(false);

// Sort headers configuration
// Первые два – просто статические блоки (заглушки), не сортируются и скрываются на планшетах/мобильных
const sortHeaders = [
	{ key: 'plan', label: 'Планировка', sortable: false },
	{ key: 'name', label: 'Квартира', sortable: false },
	{ key: 'area', label: 'S, м²' },
	{ key: 'floor', label: 'Этаж' },
	{ key: 'price', label: 'Цена, ₽' },
];

const openMobileFilter = () => {
	try {
		console.log('Opening mobile filter');
		showMobileFilter.value = true;
		console.log('Mobile filter state:', showMobileFilter.value);
	} catch (error) {
		console.error('Error opening mobile filter:', error);
	}
};
</script>

<style lang="scss" scoped>
.apartments-view {
	&__header {
		margin-bottom: $spacing-xxl;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: $spacing-md;

		@include mobile-only {
			margin-bottom: $spacing-lg;
		}
	}

	&__title {
		font-size: $font-size-xxl;
		font-weight: $font-weight-bold;
		color: $text-primary;
		margin: 0;
		font-family: $font-family;
		flex: 1;
		&--section {
			@include mobile {
				display: none;
			}
		}
		&--top {
			display: none;
			@include mobile {
				display: inline;
			}
		}
		@media (max-width: $breakpoint-tablet) {
			font-size: $font-size-xl;
		}
	}

	&__mobile-filter {
		flex-shrink: 0;
		max-width: 120px;
	}

	&__content {
		display: grid;
		grid-template-columns: 1fr 400px;
		grid-template-rows: 1fr;
		gap: $spacing-xxl;
		align-items: start;
		@include tablet {
			grid-template-columns: 1fr 300px;
			gap: $spacing-lg;
		}

		// На мобильных показываем только список квартир
		@include mobile {
			display: block;
		}
	}

	&__filter {
		grid-row: 1;
		grid-column: 2;

		// Скрываем на мобильных (показываем в bottom sheet)
		@include mobile {
			display: none;
		}
	}

	&__list {
		grid-row: 1;
		grid-column: 1;
		height: 80dvh;
	}

	&__loading,
	&__error,
	&__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: $spacing-xxl;
		text-align: center;
		gap: $spacing-md;
	}

	&__error-text,
	&__empty-text {
		color: $text-secondary;
		font-size: $font-size-base;
		margin: 0;
		font-family: $font-family;
	}

	&__apartments {
		display: flex;
		flex-direction: column;

		@include tablet {
			gap: $spacing-md;
		}
	}

	// load-more удалён (виртуализация)
}
</style>
