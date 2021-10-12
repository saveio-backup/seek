<template>
	<div id="expand">
		<div class="content">
			<div class="space-header">
				<div class="space-progress">
					<div class="theme-font-color bold mb10 ft14 user-no-select">{{$t('fileManager.used')}}: {{util.bytesToSize(space.Used * 1024)}} / {{util.bytesToSize((space.Used + space.Remain) *1024)}} <span class="grey-xs bold ft14 ">{{$t('fileManager.expiredTime')}} :{{expired_old}}</span> </div>
					<el-progress
						:stroke-width="30"
						:percentage="takeSpace"
						:show-text="false"
					></el-progress>
				</div>
				<ripper-button
					ref='getspace'
					@click="openExpandDialog"
					class="storage"
				>{{$t('fileManager.storage')}}</ripper-button>
			</div>
			<p class="theme-font-color bold mt40 mb10 ft14 user-no-select">{{$t('fileManager.spaceAdjustRecord')}}</p>
			<div class="space-record">
				<el-table
					border
					:data='Records'
					ref='recordTable'
					:empty-text="$t('public.noData')"
					height='100%'
				>
					<el-table-column
						:label="$t('fileManager.expiredTime')"
						prop="ExpiredAt"
						sortable
					>
						<template slot-scope="scope">
							<div>
								{{ $dateFormat.formatTimeByTimestamp(scope.row.ExpiredAt * 1000)}}
							</div>
						</template>
					</el-table-column>
					<el-table-column
						:label="$t('fileManager.size')"
						prop="Size"
						class-name="primary-font-color"
						sortable
					>
						<template slot-scope="scope">
							<div>
								{{util.bytesToSize(scope.row.Size * 1024)}}
							</div>
						</template>
					</el-table-column>
					<el-table-column
						:label="$t('fileManager.cost')"
						prop="Cost"
						sortable
					>
						<template slot-scope="scope">
							<div>
								<div>
									{{parseFloat(scope.row.CostFormat)}} ONI
								</div>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<el-dialog
				center
				width='600px'
				:close-on-click-modal='false'
				:visible.sync="expandDialogVisible"
			>
				<div slot="title">
					<h2>{{$t('fileManager.storage')}}</h2>
					<div class="dialog-title-border"></div>
				</div>
				<div class="loading-content expand-setspace-loading">
					<div class="adjust">
						<div class="adjust-item">
							<div class="adjust-title bold ft14 tl">{{$t('fileManager.spaceSize')}}:</div>
						</div>
						<div class="adjust-item">
							<p class="adjust-title ftpx14">{{$t('fileManager.current')}}:</p>
							<div class="adjust-info">
								<p class="ftpx14 mr20">{{util.bytesToSize( (space.Used + space.Remain)*1024)}}</p>
								<p class="ftpx14 ml20">{{util.bytesToSize(space.Used *1024)}} / {{util.bytesToSize( (space.Used + space.Remain)*1024)}}</p>
							</div>
						</div>
						<div class="adjust-item">
							<div class="adjust-title ftpx14">{{$t('fileManager.adjustTo')}}:</div>
							<div class="adjust-info">
								<el-input-number
									ref="spaceNumberInput"
									class="number grey-theme"
									v-model="adjustSize"
									:precision='0'
									:min='minSize'
									:max='(1073741824000/sizeUnit)'
									@change="userSpaceCost"
									@focus="$refs.spaceNumberInput.select()"
									@blur="userSpaceCost"
								></el-input-number>
								<el-select
									class="sizeunit"
									@change="userSpaceCost"
									v-model="sizeUnit"
								>
									<el-option
										label="MB"
										:value="sizeRange['MB']"
									>

									</el-option>
									<el-option
										label="GB"
										:value="sizeRange['GB']"
									></el-option>
								</el-select>
							</div>
						</div>
					</div>
					<div class="adjust">
						<div class="adjust-item">
							<div class="adjust-title  bold ft14 tl">{{$t('fileManager.spaceDate')}}:</div>
						</div>
						<div class="adjust-item">
							<p class="adjust-title ft14">{{$t('fileManager.expiryDate')}}:</p>
							<div class="adjust-info">
								<p class="theme-font-color">{{expired_old}}</p>
							</div>
						</div>
						<div class="adjust-item">
							<div class="adjust-title ft14">{{$t('fileManager.adjustTo')}}:</div>
							<div class="adjust-info">
								<el-date-picker
									v-model="expired"
									@change='setDateValue'
									format='yyyy-MM-dd HH:mm:ss'
									:picker-options="pickerOptions"
									type="date"
									:placeholder="$t('fileManager.chooseDate')"
								>
								</el-date-picker>
							</div>
						</div>
					</div>
					<div class="adjust">
						<div class="adjust-item">
							<p class="adjust-title ftpx14">{{cost.TransferType === 2?$t('fileManager.stakeRefund'):$t('fileManager.stakePayment')}}:</p>
							<div class="adjust-info ftpx14">
								<div v-if="cost.TransferType !== 2">
									{{cost.FeeFormat?util.effectiveNumber(cost.FeeFormat):0}} ONI
								</div>
								<div v-if="cost.TransferType === 2">
									{{cost.RefundFormat? util.effectiveNumber(cost.RefundFormat):0}} ONI
								</div>
							</div>
						</div>
						<div class="adjust-item">
							<p class="adjust-title ft14"></p>
							<div class="adjust-info ft14">
								<span class="mr10">{{$t('fileManager.available')}}</span> {{mainCount? util.effectiveNumber(mainCount):0}} ONI
							</div>
						</div>
					</div>
					<div class="adjust">
						<div class="adjust-item">
							<div class="adjust-title ft14">{{$t('public.walletPassword')}}:</div>
							<div class="adjust-info  ft14 mr20">
								<el-input
									v-model="Password"
									@keyup.enter.native='setUserSpace'
									:placeholder="$t('public.pleaseInputWalletPassword')"
									class="grey-theme"
									show-password
									type="password"
								></el-input>
							</div>
						</div>
					</div>
					<div class="rt10 tr mb10">
						{{$t('fileManager.gasFee')}}: 0.01
					</div>
					<div slot="footer">
						<ripper-button @click="expandDialogVisible = false">{{$t('public.cancel')}}</ripper-button>
						<ripper-button
							type="primary"
							class="primary ml10"
							@click="setUserSpace"
						>{{$t('fileManager.update')}}</ripper-button>
					</div>
				</div>
			</el-dialog>
			<el-dialog
				center
				width="600px"
				:close-on-click-modal='false'
				:visible.sync="linkUploadDialogVisible"
			>
				<div slot="title">
					<h2>{{$t('fileManager.goUpload')}}</h2>
					<div class="dialog-title-border"></div>
				</div>
				<div class="loading-content">
					<p class="mt10 mb30 ft14 break-word">{{$t('fileManager.youCanNowUploadFilesViaPrimaryMode')}}</p>
					<div slot="footer">
						<ripper-button @click="linkUploadDialogVisible = false">{{$t('public.cancel')}}</ripper-button>
						<ripper-button
							class="primary ml10"
							@click="linkUpload"
						>{{$t('fileManager.upload')}}</ripper-button>
					</div>
				</div>
			</el-dialog>
		</div>
	</div>
