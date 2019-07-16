<template>
	<div class="isCreateChannel">
		<el-dialog
		 center
		 width='600px'
		 :before-close="closeDialog"
		 :close-on-click-modal='false'
		 :visible.sync="logoutToggle"
		>
			<div slot="title">
				<h2>Warning</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content">
				<div class="mb20">
					<p class="mt20 text-center">Please ensure that the private key(WIF) file is properly stored before exiting.</p>
				</div>
				<div slot="footer">
					<el-button @click="closeDialog">Cancel</el-button>
					<el-button
					 type="primary"
           class="primary"
					 @click="logout"
					>Logout</el-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { ipcRenderer, dialog, remote } from "electron";
import { setTimeout } from "timers";
export default {
	name: "IsCreateChannel",
	data() {
		return {
			isCreateChannelToggle: false,
			isCreateChannelLoding: null,
			win: remote.getCurrentWindow()
		};
	},
	methods: {
		closeDialog() {
			this.$emit("closeDialog", { timeout: 0 });
		},
		isCreateChannel() {
      
		},
		logoutUploadViews() {
			let views = this.win.views;
			try {
				for (let i = views.length - 1; i >= 0; i--) {
					let view = views[i];
					if (view.displayURL.indexOf("seek://") === 0 && !view.isActive) {
						view.destroy(i);
					} else if (
						view.displayURL.indexOf("seek://") === 0 &&
						view.isActive
					) {
						let initPage = location.origin + location.pathname;
						view.loadURL(initPage);
					}
				}
			} catch (e) {
				console.log(e);
			}
		}
	},
	mounted() {
		this.logoutToggle = true
	}
};
</script>

<style scoped>
.isCreateChannel {
	width: 100%;
	height: 100%;
}
</style>

