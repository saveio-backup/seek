<template>
	<div id="menu-window">
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
	</div>
</template>
<script>
import { ipcRenderer } from "electron";
import syncInfo from './MenuWindow/SyncInfo'
import stateInfo from './MenuWindow/StateInfo'
export default {
	components: {
		syncInfo,
		stateInfo
	},
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
			ipcRenderer.on("setMenuDialog", (event, {id}) => {
				this.menuid = id;
			});
		}
	}
};
</script>
<style lang="scss" scoped>
#menu-window {
	width: 100%;
	height: 100%;
	& > div {
		width: 100%;
		height: 100%;
	}
}
</style>