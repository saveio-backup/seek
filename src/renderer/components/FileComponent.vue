<template>
	<div class="file-component">
		<div
		 class="top-progress"
		 v-if="transferType != 0"
		>
			<div class="flex1">
				<p
				 class="grey-xs bold"
				 v-if="totalProgress"
				>{{transferTypeConfig[transferType]}} progress</p>
				<p
				 class="grey-xs bold"
				 v-else
				>No task</p>
				<el-progress
				 v-if="totalProgress"
				 class="progress"
				 :percentage="parseFloat(totalProgress * 100).toFixed(0)"
				></el-progress>
			</div>
			<el-button
			 v-if="transferType == 2"
			 @click="switchToggle.newTaskDialog=true"
			>New Task</el-button>
		</div>
		<div
		 v-else
		 class="top-progress"
		>
			<p class="theme-font-blue ft14">Finished {{fileList.length}} Files</p>
		</div>
		<div class="file-list">
			<el-table
			 :data="fileList"
			 empty-text='No Data'
			 height="100%"
			>
				<el-table-column
				 width="300"
				 label="FileName"
				 prop="FileName"
				></el-table-column>
				<el-table-column
				 label="FileHash"
				 prop="FileHash"
				></el-table-column>
				<el-table-column
				 label="FileSize"
				 prop="FileSize"
				 width='100px'
				>
					<template slot-scope="scope">
						<!-- api return 'KB' unit -->
						<span>
							{{util.bytesToSize(scope.row.FileSize * 1024)}}
						</span>
					</template>
				</el-table-column>
				<el-table-column
				 label="Progress"
				 v-if="transferType !== 0"
				>
					<template slot-scope="scope">
						<el-progress
						 v-if="scope.row.Type === 1"
						 :percentage="parseFloat((scope.row.Progress||0)*100).toFixed(2)"
						></el-progress>
						<el-progress
						 v-if="scope.row.Type === 2"
						 :percentage="parseFloat((scope.row.Progress||0)* 100).toFixed(2)"
						></el-progress>
					</template>
				</el-table-column>
				<el-table-column
				 label="Status"
				 prop="Status"
				>
					<template slot-scope="scope">
						<div v-if="scope.row.Status === 3">
							<span
							 class="light-blue"
							 v-if="!scope.row.IsUploadAction"
							>Download Completed</span>
							<span
							 v-else
							 class="light-blue"
							>Upload Completed</span>
						</div>
						<div v-if="scope.row.Status === 4">
							<span
							 class="light-error"
							 v-if="!scope.row.IsUploadAction"
							>Download Failed</span>
							<span
							 v-else
							 class="light-error"
							>Upload Failed</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column align="right">
					<template slot-scope="scope">
						<div class="action">
							<!-- <span v-if="scope.row.status === 0">continue</span>
							<span v-if="scope.row.status === 2">pause</span> -->
							<!-- <span v-if="!scope.row.IsUploadAction"><i class="el-icon-tickets"></i></span> -->
							<span
							 title="Open folder"
							 v-if="!scope.row.IsUploadAction"
							><i
								 class="ofont ofont-file"
								 @click="showInFolder(scope.row.Path)"
								></i></span>
							<span
							 title="Decrypt"
							 @click="setFileSelected(scope.row)"
							 v-if="scope.row.IsUploadAction"
							><i class="el-icon-lock"></i> </span>
							<!-- <i class="el-icon-delete"></i> -->
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<el-dialog
		 width='600px'
		 center
		 :visible.sync="switchToggle.newTaskDialog"
		>
			<div slot="title">
				<h2>New Download</h2>
				<div class="dialog-title-border"></div>
			</div>
			<download-dialog v-on:closedialog='hideTaskDialog'></download-dialog>
		</el-dialog>
		<el-dialog
		 width="600px"
		 :visible.sync="switchToggle.decryptDialog"
		 title="Input Password"
		>
			<div class="loading-content">
				<el-input v-model="fileSelected.Password" class="mt20"></el-input>
				<div slot="footer">
					<el-button
					 class="done mt20"
					 type="primary"
					 @click="toDecrypt"
					>Confirm</el-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import util from "../assets/config/util";
