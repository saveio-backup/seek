<template>
	<div
		id="menu-window"
		@blur="hiddenDialog"
	>
		<!-- MenuWindow -->
		<div style="padding:3px">
			<div
				class="syncInfo box-shadow"
				v-if="menuid === 'syncInfo'"
			>
				<sync-info></sync-info>
			</div>
			<div
				class="state box-shadow"
				v-if="menuid === 'state'"
			>
				<state-info></state-info>
			</div>
		</div>
	</div>
</template>
<script>
import { ipcRenderer } from "electron";
const remote = require('@electron/remote')
import syncInfo from "./MenuWindow/SyncInfo";
import stateInfo from "./MenuWindow/StateInfo";
export default {
	name: "menuWindow",
	components: {
		syncInfo,
		stateInfo
	},
	mounted() {
		const vm = this;
		ipcRenderer.on("dialog-load", (e) => {
			vm.attach();
		});
		vm.attach();
		document.querySelector("body").style.background = "transparent";
		this.eventListener();
	},
	data() {
		return {
			menuid: ""
		};
	},
	computed: {
		currentWindow: function() {
			return remote.getCurrentWindow();
		},
		computedStyle: function() {
			let _style =
				this.menuid === "syncInfo"
					? "padding-top: 5px;"
					: this.menuid === "state"
					? "padding-left: 10px;"
					: "";
			return _style;
		}
	},
	methods: {
		attach() {
			console.log(remote.getCurrentWebContents().id);
			ipcRenderer.send("run-dialog-event", {
				name: "attach",
				data: {
					names: ['progress', 'state', 'modulestate'],
					id: remote.getCurrentWebContents().id
				}
			});
		},
		eventListener() {
			ipcRenderer.on("setMenuDialog", (event, { id }) => {
				this.menuid = id;
			});
		},
		setDialog() {
			let params = {
				id: this.menuid
			};
			this.currentWindow.getParentWindow().menuWindow.openMenu(params);
		},
		hiddenDialog() {
			this.currentWindow
				.getParentWindow()
				.menuWindow.hiddenMenu("hide from menuWindow.vue");
		}
	}
};
</script>
<style lang="scss" scoped>
#menu-window {
	width: 100%;
	height: 100%;
	padding: 0px;
	background: transparent;
	& > div {
		width: 100%;
		height: 100%;
		border-radius: 5px;
		& > div {
			width: 100%;
			height: 100%;
		}
	}
	.box-shadow {
		@include themify {
			box-shadow: $pop-menu-shadow;
			background-color: $content-block-bg;
		}
	}
}
</style>