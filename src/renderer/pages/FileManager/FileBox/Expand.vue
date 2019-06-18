<template>
	<div id="expand">
		<div class="content">
			<div class="space-header">
				<div class="space-progress">
					<div class="theme-font-blue bold mb10 ft14">Used: {{util.bytesToSize(space.Used * 1024)}} / {{util.bytesToSize((space.Used + space.Remain) *1024)}}</div>
					<el-progress
					 :stroke-width="30"
					 :percentage="takeSpace"
					></el-progress>
				</div>
				<el-button
				 ref='getspace'
				 @click="expandDialogVisible = true"
				>Storage</el-button>
			</div>
			<p class="theme-font-blue bold mt40 mb10 ft14">Space adjust record</p>
			<div class="space-record">
				<el-table
				 :data='Records'
				 ref='recordTable'
				 empty-text='No Data'
				 height='100%'
				>
					<el-table-column
					 label='Size'
					>
					<template slot-scope="scope">
						<div>
							{{util.bytesToSize(scope.row.Size * 1024)}}
						</div>
					</template>
					</el-table-column>
					<el-table-column label='ExpiredAt'>
						<template slot-scope="scope">
							<div class="light-blue">
								{{ $dateFormat.formatTimeByTimestamp(scope.row.ExpiredAt * 1000)}}
							</div>
						</template>
					</el-table-column>
					<el-table-column
					 label='Cost'
					>
					<template slot-scope="scope">
						<div>
							<div>
								{{parseFloat(scope.row.CostFormat)}} SAVE
							</div>
						</div>
					</template>
					</el-table-column>
				</el-table>
			</div>
			<el-dialog
			 center
			 width='600px'
			 :visible.sync="expandDialogVisible"
			>
				<div slot="title">
					<h2>Storage</h2>
					<div class="dialog-title-border"></div>
				</div>
				<div class="loading-content">
					<div class="adjust">
						<h3 class="theme-font-blue transparent bold ft12">Space Size</h3>
						<div class="adjust-item">
							<p class="adjust-title theme-font-blue bold">Current:</p>
							<div class="adjust-info">
								<p class="theme-font-blue ft14 mr20">{{util.bytesToSize(space.Remain *1024)}}</p>
								<p class="grey-xs bold ml20">{{util.bytesToSize(space.Used *1024)}} / {{util.bytesToSize(space.Remain*1024)}}</p>
							</div>
						</div>
						<div class="adjust-item">
							<div class="adjust-title theme-font-blue bold">Adjust to:</div>
							<div class="adjust-info">
								<el-input-number
								 class="number"
								 v-model="adjustSize"
								 :precision='0'
								 :min='1'
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
						<h3 class="theme-font-blue transparent bold ft12">Expiry Date</h3>
						<div class="adjust-item">
							<p class="adjust-title theme-font-blue bold">Current:</p>
							<div class="adjust-info">
								<p class="theme-font-blue bold">{{expired_old}}</p>
							</div>
						</div>
						<div class="adjust-item">
							<div class="adjust-title theme-font-blue bold">Adjust to:</div>
							<div class="adjust-info">
								<el-date-picker
								 v-model="expired"
								 @change='setDateValue'
								 :picker-options="pickerOptions"
								 type="date"
								 placeholder="Choose date"
								>
								</el-date-picker>
							</div>
						</div>
					</div>
					<div
					 v-show='cost.TransferType'
					 class="mb20"
					>
						<div v-if="cost.TransferType == 1">
							Payment about {{parseFloat(cost.FeeFormat).toFixed(3)}} Save
						</div>
						<div v-if="cost.TransferType ==2">
							Refund about {{parseFloat(cost.FeeFormat).toFixed(3)}} Save
						</div>
					</div>
					<span
					 slot="footer"
					 class="dialog-footer"
					>
						<el-button @click="expandDialogVisible = false">Cancel</el-button>
						<el-button
						 type="primary"
						 @click="setUserSpace"
						>Update</el-button>
					</span>
				</div>

			</el-dialog>
		</div>
	</div>
