<template>
	<div
	 id="wallet"
	 class=""
	>
		<div class="wallet-select">
			<el-select
			 v-model='balanceSelected'
			 @change="changeSelectedAsset"
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
				 v-for="(item,index) in balanceLists"
				 :key='index'
				 :label='item.Symbol'
				 :value='index'
				 class="asset-item"
				>
					<img
					 class="asset-icon mr10"
					 :src="'static/images/logo/'+ item.Symbol+ '.png'"
					 :alt="item.Symbol"
					> <span class="">{{item.Symbol}}</span>
				</el-option>
			</el-select>
		</div>
		<div class="content">
			<div class="wallet-aside">
				<div class="wallet-asset">
					<p class="grey-xs bold pl20 pr20">Total Balance</p>
					<div class="total"> <span class="symbol"></span> <span
						 class="theme-bold"
						 v-if="balanceLists && balanceLists.length>0"
						>{{parseFloat(balanceLists[balanceSelected].BalanceFormat).toFixed(3)}}</span></div>
					<div
					 class="balance-content"
					 v-if="balanceLists && balanceLists.length>0"
					>
						<ul class="child-ul">
							<li class="child-list selected">
								<div class="name"><img
									 class="asset-icon"
									 :src="'static/images/logo/'+balanceLists[balanceSelected].Symbol+'.png'"
									 alt=""
									> <span class="theme-bold">{{balanceLists[balanceSelected].Symbol}}</span></div>
								<div class="balance theme-bold">{{parseFloat(balanceLists[balanceSelected].BalanceFormat).toFixed(3)}}</div>
							</li>
						</ul>
						<div class="set-asset-display"><i
							 @click="switchToggle.assetDialog = true"
							 class="el-icon-plus"
							 style="cursor:pointer"
							></i></div>
					</div>
				</div>
				<div class="wallet-deal">
					<div @click="getQRCode"><i class="ofont ofont-transfer_in"></i> <span class="theme-bold">Receive</span></div>
					<div @click="switchToggle.sendDialog =true"><i class="ofont ofont-transfer_out"></i> <span class="theme-bold">Send</span></div>
				</div>
			</div>
			<div class="wallet-layout-main">
				<div class="tx-select">
					<p
					 @click="txType = 'txRecords';txDetailIndex =-1"
					 class="select-button"
					 :class="{'theme-font-blue-bold':txType === 'txRecords'}"
					>All Transfer</p>
					<p
					 class="select-button"
					 @click="txType = 'transferIn';txDetailIndex =-1"
					 :class="{'theme-font-blue-bold':txType === 'transferIn'}"
					> Receive</p>
					<p
					 class="select-button"
					 @click="txType = 'transferOut';txDetailIndex =-1"
					 :class="{'theme-font-blue-bold':txType === 'transferOut'}"
					>Send</p>
				</div>
				<ul class="tx-ul">
					<!-- this[txType] -->
					<!-- v-for="(item,index) in this[txType]" -->
					<!-- v-for="(item,index) in mockTxRecords" -->
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
								<i
								 class="ofont"
								 :class="item.Type ==1 ? 'ofont-transfer_out':'ofont-transfer_in'"
								></i>
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
								<i class="ofont ofont-transfer_right arrow"></i>
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
		 v-if="balanceLists.length>0"
		 class="send-dialog"
		>
			<el-dialog
			 :visible.sync='switchToggle.receiveDialog'
			 width="600px"
			 center
			>
				<div
				 class="dialog-header el-dialog__header"
				 slot="title"
				>
					<h2>Receive</h2>
					<div class="dialog-title-border"></div>
				</div>
				<div class="flex ai-center column">
					<div class="flex ai-center mb10">
						<p class="mr10  theme-font-blue-transparent ft14">{{balanceLists.length>0?balanceLists[balanceSelected].Address : 'Text Addr'}}</p>
						<i
						 class="ofont ofont-fuzhi addr_btn"
						 @click="clipText('.addr_btn')"
						 :aria-label='balanceLists[balanceSelected].Address'
						></i>
					</div>
					<div id="qrcode-content"></div>
					<div
					 class="mt20"
					 slot="footer"
					>
						<el-button
						 class="done"
						 type="primary"
						 @click="switchToggle.receiveDialog = false"
						>Done</el-button>
					</div>
				</div>
			</el-dialog>
			<el-dialog
			 width='600px'
			 center
			 :visible.sync="switchToggle.sendDialog"
			 :close-on-click-modal='false'
			>
				<div slot="title">
					<h2>Transfer</h2>
					<div class="dialog-title-border mt10"></div>
				</div>
				<div class="loading-content">
					<div class="send-form-wrap">
						<el-form
						 ref='transferForm'
						 :model="sendInfo"
						 :rules="sendRules"
						>
							<div class="flex between mb10">
								<p class="theme-font-blue-bold">{{balanceLists[balanceSelected].Symbol}}</p>
								<p v-if="balanceLists && balanceLists.length>0">{{parseFloat(balanceLists[balanceSelected].BalanceFormat).toFixed(2)}} {{balanceLists[balanceSelected].Symbol}}</p>
							</div>
							<el-form-item
							 class="theme-font-blue-bold"
							 label="Amount"
							 prop="Amount"
							>
								<el-input
								 v-model="sendInfo.Amount"
								 placeholder="Input amount"
								 type="number"
								 @blur="setFixed"
								></el-input>
							</el-form-item>
							<el-form-item
							 class="theme-font-blue-bold"
							 label="Send to"
							 prop="To"
							>
								<el-input
								 v-model="sendInfo.To"
								 :placeholder="'Input ' +balanceLists[balanceSelected].Symbol+' address'"
								></el-input>
							</el-form-item>
							<el-form-item
							 class="theme-font-blue-bold"
							 label="Password"
							 prop="Password"
							>
								<el-input
								 v-model="sendInfo.Password"
								 @keyup.enter.native='sendTransfer'
								 show-password
								 type="password"
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
						>Transfer</el-button>
					</span>
				</div>
			</el-dialog>
			<el-dialog
			 width='600px'
			 :visible.sync="switchToggle.assetDialog"
			 center
			>
				<div
				 class="dialog-header el-dialog__header"
				 slot="title"
				>
					<h2>My Assets</h2>
					<div class="dialog-title-border mt10"></div>
				</div>
				<ul class="asset-ul">
					<li class="asset-list">
						<img
						 class="asset-icon-lg"
						 :src="'static/images/logo/' +balanceLists[balanceSelected].Symbol+'.png'"
						 alt=""
						>
						<div class="flex1 ml10">
							<p class="theme-bold">{{balanceLists[balanceSelected].Symbol}} <span class="grey-xs"> {{balanceLists[balanceSelected].Name}}</span></p>
							<p class="theme-font-color ft12">{{balanceLists[balanceSelected].Address}}</p>
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
		document.title = "Wallet";
		this.$store.dispatch("setCurrentAccount"); // get login status
		this.$store.dispatch("setBalanceLists");
		this.$store.dispatch("setTxRecords");
		this.addListenScroll(
			document.querySelector(".tx-ul"),
			100,
			this.loadTxRecords
		);
	},
	data() {
		return {
			QRCode,
			date,
			switchToggle: {
				loading: null,
				loadSwitch: true,
				receiveDialog: false,
				sendDialog: false,
				assetDialog: false
			},
			txDetailIndex: -1,
			sendInfo: {
				To: "",
				Amount: "",
				Password: ""
			},
			qrcode: null,
			sendRules: {
				Amount: [
					{
						required: true,
						message: "Please fill amount",
						trigger: "blur"
					}
				],
				To: [
					{
						required: true,
						message: "Please fill address",
						trigger: "blur"
					}
				],
				Password: [
					{
						required: true,
						message: "Please fill password",
						trigger: "blur"
					}
				]
			},
			cancelReachBottomTxRequest: null,
			mockTxRecords: [
				{
					Txid:
						"b4de4e40e17c723041b228115c8a0b538ef8fcd4d772a9abd9c9d88b0e55b21a",
					Type: 2,
					From: "AFmseVrdL9f9oyCzZefL9tG6UbviRj6Fv6",
					To: "AQTsBQkyr2RZQZnySvKRsnK6yUmTLZBmtX",
					Amount: 1000000000,
					AmountFormat: "1",
					FeeFormat: "0.01",
					Asset: "save",
					Timestamp: 1561002012,
					BlockHeight: 243554
				},
				{
					Txid:
						"b4de4e40e17c723041b228115c8a0b538ef8fcd4d772a9abd9c9d88b0e55b21a",
					Type: 1,
					From: "AQTsBQkyr2RZQZnySvKRsnK6yUmTLZBmtX",
					To: "AFmseVrdL9f9oyCzZefL9tG6UbviEH9ugK",
					Amount: 10000000,
					AmountFormat: "0.01",
					FeeFormat: "0.01",
					Asset: "save",
					Timestamp: 1561002012,
					BlockHeight: 243554
				},
				{
					Txid:
						"b49930eeda273c824dac30eeb357c3e5c84ac04297382bece79c11a7e0e98bbd",
					Type: 1,
					From: "AQTsBQkyr2RZQZnySvKRsnK6yUmTLZBmtX",
					To: "AFmseVrdL9f9oyCzZefL9tG6UbviRj6Fv6",
					Amount: 1000000000,
					AmountFormat: "1",
					FeeFormat: "0.01",
					Asset: "save",
					Timestamp: 1561001904,
					BlockHeight: 243451
				},
				{
					Txid:
						"b49930eeda273c824dac30eeb357c3e5c84ac04297382bece79c11a7e0e98bbd",
					Type: 1,
					From: "AQTsBQkyr2RZQZnySvKRsnK6yUmTLZBmtX",
					To: "AFmseVrdL9f9oyCzZefL9tG6UbviEH9ugK",
					Amount: 10000000,
					AmountFormat: "0.01",
					FeeFormat: "0.01",
					Asset: "save",
					Timestamp: 1561001904,
					BlockHeight: 243451
				},
				{
					Txid:
						"eb13e1514c317d1ac6d8b49f6ef0e0d66ebacf3bdf2e3d036fe093164a8761a8",
					Type: 2,
					From: "AFmseVrdL9f9oyCzZefL9tG6UbviRj6Fv6",
					To: "AQTsBQkyr2RZQZnySvKRsnK6yUmTLZBmtX",
					Amount: 1000000000,
					AmountFormat: "1",
					FeeFormat: "0.01",
					Asset: "save",
					Timestamp: 1561001893,
					BlockHeight: 243441
				},
				{
					Txid:
						"eb13e1514c317d1ac6d8b49f6ef0e0d66ebacf3bdf2e3d036fe093164a8761a8",
					Type: 1,
					From: "AQTsBQkyr2RZQZnySvKRsnK6yUmTLZBmtX",
					To: "AFmseVrdL9f9oyCzZefL9tG6UbviEH9ugK",
					Amount: 10000000,
					AmountFormat: "0.01",
					FeeFormat: "0.01",
					Asset: "save",
					Timestamp: 1561001893,
					BlockHeight: 243441
				},
				{
					Txid:
						"8eeb469b08d73b107b504193b06f583a7433e7d6f42ceb1d38f03c10c16b62f8",
					Type: 1,
					From: "AQTsBQkyr2RZQZnySvKRsnK6yUmTLZBmtX",
					To: "AFmseVrdL9f9oyCzZefL9tG6UbviRj6Fv6",
					Amount: 1000000000,
					AmountFormat: "1",
					FeeFormat: "0.01",
					Asset: "save",
					Timestamp: 1561001205,
					BlockHeight: 242788
				},
				{
					Txid:
						"8eeb469b08d73b107b504193b06f583a7433e7d6f42ceb1d38f03c10c16b62f8",
					Type: 1,
					From: "AQTsBQkyr2RZQZnySvKRsnK6yUmTLZBmtX",
					To: "AFmseVrdL9f9oyCzZefL9tG6UbviEH9ugK",
					Amount: 10000000,
					AmountFormat: "0.01",
					FeeFormat: "0.01",
					Asset: "save",
					Timestamp: 1561001205,
					BlockHeight: 242788
				},
				{
					Txid:
						"a06ce560af0d1029ea034fbb030081fcb9776b52bf3503d54bcff2183f99f1b3",
					Type: 1,
					From: "AQTsBQkyr2RZQZnySvKRsnK6yUmTLZBmtX",
					To: "AFmseVrdL9f9oyCzZefL9tG6UbviRj6Fv6",
					Amount: 1000000000,
					AmountFormat: "1",
					FeeFormat: "0.01",
					Asset: "save",
					Timestamp: 1561001187,
					BlockHeight: 242771
				},
				{
					Txid:
						"a06ce560af0d1029ea034fbb030081fcb9776b52bf3503d54bcff2183f99f1b3",
					Type: 1,
					From: "AQTsBQkyr2RZQZnySvKRsnK6yUmTLZBmtX",
					To: "AFmseVrdL9f9oyCzZefL9tG6UbviEH9ugK",
					Amount: 10000000,
					AmountFormat: "0.01",
					FeeFormat: "0.01",
					Asset: "save",
					Timestamp: 1561001187,
					BlockHeight: 242771
				},
				{
					Txid:
						"c85f9669c8a84bb531dc2a53625add9274a3d84bece60444c619d6fcd3d67fe3",
					Type: 1,
					From: "AQTsBQkyr2RZQZnySvKRsnK6yUmTLZBmtX",
					To: "AFmseVrdL9f9oyCzZefL9tG6UbviKTaSnK",
					Amount: 111679487991,
					AmountFormat: "111.679487991",
					FeeFormat: "0.01",
					Asset: "save",
					Timestamp: 1560939646,
					BlockHeight: 184972
				},
				{
					Txid:
						"c85f9669c8a84bb531dc2a53625add9274a3d84bece60444c619d6fcd3d67fe3",
					Type: 1,
					From: "AQTsBQkyr2RZQZnySvKRsnK6yUmTLZBmtX",
					To: "AFmseVrdL9f9oyCzZefL9tG6UbviEH9ugK",
					Amount: 10000000,
					AmountFormat: "0.01",
					FeeFormat: "0.01",
					Asset: "save",
					Timestamp: 1560939646,
					BlockHeight: 184972
				},
				{
					Txid:
						"34683fd4d15a6835cea5f9f4cd019e16456efc4a839309f4898e82ff3e53b1dd",
					Type: 1,
					From: "AQTsBQkyr2RZQZnySvKRsnK6yUmTLZBmtX",
					To: "AFmseVrdL9f9oyCzZefL9tG6UbviKTaSnK",
					Amount: 110647295967,
					AmountFormat: "110.647295967",
					FeeFormat: "0.01",
					Asset: "save",
					Timestamp: 1560938888,
					BlockHeight: 184252
				},
				{
					Txid:
						"34683fd4d15a6835cea5f9f4cd019e16456efc4a839309f4898e82ff3e53b1dd",
					Type: 1,
					From: "AQTsBQkyr2RZQZnySvKRsnK6yUmTLZBmtX",
					To: "AFmseVrdL9f9oyCzZefL9tG6UbviEH9ugK",
					Amount: 10000000,
					AmountFormat: "0.01",
					FeeFormat: "0.01",
					Asset: "save",
					Timestamp: 1560938888,
					BlockHeight: 184252
				},
				{
					Txid:
						"ac79b8cc698fa98ee43068a867d2b75344802ea10005c1bf265a7b6ce32adef3",
					Type: 1,
					From: "AQTsBQkyr2RZQZnySvKRsnK6yUmTLZBmtX",
					To: "AFmseVrdL9f9oyCzZefL9tG6UbviKTaSnK",
					Amount: 102708646962,
					AmountFormat: "102.708646962",
					FeeFormat: "0.01",
					Asset: "save",
					Timestamp: 1560935052,
					BlockHeight: 180797
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
		addListenScroll(element, distance, callback) {
			element.addEventListener("scroll", function() {
				// console.log(`element.scrollTop is: ${element.scrollTop},
				// element.clientHeight is ${element.clientHeight},
				// distance is ${distance},
				// element.scrollHeight is ${element.scrollHeight}
				// `);
				if (
					element.scrollTop + element.clientHeight + distance >=
					element.scrollHeight
				) {
					console.log("scroll Toggle");
					callback();
				}
			});
		},
		getQRCode() {
			this.switchToggle.receiveDialog = true;
			this.$nextTick(() => {
				if (this.qrcode) {
					this.qrcode.clear();
					this.qrcode.makeCode(this.balanceLists[this.balanceSelected].Address);
				} else {
					this.qrcode = new QRCode(document.getElementById("qrcode-content"), {
						text:
							this.balanceLists.length > 0
								? this.balanceLists[this.balanceSelected].Address
								: "Qrcode Not Found",
						width: 128,
						height: 128
					});
				}
			});
		},
		setFixed() {
			this.sendInfo.Amount = this.sendInfo.Amount
				? parseFloat(this.sendInfo.Amount).toFixed(9)
				: "";
		},
		sendTransfer() {
			if (this.switchToggle.loading) return;
			this.$refs.transferForm.validate(valid => {
				if (valid) {
					this.switchToggle.loading = this.$loading({
						lock: true,
						text: "Transaction processing....",
						target: ".loading-content"
					});
					this.setFixed();
					const sendInfo = this.sendInfo;
					sendInfo.Asset = this.balanceLists[this.balanceSelected].Symbol;
					this.$axios
						.post(this.$api.transfer, sendInfo)
						.then(res => {
							if (res.data.Error === 0) {
								this.sendInfo.Password = "";
								this.switchToggle.sendDialog = false;
								this.$message({
									message: "Successful transfer",
									type: "success"
								});
							} else if (res.data.Error === 50015) {
								this.$message.error("Wrong Password");
							} else if (res.data.Error === 40002) {
								this.$message.error(
									"Transaction failed, please check your Address."
								);
							} else {
								this.$message.error(res.data.Desc);
							}
							this.switchToggle.loading.close();
							this.switchToggle.loading = null;
						})
						.catch(() => {
							this.switchToggle.loading.close();
							this.switchToggle.loading = null;
							this.$message.error(
								"Transaction failed. Please try again later."
							);
						});
				}
			});
		},
		loadTxRecords() {
			if (!this.switchToggle.loadSwitch) return;
			this.$store.dispatch("cancelTxRequest");
			this.switchToggle.loadSwitch = false;
			const asset = this.balanceLists[this.balanceSelected].Symbol || "";
			const limit = 10;
			const height = this.$store.state.Wallet.BlockHeight;
			this.$axios
				.get(
					this.$api.transactions +
						window.localStorage.Address +
						"/0?asset=" +
						asset +
						"&limit=" +
						limit +
						"&height=" +
						height,
					{
						cancelToken: new this.$axios.CancelToken(c => {
							this.cancelReachBottomTxRequest = c;
						})
					}
				)
				.then(res => {
					if (res.data.Error === 0) {
						const transferIn = [];
						const transferOut = [];
						const result = res.data.Result;
						for (let i = 0; i < result.length; i++) {
							if (result[i].Type === 1) {
								transferOut.push(result[i]);
							} else if (result[i].Type === 2) {
								transferIn.push(result[i]);
							}
							if ((i = result.length - 1)) {
								this.$store.commit("SET_BLOCK_HEIGHT", result[i].BlockHeight);
							}
						}
						this.$store.commit("SET_TX_RECORDS", this.txRecords.concat(result));
						this.$store.commit(
							"SET_TRANSFER_IN",
							this.transferIn.concat(transferIn)
						);
						this.$store.commit(
							"SET_TRANSFER_OUT",
							this.txRecords.concat(transferOut)
						);
						this.$store.dispatch("setTxRecords", {
							asset
						});
					}
				})
				.catch(err => {
					console.log(err);
				})
				.finally(() => {
					this.switchToggle.loadSwitch = true;
				});
		},
		changeSelectedAsset() {
			this.cancelReachBottomTxRequest && this.cancelReachBottomTxRequest();
			this.$store.dispatch("cancelTxRequest");
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
			return this.$store.state.Wallet.balanceLists || [];
		}
	}
};
</script>
<style lang="scss">
$theme-font-blue: #040f39;
$light-grey: #f7f7f7;
// .el-select,
// .el-select:hover .el-input__inner:focus,
// .el-input__inner:hover {
// 	// border-color: #fff !important;
// }
#wallet {
	display: flex;
	flex: 1;
	height: 100%;
	flex-direction: column;
	background: #eeeef1;
	.wallet-select {
		background: #fff;
		text-align: center;
		.el-input__inner {
			font-size: 20px;
			color: $theme-font-blue;
			font-weight: bold;
			border-color: #fff !important;
			text-align: center;
			height: 60px;
		}
		.el-select {
			width: 220px;
		}
		.el-select .el-input .el-select__caret {
			font-size: 22px;
			font-weight: bold;
		}
	}
	& > .content {
		width: 100%;
		height: calc(100% - 60px);
		padding: 50px 88px;
		display: flex;
		.wallet-aside {
			display: flex;
			width: 300px;
			flex-direction: column;
			.wallet-asset {
				display: flex;
				flex-direction: column;
				// flex: 1;
				background: #fff;
				width: 100%;
				margin: 0;
				padding: 10px 0px;
				border-radius: 2px;
				.total {
					border-bottom: solid 1px rgba(204, 204, 204, 0.3);
					padding: 10px 20px;
					.symbol {
						font-size: 13px;
						vertical-align: text-top;
					}
				}
				.balance-content {
					flex: 1;
					display: flex;
					flex-direction: column;
					.child-ul {
						flex: 1;
						min-height: 90px;
						.child-list {
							display: flex;
							justify-content: space-between;
							padding: 8px 20px;
							border-bottom: solid 1px rgba(204, 204, 204, 0.3);
							.name {
								font-size: 16px;
							}
							.balance {
								font-size: 16px;
							}
							&.selected {
								background-color: rgba(204, 204, 204, 0.3);
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
			overflow: auto;
			.tx-select {
				.select-button {
					cursor: pointer;
				}
				display: flex;
				align-items: center;
				font-size: 16px;
				height: 60px;
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
								margin-right: 8px;
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
		padding-top: 20px;
		display: flex;
		.el-switch.is-checked .el-switch__core {
			background-color: $theme-font-blue;
		}
	}
}
.done {
	&.el-button {
		padding: 8px 22px;
		border-radius: 2px;
	}
}
.send-dialog {
	.el-input__inner {
		font-weight: normal !important;
		background: #ebecef;
		border-radius: 2px;
		border: none;
	}
	.ofont-fuzhi {
		cursor: pointer;
		&:hover {
			opacity: .7;
		}
		
		&:active {
			opacity: 1;
		}
	}
	.send-form-wrap {
		width: 80%;
		margin: 0 auto;
		.el-input.is-active .el-input__inner,
		.el-input__inner:focus {
			border: none;
		}
		.el-form-item__label {
			color: $theme-font-blue;
		}
	}
	.el-dialog__footer {
		.el-button {
			padding: 8px 22px;
			border-radius: 2px;
		}
	}
}
</style>
