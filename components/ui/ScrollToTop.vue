<template>
	<Transition name="scroll-top">
		<button
			v-if="isVisible"
			class="scroll-top"
			:disabled="isScrolling"
			@click="scrollToTop"
			aria-label="Прокрутить наверх"
			type="button"
		>
			<Icon name="uil:arrow-up" size="24" />
		</button>
	</Transition>
</template>

<script setup lang="ts">
const isVisible = ref(false);
const isScrolling = ref(false);

const checkScrollPosition = () => {
	if (typeof window !== 'undefined') {
		isVisible.value = window.scrollY > 300;
	}
};

const scrollToTop = () => {
	if (typeof window !== 'undefined' && !isScrolling.value) {
		isScrolling.value = true;

		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});

		setTimeout(() => {
			isScrolling.value = false;
		}, 800);
	}
};

onMounted(() => {
	if (typeof window !== 'undefined') {
		window.addEventListener('scroll', checkScrollPosition);
		checkScrollPosition();
	}
});
</script>

<style lang="scss" scoped>
.scroll-top {
	position: fixed;
	bottom: $spacing-lg;
	right: $spacing-lg;
	z-index: $z-header;
	width: 56px;
	height: 56px;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: $accent;
	color: $surface;
	border: none;
	border-radius: 50%;
	cursor: pointer;
	box-shadow: 0 4px 12px rgba($text-primary, 0.15);
	transition: all $transition-fast;

	&:hover {
		background-color: darken($accent, 10%);
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba($text-primary, 0.2);
	}

	&:active {
		transform: translateY(0);
	}

	&:disabled {
		opacity: 0.6;
		pointer-events: none;
	}

	&:focus {
		outline: 2px solid $accent;
		outline-offset: 2px;
	}

	@media (max-width: $breakpoint-tablet) {
		bottom: $spacing-md;
		right: $spacing-md;
		width: 48px;
		height: 48px;
	}
}

.scroll-top-enter-active,
.scroll-top-leave-active {
	transition: all $transition-medium;
}

.scroll-top-enter-from,
.scroll-top-leave-to {
	opacity: 0;
	transform: translateY(20px);
}
</style>
