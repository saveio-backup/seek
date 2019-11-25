<template>
	<div id="activity-bar">
		<div class="content">
			<div class="composite-bar">
				<ul class="action-container">
					<li class="action-item">
						<div
							:title="$t('window.fileManager')"
							class="nav-button"
							@click="remoteOpenComponent('FileManager')"
							active-class="slidebar-active"
							:class="{'nav-active':activeView.displayURL.toLowerCase().indexOf('seek://filemanager')>=0}"
						>
							<i class="ofont ofont-wenjianjia-"></i>
						</div>
					</li>
					<li class="action-item">
						<div
							:title="$t('window.wallet')"
							class="nav-button"
							@click="remoteOpenComponent('Wallet')"
							:class="{'nav-active':activeView.displayURL.toLowerCase().indexOf('seek://wallet')>=0}"
						>
							<i class="ofont ofont-qianbao"></i>
						</div>
					</li>
					<li class="action-item item-bottom-line">
						<div
							:title="$t('window.miner')"
							class="nav-button"
							@click="remoteOpenComponent('Miner')"
							active-class="slidebar-active"
							:class="{'nav-active':activeView.displayURL.toLowerCase().indexOf('seek://miner')>=0}"
						>
							<i class="ofont ofont-kuanggong"></i>
							<!-- <img
							 v-show="activeView.displayURL.indexOf('seek://Miner')<0"
							 src="../assets/images/aside_miner.png"
							 alt="Menu"
							>
							<img
							 v-show="activeView.displayURL.indexOf('seek://Miner')>=0"
							 src="../assets/images/aside_miner_color.png"
							 alt=""
							> -->
						</div>
					</li>
					<li class="action-item">
						<div
							:title="$t('window.comingSoon')"
							class="nav-button"
							style="background:none;"
						>
							<span class="ofont ofont-dapp1"></span>
						</div>
					</li>
					<!-- <li
						class="plugin action-item"
						v-for="item in pluginsInstalled"
						:key="item.Url"
						@click="openNewWindow(item.Url)"
					>
						<div class="nav-button">
							<i class="ofont ofont-qianbao"></i>
						</div>

					</li> -->
					<li
						class="action-item"
						@mouseleave="hiddenDialog"
					>
						<div
							:title="$t('window.comingSoon')"
							@click="remoteOpenComponent('plugin')"
							class="nav-button"
							style="background:none;"
						>
							<span class="ofont ofont-tianjia"></span>
						</div>
					</li>
				</ul>
			</div>
			<div class="setting-bar">
				<div style="position:relative; z-index:2">
					<i
						class="ofont ofont-caidan user-no-select cursor-pointer cursor-click"
						@click="toPopCustomControlMenu"
					></i>
					<!-- @mouseleave="hiddenDialog" -->
					<span
						v-if="address"
						@mouseenter="setDialog('state')"
						class="process-status-wrapper"
					>
						<i
							class="process-status"
							:class="{'process-all-error': status === 0, 'process-some-error': status === 2}"
						>
						</i>
					</span>
					<span
						class="process-status-wrapper"
						v-else
					>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { remote, ipcRenderer } from "electron";
