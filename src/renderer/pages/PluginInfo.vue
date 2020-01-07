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
							:src="plugin.img"
							alt="save"
						>
						<h3>{{plugin.title}}</h3>
						<p :title="plugin.note[lang]">{{plugin.note[lang]}}</p>
						<div v-if="plugin.detail">
							<ripper-button
								class="primary"
								v-if="(plugin.detail.Progress >= 1) && (plugin.detail.Status !=5)"
								@click="loadPlugin(plugin.Url,plugin)"
							>{{$t("plugin.open")}}</ripper-button>
							<ripper-button
								class="primary"
								v-if="plugin.detail.Status===4"
								@click="downloadPluginRetry(plugin.Url,plugin)"
							>{{$t("plugin.retry")}}</ripper-button>
							<ripper-button
								class="primary"
								v-if='(plugin.detail.Status ===1) || (plugin.detail.Status ===0)|| (plugin.detail.Status ===2)'
							>{{$t("plugin.installing")}}</ripper-button>
							<ripper-button
								class="primary"
								@click="downloadPlugin(plugin.Url,plugin)"
								v-if="plugin.detail.Status ===5"
							>{{$t("plugin.update")}}</ripper-button>
						</div>
						<ripper-button
							class="primary"
							@click="loadPlugin(plugin.Url,plugin)"
							v-else
						>{{$t("plugin.install")}}</ripper-button>

						<el-progress
							v-if="plugin.detail"
							class="plugin-progress"
							:percentage="Math.ceil(plugin.detail.Progress * 100)"
							:stroke-width="2"
							:show-text="false"
						></el-progress>
					</div>
				</li>
			</ul>
		</div>
	</div>
