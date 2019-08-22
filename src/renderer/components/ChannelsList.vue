<template>
	<div id="channels-vue">
		<div
			class="channels"
			v-if="showRadio?channelsDns:channels"
		>
			<!-- :data="mockChannels" -->
			<!-- border -->
			<el-table
				:data="showRadio?channelsDns:channels"
				ref="singleTable"
				empty-text='No Data'
				height='100%'
				:highlight-current-row='showRadio'
				@current-change="handleCurrentChange"
			>
				<el-table-column
					label='Channel'
					min-width="80px"
					max-width="120px"
					prop="ChannelId"
					sortable
				>
					<template slot-scope="scope">
						<div class="bold">{{scope.row.ChannelId}}</div>
					</template>
				</el-table-column>
				<el-table-column
					label='Status'
					min-width="80px"
					max-width="120px"
					prop="Connected"
					sortable
				>
					<template slot-scope="scope">
						<div
							:title="scope.row.Connected ? 'Online' : 'Offline'"
							:class="{'theme-font-blue-40':!scope.row.Connected}"
						>{{scope.row.Connected ? 'online' : 'offline'}}</div>
					</template>
				</el-table-column>
				<el-table-column label='Balance(SAVE)'
					prop="Balance"
					sortable
				>
					<template slot-scope="scope">
						<div class="grey-xs ft14">
							{{filterFloat(scope.row.BalanceFormat).toLocaleString('en-US', { maximumFractionDigits: 9 })}}
						</div>
					</template>
				</el-table-column>
				<el-table-column
					label='Address'
					:max-width="600"
					prop="Address"
					sortable
				>
					<template slot-scope="scope">
						<div class="grey-xs ft14">
							{{scope.row.Address}}
						</div>
					</template>
				</el-table-column>
				<el-table-column label='DNS'
					prop="HostAddr"
					sortable
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
						<!-- :class="{'theme-font-blue-40':!scope.row.Connected,'light-blue cursor-pointer cursor-click':scope.row.Connected}" -->
						<span
							v-show="scope.row.Participant1State !== 0"
							class="opeation-icon light-blue user-no-select"
							@click="openTransfer(scope.row)"
							title="Transfer"
						>
							<!-- Transfer -->
							<i class="ofont ofont-huazhuan"></i>
						</span>
						<span
							v-show="scope.row.Participant1State !== 0"
							class="opeation-icon light-blue ml20 user-no-select"
							@click="openClose(scope.row)"
							title="Close Channel"
						>
							<i class="ofont ofont-guanbi ft12"></i>
							<!-- Close -->
						</span>
						<span
							class="closingWrapper"
							v-show="scope.row.Participant1State === 0"
						>settle...</span>
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
			<div class="loading-content loading-channel">
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
			width='600px'
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
						<!-- :fetch-suggestions="querySearchAsync" -->
						<el-autocomplete
							class="grey-theme"
							v-model="channelForm.partner"
							:fetch-suggestions="querySearchAsync"
							placeholder="Please Input"
							@select="handleSelect"
						></el-autocomplete>

						<!-- <el-select
							class="grey-theme"
							v-model="channelForm.partner"
							placeholder="Please Select"
						>
							<el-option
								v-for="item in dns"
								:key="item.WalletAddr"
								:label="`${item.WalletAddr}(${item.HostAddr})`"
								:value="item.WalletAddr"
								:disabled="dnsIsSelect(item.WalletAddr)"
							>
							</el-option>
						</el-select> -->
					</el-form-item>
					<el-form-item
						class="theme-font-blue-bold form-amount"
						label="Amount(SAVE)"
						prop="amount"
						v-if="channelToggle.type==='add'"
					>
						<p class="form-item-title">Recommended no less than 100 SAVE</p>
						<el-input
							v-model="channelForm.amount"
							placeholder="Please Input Top Up Amount"
							@blur="setFixed"
							min="0"
							@keyup.enter.native="toPeationChannel"
							class="channel-opeation-input grey-theme"
							type="number"
						>
						</el-input>
						<p style="font-weight: 500;"></p>
					</el-form-item>
					<el-form-item
						class="theme-font-blue-bold"
						label="Wallet Password"
						prop="password"
					>
						<el-input
							v-model="channelForm.password"
							placeholder="Please Input Wallet Password"
							@keyup.enter.native="toPeationChannel"
							class="channel-opeation-input grey-theme"
							show-password
							type="password"
						>
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
		const validateMount = (rule, value, callback) => {
			const reg = /^[1-9](\d{0,8})\.(\d{1,9})$|^0\.(\d{0,9})$|^[1-9](\d{0,8})$|^0$/;
			if (!reg.test(value)) {
				callback(new Error("Please enter the correct format"));
				return;
			}
			callback();
		};
		return {
			switchToggle: {
				assetTransferDialog: false
			},
			channelToggle: {
				channelDialog: false,
				loading: null,
				type: "del" // add or del
			},
			channelForm: {
				password: "",
				partner: "",
				amount: parseFloat(0).toFixed(9)
			},
			dialogRules: {
				amount: [
					{
						required: true,
						message: "Please fill amount",
						trigger: "blur"
					},
					{
						validator: validateMount,
						trigger: "blur"
					}
				],
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
						trigger: "change"
					}
				]
			},
			currentRow: {},
			filterFloat,
			channelSelected: {},
			mockChannels: [
				{
					ChannelId: 126,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "im007",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "gofkys007",
					IsDNS: false
				},
				{
					ChannelId: 196,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV",
					IsDNS: true
				},
				{
					ChannelId: 105,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV",
					IsDNS: true
				},
				{
					ChannelId: 106,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV",
					IsDNS: false
				},
				{
					ChannelId: 107,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV",
					IsDNS: false
				},
				{
					ChannelId: 108,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV",
					IsDNS: false
				},
				{
					ChannelId: 109,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV",
					IsDNS: false
				},
				{
					ChannelId: 110,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV",
					IsDNS: false
				},
				{
					ChannelId: 111,
					Balance: 1000000000,
					BalanceFormat: "1",
					Address: "ANa3f9jm2FkWu4NrVn6L1FGu7zadKdvPjL",
					HostAddr: "tcp://127.0.0.1:13004",
					TokenAddr: "AFmseVrdL9f9oyCzZefL9tG6UbvhUMqNMV",
					IsDNS: true
				}
			],
			dns: [],
			timeout: null
		};
	},
	mounted() {
		this.initCurrentRow();
	},
	methods: {
		// get all channel select address attr
		getAddr() {
			let arr = [];
			for (let value of this.channels) {
				arr.push(value.Address);
			}
			return arr;
		},
		// get select list
		querySearchAsync(queryString, cb) {
			let allSelectAddr = this.getAddr();
			let restaurants = this.dns.filter(item => {
				if (allSelectAddr.includes(item.WalletAddr)) return false;
				item["value"] = `${item.WalletAddr}(${item.HostAddr})`;
				return true;
			});
			cb(restaurants);
		},
		// dns select callback
		handleSelect(item) {
			this.channelForm.partner = item.WalletAddr;
		},
		getDns() {
			this.$axios.get(this.$api.getAllDns).then(res => {
				if (res.Error === 0) {
					this.dns = res.Result;
				} else {
					this.$message.error(
						this.$i18n.error[res.Error]
							? this.$i18n.error[res.Error][this.$language]
							: `error code is ${res.Error}`
					);
				}
			});
		},
		setFixed() {
			this.channelForm.amount = this.channelForm.amount
				? parseFloat(this.channelForm.amount).toFixed(9)
				: "";
		},
		initCurrentRow() {
			let result = this.channelsDns.some((channel, index) => {
				if (
					channel.ChannelId.toString() === localStorage.getItem("channelBindId")
				) {
					this.currentRow = channel;
					this.setCurrent(this.channelsDns[index]);
					return true;
				} else {
					return false;
				}
			});
			if (!result && this.channelsDns.length > 0) {
				// if no bind in localstorage ,  choose first channel
				this.setCurrent(this.channelsDns[0]);
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
			this.channelsDns.map((channel, index) => {
				if (
					channel.ChannelId.toString() === this.currentRow.ChannelId.toString()
				) {
					this.setCurrent(this.channelsDns[index]);
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
			if(this.isSync) {
				this.$confirm('Block unsynchronized completion. Are you sure to do this?', 'Notice', {
					confirmButtonText: 'confirm',
					cancelButtonText: 'cancel',
				}).then(() => {
					this.channelSelected = channelSelected;
					this.switchToggle.assetTransferDialog = true;
				}).catch(e => {
				})
			} else {
				this.channelSelected = channelSelected;
				this.switchToggle.assetTransferDialog = true;
			}
		},
		toConfirm() {
			this.$refs["channelwallettransfer"].toTransfer();
		},
		openOpen(dnsAdress = "", num = 0) {
			this.getDns();
			this.channelToggle = {
				type: "add",
				channelCloseDialog: true,
				loading: null
			};
			this.$nextTick(() => {
				this.$refs["channelForm"].resetFields();
				this.channelForm.partner = dnsAdress;
				this.channelForm.amount = num;
			});
		},
		openClose(channelSelected) {
			this.channelToggle = {
				type: "del",
				channelCloseDialog: true,
				loading: null
			};
			this.$nextTick(() => {
				this.$refs["channelForm"].resetFields();
				this.channelForm.partner = channelSelected.Address;
			});
		},
		toPeationChannel() {
			this.$refs["channelForm"].validate(valid => {
				if (!valid) return;
				if (this.channelToggle.type === "add") {
					let params = {
						Password: this.channelForm.password,
						Partner: this.channelForm.partner,
						Amount: this.channelForm.amount + ""
					};
					this.toChannelOpen(params);
				} else {
					let params = {
						Password: this.channelForm.password,
						Partner: this.channelForm.partner
					};
					this.toChannelClose(params);
				}
			});
		},
		toChannelOpen(params) {
			this.$axios
				.post(this.$api.channelOPen, params, {
					loading: {
						text: "Processing...",
						target: ".loading-content-2"
					},
					timeout: 60000
				})
				.then(res => {
					if (res.Error === 0) {
						this.$message({
							message: "Open channel successed",
							type: "success"
						});
						this.channelToggle.channelCloseDialog = false;
						this.$store.dispatch("setChannelBalanceTotal");
					} else {
						this.$message.error(
							this.$i18n.error[res.Error]
								? this.$i18n.error[res.Error][this.$language]
								: `error code is ${res.Error}`
						);
					}
				})
				.catch(e => {
					if (!e.message.includes("timeout")) {
						this.$message.error("Network Error. Open Channel Failed!");
					}
				});
		},
		toChannelClose(params) {
			this.$axios
				.post(this.$api.channelClose, params, {
					loading: {
						text: "Processing...",
						target: ".loading-content-2"
					},
					timeout: 60000
				})
				.then(res => {
					if (res.Error === 0) {
						this.channelToggle.channelDialog = false;
						this.$message({
							message: "Close channel successed",
							type: "success"
						});
						this.channelToggle.channelCloseDialog = false;
						this.$store.dispatch("setChannelBalanceTotal");
					} else {
						this.$message.error(
							this.$i18n.error[res.Error]
								? this.$i18n.error[res.Error][this.$language]
								: `error code is ${res.Error}`
						);
					}
				})
				.catch(e => {
					if (!e.message.includes("timeout")) {
						this.$message.error("Network Error. Close Channel Failed!");
					}
				});
		}
	},
	computed: {
		channels: function() {
			// return this.mockChannels;
			return this.$store.state.Home.channels;
		},
		allDns: function() {
			return this.$store.state.Home.dns || [];
		},
		channelsDns: function() {
			if (!this.channels) return [];
			const channelsDns = this.channels.filter(item => {
				if (this.allDns.indexOf(item.HostAddr) >= 0) {
					return true;
				} else {
					false;
				}
				// return item.IsDNS;
			});
			return channelsDns;
		},
		dnsIsSelect: function() {
			const vm = this;
			return function(item) {
				for (let channel of vm.channels) {
					if (channel.Address === item) {
						return true;
					}
				}
				return false;
			};
		},
		isSync: function() {
			return this.$store.state.Home.isSync || false;
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
	box-shadow: 0px 2px 20px 0px rgba(196, 196, 196, 0.24);
	.el-select {
		width: 100%;
	}
	.el-autocomplete {
		width: 100%;
	}
}
.channel-opeation-dialog {
	.form-amount {
		position: relative;
		.form-item-title {
			position: absolute;
			top: -3px;
			right: 0;
			text-align: right;
			font-size: 14px;
			font-weight: 500;
			color: rgba(32, 32, 32, 0.7);
		}
	}
}
.channels {
	height: 100%;
	overflow-y: auto;
	border-bottom-left-radius: 2px;
	border-bottom-right-radius: 2px;
	padding: 0 20px;
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

	.opeation-icon {
		display: inline-block;
		width: 32px;
		height: 32px;
		cursor: pointer;
		border-radius: 50%;
		text-align: center;
		line-height: 32px;

		&:hover {
			background: #dfe2e9;
		}

		&:active {
			opacity: 0.7;
		}
	}
}
.closingWrapper {
	width: 40px;
	color: #49c269;
	overflow: hidden;
	white-space: nowrap;
	display: block;
	animation: closingAnmiation 1.5s linear infinite;
}
@keyframes closingAnmiation {
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
