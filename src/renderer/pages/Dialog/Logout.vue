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
			const vm = this;
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
						const notClear = [
							"waitForUploadOrderList",
							"uploadTask",
							"localStatus",
							"showSmallContract"
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
						// window.localStorage.clear();
						this.logoutUploadViews();
						this.$emit('logoutCb');
						this.closeDialog();
					} else {
						this.$message.error(this.$t(`error[${res.Error}]`));
					}
				})
				.catch(err => {
					console.error(err);
					if (err.message.includes("timeout")) {
						this.$message.error("Request Timeout!");
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