import fs from "fs";
const { Menu } = remote;
export default {
	mounted() {
		this.getPlugins();
		this.watchPlugins();
		ipcRenderer.on("forceUpdate", () => {
			this.$forceUpdate();
			this.views = remote.getCurrentWindow().views;
		});
	},
	data() {
		return {
			switchToggle: {
				logoutDialog: false
			},
			views: remote.getCurrentWindow().views,
			user: {
				name: localStorage.getItem("Label") || ""
			},
			pluginsInstalled: [],
			statusIntervalObj: null
		};
	},
	computed: {
		statusList: function() {
			return this.$store.state.Home.state;
		},
		activeView: function() {
			return this.views.find(item => item.isActive);
		},
		currentWindow: function() {
			return remote.getCurrentWindow();
		},
		address: function() {
			if (
				this.$store.state.Home.account &&
				this.$store.state.Home.account.Address
			) {
				return this.$store.state.Home.account.Address;
			} else {
				return "";
			}
		},
		// return 0 all offline,1 all online,2 some online some offline
		status: function() {
			let online = false;
			let offline = false;
			let statusKey = ["Chain", "DNS", "DspProxy", "ChannelProxy"];
			for (let value of statusKey) {
				if (
					this.statusList &&
					this.statusList[value] &&
					(this.statusList[value].State === 1 ||
						(value === "DNS" && this.statusList[value].HostAddr === ""))
				) {
					online = true;
				} else {
					offline = true;
				}
			}
			if (online && !offline) {
				return 1;
			} else if (!online && offline) {
				return 0;
			} else {
				return 2;
			}
		}
	},
	methods: {
		openNewWindow(url) {
			Seek.openNewWindow(url);
		},
		async getPlugins() {
			const plugins = ipcRenderer.sendSync("getUsermeta", "Plugins");
			const tempPluginsInstalled = [];
			console.log("getPlugins");
			for (let i = 0; i < plugins.length; i++) {
				const item = plugins[i];
				let detail = await this.getTransferDetail(item.Url);
				detail = detail.Result;
				try {
					fs.statSync(detail.Path);
					tempPluginsInstalled.push(detail);
				} catch (error) {
					console.error("fs error!");
					console.error(error);
				}
			}
			this.pluginsInstalled = tempPluginsInstalled;
		},
		watchPlugins() {
			ipcRenderer.on("updatePlugin", () => {
				this.getPlugins();
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
						reject(err);
					});
			});
		},
		toPopCustomControlMenu() {
			const that = this;
			const customControlMenuItems = [
				{
					label: that.$t("window.exportKeystoreFile"),
					// visible: new Boolean(user.name),
					click() {
						that.exportWallet();
					}
				},
				{
					label: that.$t("window.exportPrivateKey"),
					// visible: new Boolean(user.name),
					click() {
						that.exportPrivateKey();
					}
				},
				{
					label: that.$t("window.helpDocument"),
					click() {
						that.showHelpDocument();
					}
				},
				{
					label: that.$t("history.historyRecord"),
					click() {
						that.remoteOpenComponent("history");
					}
				},
				{
					label: that.$t("window.logOut"),
					// visible: new Boolean(user.name),
					click() {
						that.logout();
					}
				},
				{
					label: that.$t("window.settings"),
					click() {
						that.remoteOpenComponent("settings");
					}
				},
				{
					label: that.$t("window.version"),
					click() {
						that.showVersion();
					}
				}
			];
			let menu = Menu.buildFromTemplate(customControlMenuItems);
			menu.popup({});
		},
		showHelpDocument() {
			this.activeView.createHelpDocument({ isActive: true, focus: true });
		},
		remoteOpenComponent(path) {
			this.activeView.openComponent(path);
		},
		logout() {
			ipcRenderer.send("dialog-open", "logout");
		},
		exportPrivateKey() {
			ipcRenderer.send("dialog-open", "exportPrivateKey");
		},
		activeMessage({ info, type }) {
			const webContentsId = this.activeView.browserView.webContents.id;
			ipcRenderer.sendTo(webContentsId, "current-active-show-message", {
				info: info,
				type: type
			});
		},
		exportWallet() {
			const vm = this;
			this.$exportWallet("", function() {
				vm.$message({
					message: vm.$t("dialog.exportSuccess"),
					type: "success"
				});
			});
		},
		showVersion() {
			ipcRenderer.send(
				"showVersion",
				localStorage.getItem("edgeVersion") || ""
			);
		},
		hiddenDialog() {
			this.currentWindow.menuWindow.hiddenMenu("hide from activityBar");
		},
		setDialog(menuid) {
			let params = {
				id: menuid
			};
			this.currentWindow.menuWindow.openMenu(params);
		}
	}
};
</script>
<style lang="scss">
$theme-color: #dfe2e9;