</template>
<script>
import util from "../../../assets/config/util";
import $date from "../../../assets/tool/date";
import crypto from "crypto";
const _NOW = new Date();
export default {
	mounted() {
		this.hasUploadedFile();
		this.getUserSpaceRecords();
		// getUserSpaceRecords
		let element = this.$refs.recordTable.bodyWrapper;
		this.addListenScroll(element, 100, this.getUserSpaceRecords);
	},
	data() {
		return {
			util,
			sizeUnit: 1048576,
			sizeRange: {
				MB: 1024,
				GB: 1048576
			},
			Password: "",
			adjustSize: 1,
			switchToggle: { loadSwitch: true, loading: "" },
			submitToggle: true, // commit toggle
			expired: "",
			isUploadedFile: true, // has user uploaded file in save
			pickerOptions: {
				disabledDate: date => {
					const now = new Date().getTime();
					if (this.isUploadedFile) {
						return (
							date.getTime() + 86399000 - this.space.ExpiredAt * 1000 <= 0 ||
							date.getTime() + 86399000 - now <= 0
						);
					} else {
						return date.getTime() + 86399000 - now <= 0;
					}
				}
			},
			addInfo: {
				Addr: window.localStorage.getItem("Address"),
				Size: {
					Type: 0,
					Value: "1"
				},
				Second: {
					Type: 0,
					Value: "0"
				}
			},
			cost: {},
			expandDialogVisible: false,
			linkUploadDialogVisible: false,
			Records: [],
			limit: 20
		};
	},
	watch: {
		expandDialogVisible: function() {
			// update adjustSize when open dialog
			this.adjustSize = Math.ceil(
				(this.space.Remain + this.space.Used) / this.sizeUnit
			);
		},
		sizeUnit: function() {
			if (this.isUploadedFile) {
				this.adjustSize = Math.max(
					this.minSize,
					Math.ceil((this.space.Remain + this.space.Used) / this.sizeUnit)
				);
				this.userSpaceCost();
			}
		}
	},
	computed: {
		minSize() {
			if (this.isUploadedFile) {
				return Math.ceil((this.space.Remain + this.space.Used) / this.sizeUnit);
			} else {
				return 0;
			}
		},
		expired_old() {
			if (this.Records && this.Records[0] && this.Records[0].ExpiredAt) {
				this.expired = new Date(this.Records[0].ExpiredAt * 1000);
				return this.$dateFormat.formatTimeByTimestamp(
					this.Records[0].ExpiredAt * 1000
				);
			}
			if (
				this.$store.state.Filemanager.space.ExpiredAt &&
				this.$store.state.Filemanager.space.ExpiredAt * 1000 > _NOW.getTime()
			) {
				this.expired = new Date(
					this.$store.state.Filemanager.space.ExpiredAt * 1000
				);
				return this.$dateFormat.formatTimeByTimestamp(
					this.$store.state.Filemanager.space.ExpiredAt * 1000
				);
			} else {
				this.expired = $date.lastSecondByDate(_NOW, 2);
				return this.$dateFormat.formatTimeByTimestamp(_NOW.getTime());
			}
		},
		space() {
			return this.$store.state.Filemanager.space;
		},
		takeSpace: function() {
			if (this.space.Used > 0) {
				return Math.max(
					0.5,
					(this.space.Used / (this.space.Remain + this.space.Used)) * 100
				);
			} else {
				return 0;
			}
		},
		mainCount: function() {
			return this.$store.state.Wallet.mainCount;
		}
	},
	methods: {
		async hasUploadedFile() {
			let addr = this.$api.getFileList + "0/0/0/0/0/0/0/0";
			let result = await this.$axios.get(addr).catch(error => {
				if (error.message.includes("timeout")) {
					this.$message.error(this.$t('error.requestTimeout'));
				}
			});
			if (result.Error === 0) {
				if (result.Result.length) {
					this.isUploadedFile = true;
				} else {
					this.isUploadedFile = false;
				}
			} else {
				this.$message.error(this.$t(`error["${result.Error}"]`));
			}
		},
		addListenScroll(element, distance, callback) {
			element.addEventListener("scroll", function() {
				if (
					element.scrollTop + element.clientHeight + distance >=
					element.scrollHeight
				) {
					callback();
				}
			});
		},
		getUserSpaceRecords(amount) {
			if (!this.switchToggle.loadSwitch && !amount) return;
			this.switchToggle.loadSwitch = false;
			let addr = null;
			if (amount) {
				addr =
					this.$api.userspacerecords +
					localStorage.getItem("Address") +
					"/0/" +
					amount;
			} else {
				addr =
					this.$api.userspacerecords +
					localStorage.getItem("Address") +
					"/" +
					this.Records.length +
					"/" +
					this.limit;
			}
			this.$axios(addr)
				.then(res => {
					if (res.Error === 0) {
						if (res.Result.Records.length > 0) {
							if (amount) {
								this.Records = res.Result.Records;
								this.switchToggle.loadSwitch = true;
							} else {
								this.Records = this.Records.concat(res.Result.Records);
								this.switchToggle.loadSwitch = true;
							}
							return;
						} else {
							this.switchToggle.loadSwitch = false;
							return;
						}
					} else {
						this.$message.error(this.$t(`error[${res.Error}]`));
						this.switchToggle.loadSwitch = true;
					}
				})
				.catch(err => {
					if (err.message.includes("timeout")) {
						this.$message.error(this.$t('error.requestTimeout'));
					}
					console.error(err);
				});
		},
		openExpandDialog() {
			this.Password = "";
			this.expandDialogVisible = true;
		},
		setUserSpaceCheckRes() {
			const vm = this;
			if (this.Password.length === 0) {
				this.$message.error(vm.$t("public.pleaseInputWalletPassword"));
				return false;
			} else if (this.mainCount && (this.mainCount - 0.01 - (this.cost && this.cost.FeeFormat || 0)) >= 0) {
				return true;
			} else {
				this.$message.error(vm.$t("error[4006]"));
				return false;
			}
		},
		linkUpload() {
			this.linkUploadDialogVisible = false;
			this.$router.push({
				name: "upload"
			});
		},
		setUserSpace() {
			const vm = this;
			if (!this.submitToggle) return;
			if (
				// neither of FeeFormat or RefundFormat
				!this.cost.FeeFormat &&
				this.cost.FeeFormat !== 0 &&
				!this.cost.RefundFormat &&
				this.cost.RefundFormat !== 0
			) {
				this.$message.error(vm.$t("public.pleaseAdjustYourSpaceAndDate"));
				return;
			}

			const checkRes = this.setUserSpaceCheckRes();
			if (!checkRes) return;
			this.submitToggle = false;
			this.setDateValue(this.expired, "fixed");
			this.setSizeValue();
			// const addr = this.addInfo.Second.Value >= 0 ? "add" : "revoke";
			this.$axios
				.post(
					this.$api.userspace + "set",
					{
						Addr: this.addInfo.Addr,
						Second: {
							Value: Math.abs(this.addInfo.Second.Value),
							Type: this.addInfo.Second.Type
						},
						Size: {
							Value: Math.abs(this.addInfo.Size.Value),
							Type: this.addInfo.Size.Type
						},
						Password: crypto
							.createHash("sha256")
							.update(vm.Password)
							.digest("hex")
					},
					{
						loading: {
							text: vm.$t("fileManager.upgrading"),
							target: ".loading-content.expand-setspace-loading"
						}
					}
				)
				.then(res => {
					if (res.Error === 0) {
						this.expandDialogVisible = false;
						if (this.space.Remain + this.space.Used === 0) {
							this.linkUploadDialogVisible = true;
						}
						setTimeout(() => {
							this.$nextTick(() => {
								this.$message.success({
									message: vm.$t("fileManager.getStorageSuccessed"),
									type: "success"
								});
								this.$store.dispatch("setSpace");
								this.getUserSpaceRecords(this.Records.length + 1);
								this.setDateValue(); // no param  rest date.Type = 0
								this.cost = {};
								this.submitToggle = true;
							});
						}, 50);
					} else {
						this.$message.error(this.$t(`error[${res.Error}]`));
						this.submitToggle = true;
					}
				})
				.catch(e => {
					if (!e.message.includes("timeout")) {
						this.$message.error(
							vm.$t("fileManager.networkErrorSetUserSpaceFailed")
						);
					} else {
						this.$message.error(this.$t('error.requestTimeout'));
					}
				});
		},
		userSpaceCost() {
			this.setSizeValue();
			this.addInfo.Second.Value = Math.floor(
				(this.expired.getTime() - new Date(this.expired_old).getTime()) / 1000
			);
			if (this.addInfo.Second.Value === 0) {
				this.addInfo.Second.Type = 0;
			} else if (this.addInfo.Second.Value > 0) {
				this.addInfo.Second.Type = 1;
			} else {
				this.addInfo.Second.Type = 2;
			}
			this.$axios
				.post(this.$api.userspace + "cost", {
					Addr: this.addInfo.Addr,
					Second: {
						Value: Math.abs(this.addInfo.Second.Value),
						Type: this.addInfo.Second.Type
					},
					Size: {
						Value: Math.abs(this.addInfo.Size.Value),
						Type: this.addInfo.Size.Type
					}
				})
				.then(res => {
					if (res.Error === 0) {
						this.cost = res.Result;
					} else {
						this.cost.Fee = "";
						this.cost.FeeFormat = "";
						this.cost.TransferType = 1;
					}
				})
				.catch(error => {
					if (error.message.includes("timeout")) {
						this.$message.error(this.$t('error.requestTimeout'));
					}
				});
		},
		setSizeValue() {
			if (
				this.adjustSize * this.sizeUnit -
					(this.space.Remain + this.space.Used) ===
				0
			) {
				this.addInfo.Size.Value = this.adjustSize * this.sizeUnit;
				this.addInfo.Size.Type = 0;
			} else if (
				this.adjustSize * this.sizeUnit -
					(this.space.Remain + this.space.Used) >
				0
			) {
				this.addInfo.Size.Value =
					this.adjustSize * this.sizeUnit -
					(this.space.Remain + this.space.Used);
				this.addInfo.Size.Type = 1;
			} else {
				this.addInfo.Size.Value =
					this.space.Remain + this.space.Used - this.adjustSize * this.sizeUnit;
				this.addInfo.Size.Type = 2;
			}
		},
		setDateValue(e, fixed) {
			if (!e) {
				this.addInfo.Second.Type = 0;
				return;
			}
			if (!fixed) {
				console.log("not fixed time, so we adjust to last second");
				e = new Date(new Date(e).getTime() + 86399000);
			}
			this.expired = e;
			this.userSpaceCost();
		}
	}
};
</script>
<style lang="scss">
$grey: #ccc;
#expand {
	height: 100%;
	& > .content {
		height: 100%;
		padding: 0 50px 10px;
		display: flex;
		flex-direction: column;
		.space-header {
			padding-top: 30px;
			display: flex;
			align-items: flex-end;
			& > .storage {
				min-width: 125px;
			}

			.space-progress {
				margin-right: 10px;
				.el-progress-bar__outer,
				.el-progress-bar__inner {
					border-radius: 0px;
				}
				width: 100%;
				.el-progress {
					width: 100%;
				}
			}
		}
		.space-record {
			display: flex;
			flex: 1;
			flex-direction: column;
			.el-table {
				font-weight: bold;
			}
		}
	}
	.el-dialog__body {
		padding: 20px 60px;
	}
	.adjust {
		border-bottom: solid 1px;
		@include themify {
			border-color: $table-border-color;
		}
		margin-bottom: 20px;
		padding-bottom: 20px;
	}
	.adjust-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 15px 0;
		.adjust-title {
			font-size: 1.4rem;
			width: 160px;
			padding-right: 30px;
			text-align: right;
		}
		.adjust-info {
			flex: 1;
			width: 200px;
			display: flex;
			align-items: center;
			.sizeunit {
				width: 100px;
				margin: 0 20px;
			}
		}
	}
}
</style>
