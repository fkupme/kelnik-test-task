export const useScrollToTop = () => {
	const isVisible = ref(false);
	const isScrolling = ref(false);

	const checkScrollPosition = () => {
		if (process.client) {
			isVisible.value = window.scrollY > 300;
		}
	};

	const scrollToTop = () => {
		if (process.client && !isScrolling.value) {
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
		if (process.client) {
			window.addEventListener('scroll', checkScrollPosition);
			checkScrollPosition();
		}
	});

	onUnmounted(() => {
		if (process.client) {
			window.removeEventListener('scroll', checkScrollPosition);
		}
	});

	return {
		isVisible: readonly(isVisible),
		isScrolling: readonly(isScrolling),
		scrollToTop,
	};
};
