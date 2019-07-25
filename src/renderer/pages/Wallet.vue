<template>
	<div
		id="wallet"
		class=""
	>
		<div class="content">
			<div class="wallet-aside">
				<div class="person-info">
					<p class="person-info-name ft24">{{user.name || ''}}</p>
					<p class="person-info-address ft14">
						<span
							class="address"
							:title="user.address || ''"
						>
							{{user.address || ''}}
						</span>
						<i
							class="ofont ofont-fuzhi"
							@click="clipSaveAddress"
						></i>
					</p>
				</div>
				<div class="balance-content-wrapper">
					<div class="wallet-select user-no-select">
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
								:disabled="item.Symbol !== 'SAVE'"
							>
								<img
									class="asset-icon mr10"
									:src="'static/images/logo/'+ item.Symbol+ '.png'"
									:alt="item.Symbol"
								> <span class="">{{item.Symbol}}</span>
							</el-option>
						</el-select>
					</div>
					<div class="wallet-asset">
						<p class="ft14 user-no-select">Total Balance:</p>
						<div class="total"> <span class="symbol"></span> <span v-if="balanceLists && balanceLists.length>0">{{parseFloat(balanceLists[balanceSelected].BalanceFormat).toFixed(3)}}</span></div>
					</div>
					<div
						class="balance-content"
						v-if="balanceLists && balanceLists.length>0"
					>
						<!-- <ul class="child-ul">
							<li class="child-list selected">
								<div class="name"><img
									 class="asset-icon"
									 :src="'static/images/logo/'+balanceLists[balanceSelected].Symbol+'.png'"
									 alt=""
									> <span class="theme-bold">{{balanceLists[balanceSelected].Symbol}}</span></div>
								<div class="balance theme-bold">{{parseFloat(balanceLists[balanceSelected].BalanceFormat).toFixed(3)}}</div>
							</li>
						</ul> -->
						<div
							class="asset-display-li asset-display"
							:class="{'asset-display-li-select': childrenChain === 0}"
						>
							<div class="asset-display-logo">
								<img
									v-if="balanceLists.length>0"
									class="asset-icon"
									:src="'static/images/logo/'+balanceLists[balanceSelected].Symbol+'.png'"
									alt=""
								>
								<span class="asset-display-logo-name">{{balanceLists[balanceSelected].Symbol}}</span>
							</div>
							<div class="asset-display-num">
								<p :title="parseFloat(balanceLists[balanceSelected].BalanceFormat).toFixed(3) || 0">{{parseFloat(balanceLists[balanceSelected].BalanceFormat).toFixed(3) || 0}}</p>
								<p class="asset-display-grey">$ 0</p>
							</div>
						</div>
						<div
							@click="switchToggle.assetDialog = true"
							class="asset-display-li set-asset-display"
						><i class="el-icon-plus"></i></div>
					</div>
					<div class="wallet-deal">
						<el-button
							class="primary"
							@click="getQRCode"
						><i class="ofont ofont-jieshou"></i> <span>Receive</span></el-button>
						<el-button @click="switchToggle.sendDialog = true"><i class="ofont ofont-send"></i> <span>Send</span></el-button>
						<!-- <div @click="getQRCode"><i class="ofont ofont-jieshou"></i> <span class="theme-bold">Receive</span></div> -->
						<!-- <div @click="switchToggle.sendDialog =true"><i class="ofont ofont-send"></i> <span class="theme-bold">Send</span></div> -->
					</div>
				</div>
			</div>
			<div class="wallet-layout-main">
				<div class="tx-select">
					<p
						@click="txType = 'txRecords';txDetailIndex =-1"
						class="select-button"
						:class="{'current-select':txType === 'txRecords'}"
					>All Transfer</p>
					<p
						class="select-button"
						@click="txType = 'transferIn';txDetailIndex =-1"
						:class="{'current-select':txType === 'transferIn'}"
					> Receive</p>
					<p
						class="select-button"
						@click="txType = 'transferOut';txDetailIndex =-1"
						:class="{'current-select':txType === 'transferOut'}"
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
					>
						<div
							@click="txDetailIndex === index?txDetailIndex = -1: txDetailIndex = index "
							class="tx-li-item"
							v-if="balanceLists.length>0"
						>
							<div class="item-addr">
								<i
									class="ofont"
									:class="item.Type ==1 ? 'ofont-send':'ofont-jieshou'"
								></i>
								<div class="addr-info">
									<p
										class='from-or-to'
										:title="item.Type ==1?item.To:item.From"
									>{{item.Type ==1 ? item.To.replace(item.To.slice(5,-5),'...'): item.From.replace(item.From.slice(5,-5),'...')}}</p>
									<p class="tx-date grey-xs">{{date.formatTimeByTimestamp(item.Timestamp * 1000)}}</p>
								</div>
							</div>
							<div class="item-amount">{{item.Type ==1 ? '-':'+'}} {{parseFloat(parseFloat(item.AmountFormat).toFixed(9))}} {{item.Asset.toUpperCase()}}</div>
							<div
								class="item-more"
								v-if="item.BlockHeight>0"
							>
								<i class="el-icon-success"></i>
								<i class="el-icon-more"></i>
							</div>
						</div>
						<div
							class="tx-li-item-detail"
							v-show="index === txDetailIndex"
						>
							<div class="txid grey-xs user-no-select">ID: {{item.Txid || ''}} <i
									class="ofont ofont-fuzhi tx-copy"
									@click="clipText(item.Txid || '')"
									title="click to copy"
								></i></div>
							<div class="towards theme-bold">
								<p class='from user-no-select'>{{item.From}} <i
										class="ofont ofont-fuzhi tx-copy"
										title="click to copy"
										@click="clipText(item.From)"
									></i></p>
								<i class="ofont ofont-fasong arrow"></i>
								<p class="to user-no-select">{{item.To}} <i
										class="ofont ofont-fuzhi tx-copy"
										title="click to copy"
										@click="clipText(item.To)"
									></i></p>
							</div>
							<div class="flex between bottom-info">
								<div class="minerfee"><span class="theme-font-color user-no-select">Miner fee</span> <span class="theme-font-blue bold">{{item.FeeFormat}}</span> {{balanceLists[balanceSelected].Symbol}}</div>
								<div class="flex1"></div>
								<div class="blockheight"><span class="theme-bold user-no-select">Block</span> {{item.BlockHeight}}</div>
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
				:close-on-click-modal='false'
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
						<p class="mr10 theme-font-blue-transparent ft14">{{balanceLists.length>0?balanceLists[balanceSelected].Address : 'Text Addr'}}</p>
						<i
							class="ofont ofont-fuzhi addr_btn"
							@click="clipText(balanceLists[balanceSelected].Address)"
						></i>
						<!-- :aria-label='balanceLists[balanceSelected].Address' -->
					</div>
					<div
						id="qrcode-content"
						class="mb20"
					></div>
					<!-- class="mt20" -->
					<div slot="footer">
						<el-button
							class="done primary"
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
				<div class="loading-content wallet-sendtransfer-loading">
					<div class="send-form-wrap">
						<el-form
							ref='transferForm'
							:model="sendInfo"
							:rules="sendRules"
						>
							<div class="flex between mb10 mt10">
								<p class="theme-font-blue-bold ft14">{{balanceLists[balanceSelected].Symbol}}</p>
								<p
									v-if="balanceLists && balanceLists.length>0"
									class="ft14 tl theme-font-blue-70"
								>{{parseFloat(balanceLists[balanceSelected].BalanceFormat).toFixed(2)}} {{balanceLists[balanceSelected].Symbol}}</p>
							</div>
							<el-form-item
								class="theme-font-blue-bold"
								label="Amount"
								prop="Amount"
							>
								<el-input
									v-model="sendInfo.Amount"
									placeholder="Input Amount"
									min='0'
									type="number"
									class="grey-theme"
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
									class="grey-theme"
									:placeholder="'Input ' +balanceLists[balanceSelected].Symbol.toUpperCase()+' Address'"
								></el-input>
							</el-form-item>
							<el-form-item
								class="theme-font-blue-bold"
								label="Wallet Password"
								prop="Password"
							>
								<el-input
									v-model="sendInfo.Password"
									@keyup.enter.native='sendTransfer'
									show-password
									placeholder="Input Wallet Password"
									type="password"
									class="grey-theme"
								></el-input>
							</el-form-item>
						</el-form>
						<div class="flex between">
							<span></span>
							<div>Miner Fee: 0.01 {{balanceLists[balanceSelected].Symbol}}
							</div>
						</div>
					</div>
					<span slot="footer">
						<el-button
							type="primary"
							class="primary"
							@click="sendTransfer"
						>Transfer</el-button>
					</span>
				</div>
			</el-dialog>
			<el-dialog
				width='600px'
				:close-on-click-modal='false'
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
				<div class="loading-content">
					<ul class="asset-ul mb20">
						<li class="asset-list">
							<img
								class="asset-icon-lg"
								:src="'static/images/logo/' +balanceLists[balanceSelected].Symbol+'.png'"
								alt=""
							>
							<div class="flex1 ml10 tl">
								<p class="theme-font-blue ft18"><span class="bold">{{balanceLists[balanceSelected].Symbol}}</span> <span class="theme-font-blue-40 ft14 ml10 balance-select-name"> {{balanceLists[balanceSelected].Name}}</span></p>
								<p class="theme-font-blue-40 ft14">{{balanceLists[balanceSelected].Address}}</p>
							</div>
							<el-switch
								disabled
								:value='true'
								active-color="#2F8FF0"
							></el-switch>
						</li>
					</ul>
					<div slot="footer">
						<el-button
							type="primary"
							class="primary"
							@click="switchToggle.assetDialog = false"
						>Comfirm</el-button>
					</div>
				</div>
			</el-dialog>
		</div>
	</div>
