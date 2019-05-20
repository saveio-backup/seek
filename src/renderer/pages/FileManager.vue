<template>
	<div id="fileManager">
		<div class="content">
			<div class="top-nav">
				<div class="logo">SAVE</div>
				<!-- {{location.href}}  -->
				<div class="router">
					<router-link
					 :to="{name:'filebox'}"
					 active-class="active-blue"
					 :replace="true"
					>Filebox</router-link>
					<!-- <router-link
					 :to="{name:'discovery'}"
					 active-class="active-blue"
					>Discovery</router-link> -->
					<router-link
					 :to="{name:'transfer'}"
					 active-class="active-blue"
					>Transfer <span
						 class="badge"
						 v-show="transferLength>0"
						>{{transferLength}}</span></router-link>
				</div>
				<div class="coin">
					<span class="grey-xs bold mr10">Balance: {{filterFloat(balanceTotal).toLocaleString('en-US')}}</span>
					<el-button
					 class="asset-transfer"
					 type="primary"
					 @click="switchToggle.assetTransferDialog = true"
					>划转</el-button>
				</div>
			</div>
			<el-dialog
			 class="asset-transfer-dialog"
			 title='Asset'
			 width='550px'
			 :visible.sync="switchToggle.assetTransferDialog"
			 center
			>
				<div slot="title">
					<h2>Asset</h2>
					<div class="dialog-title-border"></div>
				</div>
				<div class="flex jc-end">
					<el-select v-model="channelSelected">
						<el-option
						 v-for="item in channels"
						 :key="item.Address"
						 :label="item.Address"
						 :value="item"
						></el-option>
					</el-select>
				</div>
				<div class="flex between pl30 pr30 mb50 mt20">
					<div
					 v-if="withDraw"
					 class="flex1 text-left"
					>
						<p class="theme-font-blue transparent ft12 bold">Channel Amount:</p>
						<p class="theme-font-blue bold ft20 mt10">{{filterFloat(channelSelected.BalanceFormat || 0).toLocaleString('en-US')}} SAVE</p>
					</div>
					<div
					 v-else
					 class="flex1 text-left"
					>
						<p class="theme-font-blue transparent ft12 bold">Save Amount</p>
						<p class="theme-font-blue bold ft20 mt10">{{filterFloat(mainCount).toLocaleString('en-US')}} SAVE</p>
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
						<p class="theme-font-blue transparent ft12 bold">Channel Amount</p>
						<p class="theme-font-blue bold ft20 mt10">{{filterFloat(channelSelected.BalanceFormat || 0).toLocaleString('en-US')}} SAVE</p>
					</div>
					<div
					 v-else
					 class="flex1 text-right"
					>
						<p class="theme-font-blue transparent ft12 bold">Save Amount</p>
						<p class="theme-font-blue bold ft20 mt10">{{filterFloat(mainCount).toLocaleString('en-US')}} SAVE</p>
					</div>
				</div>
				<el-input
				 type="number"
				 class="transfer-input-number"
				 v-model="transferAmount"
				 placeholder="input number"
				>
					<template slot="append">SAVE</template>
				</el-input>
				<div slot="footer">
					<el-button
					 type="primary"
					 @click="toTransfer"
					>Confirm</el-button>
				</div>
			</el-dialog>
			<router-view></router-view>
		</div>
	</div>
</template>
<script>
import { filterFloat } from "../assets/config/util";
export default {
	mounted() {
		this.initBalanceRequest();
	},
	data() {
		return {
			filterFloat,
			channelSelected: "",
			switchToggle: {
				assetTransferDialog: false,
				transferRequest: true
			},
			transferAmount: "",
			withDraw: true,
			location: location
		};
	},
	methods: {
		emitMessage(msg, type) {
			this.$message({
				message: msg,
				type: type || "info"
			});
		},
		toTransfer() {
			if (!this.switchToggle.transferRequest) return;
			if (!this.channelSelected) {
				this.emitMessage("Please Choose Channel Address", "error");
				return;
			} else if (!this.transferAmount.trim()) {
				this.emitMessage("Please input number", "error");
				return;
			}
			this.switchToggle.transferRequest = false;
			const addr = this.withDraw
				? this.$api.withdrawChannel
				: this.$api.depositChannel;
			this.$axios
				.post(addr, {
					Partner: this.channelSelected.Address,
					Amount: this.transferAmount
				})
				.then(res => {
					if (res.data.Error === 0) {
						this.emitMessage('Transfer Success!','success');
						this.switchToggle.transferRequest = true;
						this.switchToggle.assetTransferDialog = false;
						this.initBalanceRequest();
					} else {
						this.$message.error(res.data.Desc || "Transfer Failed");
					}
					this.switchToggle.transferRequest = true;
				})
				.catch(err => {
					console.error(err);
					this.switchToggle.transferRequest = true;
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
		},
		balanceAddress: function() {
			return this.$store.state.Home.balanceAddress;
		},
		channels: function() {
			return this.$store.state.Home.channels;
		},
		balanceTotal: function() {
			return this.$store.state.Home.balanceTotal;
		},
		transferLength: function() {
			return (
				this.$store.state.Transfer.downloadLength +
				this.$store.state.Transfer.uploadLength
			);
		}
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			if (to.name === "FileManager") {
				vm.$router.push({
					name: "disk",
					query: {
						type: 0
					}
				});
			}
		});
	},
	beforeRouteUpdate(to, from, next) {
		//  electron-vue bug hack
		if (to.name === "FileManager") {
			next({ name: "disk", query: { type: 0 } });
		} else {
			next();
		}
	}
};
</script>
<style lang="scss">
$theme-font-blue: #040f39;
$grey: #ccc;
#fileManager {
	flex: 1;
	& > .content {
		position: absolute;
		top: 0px;
		bottom: 0px;
		left: 0px;
		right: 0px;
		.top-nav {
			background: #fff;
			height: 60px;
			box-shadow: 0px 2px 4px 0px rgba(231, 231, 235, 0.7);
			padding: 10px 30px 10px 20px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			.logo {
				width: 200px;
			}
			.router {
				& > a {
					position: relative;
					padding: 0 20px;
				}
				flex: 1;
				display: flex;
				.badge {
					display: inline-block;
					background: #65a6ff;
					$width: 14px;
					width: $width;
					height: $width;
					line-height: $width;
					font-size: 12px;
					text-align: center;
					border-radius: 50%;
					color: #fff;
					position: absolute;
					right: 0px;
					top: 0px;
					// transform: translateX(50%) translateY(-50%)
				}
			}
			.asset-transfer {
				height: 30px;
				padding: 0px;
				border-radius: 2px;
				width: 80px;
			}
		}
	}
	.asset-transfer-dialog {
		.ofont-fasong {
			color: #cdcfd8;
		}
		.ofont-exchange {
			color: $theme-font-blue;
		}
		.transfer-input-number {
			&.el-input {
				padding: 0 40px;
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
}
</style>