import downloadDialog from "./DownloadDialog.vue";
import { shell } from "electron";
export default {
	props: {
		transferType: {
			required: true,
			type: Number // 0 upload 1 download
		}
	},
	components: {
		downloadDialog
	},
	data() {
		return {
			util,
			switchToggle: {
				loading: null,
				newTaskDialog: false,
				transferItemDialog: false,
				decryptDialog: false
			},
			TransferConfig: [
				"completeTransferList",
				"uploadTransferList",
				"downloadTransferList"
			],
			transferItem: {},
			transferTypeConfig: ["Completed", "Upload", "Download"],
			fileSelected: {
				Path: "",
				Password: ""
			},
			mockFileList: [
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYwL",
					FileName: "hahat.txt",
					Status: 2,
					IsUploadAction: false,
					Type: 2,
					Current: 500,
					FileSize: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYwL",
					FileName: "hahat.txt",
					Current: 500,
					FileSize: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYwL",
					FileName: "hahat.txt",
					Current: 500,
					FileSize: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYwL",
					FileName: "hahat.txt",
					Current: 500,
					FileSize: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYwL",
					FileName: "hahat.txt",
					Current: 500,
					FileSize: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYwL",
					FileName: "hahat.txt",
					Current: 500,
					FileSize: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYwL",
					FileName: "hahat.txt",
					Current: 500,
					FileSize: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYwL",
					FileName: "hahat.txt",
					Current: 500,
					FileSize: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYwL",
					FileName: "hahat.txt",
					Current: 500,
					FileSize: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYwL",
					FileName: "hahat.txt",
					Current: 500,
					FileSize: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYwL",
					FileName: "hahat.txt",
					Current: 500,
					FileSize: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				}
			]
		};
	},
	computed: {
		totalProgress: function() {
			let progress = 0;
			this.fileList.map(file => {
				progress += file.Progress;
			});
			return parseFloat((progress / this.fileList.length).toFixed(2)) || 0;
		},
		fileList: function() {
			return this.$store.state.Transfer[this.TransferConfig[this.transferType]];
		}
	},
	methods: {
		hideTaskDialog() {
			this.switchToggle.newTaskDialog = false;
		},
		showInFolder(path) {
			shell.showItemInFolder(path);
		},
		setFileSelected(file) {
			this.fileSelected.Path = file.Path;
			this.switchToggle.decryptDialog = true;
		},
		toDecrypt() {
			if (this.switchToggle.loading) return;
			this.switchToggle.loading = this.$loading({
				lock: true,
				text: "Processing..",
				target: ".loading-content"
			});
			this.$axios
				.post(this.$api.decrypt, this.fileSelected)
				.then(res => {
					if (res.data.Error === 0) {
						this.$message({
							message: "Decryption successed",
							type: "success"
						});
						this.fileList.Password = "";
						this.fileList.Path = "";
						this.switchToggle.decryptDialog = false;
					} else if (res.data.Erro === 50015) {
						this.$message({
							message: "Wrong Password",
							type: "error"
						});
					} else {
						this.$message.error("Decription failed.");
					}
				})
				.catch(err => {
					console.log(err);
					this.$message.error("Wrong");
				}).finally(()=>{
					this.switchToggle.loading.close();
					this.switchToggle.loading = null;
				});
		}
	}
};
</script>
<style lang="scss">
$theme-font-blue: #040f39;
$brand-blue: #409eff;
$sucess: #67c23a;
$danger: #f56c6c;
$light-grey: #f2f2f2;
.file-component {
	height: 100%;
	display: flex;
	flex-direction: column;
	.el-progress__text {
		display: inline-block !important;
	}
	.top-progress {
		display: flex;
		height: 80px;
		padding: 0 20px;
		background: $light-grey;
		align-items: center;
		.progress {
			flex: 1;
		}
	}
	.file-list {
		height: calc(100% - 80px);
		.el-table {
			color: $theme-font-blue;
			font-weight: bold;
			thead th {
				background: #e7e7eb;
				color: #1b1e2f;
				font-weight: bold;
			}
		}
	}
	.action > span {
		margin-right: 5px;
		font-size: 18px;
		cursor: pointer;
	}
}
</style>
