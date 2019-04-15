<template>
	<div id="home" class="common-main">
		<div class="content">
			<div v-if="loginStatus">
				<el-button
				 type="danger"
				 class="log"
				 @click="logoutOut"
				>Log Out</el-button>
				<el-button
				 type="success"
				 style="margin-bottom: 20px;"
				 @click="exportWallet"
				>Export Wallet</el-button>
			</div>
			<div class="user-meta">
				<div
				 class="user-meta-left"
				 v-if="loginStatus === 1"
				>
					<div class="user-name">
						<i class="ofont ofont-user"></i>
						<p>Welcome <strong>{{user.name}}</strong></p>
					</div>
					<!-- pause !!! -->
					<div class="user-revenue">
						<p>Your revenue</p>
						<span>{{user.Revenue}}</span> SAVE POWER
					</div>
				</div>
				<div
				 class="user-meta-left no-user"
				 v-else
				>
					<i class="ofont ofont-user"></i>
					<div class="please-login">
						<p>Welcome</p>
						<div class="tologin">
							<router-link
							 to="/CreateAccount"
							 class="button"
							>Create Account</router-link>
							<router-link
							 to="/ImportAccount"
							 class="button"
							>Import Accont</router-link>
						</div>
					</div>
				</div>
				<div class="user-meta-right">
					<div class="balance-title">
						<div class="balance-meta">
							<p>Total Balance</p>
							<p>$ {{balanceLists.length>0?balanceLists[balanceSelected].Balance:'$00000.00'}}</p>
						</div>
						<el-select
						 v-model='balanceSelected'
						 @change="setBalanceListsIndex"
						>
							<el-option
							 v-for="(item,index) in balanceLists"
							 :key='item.Name'
							 :label='item.Name'
							 :value='index'
							></el-option>
						</el-select>

					</div>
					<div
					 class="balance-detail"
					 v-if="balanceLists.length>0"
					>
						<div class="balance-item">
							<div class="balance-top">
								<p>Icon</p>
								<p>{{balanceLists[balanceSelected].Balance}}</p>
							</div>
							<div class="balance-bottom">
								<p>{{balanceLists[balanceSelected].Name}}</p>
								<p>{{balanceLists[balanceSelected].Balance}}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="channels">
				<el-table
				 :data="channels"
				 empty-text='No data'
				>
					<el-table-column
					 prop='ChannelId'
					 label='Channel'
					></el-table-column>
					<el-table-column
					 prop='Balance'
					 label='balance'
					></el-table-column>
					<el-table-column
					 prop='TokenAddr'
					 label='Token Addr'
					></el-table-column>
					<el-table-column
					 prop='HostAddr'
					 label='DNS'
					></el-table-column>
				</el-table>
			</div>
		</div>
	</div>
</template>
<script>
const { ipcRenderer } = require("electron");
export default {
	mounted() {
		this.currentAccount();
	},
	data() {
		return {
			balanceValue: "",
			loginStatus: 0, // 1: login 0: not login
			user: {
				name: localStorage.getItem("Label") || ""
			},
			balanceLists: [
				// {
				// 	Name: "Save Power",
				// 	Symbol: "SAVE",
				// 	Decimals: 0,
				// 	Balance: "000000"
				// },
				// {
				// 	Name: "NEO",
				// 	Symbol: "NEO",
				// 	Decimals: 9,
				// 	Balance: "0"
				// },
				// {
				// 	Name: "Ontology",
				// 	Symbol: "ONT",
				// 	Decimals: 9,
				// 	Balance: "0"
				// }
			],
			balanceSelected: 0,
			channels: [
				// {
				// 	ChannelId: 101,
				// 	Balance: 1000000000,
				// 	BalanceFormat: "1",
				// 	Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
				// 	HostAddr: "tcp://127.0.0.1:13004",
				// 	TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				// }
			]
		};
	},
	methods: {
		setBalanceListsIndex(index) {
			this.balanceSelected = index;
		},
		// Confirm login status
		currentAccount() {
			this.$axios
				.get(this.$api.account)
				.then(res => {
					const data = res.data;
					if (data.Error === 0) {
						if (data.Desc === "SUCCESS" && data.Result.Address) {
							const result = data.Result;
							for (let key in result) {
								window.localStorage.setItem(key, result[key]);
							}
							this.loginStatus = 1; // login success
							this.getBalance();
							this.getAllChannels();
						} else {
							window.localStorage.clear(); // remove all local infomation
						}
					}
				})
				.catch(err => {
					console.error(err);
				});
		},
		getBalance() {
			this.$axios
				.get(
					this.$api.balance + "/" + window.localStorage.getItem("Address") || ""
				)
				.then(res => {
					if (res.data.Desc === "SUCCESS") {
						const result = res.data.Result;
						this.balanceLists = result;
					}
				})
				.catch(err => {
					console.err(err);
				});
		},
		getAllChannels() {
			this.$axios
				.get(this.$api.host+ this.$api.version + "channel")
				.then(res => {
					if (res.data.Desc === "SUCCESS" && res.data.Error === 0) {
						this.channels = res.data.Result;
					}
				})
				.catch(err => {
					console.error(err);
				});
		},
		logoutOut() {
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
				})
				.catch(err => {
					console.error(err);
				});
		}
	}
};
</script>
<style lang="scss">
$grey: #ccc;
.flex {
	display: flex;
}
#home {
	display: flex;
	flex: 1;
	.content {
		width: 100%;
		.user-meta {
			display: flex;
			justify-content: space-between;
		}
		.user-meta-left {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			padding: 20px 10px;
			width: 350px;
			height: 200px;
			border-radius: 8px;
			background: $grey;
			&.no-user {
				flex-direction: row;
				.ofont-user {
					width: 80px;
					display: flex;
					justify-content: center;
					align-items: center;
				}
			}
			.ofont-user {
				font-size: 45px;
			}
			.user-name {
				display: flex;
				align-items: center;
			}
			.please-login {
				flex: 1;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
			}
			.tologin {
				.button {
					background: #fff;
					padding: 10px;
					color: #333;
					font-size: 14px;
				}
			}
		}
		.user-meta-right {
			// width: 600px;
			flex:1;
			display: flex;
			height: 200px;
			flex-direction: column;
			justify-content: space-between;
			padding: 20px 20px;
			margin-left: 10px;
			background: $grey;
			.balance-title {
				display: flex;
				justify-content: space-between;
				align-items: center;
			}
			.balance-detail {
				.balance-item {
					width: 240px;
					background: #fff;
					border-radius: 5px;
					padding: 5px 8px;
					.balance-top {
						display: flex;
						justify-content: space-between;
					}
					.balance-bottom {
						display: flex;
						justify-content: space-between;
					}
				}
			}
		}
		.channels {
			margin-top: 100px;
			background: $grey;
		}
	}
}
</style>
