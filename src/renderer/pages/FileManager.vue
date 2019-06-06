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
			 title='Transfer'
			 width='550px'
			 :visible.sync="switchToggle.assetTransferDialog"
			 center
			>
				<div slot="title">
					<h2>Transfer</h2>
					<div class="dialog-title-border"></div>
				</div>
				<div class="flex between pl30 pr30 mb50 mt20">
					<div
					 v-if="withDraw"
					 class="flex1 text-left"
					>
						<p class="theme-font-blue transparent ft12 bold">Channel</p>
						<p class="theme-font-blue bold ft20 mt10">{{filterFloat(channelBind.BalanceFormat || 0).toLocaleString('en-US')}}</p>
						<!-- <p class="theme-font-blue transparent ft12 bold">{{channelBind.Address}}</p> -->
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
						<p class="theme-font-blue bold ft20 mt10">{{filterFloat(channelBind.BalanceFormat || 0).toLocaleString('en-US')}}</p>
						<!-- <p class="theme-font-blue transparent ft12 bold">{{channelBind.Address}}</p> -->
					</div>
					<div
					 v-else
					 class="flex1 text-right"
					>
						<p class="theme-font-blue transparent ft12 bold">Wallet</p>
						<p class="theme-font-blue bold ft20 mt10">{{filterFloat(mainCount).toLocaleString('en-US')}}</p>
					</div>
				</div>
				<el-input
				 type="number"
				 min='0'
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
			<el-dialog
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
			<router-view></router-view>
		</div>
	</div>
</template>
<script>
import { filterFloat } from "../assets/config/util";
import channelList from "../components/ChannelsList.vue";
export default {
	mounted() {
		document.title = "File Manager";
		this.$store.dispatch("setCurrentAccount"); // get login status
		this.initBalanceRequest();
	},
	components: {
		channelList
	},
	data() {
		return {
			filterFloat,
			switchToggle: {
				assetSettingDialog: false,
				assetTransferDialog: false,
				channelListDialog: false,
				transferRequest: true
			},
			transferAmount: "",
			withDraw: true,
			location: location
		};
	},
	methods: {
		hideAssetSettingDialog() {
			console.log("hideAsset");
			this.switchToggle.assetSettingDialog = false;
		},
		emitMessage(msg, type) {
			this.$message({
				message: msg,
				type: type || "info"
			});
		},
		toTransfer() {
			if (!this.switchToggle.transferRequest) return;
			if (!this.channelBind) {
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
					Partner: this.channelBind.Address,
					Amount: this.transferAmount
				})
				.then(res => {
					if (res.data.Error === 0) {
						this.emitMessage("Transfer Success!", "success");
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
			.coin {
				display: flex;
				align-items: center;
				position: relative;
				.asset-opera {
					width: 200px;
					text-align: center;
					position: absolute;
					right: 0px;
					top:40px;					
					padding: 10px 0;
					background: #fff;
					border:solid 1px #ccc;
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
