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
					<div class="flex jc-end">
					</div>
					<div class="ft12 mr10 flex column between">
						<p>Channel: {{channelBind.ChannelId || 'Not Selected'}}</p>
						<p v-if="channelBind.TokenAddr">{{channelBind.TokenAddr.replace(channelBind.TokenAddr.slice(5,-5),'...')}}</p>
					</div>
					<span class="grey-xs bold mr10">{{filterFloat(channelBind.BalanceFormat || 0).toLocaleString('en-US')}} SAVE</span>
					<span
					 ref="menuButton"
					 class="ofont ofont-menu-point cursor-pointer"
					 @click="switchToggle.assetSettingDialog = !switchToggle.assetSettingDialog"
					>
					</span>
					<ul
					 class="asset-opera"
					 v-show="switchToggle.assetSettingDialog"
					 v-seekclickoutside="{handler:'hideAssetSettingDialog', exclude:['menuButton']}"
					>
						<li @click="switchToggle.assetTransferDialog = true">
							<!-- class="asset-transfer" -->
							Transfer
						</li>
						<li @click="switchToggle.channelListDialog = true">Change Channel</li>
					</ul>
				</div>
			</div>
			<el-dialog
			 class="asset-transfer-dialog"
			 width='550px'
			 :close-on-click-modal='false'
			 :visible.sync="switchToggle.assetTransferDialog"
			 center
			>
				<div slot="title">
					<h2>Transfer</h2>
					<div class="dialog-title-border"></div>
				</div>
				<div class="loading-content">
					<channel-wallet-transfer
					 ref="channelwallettransfer"
					 :channelSelected='channelBind'
					></channel-wallet-transfer>
					<div slot="footer">
						<el-button
						 type="primary"
						 @click="toConfirm"
						>Confirm</el-button>
					</div>
				</div>
			</el-dialog>
			<el-dialog
			 :close-on-click-modal='false'
			 :visible.sync="switchToggle.channelListDialog"
			 center
			>
				<div slot="title">
					<h2>Channel Select</h2>
					<div class="dialog-title-border"></div>
				</div>
				<div style="height:400px; overflow:hidden; display:flex;">
					<channel-list
					 ref="channellist"
					 :showRadio='true'
					></channel-list>
				</div>
				<div slot="footer">
					<el-button
					 type="primary"
					 @click="toApplyChange"
					>Apply</el-button>
					<el-button @click="toCancelChange">Cancel</el-button>
				</div>
			</el-dialog>
			<keep-alive>
				<router-view></router-view>
			</keep-alive>

		</div>
	</div>
</template>
<script>
import { filterFloat } from "../assets/config/util";
import channelList from "../components/ChannelsList.vue";
import channelWalletTransfer from "../components/ChannelWalletTransfer.vue";
export default {
	mounted() {
		document.title = "File Manager";
		this.$store.dispatch("setCurrentAccount"); // get login status
		this.initBalanceRequest();
	},
	components: {
		channelWalletTransfer,
		channelList
	},
	data() {
		return {
			filterFloat,
			switchToggle: {
				loading: null,
				assetSettingDialog: false,
				assetTransferDialog: false,
				channelListDialog: false
			},
			// transferInfo: {
			// 	Amount: "",
			// 	Password: ""
			// },
			// transferRules: {
			// 	Amount: [
			// 		{
			// 			required: true,
			// 			message: "Please fill amount",
			// 			trigger: "blur"
			// 		}
			// 	],
			// 	Password: [
			// 		{
			// 			required: true,
			// 			message: "Please fill password",
			// 			trigger: "blur"
			// 		}
			// 	]
			// },
			// withDraw: true,
			location: location
		};
	},
	methods: {
		hideAssetSettingDialog() {
			console.log("hideAsset");
			this.switchToggle.assetSettingDialog = false;
		},
		toConfirm() {
			this.$refs["channelwallettransfer"].toTransfer();
		},
		// toTransfer() {
		// 	if (this.switchToggle.loading) return;
		// 	if (!this.channelBind) {
		// 		this.emitMessage("Please Choose Channel Address", "error");
		// 		return;
		// 	}
		// 	this.$refs.transferForm.validate(valid => {
		// 		if (valid) {
		// 			this.switchToggle.loading = this.$loading({
		// 				lock: true,
		// 				text: "Transaction processing....",
		// 				target: ".loading-content"
		// 			});
		// 			const addr = this.withDraw
		// 				? this.$api.withdrawChannel
		// 				: this.$api.depositChannel;
		// 			this.$axios
		// 				.post(addr, {
		// 					Partner: this.channelBind.Address,
		// 					Amount: this.transferInfo.Amount,
		// 					Password: this.transferInfo.Password
		// 				})
		// 				.then(res => {
		// 					if (res.data.Error === 0) {
		// 						this.transferInfo.Amount = 0; // reset
		// 						this.transferInfo.Password = ""; // reset
		// 						this.emitMessage("Transfer Success!", "success");
		// 						this.switchToggle.assetTransferDialog = false;
		// 						this.initBalanceRequest();
		// 					} else if (res.data.Error === 50015) {
		// 						this.$message.error("Wrong Password");
		// 					} else {
		// 						this.$message.error(res.data.Desc || "Transfer Failed");
		// 					}
		// 					this.switchToggle.loading.close();
		// 					this.switchToggle.loading = null;
		// 				})
		// 				.catch(err => {
		// 					console.error(err);
		// 					this.switchToggle.loading.close();
		// 					this.switchToggle.loading = null;
		// 					this.$message.error("Transfer Failed");
		// 				});
		// 		}
		// 	});
		// },
		toApplyChange() {
			this.$refs.channellist.applyChange();
			this.switchToggle.channelListDialog = false;
		},
		toCancelChange() {
			this.$refs.channellist.initCurrentRow();
			this.switchToggle.channelListDialog = false;
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
		channelBind: function() {
			return this.$store.state.Home.channelBind;
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
// $theme-font-blue: #040f39;
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
			.coin {
				display: flex;
				align-items: center;
				position: relative;
				.asset-opera {
					width: 200px;
					text-align: center;
					position: absolute;
					right: 0px;
					top: 40px;
					padding: 10px 0;
					background: #fff;
					border: solid 1px #ccc;
					z-index: 1;
					li {
						padding: 5px 10px;
						cursor: pointer;
						font-size: 14px;
						&:hover {
							color: #65a6ff;
						}
					}
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
	// .asset-transfer-dialog {
	// 	.transferForm {
	// 		padding: 0 30px;
	// 	}
	// 	.ofont-fasong {
	// 		color: #cdcfd8;
	// 	}
	// 	.ofont-exchange {
	// 		color: $theme-font-blue;
	// 	}
	// 	.transfer-input {
	// 		&.el-input {
	// 			.el-input__inner {
	// 				background: #ebecef;
	// 				height: 35px;
	// 				line-height: 35px;
	// 				border-radius: 2px;
	// 				border: none;
	// 				&:focus {
	// 					border: none;
	// 				}
	// 			}
	// 			.el-input-group__append {
	// 				background: none;
	// 				border: none;
	// 				color: $theme-font-blue;
	// 				font-weight: bold;
	// 			}
	// 		}
	// 	}
	// 	.el-button {
	// 		padding: 8px 16px;
	// 		border-radius: 2px;
	// 	}
	// }
}
</style>
