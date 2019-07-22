<template>
	<div class="channel-wallet-transfer">
		<div class="flex between pl30 pr30 mb20 mt20">
			<div
			 v-if="withDraw && channelSelected.Connected"
			 class="flex1 text-left"
			>
				<p class="theme-font-blue-40 transparent ft14 user-no-select">Channel</p>
				<p class="theme-font-blue ft24 mt10">{{filterFloat(channelSelected.BalanceFormat || 0).toLocaleString('en-US')}}</p>
				<!-- <p class="theme-font-blue transparent ft12 bold">{{channelSelected.Address}}</p> -->
			</div>
			<div
			 v-else
			 class="flex1 text-left"
			>
				<p class="theme-font-blue-40 transparent ft14 user-no-select">Wallet</p>
				<p class="theme-font-blue ft24 mt10">{{filterFloat(mainCount).toLocaleString('en-US')}}</p>
			</div>
			<div class="flex column between">
				<i class="ofont ofont-fasong"></i>
				<i
				 class="ofont ofont-exchange ft20 user-no-select"
				 :class="{'ex-change': channelSelected.Connected,'theme-font-blue-40 cursor-not-allowed':!channelSelected.Connected}"
				:title="channelSelected.Connected?'switchover':'Sorry, you cannot withdraw in offline status'"
				 @click="exWithDraw()"
				></i></div>
			<div
			 v-if="!withDraw || !channelSelected.Connected"
			 class="flex1 text-right"
			>
				<p class="theme-font-blue-40 transparent ft14 user-no-select">Channel</p>
				<p class="theme-font-blue ft24 mt10">{{filterFloat(channelSelected.BalanceFormat || 0).toLocaleString('en-US')}}</p>
				<!-- <p class="theme-font-blue transparent ft12 bold">{{channelSelected.Address}}</p> -->
			</div>
			<div
			 v-else
			 class="flex1 text-right"
			>
				<p class="theme-font-blue-40 transparent ft14 user-no-select">Wallet</p>
				<p class="theme-font-blue ft24 mt10">{{filterFloat(mainCount).toLocaleString('en-US')}}</p>
			</div>
		</div>
		<el-form
		 ref="transferForm"
		 class="transferForm"
		 :model="transferInfo"
		 :rules="transferRules"
		>
			<el-form-item
			 label="Amount(SAVE)"
			 prop="Amount"
			>
				<el-input
				 class="transfer-input grey-theme"
				 type="number"
				 min='0'
				 v-model="transferInfo.Amount"
				 placeholder="Input Amount"
				 @keyup.enter.native='toTransfer'
				 @blur="setFixed"
				>
				</el-input>
			</el-form-item>
			<el-form-item
			 label="Wallet Password"
			 prop="Password"
			>
				<el-input
				 class="transfer-input grey-theme"
				 v-model="transferInfo.Password"
				 placeholder="Input Wallet Password"
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
		const validateMount = (rule, value ,callback) => {
			const reg = /^[1-9](\d{0,8})\.(\d{1,9})$|^0\.(\d{0,9})$|^[1-9](\d{0,8})$/
			if(!reg.test(value)) {
				callback(new Error('Please enter the correct format'));
				return;
			}
			callback();
		}
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
					},
					{
						validator: validateMount, 
						trigger: 'blur'
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
		exWithDraw() {
			if(!this.channelSelected.Connected) {
				this.$message({message: "Sorry, you cannot withdraw in offline status"});
				return;
			}
			this.withDraw = !this.withDraw;
		},
		setFixed() {
			this.transferInfo.Amount = this.transferInfo.Amount
				? parseFloat(this.transferInfo.Amount).toFixed(9)
				: "";
		},
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
						target: ".loading-content.loading-channel"
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
								this.$emit("closeDialog");
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
$theme-font-blue: #202020;
.channel-wallet-transfer {
	.transferForm {
		padding: 0 30px;
	}
	.ofont-fasong {
		color: #cdcfd8;
	}
	.ofont-exchange{
		width: 30px;
		height: 30px;
		background: #F1F3F7;
		text-align: center;
		line-height: 30px;
		border-radius: 50%;
		&.ex-change {
			color: #2F8FF0;
			cursor: pointer;
			&:hover {
				opacity: .7;
			}
			&:active {
				opacity: 1;
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
