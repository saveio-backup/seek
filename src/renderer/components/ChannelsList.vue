<template>
	<div id="channels-vue">
		<div
			class="channels"
			v-if="showRadio?channelsDns:channels"
		>
			<el-table
				border
				:data="showRadio?channelsDns:channels"
				ref="singleTable"
				:empty-text='$t("public.noData")'
				height='100%'
				:highlight-current-row='showRadio'
				@current-change="handleCurrentChange"
			>
				<el-table-column
					:label='$t("public.channel")'
					min-width="60px"
					max-width="80px"
					prop="ChannelId"
					sortable
				>
					<template slot-scope="scope">
						<div
							class="bold"
							:class="{'grey-color':!scope.row.IsOnline, 'primary-font-color':scope.row.IsOnline}"
						>{{scope.row.ChannelId}}</div>
					</template>
				</el-table-column>
				<el-table-column
					:label='$t("public.status")'
					min-width="50"
					prop="IsOnline"
					sortable
				>
					<template slot-scope="scope">
						<div :title='scope.row.IsOnline ? $t("public.online") : $t("public.offline")'>{{scope.row.IsOnline ? $t("public.online") : $t("public.offline")}}</div>
					</template>
				</el-table-column>
				<el-table-column
					:label='$t("public.balance")+"(ONI)"'
					prop="Balance"
					sortable
				>
					<template slot-scope="scope">
						<div class="ftpx14">
							{{filterFloat(scope.row.BalanceFormat).toLocaleString('en-US', { maximumFractionDigits: 9 })}}
						</div>
					</template>
				</el-table-column>
				<el-table-column
					:label='$t("public.address")'
					min-width="100"
					prop="Address"
					sortable
				>
					<template slot-scope="scope">
						<div class="ftpx14">
							{{scope.row.Address}}
						</div>
					</template>
				</el-table-column>
				<el-table-column
					label='DNS'
					prop="HostAddr"
					min-width="80px"
					sortable
				>
					<template slot-scope="scope">
						<div class="ftpx14">
							{{scope.row.HostAddr}}
						</div>
					</template>
				</el-table-column>
				<el-table-column
					min-width="40px"
					v-if="showRadio"
				>
					<span class="channel-radio"></span>
				</el-table-column>
				<el-table-column
					min-width="80"
					v-if="showTransfer"
				>
					<template slot-scope="scope">
						<span
							v-show="!scope.row.IsParticipant1Closer && !scope.row.IsParticipant2Closer"
							class="opeation-icon light-blue user-no-select"
							@click="openTransfer(scope.row)"
							:title="$t('public.transfer')"
						>
							<i class="ofont ofont-huazhuan ftpx16"></i>
						</span>
						<span
							v-show="!scope.row.IsParticipant1Closer && !scope.row.IsParticipant2Closer"
							class="opeation-icon light-blue ml20 user-no-select"
							@click="openClose(scope.row)"
							:title="$t('public.closeChannel')"
						>
							<i class="ofont ofont-guanbi ftpx12"></i>
						</span>
						<span
							class="closingWrapper"
							v-show="scope.row.IsParticipant1Closer !== scope.row.IsParticipant2Closer"
						>{{$t('public.settle')}}...</span>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<el-dialog
			class="asset-transfer-dialog"
			width='550px'
			:close-on-click-modal='false'
			:visible.sync="switchToggle.assetTransferDialog"
			center
		>
			<div slot="title">
				<h2>{{$t('public.transfer')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content loading-channel">
				<channel-wallet-transfer
					@closeDialog='switchToggle.assetTransferDialog = false'
					ref="channelwallettransfer"
					:channelSelected='channelSelected'
				></channel-wallet-transfer>
				<div slot="footer">
					<ripper-button
						class="primary"
						@click="toConfirm"
					>{{$t('public.confirm')}}</ripper-button>
				</div>
			</div>
		</el-dialog>
		<el-dialog
			class="channel-opeation-dialog"
			width='600px'
			:close-on-click-modal='false'
			:visible.sync="channelToggle.channelCloseDialog"
			center
		>
			<div slot="title">
				<h2>{{channelToggle.type === 'del' ? $t('public.closeChannel') : $t('public.openChannel')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content loading-content-2">
				<el-form
					ref="channelForm"
					:model="channelForm"
					:rules="dialogRules"
					@submit.native.prevent
				>
					<el-form-item
						class="theme-font-blue"
						:label="$t('public.dnsWalletAddress')"
						prop="partner"
						v-show="channelToggle.type==='add'"
					>
						<el-autocomplete
							class="grey-theme"
							v-model="channelForm.partner"
							:fetch-suggestions="querySearchAsync"
							:placeholder="$t('public.pleaseFillPartnerWalletAddress')"
							@select="handleSelect"
						></el-autocomplete>
					</el-form-item>
					<el-form-item
						class="theme-font-blue form-amount"
						:label="$t('public.amount')+'(ONI)'"
						prop="amount"
						v-if="channelToggle.type==='add'"
					>
						<p class="form-item-title">{{$t('public.RecommendedNoLessThan100ONI')}}</p>
						<el-input
							v-model="channelForm.amount"
							:placeholder="$t('public.pleaseFillAmount')"
							@blur="setFixed"
							@keyup.enter.native="toPeationChannel"
							class="channel-opeation-input grey-theme"
						>
						</el-input>
						<p style="font-weight: 500;"></p>
					</el-form-item>
					<el-form-item
						class="theme-font-blue"
						:label="$t('public.walletPassword')"
						prop="password"
					>
						<el-input
							v-model="channelForm.password"
							:placeholder="$t('public.pleaseInputWalletPassword')"
							@keyup.enter.native="toPeationChannel"
							class="channel-opeation-input grey-theme"
							show-password
							type="password"
						>
						</el-input>
					</el-form-item>
				<div class="minerfee tr rt10"><span class="theme-font-color user-no-select">{{$t('fileManager.gasFee')}}:</span> <span>{{parseInt(channelForm.amount) > 0 ? 0.02: 0.01}}</span> {{balanceLists[balanceSelected] && (balanceLists[balanceSelected].Symbol === 'SAVE' ? 'ONI': balanceLists[balanceSelected].Symbol)}}</div>
				</el-form>
				<div slot="footer">
					<ripper-button @click="channelToggle.channelCloseDialog = false">{{$t('public.cancel')}}</ripper-button>
					<ripper-button
						class="primary ml10"
						@click="toPeationChannel"
					>{{$t('public.confirm')}}</ripper-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { filterFloat, effectiveNumber } from "../assets/config/util";
import channelWalletTransfer from "./ChannelWalletTransfer.vue";
import crypto from "crypto";
export default {
	components: {
		channelWalletTransfer
	},
	props: {
		showRadio: {
			required: false,
			default: false
		},
		showTransfer: {
			required: false,
			default: false
		}
	},
	data() {
		const validateMount = (rule, value, callback) => {
			const vm = this;
			const reg = /^[1-9](\d{0,8})\.(\d{1,9})$|^0\.(\d{0,9})$|^[1-9](\d{0,8})$|^0$/;
			if (!reg.test(value)) {
				callback(new Error(vm.$t("public.pleaseEnterTheCorrectFormat")));
				return;
			}
			callback();
		};
		return {
			settleList: [],
			validateMount,
			switchToggle: {
				assetTransferDialog: false
			},
			channelToggle: {
				channelDialog: false,
				loading: null,
				type: "del" // add or del
			},
			channelForm: {
				password: "",
				partner: "",
				amount: parseFloat(0).toFixed(9),
				channelId: ""
			},
			dialogRules: {
				amount: [
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
				password: [
					{
						required: true,
						message: this.$t("public.pleaseFillPassword"),
						trigger: "blur"
					}
				],
				partner: [
					{
						required: true,
						message: this.$t("public.pleaseFillPartnerWalletAddress"),
						trigger: "change"
					}
				]
			},
			currentRow: {},
			filterFloat,
			effectiveNumber,
			channelSelected: {},
			balanceSelected: 0,
			dns: [],
			timeout: null,
			channelTimeout:null
		};
	},
	mounted() {
		this.initCurrentRow();
	},
	methods: {
		// get all channel select address attr
		getAddr() {
			let arr = [];
			for (let value of this.channels) {
				arr.push(value.Address);
			}
			return arr;
		},
		// get select list
		querySearchAsync(queryString, cb) {
			let allSelectAddr = this.getAddr();
			let restaurants = this.dns.filter(item => {
				if (allSelectAddr.includes(item.WalletAddr)) return false;
				item["value"] = `${item.WalletAddr}(${item.HostAddr})`;
				return true;
			});
			cb(restaurants);
		},
		// dns select callback
		handleSelect(item) {
			this.channelForm.partner = item.WalletAddr;
		},
		getDns() {
			this.$axios.get(this.$api.getAllDns).then(res => {
				if (res.Error === 0) {
					this.dns = res.Result;
				} else {
					this.$message.error(this.$t(`error[${res.Error}]`));
				}
			});
		},
		setFixed() {
			this.channelForm.amount = effectiveNumber(this.channelForm.amount);
		},
		initCurrentRow() {
			let result = this.channelsDns.some((channel, index) => {
				if (
					channel.ChannelId.toString() === localStorage.getItem("channelBindId")
				) {
					this.currentRow = channel;
					this.setCurrent(this.channelsDns[index]);
					return true;
				} else {
					return false;
				}
			});
			if (!result && this.channelsDns.length > 0) {
				// if no bind in localstorage ,  choose first channel
				this.setCurrent(this.channelsDns[0]);
			}
		},
		setCurrent(row) {
			this.$refs.singleTable.setCurrentRow(row);
		},
		handleCurrentChange(currentRow, oldCurrentRow) {
			this.currentRow = currentRow ? currentRow : oldCurrentRow;
			this.channelsDns.map((channel, index) => {
				if (
					channel.ChannelId.toString() === this.currentRow.ChannelId.toString()
				) {
					this.setCurrent(this.channelsDns[index]);
				}
			});
		},
		applyChange() {
			const vm = this;
			if (this.currentRow.ChannelId) {
				this.$emit("toCloseDialog", this.currentRow.ChannelId);
			} else {
				this.$message({
					type: "error",
					message: vm.$t("public.noChannelSwitchesAreAvailable")
				});
			}
		},
		openTransfer(channelSelected) {
			const vm = this;
			if (this.isSync) {
				this.$confirm(
					vm.$t("public.blockUnsynchronizedCompletionAreYouSureToDoThis"),
					vm.$t("public.notice"),
					{
						confirmButtonText: vm.$t("public.confirm"),
						cancelButtonText: vm.$t("public.cancel")
					}
				)
					.then(() => {
						this.channelSelected = channelSelected;
						this.switchToggle.assetTransferDialog = true;
					})
					.catch(e => {});
			} else {
				this.channelSelected = channelSelected;
				this.switchToggle.assetTransferDialog = true;
			}
		},
		toConfirm() {
			this.$refs["channelwallettransfer"].toTransfer();
		},
		openOpen(dnsAdress = "", num = 0) {
			this.getDns();
			this.channelToggle = {
				type: "add",
				channelCloseDialog: true,
				loading: null
			};
			this.$nextTick(() => {
				this.$refs["channelForm"].resetFields();
				this.channelForm.partner = dnsAdress;
				this.channelForm.amount = num;
			});
		},
		openClose(channelSelected) {
			this.channelToggle = {
				type: "del",
				channelCloseDialog: true,
				loading: null
			};
			this.$nextTick(() => {
				this.$refs["channelForm"].resetFields();
				this.channelForm.partner = channelSelected.Address;
				this.channelForm.channelId = channelSelected.ChannelId
			});
		},
		toPeationChannel() {
			const vm = this;
			if(this.channelToggle.type !== "add" && this.channelForm.channelId == localStorage.getItem("channelBindId") && (this.$store.state.Transfer.realDownloadingLength + this.$store.state.Transfer.waitForDownloadOrderList.length > 0)) {
				this.$message.error(vm.$t("error[5001]"))
				return;
			}
			this.$refs["channelForm"].validate(valid => {
				if (!valid) return;
				if (this.channelToggle.type === "add") {
					let params = {
						Password: crypto
							.createHash("sha256")
							.update(vm.channelForm.password)
							.digest("hex"),
						Partner: this.channelForm.partner,
						Amount: this.channelForm.amount + ""
					};
					this.toChannelOpen(params);
				} else {
					let params = {
						Password: crypto
							.createHash("sha256")
							.update(this.channelForm.password)
							.digest("hex"),
						Partner: this.channelForm.partner
					};
					this.toChannelClose(params);
				}
			});
		},
		toChannelOpen(params) {
			const vm = this;
			if (
				(this.channelForm.amount > 0 &&
					this.currentBalanceFormat*Math.pow(10, 9) >=
						(Number(this.channelForm.amount)*Math.pow(10, 9)) + (0.02*Math.pow(10, 9))) ||
				(this.channelForm.amount == 0 &&
					parseFloat(this.currentBalanceFormat) >= 0.01)
			) {
				this.$axios
					.post(this.$api.channelOPen, params, {
						loading: {
							text: vm.$t("public.processing"),
							target: ".loading-content-2"
						},
						// timeout: 6
						timeout: this.$config.outTime * 10000 + 50000
					})
					.then(res => {
						if (res.Error === 0) {
							this.$message({
								message: vm.$t("public.openChannelSuccessed"),
								type: "success"
							});
							this.channelToggle.channelCloseDialog = false;
							this.$store.dispatch("setChannelBalanceTotal");
						} else {
							this.$message.error(this.$t(`error[${res.Error}]`));
						}
					})
					.catch(e => {
						if (!e.message.includes("timeout")) {
							this.$message.error(
								vm.$t("public.networkErrorOpenChannelFailed")
							);
						} else {
							this.$message.error(this.$t('error.requestTimeout'));
						}
					});
			} else {
				this.$message.error(vm.$t("public.insufficientBalanceAvailable"));
			}
		},
		toChannelClose(params) {
			const vm = this;
			this.$axios
				.post(this.$api.channelClose, params, {
					loading: {
						text: vm.$t("public.processing"),
						target: ".loading-content-2"
					},
					timeout: this.$config.outTime * 10000 + 50000
				})
				.then(res => {
					if (res.Error === 0) {
						this.channelToggle.channelDialog = false;
						this.$message({
							message: vm.$t("fileManager.opeationSuccess"),
							type: "success"
						});
						this.channelToggle.channelCloseDialog = false;
						this.$store.dispatch("setChannelBalanceTotal");
					} else {
						this.$message.error(this.$t(`error[${res.Error}]`));
					}
				})
				.catch(e => {
					if (!e.message.includes("timeout")) {
						this.$message.error(vm.$t("public.networkErrorCloseChannelFailed"));
					} else {
						this.$message.error(vm.$t('error.requestTimeout'));
					}
				});
		}
	},
	watch: {
		lang() {
			this.dialogRules = {
				amount: [
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
				password: [
					{
						required: true,
						message: this.$t("public.pleaseFillPassword"),
						trigger: "blur"
					}
				],
				partner: [
					{
						required: true,
						message: this.$t("public.pleaseFillPartnerWalletAddress"),
						trigger: "change"
					}
				]
			};
		},
		channels() {
			const vm = this;
			clearTimeout(this.channelTimeout);
			this.channelTimeout = setTimeout(() => {
				let channels = this.channels;
				let _settleList = JSON.parse(JSON.stringify(vm.settleList));
				for(let value of channels) {
					let _index = _settleList.indexOf(value.ChannelId);
					if(_index !== -1) {
						_settleList.splice(_index, 1);
					} else {
						if(value.IsParticipant1Closer !== value.IsParticipant2Closer){
							vm.settleList.push(value.ChannelId);
						}
					}
				}
				if(_settleList.length === 0) return;
				for(let value of _settleList) {
					this.$message({
						message: `${vm.$t("public.channel")}${value}${vm.$t("public.closeSuccess")}`,
						type: "success"
					});
					let _index = vm.settleList.indexOf(value);
					vm.settleList.splice(_index, 1);
				}
			}, 1000)
		}
	},
	computed: {
		lang() {
			return this.$i18n.locale;
		},
		channels: function() {
			return this.$store.state.Home.channels || [];
		},
		allDns: function() {
			return this.$store.state.Home.dns || [];
		},
		channelsDns: function() {
			if (!this.channels) return [];
			const channelsDns = this.channels.filter(item => {
				return item.IsDNS;
			});
			return channelsDns;
		},
		dnsIsSelect: function() {
			const vm = this;
			return function(item) {
				for (let channel of vm.channels) {
					if (channel.Address === item) {
						return true;
					}
				}
				return false;
			};
		},
		isSync: function() {
			return this.$store.state.Home.isSync || false;
		},
		balanceLists() {
			return this.$store.state.Wallet.balanceLists;
		},
		currentBalanceFormat() {
			// let sum = 0;
			if (!this.balanceLists) return 0;
			for (let value of this.balanceLists) {
				if (value.Symbol === "SAVE") {
					return value.BalanceFormat;
				}
			}
		}
	}
};
</script>
<style lang="scss">
$theme-color: #202020;
#channels-vue {
	flex: 1;
	overflow: hidden;
	border-radius: 6px;
	@include themify {
		box-shadow: $card-shadow;
	}
	.el-select {
		width: 100%;
	}
	.el-autocomplete {
		width: 100%;
	}
}
.channel-opeation-dialog {
	.form-amount {
		position: relative;
		.form-item-title {
			position: absolute;
			top: -3px;
			right: 0;
			text-align: right;
			font-size: 1.4rem;
			font-weight: 500;
			@include themify {
				color: $primary-font-color;
			}
		}
	}
}
.channels {
	height: 100%;
	overflow-y: auto;
	border-bottom-left-radius: 2px;
	border-bottom-right-radius: 2px;
	padding: 0 20px;
	@include themify {
		background-color: $card-color;
	}
	.el-table {
		tr,
		td,
		th,
		& {
			@include themify {
				background-color: $card-color;
			}
		}
	}
	.current-row {
		.channel-radio {
			position: relative;
			border-color: #409eff;
			background: #409eff;
			&::after {
				content: "";
				position: absolute;
				border-radius: 100%;
				width: 5px;
				height: 5px;
				left: 50%;
				top: 50%;
				background: #fff;
				transform: translateX(-50%) translateY(-50%);
			}
		}
	}
	.channel-radio {
		position: relative;
		border: 1px solid #dcdfe6;
		display: inline-block;
		border-radius: 100%;
		width: 14px;
		height: 14px;
	}

	.opeation-icon {
		display: inline-block;
		width: 32px;
		height: 32px;
		cursor: pointer;
		border-radius: 50%;
		text-align: center;
		line-height: 32px;

		&:hover {
			@include themify {
				background-color: $color;
			}
		}

		&:active {
			opacity: 0.7;
		}
	}
}
.closingWrapper {
	width: 40px;
	color: #49c269;
	overflow: hidden;
	white-space: nowrap;
	display: block;
	animation: closingAnmiation 1.5s linear infinite;
}
@keyframes closingAnmiation {
	0% {
		width: 40px;
	}
	24% {
		width: 40px;
	}
	25% {
		width: 43px;
	}
	49% {
		width: 43px;
	}
	50% {
		width: 46px;
	}
	74% {
		width: 46px;
	}
	75% {
		width: 49px;
	}
	99% {
		width: 49px;
	}
	100% {
		width: 40px;
	}
}
</style>
