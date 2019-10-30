<template>
	<div class="channel-wallet-transfer">
		<div class="flex between pl30 pr30 mb20 mt20">
			<div
				v-if="withDraw && channelSelected.IsOnline"
				class="flex1 text-left"
			>
				<p class="theme-font-blue-40 transparent ft14 user-no-select">{{$t('public.channel')}}(ONI)</p>
				<p class="theme-font-blue ftpx24 mt10">{{filterFloat(channelSelected.BalanceFormat || 0)}}</p>
				<!-- <p class="theme-font-blue transparent ft12 bold">{{channelSelected.Address}}</p> -->
			</div>
			<div
				v-else
				class="flex1 text-left"
			>
				<p class="theme-font-blue-40 transparent ft14 user-no-select">{{$t('public.wallet')}}(ONI)</p>
				<p class="theme-font-blue ftpx24 mt10">{{filterFloat(mainCount)}}</p>
			</div>
			<div class="flex column between">
				<i class="ofont ofont-fasong"></i>
				<i
					class="ofont ofont-huazhuan ftpx20 user-no-select"
					:class="{'ex-change': channelSelected.IsOnline,'theme-font-blue-40 cursor-not-allowed':!channelSelected.IsOnline}"
					:title="channelSelected.IsOnline?$t('public.switchover'):$t('public.SorryYouCannotWithdrawInOfflineStatus')"
					@click="exWithDraw()"
				></i></div>
			<div
				v-if="!withDraw || !channelSelected.IsOnline"
				class="flex1 text-right"
			>
				<p class="theme-font-blue-40 transparent ft14 user-no-select">{{$t('public.channel')}}(ONI)</p>
				<p class="theme-font-blue ftpx24 mt10">{{filterFloat(channelSelected.BalanceFormat || 0)}}</p>
				<!-- <p class="theme-font-blue transparent ft12 bold">{{channelSelected.Address}}</p> -->
			</div>
			<div
				v-else
				class="flex1 text-right"
			>
				<p class="theme-font-blue-40 transparent ft14 user-no-select">{{$t('public.wallet')}}(ONI)</p>
				<p class="theme-font-blue ftpx24 mt10">{{filterFloat(mainCount)}}</p>
			</div>
		</div>
		<el-form
			ref="transferForm"
			class="transferForm"
			:model="transferInfo"
			:rules="transferRules"
			@submit.native.prevent
		>
			<el-form-item
				:label="$t('public.amount')+'(ONI)'"
				prop="Amount"
			>
				<el-input
					class="transfer-input grey-theme"
					type="number"
					ref="transferAmount"
					min='0'
					v-model="transferInfo.Amount"
					:placeholder="$t('public.inputAmount')"
					@keyup.enter.native='toTransfer'
					@blur="setFixed"
				>
				</el-input>
			</el-form-item>
			<el-form-item
				:label="$t('public.walletPassword')"
				prop="Password"
			>
				<el-input
					class="transfer-input grey-theme"
					v-model="transferInfo.Password"
					:placeholder="$t('public.pleaseInputWalletPassword')"
					show-password
					@keyup.enter.native='toTransfer'
					type="password"
				></el-input>
			</el-form-item>
		</el-form>
	</div>
