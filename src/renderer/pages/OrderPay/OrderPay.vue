<template>
	<div id="orderpay">
		<div class="orderpay-content">
			<div
				class="trading-status"
				v-if="tradingStatus === 0"
			>
				<div class="ft24 orderpay-title">Confirm Transaction</div>
				<div class="transfer-user">
					<div class="transfer-avatar">
						<p
							class="name-wrapper"
							v-if="contractData.Label"
						>
							{{contractData.Label[0].toUpperCase()}}
						</p>
						<p class="name-text">
							{{contractData.Label}}
						</p>
					</div>
					<div class="transfer-amount">
						<p class="amount-text">{{round( (contractData.GasPrice*contractData.GasLimit) /powBase,9)}} ONI</p>
						<i class="transfer-arrow ofont ofont-transfer_right"></i>
					</div>
					<div class="transfer-avatar">
						<p class="name-wrapper">C</p>
						<p class="name-text">Contract</p>
					</div>
				</div>
				<div class="contract-text">
					CONTRACT INTERACTION
				</div>
			</div>
			<div
				class="trading-status"
				v-if="tradingStatus === 1"
			>
				<div class="ft24 orderpay-title">Transaction Successful</div>
				<div class="transfer-success">
					<i class="ofont ofont-success"></i>
					<p class="mt10">{{round( (contractData.GasPrice*contractData.GasLimit) /powBase,9)}} ONI</p>
				</div>
			</div>
			<div class="transfer-meta">
				<div class="transfer-meta-choose">
					<p
						class="choose-option"
						@click="metaType = 'Details'"
						:class="{selected:metaType === 'Details'}"
					>Details</p>
					<p
						class="choose-option"
						@click="metaType = 'Data'"
						:class="{selected:metaType === 'Data'}"
					>Data</p>
				</div>
				<div
					class="transfer-meta-box"
					v-show="metaType === 'Details'"
				>
					<div class="box-item">
						<p class="item-title">From</p>
						<p class="item-name">{{contractData.Label}}</p>
						<p class="item-addr">{{contractData.Address}}</p>
					</div>
					<div class="box-item">
						<p class="item-title">To</p>
						<p class="item-name">Contract</p>
						<p class="item-addr">{{contractData.Contract||'No Address'}}</p>
					</div>
					<div class="box-item flex between">
						<p class="item-title">Gas Fee</p>
						<p></p>
						<p class="item-addr">{{round( (contractData.GasPrice*contractData.GasLimit) /powBase,9)}} ONI</p>
					</div>
				</div>
				<div
					class="transfer-meta-box"
					v-show="metaType === 'Data'"
				>
					<div class="box-item flex">
						<p class="item-title mr30">Contract</p>
						<p class="item-addr flex1">{{contractData.Contract}}</p>
					</div>
					<div class="box-item flex">
						<p class="item-title mr30">Method</p>
						<p class="item-addr flex1">{{contractData.Method}}</p>
					</div>
				</div>
			</div>
			<div class="flex price-div transfer-meta-price">
				<div class="price-div-bg user-no-select">ON</div>
				<p class="price-gas-fee">Total
				</p>
				<p
					class="price-gas-fee"
					v-if="contractData.Method==='FilmPublish'"
				>{{round((contractData.GasPrice*contractData.GasLimit) /powBase,9)}} ONI (Amount + Gas)</p>
			</div>
			<!-- <div
				class="text-center whitelist-checkbox"
				style="margin: 0 auto 20px;"
			>
				<el-checkbox v-model="whiteselected">Whitelist this action</el-checkbox>
			</div> -->
			<div
				class="flex jc-center submit-foot"
				v-if="tradingStatus === 0"
			>
				<el-button
					type="primary"
					class="primary"
					@click="OpenPasswordDialog"
				>Confirm</el-button>
			</div>
			<div
				class="flex jc-center submit-foot"
				v-if="tradingStatus === 1"
			>
				<el-button
					type="primary"
					class="primary"
					@click="rebackPage"
				>Reback</el-button>
			</div>
		</div>
		<el-dialog
			width='550px'
			:close-on-click-modal='false'
			:visible.sync="passwordForm.show"
			center
		>
			<div slot="title">
				<h2>Confirm</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content upload-loading">
				<el-form
					ref="passwordForm"
					:model="passwordForm"
					:rules="uploadRules"
					@submit.native.prevent
				>
					<el-form-item
						label="Wallet Password:"
						prop="Password"
					>
						<el-input
							type="password"
							class="grey-theme"
							placeholder="Please Input Wallet Password"
							show-password
							@keyup.native.enter='toUploadFile'
							v-model="passwordForm.Password"
						></el-input>
					</el-form-item>
					<!-- <p class="mb20 tr">Confirm Payment: {{uploadPrice}} ONI</p> -->
				</el-form>
				<div slot="footer">
					<el-button @click="passwordForm.show = false">Cancel</el-button>
					<el-button
						type="primary"
						class="primary"
						@click="toUploadFile"
					>Confirm</el-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { ipcRenderer, remote } from "electron";
