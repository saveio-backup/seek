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
			<div class="space-record">
				<p class="theme-font-blue bold">Space adjust record</p>
				<el-table
				 :data='record'
				 empty-text='No data'
				>
					<el-table-column prop='space'></el-table-column>
					<el-table-column prop='period'></el-table-column>
					<el-table-column prop='cost'></el-table-column>
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
							<p class="grey-xs bold ml20">{{space.Used}}KB / {{space.Used}}KB</p>
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
							 @change="addInfo.Size = spaceSizeKB"
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
							 @change='getDateValue'
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
	data() {
		const expired =
			this.$dateFormat.formatTimeByTimestamp(
				this.$store.state.Filemanager.space.ExpiredAt * 1000
			) || this.$dateFormat.formatTimeByTimestamp(now.getTime());
		return {
			submitToggle: true, // commit toggle
			spaceSizeKB: 1,
			expired,
			pickerOptions: {
				disabledDate: () => {
					return false;
					// const now = new Date().getTime();
					// return date.getTime() - now < 0;
				}
			},
			addInfo: {
				Addr: window.localStorage.getItem("Address"),
				Size: 1,
				Second: 0
			},
			expandDialogVisible: false,
			record: []
		};
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
		addUserSpace() {
			if (!this.submitToggle) return;
			const addr = this.addInfo.Second >= 0 ? "add" : "revoke";
			this.$axios
				.post(this.$api.userspace + addr, {
					Addr: this.addInfo.Addr,
					Second: Math.abs(this.addInfo.Second),
					Size: this.addInfo.Size
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
		getDateValue(e) {
			console.log(e);
			if (!e) return;
			this.addInfo.Second = Math.floor(
				(e.getTime() - new Date(this.expired_old).getTime()) / 1000
			);
		}
	}
};
</script>
<style lang="scss">
$grey: #ccc;
#expand {
	& > .content {
		padding: 0 50px;
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
			.el-button{
				height:40px;
			}
		}
		.space-record {
			margin-top: 50px;
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
