<template>
	<div id="expand">
		<div class="content">
			<div class="space-header">
				<div class="space-progress">
					<div class="grey-xs bold ft20">Used: {{space.Used}} / {{space.Remain}}</div>
					<el-progress
					 :stroke-width="30"
					 :percentage="takeSpace"
					></el-progress>
				</div>
				<el-button @click="expandDialogVisible = true">Get Space</el-button>
			</div>
			<div class="space-record">
				<p class="grey-xs bold ft20">Space adjust record</p>
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
			 width='600px'
			 :visible.sync="expandDialogVisible"
			>
			<div slot="title">
				<h2>Expand</h2>
				<div class="dialog-title-border"></div>
			</div>
				<el-dialog
				 width="30%"
				 title="Success"
				 :visible.sync="innerVisible"
				 append-to-body
				 center
				>
					<span
					 slot="footer"
					 class="dialog-footer"
					>
						<el-button
						 type="primary"
						 @click='innerVisible = false; expandDialogVisible = false'
						>OK</el-button>
					</span>
				</el-dialog>
				<div class="adjust">
					<h3>Space Size</h3>
					<div class="adjust-item">
						<p class="adjust-title">Current</p>
						<div class="adjust-info">
							<p>{{space.Remain}}GB</p>
							<p>{{space.Used}}GB / {{space.Used}}GB</p>
						</div>
					</div>
					<div class="adjust-item">
						<div class="adjust-title">Adjust to</div>
						<div class="adjust-info">
							<el-input-number
							 v-model="spaceSizeGB"
							 :precision='0'
							 :min='1'
							 @change="addInfo.Size = spaceSizeGB * 1024"
							></el-input-number>
						</div>
						<p style="font-size: 22px;">GB</p>
					</div>
				</div>
				<div class="adjust">
					<h3>Expiry Date</h3>
					<div class="adjust-item">
						<p class="adjust-title">Current</p>
						<div class="adjust-info">
							{{expired_old}}
						</div>
					</div>
					<div class="adjust-item">
						<div class="adjust-title">Adjust to</div>
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
					<el-button
					 type="primary"
					 @click="addUserSpace"
					>Pledge</el-button>
					<el-button @click="expandDialogVisible = false">Cancel</el-button>
				</span>
			</el-dialog>
		</div>
	</div>
</template>
<script>
const now = new Date();
const nextDay = new Date(now.setDate(now.getDate() + 1));
nextDay.setHours(23);
nextDay.setMinutes(59);
nextDay.setSeconds(59);
export default {
	data() {
		const expired =
			this.$dateFormat.formatTimeByTimestamp(
				this.$store.state.Filemanager.space.ExpiredAt * 1000
			) || this.$dateFormat.formatTimeByTimestamp(now);
		return {
			submitToggle: true, // commit toggle
			innerVisible: false,
			spaceSizeGB: 1,
			expired,
			pickerOptions: {
				disabledDate: date => {
					const now = new Date().getTime();
					return date.getTime() - now < 0;
				}
			},
			addInfo: {
				Addr: window.localStorage.getItem("Address"),
				Size: 1024,
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
						this.innerVisible = true;
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
			.space-progress {
				.el-progress-bar__outer, .el-progress-bar__inner{
					border-radius: 0px;
				}
				width: 100%;
				.el-progress {
					width: 100%;
				}
			}
		}
		.space-record{
			margin-top: 50px;
		}
	}
	.adjust {
		& > h3 {
			text-align: center;
		}
		border-bottom: solid 1px #333;
		margin-bottom: 20px;
		padding-bottom: 20px;
	}
	.adjust-item {
		display: flex;
		align-items: center;
		.adjust-title {
			width: 100px;
			font-weight: bold;
		}
		.adjust-info {
			width: 200px;
			display: flex;
			justify-content: space-between;
		}
	}
	.el-dialog__header {
		padding-top: 10px;
		text-align: center;
		// background: $grey;
	}
}
</style>
