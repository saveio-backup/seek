<template>
	<div id="app">
		<router-view></router-view>
	</div>
</template>

<script>
export default {
	mounted() {
		// this.$store.dispatch("getChannelInitProgress");
	},
	name: "browser"
};
</script>

<style lang='scss'>
$light-grey: #f2f2f2;
$tabs-height: 70px;
#app {
	height: 100vh;
}

.common-main {
	background: $light-grey;
	height: 100%;
	width: 100%;
}
.layout-main {
	position: absolute;
	left: 200px;
	top: 60px;
	bottom: 0px;
	right: 0px;
}
</style>

