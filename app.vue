<template>
	<NuxtPage />
</template>

<script setup lang="ts">
// Начальная загрузка перенесена в pages/index.vue во избежание двойного reset.
</script>

<style lang="scss">
.main {
	min-height: 100vh;
	padding: $spacing-lg 0;
}

.header {
	margin-bottom: $spacing-xxl;

	&__title {
		font-size: $font-size-xxl;
		font-weight: $font-weight-bold;
		color: $text-primary;
		margin: 0;
		font-family: $font-family;
	}
}

.content {
	display: grid;
	grid-template-columns: 300px 1fr;
	gap: $spacing-xxl;
	align-items: start;

	@media (max-width: $breakpoint-desktop) {
		grid-template-columns: 1fr;
		gap: $spacing-lg;
	}

	&__filter {
		@media (max-width: $breakpoint-desktop) {
			order: 2;
		}
	}

	&__apartments {
		@media (max-width: $breakpoint-desktop) {
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
		padding: $spacing-xxl;
		text-align: center;
	}

	&__error,
	&__empty {
		gap: $spacing-md;
	}

	&__list {
		display: flex;
		flex-direction: column;
		gap: $spacing-md;
	}

	&__load-more {
		display: flex;
		justify-content: center;
		margin-top: $spacing-lg;
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
	border: 3px solid $border-color;
	border-top: 3px solid $accent;
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
