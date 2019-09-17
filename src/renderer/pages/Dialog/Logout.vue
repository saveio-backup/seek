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
			<div class="loading-content logout-loading">
				<div class="mb20">
					<p class="mt20 text-center break-word">Please ensure that the private key(WIF) file is properly stored before exiting.</p>
				</div>
				<div slot="footer">
					<ripper-button @click="closeDialog">Cancel</ripper-button>
					<ripper-button
						type="primary"
						class="primary"
						@click="logout"
					>Logout</ripper-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { ipcRenderer, dialog, remote } from "electron";
export default {
	name: "Logout",
	data() {
		return {
			logoutToggle: false,
			logoutLoding: null,
			win: remote.getCurrentWindow()
		};
	},
	methods: {
		closeDialog() {
			this.$emit("closeDialog", { timeout: 0 });
		},
		logout() {
			this.$axios
				.post(
					this.$api.account + "/logout",
					{},
					{
						loading: {
							text: "logging out",
							target: ".loading-content.logout-loading"
						}
					}
				)
				.then(res => {
					if (res.Error === 0) {
						window.localStorage.clear();
						this.logoutUploadViews();
						this.closeDialog();
					} else {
						this.$message.error(
							this.$i18n.error[res.Error]
								? this.$i18n.error[res.Error][this.$language]
								: `error code is ${res.Error}`
						);
					}
				})
				.catch(err => {
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
		this.logoutToggle = true;
	}
};
</script>

<style scoped>
.logout {
	width: 100%;
	height: 100%;
}
</style>

