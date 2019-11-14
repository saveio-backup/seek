<template>
	<div
		id="menu-window"
		:style="computedStyle"
	>
		<!-- MenuWindow -->
		<div
			@mouseenter="setDialog"
			@mouseleave="hiddenDialog"
		>
			<div
				class="syncInfo"
				v-if="menuid === 'syncInfo'"
			>
				<sync-info></sync-info>
			</div>
			<div
				class="state"
				v-if="menuid === 'state'"
			>
				<state-info></state-info>
			</div>
			<div
				class="plugin"
				v-if="menuid === 'plugin'"
			>
				<plugin-info></plugin-info>
			</div>
		</div>
	</div>
</template>
<script>
import { ipcRenderer, remote } from "electron";
import syncInfo from "./MenuWindow/SyncInfo";
import stateInfo from "./MenuWindow/StateInfo";
import pluginInfo from "./PluginInfo.vue";
export default {
	name: "menuWindow",
	components: {
		syncInfo,
		stateInfo,
		pluginInfo
	},
	mounted() {
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
			this.currentWindow.getParentWindow().menuWindow.hiddenMenu();
		}
	}
};
</script>
<style lang="scss" scoped>
#menu-window {
	width: 100%;
	height: 100%;
	padding: 15px;
	& > div {
		width: 100%;
		height: 100%;
		border-radius: 5px;
		& > div {
			width: 100%;
			height: 100%;
		}
	}
}
</style>