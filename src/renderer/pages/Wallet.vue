<template>
	<div
	 id="wallet"
	 class="common-main"
	>
		<div class="content">
			<div class="wallet-aside">
				<div class="wallet-select">
					<el-select
					 v-model='balanceSelected'
					 @change="changeSelectedAsset"
					>
						<el-option
						 v-for="(item,index) in balanceLists"
						 :key='index'
						 :label='item.Name'
						 :value='index'
						></el-option>
					</el-select>
				</div>
				<div class="wallet-asset">
					<p class="grey-xs bold">Total Balance</p>
					<div
					 class="balance-content"
					 v-if="balanceLists && balanceLists.length>0"
					>
						<div class="total"> <span class="symbol">$</span> <span class="theme-bold">{{parseFloat(balanceLists[balanceSelected].Balance).toFixed(3)}}</span></div>
						<ul class="child-ul">
							<li class="child-list">
								<div class="name"><span>Icon</span> <span class="theme-bold">{{balanceLists[balanceSelected].Symbol}}</span></div>
								<div class="balance theme-bold">{{parseFloat(balanceLists[balanceSelected].Balance).toFixed(3)}}</div>
							</li>
						</ul>
						<div class="set-asset-display"><i
							 @click="switchToggle.assetDialog = true"
							 class="el-icon-plus"
							></i></div>
					</div>
				</div>
				<div class="wallet-deal">
					<div><i class="el-icon-download"></i> <span class="theme-bold">Receive</span></div>
					<div><i class="el-icon-upload2"></i> <span
						 class="theme-bold"
						 @click="switchToggle.sendDialog =true"
						>Send</span></div>
				</div>
			</div>
			<div class="wallet-layout-main">
				<div class="tx-select">
					<p
					 @click="txType = 'txRecords';txDetailIndex =-1"
					 class="select-button"
					 :class="{active:txType === 'txRecords'}"
					>All Transfer</p>
					<p
					 class="select-button"
					 @click="txType = 'transferIn';txDetailIndex =-1"
					 :class="{active:txType === 'transferIn'}"
					> Receive</p>
					<p
					 class="select-button"
					 @click="txType = 'transferOut';txDetailIndex =-1"
					 :class="{active:txType === 'transferOut'}"
					>Send</p>
				</div>
				<ul class="tx-ul">
					<li
					 class="tx-li"
					 v-for="(item,index) in this[txType]"
					 :key="index"
					 @click="txDetailIndex = index"
					>
						<div
						 class="tx-li-item"
						 v-if="balanceLists.length>0"
						>
							<div class="item-addr">
								<i :class="item.Type ==1 ? 'el-icon-upload2':'el-icon-download'"></i>
								<div class="addr-info">
									<p class='from-or-to'>{{item.Type ==1 ? item.To: item.From}}</p>
									<p class="tx-date grey-xs">{{date.formatTimeByTimestamp(item.Timestamp * 1000)}}</p>
								</div>
							</div>
							<div class="item-amount theme-bold">{{item.Type ==1 ? '-':'+'}} {{item.AmountFormat}} {{item.Asset}}</div>
							<div v-if="item.BlockHeight>0">
								<i class="el-icon-success"></i>
								<!-- <i class="el-icon-more"></i> -->
							</div>
						</div>
						<div
						 class="tx-li-item-detail"
						 v-show="index === txDetailIndex"
						>
							<div class="txid grey-xs">ID: {{item.Txid || ''}}</div>
							<div class="towards theme-bold">
								<p class='from'>{{item.From}}</p>
								<i class="el-icon-arrow-right arrow"></i>
								<p class="to">{{item.To}}</p>
							</div>
							<div class="flex between bottom-info">
								<div class="minerfee"><span class="theme-font-color">Miner fee</span> <span class="theme-font-blue bold">{{item.FeeFormat}}</span></div>
								<div class="flex1"></div>
								<div class="blockheight"><span class="theme-bold">Block</span> {{item.BlockHeight}}</div>
							</div>
						</div>
					</li>
				</ul>
			</div>
		</div>
		<div
		 @click="clipText('.addr_btn')"
		 class="addr_btn"
		 aria-label='复制我一个'
		>Copy Address</div>
		<div
		 v-if="balanceLists.length>0"
		 class="send-dialog"
		>
			<el-dialog
			 :title='balanceLists[balanceSelected].Symbol + " Transfer"'
			 width='600px'
			 center
			 :visible.sync="switchToggle.sendDialog"
			>
				<div>
					<el-form
					 ref='form'
					 :model="sendInfo"
					 :rules="sendRules"
					>
						<div class="flex between">
							<p>{{balanceLists[balanceSelected].Symbol}}</p>
							<p>{{parseFloat(balanceLists[balanceSelected].Balance).toFixed(2)}} {{balanceLists[balanceSelected].Symbol}}</p>
						</div>
						<el-form-item>
							<el-input
							 v-model="sendInfo.Amount"
							 placeholder="Input amount"
							 type="number"
							 @blur="setFixed"
							></el-input>
						</el-form-item>
						<el-form-item label="Send to">
							<el-input
							 v-model="sendInfo.To"
							 :placeholder="'Input ' +balanceLists[balanceSelected].Symbol+' address'"
							></el-input>
						</el-form-item>
					</el-form>
					<div class="flex between">
						<span></span>
						<div>Miner Fee: 0.01 {{balanceLists[balanceSelected].Symbol}}</div>
					</div>
				</div>
				<span slot="footer">
					<el-button
					 type="primary"
					 @click="sendTransfer"
					>Send</el-button>
				</span>
			</el-dialog>
			<el-dialog
			 title="My Assets"
			 width='600px'
			 :visible.sync="switchToggle.assetDialog"
			 center
			>
				<ul class="asset-ul">
					<li class="asset-list">
						<div>Icon</div>
						<div class="flex1">
							<p class="theme-bold">{{balanceLists[balanceSelected].Symbol}} <span class="grey-xs"> {{balanceLists[balanceSelected].Name}}</span></p>
							<p class="">{{balanceLists[balanceSelected].Address}}</p>
						</div>
						<el-switch
						 disabled
						 :value='true'
						></el-switch>
					</li>
				</ul>
				<span slot="footer">
					<el-button
					 type="primary"
					 @click="switchToggle.assetDialog = false"
					>Comfirm</el-button>
				</span>
			</el-dialog>
		</div>
	</div>
