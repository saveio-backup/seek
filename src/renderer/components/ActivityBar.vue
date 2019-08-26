<template>
	<div id="activity-bar">
		<div class="content">
			<div class="composite-bar">
				<ul class="action-container">
					<!-- <li class="action-item item-user">
						<div
						 class="nav-button"
						 @click="remoteOpenComponent('Home')"
						>
							<i v-if="!user.name" class="ofont ofont-user user user-first"></i>
							<i v-else class="user-first">{{user.name | firstString}}</i>
						</div>
					</li> -->
					<!-- <li class="action-item">
						<router-link to="/Appstore"><i class="ofont ofont-menu appstore"></i></router-link>
					</li> -->
					<li class="action-item">
						<div
							title="FileManager"
							class="nav-button"
							@click="remoteOpenComponent('FileManager')"
							active-class="slidebar-active"
							:class="{'theme-color-yellow':activeView.displayURL.toLowerCase().indexOf('seek://filemanager')>=0}"
						>
							<i class="ofont ofont-wenjianjia-"></i>
						</div>
					</li>
					<li class="action-item">
						<div
							title="Wallet"
							class="nav-button"
							@click="remoteOpenComponent('Wallet')"
							:class="{'theme-color-yellow':activeView.displayURL.toLowerCase().indexOf('seek://wallet')>=0}"
						>
							<i class="ofont ofont-qianbao"></i>
						</div>
					</li>
					<li class="action-item item-bottom-line">
						<div
							title="Miner"
							class="nav-button"
							@click="remoteOpenComponent('Miner')"
							active-class="slidebar-active"
							:class="{'theme-color-yellow':activeView.displayURL.toLowerCase().indexOf('seek://miner')>=0}"
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
							title="Coming Soon.."
							class="nav-button"
							style="background:none;"
						>
							<span
								class="ofont ofont-dapp1"
								style='color:#C7CAD0;background:none;cursor:not-allowed;'
							></span>
						</div>
					</li>
					<li class="action-item">
						<div
							title="Coming Soon.."
							class="nav-button"
							style="background:none;"
						>
							<span
								class="ofont ofont-tianjia"
								style='color:#C7CAD0;cursor:not-allowed;'
							></span>
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
					<span
						v-if="address"
						@mouseenter="setDialog('state')"
						@mouseleave="hiddenDialog"
						class="process-status-wrapper"
					>
						<i
							class="process-status"	
							:class="{'process-all-error': status === 0, 'process-some-error': status === 2}"
						>
						</i>
					</span>
					<span class="process-status-wrapper" v-else>
					</span>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import "element-ui/lib/theme-chalk/index.css";
import { remote, ipcRenderer } from "electron";
const { Menu } = remote;
export default {
	mounted() {
		ipcRenderer.on("forceUpdate", () => {
			this.$forceUpdate();
			this.views = remote.getCurrentWindow().views;
		});
		// this.init();
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
			// statusList: {
			// 	ChainState: 0,
			// 	DNSState: 0,
			// 	DspProxyState: 0,
			// 	ChannelProxyState: 0
			// },
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
			let statusKey = [
				"ChainState",
				"DNSState",
				"DspProxyState",
				"ChannelProxyState"
			];
			for (let value of statusKey) {
				if (this.statusList && this.statusList[value] === 1) {
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
		// init() {
		// 	const INTERVAL_TIME = 5000;
		// 	this.getStatus();
		// 	this.statusIntervalObj = setInterval(() => {
		// 		this.getStatus();
		// 	}, INTERVAL_TIME);
		// },
		// getStatus() {
		// 	this.$axios
		// 		.get(this.$api.networkStatus)
		// 		.then(res => {
		// 			if (res.Error === 0) {
		// 				this.statusList = res.Result;
		// 			}
		// 		})
		// 		.catch(e => {
		// 			this.statusList = {
		// 				ChainState: 0,
		// 				DNSState: 0,
		// 				DspProxyState: 0,
		// 				ChannelProxyState: 0
		// 			};
		// 		});
		// },
		toPopCustomControlMenu() {
			const that = this;
			const customControlMenuItems = [
				{
					label: "Export Keystore File",
					// visible: new Boolean(user.name),
					click() {
						that.exportWallet();
					}
				},
				{
					label: "Export Private Key(WIF)",
					// visible: new Boolean(user.name),
					click() {
						that.exportPrivateKey();
					}
				},
				{
					label: "Help Document",
					click() {
						that.showHelpDocument();
					}
				},
				{
					label: "Log Out",
					// visible: new Boolean(user.name),
					click() {
						that.logout();
					}
				},
				{
					label: "Version",
					click() {
						that.showVersion();
					}
				}
			];
			let menu = Menu.buildFromTemplate(customControlMenuItems);
			menu.popup({});
		},
		showHelpDocument() {
			this.activeView.createPDF({ isActive: true, focus: true });
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
		exportWallet() {
			this.$exportWallet();
		},
		showVersion() {
			ipcRenderer.send(
				"showVersion",
				localStorage.getItem("edgeVersion") || ""
			);
		},
		hiddenDialog() {
			this.currentWindow.menuWindow.hiddenMenu();
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
$theme-color-yellow: #4f5154;
// $theme-color: #1b1e2f;
$theme-color: #dfe2e9;

$slidebar-active-color: linear-gradient(
	110deg,
	rgba(101, 166, 255, 1) 0%,
	rgba(138, 247, 255, 1) 100%
);
#activity-bar {
	width: 40px;
	color: $theme-color;
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
		box-shadow: inset -15px 0px 10px -15px rgba(182, 182, 182, 0.3);

		.theme-color-yellow {
			color: $theme-color-yellow;
			background: #c0c6d1;
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
					// font-size: 18px;

					&:hover {
						transition: all 0.2s ease;
						color: $theme-color-yellow;
						background: #c0c6d1;
					}

					&:active {
						opacity: 0.7;
					}

					&.slidebar-active {
						position: relative;
					}

					// .user-first {
					// 	font-size: 16px;
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
			color: #202020;
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

			.ofont-caidan {
				color: rgba(32, 32, 32, 0.5);
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
					background: linear-gradient(180deg,rgba(61,227,86,1) 0%,rgba(23,173,44,1) 100%);
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
		border-radius: 2px;
		padding: 10px 20px;
	}
}
</style>
