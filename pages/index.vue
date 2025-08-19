<template>
	<NuxtLayout name="main">
		<ViewApartments />
	</NuxtLayout>
</template>

<script setup lang="ts">
// MVVM: View Model логика для главной страницы
const apartmentsStore = useApartmentsStore();

// Инициализация данных при монтировании
onMounted(async () => {
	await apartmentsStore.loadApartments();
});

// SEO метаданные
useSeoMeta({
	title: 'Квартиры - Поиск и покупка недвижимости',
	description:
		'Найдите идеальную квартиру из нашего каталога. Удобный поиск и фильтрация по параметрам.',
	ogTitle: 'Квартиры - Поиск и покупка недвижимости',
	ogDescription:
		'Найдите идеальную квартиру из нашего каталога. Удобный поиск и фильтрация по параметрам.',
});
</script>
