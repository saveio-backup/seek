<template>
	<div class="dialogWrapper">
		<!-- <router-view></router-view> -->
		<!-- <router-view @closeDialog="closeDialog"></router-view> -->
		<export-private-key
		 @closeDialog="closeDialog"
		 v-if="menuSelector === 'exportPrivateKey'"
		></export-private-key>
		<logout
		 @closeDialog="closeDialog"
		 v-if="menuSelector === 'logout'"
		></logout>
	</div>
</template>

<script>
import { ipcRenderer } from "electron";
import ExportPrivateKey from "./Dialog/ExportPrivateKey.vue";
import Logout from "./Dialog/Logout.vue";
export default {
	name: "Dialog",
	components: {
		ExportPrivateKey,
		Logout
	},
	data() {
		return {
			menuSelector: ""
		};
	},
	mounted() {
		ipcRenderer.on("setSelector", (e, selector) => {
      this.menuSelector = selector;
      this.$forceUpdate()
    });
	},
	methods: {
		closeDialog({ timeout = 0 }) {
			this.menuSelector = '';
			if (timeout === 0) {
				ipcRenderer.send("dialog-close");
			} else {
				setTimeout(() => {
					ipcRenderer.send("dialog-close");
				}, timeout);
			}
		}
	}
};
</script>

<style scoped>
.dialogWrapper {
	width: 100%;
	height: 100%;
}
</style>
