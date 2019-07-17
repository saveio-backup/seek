<template>
	<div id="channels-vue">
		<div
		 class="channels"
		 v-if="channels"
		>
			<el-table
			border
			 :data="channels"
			 ref="singleTable"
			 empty-text='No Data'
			 height='100%'
			 :highlight-current-row='showRadio'
			 @current-change="handleCurrentChange"
			>
				<el-table-column
				 label='Channel'
				 :min-with="120"
				>
					<template slot-scope="scope">
						<div class="bold">{{scope.row.ChannelId}}</div>
					</template>
				</el-table-column>
				<el-table-column
				 label='Status'
				 :min-with="120"
				>
					<template slot-scope="scope">
						<div :title="scope.row.Connected ? 'online' : 'offline'" :class="{'theme-font-blue-40':!scope.row.Connected}">{{scope.row.Connected ? 'online' : 'offline'}}</div>
					</template>
				</el-table-column>
				<el-table-column label='Balance(SAVE)'>
					<template slot-scope="scope">
						<div class="grey-xs ft14">
							{{filterFloat(scope.row.BalanceFormat).toLocaleString('en-US')}}
						</div>
					</template>
				</el-table-column>
				<el-table-column
				 label='Address'
				>
				<template slot-scope="scope">
					<div class="grey-xs ft14">
						{{scope.row.Address}}
					</div>
				</template>
				</el-table-column>
				<el-table-column
				 label='DNS'
				>
					<template slot-scope="scope">
						<div class="grey-xs ft14">
							{{scope.row.HostAddr}}
						</div>
					</template>
				</el-table-column>
				<el-table-column
				 width="80"
				 v-if="showRadio"
				>
					<span class="channel-radio"></span>
				</el-table-column>
				<!-- <el-table-column
				 label="Created Time"
				>
					<template slot-scope="scope">
						<div class="grey-xs ft14">
							{{scope.row.HostAddr}}
						</div>
					</template>
				</el-table-column> -->
				<el-table-column
				width="160"
				 v-if="showTransfer"
				>
					<template slot-scope="scope">
						<span
							v-show="scope.row.Participant1State !== 0"
							class="user-no-select"
							:class="{'theme-font-blue-40':!scope.row.Connected,'light-blue cursor-pointer cursor-click':scope.row.Connected}"
							@click="openTransfer(scope.row)"
							:title="scope.row.Connected?'transfer':'The channel is offline and no transfer is allowed'"
						>
						<!-- Transfer -->
						<i class="ofont ofont-huazhuan"></i>
						</span>
						<span
							v-show="scope.row.Participant1State !== 0"
							class="light-blue ml20 cursor-pointer cursor-click user-no-select"
							@click="openClose(scope.row)"
							title="close channel"
						>
						<i class="ofont ofont-close"></i>
						<!-- Close -->
						</span>
						<span class="closingWrapper" v-show="scope.row.Participant1State === 0">settle...</span>
					</template>
				</el-table-column>
			</el-table>
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
				 @closeDialog='switchToggle.assetTransferDialog = false'
				 ref="channelwallettransfer"
				 :channelSelected='channelSelected'
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
		 class="channel-opeation-dialog"
		 width='550px'
		 :close-on-click-modal='false'
		 :visible.sync="channelToggle.channelCloseDialog"
		 center
		>
			<div slot="title">
				<h2>{{channelToggle.type === 'del' ? 'Close' : 'Open'}} Channel</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content loading-content-2">
				<el-form
				ref="channelForm"
				:model="channelForm"
				:rules="dialogRules"
				>
					<el-form-item
					 class="theme-font-blue-bold"
					 label="DNS Wallet Address"
					 prop="partner"
					v-show="channelToggle.type==='add'"
					>
						<el-input
						v-model="channelForm.partner"
						class="channel-opeation-input grey-theme"
						placeholder="Please input partner dns wallet address"
						@keyup.enter.native="toPeationChannel">
						</el-input>
					</el-form-item>
					<el-form-item
					 class="theme-font-blue-bold"
					 label="Password"
					 prop="password"
					>
						<el-input
						v-model="channelForm.password"
						placeholder="Please Input Wallet Password"
						@keyup.enter.native="toPeationChannel"
						class="channel-opeation-input grey-theme"
						show-password
						type="password">
						</el-input>
					</el-form-item>
				</el-form>
				<div slot="footer">
					<el-button @click="channelToggle.channelCloseDialog = false">Cancel</el-button>
					<el-button
					 type="primary"
					 class="primary"
					 @click="toPeationChannel"
					>Confirm</el-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { filterFloat } from "../assets/config/util";
