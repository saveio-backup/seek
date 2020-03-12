<template>
	<div id="plugin">
		<div class="container-fluid">
			<ul class="plugin-items theme-font-color row">
				<li
					v-for="(plugin,index) in plugins"
					:key="index"
					class="plugin-item col-md-4 col-lg-3"
				>
					<div class="card">
						<el-switch
							v-model="plugin.isShow"
							v-if="plugin.detail && (plugin.detail.Progress >= 1)"
							@change="setIsShow(plugin)"
						></el-switch>
						<img
							:src="plugin.Img"
							alt="save"
						>
						<h3>{{plugin.Title}}</h3>
						<p :title="plugin.ChangeLog[lang.toUpperCase()]">{{plugin.ChangeLog[lang.toUpperCase()]}}</p>
						<div v-if="plugin.detail">
							<ripper-button
								class="primary"
								v-if="(plugin.detail.Status === 3) && (plugin.isNeedUpdate === false)"
								@click="openPlugin(plugin.Url,plugin)"
							>{{$t("plugin.open")}}</ripper-button>
							<ripper-button
								class="primary"
								v-if="plugin.detail.Status===4"
								@click="downloadPluginRetry(plugin.Url,plugin)"
							>{{$t("plugin.retry")}}</ripper-button>
							<ripper-button
								class="primary"
								v-if='(plugin.detail.Status ===1) || (plugin.detail.Status ===2)'
							>{{$t("plugin.installing")}}</ripper-button>
							<ripper-button
								class="primary"
								@click="downloadResume(plugin.detail.Id)"
								v-if="plugin.detail.Status ===0"
							>{{$t("plugin.continue")}}</ripper-button>
							<ripper-button
								class="primary"
								@click="downloadPlugin(plugin.Url,plugin)"
								v-if="plugin.isNeedUpdate === true"
							>{{$t("plugin.update")}}</ripper-button>
							<ripper-button
								class="primary"
								v-if="plugin.detail.Progress >= 1"
								@click="openConfirmDeletePlugin(plugin)"
							>{{$t("plugin.uninstall")}}</ripper-button>
						</div>
						<ripper-button
							class="primary"
							@click="downloadPlugin(plugin.Url,plugin)"
							v-else
						>{{$t("plugin.install")}}</ripper-button>
						<el-progress
							v-if="plugin.detail"
							class="plugin-progress"
							:class="{'progressAnimate': (plugin.detail.Status == 1 )|| (plugin.detail.Status == 2)}"
							:percentage="Math.ceil(plugin.detail.Progress * 100)"
							:stroke-width="2"
							:show-text="false"
						></el-progress>
					</div>
				</li>
			</ul>
		</div>
		<el-dialog
			width="600px"
			:close-on-click-modal='false'
			class="download-file-detail"
			:visible.sync="switchToggle.confirmDeletePluginDialog"
			center
		>
			<div slot="title">
				<h2>{{$t('plugin.uninstall')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content confirm-cancel-download-dialog">
				<p class="mb20 mt10">
					{{$t('plugin.areYouSureYouWantToUninstallTheSelectedPlugin')}}
				</p>
				<div slot="footer">
					<ripper-button
						type="primary"
						@click="switchToggle.confirmDeletePluginDialog=false"
					>{{$t('public.cancel')}}</ripper-button>
					<ripper-button
						class="primary ml10"
						type="primary"
						@click="deletePlugin(pluginSelected)"
					>{{$t('public.confirm')}}</ripper-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { ipcRenderer, remote } from "electron";
import fs from "fs";
import path from "path";
const G_plugins = [
	{
		Url: "oni://www.explorer.com",
		FileHash: "",
		Platform: "1",
		img: "https://i.loli.net/2019/11/18/tjBDFyKTpQsXuza.png",
		title: "Explorer",
		changeLog: {
			en:
				"ONI Explorer is a plug-in that queries ONI block, transaction, ONI token, wallet, storage space and other information, and updates all ONI node information in real time.",
			zh:
				"ONI区块浏览器是一个查询ONI区块、交易、ONI代币、钱包、存储空间等信息的插件,实时同步更新ONI所有节点信息"
		},
		progress: 0,
		detail: null
	}
];
export default {
	data() {
		return {
			plugins: [],
			pluginSelected: null,
			taskByUrl: {},
			switchToggle: {
				confirmDeletePluginDialog: false
			}
		};
	},
	mounted() {
		const vm = this;
		ipcRenderer.on("dialog-load", e => {
			vm.attach();
		});
		vm.attach();
		document.title = this.$t("plugin.plugin");
		this.newCheckPluginInfos();
		// document.addEventListener("visibilitychange", () => {
		// 	if (document.visibilityState === "visible") this.sendPluginInfo();
		// });
		this.$store.dispatch("setCurrentAccount"); // get login status
	},
	computed: {
		lang: function() {
			return this.$i18n.locale;
		},
		// downloading file
		downloadingTransferList() {
			return this.$store.state.Transfer.downloadingTransferList || [];
		},
		completeTransferList() {
			return this.$store.state.Transfer.completeTransferList || [];
		}
	},
	methods: {
		deleteFolderRecursive(path) {
			if (fs.existsSync(path)) {
				fs.readdirSync(path).forEach(file => {
					var curPath = path + "/" + file;
					if (fs.lstatSync(curPath).isDirectory()) {
						// recurse
						this.deleteFolderRecursive(curPath);
					} else {
						// delete file
						fs.unlinkSync(curPath);
					}
				});
				fs.rmdirSync(path);
			}
		},
		attach() {
			ipcRenderer.send("run-dialog-event", {
				name: "attach",
				data: {
					names: ["progress", "account", "downloadList", "completeList"],
					id: remote.getCurrentWebContents().id
				}
			});
		},
		setIsShow(plugin) {
			const localUrlPlugins = ipcRenderer.sendSync(
				"getUsermeta",
				"LocalUrlPlugins"
			);
			localUrlPlugins[plugin.Url] = plugin;
			ipcRenderer.sendSync("setUsermeta", "Plugins", this.plugins);
			ipcRenderer.sendSync("setUsermeta", "LocalUrlPlugins", localUrlPlugins);
			this.sendPluginInfo();
		},
		sendPluginInfo() {
			remote.getCurrentWindow() &&
				ipcRenderer.sendTo(
					remote.getCurrentWindow().webContents.id,
					"updatePlugin"
				);
		},
		async getPluginInfos() {
			return new Promise((resolve, reject) => {
				this.$axios.get(this.$api.plugininfos).then(res => {
					resolve(res);
				});
			});
		},
		async newCheckPluginInfos() {
			let plugins = await this.getPluginInfos();
			plugins = plugins.Result;
			const pluginInstaled = [];
			const localUrlPlugins = ipcRenderer.sendSync(
				"getUsermeta",
				"LocalUrlPlugins"
			);
			console.log("localUrlPlugins is");
			console.log(localUrlPlugins);
			for (let i = 0; i < plugins.length; i++) {
				if (
					// set isShow, if localUrlPlugins[plugins[i].Url] exists
					localUrlPlugins[plugins[i].Url] &&
					localUrlPlugins[plugins[i].Url].isShow === false
				) {
					plugins[i].isShow = false;
				} else {
					plugins[i].isShow = true;
				}
				if (this.isPluginExist(plugins[i].Url, localUrlPlugins)) {
					console.log(
						"isPluginExist is true,Plugins is exist in DB, and plugins[i] is"
					);
					console.log(plugins[i]);
					plugins[i].detail = localUrlPlugins[plugins[i].Url].detail;
					if (
						// if filehash is lastest, just update infoi
						plugins[i].FileHash !==
						localUrlPlugins[plugins[i].Url].detail.FileHash
					) {
						localUrlPlugins[plugins[i].Url] = plugins[i]; // update info (not plugin)
						plugins[i].isNeedUpdate =
							plugins[i].detail.Status === 3 ? true : false; // need update plugin;
					} else {
						plugins[i].isNeedUpdate = false; // no need  to update plugin;
					}
					pluginInstaled.push(plugins[i]);
				} else {
					const detail = await this.isPluginInTransferDetail(plugins[i].Url);
					if (detail) {
						plugins[i].detail = detail;
						localUrlPlugins[plugins[i].Url] = plugins[i];
						pluginInstaled.push(plugins[i]);
					} else {
						delete localUrlPlugins[plugins[i].Url]; // no longer exists, there is no need to save the local database.
						plugins[i].detail = null;
					}
				}
				this.$set(this.plugins, i, plugins[i]);
			}
			ipcRenderer.sendSync("setUsermeta", "Plugins", pluginInstaled);
			ipcRenderer.sendSync("setUsermeta", "LocalUrlPlugins", localUrlPlugins);
		},
		isPluginExist(pluginUrl, localUrlPlugins) {
			console.log("localUrlPlugins[pluginUrl] is");
			console.log(localUrlPlugins[pluginUrl]);
			if (
				localUrlPlugins[pluginUrl] &&
				localUrlPlugins[pluginUrl].detail &&
				localUrlPlugins[pluginUrl].detail.Progress == 1 &&
				fs.existsSync(localUrlPlugins[pluginUrl].detail.Path)
			) {
				return true;
			} else {
				return false;
			}
		},
		/**
		 * if plugin loaded from 'Enter address to load', we should update LocalUrlPlugins
		 */
		async isPluginInTransferDetail(pluginUrl) {
			console.log("exec isPluginInTransferDetail");
			let detail = await this.getTransferDetail(pluginUrl);
			detail = detail.Result;
			if (detail && fs.existsSync(detail.Path)) {
				return detail;
			} else {
				return false;
			}
		},
		openPlugin(url, plugItem) {
			// window.open(url);
			Seek.openThirdPage(url);
		},
		downloadPlugin(url, plugItem) {
			this.$axios
				.post(this.$api.download, {
					Url: url,
					MaxPeerNum: ipcRenderer.sendSync("getSettings", "maxPeerNum"),
					SetFileName: true
				})
				.then(res => {
					if (res.Error === 0) {
						this.$message({
							message: this.$t("plugin.startDownload"),
							type: "success"
						});
					} else {
						console.log("emit loadErrorPage");
						this.$message.error(this.$t(`error[${res.Error}]`));
					}
				})
				.catch(error => {
					if (error.message.includes("timeout")) {
						this.$message.error("Request Timeout!");
					}
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
						this.$message.error("Request Timeout!");
					}
				});
		},
		downloadPluginRetry(url, pluginItem) {
			this.$axios
				.post(this.$api.downloadRetry, {
					Ids: [pluginItem.detail.Id]
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
						this.$message.error("Request Timeout!");
					}
				});
		},
		getTransferDetail(url) {
			const hexUrl = ipcRenderer.sendSync("string-to-hex", url);
			return new Promise((resolve, reject) => {
				this.$axios
					.get(this.$api.transferDetail + `/3/${hexUrl}`)
					.then(res => {
						resolve(res);
					})
					.catch(err => {
						if (err.message.includes("timeout")) {
							this.$message.error("Request Timeout!");
						}
						reject(err);
					});
			});
		},
		getHashByUrl(url) {
			const hexUrl = ipcRenderer.sendSync("string-to-hex", url);
			return new Promise((resolve, rejest) => {
				this.$axios
					.get(this.$api.getHashByUrl + `/${hexUrl}`)
					.then(res => {
						resolve(res);
					})
					.catch(err => {
						if (err.message.includes("timeout")) {
							this.$message.error("Request Timeout!");
						}
						rejest(err);
					});
			});
		},
		openConfirmDeletePlugin(plugin) {
			this.pluginSelected = plugin;
			this.switchToggle.confirmDeletePluginDialog = true;
		},
		deletePlugin(plugin) {
			const dir = path.parse(plugin.detail.Path).dir;
			const subDir = encodeURIComponent(plugin.detail.Url);
			const finalPath = path.join(dir, subDir);
			this.$axios
				.post(this.$api.deletedownloadfile, {
					Hash: plugin.detail.FileHash
				})
				.then(res => {
					if (res.Error === 0) {
						console.log("delete file is");
						console.log(res);
						plugin.detail = null;
						// delete unzip file dir
						this.deleteFolderRecursive(finalPath);
						this.switchToggle.confirmDeletePluginDialog = false;
					}
				});
		}
	},
	watch: {
		downloadingTransferList(val) {
			if (!this.plugins.length) return;
			console.log("downloading changed");
			console.log(val);
			let taskByUrl = {};
			const localUrlPlugins = ipcRenderer.sendSync(
				"getUsermeta",
				"LocalUrlPlugins"
			);
			for (let index = 0; index < val.length; index++) {
				// const task = val[index];
				taskByUrl[val[index].Url] = val[index];
			}
			for (let i = 0; i < this.plugins.length; i++) {
				const pluginItem = this.plugins[i];
				pluginItem.detail = taskByUrl[pluginItem.Url]
					? taskByUrl[pluginItem.Url] // if plugin in in task, replace it with task
					: localUrlPlugins[pluginItem.Url]
					? localUrlPlugins[pluginItem.Url].detail
					: null; // if plguin is not in task, will reset to localUrlPlugins
			}
		},
		completeTransferList(val) {
			if (!this.plugins.length) return;
			console.log("complete transfer");
			console.log(val);
			let taskByUrl = {};
			for (let i = 0; i < val.length; i++) {
				// const task = val[i];
				if (!val[i].IsUploadAction) taskByUrl[val[i].Url] = val[i];
			}
			const pluginsTemp = [];
			// const localUrlPluginsTemp = {};
			const localUrlPlugins = ipcRenderer.sendSync(
				"getUsermeta",
				"LocalUrlPlugins"
			);
			for (let i = 0; i < this.plugins.length; i++) {
				const pluginItem = this.plugins[i];
				pluginItem.detail = taskByUrl[pluginItem.Url]
					? taskByUrl[pluginItem.Url]
					: pluginItem.detail;
				if (
					// to do  may change to false
					localUrlPlugins[pluginItem.Url] &&
					localUrlPlugins[pluginItem.Url].isShow === false
				) {
					pluginItem.isShow = false;
				} else {
					pluginItem.isShow = true;
				}
				pluginItem.isNeedUpdate = false; // no need to update, because it was downloaded from net
				pluginsTemp.push(pluginItem);
				localUrlPlugins[pluginItem.Url] = localUrlPlugins[pluginItem.Url] || {};
				localUrlPlugins[pluginItem.Url].detail = pluginItem.detail;
			}
			ipcRenderer.sendSync("setUsermeta", "Plugins", pluginsTemp);
			ipcRenderer.sendSync("setUsermeta", "LocalUrlPlugins", localUrlPlugins);
			this.sendPluginInfo();
		}
	}
};
</script>
<style lang="scss">
#plugin {
	min-height: 100vh;
	.primary {
		.button {
			padding-top: 3px;
			padding-bottom: 3px;
		}
	}
}
.plugin-items {
	display: flex;
	flex-wrap: wrap;
	padding: 50px 100px;
	.plugin-item {
		padding: 5px;
		font-size: 22px;
		.card {
			position: relative;
			padding: 20px 10px;
			text-align: center;
			border-radius: 5px;
			font-size: 16px;
			height: 100%;
			@include themify {
				color: $font-color;
				background: $card-color;
				box-shadow: $card-shadow;
			}
			& > h3 {
				font-size: 24px;
				margin-bottom: 5px;
				margin-top: 5px;
			}
			& > img {
				width: 64px;
				height: 64px;
			}
			& > p {
				@extend .grey-xs;
				height: 72px;
				margin-bottom: 8px;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			.el-switch {
				position: absolute;
				right: 10px;
				top: 20px;
			}
			.plugin-progress {
				position: absolute;
				bottom: 0px;
				left: 0px;
				width: 100%;
				padding-left: 5px;
				padding-right: 5px;
				.el-progress-bar {
					padding-right: 0px !important;
					margin-right: 0px !important;
				}
			}
		}
	}
}
</style>