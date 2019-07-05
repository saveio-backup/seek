<template>
	<div id="app" :class="{'haveBg':routerName !== 'Dialog'}">
		<router-view></router-view>
	</div>
</template>

<script>
export default {
	computed: {
		routerName() {
			console.log('123',this.$route);
			return this.$route.name;
		}
	},
	name: "browser"
};
</script>

<style lang='scss'>
$light-grey: #F9F9FB;
$tabs-height: 70px;
#app {
	height: 100vh;
	&.haveBg {
		background: #F9F9FB;
	}
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

