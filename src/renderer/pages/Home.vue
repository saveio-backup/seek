<template>
	<div
	 id="home"
	 class="common-main"
	>
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
						<!-- <i class="ofont ofont-user"></i> -->
						<div>
							<p class="light-blue-xs bold">Welcome !</p>
							<p class="theme-bold">{{user.name}}</p>
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
				</div>
				<div
				 class="user-meta-left no-user"
				 v-else
				>
					<i class="ofont ofont-user"></i>
					<div class="please-login">
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
							<p class="grey-xs bold mb10">Total Balance</p>
							<p class="theme-bold"> {{balanceLists.length>0?filterFloat(balanceLists[balanceSelected].Balance).toLocaleString('en-US'):'0'}}</p>
						</div>
						<el-select
						 class="asset-select"
						 v-model='balanceSelected'
						 @change="setBalanceListsIndex"
						>
						<div slot="prefix" class="prefix-icon">
							<img v-if="balanceLists.length>0" class="asset-icon" :src="'../../../static/images/logo/'+balanceLists[balanceSelected].Symbol+'.png'" alt="">
						</div>
							<el-option
							class="asset-item"
							 v-for="(item,index) in balanceLists"
							 :key='item.Name'
							 :label='item.Symbol'
							 :value='index'
							><img
								 class="asset-icon mr10"
								 :src="'../../../static/images/logo/'+ item.Symbol+ '.png'"
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
									<img class="asset-icon mr10" :src="'../../../static/images/logo/'+balanceLists[balanceSelected].Symbol+'.png'" alt="">
									<p class="theme-bold">{{ balanceLists[balanceSelected].Symbol}}</p>
								</div>
								<p class="theme-bold">{{filterFloat(balanceLists[balanceSelected].Balance).toLocaleString('en-US')}}</p>
							</div>
							<!-- <div class="balance-bottom">
								<p>{{balanceLists[balanceSelected].Balance}}</p>
							</div> -->
						</div>
					</div>
				</div>
			</div>
			<div class="channels-title">Channel Balance</div>
			<div class="channels">
				<el-table
				 :data="channels"
				 height="100%"
				 empty-text='No data'
				>
					<el-table-column
					 prop='ChannelId'
					 label='Channel'
					></el-table-column>
					<el-table-column label='balance'>
						<template slot-scope="scope">
							<div class="light-blue">
								{{filterFloat(scope.row.Balance).toLocaleString('en-US')}}
							</div>
						</template>
					</el-table-column>
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
import { filterFloat } from "../assets/config/util";
export default {
	mounted() {
		this.$store.dispatch("setRevenue");
		this.currentAccount();
	},
	data() {
		return {
			filterFloat,
			balanceValue: "",
			loginStatus: 0, // 1: login 0: not login
			user: {
				name: localStorage.getItem("Label") || ""
			},
			// balanceLists: [
			// 	// {
			// 	// 	Name: "Save Power",
			// 	// 	Symbol: "SAVE",
			// 	// 	Decimals: 0,
			// 	// 	Balance: "000000"
			// 	// },
			// 	// {
			// 	// 	Name: "NEO",
			// 	// 	Symbol: "NEO",
			// 	// 	Decimals: 9,
			// 	// 	Balance: "0"
			// 	// },
			// 	// {
			// 	// 	Name: "Ontology",
			// 	// 	Symbol: "ONT",
			// 	// 	Decimals: 9,
			// 	// 	Balance: "0"
			// 	// }
			// ],
			balanceSelected: 0,
			mockChannels: [
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				}
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
							// this.getBalance();
							this.$store.dispatch("setBalanceLists");
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
						// const result = res.data.Result;
						// this.balanceLists = result;
					}
				})
				.catch(err => {
					console.error(err);
				});
		},
		getAllChannels() {
			this.$axios
				.get(this.$api.host + this.$api.version + "channel")
				.then(res => {
					if (res.data.Desc === "SUCCESS" && res.data.Error === 0) {
						this.$store.dispatch("setChannelBalanceTotal", res.data.Result);
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
	},
	computed: {
		balanceLists: function() {
			return this.$store.state.Wallet.balanceLists;
		},
		revenue: function() {
			return this.$store.state.Home.revenue;
		},
		channels: function() {
			return this.$store.state.Home.channels;
		}
	}
};
</script>
<style lang="scss">
$light-grey: #f2f2f2;
$grey: #ccc;
$theme-color: #1b1e2f;
.el-select-dropdown,
.el-popper {
	border: solid 1px #fff;
	border-top: none;
}
.asset-item{
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
}
.prefix-icon{
	margin-left: 15px;
	height:100%;
	display:flex;
	align-items: center
}
.asset-icon{
	display: inline-block;
	width:15px;
	height:15px;
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
		border-color: $theme-color !important;
	}
	.el-input__inner {
		border-color: $theme-color !important;
	}
	.content {
		width: 100%;
		display: flex;
		flex-direction: column;
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
			.tologin {
				.button {
					background: $theme-color;
					padding: 10px;
					color: #fff;
					font-size: 14px;
				}
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
			background: #fff;
			padding: 10px 15px;
			color: $grey;
			margin-top: 20px;
		}
		.channels {
			flex: 1;
			overflow-y: auto;
			// margin-top: 80px;
			margin-bottom: 20px;
			.el-table thead th {
				color: $theme-color;
				font-weight: bold;
				background: rgba(231, 231, 235, 1);
			}
		}
	}
}
</style>
