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
          class-name="rowName"
        >
          <template slot-scope="scope">
						<div class="flex between">
							<span>{{scope.row.FileName}}</span>
							<!-- <div class="opera"> -->
								<!-- <i class="ofont ofont-zhongxinshangchuan" title="upload again" v-show="scope.row.Status === 4"  @click="uploadAgain(scope.row)"></i> -->
								<!-- <i class="ofont ofont-jixu" title="continue to upload" v-show="scope.row.Status === 0" @click="uploadcontinue(scope.row)"></i> -->
								<!-- <i class="ofont ofont-zanting" title="pause to upload" v-show="scope.row.Status === 1 || scope.row.Status === 2" @click="uploadPause(scope.row)"></i> -->
								<!-- <i v-show="scope.row.Nodes && scope.row.Nodes.length > 0" class="ofont ofont-xiangqingchakan" title="look process detail" @click="openDetailDialog(scope.row)"></i> -->
							<!-- </div> -->
						</div>
					</template>
				</el-table-column>
				<el-table-column
					label="Model"
					min-width="100"
					v-if="transferType !== 2"
				>
					<template slot-scope="scope">
						<div>
							{{scope.row.StoreType === 1 ? 'Advance' : scope.row.StoreType === 0 ? 'Normal' : ''}}
						</div>
					</template>
				</el-table-column>
				<el-table-column
				 label="File Hash"
				 prop="FileHash"
					min-width="150"
				></el-table-column>
				<el-table-column
				 label="File Size"
				 prop="FileSize"
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
				 min-width="100"
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
				 min-width="120px"
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
        <el-table-column label="Date" v-if="transferType === 0" min-width="100">
          <template slot-scope="scope">
            <span class="light-blue">
              {{$dateFormat.formatTimeByTimestamp(scope.row.UpdatedAt*1000)}}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          min-width="100px"
        >
          <template slot-scope="scope">
            <div class="action ">
              <!-- <span v-if="scope.row.status === 0">continue</span>
							<span v-if="scope.row.status === 2">pause</span> -->
              <!-- <span v-if="!scope.row.IsUploadAction"><i class="el-icon-tickets"></i></span> -->
              <span
                title="Open folder"
                v-if="scope.row.Path"
								@click="showInFolder(scope.row.Path)"
							><i class="ofont ofont-file"></i></span>
              <span
                title="Decrypt"
                @click="setFileSelected(scope.row)"
                v-if="!scope.row.IsUploadAction && scope.row.Path"
              ><i class="el-icon-lock"></i></span>
							<span :title="scope.row.IsUploadAction ? 'upload again':'download again'"
								v-show="scope.row.Status === 4"
								@click="uploadOrDownloadAgain(scope.row)"
							><i class="ofont ofont-zhongxinshangchuan"></i></span>
							<span
								:title="scope.row.IsUploadAction ? 'continue to upload':'continue to download'"
								v-show="scope.row.Status === 0" 
								@click="uploadOrDownloadContinue(scope.row)"
							><i class="ofont ofont-jixu"></i></span>
							<span
								:title="scope.row.IsUploadAction ? 'pause to upload':'pause to download'"
								v-show="scope.row.Status === 1 || scope.row.Status === 2" 
								@click="uploadOrDownloadPause(scope.row)"
							><i class="ofont ofont-zanting"></i></span>
							<span
								title="look process detail" @click="openDetailDialog(scope.row)"
								v-show="scope.row.Nodes && scope.row.Nodes.length > 0 && scope.row.Status !== 3 && scope.row.IsUploadAction"
							><i class="ofont ofont-xiangqingchakan"></i></span>
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
      <download-dialog
        v-if="switchToggle.newTaskDialog"
        v-on:closedialog='hideTaskDialog'
      ></download-dialog>
    </el-dialog>
    <el-dialog
      width="600px"
      :close-on-click-modal='false'
      :visible.sync="switchToggle.decryptDialog"
			center
    >
			<div slot="title">
        <h2>Confirm</h2>
        <div class="dialog-title-border"></div>
      </div>
      <div class="loading-content">
				<el-form>
					<el-form-item
						label="Password:"
					>
						<el-input
							v-model="fileSelected.Password"
							class="grey-theme mb10"
						></el-input>
					</el-form-item>
				</el-form>
        <div slot="footer">
          <el-button
            class="primary"
            type="primary"
            @click="toDecrypt"
          >Confirm</el-button>
        </div>
      </div>
    </el-dialog>
    <el-dialog
      width='600px'
      :close-on-click-modal='false'
      :visible.sync="switchToggle.deleteDialog"
      center
    >
			<div slot="title">
        <h2>Notice</h2>
        <div class="dialog-title-border"></div>
      </div>
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
		<el-dialog
      width="600px"
      :close-on-click-modal='false'
      :visible.sync="switchToggle.detailDialog"
      center
    >
			<div slot="title">
        <h2>Upload detail</h2>
        <div class="dialog-title-border"></div>
      </div>
			<div class="loading-content node-wrapper">
				<div class="node-count mt10"><span>Node:</span> {{fileDetailNodes.length}}</div>
				<ul class="mb20">
					<li class="flex between" v-for="(item,index) in fileDetailNodes" :key="item.HostAddr">
						<div class="node-name">Node {{index+1}}</div>
						<!-- more-than-5 class: gt text color is white lt text color is #202020-->
						<div class="node-process">
							<el-progress
							:text-inside="true"
							:stroke-width="14"
							class="file-progress"
							:percentage="parseInt(((item.UploadSize?item.UploadSize:item.DownloadSize)/fileObjByHash[detailHash].FileSize)*100)"
							:class="{'more-than-5': (((item.UploadSize?item.UploadSize:item.DownloadSize)/fileObjByHash[detailHash].FileSize) < 0.05),'progressAnimate': fileObjByHash[detailHash].Status != 4}"
						></el-progress>
						</div>
					</li>
				</ul>
				<div slot="footer">
					<el-button class="primary" @click="switchToggle.detailDialog = false">OK</el-button>
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
				deleteDialog: false,
				decryptDialog: false,
				detailDialog: false
			},
			TransferConfig: [
				"completeTransferList",
				"uploadTransferList",
				"downloadTransferList"
			],
			detailHash: "",
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
					Privilege: 1,
					Nodes: [
							{
								"HostAddr": "tcp://127.0.0.1:14001",
								"UploadSize": 188,
								"DownloadSize": 188,
							},
							{
								"HostAddr": "tcp://127.0.0.1:14002",
								"UploadSize": 188,
								"DownloadSize": 1406
							},
							{
								"HostAddr": "tcp://127.0.0.1:14002",
								"UploadSize": 188,
								"DownloadSize": 16
							},
							{
								"HostAddr": "tcp://127.0.0.1:14002",
								"UploadSize": 188,
								"DownloadSize": 140
							},
							{
								"HostAddr": "tcp://127.0.0.1:14002",
								"UploadSize": 188,
								"DownloadSize": 1406
							},
							{
								"HostAddr": "tcp://127.0.0.1:14002",
								"UploadSize": 1406,
								"DownloadSize": 1406
							}
						]
					},
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsY11",
					FileName: "hahat.txt",
					Current: 500,
					FileSize: 1536,
					Status: 1,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYw10",
					FileName: "hahat.txt",
					Current: 500,
					Status: 3,
					FileSize: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYw9",
					FileName: "hahat.txt",
					Current: 500,
					FileSize: 1536,
					Status: 4,
					DownloadCount: 0,
					ErrMsg: "this file error",
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYw8",
					FileName: "hahat.txt",
					Current: 500,
					FileSize: 1536,
					DownloadCount: 0,
					Status: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYw7",
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
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYw6",
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
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYw5",
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
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYw4",
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
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYw3",
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
					FileHash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYw2",
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
			// return this.mockFileList || [];
			return this.$store.state.Transfer[this.TransferConfig[this.transferType]] || [];
		},
		fileObjByHash() {
			let obj = {};
			for(let value of this.fileList) {
				obj[value.FileHash] = value;
			}
			return obj;
		},
		fileDetailNodes() {
			if(!this.detailHash) return [];
			let arr = this.fileObjByHash[this.detailHash] && this.fileObjByHash[this.detailHash]['Nodes'] || [];
			arr.sort((a,b) => {
				return a.HostAddr.localeCompare(b.HostAddr);
			})
			return arr;
		}
	},
	methods: {
		openDetailDialog(row) {
			this.detailHash = row.FileHash;
			this.switchToggle.detailDialog = true;
		},
		uploadOrDownloadAgain(row) {
			let url = this.$api.uploadRetry;
			if(!row.IsUploadAction) url = this.$api.downloadRetry;
			let params = {
				Hash: row.FileHash
			}
			this.$axios.post(url, params).then(res => {
				if (res.data.Error === 0) {
					this.$message({
						message: "Opeation Success",
						type: "Success"
					});
				} else {
					this.$message.error(res.data.Desc || "Opeation failed.");
				}
			});
		},
		uploadOrDownloadContinue(row) {
			let url = this.$api.uploadResume;
			if(!row.IsUploadAction) url = this.$api.downloadResume;
			let params = {
				Hash: row.FileHash
			}
			this.$axios.post(url, params).then(res => {
				if (res.data.Error === 0) {
					this.$message({
						message: "Opeation Success",
						type: "Success"
					});
				} else {
					this.$message.error(res.data.Desc || "Opeation failed.");
				}
			});
		},
		uploadOrDownloadPause(row) {
			let url = this.$api.uploadPause;
			if(!row.IsUploadAction) url = this.$api.downloadPause;
			let params = {
				Hash: row.FileHash
			}
			this.$axios.post(url, params).then(res => {
				if (res.data.Error === 0) {
					this.$message({
						message: "Opeation Success",
						type: "Success"
					});
				} else {
					this.$message.error(res.data.Desc || "Opeation failed.");
				}
			});
		},
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
$light-blue: #65a6ff;
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
			// .rowName {
			// 	.opera {
			// 		display: none;
			// 		color: rgba(32, 32, 32, 0.4);
			// 		font-weight: bold;
			// 		.ofont {
			// 			margin: 0px 4px;
			// 			font-size: 18px;
			// 			cursor: pointer;
			// 			&.ofont-zhongxinshangchuan {
			// 				font-size: 14px;
			// 			}
			// 			&.ofont-jixu {
			// 				font-size: 15px;
			// 			}
			// 			&.ofont-zanting {
			// 				font-size: 13px;
			// 			}
			// 			&:hover {
			// 				color: $light-blue;
			// 			}
			// 			&:active {
			// 				opacity: 0.7;
			// 			}
			// 		}
			// 	}
			// 	&:hover {
			// 		.opera {
			// 			display: flex;
			// 			justify-content: center;
			// 			align-items: center;
			// 		}
			// 	}
			// }
		}
	}
	.action > span {
		margin-right: 5px;
		font-size: 18px;
		cursor: pointer;
		.ofont-xiangqingchakan {
			font-size: 18px;
		}
		&:hover {
			color: $light-blue;
		}
		&:active {
			opacity: 0.7;
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
	.node-wrapper {
		ul {
			max-height: 300px;
			min-height: 100px;
			overflow: auto;
			li {
				// margin: 15px 0;
				padding: 15px 0;
				border-bottom: 1px solid rgba(0, 0, 0, .1);
				.node-name {
					width:10%;
					color: #202020;
					text-overflow: ellipsis;
					overflow: hidden;
					white-space: nowrap;
				}	
				.node-process {
					width: 88%;
					.more-than-5 {
						.el-progress-bar__innerText {
							color: #202020;
						}
					}
				}
			}
		}
		.node-count {
			text-align: right;
			color: #2F8FF0;
			span {
				margin-right: 5px;
			}
		}	
	}
}
</style>
