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
				>
					<el-form-item
					 class="theme-font-blue-bold"
					 label="Password"
					 prop="password"
					>
						<el-input
						 v-model="dialogForm.password"
						 placeholder="Input password"
						 @keyup.enter.native='exportPrivateKey'
						 type="password"
						></el-input>
					</el-form-item>
				</el-form>
			</div>
			<div slot="footer">
				<el-button @click="closeDialog">Cancel</el-button>
				<el-button
				 type="primary"
         class="primary"
				 @click="exportPrivateKey"
				>Export</el-button>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { ipcRenderer, dialog } from "electron";
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
			}
		};
	},
	watch: {
	},
	methods: {
		closeDialog() {
			this.$emit("closeDialog", { timeout: 0 });
		},
		exportPrivateKey() {
			this.$refs.dialogForm.validate(valid => {
				if (!valid) return;
				let params = {
					password: this.dialogForm.password
				};
				this.exportPrivateKeyByPassword(params).then(res => {
					if (res.data.Desc === "SUCCESS" && res.data.Error === 0) {
						ipcRenderer.send(
							"export-file-dialog",
							res.data.Result.PrivateKey,
							"PrivateKey"
						);
					} else {
						this.$message.error(res.data.Desc);
						return;
					}
					ipcRenderer.once("export-finished", () => {
            // ipcRenderer.send("open-info-dialog", { info: "Export Success!" });
            this.$refs.dialogForm.resetFields();
            this.closeDialog();
						// this.exportPrivateKeyToggle = false;
					});
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

