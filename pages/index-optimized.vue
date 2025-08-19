<template>
	<NuxtLayout name="main">
		<ViewApartmentsOptimized />
	</NuxtLayout>
</template>

<script setup lang="ts">
// Используем оптимизированный store
const apartmentsStore = useOptimizedApartmentsStore();

// Инициализация данных при монтировании
onMounted(async () => {
	await apartmentsStore.init();
});

// SEO метаданные
useSeoMeta({
	title: 'Квартиры - Поиск и покупка недвижимости',
	description:
		'Найдите идеальную квартиру из нашего каталога. Удобный поиск и фильтрация по параметрам с улучшенной производительностью.',
	ogTitle: 'Квартиры - Поиск и покупка недвижимости',
	ogDescription:
		'Найдите идеальную квартиру из нашего каталога. Удобный поиск и фильтрация по параметрам с улучшенной производительностью.',
	keywords: 'квартиры, недвижимость, покупка, аренда, поиск квартир, фильтры',
});
</script>