<template>
	<div
	 id="home"
	 class="common-main"
	>
		<div
		 class="content islogin"
		 v-if="loginStatus ===1"
		>
			<div class="user-meta">
				<div class="user-meta-left">
					<div class="user-name">
						<!-- <i class="ofont ofont-user"></i> -->
						<div>
							<p class="light-blue-xs bold mb10">Welcome !</p>
							<p class="theme-bold">{{userName}}</p>
						</div>
						<div>
							<el-button
							 type="danger"
							 class="log"
							 @click="switchToggle.logoutDialog = true"
							>Log Out</el-button>
						</div>
					</div>
					<!-- pause !!! -->
					<div class="user-revenue">
						<p class="grey-xs bold">Your revenue:</p>
						<div class="flex between ai-center">
							<span class="theme-bold ft24">{{revenue.toLocaleString('en-US')}}</span>
							<span class="grey-xs bold">SAVE POWER</span>
						</div>
					</div>
					<el-dialog
					 center
					 width='600px'
					 :visible.sync="switchToggle.logoutDialog"
					>
						<div slot="title">
							<h2>Warning</h2>
							<div class="dialog-title-border"></div>
						</div>
						<div class="loading-content">
							<div class="mb20">
								<p class="mt20 text-center">Please ensure that the private key file is properly stored before exiting.</p>
							</div>
							<div slot="footer">
								<el-button
								 type="danger"
								 @click="logOut"
								>Logout</el-button>
								<el-button
								 type="primary"
								 @click="$exportWallet"
								>Export Wallet</el-button>
							</div>
						</div>
					</el-dialog>
				</div>
				<div class="user-meta-right">
					<div class="balance-title">
						<div class="balance-meta">
							<p class="grey-xs bold mb10">Total Balance</p>
							<p class="theme-bold"> {{balanceLists.length>0?filterFloat(balanceLists[balanceSelected].BalanceFormat).toLocaleString('en-US'):'0'}}</p>
						</div>
						<el-select
						 class="asset-select"
						 v-model='balanceSelected'
						 @change="setBalanceListsIndex"
						>
							<div
							 slot="prefix"
							 class="prefix-icon"
							>
								<img
								 v-if="balanceLists.length>0"
								 class="asset-icon"
								 :src="'static/images/logo/'+balanceLists[balanceSelected].Symbol+'.png'"
								 alt=""
								>
							</div>
							<el-option
							 class="asset-item"
							 v-for="(item,index) in balanceLists"
							 :key='item.Name'
							 :label='item.Symbol'
							 :value='index'
							><img
								 class="asset-icon mr10"
								 :src="'static/images/logo/'+ item.Symbol+ '.png'"
								 :alt="item.Symbol"
								> <span class="">{{item.Symbol}}</span></el-option>
						</el-select>

					</div>
					<div
					 class="balance-detail"
					 v-if="balanceLists.length>0"
					>
						<div class="balance-item">
							<div class="balance-top">
								<div class="flex ai-center">
									<img
									 class="asset-icon mr10"
									 :src="'static/images/logo/'+balanceLists[balanceSelected].Symbol+'.png'"
									 alt=""
									>
									<p class="theme-bold">{{ balanceLists[balanceSelected].Symbol}}</p>
								</div>
								<p class="theme-bold">{{filterFloat(balanceLists[balanceSelected].BalanceFormat).toLocaleString('en-US')}}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="channels-title">Channel Balance</div>
			<channels-list></channels-list>
		</div>
		<div
		 class="content not-login account-wrap"
		 v-if="loginStatus === 0"
		>
			<div class="account-box flex column jc-center">
				<h3 class="account-box-sub  mb50"><span>Welcome to</span></h3>
				<div class="flex between account-box-sub">
					<div class="save-logo-wrap">
						<img
						 src="../assets/images/save_768x316.png"
						 alt="SAVE"
						 class="save-logo-image"
						>
					</div>
					<div class="tologin">
						<router-link
						 to="/CreateAccount"
						 class="button"
						>
							<el-button type="primary">Create Account</el-button>
						</router-link>
						<router-link
						 to="/ImportAccount"
						 class="button"
						>
							<el-button>Import Account</el-button>
						</router-link>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
