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

		<div class="apartment-card__content">
			<h3 class="apartment-card__title">{{ apartment.name }}</h3>

			<div class="apartment-card__details">
				<div class="apartment-card__detail">
					<span class="apartment-card__detail-value">{{ apartment.area }}</span>
					<span class="apartment-card__detail-unit">м²</span>
				</div>

				<div class="apartment-card__detail">
					<span class="apartment-card__detail-value">{{
						apartment.floor
					}}</span>
					<span class="apartment-card__detail-text"
						>из {{ apartment.totalFloors }} этаж</span
					>
				</div>

				<div class="apartment-card__detail apartment-card__detail--price">
					<span class="apartment-card__price"
						>{{ formatPrice(apartment.price) }} ₽</span
					>
				</div>
			</div>
		</div>
	</article>
</template>

<script setup lang="ts">
import type { Apartment } from '../types';

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
	display: flex;
	gap: $spacing-md;
	padding: $spacing-lg;
	background-color: $white;
	border: 1px solid $border-color;
	border-radius: 12px;
	transition: all $transition-fast;

	&:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		transform: translateY(-2px);
	}

	@media (max-width: $breakpoint-tablet) {
		flex-direction: column;
		gap: $spacing-sm;
		padding: $spacing-md;
	}

	&__image {
		flex-shrink: 0;
		width: 80px;
		height: 80px;

		@media (max-width: $breakpoint-tablet) {
			width: 100%;
			height: auto;
			max-width: 120px;
			align-self: center;
		}
	}

	&__plan {
		width: 100%;
		height: 100%;
		object-fit: contain;
		border-radius: 8px;
	}

	&__content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: $spacing-sm;
	}

	&__title {
		font-size: $font-size-base;
		font-weight: $font-weight-regular;
		color: $text-color;
		margin: 0;
	}

	&__details {
		display: flex;
		align-items: center;
		gap: $spacing-lg;
		flex-wrap: wrap;

		@media (max-width: $breakpoint-tablet) {
			flex-direction: column;
			align-items: flex-start;
			gap: $spacing-xs;
		}
	}

	&__detail {
		display: flex;
		align-items: baseline;
		gap: 4px;
		font-size: $font-size-small;

		&--price {
			margin-left: auto;

			@media (max-width: $breakpoint-tablet) {
				margin-left: 0;
				align-self: flex-end;
			}
		}
	}

	&__detail-value {
		font-weight: $font-weight-bold;
		color: $text-color;
	}

	&__detail-unit,
	&__detail-text {
		color: $text-light;
		font-size: $font-size-small;
	}

	&__price {
		font-size: $font-size-large;
		font-weight: $font-weight-bold;
		color: $text-color;
	}
}
</style>
