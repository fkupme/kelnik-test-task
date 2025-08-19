<template>
	<div class="sort-headers">
		<!-- Sort Headers -->
		<div class="sort-headers__columns">
			<component
				v-for="header in headers"
				:is="header.sortable === false ? 'div' : 'button'"
				:key="header.key"
				class="sort-headers__header"
				:class="{
					'sort-headers__header--active':
						header.sortable !== false && sortField === header.key,
					'sort-headers__header--desc':
						header.sortable !== false &&
						sortField === header.key &&
						sortDirection === 'desc',
					'sort-headers__header--static': header.sortable === false,
				}"
				@click="header.sortable !== false && handleSort(header.key)"
			>
				<span class="sort-headers__label">{{ header.label }}</span>
				<!-- Иконка сортировки только для сортируемых -->
				<svg
					v-if="header.sortable !== false"
					class="sort-headers__icon"
					width="12"
					height="12"
					viewBox="0 0 12 12"
					fill="none"
				>
					<!-- Стрелка вверх для asc -->
					<path
						v-if="sortField === header.key && sortDirection === 'asc'"
						d="M6 2L9 5H3L6 2Z"
						fill="currentColor"
					/>
					<!-- Стрелка вниз для desc -->
					<path
						v-else-if="sortField === header.key && sortDirection === 'desc'"
						d="M6 10L3 7H9L6 10Z"
						fill="currentColor"
					/>
					<!-- Обе стрелки для неактивного состояния -->
					<template v-else>
						<path d="M6 2L9 5H3L6 2Z" fill="currentColor" opacity="0.3" />
						<path d="M6 10L3 7H9L6 10Z" fill="currentColor" opacity="0.3" />
					</template>
				</svg>
			</component>
		</div>
	</div>
</template>

<script setup lang="ts">
interface Header {
	key: string;
	label: string;
	/** Если false — это статический заголовок (заглушка), не участвует в сортировке */
	sortable?: boolean; // default: true
}

interface Props {
	headers: Header[];
	sortField?: string;
	sortDirection?: 'asc' | 'desc';
}

const props = withDefaults(defineProps<Props>(), {
	sortField: '',
	sortDirection: 'asc',
});

const emit = defineEmits<{
	'sort-change': [field: string, direction: 'asc' | 'desc'];
}>();

const handleSort = (field: string) => {
	const currentField = props.sortField;
	const currentDirection = props.sortDirection;

	let newDirection: 'asc' | 'desc' = 'asc';

	if (currentField === field) {
		// Если кликнули по тому же полю, меняем направление
		newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
	}

	emit('sort-change', field, newDirection);
};
</script>

<style lang="scss" scoped>
@import '~/assets/scss/variables';

.sort-headers {
	padding-inline-start: 10px;
	&__columns {
		display: grid;
		grid-template-columns: 80px 2fr 1fr 1fr 1fr;
		gap: $spacing-md;
		padding: $spacing-sm 0;
		align-items: center;

		@include desktop {
			grid-template-columns: 80px 2fr 1fr 1fr 1fr;
		}

		@include tablet {
			gap: $spacing-sm;
			grid-template-columns: 1fr 1fr 1fr 80px;
		}
	}

	&__header {
		background: none;
		border: none;
		display: flex;
		align-items: center;
		gap: $spacing-xs;
		padding: $spacing-xs 0;
		font-family: $font-family;
		font-size: $font-size-sm;
		color: $text-secondary;
		cursor: pointer;
		border-radius: $border-radius-sm;
		transition: all $transition-fast;
		justify-content: flex-start;

		&:hover {
			background-color: $background-light;
			color: $text-primary;
		}

		&--active {
			color: $accent;
			font-weight: $font-weight-medium;
		}

		&--active .sort-headers__icon {
			color: $accent;
		}

		&--static {
			cursor: default;
			color: $text-secondary;
			// Скрываем на планшетах и мобильных
			@include tablet {
				display: none;
			}
			@include mobile {
				display: none;
			}
		}
	}

	&__label {
		flex: 1;
		text-align: left;
	}

	&__icon {
		opacity: 0.5;
		transition: all $transition-fast;

		.sort-headers__header--active & {
			opacity: 1;
		}

		.sort-headers__header:hover & {
			opacity: 0.8;
		}
	}
}
</style>
