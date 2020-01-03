<template>
	<div id="settings">
		<!-- <div class="settings-box">
			<div class="ft20">{{$t('settings.setting')}}</div>
		</div> -->
		<h2 class="ft20 settings-title">
			{{$t('settings.setting')}}
		</h2>
		<div class="settings-content">
			<div class="settings-box">
				<div class="tag">
					<span>{{$t('settings.chainEnvironment')}}</span>
					<div class="tertiary-font-color">{{$t('settings.selectChainEnvironment')}}</div>
				</div>
				<el-select
					v-model="settings.ChainId"
					@change="switchChainId(settings.ChainId)"
				>
					<el-option
						v-for="(item,index) in netConfig.list"
						:key="index"
						:label='(netConfig.default[item] && $t(`settings["${netConfig.default[item]}"]`)) || $t("settings.private")+" (" + item +")"'
						:value="item"
					></el-option>
				</el-select>
			</div>
			<div class="settings-box">
				<div class="tag">{{$t('settings.autoOpenDevTools')}}</div>
				<el-select
					v-model="settings.console"
					@change="updateSettings('console',settings.console)"
				>
					<el-option
						:label="$t('public.open')"
						:value="true"
					></el-option>
					<el-option
						:label="$t('public.close')"
						:value="false"
					></el-option>
				</el-select>
			</div>
			<div class="settings-box">
				<div class="tag">{{$t('settings.maxUploadLength')}}</div>
				<!-- <el-select
					v-model="settings.maxNumUpload"
					@change="frontConfigUploadRender"
				>
					<el-option
						v-for="item in maxUploadLimitList"
						:key="item"
						:label="item"
						:value="item"
					></el-option>
				</el-select> -->
				<div class="flex ai-center">
					<el-slider
						v-model="settings.maxNumUpload"
						@change="frontConfigUploadRender"
						:max="10"
						:min="1"
					></el-slider>
					<div
						style="width: 24px;"
						class="ml10 ftpx14"
					>
						{{settings.maxNumUpload}}
					</div>
				</div>
			</div>
			<div class="settings-box">
				<div class="tag">{{$t('settings.maxPeerNum')}}</div>
				<div class="flex ai-center">
					<el-slider
						v-model="settings.maxPeerNum"
						@change="updateSettings('maxPeerNum',settings.maxPeerNum)"
						:max="20"
					></el-slider>
					<div
						style="width: 24px;"
						class="ml10 ftpx14"
					>
						{{settings.maxPeerNum}}
					</div>
				</div>
			</div>
			<div class="settings-box">
				<div class="tag">
					<p>{{$t('settings.downloadPath')}}</p>
					<p
						:title="pathDir.DownloadPath"
						class="pathdir tertiary-font-color"
					>{{pathDir.DownloadPath}}</p>
				</div>
				<el-button @click="setDir('DownloadPath')">{{$t('settings.change')}}</el-button>
			</div>
			<div class="settings-box">
				<div class="tag">
					<p>{{$t('settings.language')}}</p>
				</div>
				<el-select
					v-model="settings.lang"
					@change="setLang"
				>
					<el-option
						v-for="item in langList"
						:key="item.id"
						:label='$t(`settings["${item.label}"]`)'
						:value="item.id"
					></el-option>
				</el-select>
			</div>
			<div class="settings-box">
				<div class="tag">
					<p>{{$t('settings.themeColor')}}</p>
				</div>
				<ul class="img-selector">
					<li
						class="img-selector-item"
						@click="setTheme('light')"
					>
						<img
							:class="{'theme-selected':settings.themeColor==='light'}"
							src="../assets/images/theme_light.png"
						>
						<p class="dark-grey tag text-center mt10">{{$t('settings.theme.light')}}</p>
					</li>
					<li
						class="img-selector-item"
						@click="setTheme('dark')"
					>
						<img
							:class="{'theme-selected':settings.themeColor==='dark'}"
							src="../assets/images/theme_dark.png"
						>
						<p class="dark-grey tag text-center mt10">{{$t('settings.theme.dark')}}</p>
					</li>
				</ul>
				<!-- <el-select
					v-model="settings.themeColor"
					@change="setTheme"
				>
					<el-option
						v-for="item in themeList"
						:key="item"
						:label='item'
						:value="item"
					></el-option>
				</el-select> -->
			</div>
		</div>
	</div>
