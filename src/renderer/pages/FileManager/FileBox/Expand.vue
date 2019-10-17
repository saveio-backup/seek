<template>
	<div id="expand">
		<div class="content">
			<div class="space-header">
				<div class="space-progress">
					<div class="theme-font-blue bold mb10 ft14 user-no-select">{{$t('fileManager.used')}}: {{util.bytesToSize(space.Used * 1024)}} / {{util.bytesToSize((space.Used + space.Remain) *1024)}} <span class="theme-font-blue-40 bold ft14 ">{{$t('fileManager.expiredTime')}} :{{expired_old}}</span> </div>
					<el-progress
						:stroke-width="30"
						:percentage="takeSpace"
					></el-progress>
				</div>
				<ripper-button
					ref='getspace'
					@click="openExpandDialog"
					class="storage"
				>{{$t('fileManager.storage')}}</ripper-button>
			</div>
			<p class="theme-font-blue bold mt40 mb10 ft14 user-no-select">{{$t('fileManager.spaceAdjustRecord')}}</p>
			<div class="space-record">
				<!-- border -->
				<el-table
					:data='Records'
					ref='recordTable'
					:empty-text="$t('public.noData')"
					height='100%'
				>
					<el-table-column
						:label="$t('fileManager.size')"
						prop="Size"
						sortable
					>
						<template slot-scope="scope">
							<div>
								{{util.bytesToSize(scope.row.Size * 1024)}}
							</div>
						</template>
					</el-table-column>
					<el-table-column
						:label="$t('fileManager.expiredTime')"
						prop="ExpiredAt"
						sortable
					>
						<!-- prop="ExpiredAt"
						sortable -->
						<template slot-scope="scope">
							<div>
								{{ $dateFormat.formatTimeByTimestamp(scope.row.ExpiredAt * 1000)}}
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
							<div class="adjust-title bold ft14 tl theme-font-blue-40">{{$t('fileManager.spaceSize')}}:</div>
						</div>
						<!-- <h3 class="theme-font-blue transparent bold ft12">Space Size:</h3> -->
						<div class="adjust-item">
							<p class="adjust-title theme-font-blue ft14">{{$t('fileManager.current')}}:</p>
							<div class="adjust-info">
								<p class="theme-font-blue ft14 mr20">{{util.bytesToSize( (space.Used + space.Remain)*1024)}}</p>
								<p class="theme-font-blue-40 ft14 ml20">{{util.bytesToSize(space.Used *1024)}} / {{util.bytesToSize( (space.Used + space.Remain)*1024)}}</p>
							</div>
						</div>
						<div class="adjust-item">
							<div class="adjust-title theme-font-blue ft14">{{$t('fileManager.adjustTo')}}:</div>
							<div class="adjust-info">
								<el-input-number
									ref="spaceNumberInput"
									class="number grey-theme"
									v-model="adjustSize"
									:precision='0'
									:min='minSize'
									@change="userSpaceCost"
									@focus="$refs.spaceNumberInput.select()"
									@blur="userSpaceCost"
								></el-input-number>
								<!-- @change="setSizeValue" -->
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
							<div class="adjust-title  theme-font-blue-40 bold ft14 tl">{{$t('fileManager.spaceDate')}}:</div>
						</div>
						<div class="adjust-item">
							<p class="adjust-title theme-font-blue ft14">{{$t('fileManager.expiryDate')}}:</p>
							<div class="adjust-info">
								<p class="theme-font-blue">{{expired_old}}</p>
							</div>
						</div>
						<div class="adjust-item">
							<div class="adjust-title theme-font-blue ft14">{{$t('fileManager.adjustTo')}}:</div>
							<div class="adjust-info">
								<el-date-picker
									v-model="expired"
									@change='setDateValue'
									format='yyyy-MM-dd-HH:mm:ss'
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
							<p class="adjust-title theme-font-blue ft14">{{cost.TransferType === 2?$t('fileManager.pledgeRefund'):$t('fileManager.pledgePayment')}}:</p>
							<div class="adjust-info theme-font-blue ft14">
								<div v-if="cost.TransferType !== 2">
									{{cost.FeeFormat?util.effectiveNumber(cost.FeeFormat):0}} ONI
								</div>
								<div v-if="cost.TransferType === 2">
									{{cost.RefundFormat? util.effectiveNumber(cost.RefundFormat):0}} ONI
								</div>
							</div>
						</div>
						<div class="adjust-item">
							<p class="adjust-title theme-font-blue ft14"></p>
							<div class="adjust-info theme-font-blue-40 ft14">
								<span class="mr10">{{$t('fileManager.available')}}</span> {{mainCount? util.effectiveNumber(mainCount):0}} ONI
							</div>
						</div>
					</div>
					<div class="adjust">
						<div class="adjust-item">
							<div class="adjust-title theme-font-blue ft14">{{$t('public.walletPassword')}}:</div>
							<div class="adjust-info theme-font-blue-40 ft14 mr20">
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
					<div slot="footer">
						<ripper-button @click="expandDialogVisible = false">{{$t('public.cancel')}}</ripper-button>
						<ripper-button
							type="primary"
							class="primary"
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
							class="primary"
							@click="linkUpload"
						>{{$t('fileManager.update')}}</ripper-button>
					</div>
				</div>
			</el-dialog>
		</div>
	</div>