const { ipcRenderer } = require("electron");
import { filterFloat } from "../assets/config/util";
import channelsList from "../components/ChannelsList.vue";
export default {
	components: {
		channelsList
	},
	mounted() {
		document.title = "Home";
		this.$store.dispatch("setCurrentAccount"); // get login status
	},
	data() {
		return {
			switchToggle: {
				loading: null,
				logoutDialog: false
			},
			filterFloat,
			balanceValue: "",
			// loginStatus: 0, // 1: login 0: not login
			user: {
				name: localStorage.getItem("Label") || ""
			},
			balanceSelected: 0
		};
	},
	methods: {
		setBalanceListsIndex(index) {
			this.balanceSelected = index;
		},
		getBalance() {
			this.$store.dispatch("setBalanceLists");
		},
		getAllChannels() {
			this.$store.dispatch("setChannelBalanceTotal");
		},
		logOut() {
			this.switchToggle.loading = this.$loading({
				lock: true,
				text: "logging out",
				target: ".loading-content"
			});
			this.$axios
				.post(this.$api.account + "/logout", {})
				.then(res => {
					if (res.data.Desc === "SUCCESS" && res.data.Error === 0) {
						window.localStorage.clear();
						window.location.href = location.origin + location.pathname; // success login out link to home page
					}
				})
				.catch(err => {
					this.switchToggle.loading.close();
					this.switchToggle.loading = null;
					console.error(err);
				});
		},
		exportWallet() {
			this.$axios
				.get(this.$api.account + "/export/walletfile")
				.then(res => {
					if (res.data.Desc === "SUCCESS" && res.data.Error === 0) {
						ipcRenderer.send(
							"export-file-dialog",
							res.data.Result.Wallet,
							"Wallet"
						);
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
		}
	},
	computed: {
		loginStatus: function() {
			return this.$store.state.Home.loginStatus;
		},
		userName: function() {
			return localStorage.getItem("Label") || "";
		},
		balanceLists: function() {
			return this.$store.state.Wallet.balanceLists;
		},
		revenue: function() {
			return this.$store.state.Home.revenue;
		}
	}
};
</script>
<style lang="scss">
$light-grey: #f2f2f2;
$grey: #ccc;
$theme-color: #1b1e2f;
$input-color: rgba(203, 203, 203, 1);
.el-select-dropdown,
.el-popper {
	border: solid 1px #fff;
	border-top: none;
}
.asset-item {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
}
.prefix-icon {
	margin-left: 15px;
	height: 100%;
	display: flex;
	align-items: center;
}
.asset-icon {
	display: inline-block;
	width: 15px;
	height: 15px;
}
#home {
	display: flex;
	flex: 1;
	.el-input {
		&.is-focus {
			.el-input__inner {
				border-bottom: none;
			}
		}
	}
	.el-select .el-input__inner:focus {
		border-color: $input-color !important;
	}
	.el-input__inner {
		border-radius: 2px;
		font-weight: bold;
		border-color: $input-color !important;
	}
	.content {
		width: 100%;
		display: flex;
		flex-direction: column;
		&.islogin {
			padding: 20px 88px 10px;
		}
		&.not-login {
			align-items: center;
			.save-logo-image {
				width: 300px;
			}
			.account-box-sub {
				width: 60%;
				max-width: 700px;
				margin-left: auto;
				margin-right: auto;
			}
			.tologin {
				display: flex;
				flex-direction: column;
				justify-content: space-around;

				.button {
					padding: 10px;
					color: #fff;
					font-size: 14px;
					.el-button {
						border-radius: 0px;
					}
					.el-button--default {
						color: #040f39;
						border-color: rgba(4, 15, 57, 0.5);
					}
				}
			}
		}
		.user-meta {
			display: flex;
			justify-content: space-between;
		}
		.user-meta-left {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			// padding: 20px 10px;
			width: 350px;
			height: 200px;
			&.no-user {
				// flex-direction: row;
				align-items: center;
				justify-content: space-around;
				background: #fff;
				.ofont-user {
					width: 80px;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				.please-login {
					flex: initial;
				}
			}
			.ofont-user {
				font-size: 45px;
			}
			.user-name {
				display: flex;
				align-items: center;
				justify-content: space-between;
				height: 90px;
				border-radius: 2px;
				background: #fff;
				padding: 5px 10px;
				.ofont-user {
					margin: 0 8px;
				}
			}
			.user-revenue {
				display: flex;
				flex-direction: column;
				justify-content: space-around;
				height: 100px;
				border-radius: 2px;
				background: #fff;
				padding: 5px 10px;
			}
			.please-login {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
			}
		}
		.user-meta-right {
			// width: 600px;
			flex: 1;
			display: flex;
			height: 200px;
			flex-direction: column;
			justify-content: space-between;
			padding: 20px 20px;
			margin-left: 10px;
			background: #fff;
			border-radius: 2px;
			.balance-title {
				display: flex;
				justify-content: space-between;
				align-items: center;
				.el-input__inner {
					text-align: center;
				}
			}
			.balance-detail {
				height: 80px;
				.balance-item {
					width: 240px;
					height: 100%;
					display: flex;
					align-items: center;
					background: #fff;
					border-radius: 2px;
					border: solid 1px rgba(203, 203, 203, 1);
					padding: 5px 8px;
					.balance-top {
						display: flex;
						flex: 1;
						justify-content: space-between;
					}
					.balance-bottom {
						display: flex;
						justify-content: space-between;
					}
				}
			}
		}
		.channels-title {
			border-radius: 2px;
			height: 70px;
			background: #fff;
			padding: 20px 15px;
			color: $grey;
			margin-top: 20px;
		}
	}
}
</style>
