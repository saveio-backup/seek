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
.common-main {
	padding: 0 88px;
	width: calc(100% - 70px);
}
.layout-main {
	position: absolute;
	left: 200px;
	top: 80px;
	bottom: 0px;
	right: 0px;
}
</style>