</template>
<script>
import util from "../../../assets/config/util";
import $date from "../../../assets/tool/date";
const _NOW = new Date();
// const nextDay = new Date(now.setDate(now.getDate() + 1));
// nextDay.setHours(23);
// nextDay.setMinutes(59);
// nextDay.setSeconds(59);
export default {
	mounted() {
		this.hasUploadedFile();
		this.getUserSpaceRecords();
		// getUserSpaceRecords
		let element = this.$refs.recordTable.bodyWrapper;
		this.addListenScroll(element, 100, this.getUserSpaceRecords);
	},
	data() {
		// const expired =
		// 	this.$dateFormat.formatTimeByTimestamp(
		// 		this.$store.state.Filemanager.space.ExpiredAt * 1000
		// 	) || this.$dateFormat.formatTimeByTimestamp(now.getTime());
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
					// (this.space.ExpiredAt * 1000)
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
			console.log("Watch sizeUnit!!!");
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
				// this.expired = new Date(_NOW.getTime());
				this.expired = $date.lastSecondByDate(_NOW);
				return this.$dateFormat.formatTimeByTimestamp(_NOW.getTime());
			}
			// return (
			// 	this.$dateFormat.formatTimeByTimestamp(
			// 		this.$store.state.Filemanager.space.ExpiredAt * 1000
			// 	) || this.$dateFormat.formatTimeByTimestamp(_NOW.getTime())
			// );
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
			let addr = this.$api.getFileList + "0/0/0";
			let result = await this.$axios.get(addr);
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
				/* 				console.log(`element.scrollTop is: ${element.scrollTop},
				element.clientHeight is ${element.clientHeight},
				distance is ${distance},
				element.scrollHeight is ${element.scrollHeight}
				`); */
				if (
					element.scrollTop + element.clientHeight + distance >=
					element.scrollHeight
				) {
					console.log("scroll Toggle");
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
				this.$message(vm.$t('public.pleaseInputWalletPassword'));
				return false;
			}
			return true;
		},
		linkUpload() {
			this.$router.push({
				name: "upload"
			});
		},
		setUserSpace() {
			const vm = this;
			if (!this.submitToggle) return;
			if (this.cost.FeeFormat === "" || this.cost.FeeFormat === undefined) {
				this.$message.error("Please adjust your space and date.");
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
						Password: this.Password
					},
					{
						loading: {
							text: vm.$t('fileManager.upgrading'),
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
								this.$message({
									message: vm.$t('fileManager.getStorageSuccessed'),
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
						this.$message.error(vm.$t('fileManager.networkErrorSetUserSpaceFailed'));
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
				});
		},
		setSizeValue() {
			// this.addInfo.Size.Value = this.adjustSize;
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
			console.log("expired: ", this.expired);
			console.log("before e is :", e);
			if (!fixed) {
				console.log("not fixed time, so we adjust to last second");
				e = new Date(new Date(e).getTime() + 86399000);
			}
			console.log("e is:", e);
			this.expired = e;
			this.userSpaceCost();
		}
	}
};
</script>
<style lang="scss">
$theme-font-blue: #040f39;
$grey: #ccc;
#expand {
	height: 100%;
	& > .content {
		height: 100%;
		padding: 0 50px 10px;
		display: flex;
		flex-direction: column;
		background: #f9f9fb;
		.space-header {
			padding-top: 30px;
			display: flex;
			align-items: flex-end;
			& > .storage {
				min-width: 90px;
			}

			.space-progress {
				.el-progress-bar__outer,
				.el-progress-bar__inner {
					border-radius: 0px;
				}
				width: 100%;
				.el-progress {
					width: 100%;
				}
			}
			// .el-button {
			// height: 40px;
			// }
		}
		.space-record {
			display: flex;
			flex: 1;
			flex-direction: column;
			.el-table {
				color: $theme-font-blue;
				font-weight: bold;
				thead th {
					background: #f9f9fb;
					color: #1b1e2f;
					// font-weight: bold;
				}
			}
		}
	}
	.el-dialog__body {
		padding: 20px 60px;
	}
	.adjust {
		border-bottom: solid 1px #ebecef;
		margin-bottom: 20px;
		padding-bottom: 20px;
		.el-input-number__increase,
		.el-input-number__decrease {
			// display: none;
		}
	}
	.adjust-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 15px 0;
		.adjust-title {
			font-size: 14px;
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
