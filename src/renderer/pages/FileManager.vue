<template>
	<div id="fileManager">
		<div class="content">
			<div class="top-nav">
				<div
					class="change-channel mr10"
					@click="openChannelListDialog"
					title="Change Channel"
				>
					<!-- @click="switchToggle.channelListDialog = true" -->
					<i class="ofont ofont-qiehuan"></i>
				</div>
				<div
					class="ft14 mr10 flex column between channel-info"
					:class="{'channel-not-have': !channelBind.ChannelId}"
				>
					<p
						class="channel-info-first user-no-select"
						:title="channelBind.ChannelId || 'Not Selected'"
					>{{channelBind.ChannelId || 'Not Selected'}}</p>
					<p
						class="channel-info-last user-no-select"
						:title="channelBind.Address"
						v-if="channelBind.Address"
					>{{channelBind.Address.replace(channelBind.Address.slice(5,-5),'...')}}</p>
				</div>
				<!-- {{location.href}}  -->
				<div class="router">
					<router-link
						:to="{name:'filebox'}"
						active-class="active-blue"
						class="user-no-select"
						:replace="true"
					>Filebox</router-link>
					<!-- <router-link
					 :to="{name:'discovery'}"
					 active-class="active-blue"
					>Discovery</router-link> -->
					<router-link
						:to="{name:'transfer',query:{transferType: (localStorage.getItem('transferType') || 1)}}"
						class="user-no-select"
						active-class="active-blue"
					>Transfer <span
							class="badge"
							v-show="transferLength>0"
						>{{transferLength}}</span></router-link>
				</div>
				<div class="coin">
					<div class="flex jc-end">
					</div>
					<span class="mr10 ft24">{{filterFloat(channelBind.BalanceFormat || 0).toLocaleString('en-US')}}<span class="user-no-select"> ONI</span></span>
					<span
						@click="openAssetTransferDialog"
						class="coin-icon-box cursor-pointer user-no-select"
					>
						<i class="ofont ofont-zhuanrang ft20 light-blue"></i>
					</span>
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
				<div class="loading-content loading-channel">
					<channel-wallet-transfer
						@closeDialog='switchToggle.assetTransferDialog = false'
						ref="channelwallettransfer"
						:channelSelected='channelBind'
					></channel-wallet-transfer>
					<div slot="footer">
						<el-button
							type="primary"
							class="primary"
							@click="toConfirm"
						>Confirm</el-button>
					</div>
				</div>
			</el-dialog>
			<el-dialog
				:close-on-click-modal='false'
				:visible.sync="switchToggle.channelListDialog"
				center
				width="900px"
			>
				<div slot="title">
					<h2>Channel Switch</h2>
					<div class="dialog-title-border"></div>
				</div>
				<div class="loading-content channelSwitchBind">
					<div style="height:300px; overflow:hidden;display: flex">
						<channel-list
							ref="channellist"
							:showRadio='true'
							@toCloseDialog="toCloseDialog"
						></channel-list>
					</div>

					<div class="adjust-item flex margin-center mt10 mb10">
						<el-form
							ref="switchChannelForm"
							:model="switchChannelForm"
							:rules="switchChannelRules"
							class="margin-center"
						>
							<el-form-item
								class="theme-font-blue-bold label-input-one-col"
								label="Password"
								prop="Password"
							>
								<el-input 
									class="grey-theme"
									type="password"
									show-password
									v-model="switchChannelForm.Password"
									@keydown.enter.native="toApplyChange"
									placeholder="Please Input Password"
								></el-input>
							</el-form-item>
						</el-form>
					</div>
					<div slot="footer">
						<el-button @click="toCancelChange">Cancel</el-button>
						<el-button
							type="primary"
							class="primary"
							@click="toApplyChange"
						>Apply</el-button>
					</div>
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
		this.$store.dispatch("getDns"); // get login status
		this.initBalanceRequest();
	},
	components: {
		channelWalletTransfer,
		channelList
	},
	data() {
		return {
			localStorage,
			filterFloat,
			switchToggle: {
				loading: null,
				assetSettingDialog: false,
				assetTransferDialog: false,
				channelListDialog: false
			},
			switchChannelForm: {
				Password: ""
			},
			switchChannelRules: {
				Password: [
					{
						required: true,
						message: "Please Input Password",
						trigger: "blur"
					}				
				]
			},
			location: location,
			transferObj: {},
			setTimeoutObj: {
				upload: null,
				download: null,
				complete: null
			}
		};
	},
	methods: {
		openAssetTransferDialog() {
			this.switchToggle.assetTransferDialog = true;
		},
		hideAssetSettingDialog() {
			console.log("hideAsset");
			this.switchToggle.assetSettingDialog = false;
		},
		toConfirm() {
			this.$refs["channelwallettransfer"].toTransfer();
		},
		openChannelListDialog() {
			this.switchToggle.channelListDialog = true;
			this.$nextTick(() => {
				this.$refs.switchChannelForm.resetFields();
			});
		},
		toApplyChange() {
			this.$refs.switchChannelForm.validate(valid => {
				if(!valid) return;
				this.$refs.channellist.applyChange();
			});
		},
		getDnsAddressById(id) {
			for(let dns of this.channels) {
				if(dns.ChannelId == id) {
					return dns.Address;
				}
			}
		},
		toCloseDialog(ChannelId) {
			let partnerId = ChannelId;
			let partnerAddress = this.getDnsAddressById(partnerId);

			this.$axios.post(this.$api.channelSwitch, {
				Partner: partnerAddress,
				Password: this.switchChannelForm.Password
			},
			{
				loading: {
					text: "Loading...",
					target: ".channelSwitchBind.loading-content"
				},
				timeout: (this.$outTime * 10000 + 50000)
			}).then(res => {
				if(res.Error === 0) {
					this.switchToggle.channelListDialog = false;
					this.$message({
						type: "success",
						message: "Switching channel successfully"
					});
					localStorage.setItem("channelBindId", ChannelId);
					this.$store.dispatch(
						"setChannelBind",
						ChannelId
					);
				} else {
					this.$message.error(
						this.$i18n.error[res.Error]
							? this.$i18n.error[res.Error][this.$language]
							: `error code is ${res.Error}`
					);
				}
			})
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
	watch: {
		// to do!!!! transfer api message need delete
		uploadTransferList(newVal, oldVal) {
			clearTimeout(this.setTimeoutObj.upload);
			this.setTimeoutObj.upload = setTimeout(() => {
				for (let value of newVal) {
					this.transferObj[value.Id] = value;
				}
			}, 50);
		},
		downloadTransferList(newVal, oldVal) {
			clearTimeout(this.setTimeoutObj.download);
			this.setTimeoutObj.download = setTimeout(() => {
				for (let value of newVal) {
					this.transferObj[value.Id] = value;
				}
			}, 50);
		},
		completeTransferList(newVal, oldVal) {
			clearTimeout(this.setTimeoutObj.complete);
			let haveComplete = false;
			this.setTimeoutObj.complete = setTimeout(() => {
				for (let value of newVal) {
					if (
						value.Id &&
						this.transferObj[value.Id] &&
						this.transferObj[value.Id].Status !== 3
					) {
						this.$message({
							message: `${value.FileName} ${
								this.transferObj[value.Id].Type === 1
									? "Upload Success"
									: "Download Success"
							}`,
							type: "success"
						});
						haveComplete = true;
					}
					if(haveComplete) {
						this.$store.dispatch("setSpace");
					}
					this.transferObj[value.Id] = value;
				}
			}, 50);
		}
	},
	computed: {
		mainCount: function() {
			return this.$store.state.Wallet.mainCount;
		},
		channels: function() {
			return this.$store.state.Home.channels;
		},
		channelBind: function() {
			return this.$store.state.Home.channelBind;
		},
		transferLength: function() {
			return (
				this.$store.state.Transfer.downloadLength +
				this.$store.state.Transfer.uploadLength
			);
		},
		uploadTransferList: function() {
			return this.$store.state.Transfer.uploadTransferList;
		},
		downloadTransferList: function() {
			return this.$store.state.Transfer.downloadTransferList;
		},
		completeTransferList: function() {
			return this.$store.state.Transfer.completeTransferList;
		}
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			// vm.$store.dispatch("setComplete");
			if (to.name === "FileManager") {
				vm.$router.push({
					name: "disk",
					query: {
						type: 0
					}
				});
			}
			vm.$store.dispatch("setUpload");
			vm.$store.dispatch("setDownload");
		});
	},
	beforeRouteUpdate(to, from, next) {
		//  electron-vue bug hack
		if (to.name === "FileManager") {
			next({ name: "disk", query: { type: 0 } });
		} else {
			next();
		}
	},
	beforeDestroy() {
		this.$store.dispatch("clearIntervalGetDns");
		this.$store.dispatch("clearIntervalSetUpload");
		this.$store.dispatch("clearIntervalSetDownload");
		this.$store.dispatch("clearIntervalSetComplete");
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
			height: 64px;
			position: relative;
			z-index: 9;
			box-shadow: 0px 2px 4px 0px rgba(231, 231, 235, 0.7);
			padding: 10px 70px 10px 15px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			.change-channel {
				width: 40px;
				height: 40px;
				border-radius: 50%;
				background: linear-gradient(
					180deg,
					rgba(23, 171, 249, 1) 0%,
					rgba(53, 137, 238, 1) 100%
				);
				cursor: pointer;
				color: #ffffff;
				text-align: center;
				line-height: 40px;
				&:hover {
					opacity: 0.7;
				}
				&:active {
					opacity: 1;
				}
			}
			.channel-info {
				font-weight: 400;
				color: #202020;
				width: 140px;
				position: relative;
				.channel-info-first {
					color: #2f8ff0;
					text-overflow: ellipsis;
					white-space: nowrap;
					overflow: hidden;
				}
				&.channel-not-have {
					.channel-info-first {
						color: rgba(32, 32, 32, 0.7);
					}
				}
				.channel-info-last {
					opacity: 0.4;
					margin-top: 2px;
				}
			}
			.logo {
				width: 200px;
			}
			.router {
				color: rgba(32, 32, 32, 0.7);
				font-size: 18px;
				& > a {
					position: relative;
					padding-right: 48px;
					&:hover {
						opacity: 0.7;
					}
					&:active {
						opacity: 1;
					}
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
					right: 30px;
					top: 0px;
					// transform: translateX(50%) translateY(-50%)
				}
			}
			.coin {
				display: flex;
				align-items: center;
				position: relative;
				.coin-icon-box {
					display: inline-block;
					width: 36px;
					height: 36px;
					line-height: 36px;
					text-align: center;
					border-radius: 50%;
					&:hover {
						background: #edeff4;
					}
					&:active {
						opacity: 0.7;
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
}
</style>