</template>
<script>
import { filterFloat } from "../assets/config/util";
import crypto from "crypto";
export default {
	props: {
		channelSelected: {
			required: true,
			type: Object // 0 upload 1 download
		}
	},
	data() {
		const validateMount = (rule, value, callback) => {
			const vm = this;
			const reg = /^[1-9](\d{0,8})\.(\d{1,9})$|^0\.(\d{0,9})$|^[1-9](\d{0,8})$/;
			if (!reg.test(value)) {
				callback(new Error(vm.$t('public.pleaseEnterTheCorrectFormat')));
				return;
			}
			if (this.withDraw && this.channelSelected.IsOnline) {
				if (value * 1 > this.channelSelected.BalanceFormat * 1) {
					callback(new Error(vm.$t('public.insufficientBalanceAvailable')));
					return;
				}
			} else {
				if (value * 1 > this.mainCount * 1) {
					callback(new Error(vm.$t('public.insufficientBalanceAvailable')));
					return;
				}
			}
			callback();
		};
		return {
			validateMount,
			switchToggle: { loading: null },
			filterFloat,
			withDraw: true,
			transferInfo: {
				Amount: "",
				Password: ""
			},
			transferRules: {
				Amount: [
					{
						required: true,
						message: this.$t('public.pleaseFillAmount'),
						trigger: "blur"
					},
					{
						validator: validateMount,
						trigger: "blur"
					}
				],
				Password: [
					{
						required: true,
						message: this.$t('public.pleaseFillPassword'),
						trigger: "blur"
					}
				]
			}
		};
	},
	methods: {
		exWithDraw() {
			const vm = this;
			if (!this.channelSelected.IsOnline) {
				this.$message({
					message: vm.$t('public.SorryYouCannotWithdrawInOfflineStatus')
				});
				return;
			}
			this.withDraw = !this.withDraw;
			const INIT_AMOUNT = "";
			if (this.transferInfo.Amount !== INIT_AMOUNT) {
				this.$refs.transferAmount.$refs.input.focus();
				this.$nextTick(() => {
					this.$refs.transferAmount.$refs.input.blur();
				});
			}
		},
		setFixed() {
			this.transferInfo.Amount = this.transferInfo.Amount
				? parseFloat(this.transferInfo.Amount).toFixed(9)
				: "";
		},
		toTransfer() {
			const vm = this;
			if (this.switchToggle.loading) return;
			if (!this.channelSelected) {
				this.emitMessage(vm.$t('public.pleaseChooseChannelAddress'), "error");
				return;
			}
			this.$refs.transferForm.validate(valid => {
				if (valid) {
					const addr =
						this.withDraw && this.channelSelected.IsOnline
							? this.$api.withdrawChannel
							: this.$api.depositChannel;
					this.$axios
						.post(
							addr,
							{
								Partner: this.channelSelected.Address,
								Amount: this.transferInfo.Amount,
								Password: crypto.createHash('sha256').update(vm.transferInfo.Password).digest('hex')
							},
							{
								loading: {
									target: ".loading-content.loading-channel",
									text: vm.$t('public.transactionProcessing')
								},
								timeout: (this.$config.outTime * 10000 + 50000)
							}
						)
						.then(res => {
							if (res.Error === 0) {
								// this.transferInfo.Amount = 0; // reset
								// this.transferInfo.Password = ""; // reset
								this.$refs.transferForm.resetFields();
								this.$message({
									message: vm.$t('public.transferSuccess'),
									type: "success"
								});
								this.$emit("closeDialog");
								this.initBalanceRequest();
							} else {
								this.$message.error(this.$t(`error[${res.Error}]`));
							}
						})
						.catch(e => {
							if (!e.message.includes("timeout")) {
								this.$message.error(vm.$t('public.networkErrorTransferFailed'));
							}
						});
				}
			});
		},
		initBalanceRequest() {
			this.$store.dispatch("setBalanceLists");
			this.$store.dispatch("setChannelBalanceTotal");
		}
	},
	watch: {
		lang() {
			this.transferRules = {
				Amount: [
					{
						required: true,
						message: this.$t('public.pleaseFillAmount'),
						trigger: "blur"
					},
					{
						validator: this.validateMount,
						trigger: "blur"
					}
				],
				Password: [
					{
						required: true,
						message: this.$t('public.pleaseFillPassword'),
						trigger: "blur"
					}
				]
			}
		}
	},
	computed: {
		lang() {
			return this.$i18n.locale;
		},
		mainCount: function() {
			return this.$store.state.Wallet.mainCount;
		}
	}
};
</script>
<style lang="scss">
$theme-font-blue: #202020;
.channel-wallet-transfer {
	.transferForm {
		padding: 0 30px;
	}
	.ofont-fasong {
		color: #cdcfd8;
	}
	.ofont-huazhuan {
		width: 36px;
		height: 36px;
		text-align: center;
		line-height: 36px;
		border-radius: 50%;
		&.ex-change {
			color: #2f8ff0;
			cursor: pointer;
			&:hover {
				background: #edeff4;
			}
			&:active {
				opacity: 0.7;
				// opacity: 1;
			}
		}
	}
	.transfer-input {
		&.el-input {
			// .el-input__inner {
			// background: #ebecef;
			// height: 35px;
			// line-height: 35px;
			// border-radius: 2px;
			// border: none;
			// &:focus {
			// 	border: none;
			// }
			// }
			.el-input-group__append {
				background: none;
				border: none;
				color: $theme-font-blue;
				font-weight: bold;
			}
		}
	}
	.el-button {
		padding: 8px 16px;
		border-radius: 2px;
	}
}
</style>
