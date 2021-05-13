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
				<h2>{{$t('dialog.warning')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content logout-loading">
				<div class="mb20">
					<p class="mt20 ft14 text-center break-word">{{$t('dialog.pleaseEnsureThatThePrivateKeyFileIsProperlyStoredBeforeExiting')}}</p>
				</div>
				<div slot="footer">
					<ripper-button @click="closeDialog">{{$t('public.cancel')}}</ripper-button>
					<ripper-button
						type="primary"
						class="primary ml10"
						@click="logout"
					>{{$t('dialog.logout')}}</ripper-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { ipcRenderer, remote } from "electron";
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
		async logout() {
			const vm = this;
			vm.logoutLoding = vm.$loading({
				text: vm.$t("fileManager.transferTaskPausing"),
				target: ".loading-content.logout-loading",
				lock: true
			});

			let falg = await vm.$parent.logoutPauseAllTask();
			if (!falg) {
				vm.logoutLoding && vm.logoutLoding.close();
				this.$message.error(this.$t(`dialog.taskNotPauseWaitForOpeation`));
				return;
			}
			vm.logoutLoding && vm.logoutLoding.close();

			this.$axios
				.post(
					this.$api.account + "/logout",
					{},
					{
						loading: {
							text: vm.$t("dialog.loggingOut"),
							target: ".loading-content.logout-loading"
						}
					}
				)
				.then(res => {
					if (res.Error === 0) {
						ipcRenderer.send("run-dialog-event", {
							name: "setIsLoginShowLog",
							data: false
						});
						ipcRenderer.send("run-dialog-event", {
							name: "setLoginStatus",
							data: false
						});
						// "waitForUploadOrderList",
						// "waitForDownloadOrderList",
						const notClear = [
							"uploadTask",
							"downloadTask",
							"localStatus",
							"showSmallContract",
							"downloadDoneList",
							"uploadDoneList"
						];
						outer: for (let value in window.localStorage) {
							if (!window.localStorage.propertyIsEnumerable(value)) continue;
							for (let notClearItem of notClear) {
								if (value.startsWith(notClearItem)) {
									continue outer;
								}
							}
							window.localStorage.removeItem(value);
						}
						ipcRenderer.sendSync("initUsermetaDB", ""); // set Usermeta db,because you has been logout
						remote.getCurrentWindow() &&
							ipcRenderer.sendTo(
								remote.getCurrentWindow().webContents.id,
								"updatePlugin"
							);
						this.logoutUploadViews();
						this.$emit("logoutCb");
						this.closeDialog();
						ipcRenderer.send("setApp", {key: 'Address', value: ''});
					} else {
						this.$message.error(this.$t(`error[${res.Error}]`));
					}
				})
				.catch(err => {
					console.error(err);
					if (err.message.includes("timeout")) {
						this.$message.error(this.$t('error.requestTimeout'));
					}
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

