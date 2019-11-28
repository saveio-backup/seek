<template>
	<div id="wallet">
		<div class="content">
			<div class="wallet-aside">
				<div class="person-info">
					<p
						class="person-info-name ftpx24"
						:title="user.name || ''"
					>{{user.name || ''}}</p>
					<p class="person-info-address ftpx12">
						<span
							class="address"
							:title="user.address || ''"
						>
							{{user.address || ''}}
						</span>
						<i
							class="ofont ofont-fuzhi"
							:title="$t('public.copy')"
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
								:label="item.Symbol === 'SAVE' ? 'ONI' : item.Symbol"
								:value='index'
								class="asset-item"
								:disabled="item.Symbol !== 'SAVE'"
							>
								<img
									class="asset-icon mr10"
									:src="'static/images/logo/'+ item.Symbol+ '.png'"
									:alt="item.Symbol"
								> <span class="">{{item.Symbol === 'SAVE' ? 'ONI' : item.Symbol}}</span>
							</el-option>
						</el-select>
					</div>
					<div class="wallet-asset">
						<p class="ft14 user-no-select">{{$t('wallet.totalBalance')}}:</p>
						<div class="total"> <span class="symbol"></span> <span v-if="balanceLists && balanceLists.length>0">{{effectiveNumber(balanceLists[balanceSelected].BalanceFormat)}}</span></div>
					</div>
					<div
						class="balance-content"
						v-if="balanceLists && balanceLists.length>0"
					>
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
								<span class="asset-display-logo-name">{{balanceLists[balanceSelected].Symbol === 'SAVE' ? 'ONI' : balanceLists[balanceSelected].Symbol}}</span>
							</div>
							<div class="asset-display-num">
								<p :title="effectiveNumber(balanceLists[balanceSelected].BalanceFormat) || 0">{{effectiveNumber(balanceLists[balanceSelected].BalanceFormat) || 0}}</p>
								<p class="asset-display-grey">$ 0</p>
							</div>
						</div>
						<div
							@click="switchToggle.assetDialog = true"
							class="asset-display-li set-asset-display"
						><i class="el-icon-plus"></i></div>
					</div>
					<div class="wallet-deal">
						<ripper-button
							@click="getQRCode"
							class="primary"
						><i class="ofont ofont-jieshou"></i> <span>{{$t('wallet.receive')}}</span></ripper-button>
						<ripper-button @click="switchToggle.sendDialog = true"><i class="ofont ofont-send"></i> <span>{{$t('wallet.send')}}</span></ripper-button>
					</div>
				</div>
			</div>
			<div class="wallet-layout-main">
				<div class="flex between ai-center">
					<div class="tx-select">
						<p
							@click="txType = 'txRecords';txDetailIndex =-1"
							class="select-button"
							:class="{'current-select':txType === 'txRecords'}"
						>{{$t('wallet.allTransfer')}}</p>
						<p
							class="select-button"
							@click="txType = 'transferIn';txDetailIndex =-1"
							:class="{'current-select':txType === 'transferIn'}"
						> {{$t('wallet.receive')}}</p>
						<p
							class="select-button"
							@click="txType = 'transferOut';txDetailIndex =-1"
							:class="{'current-select':txType === 'transferOut'}"
						>{{$t('wallet.send')}}</p>
					</div>
					<div class="ft14 wallet-layout-switch">
						<el-switch
							v-model="IgnoreOtherContract"
							inactive-text="Show Contract"
							@change="changeShowContract"
						>
						</el-switch>
					</div>
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
								<span class="transfer-is-done">
									<i class="ofont ofont-wancheng"></i>
								</span>
								<p
									class='from-or-to-hash'
									:title="item.Type ==1?item.To:item.From"
								>{{item.Type ==1 ? item.To : item.From}}</p>
								<div class="addr-info">
									<p class='from-or-to'></p>
									<p class="tx-date grey-xs">{{date.formatTimeByTimestamp(item.Timestamp * 1000)}}</p>
								</div>
							</div>
							<div
								class="item-amount"
								:class="{'send-item-amount': item.Type ==1, 'item-contract-amount': item.ContractType == 1}"
							>{{item.Type ==1 ? '-':'+'}} {{effectiveNumber(item.AmountFormat)}} {{(item.Asset).toUpperCase() === 'SAVE' ? 'ONI' : (item.Asset).toUpperCase()}}</div>
							<div
								class="item-contract ft12 grey-xs user-no-select"
								v-if="item.ContractType == 1"
							>
								<div>
									{{$t('wallet.contract')}}
								</div>
							</div>
							<div
								class="item-more"
								v-if="item.BlockHeight>0"
							>
								<!-- <i class="el-icon-success"></i> -->
								<i class="el-icon-more"></i>
							</div>
						</div>
						<div
							class="tx-li-item-detail theme-font-color"
							v-show="index === txDetailIndex"
						>
							<div class="txid grey-xs user-no-select">{{$t('wallet.id')}}:
								<span :title="item.Txid || ''">
									{{item.Txid || ''}}
								</span>
								<i
									class="ofont ofont-fuzhi tx-copy"
									@click="clipText(item.Txid || '')"
									:title="$t('public.copy')"
								></i></div>
							<div class="towards">
								<p class='from user-no-select'>
									<span :title="item.From">
										{{item.From}}
									</span>
									<i
										class="ofont ofont-fuzhi tx-copy"
										:title="$t('public.copy')"
										@click="clipText(item.From)"
									></i></p>
								<i class="ofont ofont-fasong arrow ft12"></i>
								<p class="to user-no-select">
									<span :title="item.To">
										{{item.To}}
									</span>
									<i
										class="ofont ofont-fuzhi tx-copy"
										:title="$t('public.copy')"
										@click="clipText(item.To)"
									></i></p>
							</div>
							<div class="flex between bottom-info">
								<div class="minerfee"><span class="theme-font-color user-no-select">{{$t('wallet.minerfee')}}:</span> <span>{{item.FeeFormat}}</span> {{balanceLists[balanceSelected].Symbol === 'SAVE' ? 'ONI': balanceLists[balanceSelected].Symbol}}</div>
								<div class="flex1"></div>
								<div class="blockheight"><span class="user-no-select">{{$t('wallet.block')}}:</span> {{item.BlockHeight}}</div>
							</div>
						</div>
					</li>
					<li
						v-show="switchToggle.showLoading"
						class="loading text-center transparent mt20 mb20"
					>
						<i class="el-icon-loading"></i>
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
					<h2>{{$t('wallet.receive')}}</h2>
					<div class="dialog-title-border"></div>
				</div>
				<div class="flex ai-center column">
					<div class="flex ai-center mb10">
						<p class="mr10 ftpx14">{{balanceLists.length>0?balanceLists[balanceSelected].Address : $t('wallet.textAddr')}}</p>
						<i
							class="ofont ofont-fuzhi addr_btn"
							:title="$t('public.copy')"
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
						<ripper-button
							class="done primary"
							type="primary"
							@click="switchToggle.receiveDialog = false"
						>{{$t('wallet.done')}}</ripper-button>
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
					<h2>{{$t('public.transfer')}}</h2>
					<div class="dialog-title-border mt10"></div>
				</div>
				<div class="loading-content wallet-sendtransfer-loading">
					<div class="send-form-wrap">
						<el-form
							ref='transferForm'
							:model="sendInfo"
							:rules="sendRules"
							@submit.native.prevent
						>
							<div class="flex between mb10 mt10">
								<p class="ftpx14">{{balanceLists[balanceSelected].Symbol === 'SAVE' ? 'ONI' : balanceLists[balanceSelected].Symbol}}</p>
								<p
									v-if="balanceLists && balanceLists.length>0"
									class="ftpx14 tl"
								>{{effectiveNumber(balanceLists[balanceSelected].BalanceFormat)}} {{balanceLists[balanceSelected].Symbol === 'SAVE' ? 'ONI' : balanceLists[balanceSelected].Symbol}}</p>
							</div>
							<el-form-item
								class="theme-font-blue-bold"
								:label="$t('wallet.sendTo')"
								prop="To"
							>
								<el-input
									v-model="sendInfo.To"
									class="grey-theme"
									:placeholder="$t('wallet.input') +(balanceLists[balanceSelected].Symbol === 'SAVE' ? 'ONI' : balanceLists[balanceSelected].Symbol).toUpperCase()+$t('wallet.address')"
								></el-input>
							</el-form-item>
							<el-form-item
								class="theme-font-blue-bold"
								:label="$t('public.amount')"
								prop="Amount"
							>
								<el-input
									v-model="sendInfo.Amount"
									:placeholder="$t('public.inputAmount')"
									min='0'
									type="number"
									class="grey-theme"
									@blur="setFixed"
								></el-input>
							</el-form-item>
							<el-form-item
								class="theme-font-blue-bold"
								:label="$t('public.walletPassword')"
								prop="Password"
							>
								<el-input
									v-model="sendInfo.Password"
									@keyup.enter.native='sendTransfer'
									show-password
									:placeholder="$t('public.pleaseInputWalletPassword')"
									type="password"
									class="grey-theme"
								></el-input>
							</el-form-item>
						</el-form>
						<div class="flex between">
							<span></span>
							<div>{{$t('wallet.minerfee')}}: 0.01 {{balanceLists[balanceSelected].Symbol === 'SAVE' ? 'ONI' :balanceLists[balanceSelected].Symbol}}
							</div>
						</div>
					</div>
					<span slot="footer">
						<ripper-button
							type="primary"
							class="primary"
							@click="sendTransfer"
						>{{$t('public.transfer')}}</ripper-button>
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
					<h2>{{$t('wallet.myAssets')}}</h2>
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
								<p class="ft18"><span class="bold">{{balanceLists[balanceSelected].Symbol === 'SAVE' ? 'ONI' : balanceLists[balanceSelected].Symbol}}</span> <span class="ft14 ml10 balance-select-name"> {{balanceLists[balanceSelected].Name === 'Save Power' ? 'Oni Power' : balanceLists[balanceSelected].Name}}</span></p>
								<p class="ft14">{{balanceLists[balanceSelected].Address}}</p>
							</div>
							<el-switch
								disabled
								:value='true'
								active-color="#2F8FF0"
							></el-switch>
						</li>
					</ul>
					<div slot="footer">
						<ripper-button
							class="primary"
							@click="switchToggle.assetDialog = false"
						>{{$t('public.confirm')}}</ripper-button>
					</div>
				</div>
			</el-dialog>
		</div>
	</div>