$slidebar-active-color: linear-gradient(
	110deg,
	rgba(101, 166, 255, 1) 0%,
	rgba(138, 247, 255, 1) 100%
);
#activity-bar {
	@include themify {
		background-color: $navigation-bg;
	}
	width: 40px;
	background: $theme-color;
	height: calc(100% - 62px);

	.content {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: relative;
		padding-top: 50px;
		z-index: 999;
		height: 100%;
		color: #808185;

		.nav-active {
			@include themify {
				color: $nav-hover-color;
				background-color: $nav-button-bg;
			}
		}
		.action-container {
			text-align: center;
			.action-item {
				display: flex;
				position: relative;
				font-size: 40px;
				margin: 5px 0;
				.ofont {
					font-size: 24px;
					&.ofont-qianbao {
						position: relative;
						font-size: 20px;
					}
					&.ofont-kuanggong {
						font-size: 18px;
						position: relative;
					}
					&.ofont-dapp1 {
						font-size: 26px;
						@include themify {
							color: $nav-button-disabled;
						}
						background: none;
						cursor: not-allowed;
					}
					&.ofont-tianjia {
						font-size: 20px;
					}
				}
				&.item-user {
					position: relative;
					margin-top: 10px;
					padding-bottom: 10px;
					margin-bottom: 60px;
				}
				&.item-bottom-line {
					padding-bottom: 25px;
				}
				// &.item-bottom-line:after {
				// 	content: "";
				// 	position: absolute;
				// 	bottom: 0px;
				// 	left: 50%;
				// 	transform: translateX(-50%);
				// 	width: 75%;
				// 	height: 1px;
				// 	background: rgba(255, 255, 255, 0.2);
				// }
				img {
					width: calc(100% - 14px);
				}
				.nav-button {
					flex: 1;
					display: flex;
					position: relative;
					align-items: center;
					justify-content: center;
					cursor: pointer;
					height: 40px;
					// font-size: 1.8rem;

					&:hover {
						transition: all 0.2s ease;
						@include themify {
							color: $nav-hover-color;
							background-color: $nav-button-bg;
						}
					}

					&:active {
						opacity: 0.7;
					}

					&.slidebar-active {
						position: relative;
					}

					// .user-first {
					// 	font-size: 1.6rem;
					// 	width: 22px;
					// 	height: 22px;
					// 	line-height: 22px;
					// 	display: block;
					// 	text-align: center;
					// 	border-radius: 50%;
					// 	border: 1px solid #767882;
					// 	color: #767882;
					// 	font-style: inherit;
					// 	user-select: none;
					// }
				}
			}
		}
		.setting-bar {
			position: relative;
			text-align: center;
			font-size: 30px;
			top: -30px;

			.setting-ul {
				opacity: 0;
				transition: all 0.5s;
				width: 150px;
				position: absolute;
				right: 0px;
				bottom: 0px;
				padding: 0px;
				background: #fff;
				font-size: 14px;
				z-index: 1;
				.setting-li {
					padding: 10px 10px;
					&:hover {
						background: $theme-color;
						color: #fff;
					}
				}
			}

			.process-status-wrapper {
				// padding: 5px;
				height: 10px;
				width: 10px;
				display: block;
				margin: 20px auto 0;
				& > .process-status {
					width: 6px;
					height: 6px;
					border-radius: 50%;
					display: block;
					border: 2px solid white;
					background: linear-gradient(
						180deg,
						rgba(61, 227, 86, 1) 0%,
						rgba(23, 173, 44, 1) 100%
					);
					box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.3);
					border: 1px solid rgba(237, 237, 237, 1);

					&.process-some-error {
						background: linear-gradient(
							180deg,
							rgba(235, 181, 126, 1) 0%,
							rgba(223, 147, 79, 1) 100%
						);
						box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.3);
						border: 1px solid rgba(237, 237, 237, 1);
					}

					&.process-all-error {
						background: linear-gradient(
							180deg,
							rgba(247, 144, 115, 1) 0%,
							rgba(194, 70, 43, 1) 100%
						);
						box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.3);
						border: 1px solid rgba(237, 237, 237, 1);
					}
				}
			}
		}
	}
	.el-button {
		border-radius: 20px;
		padding: 10px 20px;
	}
}
</style>
