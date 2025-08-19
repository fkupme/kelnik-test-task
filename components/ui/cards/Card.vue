<template>
	<div :class="cardClasses">
		<header v-if="$slots.header" class="card__header">
			<slot name="header" />
		</header>

		<div v-if="$slots.default" class="card__body">
			<slot />
		</div>

		<footer v-if="$slots.footer" class="card__footer">
			<slot name="footer" />
		</footer>
	</div>
</template>

<script setup lang="ts">
interface Props {
	variant?: 'default' | 'outlined' | 'elevated';
	padding?: 'none' | 'sm' | 'md' | 'lg';
	hoverable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'default',
	padding: 'md',
	hoverable: false,
});

const cardClasses = computed(() => {
	return [
		'card',
		`card--${props.variant}`,
		`card--padding-${props.padding}`,
		{
			'card--hoverable': props.hoverable,
		},
	];
});
</script>

<style lang="scss" scoped>
.card {
	border-radius: $border-radius-lg;
	background-color: $surface;
	transition: all $transition-fast;

	&--default {
		border: 1px solid $border-color;
	}

	&--outlined {
		border: 2px solid darken($border-color, 15%);
	}

	&--elevated {
		border: 1px solid lighten($border-color, 5%);
		box-shadow: 0 4px 8px rgba($text-primary, 0.1);
	}

	&--padding-none {
		.card__header,
		.card__body,
		.card__footer {
			padding: 0;
		}
	}

	&--padding-sm {
		.card__header,
		.card__body,
		.card__footer {
			padding: $spacing-sm;
		}
	}

	&--padding-md {
		.card__header,
		.card__body,
		.card__footer {
			padding: $spacing-lg - 4px;
		}
	}

	&--padding-lg {
		.card__header,
		.card__body,
		.card__footer {
			padding: $spacing-xl;
		}
	}

	&--hoverable {
		cursor: pointer;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 8px 16px rgba($text-primary, 0.15);
		}
	}

	&__header {
		border-bottom: 1px solid $border-color;
	}

	&__body {
		flex: 1;
	}

	&__footer {
		border-top: 1px solid $border-color;
	}

	&__header + &__body {
		padding-top: $spacing-lg - 4px;
	}

	&__body + &__footer {
		padding-top: $spacing-lg - 4px;
	}
}
</style>