</template>
<script>
import util from "../../../assets/config/util";
const now = new Date();
// const nextDay = new Date(now.setDate(now.getDate() + 1));
// nextDay.setHours(23);
// nextDay.setMinutes(59);
// nextDay.setSeconds(59);
export default {
	mounted() {
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
		const expired =
			this.$store.state.Filemanager.space.ExpiredAt * 1000 || now.getTime();
		return {
			util,
			sizeUnit: 1048576,
			sizeRange: {
				MB: 1024,
				GB: 1048576
			},
			adjustSize: 1,
			switchToggle: { loadSwitch: true, loading: "" },
			submitToggle: true, // commit toggle
			expired,
			pickerOptions: {
				disabledDate: date => {
					const now = new Date().getTime();
					return date.getTime() - now < 0;
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
			Records: [],
			limit: 20,
			mockRecords: [
				{
					Size: 20480,
					ExpiredAt: 1558600673,
					Cost: 276480027
				},
				{
					Size: 10240,
					ExpiredAt: 1558597073,
					Cost: 110592036
				},
				{
					Size: 20480,
					ExpiredAt: 1558600673,
					Cost: 276480027
				},
				{
					Size: 10240,
					ExpiredAt: 1558597073,
					Cost: 110592036
				},
				{
					Size: 20480,
					ExpiredAt: 1558600673,
					Cost: 276480027
				},
				{
					Size: 10240,
					ExpiredAt: 1558597073,
					Cost: 110592036
				},
				{
					Size: 20480,
					ExpiredAt: 1558600673,
					Cost: 276480027
				},
				{
					Size: 10240,
					ExpiredAt: 1558597073,
					Cost: 110592036
				},
				{
					Size: 20480,
					ExpiredAt: 1558600673,
					Cost: 276480027
				},
				{
					Size: 10240,
					ExpiredAt: 1558597073,
					Cost: 110592036
				},
				{
					Size: 20480,
					ExpiredAt: 1558600673,
					Cost: 276480027
				},
				{
					Size: 10240,
					ExpiredAt: 1558597073,
					Cost: 110592036
				},
				{
					Size: 20480,
					ExpiredAt: 1558600673,
					Cost: 276480027
				},
				{
					Size: 10240,
					ExpiredAt: 1558597073,
					Cost: 110592036
				},
				{
					Size: 20480,
					ExpiredAt: 1558600673,
					Cost: 276480027
				},
				{
					Size: 10240,
					ExpiredAt: 1558597073,
					Cost: 110592036
				},
				{
					Size: 20480,
					ExpiredAt: 1558600673,
					Cost: 276480027
				},
				{
					Size: 10240,
					ExpiredAt: 1558597073,
					Cost: 110592036
				}
			]
		};
	},
	watch: {
		expandDialogVisible: function() {
			// update adjustSize when open dialog
			this.adjustSize = (
				(this.space.Remain + this.space.Used) /
				this.sizeUnit
			).toFixed(2);
		},
		expired_old: {
			handler: function() {
				if (this.$store.state.Filemanager.space.ExpiredAt) {
					this.expired = new Date(
						this.$store.state.Filemanager.space.ExpiredAt * 1000
					);
				}
			},
			deep: true
		}
	},
	computed: {
		expired_old() {
			return (
				this.$dateFormat.formatTimeByTimestamp(
					this.$store.state.Filemanager.space.ExpiredAt * 1000
				) || this.$dateFormat.formatTimeByTimestamp(now)
			);
		},
		space() {
			return this.$store.state.Filemanager.space;
		},
		takeSpace: function() {
			return (
				(this.space.Used / (this.space.Used + this.space.Remain)) * 100 || 0
			);
		}
	},
	methods: {
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
					if (res.data.Error === 0) {
						if (res.data.Result.Records.length > 0) {
							if (amount) {
								this.Records = res.data.Result.Records;
								this.switchToggle.loadSwitch = true;
							} else {
								this.Records = this.Records.concat(res.data.Result.Records);
								this.switchToggle.loadSwitch = true;
							}
							return;
						} else {
							this.switchToggle.loadSwitch = false;
							return;
						}
					} else {
						this.switchToggle.loadSwitch = true;
						return;
					}
				})
				.catch(err => {
					console.error(err);
					this.switchToggle.loadSwitch = true;
				});
		},
		setUserSpace() {
			if (!this.submitToggle) return;
			this.submitToggle = false;
			this.switchToggle.loading = this.$loading({
				lock: true,
				text: "Upgrading",
				target: ".loading-content"
			});
			this.setDateValue(this.expired);
			this.setSizeValue();
			// const addr = this.addInfo.Second.Value >= 0 ? "add" : "revoke";
			this.$axios
				.post(this.$api.userspace + "set", {
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
					if (res.data.Error === 0) {
						this.expandDialogVisible = false;
						this.$message({
							message: "Adjust Successed!",
							type: "success"
						});
						this.$store.dispatch("setSpace");
						this.getUserSpaceRecords(this.Records.length + 1);
						this.setDateValue(); // no param  rest date.Type = 0
						this.cost = {};
					} else {
						this.$message({
							message: "Adjust Error, please check your expiry date or wallet.",
							type: "error"
						});
					}
					this.submitToggle = true;
					this.switchToggle.loading.close();
				})
				.catch(err => {
					console.error(err);
					this.submitToggle = true;
					this.switchToggle.loading.close();
				});
		},
		userSpaceCost() {
			console.log("cost");
			this.setSizeValue();
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
					if (res.data.Error === 0) {
						this.cost = res.data.Result;
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
		setDateValue(e) {
			if (!e) {
				this.addInfo.Second.Type = 0;
				return;
			}
			console.log("expired: ", this.expired);
			console.log("e is:", e);
			this.addInfo.Second.Value = Math.floor(
				(e.getTime() - new Date(this.expired_old).getTime()) / 1000
			);
			if (this.addInfo.Second.Value === 0) {
				this.addInfo.Second.Type = 0;
			} else if (this.addInfo.Second.Value > 0) {
				this.addInfo.Second.Type = 1;
			} else {
				this.addInfo.Second.Type = 2;
			}
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
		.space-header {
			padding-top: 30px;
			display: flex;
			align-items: flex-end;
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
			.el-button {
				height: 40px;
			}
		}
		.space-record {
			display: flex;
			flex: 1;
			flex-direction: column;
			.el-table {
				color: $theme-font-blue;
				font-weight: bold;
				thead th {
					background: #e7e7eb;
					color: #1b1e2f;
					font-weight: bold;
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
			display: none;
		}
		.number {
			.el-input__inner {
				height: 35px;
				line-height: 35px;
				background: #ebecef;
				border: none;
				border-radius: 2px;
				&:focus {
					border: none;
				}
			}
		}
	}
	.adjust-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 15px 0;
		.adjust-title {
			font-size: 16px;
			width: 150px;
			font-weight: bold;
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
	.el-dialog__header {
		padding-top: 10px;
		text-align: center;
		// background: $grey;
	}
}
</style>
