<template>
	<div class="about-client">
		<el-dialog
			width='450px'
			:before-close="closeDialog"
			:close-on-click-modal='false'
			:visible.sync="aboutClient"
			center
		>
			<div slot="title">
				<img
					src="../../assets/images/home_seeker.svg"
					alt=""
					width="70"
					class="about_logo"
				>
				<p class="mt10 ft20 bold theme-font-color">About Seeker</p>
				<p class="grey-xs mt10 mb5">Seeker Version: {{currentClientVersion}} </p>
				<p class="grey-xs">Edge Version : {{localStorage.getItem("edgeVersion") || ""}}</p>
			</div>
			<div class="loading-content">
				<p
					class="flex jc-center ai-center mb5"
					v-show="updateState === -1"
				>{{$t('plugin.theCurrentVersionIsTheLatestVersion')}}</p>
				<p
					class="flex jc-center ai-center mb5"
					v-show="updateState === -3"
				>{{$t('public.networkError')}}</p>
				<div
					class="update-info"
					v-if="updateState >=0 || updateState === null"
				>
					<p class="tl flex ai-center mb5"><span class="point mr5"></span> New Version: {{pluginNeedUpdate.Version}}</p>
					<el-input
						type="textarea"
						class="update-info-changelog theme-bg"
						:value="pluginNeedUpdate.ChangeLog[lang.toUpperCase()]"
						resize="none"
						readonly
					>
					</el-input>
				</div>
				<el-progress
					v-if="pluginDetail"
					class="plugin-progress"
					:class="{'progressAnimate': (pluginDetail.Status == 1 )|| (pluginDetail.Status == 2)}"
					:percentage="Math.ceil(pluginDetail.Progress * 100)"
					:stroke-width="2"
					:show-text="false"
				></el-progress>
				<ripper-button
					class="primary mt10"
					@click="buttonEvent"
				>{{buttonText}}</ripper-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { version, clientUrl } from "../../../../package.json";
