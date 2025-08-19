<template>
	<NuxtLayout name="main">
		<!-- Use optimized components for better performance -->
		<ViewApartmentsOptimized />
	</NuxtLayout>
</template>

<script setup lang="ts">
// Import the optimized store with hash-based performance improvements
const apartmentsStore = useOptimizedApartmentsStore();

// Initialize store with cached filters and data
onMounted(async () => {
	await apartmentsStore.init();
});

// Enhanced SEO meta for better search visibility
useSeoMeta({
	title: 'Квартиры - Быстрый поиск и фильтрация недвижимости',
	description:
		'Оптимизированный каталог квартир с мгновенной фильтрацией без задержек. Улучшенная производительность и удобство использования.',
	ogTitle: 'Квартиры - Быстрый поиск и фильтрация недвижимости',
	ogDescription:
		'Оптимизированный каталог квартир с мгновенной фильтрацией без задержек. Улучшенная производительность и удобство использования.',
	keywords: 'квартиры, недвижимость, быстрый поиск, оптимизированные фильтры, производительность',
	robots: 'index, follow',
	author: 'Senior Developer',
});
</script>