</template>
<script>
import date from "../assets/tool/date";
import QRCode from "../assets/tool/qrcode.min";
import ClipboardJS from "clipboard";
export default {
	mounted() {
		this.$store.dispatch("setBalanceLists");
		this.$store.dispatch("setTxRecords");
	},
	data() {
		return {
			switchToggle: {
				sendDialog: false,
				assetDialog: false
			},
			txDetailIndex: -1,
			sendInfo: {
				Amount: "",
				To: ""
			},
			sendRules: {
				account: [
					{
						required: true,
						message: "Please fill account",
						trigger: "blur"
					}
				],
				to: [
					{
						required: true,
						message: "Please fill address",
						trigger: "blur"
					}
				]
			},
			QRCode,
			myAddr: window.localStorage.Address,
			date,
			mockTxRecords: [
				{
					From: "ALspSTkzC6CW4yVCLpihACaG9LpGVmvf5D",
					To: "AGeTrARjozPVLhuzMxZq36THMtvsrZNAHq",
					Amount: 1000000000000000,
					AmountFormat: "1000000",
					Asset: "save",
					Timestamp: 1554874378,
					FeeFormat: "0.01",
					BlockHeight: 100
				},
				{
					From: "AYMnqA65pJFKAbbpD8hi5gdNDBmeFBy5hS",
					To: "ALspSTkzC6CW4yVCLpihACaG9LpGVmvf5D",
					Amount: 1000000000000000,
					AmountFormat: "1000000",
					Asset: "save",
					Timestamp: 1554865433,
					FeeFormat: "0.01",
					BlockHeight: 100
				},
				{
					From: "ALspSTkzC6CW4yVCLpihACaG9LpGVmvf5D",
					To: "AGeTrARjozPVLhuzMxZq36THMtvsrZNAHq",
					Amount: 1000000000000000,
					AmountFormat: "1000000",
					Asset: "save",
					Timestamp: 1554808002,
					FeeFormat: "0.01",
					BlockHeight: 100
				}
			],
			balanceSelected: 0,
			txType: "txRecords"
		};
	},
	methods: {
		clipText(el) {
			console.log("clip");
			const clip = new ClipboardJS(el, {
				text: function(trigger) {
					return trigger.getAttribute("aria-label");
				}
			});
			clip.on("success", e => {
				this.$message({
					message: "Link Copied",
					duration: 1200,
					type: "success"
				});
				console.log("success");
				console.log(e);
				clip.destroy();
			});
		},
		setFixed() {
			this.sendInfo.Amount = parseFloat(this.sendInfo.Amount).toFixed(9);
		},
		sendTransfer() {
			this.setFixed();
			const sendInfo = this.sendInfo;
			sendInfo.Asset = this.balanceLists[this.balanceSelected].Symbol;
			this.$axios.post(this.$api.transfer, sendInfo).then(res => {
				if (res.data.Error === 0) {
					this.switchToggle.sendDialog = false;
				}
			});
		},
		changeSelectedAsset() {
			const asset = this.balanceLists[this.balanceSelected].Symbol || "";
			this.$store.dispatch("setTxRecords", { asset });
		}
	},
	computed: {
		txRecords: function() {
			return this.$store.state.Wallet.txRecords;
		},
		transferIn: function() {
			return this.$store.state.Wallet.transferIn;
		},
		transferOut: function() {
			return this.$store.state.Wallet.transferOut;
		},
		balanceLists: function() {
			return this.$store.state.Wallet.balanceLists;
		}
	}
};
</script>
<style lang="scss">
$theme-font-blue: #040f39;
$light-grey: #f7f7f7;
#wallet {
	display: flex;
	flex: 1;
	background: #eeeef1;
	& > .content {
		width: 100%;
		padding: 50px 0;
		display: flex;
		.wallet-aside {
			display: flex;
			width: 300px;
			flex-direction: column;
			justify-content: space-between;
			.wallet-select {
				background: #fff;
				.el-select {
					width: 100%;
				}
			}
			.wallet-asset {
				display: flex;
				flex-direction: column;
				flex: 1;
				background: #fff;
				width: 100%;
				margin: 10px 0;
				padding: 10px 15px;
				.balance-content {
					flex: 1;
					display: flex;
					flex-direction: column;
					.total {
						border-bottom: solid 1px #ccc;
						padding: 10px 0;
						.symbol {
							font-size: 13px;
							vertical-align: text-top;
						}
					}
					.child-ul {
						flex: 1;
						padding-top: 20px;
						.child-list {
							display: flex;
							justify-content: space-between;
							.name {
								font-size: 16px;
							}
							.balance {
								font-size: 16px;
							}
						}
					}
					.set-asset-display {
						text-align: center;
					}
				}
			}
			.wallet-deal {
				display: flex;
				justify-content: space-between;
				font-size: 16px;
				background: #fff;
				padding: 15px 20px;
				& > div {
					cursor: pointer;
				}
			}
		}
		.wallet-layout-main {
			display: flex;
			flex-direction: column;
			flex: 1;
			background: #fff;
			margin-left: 30px;
			.tx-select {
				.select-button {
					cursor: pointer;
				}
				.active {
					color: aquamarine;
				}
				display: flex;
				align-items: center;
				font-size: 16px;
				height: 80px;
				.select-button {
					padding: 0px 20px;
				}
			}
			.tx-ul {
				flex: 1;
				overflow-y: auto;
				.tx-li {
					cursor: pointer;
					.tx-li-item {
						display: flex;
						align-items: center;
						font-size: 16px;
						padding: 10px 0;
						border-top: solid 1px rgba(204, 204, 204, 0.3);
						width: calc(100% - 40px);
						margin: 0 auto;
						.item-addr {
							& > i {
								font-size: 20px;
								margin: 0 8px;
							}
							width: 440px;
							display: flex;
							align-items: center;
							font-size: 12px;
							.addr-info {
								display: flex;
								height: 45px;
								flex-direction: column;
								justify-content: space-between;
							}
							.from-or-to {
								color: $theme-font-blue;
								font-weight: bold;
							}
						}
						.item-amount {
							flex: 1;
						}
						.el-icon-success {
							color: #49c269;
						}
					}
					.tx-li-item-detail {
						background: $light-grey;
						padding: 10px 45px;
						.towards {
							display: flex;
							padding: 10px 0;
							.from,
							.to {
								width: 400px;
								font-size: 12px;
							}
							.arrow {
								flex: 1;
								text-align: center;
							}
						}
						.bottom-info {
							font-size: 12px;
							.minerfee,
							.blockheight {
								width: 400px;
							}
						}
					}
				}
			}
		}
	}
	.asset-ul {
		height: 240px;
		overflow-y: auto;
	}
	.asset-list {
		border-top: solid 1px #ccc;
		padding-top: 20px;
		display: flex;
	}
}
</style>
