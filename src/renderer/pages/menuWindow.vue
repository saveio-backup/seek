<template>
	<div id="menu-window">
		<div
			class="netstate"
			v-show="menuid === 'netstate'"
		>
			Show Net State
		</div>
		<div
			class="slidebar"
			v-show="menuid === 'slidebar'"
		>
			Show Slide Bar
		</div>
	</div>
</template>
<script>
import { ipcRenderer } from "electron";
export default {
	components: {},
	mounted() {
		this.eventListener();
	},
	data() {
		return {
			menuid:''
		};
	},
	methods: {
		eventListener() {
			ipcRenderer.on("setMenuDialog", (event, param) => {
				this.menuid = param
			});
		}
	}
};
</script>
<style lang="scss" scoped>
#menu-window {
	.netstate {
		border: solid 1px red;
	}
	.slidebar {
		border: solid 1px green;
	}
}
</style>