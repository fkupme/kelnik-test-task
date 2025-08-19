<template>
	<div class="apartments-view-optimized">
		<header class="apartments-view-optimized__header">
			<h1 class="apartments-view-optimized__title apartments-view-optimized__title--top">
				Квартиры
			</h1>

			<!-- Mobile Filter Button -->
			<UIMobileFilterButton
				class="apartments-view-optimized__mobile-filter"
				:active-filters-count="apartmentsStore.activeFiltersCount"
				:disabled="apartmentsStore.isLoading"
				@click="openMobileFilter"
			/>
		</header>

		<div class="apartments-view-optimized__content">
			<!-- Desktop Filter -->
			<ApartmentFilterOptimized 
				class="apartments-view-optimized__filter" 
				:store="apartmentsStore"
			/>

			<main class="apartments-view-optimized__main">
				<h2 class="apartments-view-optimized__title apartments-view-optimized__title--section">
					Квартиры
				</h2>
				
				<!-- Sort Headers -->
				<UISortHeaders
					class="apartments-view-optimized__sort-headers"
					:headers="sortHeaders"
					:sort-field="apartmentsStore.sort.field"
					:sort-direction="apartmentsStore.sort.direction"
					:disabled="apartmentsStore.isLoading || apartmentsStore.isFiltering"
					@sort-change="handleSortChange"
				/>

				<!-- Statistics -->
				<div v-if="showStatistics" class="apartments-view-optimized__stats">
					<span class="apartments-view-optimized__stats-text">
						Найдено {{ apartmentsStore.visibleApartments.length }} 
						{{ getPluralForm(apartmentsStore.visibleApartments.length, ['квартира', 'квартиры', 'квартир']) }}
					</span>
					<span v-if="apartmentsStore.activeFiltersCount > 0" class="apartments-view-optimized__stats-filters">
						(применено {{ apartmentsStore.activeFiltersCount }} 
						{{ getPluralForm(apartmentsStore.activeFiltersCount, ['фильтр', 'фильтра', 'фильтров']) }})
					</span>
				</div>

				<!-- Main Content -->
				<div class="apartments-view-optimized__list-container">
					<!-- Loading State -->
					<div v-if="apartmentsStore.isLoading && apartmentsStore.visibleApartments.length === 0" 
						 class="apartments-view-optimized__loading">
						<UIFeedbackSpinner size="lg" />
						<h3 class="apartments-view-optimized__loading-title">Загрузка квартир</h3>
						<p class="apartments-view-optimized__loading-text">
							Подождите, мы получаем актуальную информацию о квартирах...
						</p>
					</div>

					<!-- Error State -->
					<div v-else-if="apartmentsStore.error" class="apartments-view-optimized__error">
						<svg class="apartments-view-optimized__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<circle cx="12" cy="12" r="10"/>
							<line x1="12" y1="8" x2="12" y2="12"/>
							<line x1="12" y1="16" x2="12.01" y2="16"/>
						</svg>
						<h3 class="apartments-view-optimized__error-title">Ошибка загрузки</h3>
						<p class="apartments-view-optimized__error-text">{{ apartmentsStore.error }}</p>
						<UIControlsButton
							@click="retryLoad"
							variant="primary"
							size="medium"
						>
							Попробовать снова
						</UIControlsButton>
					</div>

					<!-- Empty State -->
					<div v-else-if="!apartmentsStore.isLoading && apartmentsStore.visibleApartments.length === 0"
						 class="apartments-view-optimized__empty">
						<svg class="apartments-view-optimized__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
						</svg>
						<h3 class="apartments-view-optimized__empty-title">Квартиры не найдены</h3>
						<p class="apartments-view-optimized__empty-text">
							По заданным критериям поиска квартиры не найдены. 
							Попробуйте изменить параметры фильтрации.
						</p>
						<div class="apartments-view-optimized__empty-actions">
							<UIControlsButton
								@click="apartmentsStore.resetFilters"
								variant="primary"
								size="medium"
							>
								Сбросить фильтры
							</UIControlsButton>
							<UIControlsButton
								@click="retryLoad"
								variant="outline"
								size="medium"
							>
								Обновить список
							</UIControlsButton>
						</div>
					</div>

					<!-- Apartments List -->
					<ApartmentListOptimized
						v-else
						:apartments="apartmentsStore.visibleApartments"
						:store="apartmentsStore"
						class="apartments-view-optimized__list"
					/>
				</div>
			</main>
		</div>

		<!-- Mobile Bottom Sheet Filter -->
		<UIBottomSheet v-model="showMobileFilter" title="Фильтры">
			<ApartmentFilterOptimized :store="apartmentsStore" />
		</UIBottomSheet>

		<!-- Scroll to Top Button -->
		<UIScrollToTop />
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useOptimizedApartmentsStore } from '../../stores/apartments-optimized';

// === Store ===
const apartmentsStore = useOptimizedApartmentsStore();

// === Local State ===
const showMobileFilter = ref(false);

// === Computed ===
const sortHeaders = computed(() => [
	{ key: 'plan', label: 'Планировка', sortable: false },
	{ key: 'name', label: 'Квартира', sortable: true },
	{ key: 'area', label: 'S, м²', sortable: true },
	{ key: 'floor', label: 'Этаж', sortable: true },
	{ key: 'price', label: 'Цена, ₽', sortable: true },
]);

const showStatistics = computed(() => 
	!apartmentsStore.isLoading && 
	!apartmentsStore.error && 
	apartmentsStore.visibleApartments.length > 0
);

