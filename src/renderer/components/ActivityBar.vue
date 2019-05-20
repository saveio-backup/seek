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
							<img
							 v-show="activeView.displayURL.indexOf('seek://FileManager')<0"
							 src="../assets/images/aside_file.png"
							 alt="Menu"
							>
							<img
							 v-show="activeView.displayURL.indexOf('seek://FileManager')>=0"
							 src="../assets/images/aside_file_color.png"
							 alt=""
							>
							<div
							 v-show="activeView.displayURL.indexOf('seek://FileManager')>=0"
							 class="slide-border"
							></div>
						</div>
					</li>
					<li class="action-item">
						<div
						 title="Wallet"
						 class="nav-button"
						 @click="remoteOpenComponent('Wallet')"
						>
							<img
							 v-show="activeView.displayURL.indexOf('seek://Wallet')<0"
							 src="../assets/images/aside_wallet.png"
							 alt="Menu"
							>
							<img
							 v-show="activeView.displayURL.indexOf('seek://Wallet')>=0"
							 src="../assets/images/aside_wallet_color.png"
							 alt=""
							>
							<div
							 v-show="activeView.displayURL.indexOf('seek://Wallet')>=0"
							 class="slide-border"
							></div>
						</div>
					</li>
					<li class="action-item">
						<div
						 title="Miner"
						 class="nav-button"
						 @click="remoteOpenComponent('Miner')"
						 active-class="slidebar-active"
						>
							<img
							 v-show="activeView.displayURL.indexOf('seek://Miner')<0"
							 src="../assets/images/aside_miner.png"
							 alt="Menu"
							>
							<img
							 v-show="activeView.displayURL.indexOf('seek://Miner')>=0"
							 src="../assets/images/aside_miner_color.png"
							 alt=""
							>
							<div
							 v-show="activeView.displayURL.indexOf('seek://Miner')>=0"
							 class="slide-border"
							></div>
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
		logOut() {
			this.$axios
				.post(this.$api.account + "/logout", {})
				.then(res => {
					if (res.data.Desc === "SUCCESS" && res.data.Error === 0) {
						window.localStorage.clear();
						window.location.href = "/"; // success login link to home page
					}
				})
				.catch(err => {
					console.error(err);
				});
		},
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
$theme-color: #1b1e2f;
$slidebar-active-color: linear-gradient(
	110deg,
	rgba(101, 166, 255, 1) 0%,
	rgba(138, 247, 255, 1) 100%
);
#activity-bar {
	width: 100px;
	color: $theme-color;
	background: $theme-color;
	.content {
		position: relative;
		z-index: 999;
		height: 100%;
		color: #767882;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		.action-container {
			text-align: center;
			.action-item {
				display: flex;
				font-size: 40px;
				margin: 40px 0;
				&.item-user {
					position: relative;
					font-size: 50px;
					margin-top: 10px;
					padding-bottom: 10px;
					margin-bottom: 40px;
				}
				&.item-user:after {
					content: "";
					position: absolute;
					bottom: 0px;
					left: 50%;
					transform: translateX(-50%);
					width: 75%;
					height: 1px;
					background: rgba(255, 255, 255, 0.2);
				}
				.nav-button {
					flex: 1;
					display: flex;
					position: relative;
					align-items: center;
					justify-content: center;
					.slide-border {
						width: 1.5px;
						height: 100%;
						position: absolute;
						right: 0px;
						top: 0px;
						border-radius: 1px;
						background: $slidebar-active-color;
						transform: scaleY(1.3);
					}
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
