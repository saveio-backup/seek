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
						:class="{'theme-color-yellow':activeView.displayURL.indexOf('seek://FileManager')>=0}"
						>
							<i
							 class="ofont ofont-wenjianjia-"
							></i>
						</div>
					</li>
					<li class="action-item">
						<div
						 title="Wallet"
						 class="nav-button"
						 @click="remoteOpenComponent('Wallet')"
						:class="{'theme-color-yellow':activeView.displayURL.indexOf('seek://Wallet')>=0}"
						>
							<i
							 class="ofont ofont-qianbao"
							></i>
						</div>
					</li>
					<li class="action-item item-bottom-line">
						<div
						 title="Miner"
						 class="nav-button"
						 @click="remoteOpenComponent('Miner')"
						 active-class="slidebar-active"
						:class="{'theme-color-yellow':activeView.displayURL.indexOf('seek://Miner')>=0}"
						>
							<i
							 class="ofont ofont-wakuang"
							></i>
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
			<div
			 class="setting-bar"
			 @click="toPopCustomControlMenu"
			>
				<div style="position:relative; z-index:2">
					<i class="ofont ofont-menu-more"></i>
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
	},
	data() {
		return {
			switchToggle: {
				logoutDialog: false
			},
			views: remote.getCurrentWindow().views,
			user: {
				name: localStorage.getItem("Label") || ""
			}
		};
	},
	computed: {
		activeView: function() {
			return this.views.find(item => item.isActive);
		},
		currentWindow: function() {
			return remote.getCurrentWindow();
		}
	},
	methods: {
		toPopCustomControlMenu() {
			const that = this;
			const customControlMenuItems = [
				{
					label: "Export Wallet",
					// visible: new Boolean(user.name),
					click() {
						that.$exportWallet();		
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
					label: "Export Private Key",
					// visible: new Boolean(user.name),
					click() {
						that.exportPrivateKey();				
					}
				}
			];
			let menu = Menu.buildFromTemplate(customControlMenuItems);
			menu.popup({});
		},
		remoteOpenComponent(path) {
			this.activeView.openComponent(path);
		},
		logout() {
			ipcRenderer.send('dialog-open', 'logout');
		},
		exportPrivateKey() {
			ipcRenderer.send('dialog-open', 'exportPrivateKey');
		}
	}
};
</script>
<style lang="scss">
$theme-color-yellow: #4F5154;
// $theme-color: #1b1e2f;
$theme-color: #DFE2E9;

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
		box-shadow:inset -15px 0px  10px -15px rgba(182,182,182,0.3);

		.theme-color-yellow {
			color: $theme-color-yellow;
			background: #C0C6D1;
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
						transition: all .2s ease;
						color: $theme-color-yellow;
						background: #C0C6D1;
					}

					&:active {
						opacity: .7;
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
		}
	}
	.el-button {
		border-radius: 2px;
		padding: 10px 20px;
	}
}
</style>
