<template>
	<div class="file-component">
		<div
		 class="top-progress"
		 v-if="transferType != 0"
		>
			<div class="flex1">
				<p class="grey-xs bold" v-if="totalProgress">{{transferTypeConfig[transferType]}} progress</p>
				<p class="grey-xs bold" v-else>No task</p>
				<el-progress
				v-if="totalProgress"
				 class="progress"
				 :percentage="totalProgress * 100"
				></el-progress>
			</div>

			<!-- <el-button>Pause All</el-button>
			<el-button>Start all</el-button>
			<el-button>Cancel All</el-button> -->
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
				<!-- :data="fileList" -->
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
						 :percentage="scope.row.Progress*100"
						></el-progress>
						<el-progress
						 v-if="scope.row.Type === 2"
						 :percentage="scope.row.Progress*100"
						></el-progress>
					</template>
				</el-table-column>
				<el-table-column
				 label="Status"
				 prop="Status"
				></el-table-column>
				<el-table-column label="opera">
					<template slot-scope="scope">
						<div>
							<span v-if="scope.row.status === 0">continue</span>
							<span v-if="scope.row.status === 2">pause</span>
							<i class="el-icon-delete"></i>
							<i class="el-icon-tickets"></i>
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
	</div>
</template>
<script>
import util from "../assets/config/util";
import downloadDialog from "./DownloadDialog.vue";
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
				newTaskDialog: false,
				transferItemDialog: false
			},
			TransferConfig: [
				"completeTransferList",
				"uploadTransferList",
				"downloadTransferList"
			],
			transferItem: {},
			transferTypeConfig: ["Completed", "Upload", "Download"],
			mockFileList: [
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
}
</style>
