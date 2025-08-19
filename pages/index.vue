<template>
	<NuxtLayout name="main">
		<ViewApartments />
	</NuxtLayout>
</template>

<script setup lang="ts">

const apartmentsStore = useApartmentsStore();

onMounted(async () => {
	await apartmentsStore.init();
});

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