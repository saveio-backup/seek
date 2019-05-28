<template>
	<div id="activity-bar">
		<div class="content">
			<div class="composite-bar">
				<ul class="action-container">
					<li class="action-item item-user">
						<div
						 class="nav-button"
						 @click="remoteOpenComponent('Home')"
						><i class="ofont ofont-user user"></i></div>
					</li>
					<!-- <li class="action-item">
						<router-link to="/Appstore"><i class="ofont ofont-menu appstore"></i></router-link>
					</li> -->
					<li class="action-item">
						<div
						 title="FileManager"
						 class="nav-button"
						 @click="remoteOpenComponent('FileManager')"
						 active-class="slidebar-active"
						>
							<i
							 class="ofont ofont-file"
							 :class="{'theme-color-yellow':activeView.displayURL.indexOf('seek://FileManager')>=0}"
							></i>
						</div>
					</li>
					<li class="action-item">
						<div
						 title="Wallet"
						 class="nav-button"
						 @click="remoteOpenComponent('Wallet')"
						>
						<i class="ofont ofont-wallet" :class="{'theme-color-yellow':activeView.displayURL.indexOf('seek://Wallet')>=0}"></i>
						</div>
					</li>
					<li class="action-item item-bottom-line">
						<div
						 title="Miner"
						 class="nav-button"
						 @click="remoteOpenComponent('Miner')"
						 active-class="slidebar-active"
						>
						<i class="ofont ofont-miner" :class="{'theme-color-yellow':activeView.displayURL.indexOf('seek://Miner')>=0}"></i>
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
						>
							<span
							 class="ofont ofont-mall"
							 style='opacity:0.2'
							></span>
						</div>
					</li>
					<li class="action-item">
						<div
						 title="Coming Soon.."
						 class="nav-button"
						>
							<span
							 class="ofont ofont-add"
							 style='opacity:0.2'
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
					<i class="ofont ofont-menu-point"></i>
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
			views: remote.getCurrentWindow().views
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
		exportWallet() {
			this.$axios
				.get(this.$api.account + "/export/walletfile")
				.then(res => {
					if (res.data.Desc === "SUCCESS" && res.data.Error === 0) {
						ipcRenderer.send("export-wallet-dialog", res.data.Result.Wallet);
					}
					ipcRenderer.once("export-finished", () => {
						this.$message({
							message: "Export Success!",
							type: "success"
						});
					});
				})
				.catch(err => {
					console.error(err);
				});
		},
		toPopCustomControlMenu() {
			const that = this;
			const customControlMenuItems = [
				{
					label: "Export Wallet",
					click() {
						that.exportWallet();
					}
				}
			];
			Menu.buildFromTemplate(customControlMenuItems).popup();
		},
		remoteOpenComponent(path) {
			this.activeView.openComponent(path);
		}
	}
};
</script>
<style lang="scss">
$theme-color-yellow: #cddc39;
$theme-color: #1b1e2f;
$slidebar-active-color: linear-gradient(
	110deg,
	rgba(101, 166, 255, 1) 0%,
	rgba(138, 247, 255, 1) 100%
);
#activity-bar {
	width: 40px;
	color: $theme-color;
	background: $theme-color;
	.content {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		position: relative;
		padding-top: 25px;
		z-index: 999;
		height: 100%;
		color: #767882;
		.theme-color-yellow {
			color: $theme-color-yellow;
		}
		.action-container {
			text-align: center;
			.action-item {
				display: flex;
				position: relative;
				font-size: 40px;
				margin: 25px 0;
				.ofont {
					font-size: 30px;
				}
				&.item-user {
					position: relative;
					margin-top: 10px;
					padding-bottom: 10px;
					margin-bottom: 60px;
				}
				&.item-bottom-line {
					padding-bottom: 20px;
				}
				&.item-bottom-line:after {
					content: "";
					position: absolute;
					bottom: 0px;
					left: 50%;
					transform: translateX(-50%);
					width: 75%;
					height: 1px;
					background: rgba(255, 255, 255, 0.2);
				}
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
					&.slidebar-active {
						position: relative;
					}
				}
			}
		}
		.setting-bar {
			position: relative;
			text-align: center;
			font-size: 42px;
			.el-icon-menu {
				position: relative;
				z-index: 2;
			}
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
