<template>
	<div id="app">
		<activity-bar></activity-bar>
		<keep-alive>
			<router-view v-if="$route.meta.keepAlive"></router-view>
		</keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
	</div>
</template>

<script>
export default {
	name: "browser",
	components: {
		ActivityBar: require("./components/ActivityBar.vue").default
	}
};
</script>

<style lang='scss'>
#app {
	display: flex;
	height: 100vh;
}
</style>

