<template>
	<div class="default-layout">
		<slot />
	</div>
</template>

<style lang="scss" scoped>
.default-layout {
	min-height: 100dvh;
	background-color: $surface;
}
</style>
