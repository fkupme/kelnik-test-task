<template>
	<div class="apartment-list-optimized">
		<div class="apartment-list-optimized__container">
			<TransitionGroup
				name="apartment-fade"
				tag="div"
				class="apartment-list-optimized__grid"
				:css="true"
				appear
			>
				<ApartmentCard
					v-for="apartment in apartments"
					:key="apartment.id"
					:apartment="apartment"
					class="apartment-list-optimized__item"
				/>
			</TransitionGroup>
		</div>

		<div v-if="store.pagination.hasMore" class="apartment-list-optimized__load-more">
			<UIControlsButton
				:loading="store.isAppending"
				@click="loadMore"
				variant="outline"
				size="large"
				:disabled="store.isLoading"
			>
				Показать ещё {{ store.pagination.itemsPerPage }}
			</UIControlsButton>
		</div>

		<div
			v-if="store.isLoading && apartments.length === 0"
			class="apartment-list-optimized__loading"
		>
			<UIFeedbackSpinner size="lg" />
			<p class="apartment-list-optimized__loading-text">Загрузка квартир...</p>
		</div>

		<div
			v-if="store.isFiltering"
			class="apartment-list-optimized__filtering"
		>
			<UIFeedbackSpinner size="sm" />
			<p class="apartment-list-optimized__filtering-text">Применение фильтров...</p>
		</div>

		<div
			v-if="!store.isLoading && !store.isFiltering && apartments.length === 0"
			class="apartment-list-optimized__empty"
		>
			<svg class="apartment-list-optimized__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
			</svg>
			<h3 class="apartment-list-optimized__empty-title">Квартиры не найдены</h3>
			<p class="apartment-list-optimized__empty-description">
				Попробуйте изменить параметры фильтрации или сбросить все фильтры
			</p>
			<UIControlsButton
				@click="store.resetFilters"
				variant="primary"
				size="md"
			>
				Сбросить фильтры
			</UIControlsButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { shallowRef, watchEffect } from 'vue';
import type { Apartment } from '../../types';

interface Props {
	apartments: Apartment[];
	store: any; 
}

const props = defineProps<Props>();

const apartments = shallowRef<Apartment[]>([]);

watchEffect(() => {
	apartments.value = props.apartments;
});

const loadMore = () => {
	if (!props.store.isLoading && !props.store.isAppending && props.store.pagination.hasMore) {
		props.store.loadMore();
	}
};
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.apartment-list-optimized {
	position: relative;

	&__container {
		min-height: 200px;
	}

	&__grid {
		display: flex;
		flex-direction: column;
		gap: 0;
		
		@include tablet {
			gap: $spacing-md;
		}
	}

	&__item {
		will-change: transform, opacity;
		
		&:not(:last-child) {
			border-bottom: 1px solid $border-color;
		}
	}

	&__load-more {
		display: flex;
		justify-content: center;
		margin-top: $spacing-xl;
		padding: $spacing-lg 0;
	}

	&__loading,
	&__filtering,
	&__empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: $spacing-xxl $spacing-lg;
		text-align: center;
		min-height: 300px;
		gap: $spacing-md;
	}

	&__loading-text,
	&__filtering-text {
		color: $text-secondary;
		font-size: $font-size-base;
		font-family: $font-family;
		margin: 0;
	}

	&__filtering {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(248, 249, 250, 0.8);
		backdrop-filter: blur(2px);
		z-index: 10;
		border-radius: $border-radius-lg;
		min-height: 200px;
	}

	&__empty {
		&-icon {
			width: 64px;
			height: 64px;
			color: $text-secondary;
			opacity: 0.5;
		}

		&-title {
			font-size: $font-size-lg;
			font-weight: $font-weight-medium;
			color: $text-primary;
			margin: 0;
			font-family: $font-family;
		}

		&-description {
			font-size: $font-size-base;
			color: $text-secondary;
			margin: 0 0 $spacing-lg 0;
			font-family: $font-family;
			max-width: 400px;
			line-height: 1.5;
		}
	}
}

.apartment-fade-enter-active {
	transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.apartment-fade-leave-active {
	transition: all 0.2s cubic-bezier(0.4, 0, 0.6, 1);
}

.apartment-fade-enter-from {
	opacity: 0;
	transform: translateY(20px) scale(0.95);
}

.apartment-fade-leave-to {
	opacity: 0;
	transform: translateY(-10px) scale(0.98);
}

.apartment-fade-move {
	transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.apartment-fade-leave-active {
	position: absolute;
	width: 100%;
}

@include mobile {
	.apartment-list-optimized {
		&__loading,
		&__filtering,
		&__empty {
			padding: $spacing-lg;
			min-height: 250px;
		}

		&__empty {
			&-icon {
				width: 48px;
				height: 48px;
			}

			&-title {
				font-size: $font-size-base;
			}

			&-description {
				font-size: $font-size-sm;
			}
		}
	}
}

@include tablet {
	.apartment-list-optimized {
		&__grid {
			gap: $spacing-sm;
		}
	}
}

@media (prefers-reduced-motion: reduce) {
	.apartment-fade-enter-active,
	.apartment-fade-leave-active,
	.apartment-fade-move {
		transition: none;
	}
}

@media (prefers-color-scheme: dark) {
	.apartment-list-optimized {
		&__filtering {
			background: rgba(240, 242, 245, 0.8);
		}
	}
}
</style>