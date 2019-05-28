<template>
	<div id="expand">
		<div class="content">
			<div class="space-header">
				<div class="space-progress">
					<div class="theme-font-blue bold mb20">Used: {{space.Used}} KB / {{space.Remain}} KB</div>
					<el-progress
					 :stroke-width="30"
					 :percentage="takeSpace"
					></el-progress>
				</div>
				<el-button @click="expandDialogVisible = true">Get Space</el-button>
			</div>
			<p class="theme-font-blue bold mb20">Space adjust record</p>
			<div class="space-record">
				<el-table
				 :data='Records'
				 ref='recordTable'
				 empty-text='No data'
				 height='100%'
				>
					<el-table-column
					 label='Size'
					 prop='Size'
					></el-table-column>
					<el-table-column label='ExpiredAt'>
						<template slot-scope="scope">
							<div class="light-blue">
								{{ $dateFormat.formatTimeByTimestamp(scope.row.ExpiredAt * 1000)}}
							</div>
						</template>
					</el-table-column>
					<el-table-column
					 label='Cost'
					 prop="Cost"
					></el-table-column>
				</el-table>
			</div>
			<el-dialog
			 center
			 width='600px'
			 :visible.sync="expandDialogVisible"
			>
				<div slot="title">
					<h2>Expand</h2>
					<div class="dialog-title-border"></div>
				</div>
				<div class="adjust">
					<h3 class="theme-font-blue transparent bold ft12">Space Size</h3>
					<div class="adjust-item">
						<p class="adjust-title theme-font-blue bold">Current:</p>
						<div class="adjust-info">
							<p class="theme-font-blue ft14 mr20">{{space.Remain}}KB</p>
							<p class="grey-xs bold ml20">{{space.Used}}KB / {{space.Remain}}KB</p>
						</div>
					</div>
					<div class="adjust-item">
						<div class="adjust-title theme-font-blue bold">Adjust to:</div>
						<div class="adjust-info">
							<el-input-number
							 class="number"
							 v-model="spaceSizeKB"
							 :precision='0'
							 :min='1'
							 @change="setSizeValue"
							></el-input-number>
							<p class="adjust-title theme-font-blue bold ml10">KB</p>
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
				<span
				 slot="footer"
				 class="dialog-footer"
				>
					<el-button @click="expandDialogVisible = false">Cancel</el-button>
					<el-button
					 type="primary"
					 @click="addUserSpace"
					>Pledge</el-button>
				</span>
			</el-dialog>
		</div>
	</div>
</template>
<script>
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
		const expired =
			this.$dateFormat.formatTimeByTimestamp(
				this.$store.state.Filemanager.space.ExpiredAt * 1000
			) || this.$dateFormat.formatTimeByTimestamp(now.getTime());
		return {
			switchToggle: { loadSwitch: true },
			submitToggle: true, // commit toggle
			spaceSizeKB: 1,
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
			expandDialogVisible: false,
			Records: [],
			offset: 0,
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
		space: {
			handler: function(newValue) {
				this.spaceSizeKB = newValue.Remain;
			},
			deep: true
		},
		expired_old: {
			handler: function(newValue) {
				this.expired = newValue;
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
			if (this.space.Remain) {
				return (this.space.Used / this.space.Remain) * 100;
			} else {
				return 100;
			}
		}
	},
	methods: {
		addListenScroll(element, distance, callback) {
			element.addEventListener("scroll", function() {
				console.log(`element.scrollTop is: ${element.scrollTop},
				element.clientHeight is ${element.clientHeight},
				distance is ${distance},
				element.scrollHeight is ${element.scrollHeight}
				`);
				if (
					element.scrollTop + element.clientHeight + distance >=
					element.scrollHeight
				) {
					console.log("scroll Toggle");
					callback();
				}
			});
		},
		getUserSpaceRecords() {
			if (!this.switchToggle.loadSwitch) return;
			this.switchToggle.loadSwitch = false;
			this.$axios(
				this.$api.userspacerecords +
					localStorage.getItem("Address") +
					"/" +
					this.offset * this.limit +
					"/" +
					(this.offset * this.limit + this.limit - 1)
			)
				.then(res => {
					if (res.data.Error === 0) {
						if (res.data.Result.Records.length > 0) {
							this.offset += 1;
							this.Records = this.Records.concat(res.data.Result.Records);
							this.switchToggle.loadSwitch = true;
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
		addUserSpace() {
			if (!this.submitToggle) return;
			this.submitToggle = false;
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
					console.log(res);
					if (res.data.Error === 0) {
						this.expandDialogVisible = false;
						this.$message({
							message: "Adjust Successed!",
							type: "success"
						});
						this.$store.dispatch("setSpace");
					}
					this.submitToggle = true;
				})
				.catch(err => {
					console.error(err);
					this.submitToggle = true;
				});
		},
		setSizeValue() {
			// this.addInfo.Size.Value = this.spaceSizeKB;
			if (this.spaceSizeKB - this.space.Remain === 0) {
				this.addInfo.Size.Value = this.spaceSizeKB;
				this.addInfo.Size.Type = 0;
			} else if (this.spaceSizeKB - this.space.Remain > 0) {
				this.addInfo.Size.Value = this.spaceSizeKB - this.space.Remain;
				this.addInfo.Size.Type = 1;
			} else {
				this.addInfo.Size.Value = this.space.Remain - this.spaceSizeKB;
				this.addInfo.Size.Type = 2;
			}
		},
		setDateValue(e) {
			if (!e) return;
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
		}
	}
	.el-dialog__header {
		padding-top: 10px;
		text-align: center;
		// background: $grey;
	}
}
</style>
