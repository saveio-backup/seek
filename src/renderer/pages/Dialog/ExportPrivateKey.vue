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
				<h2>Export Private Key(WIF)</h2>
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
						label="Wallet Password"
						prop="password"
					>
						<el-input
							v-model="dialogForm.password"
							placeholder="Input Wallet Password"
							class="grey-theme"
							@keyup.enter.native='exportPrivateKey'
							show-password
							type="password"
						></el-input>
					</el-form-item>
				</el-form>
				<div slot="footer">
					<ripper-button @click="closeDialog">Cancel</ripper-button>
					<ripper-button
						class="primary"
						@click="exportPrivateKey"
					>Export</ripper-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { ipcRenderer, dialog, remote } from "electron";
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
						message: "Please fill password",
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
			this.$refs.dialogForm.validate(valid => {
				if (!valid) return;
				let params = {
					password: this.dialogForm.password
				};
				this.exportPrivateKeyByPassword(params).then(res => {
					if (res.Error === 0) {
						ipcRenderer.send(
							"export-file-dialog",
							res.Result.PrivateKey,
							"PrivateKey"
						);
						ipcRenderer.once("export-finished", () => {
							// ipcRenderer.send("open-info-dialog", { info: "Export Success!" });
							this.$refs.dialogForm.resetFields();
							this.message({ type: "success", info: "Export Success!" });
							this.closeDialog();
							// this.exportPrivateKeyToggle = false;
						});
					} else {
						this.$message.error(
							this.$i18n.error[res.Error]
								? this.$i18n.error[res.Error][this.$language]
								: `error code is ${res.Error}`
						);
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