</template>
<script>
import { ipcRenderer, remote } from "electron";
import fs from "fs";
window.remote = remote;
const G_plugins = [
	// {
	// 	Url: "oni://www.filmlabbeta.com",
	// 	icon: "FS",
	// 	img: "https://i.loli.net/2019/11/18/tjBDFyKTpQsXuza.png",
	// 	title: "filmlabbeta",
	// 	note:
	// 		"filmlabbeta test, transfer information, node information and other important information in save network",
	// 	progress: 0,
	// 	detail: null
	// },
	{
		Url: "oni://www.explorer.com",
		icon: "DNS",
		img: "https://i.loli.net/2019/11/18/tjBDFyKTpQsXuza.png",
		title: "Explorer",
		note: {
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
			plugins: []
		};
	},
	mounted() {
		this.getPluginsInfo();
		this.$store.dispatch("setCurrentAccount"); // get login status
	},
	computed: {
		lang: function() {
			return this.$i18n.locale;
		}
	},
	methods: {
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
			ipcRenderer.sendTo(
				remote.getCurrentWindow().webContents.id,
				"updatePlugin"
			);
		},
		async getPluginsInfo() {
			const plugins = G_plugins; // todo  get from http request
			const pluginInstaled = [];
			// todo  修改结构
			const localUrlPlugins = ipcRenderer.sendSync(
				"getUsermeta",
				"LocalUrlPlugins"
			);
			for (let i = 0; i < plugins.length; i++) {
				let detail = await this.getTransferDetail(plugins[i].Url);
				// set isShow
				plugins[i].isShow = localUrlPlugins[plugins[i].Url]
					? localUrlPlugins[plugins[i].Url].isShow
					: false;
				detail = detail.Result;
				plugins[i].detail = detail;
				this.$set(this.plugins, i, plugins[i]);
				try {
					if (plugins[i].detail) {
						fs.statSync(detail.Path);
						pluginInstaled.push(plugins[i]);
						// if plugin loaded from 'Enter address to load', we should update LocalUrlPlugins
						localUrlPlugins[plugins[i].Url] = localUrlPlugins[plugins[i].Url]
							? localUrlPlugins[plugins[i].Url]
							: plugins[i];
					} else if (localUrlPlugins[plugins[i].Url]) {
						// need update
						fs.statSync(localUrlPlugins[plugins[i].Url].detail.Path); // check if path exist in localUrlplugins
						plugins[i].detail = localUrlPlugins[plugins[i].Url].detail;
						plugins[i].detail.Status = 5;
						pluginInstaled.push(plugins[i]);
					}
				} catch (error) {
					console.log("error");
					console.log(error);
					plugins[i].detail = null;
				}
			}
			try {
				ipcRenderer.sendSync("setUsermeta", "Plugins", pluginInstaled);
				ipcRenderer.sendSync("setUsermeta", "LocalUrlPlugins", localUrlPlugins);
				this.sendPluginInfo();
			} catch (error) {}
		},

		async loadPlugin(url, plugItem) {
			let detail = null;
			try {
				detail = await this.getTransferDetail(url);
			} catch (error) {
				console.log("loadThirdPage throw a error from await");
				console.log(error);
				detail = {
					data: null
				};
			}
			if (detail.Result) {
				const data = detail.Result;
				if (data.Progress >= 0 && data.Progress < 1) {
					// task has exist
					if (data.Status === 0) {
						// but in Pause state
						this.$message({
							message: this.$t("plugin.startDownload"),
							type: "success"
						});
						this.$axios
							.post(this.$api.downloadResume, {
								Ids: [data.Id]
							})
							.then(res => {
								if (res.Error === 0) {
									setTimeout(() => {
										this.loadPlugin(url, plugItem);
									}, 2000);
								}
							})
							.catch(error => {
								if (error.message.includes("timeout")) {
									this.$message.error("Request Timeout!");
								}
							});
					} else if (data.Status === 4) {
						// task error
						plugItem.detail = data;
					} else {
						// in processing
						plugItem.detail = data;
						setTimeout(() => {
							this.loadPlugin(url, plugItem);
						}, 2000);
					}
				} else if (data.Progress >= 1) {
					// task has finished
					if (fs.existsSync(data.Path)) {
						plugItem.detail = data;
						const plugins = ipcRenderer.sendSync("getUsermeta", "Plugins");
						const localUrlPlugins = ipcRenderer.sendSync(
							"getUsermeta",
							"LocalUrlPlugins"
						);
						if (
							!plugins.some(item => {
								if (item.Url === plugItem.Url) {
									item.detail = plugItem.detail;
									// everytime we update plugin, we update url:plugin data as key:value to store in localUrlPlugins
									localUrlPlugins[plugItem.Url].detail = plugItem.detail;
									return true;
								} else {
									return false;
								}
							})
						) {
							plugins.push(plugItem);
							// everytime we add plugin, we add url:plugin data as key:value to store in localUrlPlugins
							localUrlPlugins[plugItem.Url] = plugItem;
							localUrlPlugins[plugItem.Url].isShow = true;
						}
						ipcRenderer.sendSync("setUsermeta", "Plugins", plugins);
						ipcRenderer.sendSync(
							"setUsermeta",
							"LocalUrlPlugins",
							localUrlPlugins
						);
						window.open(url);
						this.sendPluginInfo();
					} else {
						const plugins = ipcRenderer.sendSync("getUsermeta", "Plugins");
						const localUrlPlugins = ipcRenderer.sendSync(
							"getUsermeta",
							"LocalUrlPlugins"
						);
						for (let i = 0; i < plugins.length; i++) {
							const element = plugins[i];
							if (element.detail.Path === data.Path) {
								plugins.splice(i, 1);
								// while remove plugin, del url:plugin
								delete localUrlPlugins[element.Url];
								break;
							}
						}
						ipcRenderer.sendSync("setUsermeta", "Plugins", plugins);
						ipcRenderer.sendSync(
							"setUsermeta",
							"LocalUrlPlugins",
							localUrlPlugins
						);
						plugItem.detail = data;
						plugItem.detail.Status = 0;
						plugItem.detail.Progress = 0;
						this.downloadPlugin(url, plugItem); // task exist but file not found
					}
				}
			} else {
				this.downloadPlugin(url, plugItem);
			}
		},

		downloadPlugin(url, plugItem) {
			this.$message({
				message: this.$t("plugin.startDownload"),
				type: "success"
			});
			this.$axios
				.post(this.$api.download, {
					Url: url,
					MaxPeerNum: ipcRenderer.sendSync("getSettings", "maxPeerNum"),
					SetFileName: true
				})
				.then(res => {
					if (res.Error === 0) {
						setTimeout(() => {
							this.loadPlugin(url, plugItem);
						}, 2000);
					} else {
						console.log("emit loadErrorPage");
					}
				})
				.catch(error => {
					if (error.message.includes("timeout")) {
						this.$message.error("Request Timeout!");
					}else{
						this.$message.error(this.$t(`error[${res.Error}]`));
					}
				});
		},
		downloadPluginRetry(url, pluginItem) {
			this.$message({
				message: this.$t("plugin.startDownload"),
				type: "success"
			});
			this.$axios
				.post(this.$api.downloadRetry, {
					Ids: [pluginItem.detail.Id]
				})
				.then(res => {
					if (res.Error === 0) {
						setTimeout(() => {
							this.loadPlugin(url, pluginItem);
						}, 2000);
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
		}
	}
};
</script>
<style lang="scss">
#plugin {
	min-height: 100vh;
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