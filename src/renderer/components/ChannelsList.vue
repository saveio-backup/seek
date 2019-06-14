<template>
	<div id="channels-vue">
		<div
		 class="channels"
		 v-if="channels"
		>
			<el-table
			 :data="channels"
			 ref="singleTable"
			 empty-text='No Data'
			 height='100%'
			 :highlight-current-row='showRadio'
			 @current-change="handleCurrentChange"
			>
				<el-table-column
				 prop='ChannelId'
				 label='Channel'
				></el-table-column>
				<el-table-column label='Balance'>
					<template slot-scope="scope">
						<div class="light-blue">
							{{filterFloat(scope.row.BalanceFormat).toLocaleString('en-US')}}
						</div>
					</template>
				</el-table-column>
				<el-table-column
				 prop='TokenAddr'
				 label='Addr'
				></el-table-column>
				<el-table-column
				 prop='HostAddr'
				 label='DNS'
				></el-table-column>
				<el-table-column
				 width="80"
				 v-if="showRadio"
				>
					<span class="channel-radio"></span>
				</el-table-column>
				<el-table-column
				 width="80"
				 v-if="showTransfer"
				>
					<template slot-scope="scope">
						<span @click="openTransfer(scope.row)">Transfer</span>
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
				 ref="channelwallettransfer"
				 :channelSelected='channelSelected'
				></channel-wallet-transfer>
				<div slot="footer">
					<el-button
					 type="primary"
					 @click="toConfirm"
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
			this.channelSelected = channelSelected;
			this.switchToggle.assetTransferDialog = true;
		},
		toConfirm() {
			this.$refs["channelwallettransfer"].toTransfer();
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
$theme-color: #1b1e2f;
#channels-vue {
	flex: 1;
	overflow: hidden;
}
.channels {
	height: 100%;
	overflow-y: auto;
	border-bottom-left-radius: 2px;
	border-bottom-right-radius: 2px;
	.el-table thead th {
		color: $theme-color;
		font-weight: bold;
		background: rgba(231, 231, 235, 1);
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
</style>
