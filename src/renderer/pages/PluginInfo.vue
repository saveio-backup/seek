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
						<img
							:src="plugin.img"
							alt="save"
						>
						<h3>{{plugin.title}}</h3>
						<p>{{plugin.note}}</p>
						<div v-if="plugin.detail">
							<ripper-button
								class="primary"
								v-if="plugin.detail.Progress >= 1"
								@click="loadPlugin(plugin.Url,plugin)"
							>Open</ripper-button>
							<ripper-button
								class="primary"
								v-if='(plugin.detail.Status ===1) || (plugin.detail.Status ===0)'
							>Installing</ripper-button>
						</div>
						<ripper-button
							class="primary"
							@click="loadPlugin(plugin.Url,plugin)"
							v-else
						>Installation</ripper-button>

						<el-progress
							v-if="plugin.detail"
							class="plugin-progress"
							:percentage="Math.ceil(plugin.detail.Progress * 100)"
							:stroke-width="2"
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
export default {
	data() {
		return {
			plugins: [
				{
					Url: "oni://www.filmlabtest1202_01.com",
					img: "https://i.loli.net/2019/11/18/tjBDFyKTpQsXuza.png",
					title: "filmlabtest1202_01",
					note:
						"filmlabtest1128 test, transfer information, node information and other important information in save network",
					progress: 0,
					detail: null
				},
				{
					Url: "oni://www.filmlabtest1128_01.com",
					img: "https://i.loli.net/2019/11/18/tjBDFyKTpQsXuza.png",
					title: "filmlabtest1128",
					note:
						"Used to query block information, transfer information, node information and other important information in save network",
					progress: 0,
					detail: null
				},
				{
					Url: "oni://www.filmlabtest12.com",
					img: "https://i.loli.net/2019/11/18/tjBDFyKTpQsXuza.png",
					title: "Block Chain filmlabtest12",
					note:
						"Used to query block information, transfer information, node information and other important information in save network",
					progress: 0,
					detail: null
				},
				{
					Url: "oni://www.filmlabtest11.com",
					img: "https://i.loli.net/2019/11/18/tjBDFyKTpQsXuza.png",
					title: "Block Chain filmlabtest11",
					note:
						"Used to query block information, transfer information, node information and other important information in save network",
					progress: 0,
					detail: null
				},
				{
					Url: "oni://www.filmlabtest10.com",
					img: "https://i.loli.net/2019/11/18/tjBDFyKTpQsXuza.png",
					title: "Block Chain filmlabtest10",
					note:
						"Used to query block information, transfer information, node information and other important information in save network",
					progress: 0,
					detail: null
				},
				{
					Url: "oni://www.filmlabtest9.com",
					img: "https://i.loli.net/2019/11/18/tjBDFyKTpQsXuza.png",
					title: "Block Chain filmlabtest9",
					note:
						"Used to query block information, transfer information, node information and other important information in save network",
					progress: 0,
					detail: null
				}
			]
		};
	},
	mounted() {
		this.getPluginsInfo();
	},
	methods: {
		sendPluginInfo() {
			ipcRenderer.sendTo(
				remote.getCurrentWindow().webContents.id,
				"updatePlugin"
			);
		},
		async getPluginsInfo() {
			const plugins = this.plugins;
			const pluginInstaled = [];
			for (let i = 0; i < plugins.length; i++) {
				let detail = await this.getTransferDetail(plugins[i].Url);
				detail = detail.Result;
				try {
					fs.statSync(detail.Path);
					plugins[i].detail = detail;
					pluginInstaled.push(plugins[i]);
				} catch (error) {
					plugins[i].detail = null;
				}
			}
			try {
				ipcRenderer.sendSync("setUsermeta", "Plugins", pluginInstaled);
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
							});
					} else {
						// in processing
						plugItem.detail = data;
						setTimeout(() => {
							this.loadPlugin(url, plugItem);
						}, 2000);
					}
				} else if (data.Progress >= 1) {
					// task has finished
					try {
						fs.statSync(data.Path);
						plugItem.detail = data;
						const plugins = ipcRenderer.sendSync("getUsermeta", "Plugins");
						if (
							plugins.every(item => {
								return item.detail.Path !== plugItem.detail.Path;
							})
						) {
							plugins.push(plugItem);
						}
						ipcRenderer.sendSync("setUsermeta", "Plugins", plugins);
						this.sendPluginInfo();
						window.open(url);
					} catch (error) {
						const plugins = ipcRenderer.sendSync("getUsermeta", "Plugins");
						for (let i = 0; i < plugins.length; i++) {
							const element = plugins[i];
							if (element.detail.Path === data.Path) {
								plugins.splice(i, 1);
								break;
							}
						}
						ipcRenderer.sendSync("setUsermeta", "Plugins", plugins);
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
				});
		},
		getTransferDetail(url) {
			const hexUrl = ipcRenderer.sendSync("string-to-hex", url);
			return new Promise((resolve, reject) => {
				this.$axios
					.get(this.$api.transferDetail + `/3/${hexUrl}`)
					.then(res => {
						console.log("get transferDetail is!!");
						console.log(res);
						resolve(res);
					})
					.catch(err => {
						reject(err);
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
			padding: 20px 10px;
			text-align: center;
			border-radius: 5px;
			font-size: 16px;
			height: 260px;
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