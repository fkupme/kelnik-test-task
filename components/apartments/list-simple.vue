<template>
	<div class="apartment-list">
		<!-- Список квартир -->
		<div class="apartment-list__items">
			<TransitionGroup
				name="apartment-list"
				tag="div"
				class="apartment-list__transition-group"
			>
				<ApartmentCard
					v-for="apartment in apartments"
					:key="apartment.id"
					:apartment="apartment"
					class="apartment-list__item"
				/>
			</TransitionGroup>
		</div>

		<!-- Кнопка "Загрузить еще" -->
		<div v-if="store.pagination.hasMore" class="apartment-list__load-more">
			<UIControlsButton
				:loading="store.isAppending"
				@click="loadMore"
				variant="outline"
				size="large"
			>
				Загрузить еще
			</UIControlsButton>
		</div>

		<!-- Индикатор загрузки -->
		<div
			v-if="store.isLoading && apartments.length === 0"
			class="apartment-list__loading"
		>
			<UIFeedbackSpinner />
		</div>

		<!-- Пустое состояние -->
		<div
			v-if="!store.isLoading && apartments.length === 0"
			class="apartment-list__empty"
		>
			<p>Квартиры не найдены</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useApartmentsStore } from '../../stores/apartments';
import type { Apartment } from '../../types';

interface Props {
	apartments: Apartment[];
}

const props = defineProps<Props>();
const store = useApartmentsStore();

const apartments = computed(() => props.apartments);

const loadMore = () => {
	if (!store.isLoading && !store.isAppending && store.pagination.hasMore) {
		store.loadApartments(false);
	}
};
</script>

<style scoped lang="scss">
.apartment-list {
	display: flex;
	flex-direction: column;
	gap: 0;
	@include tablet {
		gap: 16px;
	}
	&__items {
		display: flex;
		flex-direction: column;
	}

	&__transition-group {
		display: flex;
		flex-direction: column;
	}

	&__load-more {
		display: flex;
		justify-content: center;
		padding: $spacing-xl 0;
	}

	&__loading,
	&__empty {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: $spacing-xl 0;
		min-height: 200px;
	}

	&__empty p {
		color: $text-secondary;
		font-size: $font-size-lg;
	}
}

// Стили для анимации TransitionGroup
.apartment-list-enter-active,
.apartment-list-leave-active {
	transition: all 0.3s ease;
}

.apartment-list-enter-from,
.apartment-list-leave-to {
	opacity: 0;
	transform: translateY(-10px);
}

.apartment-list-move {
	transition: transform 0.3s ease;
}
</style>
