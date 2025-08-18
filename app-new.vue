<template>
	<div id="app">
		<main class="main">
			<div class="container">
				<header class="header">
					<h1 class="header__title">Квартиры</h1>
				</header>

				<div class="content">
					<ApartmentFilter class="content__filter" />

					<section class="content__apartments">
						<div v-if="apartmentsStore.isLoading" class="apartments__loading">
							<div class="loading-spinner" aria-label="Загрузка квартир">
								<div class="spinner"></div>
							</div>
						</div>

						<div v-else-if="apartmentsStore.error" class="apartments__error">
							<p>{{ apartmentsStore.error }}</p>
							<button
								@click="apartmentsStore.loadApartments"
								class="btn btn--primary"
							>
								Попробовать снова
							</button>
						</div>

						<div
							v-else-if="apartmentsStore.displayedApartments.length === 0"
							class="apartments__empty"
						>
							<p>Квартиры не найдены</p>
							<button
								@click="apartmentsStore.resetFilters"
								class="btn btn--secondary"
							>
								Сбросить фильтры
							</button>
						</div>

						<div v-else class="apartments__list">
							<ApartmentCard
								v-for="apartment in apartmentsStore.displayedApartments"
								:key="apartment.id"
								:apartment="apartment"
								class="apartments__item"
							/>

							<div
								v-if="apartmentsStore.pagination.hasMore"
								class="apartments__load-more"
							>
								<button
									@click="apartmentsStore.loadMore"
									:disabled="apartmentsStore.isLoading"
									class="btn btn--secondary"
								>
									{{
										apartmentsStore.isLoading ? 'Загрузка...' : 'Загрузить еще'
									}}
								</button>
							</div>
						</div>
					</section>
				</div>
			</div>
		</main>

		<ScrollToTop />
	</div>
</template>

<script setup lang="ts">
const apartmentsStore = useApartmentsStore();

onMounted(async () => {
	await apartmentsStore.loadApartments();
});
</script>

<style lang="scss" scoped>
.main {
	min-height: 100vh;
	padding: 24px 0;
}

.header {
	margin-bottom: 48px;

	&__title {
		font-size: 32px;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0;
	}
}

.content {
	display: grid;
	grid-template-columns: 300px 1fr;
	gap: 48px;
	align-items: start;

	@media (max-width: 960px) {
		grid-template-columns: 1fr;
		gap: 24px;
	}

	&__filter {
		@media (max-width: 960px) {
			order: 2;
		}
	}

	&__apartments {
		@media (max-width: 960px) {
			order: 1;
		}
	}
}

.apartments {
	&__loading,
	&__error,
	&__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px;
		text-align: center;
	}

	&__error,
	&__empty {
		gap: 16px;
	}

	&__list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	&__load-more {
		display: flex;
		justify-content: center;
		margin-top: 24px;
	}
}

.loading-spinner {
	display: flex;
	align-items: center;
	justify-content: center;
}

.spinner {
	width: 40px;
	height: 40px;
	border: 3px solid #e5e5e5;
	border-top: 3px solid #2e8b57;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
