<template>
	<div class="exportPrivateKey">
		<el-dialog
			width='550px'
			:before-close="closeDialog"
			:close-on-click-modal='false'
			:visible.sync="exportPrivateKeyToggle"
			center
		>
			<div slot="title">
				<h2>{{$t('dialog.exportPrivateKey')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content">
				<el-form
					ref="dialogForm"
					:model="dialogForm"
					:rules="dialogRules"
					@submit.native.prevent
				>
					<el-form-item
						class="theme-font-blue-bold"
						:label="$t('public.walletPassword')"
						prop="password"
					>
						<el-input
							v-model="dialogForm.password"
							:placeholder="$t('public.pleaseInputWalletPassword')"
							class="grey-theme"
							@keyup.enter.native='exportPrivateKey'
							show-password
							type="password"
						></el-input>
					</el-form-item>
				</el-form>
				<div slot="footer">
					<ripper-button @click="closeDialog">{{$t('public.cancel')}}</ripper-button>
					<ripper-button
						class="primary ml10"
						@click="exportPrivateKey"
					>{{$t('dialog.export')}}</ripper-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { ipcRenderer, dialog } from "electron";
const remote = require('@electron/remote')
import crypto from "crypto";
export default {
	name: "ExportPrivateKey",
	data() {
		return {
			exportPrivateKeyToggle: false,
			dialogForm: {
				password: ""
			},
			dialogRules: {
				password: [
					{
						required: true,
						message: this.$t('public.pleaseFillPassword'),
						trigger: "blur"
					}
				]
			},
			win: remote.getCurrentWindow()
		};
	},
	methods: {
		closeDialog() {
			this.$emit("closeDialog", { timeout: 0 });
		},
		message({ info, type }) {
			let views = this.win.views;
			let activeView = views.find(view => view.isActive);
			const webContentsId = activeView.browserView.webContents.id;
			ipcRenderer.sendTo(webContentsId, "current-active-show-message", {
				info: info,
				type: type
			});
		},
		exportPrivateKey() {
			const vm = this;
			this.$refs.dialogForm.validate(valid => {
				if (!valid) return;
				let params = {
					password: crypto.createHash('sha256').update(this.dialogForm.password).digest('hex')
				};
				this.exportPrivateKeyByPassword(params).then(res => {
					if (res.Error === 0) {
						ipcRenderer.send(
							"export-file-dialog",
							res.Result.PrivateKey,
							"PrivateKey"
						);
						ipcRenderer.once("export-finished", () => {
							this.$refs.dialogForm.resetFields();
							this.message({ type: "success", info: vm.$t('dialog.exportSuccess')});
							this.closeDialog();
						});
					} else {
						this.$message.error(this.$t(`error[${res.Error}]`));
					}
				});
			});
		},
		exportPrivateKeyByPassword(params) {
			return this.$axios.get(
				this.$api.exportPrivateKey + "/" + params.password
			);
		}
	},
	watch: {
		lang() {
			this.dialogRules = {
				password: [
					{
						required: true,
						message: this.$t('public.pleaseFillPassword'),
						trigger: "blur"
					}
				]
			}
		}
	},
	computed: {
		lang() {
			return this.$i18n.locale;
		}
	},
	mounted() {
		this.exportPrivateKeyToggle = true;
	}
};
</script>

<style scoped>
.exportPrivateKey {
	width: 100%;
	height: 100%;
}
</style>