// === Utilities ===
const getPluralForm = (count: number, forms: string[]): string => {
	const cases = [2, 0, 1, 1, 1, 2];
	return forms[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]];
};

// === Event Handlers ===
const openMobileFilter = () => {
	showMobileFilter.value = true;
};

const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
	apartmentsStore.updateSort(field, direction);
};

const retryLoad = async () => {
	await apartmentsStore.loadApartments(true);
};

// === Lifecycle ===
onMounted(async () => {
	// Инициализируем store если еще не инициализирован
	await apartmentsStore.init();
});

// === SEO ===
useSeoMeta({
	title: 'Квартиры - Поиск и покупка недвижимости',
	description: 'Найдите идеальную квартиру из нашего каталога. Удобный поиск и фильтрация по параметрам.',
	ogTitle: 'Квартиры - Поиск и покупка недвижимости',
	ogDescription: 'Найдите идеальную квартиру из нашего каталога. Удобный поиск и фильтрация по параметрам.',
});
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables';

.apartments-view-optimized {
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
		line-height: 1.2;
		
		&--section {
			font-size: $font-size-xl;
			margin-bottom: $spacing-lg;
			
			@include mobile {
				display: none;
			}
		}
		
		&--top {
			display: none;
			
			@include mobile {
				display: block;
				font-size: $font-size-xl;
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
		min-height: 70vh;
		
		@include tablet {
			grid-template-columns: 1fr 300px;
			gap: $spacing-lg;
		}

		@include mobile {
			display: block;
		}
	}

	&__filter {
		grid-row: 1;
		grid-column: 2;
		position: sticky;
		top: $spacing-lg;

		@include mobile {
			display: none;
		}
	}

	&__main {
		grid-row: 1;
		grid-column: 1;
		min-height: 600px;
		
		@include mobile {
			min-height: 500px;
		}
	}

	&__sort-headers {
		margin-bottom: $spacing-lg;
	}

	&__stats {
		display: flex;
		align-items: center;
		gap: $spacing-xs;
		margin-bottom: $spacing-lg;
		padding: $spacing-sm $spacing-md;
		background: lighten($background-primary, 2%);
		border-radius: $border-radius-md;
		border-left: 4px solid $accent;

		&-text {
			font-size: $font-size-sm;
			color: $text-primary;
			font-weight: $font-weight-medium;
			font-family: $font-family;
		}

		&-filters {
			font-size: $font-size-xs;
			color: $text-secondary;
			font-family: $font-family;
		}
	}

	&__list-container {
		position: relative;
		min-height: 400px;
	}

	&__loading,
	&__error,
	&__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: $spacing-xxl $spacing-lg;
		min-height: 400px;
		gap: $spacing-md;
	}

	&__loading {
		&-title {
			font-size: $font-size-lg;
			color: $text-primary;
			margin: 0;
			font-family: $font-family;
			font-weight: $font-weight-medium;
		}

		&-text {
			font-size: $font-size-base;
			color: $text-secondary;
			margin: 0;
			font-family: $font-family;
			max-width: 400px;
			line-height: 1.5;
		}
	}

	&__error {
		&-icon {
			width: 64px;
			height: 64px;
			color: $danger;
			margin-bottom: $spacing-sm;
		}

		&-title {
			font-size: $font-size-lg;
			color: $text-primary;
			margin: 0;
			font-family: $font-family;
			font-weight: $font-weight-medium;
		}

		&-text {
			font-size: $font-size-base;
			color: $text-secondary;
			margin: 0 0 $spacing-lg 0;
			font-family: $font-family;
			max-width: 400px;
			line-height: 1.5;
		}
	}

	&__empty {
		&-icon {
			width: 80px;
			height: 80px;
			color: $text-secondary;
			opacity: 0.5;
			margin-bottom: $spacing-sm;
		}

		&-title {
			font-size: $font-size-lg;
			color: $text-primary;
			margin: 0;
			font-family: $font-family;
			font-weight: $font-weight-medium;
		}

		&-text {
			font-size: $font-size-base;
			color: $text-secondary;
			margin: 0 0 $spacing-lg 0;
			font-family: $font-family;
			max-width: 500px;
			line-height: 1.6;
		}

		&-actions {
			display: flex;
			gap: $spacing-md;
			flex-wrap: wrap;
			justify-content: center;
		}
	}

	&__list {
		animation: fadeIn 0.3s ease-out;
	}
}

// Анимации
@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(20px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

// Адаптивность
@include mobile {
	.apartments-view-optimized {
		&__loading,
		&__error,
		&__empty {
			padding: $spacing-lg;
			min-height: 300px;
		}

		&__empty {
			&-icon {
				width: 60px;
				height: 60px;
			}

			&-actions {
				flex-direction: column;
				width: 100%;
				
				button {
					width: 100%;
				}
			}
		}

		&__stats {
			flex-direction: column;
			align-items: flex-start;
			gap: $spacing-xs / 2;
		}
	}
}

// Улучшения для доступности
@media (prefers-reduced-motion: reduce) {
	.apartments-view-optimized {
		&__list {
			animation: none;
		}
	}
	
	@keyframes fadeIn {
		from, to {
			opacity: 1;
			transform: none;
		}
	}
}

// Оптимизация для печати
@media print {
	.apartments-view-optimized {
		&__mobile-filter,
		&__sort-headers {
			display: none;
		}

		&__content {
			display: block;
		}

		&__filter {
			display: none;
		}
	}
}
</style>