</template>
<script>
import { ipcRenderer, remote } from "electron";
import { DEFAULT_CHAINID } from "../../main/windowManager/defaultOption";
export default {
	mounted() {
		document.title = this.$t("settings.settings");
		this.getSettingsAll();
		this.getChainList();
		this.getChainId();
		this.getConfig();
	},
	data() {
		return {
			switchToggle: {
				console: true
			},
			pathDir: {
				DownloadPath: ""
			},
			themeList: ["dark", "light"],
			settings: {},
			netConfig: {
				list: [],
				default: {
					"0": "DevNet",
					"1": "TestNet",
					"2": "MainNet"
				}
			},
			maxUploadTimeoutObj: null,
			langList: [
				{
					id: "en",
					label: "English"
				},
				{
					id: "zh",
					label: "Chinese"
				}
			]
		};
	},
	watch: {
		lang() {
			document.title = this.$t("settings.settings");
		}
	},
	computed: {
		lang() {
			return this.$i18n.locale;
		},
		themeColor() {
			return this.$store.state.Home.themeColor;
		}
	},
	methods: {
		setLang() {
			const vm = this;
			vm.$i18n.locale = vm.settings.lang || "en";
			document.title = this.$t("settings.settings");
			this.updateSettings("lang", vm.settings.lang);
			ipcRenderer.send("run-dialog-event", {
				name: "toSetLang",
				data: vm.settings.lang
			});
		},
		setTheme(theme) {
			setTimeout(() => {
				for (let win of remote.BrowserWindow.getAllWindows()) {
					console.log(win.webContents.getURL());
					ipcRenderer.sendTo(
						win.webContents.id,
						"set-theme",
						this.settings.themeColor
					);
					if (win.views) {
						const views = win.views;
						for (let view of views) {
							let viewContentId = view.browserView.webContents.id;
							ipcRenderer.sendTo(
								viewContentId,
								"set-theme",
								this.settings.themeColor
							);
						}
					}
					if (win.driftViews) {
						const driftViews = win.driftViews;
						for (let driftView of driftViews) {
							try {
								let driftViewContentId = driftView.browserView.webContents.id;
								ipcRenderer.sendTo(
									driftViewContentId,
									"set-theme",
									this.settings.themeColor
								);
							} catch (error) {
								console.log(error);
							}
						}
					}
				}
			}, 500);
			this.settings.themeColor = theme;
			this.updateSettings("themeColor", this.settings.themeColor);
		},
		getSettingsAll() {
			this.settings = ipcRenderer.sendSync("getAllSettings");
		},
		frontConfigUploadRender() {
			const vm = this;
			clearTimeout(this.maxUploadTimeoutObj);
			this.maxUploadTimeoutObj = setTimeout(() => {
				let views = {};
				ipcRenderer.send("run-dialog-event", {
					name: "settingUpdate",
					data: vm.settings
				});
				for (let win of remote.BrowserWindow.getAllWindows()) {
					if (win.views) {
						views = win.views;
						for (let view of views) {
							if (view.displayURL.indexOf("seek://") === 0) {
								let winContentId = view.browserView.webContents.id;
								ipcRenderer.sendTo(winContentId, "get-data", {
									result: vm.settings,
									type: "frontConfig"
								});
							}
						}
					}
				}
				this.updateSettings("maxNumUpload", this.settings.maxNumUpload);
			}, 500);
		},
		updateSettings(key, value) {
			try {
				const result = ipcRenderer.sendSync("updateSettings", key, value);
			} catch (error) {}
		},
		getChainList() {
			this.$axios
				.get(this.$api.getchainidlist)
				.then(res => {
					if (res.Error === 0) {
						this.netConfig.list = res.Result.Ids;
					}
				})
				.catch(error => {
					if (error.message.includes("timeout")) {
						this.$message.error("Request Timeout!");
					}
				});
		},
		getChainId() {
			this.$axios
				.get(this.$api.chainId)
				.then(res => {
					if (res.Error === 0) {
						if (res.Result.ChainId) {
							this.updateSettings("ChainId", res.Result.ChainId);
							this.settings.ChainId = res.Result.ChainId;
						} else {
							this.switchChainId(DEFAULT_CHAINID);
						}
					} else {
						if (res.Error !== 40007) {
							this.$message.error(this.$t(`error[${res.Error}]`));
						}
					}
				})
				.catch(error => {
					if (error.message.includes("timeout")) {
						this.$message.error("Request Timeout!");
					}
					s;
				});
		},
		getConfig() {
			this.$axios
				.get(this.$api.config)
				.then(res => {
					console.log("config is ");
					console.log(res);
					Object.assign(this.pathDir, res.Result);
				})
				.catch(error => {
					if (error.message.includes("timeout")) {
						this.$message.error("Request Timeout!");
					}
				});
		},
		switchChainId(id) {
			const vm = this;
			console.log("switch chainid", id);
			this.$axios
				.post(
					this.$api.switchChainId,
					{
						ChainId: id
					},
					{
						loading: {
							text: vm.$t("fileManager.loading"),
							target: ".settings-content"
						}
					}
				)
				.then(res => {
					if (res.Error === 0) {
						this.updateSettings("ChainId", id);
						this.settings.ChainId = id;
						this.$message({
							message: vm.$t("settings.switchSuccess"),
							type: "success"
						});
					} else {
						this.$message.error(this.$t(`error[${res.Error}]`));
					}
				})
				.catch(error => {
					if (error.message.includes("timeout")) {
						this.$message.error("Request Timeout!");
					}
				});
		},
		setDir(pathType) {
			ipcRenderer.send("will-set-dir");
			ipcRenderer.once("did-set-dir", (event, dir) => {
				this.$axios
					.post(this.$api.config, { [pathType]: dir })
					.then(res => {
						if (res.Error === 0) {
							this.pathDir[pathType] = dir;
						}
					})
					.catch(error => {
						if (error.message.includes("timeout")) {
							this.$message.error("Request Timeout!");
						}
					});
			});
		}
	}
};
</script>
<style lang="scss">
#settings {
	padding-top: 20px;
	min-height: 100%;
	.settings-title {
		width: 60%;
		margin: 0px auto 10px;
		@extend .theme-font-color;
	}

	.settings-content {
		width: 60%;
		margin: 0px auto 0px;
		border-radius: 6px;
		padding: 20px 60px;
		@include themify {
			background-color: $card-color;
			box-shadow: $card-shadow;
		}

		.settings-box {
			@extend .theme-font-color;
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-bottom: solid 1px rgba(125, 125, 125, 0.1);
			padding: 20px 0px;
			.tag {
				// font-size: 14px;
				font-size: 1.4rem;
				.pathdir {
					width: 400px;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}
			.img-selector {
				display: flex;
				.theme-selected {
					border: 2px solid #2f8ff0;
					border-radius: 4px;
				}
				& > li {
					margin: 0 5px;
					img {
						width: 130px;
						height: 90px;
						box-sizing: border-box;
						overflow: hidden;
					}
				}
			}
			.el-slider {
				width: 200px;
			}
			.el-select {
				input {
					width: 200px;
					border: 1px solid rgba(4, 15, 57, 0.2);
					border-radius: 2px;
				}
			}
		}
	}
}
</style>