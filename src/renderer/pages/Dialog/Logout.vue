<template>
	<div class="logout">
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
					<p class="mt20 text-center">Please ensure that the private key file is properly stored before exiting.</p>
				</div>
				<div slot="footer">
					<el-button
					 type="primary"
           class="primary"
					 @click="logout"
					>Logout</el-button>
					<el-button @click="closeDialog">Cancel</el-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { ipcRenderer, dialog, remote } from "electron";
import { setTimeout } from "timers";
export default {
	name: "Logout",
	data() {
		return {
			logoutToggle: true,
			logoutLoding: null,
			win: remote.getCurrentWindow()
		};
	},
	methods: {
		closeDialog() {
			this.$emit("closeDialog", { timeout: 0 });
		},
		logout() {
			// this.logoutUploadViews();return;
			this.logoutLoding = this.$loading({
				lock: true,
				text: "logging out",
				target: ".loading-content"
			});
			this.$axios
				.post(this.$api.account + "/logout", {})
				.then(res => {
					this.logoutLoding.close();
					if (res.data.Desc === "SUCCESS" && res.data.Error === 0) {
						window.localStorage.clear();
						this.logoutUploadViews();
						this.closeDialog();
						// ipcRenderer.send("open-info-dialog", { info: "Logout Success!" });
					} else {
						this.$message.error(res.data.Desc);
					}
				})
				.catch(err => {
					this.logoutLoding.close();
					console.error(err);
				});
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
	}
};
</script>

<style scoped>
.logout {
	width: 100%;
	height: 100%;
}
</style>

