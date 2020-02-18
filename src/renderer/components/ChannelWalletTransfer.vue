<template>
	<div class="channel-wallet-transfer">
		<div class="flex between pl30 pr30 mb20 mt20">
			<div class="flex column between">
				<p>From</p>
				<i class="ofont ofont-fasong"></i>
				<p>To</p>
			</div>
			<div class="middle flex1">
				<div
					v-if="withDraw && channelSelected.IsOnline"
					class="flex1 flex between rectangle mb10"
				>
					<p class="tertiary-font-color ft14 transfer-title">{{$t('public.channel')}}</p>
					<p class="ftpx14 bold flex1 tl">{{effectiveNumber(filterFloat(channelSelected.BalanceFormat || 0))}}</p>
					<p class="bold">ONI</p>
				</div>
				<div
					v-else
					class="flex1 flex between rectangle  mb10"
				>
					<p class="tertiary-font-color ft14 transfer-title">{{$t('public.wallet')}}</p>
					<p class="ftpx14 bold flex1 tl">{{effectiveNumber(filterFloat(mainCount)) || 0}}</p>
					<p class="bold">ONI</p>
				</div>
				<div
					v-if="!withDraw || !channelSelected.IsOnline"
					class="flex1 flex between rectangle"
				>
					<p class="tertiary-font-color ft14 transfer-title">{{$t('public.channel')}}</p>
					<p class="ftpx14 bold flex1 tl">{{effectiveNumber(filterFloat(channelSelected.BalanceFormat || 0))}}</p>
					<p class="bold">ONI</p>
				</div>
				<div
					v-else
					class="flex1 flex between rectangle"
				>
					<p class="tertiary-font-color ft14 transfer-title">{{$t('public.wallet')}}</p>
					<p class="ftpx14 bold flex1 tl">{{effectiveNumber(filterFloat(mainCount)) || 0}}</p>
					<p class="bold">ONI</p>
				</div>
			</div>
			<div class="right transfer-button">
				<i
					class="el-icon-sort ftpx20 user-no-select"
					:class="{'ex-change': channelSelected.IsOnline,'grey-xs cursor-not-allowed':!channelSelected.IsOnline}"
					:title="channelSelected.IsOnline?$t('public.switchover'):$t('public.SorryYouCannotWithdrawInOfflineStatus')"
					@click="exWithDraw()"
				></i>
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
					ref="transferAmount"
					min='0'
					max='999999999.999999999'
					v-model="transferInfo.Amount"
					:placeholder="$t('public.inputAmount')"
					@keyup.enter.native='toTransfer'
					@blur="setFixed"
				>
					<!-- maxlength="9" -->
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
			<div class="minerfee tr rt10"><span class="theme-font-color user-no-select">{{$t('fileManager.gasFee')}}:</span> <span>0.01</span> {{balanceLists[balanceSelected].Symbol === 'SAVE' ? 'ONI': balanceLists[balanceSelected].Symbol}}</div>
		</el-form>
	</div>
</template>
<script>
import { filterFloat, effectiveNumber } from "../assets/config/util";
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
				callback(new Error(vm.$t("public.pleaseEnterTheCorrectFormat")));
				return;
			}
			if (this.withDraw && this.channelSelected.IsOnline) {
				if (
					value * 1 > this.channelSelected.BalanceFormat * 1 &&
					this.mainCount >= 0.01
				) {
					callback(new Error(vm.$t("public.insufficientBalanceAvailable")));
					return;
				}
			} else {
				if (value * 1 > this.mainCount * 1 - 0.01) {
					callback(new Error(vm.$t("public.insufficientBalanceAvailable")));
					return;
				}
			}
			callback();
		};
		return {
			validateMount,
			switchToggle: { loading: null },
			filterFloat,
			effectiveNumber,
			withDraw: true,
			balanceSelected: 0,
			transferInfo: {
				Amount: "",
				Password: ""
			},
			transferRules: {
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
				Password: [
					{
						required: true,
						message: this.$t("public.pleaseFillPassword"),
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
					message: vm.$t("public.SorryYouCannotWithdrawInOfflineStatus"),
					type: "error"
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
			if (this.transferInfo.Amount >= 1000000000) {
				this.transferInfo.Amount = "999999999.999999999";
			} else {
				this.transferInfo.Amount = effectiveNumber(this.transferInfo.Amount);
			}
		},
		toTransfer() {
			const vm = this;
			if (this.switchToggle.loading) return;
			if (!this.channelSelected) {
				this.emitMessage(vm.$t("public.pleaseChooseChannelAddress"), "error");
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
								Password: crypto
									.createHash("sha256")
									.update(vm.transferInfo.Password)
									.digest("hex")
							},
							{
								loading: {
									target: ".loading-content.loading-channel",
									text: vm.$t("public.transactionProcessing")
								},
								timeout: this.$config.outTime * 10000 + 50000
							}
						)
						.then(res => {
							if (res.Error === 0) {
								// this.transferInfo.Amount = 0; // reset
								// this.transferInfo.Password = ""; // reset
								this.$refs.transferForm.resetFields();
								this.$message({
									message: vm.$t("public.transferSuccess"),
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
								this.$message.error(vm.$t("public.networkErrorTransferFailed"));
							} else {
								this.$message.error("Request Timeout!");
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
						message: this.$t("public.pleaseFillAmount"),
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
						message: this.$t("public.pleaseFillPassword"),
						trigger: "blur"
					}
				]
			};
		}
	},
	computed: {
		lang() {
			return this.$i18n.locale;
		},
		mainCount: function() {
			return this.$store.state.Wallet.mainCount;
		},
		balanceLists: function() {
			return this.$store.state.Wallet.balanceLists || [];
		}
	}
};
</script>
<style lang="scss">
.channel-wallet-transfer {
	.transferForm {
		padding: 0 30px;
	}
	.rectangle {
		@include themify {
			margin-left: 20px;
			margin-right: 20px;
			align-items: center;
			padding: 5px 10px;
			background: $color;
		}
	}
	.transfer-title {
		width: 60px;
		margin-right: 10px;
		text-align: left;
	}
	.ofont-fasong {
		font-size: 10px;
		color: #cdcfd8;
		transform: rotate(90deg);
	}
	.el-icon-sort {
		width: 36px;
		height: 36px;
		text-align: center;
		line-height: 36px;
		border-radius: 50%;
		&.ex-change {
			color: #2f8ff0;
			cursor: pointer;
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
				font-weight: bold;
			}
		}
	}
	.el-button {
		padding: 8px 16px;
		border-radius: 2px;
	}
	.rt10 {
		position: relative;
		top: -10px;
	}
	.transfer-button {
		display: flex;
		align-items: center;
		@include themify {
			background: $color;
		}
		color: blue;
		width: 45px;
		justify-content: center;
	}
}
</style>