import { ipcRenderer, shell } from "electron";
const remote = require('@electron/remote')
import fs from "fs";
export default {
	mounted() {
		this.aboutClient = true;
		this.setUpdateState();
	},
	data() {
		return {
			currentClientVersion: version,
			clientUrl,
			localStorage,
			pluginNeedUpdate: JSON.parse(localStorage.getItem("lastVersion")) || {},
			pluginDetail: null,
			/**
			 * null, need to update
			 * -3 net work error
			 * -2 ready to check
			 * -1 lasted(no need update)
			 * 0 pausing
			 * 1 downloading
			 * 2 downloading
			 * 3 start install 4 error
			 */
			updateState: -2,
			buttonText: this.$t("public.checkUpdate"),
			aboutClient: false
		};
	},
	methods: {
		closeDialog() {
			this.$emit("closeDialog", { timeout: 0 });
		},
		buttonEvent() {
			this.checkUpdate();
		},
		async checkUpdate() {
			let result = await this.$checkClientVersion(); // to do
			console.log("result is");
			console.log(result);
			if (!result) {
				// this.updateState = -3;
				this.$message.error(this.$t("public.networkError"));
				return;
			}
			if (this.currentClientVersion >= result.Version) {
				this.updateState = -1;
				return;
			}
			this.pluginNeedUpdate = result;
			this.setUpdateState();
		},
		async setUpdateState() {
			if (this.pluginNeedUpdate.Version) {
				if (this.pluginNeedUpdate.Version <= this.currentClientVersion) {
					this.updateState = -1;
					return;
				}
				let detail = await this.getClientTransferDetail(
					this.pluginNeedUpdate.Url
				);
				detail = detail.Result;
				this.pluginDetail = detail; // current seeker client transferDetail
				if (detail && detail.Status === 3) {
					if (fs.existsSync(detail.Path)) {
						this.updateState = 3;
					} else {
						this.updateState = null;
					}
				} else {
					this.updateState = detail ? detail.Status : null;
				}
			} else {
				this.updateState = -2; // ready to update
			}
		},
		downloadClient() {
			this.$download({
				Url: this.clientUrl,
				MaxPeerNum: ipcRenderer.sendSync("getSettings", "maxPeerNum"),
				SetFileName: true
			})
				.then(res => {
					if (res.Error === 0) {
						this.$message({
							message: this.$t("plugin.startDownload"),
							type: "success"
						});
						this.updateState = 1; // to do
					} else {
						console.log("emit loadErrorPage");
						this.$message.error(this.$t(`error[${res.Error}]`));
						this.updateState = -2; // to do
					}
				})
				.catch(error => {
					if (error.message.includes("timeout")) {
						this.$message.error(this.$t('error.requestTimeout'));
					}
					this.updateState = -2; // to do
				});
		},
		downloadResume(id) {
			this.$axios
				.post(this.$api.downloadResume, {
					Ids: [id]
				})
				.then(res => {
					if (res.Error === 0) {
					}
				})
				.catch(error => {
					if (error.message.includes("timeout")) {
						this.$message.error(this.$t('error.requestTimeout'));
					}
				});
		},
		downloadPluginRetry(id) {
			this.$axios
				.post(this.$api.downloadRetry, {
					Ids: [id]
				})
				.then(res => {
					if (res.Error === 0) {
						this.$message({
							message: this.$t("plugin.startDownload"),
							type: "success"
						});
					}
				})
				.catch(error => {
					if (error.message.includes("timeout")) {
						this.$message.error(this.$t('error.requestTimeout'));
					}
				});
		},
		async getClientTransferDetail(url) {
			const hexUrl = ipcRenderer.sendSync("string-to-hex", url);
			return new Promise((resolve, reject) => {
				this.$axios
					.get(this.$api.transferDetail + `/3/${hexUrl}`)
					.then(res => {
						resolve(res);
					})
					.catch(err => {
						if (err.message.includes("timeout")) {
							this.$message.error(this.$t('error.requestTimeout'));
						}
						reject(err);
					});
			});
		}
	},
	watch: {
		updateState(val) {
			switch (val) {
				case null:
					this.buttonText = this.$t("plugin.startUpdate");
					this.buttonEvent = this.downloadClient.bind(this);
					break;
				case -3:
					this.buttonText = this.$t("public.checkUpdate");
					this.buttonEvent = this.checkUpdate.bind(this);
					break;
				case -2:
					this.buttonText = this.$t("public.checkUpdate");
					this.buttonEvent = this.checkUpdate.bind(this);
					break;
				case -1:
					this.buttonText = this.$t("public.checkUpdate");
					this.buttonEvent = this.checkUpdate.bind(this);
					break;
				case 0:
					this.buttonText = this.$t("plugin.continue");
					this.buttonEvent = this.downloadResume.bind(
						this,
						this.pluginDetail.Id
					);
					break;
				case 1:
					this.buttonText = this.$t("plugin.downloading");
					this.buttonEvent = () => {};
					break;
				case 2:
					this.buttonText = this.$t("plugin.downloading");
					this.buttonEvent = () => {};
					break;
				case 3:
					this.buttonText = this.$t("plugin.startInstall");
					this.buttonEvent = () => {
						shell.openItem(this.pluginDetail.Path);
						remote.app.quit();
					}; // to do
					break;
				case 4:
					this.buttonText = this.$t("plugin.retry");
					this.buttonEvent = this.downloadPluginRetry.bind(
						this,
						this.pluginDetail.Id
					);
					break;
				default:
					this.buttonText = this.$t("public.checkUpdate");
					this.buttonEvent = this.checkUpdate.bind(this);
					break;
			}
		},
		downloadingTransferList(val) {
			for (let index = 0; index < val.length; index++) {
				if (val[index].Url === this.clientUrl) {
					this.updateState = val[index].Status;
					break;
				}
			}
		},
		completeTransferList(val) {
			for (let index = 0; index < val.length; index++) {
				if (val[index].Url === this.clientUrl) {
					this.pluginDetail = val[index];
					this.updateState = val[index].Status;
					break;
				}
			}
		}
	},
	computed: {
		// downloading file
		lang: function() {
			return this.$i18n.locale;
		},
		downloadingTransferList() {
			return this.$store.state.Transfer.downloadingTransferList || [];
		},
		completeTransferList() {
			return this.$store.state.Transfer.completeTransferList || [];
		}
	}
};
</script>
<style lang="scss">
.about-client {
	.about_logo {
		margin-top: 20px;
	}
	.update-info {
		margin-bottom: 20px;
		.update-info-changelog {
			.el-textarea__inner {
				border: none;
			}
			@extend .grey-xs;
		}
		.point {
			@include custom-point(rgb(235, 139, 126), 6px) {
				margin: 2px 5px 2px 2px;
			}
		}
	}
}
</style>

