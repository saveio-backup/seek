<template>
	<div class="channel-wallet-transfer">
		<div class="flex between pl30 pr30 mb20 mt20">
			<div
			 v-if="withDraw"
			 class="flex1 text-left"
			>
				<p class="theme-font-blue transparent ft12 bold">Channel</p>
				<p class="theme-font-blue bold ft20 mt10">{{filterFloat(channelSelected.BalanceFormat || 0).toLocaleString('en-US')}}</p>
				<!-- <p class="theme-font-blue transparent ft12 bold">{{channelSelected.Address}}</p> -->
			</div>
			<div
			 v-else
			 class="flex1 text-left"
			>
				<p class="theme-font-blue transparent ft12 bold">Wallet</p>
				<p class="theme-font-blue bold ft20 mt10">{{filterFloat(mainCount).toLocaleString('en-US')}}</p>
			</div>
			<div class="flex column between">
				<i class="ofont ofont-fasong"></i>
				<i
				 class="ofont ofont-exchange ft20"
				 @click="withDraw = !withDraw"
				></i></div>
			<div
			 v-if="!withDraw"
			 class="flex1 text-right"
			>
				<p class="theme-font-blue transparent ft12 bold">Channel</p>
				<p class="theme-font-blue bold ft20 mt10">{{filterFloat(channelSelected.BalanceFormat || 0).toLocaleString('en-US')}}</p>
				<!-- <p class="theme-font-blue transparent ft12 bold">{{channelSelected.Address}}</p> -->
			</div>
			<div
			 v-else
			 class="flex1 text-right"
			>
				<p class="theme-font-blue transparent ft12 bold">Wallet</p>
				<p class="theme-font-blue bold ft20 mt10">{{filterFloat(mainCount).toLocaleString('en-US')}}</p>
			</div>
		</div>
		<!-- <el-input
					 type="number"
					 min='0'
					 class="transfer-input"
					 v-model="transferAmount"
					 placeholder="input number"
					>
						<template slot="append">SAVE</template>
					</el-input> -->
		<el-form
		 ref="transferForm"
		 class="transferForm"
		 :model="transferInfo"
		 :rules="transferRules"
		>
			<el-form-item
			 label="Amount"
			 prop="Amount"
			>
				<el-input
				 type="number"
				 min='0'
				 class="transfer-input"
				 v-model="transferInfo.Amount"
				 placeholder="input number"
				>
				</el-input>
			</el-form-item>
			<el-form-item
			 label="Password"
			 prop="Password"
			>
				<el-input
				 class="transfer-input"
				 v-model="transferInfo.Password"
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
export default {
	props: {
		channelSelected: {
			required: true,
			type: Object // 0 upload 1 download
		}
	},
	data() {
		return {
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
						message: "Please fill amount",
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
			}
		};
	},
	methods: {
		toTransfer() {
			if (this.switchToggle.loading) return;
			if (!this.channelSelected) {
				this.emitMessage("Please Choose Channel Address", "error");
				return;
			}
			this.$refs.transferForm.validate(valid => {
				if (valid) {
					this.switchToggle.loading = this.$loading({
						lock: true,
						text: "Transaction processing....",
						target: ".loading-content"
					});
					const addr = this.withDraw
						? this.$api.withdrawChannel
						: this.$api.depositChannel;
					this.$axios
						.post(addr, {
							Partner: this.channelSelected.Address,
							Amount: this.transferInfo.Amount,
							Password: this.transferInfo.Password
						})
						.then(res => {
							if (res.data.Error === 0) {
								// this.transferInfo.Amount = 0; // reset
								// this.transferInfo.Password = ""; // reset
								this.$refs.transferForm.resetFields();
								this.$message({
									message: "Transfer Success!",
									type: "success"
								});
								this.switchToggle.assetTransferDialog = false;
								this.initBalanceRequest();
							} else if (res.data.Error === 50015) {
								this.$message.error("Wrong Password");
							} else {
								this.$message.error(res.data.Desc || "Transfer Failed");
							}
							this.switchToggle.loading.close();
							this.switchToggle.loading = null;
						})
						.catch(err => {
							console.error(err);
							this.switchToggle.loading.close();
							this.switchToggle.loading = null;
							this.$message.error("Transfer Failed");
						});
				}
			});
		},
		initBalanceRequest() {
			this.$store.dispatch("setBalanceLists");
			this.$store.dispatch("setChannelBalanceTotal");
		}
	},
	computed: {
		mainCount: function() {
			return this.$store.state.Wallet.mainCount;
		}
	}
};
</script>
<style lang="scss">
$theme-font-blue: #040f39;
.channel-wallet-transfer {
	.transferForm {
		padding: 0 30px;
	}
	.ofont-fasong {
		color: #cdcfd8;
	}
	.ofont-exchange {
		color: $theme-font-blue;
	}
	.transfer-input {
		&.el-input {
			.el-input__inner {
				background: #ebecef;
				height: 35px;
				line-height: 35px;
				border-radius: 2px;
				border: none;
				&:focus {
					border: none;
				}
			}
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