import { parse } from "querystring";
import { round } from "mathjs";
export default {
	mounted() {
		Seek.getAccount().then(res => {
			this.contractData.Address = res.Result.Address;
			this.contractData.Label = res.Result.Label;
		});
	},
	data() {
		return {
			round,
			tradingStatus: 0, // 0 trading 1 success
			powBase: 1000000000,
			whiteselected: false,
			contractData: {
				Label: "",
				Address: "",
				GasPrice: 500,
				GasLimit: 20000
			},
			switchToggle: {},
			uploadRules: {
				Password: [
					{ required: true, message: "Please input  password", trigger: "blur" }
				]
			},
			passwordForm: {
				Password: "",
				show: false
			},
			metaType: "Details"
		};
	},
	methods: {
		OpenPasswordDialog() {
			this.passwordForm.show = true;
			this.$nextTick(() => {
				this.$refs["passwordForm"].resetFields();
			});
		},
		toUploadFile() {
			this.$refs["passwordForm"].validate(valid => {
				// checkout
				if (!valid) return;
				this.switchToggle.upload = false; // set toggle
				this.switchToggle.loading = this.$loading({
					text: "In transaction..",
					target: ".loading-content.upload-loading"
				});
				const data = {
					Version: "00",
					Contract: this.contractData.Contract,
					Method: this.contractData.Method,
					Params: this.contractData.Params,
					Password: this.passwordForm.Password,
					GasPrice: this.contractData.GasPrice,
					GasLimit: this.contractData.GasLimit
				};
				Object.assign(data, this.contractData);
				this.$axios
					.post(this.$api.invokeContract, data)
					.then(res => {
						console.log(res);
						if (res.Error === 0) {
							this.switchToggle.loading && this.switchToggle.loading.close();
							this.passwordForm.show = false;
							this.tradingStatus = 1;
							ipcRenderer.sendTo(
								parseInt(this.contractData.viewid),
								this.contractData.channel,
								res.Result.Tx
							);
						} else {
							this.switchToggle.loading && this.switchToggle.loading.close();
							this.$message.error(
								this.$i18n.error[res.Error]
									? this.$i18n.error[res.Error][this.$language]
									: `error code is ${res.Error}`
							);
							return;
						}
					})
					.catch(e => {
						this.switchToggle.loading && this.switchToggle.loading.close();
					});
			});
		},
		rebackPage() {
			this.contractData.viewid &&
				this.setActiveByContentsId(parseInt(this.contractData.viewid));
		},
		setActiveByContentsId(id) {
			let views = remote.getCurrentWindow().views;
			let activeView = views.find(view => view.isActive);
			let hasView = views.some(viewItem => {
				return viewItem.webContents.id === id;
			});
			hasView &&
				views.map(viewItem => {
					if (viewItem.webContents.id === id) {
						viewItem.isActive = true;
						viewItem.resize();
					} else if (viewItem.isActive === true) {
						viewItem.isActive = false;
					}
				});
			this.$forceUpdate();
		}
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			const data =JSON.parse(to.query.data);
			Object.assign(vm.contractData, data);
			to.query.channel && (vm.contractData.channel = to.query.channel);
			to.query.viewid && (vm.contractData.viewid = to.query.viewid);
		});
	}
};
</script>
<style lang="scss" scoped>
#orderpay {
	background: #f9f9fb;
	.orderpay-content {
		width: 60%;
		padding-top: 60px;
		margin: 0px auto 0px;
		.orderpay-title {
			text-align: center;
			padding-bottom: 30px;
			border-bottom: solid 1px rgba(125, 125, 125, 0.1);
		}
		.transfer-success {
			display: flex;
			flex-direction: column;
			align-items: center;
			.ofont-success {
				font-size: 100px;
				color: #2f8ff0;
			}
		}
		.transfer-user {
			display: flex;
			max-width: 600px;
			margin: 20px auto 0;
			justify-content: space-between;
			.name-wrapper {
				width: 80px;
				height: 80px;
				line-height: 80px;
				font-size: 52px;
				background: #8b919e;
				color: #fff;
				border-radius: 50%;
				text-align: center;
			}
			.name-text {
				margin-top: 5px;
				color: rgba(35, 35, 35, 0.8);
			}
			.transfer-avatar {
				display: flex;
				flex-direction: column;
				align-items: center;
			}
		}
		.transfer-amount {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
			.amount-text {
				margin-top: 30px;
			}
		}
		.contract-text {
			max-width: 600px;
			margin: 25px auto 0;
			background: rgba(237, 239, 244, 1);
			color: rgba(32, 32, 32, 0.4);
			text-align: center;
			border-radius: 13px;
			padding: 5px 0;
			font-size: 15px;
		}
		.transfer-meta-choose {
			margin: 50px auto 20px;
			display: flex;
			justify-content: center;
			color: rgba(32, 32, 32, 0.4);
			.choose-option {
				cursor: pointer;
				font-size: 14px;
				padding-bottom: 8px;
				margin: 0 25px;
			}
			.selected {
				color: #2f8ff0;
				border-bottom: solid 2px #2f8ff0;
			}
		}
		.transfer-meta-box {
			background: rgba(237, 239, 244, 1);
			font-size: 16px;
			padding: 20px 0;
			.box-item {
				width: 600px;
				margin: 20px auto;
				display: flex;
				.item-title {
					width: 100px;
					text-align: right;
				}
				.item-name {
					margin: 0 20px;
					width: 150px;
				}
				.item-addr {
					font-size: 14px;
					color: rgba(32, 32, 32, 0.7);
					text-align: left;
					width: 305px;
				}
			}
		}
		.transfer-meta-price {
			max-width: 600px;
			margin: 30px auto;
		}
		.whitelist-checkbox {
			.el-checkbox {
				color: rgba(32, 32, 32, 0.4);
			}
		}
	}
}
</style>