import channelWalletTransfer from "./ChannelWalletTransfer.vue";
export default {
	components: {
		channelWalletTransfer
	},
	props: {
		showRadio: {
			required: false,
			default: false
		},
		showTransfer: {
			required: false,
			default: false
		}
	},
	data() {
		return {
			switchToggle: {
				assetTransferDialog: false
			},
			channelToggle: {
				channelDialog: false,
				loading: null,
				type: 'del' // add or del
			},
			channelForm: {
				password: '',
				partner: ''
			},
			dialogRules: {
				password: [
					{
						required: true,
						message: "Please fill password",
						trigger: "blur"
					}
				],
				partner: [
					{
						required: true,
						message: "Please fill partner wallet address",
						trigger: "blur"
					}
				]
			},
			currentRow: {},
			filterFloat,
			channelSelected: {},
			mockChannels: [
				{
					ChannelId: 107,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "im007",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "gofkys007"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				},
				{
					ChannelId: 101,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV"
				}
			]
		};
	},
	mounted() {
		this.initCurrentRow();
	},
	methods: {
		initCurrentRow() {
			let result = this.channels.some((channel, index) => {
				if (
					channel.ChannelId.toString() === localStorage.getItem("channelBindId")
				) {
					this.currentRow = channel;
					this.setCurrent(this.channels[index]);
					return true;
				} else {
					return false;
				}
			});
			if (!result && this.channels.length > 0) {
				// if no bind in localstorage ,  choose first channel
				this.setCurrent(this.channels[0]);
			}
		},
		setCurrent(row) {
			this.$refs.singleTable.setCurrentRow(row);
		},
		handleCurrentChange(currentRow, oldCurrentRow) {
			console.log("curreuntRow is");
			console.log(currentRow);
			console.log("oldCurrentRow is ");
			console.log(oldCurrentRow);
			this.currentRow = currentRow ? currentRow : oldCurrentRow;
			this.channels.map((channel, index) => {
				if (
					channel.ChannelId.toString() === this.currentRow.ChannelId.toString()
				) {
					this.setCurrent(this.channels[index]);
				}
			});
		},
		applyChange() {
			localStorage.setItem("channelBindId", this.currentRow.ChannelId);
			this.$store.dispatch(
				"setChannelBind",
				localStorage.getItem("channelBindId") || ""
			);
		},
		openTransfer(channelSelected) {
			if(!channelSelected.Connected) return;
			this.channelSelected = channelSelected;
			this.switchToggle.assetTransferDialog = true;
		},
		toConfirm() {
			this.$refs["channelwallettransfer"].toTransfer();
		},
		openOpen(dnsAdress) {
			this.channelToggle = {
				type: 'add',
				channelCloseDialog: true,
				loading: null
			}
			this.$nextTick(() => {
				this.$refs['channelForm'].resetFields();
				this.channelForm.partner = dnsAdress;
			})
		},
		openClose(channelSelected) {
			this.channelToggle = {
				type: 'del',
				channelCloseDialog: true,
				loading: null
			}
			this.$nextTick(() => {
				this.$refs['channelForm'].resetFields();
				this.channelForm.partner = channelSelected.Address;
			})
		},
		toPeationChannel() {
			this.$refs['channelForm'].validate(valid => {
				if(!valid) return;
				this.channelToggle.loading = this.$loading({
					lock: true,
					text: "Processing...",
					target: ".loading-content-2"
				});
				let params = {
					Password: this.channelForm.password,
					Partner: this.channelForm.partner
				}	
				if(this.channelToggle.type === 'add') {
					this.toChannelOpen(params)
				} else {
					this.toChannelClose(params)
				}
			})
		},
		toChannelOpen(params) {
			this.$axios.post(this.$api.channelOPen, params).then(res => {
				if(res.data.Error === 0) {
					this.$message({
						message: "Opeation successed",
						type: "success"
					});
					this.channelToggle.channelCloseDialog = false;
				} else {
					this.$message.error(res.data.Desc || "Opeation Failed");
				}
				this.$store.dispatch('setChannelBalanceTotal');
				this.channelToggle.loading.close();
				this.channelToggle.loading = null;
			}).catch(() => {
				this.channelToggle.loading.close();
				this.channelToggle.loading = null;
				this.$message.error(
					"Opeation failed."
				);
			});
		},
		toChannelClose(params) {
			this.$axios.post(this.$api.channelClose, params).then(res => {
				if(res.data.Error === 0) {
					this.channelToggle.channelDialog = false;
					this.$message({
						message: "Opeation successed",
						type: "success"
					});
					this.channelToggle.channelCloseDialog = false;
				} else {
					this.$message.error(res.data.Desc || "Opeation Failed");
				}
				this.$store.dispatch('setChannelBalanceTotal');
				this.channelToggle.loading.close();
				this.channelToggle.loading = null;
			}).catch(() => {
				this.channelToggle.loading.close();
				this.channelToggle.loading = null;
				this.$message.error(
					"Opeation failed."
				);
			});
		}
	},
	computed: {
		channels: function() {
			return this.$store.state.Home.channels;
		}
	}
};
</script>
<style lang="scss">
$theme-color: #202020;
#channels-vue {
	flex: 1;
	overflow: hidden;
	border-radius: 6px;
	box-shadow:0px 2px 20px 0px rgba(196, 196, 196, 0.24);
}
.channels {
	height: 100%;
	overflow-y: auto;
	border-bottom-left-radius: 2px;
	border-bottom-right-radius: 2px;
	padding: 0 25px;
	background: #fff;
	.el-table {
		color: $theme-color;
		background: rgba(255, 2555, 255, 1);

		td {
			background: rgba(255, 2555, 255, 1);
		}
		
		thead th {
			color: $theme-color;
			// font-weight: bold;
			background: rgba(255, 2555, 255, 1);
		}
	}
	.current-row {
		.channel-radio {
			position: relative;
			border-color: #409eff;
			background: #409eff;
			&::after {
				content: "";
				position: absolute;
				border-radius: 100%;
				width: 5px;
				height: 5px;
				left: 50%;
				top: 50%;
				background: #fff;
				transform: translateX(-50%) translateY(-50%);
			}
		}
	}
	.channel-radio {
		position: relative;
		border: 1px solid #dcdfe6;
		display: inline-block;
		border-radius: 100%;
		width: 14px;
		height: 14px;
	}
}
.closingWrapper {
	width: 40px;
	color: #49C269;
	overflow: hidden;
	white-space: nowrap;
	display: block;
	animation: closingAnmiation 1.5s linear infinite;
}
@keyframes  closingAnmiation {
	0% {
		width: 40px;
	}
	24% {
		width: 40px;
	}
	25% {
		width: 43px;
	}
	49% {
		width: 43px;
	}
	50% {
		width: 46px;
	}
	74% {
		width: 46px;
	}
	75% {
		width: 49px;
	}
	99% {
		width: 49px;
	}
	100% {
		width: 40px;
	}
}
</style>