</template>
<script>
import date from "../assets/tool/date";
import QRCode from "../assets/tool/qrcode.min";
import { effectiveNumber } from "../assets/config/util";
import { round } from "mathjs";
import crypto from "crypto";
const { clipboard } = require("electron");
export default {
	mounted() {
		document.title = this.$t("wallet.wallet");
		this.$store.dispatch("setCurrentAccount"); // get login status
		this.$store.dispatch("setBalanceLists");
		this.$store.dispatch("setTxRecords", {IgnoreOtherContract: !this.IgnoreOtherContract});
		this.addListenScroll(
			document.querySelector(".tx-ul"),
			100,
			this.loadTxRecords
		);
	},
	data() {
		const validateMount = (rule, value, callback) => {
			const vm = this;
			const reg = /^[1-9](\d{0,8})\.(\d{1,9})$|^0\.(\d{0,8})[1-9]$|^[1-9](\d{0,8})$/;
			if (!reg.test(value)) {
				callback(new Error(vm.$t("public.pleaseEnterTheCorrectFormat")));
				return;
			} else if (
				parseFloat(value) > vm.balanceLists[vm.balanceSelected].BalanceFormat
			) {
				callback(new Error(vm.$t("public.insufficientBalanceAvailable")));
				return;
			}
			callback();
		};
		return {
			validateMount,
			effectiveNumber,
			round,
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
						message: this.$t("public.pleaseFillAmount"),
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
						message: this.$t("wallet.pleaseFillAddress"),
						trigger: "blur"
					}
				],
				Password: [
					{
						required: true,
						message: this.$t("public.pleaseFillPassword"),
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
			},
			IgnoreOtherContract: true
		};
	},
	methods: {
		clipSaveAddress() {
			const vm = this;
			clipboard.writeText(this.user.address);
			this.$message({
				message: vm.$t("public.copied"),
				duration: 1200,
				type: "success"
			});
		},
		clipText(content) {
			const vm = this;
			clipboard.writeText(content);
			this.$message({
				message: vm.$t("public.copied"),
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
			const vm = this;
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
								: vm.$t("wallet.qrcodeNotFound"),
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
			const vm = this;
			if (this.switchToggle.loading) return;
			this.$refs.transferForm.validate(valid => {
				if (valid) {
					this.setFixed();
					const sendInfo = Object.assign({}, this.sendInfo);
					sendInfo.Asset = this.balanceLists[this.balanceSelected].Symbol;
					sendInfo.To = sendInfo.To.trim();
					sendInfo.Password = crypto
						.createHash("sha256")
						.update(sendInfo.Password)
						.digest("hex");
					this.$axios
						.post(this.$api.transfer, sendInfo, {
							loading: {
								text: vm.$t("public.transactionProcessing"),
								target: ".loading-content.wallet-sendtransfer-loading"
							}
						})
						.then(res => {
							if (res.Error === 0) {
								this.sendInfo.Password = "";
								this.$refs.transferForm.resetFields();
								this.switchToggle.sendDialog = false;
								this.$message({
									message: vm.$t("public.transferSuccess"),
									type: "success"
								});
							} else {
								this.$message.error(this.$t(`error[${res.Error}]`));
							}
						})
						.catch(e => {
							if (!e.message.includes("timeout")) {
								this.$message.error(vm.$t("public.networkErrorTransferFailed"));
							}
						});
				}
			});
		},
		loadTxRecords() {
			if (!this.switchToggle.loadSwitch) return;
			this.$store.dispatch("cancelTxRequest");
			this.switchToggle.loadSwitch = false;
			this.switchToggle.showLoading = true;
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
					`${this.$api.transactions}${window.localStorage.Address}/0?asset=${asset}&limit=${limit}&height=${height}&skipTxCountFromBlock=${skipTxCountFromBlock}&IgnoreOtherContract=${!this.IgnoreOtherContract}`,
					{
						cancelToken: new this.$axios.CancelToken(c => {
							this.cancelReachBottomTxRequest = c;
						}),
						timeout: 60000
					}
				)
				.then(res => {
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
						IgnoreOtherContract: !this.IgnoreOtherContract,
						asset
					});
					if (result.length === 0) {
						this.switchToggle.loadSwitch = false;
					} else {
						this.switchToggle.loadSwitch = true;
					}
				})
				.catch(err => {
					this.switchToggle.loadSwitch = true;
					console.log(err);
				})
				.finally(() => {
					this.switchToggle.showLoading = false;
				});
		},
		changeSelectedAsset() {
			this.cancelReachBottomTxRequest && this.cancelReachBottomTxRequest();
			this.$store.dispatch("cancelTxRequest");
			const asset = this.balanceLists[this.balanceSelected].Symbol || "";
			this.$store.dispatch("setTxRecords", { asset,IgnoreOtherContract: !this.IgnoreOtherContract });
		},
		changeShowContract() {
			this.cancelReachBottomTxRequest && this.cancelReachBottomTxRequest();
			this.$store.dispatch("cancelTxRequest");
			this.$store.commit('SET_TX_RECORDS', []);
			this.$store.dispatch("setTxRecords", {IgnoreOtherContract: !this.IgnoreOtherContract});
		}
	},
	computed: {
		lang() {
			return this.$i18n.locale;
		},
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
	},
	watch: {
		lang() {
			document.title = this.$t("wallet.wallet");
			this.sendRules = {
				Amount: [
					{
						required: true,
						message: this.$t("public.pleaseFillAmount"),
						trigger: "blur"
					},
					{
						validator: this.validateMount,
						trigger: "blur"
					}
				],
				To: [
					{
						required: true,
						message: this.$t("wallet.pleaseFillAddress"),
						trigger: "blur"
					}
				],
				Password: [
					{
						required: true,
						message: this.$t("public.pleaseFillPassword"),
						trigger: "blur"
					}
				]
			};
		},
		txRecords(newVal, oldVal) {
			if (newVal.length == 0 || oldVal.length == 0) {
				this.switchToggle.loadSwitch = true;
				return;
			} else if (
				newVal[0].Txid == oldVal[0].Txid &&
				newVal.length === oldVal.length
			) {
				// txRecord not changed
				return;
			} else {
				this.switchToggle.loadSwitch = true;
			}
		},
		txType(newVal, oldVal) {
			this.switchToggle.loadSwitch = true;
		}
	}
};
</script>
<style lang="scss">
$light-grey: #f7f7f7;
#wallet {
	display: flex;
	flex: 1;
	height: 100%;
	flex-direction: column;
	& > .content {
		width: 100%;
		// height: calc(100% - 60px);
		height: 100%;
		padding: 60px 108px;
		display: flex;
		.wallet-aside {
			display: flex;
			width: 290px;
			flex-direction: column;
			justify-content: start;
			.person-info {
				width: 100%;
				height: 119px;
				background: linear-gradient(
					90deg,
					rgba(19, 176, 250, 1) 0%,
					rgba(62, 126, 235, 1) 100%
				);
				@include themify {
					background-color: $card-color;
				}
				border-radius: 6px;
				color: #fff;
				display: flex;
				justify-content: space-between;
				flex-direction: column;
				padding: 24px 10px;
				font-weight: 400;
				.person-info-name {
					overflow: hidden;
					text-overflow: ellipsis;
				}
				.person-info-address {
					.address {
						display: inline-block;
						width: 250px;
						overflow: hidden;
						text-overflow: ellipsis;
					}
					& > i {
						position: relative;
						top: -2px;
						cursor: pointer;
						&:hover {
							opacity: 0.7;
						}
						&:active {
							opacity: 1;
						}
					}
				}
			}
			.balance-content-wrapper {
				@include themify {
					background-color: $card-color;
					box-shadow: $card-shadow;
				}
				margin-top: 26px;
				max-height: calc(100% - 135px);
				box-shadow: 0px 2px 20px 0px rgba(196, 196, 196, 0.24);
				border-radius: 6px;
				padding: 0 15px;
				overflow: auto;
				.wallet-select {
					text-align: right;
					border-bottom: solid 1px;
					@include themify {
						border-color: $table-border-color;
					}
					.el-input__inner {
						@include themify {
							color: $font-color;
							background-color: $card-color;
						}
						border: none;
						font-size: 1.4rem;
						font-weight: bold;
						border-color: #fff !important;
						text-align: center;
						height: 60px;
					}
					.el-select {
						width: 140px;
					}
					.el-select .el-input .el-select__caret {
						font-size: 1.6rem;
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
						@extend .grey-xs;
					}
					.total {
						@include themify {
							color: $font-color;
						}
						padding: 10px 0px;
						font-size: 32px;
						.symbol {
							font-size: 1.3rem;
							vertical-align: text-top;
						}
					}
				}
				.balance-content {
					flex: 1;
					display: flex;
					flex-direction: column;
					.asset-display-li {
						@extend .theme-bg;
						@extend .theme-font-color;
						cursor: pointer;
						user-select: none;
						text-align: center;
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
										@extend .grey-xs;
									}
								}
							}
						}
						&.set-asset-display {
							// color: rgba(32, 32, 32, 0.4);
							&:hover {
								opacity: 0.7;
							}
							&.set-asset-display:active {
								opacity: 1;
							}
						}
					}
				}
				.wallet-deal {
					display: flex;
					justify-content: space-between;
					font-size: 1.6rem;
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
			@include themify {
				background-color: $card-color;
				box-shadow: $card-shadow;
			}
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
				font-size: 1.4rem;
				height: 68px;
				.select-button {
					margin-right: 35px;
					cursor: pointer;
					user-select: none;
					@extend .theme-font-color;
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

			.wallet-layout-switch {
				.el-switch__label {
					color: rgba(32, 32, 32, 0.4);
				}

				.el-switch__core {
					width: 26px !important;
					height: 16px !important;

					&:after {
						width: 12px;
						height: 12px;
						margin-left: 0px;
					}
				}
				.el-switch.is-checked {
					.el-switch__core::after {
						margin-left: -13px;
					}
				}
			}

			.tx-ul {
				flex: 1;
				overflow-y: auto;
				.tx-li {
					cursor: pointer;
					width: 100%;

					.tx-li-item {
						display: flex;
						align-items: center;
						font-size: 1.6px;
						padding: 10px 10px 10px 0;
						border-top: 1px solid rgba(204, 204, 204, 0.3);
						position: relative;
						.from-or-to-hash {
							position: absolute;
							top: 12px;
							left: 45px;
							@extend .theme-font-color;
						}
						// width: calc(100% - 20px);
						// margin: 0 auto;
						// &:first-child {
						// 	border: 0;
						// }
						.item-addr {
							& > .transfer-is-done {
								width: 30px;
								height: 30px;
								@include themify {
									background-color: $table-hover-bg;
								}
								border-radius: 50%;
								line-height: 30px;
								text-align: center;
								margin-right: 15px;
								i {
									font-size: 16px;
									&.ofont-wancheng {
										color: #52a1ff;
									}
								}
							}
							width: 190px;
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
							}
						}
						.item-amount {
							flex: 1;
							font-size: 14px;
							color: #8bd179;
							width: 100%;
							// max-width: 400px;
							margin: 0 auto;
							text-align: center;
							&.send-item-amount {
								color: #eb8b7e;
							}
							&.item-contract-amount {
								margin-left: calc(94px + 3%);
							}
						}
						.item-contract {
							margin: 0 3% 0 5px;
							width: 80px;
							height: 20px;
							& > div {
								@extend .theme-font-color;
								width: 100%;
								height: 100%;
								border: 1px solid rgba(237, 239, 244, 1);
								border-radius: 1px;
								text-align: center;
								line-height: 20px;
								border-radius: 10px;
							}
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
						@include themify {
							background-color: $color;
						}
						padding: 10px 45px;
						& > .txid {
							& > span {
								display: inline-block;
								max-width: calc(100% - 60px);
								overflow: hidden;
								text-overflow: ellipsis;
								white-space: nowrap;
								position: relative;
								top: 3px;
							}
							& > i {
								position: relative;
								top: 2px;
							}
						}
						.towards {
							display: flex;
							padding: 10px 0;
							.from,
							.to {
								width: 400px;
								max-width: 50%;
								font-size: 12px;
								word-break: break-all;
								& > span {
									display: inline-block;
									max-width: calc(100% - 60px);
									overflow: hidden;
									text-overflow: ellipsis;
									white-space: nowrap;
								}
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
							margin-left: 8px;
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
	}
	.el-dialog__footer {
		.el-button {
			padding: 8px 22px;
		}
	}
}
</style>
