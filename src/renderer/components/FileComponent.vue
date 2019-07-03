<template>
	<div class="file-component">
		<div
		 class="top-progress"
		 v-if="transferType != 0"
		>
			<div class="flex1">
				<p
				 class="grey-xs bold"
				 v-if="fileList.length>0"
				>{{transferTypeConfig[transferType]}} Progress</p>
				<p
				 class="grey-xs bold user-no-select"
				 v-else
				>No task</p>
				<el-progress
				 v-if="fileList.length>0"
				 class="progress"
				 :percentage="Math.ceil(totalProgress * 100)"
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
			<p class="theme-font-blue ft14 user-no-select">Finished {{fileList.length}} Files</p>
		</div>
		<div class="file-list">
			<el-table
			 :data="fileList"
			 border
			 empty-text='No Data'
			 height="100%"
			>
				<!-- :data="fileList" -->
				<el-table-column
					min-width="200"
				 label="File Name"
				 prop="File Name"
				></el-table-column>
				<el-table-column
				 label="FileHash"
				 prop="FileHash"
				min-width="200"
				></el-table-column>
				<el-table-column
				 label="FileSize"
				 prop="FileSize"
				 width="100px"
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
						 class="file-progress"
						 :class="{'progressAnimate': scope.row.Status != 4}"
						 v-if="(scope.row.Type === 2) || (scope.row.Type === 1)"
						 :percentage="parseInt((scope.row.Progress||0)*100)"
						></el-progress>
					</template>
				</el-table-column>
				<el-table-column
				 label="Status"
				 prop="Status"
				 width="180px"
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
						<div v-else-if="scope.row.Status === 4">
							<span class="light-error">{{scope.row.ErrMsg}}</span>
							<!-- <span
							 class="light-error"
							 v-if="!scope.row.IsUploadAction"
							>Download Failed</span>
							<span
							 v-else
							 class="light-error"
							>Upload Failed</span> -->
						</div>
						<div v-else-if='scope.row.Progress > 0'>
							<span v-if="scope.row.Type === 1">Uploading</span>
							<span v-if="scope.row.Type === 2">Downloading</span>
						</div>
						<div v-else>
							<span v-if="scope.row.Type === 1">Sharding</span>
							<span v-if="scope.row.Type === 2">Searching</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column align="center" width="100px">
					<template slot-scope="scope">
						<div class="action">
							<!-- <span v-if="scope.row.status === 0">continue</span>
							<span v-if="scope.row.status === 2">pause</span> -->
							<!-- <span v-if="!scope.row.IsUploadAction"><i class="el-icon-tickets"></i></span> -->
							<span
							 title="Open folder"
							 v-if="scope.row.Path"
							><i
								 class="ofont ofont-file"
								 @click="showInFolder(scope.row.Path)"
								></i></span>
							<span
							 title="Decrypt"
							 @click="setFileSelected(scope.row)"
							 v-if="!scope.row.IsUploadAction && scope.row.Path"
							><i class="el-icon-lock"></i> </span>
							<!-- <span
							 title="Delete File"
							 v-if="scope.row.FileHash"
							><i
								 class="el-icon-delete-solid"
								 @click="deleteFile(scope.row)"
								></i> </span> -->
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<el-dialog
		 width='600px'
		 center
		 :close-on-click-modal='false'
		 :visible.sync="switchToggle.newTaskDialog"
		>
			<div slot="title">
				<h2>New Download</h2>
				<div class="dialog-title-border"></div>
			</div>
			<download-dialog v-if="switchToggle.newTaskDialog" v-on:closedialog='hideTaskDialog'></download-dialog>
		</el-dialog>
		<el-dialog
		 width="600px"
		 :close-on-click-modal='false'
		 :visible.sync="switchToggle.decryptDialog"
		 title="Input Password"
		>
			<div class="loading-content">
				<el-input
				 v-model="fileSelected.Password"
				 class="mt20"
				></el-input>
				<div slot="footer">
					<el-button
					 class="done mt20"
					 type="primary"
					 @click="toDecrypt"
					>Confirm</el-button>
				</div>
			</div>
		</el-dialog>
		<el-dialog
		 title="Notice"
		 :close-on-click-modal='false'
		 :visible.sync="switchToggle.deleteDialog"
		 center
		>
			<p>Are your Sure to Delete this File?</p>
			<p>{{executedFile.FileName}}</p>
			<div slot="footer">
				<el-button @click="switchToggle.deleteDialog = false">Cancel</el-button>
				<el-button
				 type="danger"
				 @click="toDeleteFile(executedFile.FileHash)"
				>Delete</el-button>
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
				deleteDialog: false,
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
			executedFile: {}, // a file be opera
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
		deleteFile(file) {
			this.executedFile = file;
			this.switchToggle.deleteDialog = true;
		},
		toDeleteFile(hash) {
			this.switchToggle.deleteDialog = false;
			this.$axios.post(this.$api.delete, { Hash: hash }).then(res => {
				if (res.data.Error === 0) {
					this.$message({
						message: "Delete Completed",
						type: "Success"
					});
				}
			});
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
				})
				.finally(() => {
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
$light-grey: #f9f9fb;
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
				background: #f9f9fb;
				color: #1b1e2f;
				// font-weight: bold;
			}
		}
		.file-progress {
			&.progressAnimate {
				.el-progress-bar__outer {
					height: 16px;
					background-size: 12px 12px;
					background-image: linear-gradient(
						45deg,
						rgba(255, 255, 255, 0.4) 25%,
						transparent 25%,
						transparent 50%,
						rgba(255, 255, 255, 0.4) 50%,
						rgba(255, 255, 255, 0.4) 75%,
						transparent 75%,
						transparent
					);
					animation: progress-bar-stripes 1s linear infinite;
				}
			}
			@keyframes progress-bar-stripes {
				from {
					background-position: -1rem 0;
				}
				to {
					background-position: 0 0;
				}
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
