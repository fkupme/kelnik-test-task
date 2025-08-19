<template>
	<div class="main-layout">
		<main class="main">
			<div class="container">
				<slot />
			</div>
		</main>
		<UIScrollToTop />
	</div>
</template>

<style lang="scss" scoped>
.main-layout {
	min-height: 100vh;
}

.main {
	padding: $spacing-lg 0;
}
</style>
