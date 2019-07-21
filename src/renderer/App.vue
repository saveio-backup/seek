<template>
	<div id="app" :class="{'haveBg':routerName !== 'Dialog'}">
		<router-view></router-view>
	</div>
</template>

<script>
import {
  ipcRenderer
} from 'electron'
export default {
	computed: {
		routerName() {
			return this.$route.name;
		}
	},
	name: "browser",
	mounted() {
		ipcRenderer.on('current-active-show-message', (event, {info, type}) => {
			this.$message({
				message: info,
				type: type
			})
		})
		// render-show-message
	}
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

