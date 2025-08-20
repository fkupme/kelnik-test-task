<template>
	<div class="apartments-view">
		<header class="apartments-view__header">
			<h1 class="apartments-view__title apartments-view__title--top">
				Квартиры
			</h1>

			<UIMobileFilterButton
				class="apartments-view-mobile-filter"
				:active-filters-count="apartmentsStore.activeFiltersCount"
				:disabled="apartmentsStore.isLoading"
				@click="openMobileFilter"
			/>
		</header>

		<div class="apartments-view-content">
			<ApartmentFilter
				class="apartments-view-filter"
				:store="apartmentsStore"
			/>

			<main class="apartments-view__main">
				<h2 class="apartments-view__title apartments-view__title--section">
					Квартиры
				</h2>

				<UISortHeaders
					class="apartments-view__sort-headers"
					:headers="sortHeaders"
					:sort-field="apartmentsStore.sort.field"
					:sort-direction="apartmentsStore.sort.direction"
					:disabled="apartmentsStore.isLoading || apartmentsStore.isFiltering"
					@sort-change="handleSortChange"
				/>

				<div class="apartments-view__list-container">
					<div
						v-if="
							apartmentsStore.isLoading &&
							apartmentsStore.visibleApartments.length === 0
						"
						class="apartments-view__loading"
					>
						<UIFeedbackSpinner size="lg" />
						<h3 class="apartments-view__loading-title">Загрузка квартир</h3>
						<p class="apartments-view__loading-text">
							Подождите, мы получаем актуальную информацию о квартирах...
						</p>
					</div>

					<div
						v-else-if="apartmentsStore.error"
						class="apartments-view__error"
					>
						<svg
							class="apartments-view__error-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
						>
							<circle cx="12" cy="12" r="10" />
							<line x1="12" y1="8" x2="12" y2="12" />
							<line x1="12" y1="16" x2="12.01" y2="16" />
						</svg>
						<h3 class="apartments-view__error-title">Ошибка загрузки</h3>
						<p class="apartments-view__error-text">
							{{ apartmentsStore.error }}
						</p>
						<UIControlsButton @click="retryLoad" variant="primary" size="md">
							Попробовать снова
						</UIControlsButton>
					</div>

					<div
						v-else-if="
							!apartmentsStore.isLoading &&
							apartmentsStore.visibleApartments.length === 0
						"
						class="apartments-view__empty"
					>
						<svg
							class="apartments-view__empty-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
						<h3 class="apartments-view__empty-title">Квартиры не найдены</h3>
						<p class="apartments-view__empty-text">
							По заданным критериям поиска квартиры не найдены. Попробуйте
							изменить параметры фильтрации.
						</p>
						<div class="apartments-view__empty-actions">
							<UIControlsButton
								@click="apartmentsStore.resetFilters"
								variant="primary"
								size="md"
							>
								Сбросить фильтры
							</UIControlsButton>
							<UIControlsButton @click="retryLoad" variant="outline" size="md">
								Обновить список
							</UIControlsButton>
						</div>
					</div>

					<ApartmentList
						v-else
						:apartments="[...apartmentsStore.visibleApartments]"
						:store="apartmentsStore"
						class="apartments-view__list"
					/>
				</div>
			</main>
		</div>

		<UIBottomSheet v-model="showMobileFilter" title="Фильтры">
			<ApartmentFilter :store="apartmentsStore" />
		</UIBottomSheet>

		<UIScrollToTop />
	</div>
</template>

<script setup lang="ts">
declare const useSeoMeta: (meta: Record<string, any>) => void;

const apartmentsStore = useApartmentsStore();

const showMobileFilter = ref(false);

const sortHeaders = computed(() => [
	{ key: 'plan', label: 'Планировка', sortable: false },
	{ key: 'name', label: 'Квартира', sortable: false },
	{ key: 'area', label: 'S, м²', sortable: true },
	{ key: 'floor', label: 'Этаж', sortable: true },
	{ key: 'price', label: 'Цена, ₽', sortable: true },
]);

const openMobileFilter = () => {
	showMobileFilter.value = true;
};

const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
	apartmentsStore.updateSort(field, direction);
};

const retryLoad = async () => {
	await apartmentsStore.loadApartments(true);
};

onMounted(async () => {
	await apartmentsStore.init();
});

useSeoMeta({
	title: 'Квартиры - Поиск и покупка недвижимости',
	description:
		'Найдите идеальную квартиру из нашего каталога. Удобный поиск и фильтрация по параметрам.',
	ogTitle: 'Квартиры - Поиск и покупка недвижимости',
	ogDescription:
		'Найдите идеальную квартиру из нашего каталога. Удобный поиск и фильтрация по параметрам.',
});
</script>

<style lang="scss" scoped>
@use '~/assets/scss/variables' as *;

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

	&-mobile-filter {
		flex-shrink: 0;
		max-width: 120px;
	}

	&-content {
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

		@include tablet-sm {
			grid-template-columns: 1fr 260px;
			gap: $spacing-lg;
		}

		@include mobile {
			display: block;
		}
	}

	&-filter {
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
	}

	&__listcontainer {
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

@include mobile {
	.apartments-view {
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
	}
}

@media (prefers-reduced-motion: reduce) {
	.apartments-view {
		&__list {
			animation: none;
		}
	}

	@keyframes fadeIn {
		from,
		to {
			opacity: 1;
			transform: none;
		}
	}
}

@media print {
	.apartments-view {
		&-mobile-filter,
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
