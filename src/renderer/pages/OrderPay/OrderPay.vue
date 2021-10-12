<template>
	<div id="orderpay" class="ft16">
		<div class="orderpay-content">
			<div
				class="trading-status"
				v-if="tradingStatus === 0"
			>
				<div class="ft24 orderpay-title">{{$t('orderpay.confirmTransaction')}}</div>
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
						<p class="name-text">{{$t('orderpay.contract')}}</p>
					</div>
				</div>
				<div class="contract-text">
					{{$t('orderpay.CONTRACTINTERACTION')}}
				</div>
			</div>
			<div
				class="trading-status"
				v-if="tradingStatus === 1"
			>
				<div class="ft24 orderpay-title">{{$t('orderpay.transactionSuccessful')}}</div>
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
					>{{$t('orderpay.details')}}</p>
					<p
						class="choose-option"
						@click="metaType = 'Data'"
						:class="{selected:metaType === 'Data'}"
					>{{$t('orderpay.data')}}</p>
				</div>
				<div
					class="transfer-meta-box"
					v-show="metaType === 'Details'"
				>
					<div class="box-item">
						<p class="item-title">{{$t('orderpay.from')}}</p>
						<p class="item-name">{{contractData.Label}}</p>
						<p class="item-addr">{{contractData.Address}}</p>
					</div>
					<div class="box-item">
						<p class="item-title">{{$t('orderpay.to')}}</p>
						<p class="item-name">{{$t('orderpay.contract')}}</p>
						<p class="item-addr">{{contractData.Contract||$t('orderpay.noAddress')}}</p>
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
						<p class="item-title mr30">{{$t('orderpay.contract')}}</p>
						<p class="item-addr flex1">{{contractData.Contract}}</p>
					</div>
					<div class="box-item flex">
						<p class="item-title mr30">{{$t('orderpay.method')}}</p>
						<p class="item-addr flex1">{{contractData.Method}}</p>
					</div>
				</div>
			</div>
			<div class="flex price-div transfer-meta-price">
				<div class="price-div-bg user-no-select">ON</div>
				<p class="price-gas-fee">{{$t('orderpay.total')}}
				{{round((contractData.GasPrice * contractData.GasLimit + (contractData.TransferPrice || 0)) / powBase, 9)}} ONI	
				</p>
				<p
					class="price-gas-fee"
					v-if="contractData.Method==='FilmPublish'"
				>{{round((contractData.GasPrice*contractData.GasLimit) / powBase,9)}} ONI ({{$t('orderpay.amountGas')}})</p>
			</div>
			<div
				class="flex jc-center submit-foot"
				v-if="tradingStatus === 0"
			>
				<el-button
					type="primary"
					class="primary"
					@click="OpenPasswordDialog"
				>{{$t('public.confirm')}}</el-button>
			</div>
			<div
				class="flex jc-center submit-foot"
				v-if="tradingStatus === 1"
			>
				<el-button
					type="primary"
					class="primary"
					@click="goBackPage"
				>{{$t('orderpay.reback')}}</el-button>
			</div>
		</div>
		<el-dialog
			width='550px'
			:close-on-click-modal='false'
			:visible.sync="passwordForm.show"
			center
		>
			<div slot="title">
				<h2>{{$t('public.confirm')}}</h2>
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
						:label="$t('public.walletPassword')+':'"
						prop="Password"
					>
						<el-input
							type="password"
							class="grey-theme"
							:placeholder="$t('public.pleaseInputWalletPassword')"
							show-password
							@keyup.native.enter='toUploadFile'
							v-model="passwordForm.Password"
						></el-input>
					</el-form-item>
				</el-form>
				<div slot="footer">
					<el-button @click="passwordForm.show = false">{{$t('public.cancel')}}</el-button>
					<el-button
						type="primary"
						class="primary ml10"
						@click="toUploadFile"
					>{{$t('public.confirm')}}</el-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { ipcRenderer } from "electron";
const remote = require('@electron/remote')
import { parse } from "querystring";
import { round } from "mathjs";
import crypto from 'crypto'
export default {
	mounted() {
		const vm = this;
		ipcRenderer.on("dialog-load", (e) => {
			vm.attach();
		});
		vm.attach();
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
					{ required: true, message: this.$t('public.pleaseFillPassword'), trigger: "blur" }
				]
			},
			passwordForm: {
				Password: "",
				show: false
			},
			metaType: "Details"
		};
	},
	watch: {
		lang() {
			this.uploadRules = {
				Password: [
					{ required: true, message: this.$t('public.pleaseFillPassword'), trigger: "blur" }
				]
			}
		}
	},
	computed: {
		lang() {
			return this.$i18n.locale;
		}
	},
	methods: {
		attach() {
			ipcRenderer.send("run-dialog-event", {
				name: "attach",
				data: {
					names: ['progress', 'account'],
					id: remote.getCurrentWebContents().id
				}
			});
		},
		OpenPasswordDialog() {
			this.passwordForm.show = true;
			this.$nextTick(() => {
				this.$refs["passwordForm"].resetFields();
			});
		},
		toUploadFile() {
			const vm = this;
			this.$refs["passwordForm"].validate(valid => {
				// checkout
				if (!valid) return;
				this.switchToggle.upload = false; // set toggle
				this.switchToggle.loading = this.$loading({
					text: vm.$t('orderpay.inTransaction'),
					target: ".loading-content.upload-loading"
				});
				const data = {
					Version: "00",
					Contract: this.contractData.Contract,
					Method: this.contractData.Method,
					Params: this.contractData.Params,
					Password: crypto.createHash('sha256').update(vm.passwordForm.Password).digest('hex'),
					GasPrice: this.contractData.GasPrice,
					GasLimit: this.contractData.GasLimit
				};
				Object.assign(data, this.contractData);
				this.$axios
					.post(this.$api.invokeContract, data)
					.then(res => {
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
							this.$message.error(this.$t(`error[${res.Error}]`));
							return;
						}
					})
					.catch(e => {
						if (e.message.includes("timeout")) {
							this.$message.error(this.$t('error.requestTimeout'));
						}
						this.switchToggle.loading && this.switchToggle.loading.close();
					});
			});
		},
		goBackPage() {
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
				font-size: 10rem;
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
				font-size: 5.2rem;
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
			font-size: 1.5rem;
		}
		.transfer-meta-choose {
			margin: 50px auto 20px;
			display: flex;
			justify-content: center;
			color: rgba(32, 32, 32, 0.4);
			.choose-option {
				cursor: pointer;
				font-size: 1.4rem;
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
			font-size: 1.6rem;
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
					font-size: 1.4rem;
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