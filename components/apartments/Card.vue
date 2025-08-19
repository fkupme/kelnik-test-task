<template>
	<article class="apartment-card">
		<div class="apartment-card__image">
			<img
				:src="apartment.planImage"
				:alt="`План ${apartment.name}`"
				class="apartment-card__plan"
				loading="lazy"
			/>
		</div>

		<div class="apartment-card__title-column">
			<h3 class="apartment-card__title">{{ apartment.name }}</h3>
		</div>

		<div class="apartment-card__area">
			<span class="apartment-card__detail-value"
				>{{ apartment.area }}
				<span class="apartment-card__detail-unit">м²</span></span
			>
		</div>

		<div class="apartment-card__floor">
			<span class="apartment-card__detail-value"
				>{{ apartment.floor }}
				<span class="apartment-card__detail-text"
					>из {{ apartment.totalFloors }}
					<span class="apartment-card__detail-unit">этаж</span></span
				></span
			>
		</div>

		<div class="apartment-card__price-column">
			<span class="apartment-card__price"
				>{{ formatPrice(apartment.price) }}
				<span class="apartment-card__detail-unit">₽</span></span
			>
		</div>
	</article>
</template>

<script setup lang="ts">
import type { Apartment } from '../../types';

interface Props {
	apartment: Apartment;
}

defineProps<Props>();

const formatPrice = (price: number): string => {
	return new Intl.NumberFormat('ru-RU').format(price);
};
</script>

<style lang="scss" scoped>
.apartment-card {
	display: grid;
	grid-template-columns: 80px 2fr 1fr 1fr 1fr;
	gap: $spacing-md;
	align-items: center;
	padding-block: $spacing-md;
	background-color: $surface;
	border-top: 1px solid $border-color;
	transition: all $transition-fast;
	min-height: 112px; /* Фиксированная минимальная высота: 80px (изображение) + 32px (padding) */

	@include tablet {
		grid-template-columns: 1fr 1fr 1fr 80px;
		grid-template-rows: auto auto;
		border: 1px solid $border-color;
		border-radius: $border-radius-lg;
    padding: $spacing-md $spacing-lg;
		border-top: 1px solid $border-color;
		min-height: 140px; /* Больше высота для планшетов */
	}

	@include mobile {
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: auto auto auto auto;
		border: 1px solid $border-color;
		border-radius: $border-radius-lg;
		border-top: 1px solid $border-color;
		min-height: 200px; /* Еще больше для мобильных */
	}

	&:hover {
		box-shadow: 0 4px 12px rgba($text-primary, 0.1);
		transform: translateY(-2px);
	}

	&__image {
		flex-shrink: 0;
		width: 80px;
		height: 80px;

		@include tablet {
			grid-column: 4;
			grid-row: 1 / 3;
		}

		@include mobile {
			grid-column: 1 / span 3;
			grid-row: 1 / span 2;
			width: 100%;
			height: 120px;
		}
	}

	&__plan {
		width: 100%;
		height: 100%;
		object-fit: contain;
		border-radius: $spacing-xs;
	}

	&__title-column {
		display: flex;
		align-items: center;
		min-height: 60px;

		@include tablet {
			grid-column: 1 / span 2;
			grid-row: 1;
		}

		@include mobile {
			grid-column: 1 / span 3;
			grid-row: 3;
			justify-content: center;
		}
	}

	&__title {
		font-size: $font-size-base;
		font-weight: $font-weight-regular;
		color: $text-primary;
		margin: 0;
	}

	&__area,
	&__floor {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;

		@include tablet {
			grid-row: 2;
		}

		@include mobile {
			grid-row: 4;
			align-items: center;
		}
	}

	&__area {
		@include tablet {
			grid-column: 1;
		}

		@include mobile {
			grid-column: 1;
		}
	}

	&__floor {
		@include tablet {
			grid-column: 2;
		}

		@include mobile {
			grid-column: 2;
		}
	}

	&__price-column {
		display: flex;
		align-items: center;

		@include tablet {
			grid-column: 3;
			grid-row: 2;
		}

		@include mobile {
			grid-column: 3;
			grid-row: 4;
			justify-content: center;
			align-items: center;
		}
	}

	&__detail-value {
		font-weight: $font-weight-bold;
		color: $text-primary;
		font-size: $font-size-base;
	}

	&__detail-unit,
	&__detail-text {
		color: $text-secondary;
		font-size: $font-size-base;
	}
	&__detail-unit {
		display: none;
		@include tablet {
			display: inline;
		}
		@include mobile {
			display: inline;
		}
	}

	&__price {
		font-size: $font-size-base;
		font-weight: $font-weight-bold;
		color: $text-primary;
	}
}
</style>