</template>
<script>
import date from "../assets/tool/date";
import QRCode from "../assets/tool/qrcode.min";
// import ClipboardJS from "clipboard";
const { clipboard } = require("electron");
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
		const validateMount = (rule, value, callback) => {
			const reg = /^[1-9](\d{0,8})\.(\d{1,9})$|^0\.(\d{0,8})[1-9]$|^[1-9](\d{0,8})$/;
			if (!reg.test(value)) {
				callback(new Error("Please enter the correct format"));
				return;
			}
			callback();
		};
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
					},
					{
						validator: validateMount,
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
			childrenChain: 0, //children chain select index
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
			txType: "txRecords",
			user: {
				name: localStorage.getItem("Label") || "",
				address: localStorage.getItem("Address") || ""
			}
		};
	},
	methods: {
		clipSaveAddress() {
			clipboard.writeText(this.user.address);
			this.$message({
				message: "Copied",
				duration: 1200,
				type: "success"
			});
		},
		clipText(content) {
			clipboard.writeText(content);
			this.$message({
				message: "Copied",
				duration: 1200,
				type: "success"
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
					this.setFixed();
					const sendInfo = this.sendInfo;
					sendInfo.Asset = this.balanceLists[this.balanceSelected].Symbol;
					sendInfo.To = sendInfo.To.trim();
					this.$axios
						.post(this.$api.transfer, sendInfo, {
							loading: {
								text: "Transaction processing....",
								target: ".loading-content.wallet-sendtransfer-loading"
							}
						})
						.then(res => {
							if (res.Error === 0) {
								this.sendInfo.Password = "";
								this.$refs.transferForm.resetFields();
								this.switchToggle.sendDialog = false;
								this.$message({
									message: "Successful transfer",
									type: "success"
								});
							} else {
								this.$message.error(this.$i18n.error[res.Error]);
							}
						})
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
			let skipTxCountFromBlock = 0;
			if (height) {
				let txRecords = this.txRecords;
				for (let i = txRecords.length - 1; i >= 0; i--) {
					const element = txRecords[i];
					if (element.BlockHeight == height) {
						skipTxCountFromBlock += 1;
					} else {
						break;
					}
				}
			}
			this.$axios
				.get(
					this.$api.transactions +
						window.localStorage.Address +
						"/0?asset=" +
						asset +
						"&limit=" +
						limit +
						"&height=" +
						height +
						"&skipTxCountFromBlock=" +
						skipTxCountFromBlock,
					{
						cancelToken: new this.$axios.CancelToken(c => {
							this.cancelReachBottomTxRequest = c;
						})
					}
				)
				.then(res => {
					if (res.Error === 0) {
						const transferIn = [];
						const transferOut = [];
						const result = res.Result;
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
					} else {
						this.$message.error(this.$i18n.error[res.Error]);
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
// $theme-font-blue: #040f39;
$theme-font-blue: #202020;
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
	background: #f9f9fb;
	& > .content {
		width: 100%;
		// height: calc(100% - 60px);
		height: 100%;
		padding: 60px 108px;
		display: flex;
		.wallet-aside {
			display: flex;
			width: 284px;
			flex-direction: column;
			justify-content: space-between;
			.person-info {
				width: 100%;
				height: 119px;
				box-shadow: 0px 2px 20px 0px rgba(196, 196, 196, 0.24);
				border-radius: 6px;
				background: #fff;
				color: #202020;
				display: flex;
				justify-content: space-between;
				flex-direction: column;
				padding: 24px 16px;
				.person-info-name {
					font-weight: 400;
				}
				.person-info-address {
					color: rgba(32, 32, 32, 0.4);
					.address {
						display: inline-block;
						width: 230px;
						overflow: hidden;
						text-overflow: ellipsis;
					}
					& > i {
						position: relative;
						top: -2px;
						cursor: pointer;
						&:hover {
							color: rgba(32, 32, 32, 0.7);
						}
						&:active {
							color: rgba(32, 32, 32, 0.4);
						}
					}
				}
			}
			.balance-content-wrapper {
				background: #fff;
				height: calc(100% - 135px);
				box-shadow: 0px 2px 20px 0px rgba(196, 196, 196, 0.24);
				border-radius: 6px;
				padding: 0 15px;
				overflow: auto;
				.wallet-select {
					text-align: right;
					border-bottom: 1px solid rgba(0, 0, 0, 0.1);
					.el-input__inner {
						font-size: 14px;
						color: $theme-font-blue;
						font-weight: bold;
						border-color: #fff !important;
						text-align: center;
						height: 60px;
					}
					.el-select {
						width: 140px;
					}
					.el-select .el-input .el-select__caret {
						font-size: 16px;
						font-weight: bold;
						top: -1px;
						position: relative;
					}
					.prefix-icon {
						margin-left: 20px;
					}
				}
				.wallet-asset {
					display: flex;
					flex-direction: column;
					width: 100%;
					margin: 0;
					padding: 15px 0px;
					border-radius: 2px;
					& > p {
						color: rgba(32, 32, 32, 0.4);
					}
					.total {
						padding: 10px 0px;
						font-size: 32px;
						.symbol {
							font-size: 13px;
							vertical-align: text-top;
						}
					}
				}
				.balance-content {
					flex: 1;
					display: flex;
					flex-direction: column;
					// .child-ul {
					// 	flex: 1;
					// 	min-height: 90px;
					// 	.child-list {
					// 		display: flex;
					// 		justify-content: space-between;
					// 		padding: 8px 20px;
					// 		border-bottom: solid 1px rgba(204, 204, 204, 0.3);
					// 		.name {
					// 			font-size: 16px;
					// 		}
					// 		.balance {
					// 			font-size: 16px;
					// 		}
					// 		&.selected {
					// 			// background-color: rgba(204, 204, 204, 0.3);
					// 		}
					// 	}
					// }
					.asset-display-li {
						cursor: pointer;
						user-select: none;
						background: #f8f9fa;
						text-align: center;
						color: #202020;
						height: 60px;
						width: 100%;
						line-height: 60px;
						font-size: 16px;
						font-weight: bold;
						margin-top: 10px;
						border-radius: 2px;
						&.asset-display {
							padding: 0 15px;
							.asset-display-logo {
								width: 40%;
								text-align: left;
								float: left;
								.asset-icon {
									position: relative;
									top: 2px;
								}
								.asset-display-logo-name {
									margin-left: 5px;
								}
							}
							.asset-display-num {
								width: 60%;
								text-align: right;
								float: right;
								padding: 10px;
								font-size: 16px;
								font-weight: 500;
								p {
									height: 20px;
									line-height: 20px;
									overflow: hidden;
									text-overflow: ellipsis;
									white-space: nowrap;
									&.asset-display-grey {
										color: rgba(32, 32, 32, 0.4);
									}
								}
							}
						}
						&.set-asset-display {
							color: rgba(32, 32, 32, 0.4);
							&:hover {
								opacity: 0.7;
							}
							&.set-asset-display:active {
								opacity: 1;
							}
						}
						&.asset-display-li-select {
							background: #e7e9ef;
						}
					}
				}
				.wallet-deal {
					display: flex;
					justify-content: space-between;
					font-size: 16px;
					padding: 15px 0px;
					& > div {
						cursor: pointer;
					}
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
			box-shadow: 0px 2px 20px 0px rgba(196, 196, 196, 0.24);
			border-radius: 6px;
			padding: 0 30px;
			.tx-select {
				.select-button {
					cursor: pointer;
				}
				display: flex;
				align-items: center;
				font-size: 14px;
				height: 68px;
				border-bottom: 1px solid rgba(0, 0, 0, 0.1);
				.select-button {
					margin-right: 35px;
					cursor: pointer;
					user-select: none;
					color: rgba(32, 32, 32, 0.7);
					&:hover {
						color: #2f8ff0;
					}
					&:active {
						opacity: 0.7;
						color: #2f8ff0;
					}
					&.current-select {
						color: #2f8ff0;
					}
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
						padding: 10px 10px 10px 0;
						border-top: 1px solid rgba(204, 204, 204, 0.3);
						// width: calc(100% - 20px);
						// margin: 0 auto;
						// &:first-child {
						// 	border: 0;
						// }
						.item-addr {
							& > i {
								font-size: 20px;
								margin-right: 15px;
								&.ofont-send {
									color: #ff4f78;
								}
								&.ofont-jieshou {
									color: #52a1ff;
								}
							}
							width: 160px;
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
								// font-weight: bold;
							}
						}
						.item-amount {
							flex: 1;
							font-size: 24px;
							color: #202020;
							width: 100%;
							max-width: 400px;
							margin: 0 auto;
							// text-align: center;
						}
						.item-more {
							display: flex;
							justify-content: space-between;
							flex-direction: column;
							.el-icon-success {
								color: #49c269;
							}
							.el-icon-more {
								color: #040f39;
								opacity: 0.4;
							}
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
						.tx-copy {
							position: relative;
							top: 2px;
							&:hover {
								opacity: 0.7;
							}
							&:active {
								opacity: 1;
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
		// .el-switch.is-checked .el-switch__core {
		// 	background-color: $theme-font-blue;
		// }
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
			color: #2f8ff0;
		}

		&:active {
			color: rgba(47, 143, 240, 0.7);
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
		}
	}
}
</style>
