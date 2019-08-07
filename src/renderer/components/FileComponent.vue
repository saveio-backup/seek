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
			<!-- upload cancel -->
			<el-button
				v-if="transferType === 1"
				@click="openPassword()"
			>Cancel All</el-button>
			<!-- download cancel -->
			<el-button
				v-if="transferType === 2"
				@click="cancelAll"
			>Cancel All</el-button>
			<el-button
				v-if="transferType !== 0"
				@click="continueAll"
			>Start All</el-button>
			<el-button
				v-if="transferType !== 0"
				@click="pauseAll"
			>Pause All</el-button>
			<el-button
				v-if="transferType === 2"
				class="primary"
				@click="switchToggle.newTaskDialog=true"
			>New Task</el-button>
		</div>
		<div
			v-else
			class="top-progress"
		>
			<p class="theme-font-blue ft14 user-no-select flex1">Finished {{fileList.length}} Files</p>
			<el-button
				v-if="transferType === 0"
				@click="deleteAll"
			>Delete All</el-button>
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
						<div>
							<span>{{scope.row.FileName}}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					label="Model"
					min-width="100"
					v-if="transferType === 1"
				>
					<template slot-scope="scope">
						<div>
							{{scope.row.StoreType === 1 ? 'Advance' : scope.row.StoreType === 0 ? 'Primary' : ''}}
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
							:class="{'progressAnimate': scope.row.Status != 4 && scope.row.Status != 0}"
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
						<div
							class="flex ai-center break-word"
							v-if="waitForing[scope.row.Id]"
						>
							waiting for {{waitForing[scope.row.Id].waitFor}}
						</div>
						<div
							class="flex ai-center break-word"
							v-else
						>
							<i
								v-if="transferType === 0"
								class="ofont mr20 ft16 active-blue"
								:class="scope.row.IsUploadAction ? 'ofont-shangchuan':'ofont-xiazai2'"
							></i>
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
							<div v-else-if="scope.row.Status === 0">
								<span class="light-blue">Task Pause</span>
							</div>
							<div v-else-if="scope.row.Status === 4">
								<span class="light-error">{{scope.row.ErrMsg || (transferType === 1? 'Upload failed':transferType === 2?'Download failed':'')}}</span>
							</div>
							<div
								class="light-blue"
								v-else
							>
								{{ getDetailStatus(scope.row.Type, scope.row.DetailStatus) }}
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					label="Date"
					v-if="transferType === 0"
					min-width="100"
				>
					<template slot-scope="scope">
						<span>
							{{$dateFormat.formatTimeByTimestamp(scope.row.UpdatedAt*1000)}}
						</span>
					</template>
				</el-table-column>
				<el-table-column
					align="center"
					width="210px"
				>
					<template slot-scope="scope">
						<div class="action ft18 opera">
							<span
								title="Open folder"
								v-if="scope.row.Path"
								class="active-blue cursor-pointer"
								@click="showInFolder(scope.row.Path)"
							><i class="ofont ofont-wenjianxiangqing ft14"></i></span>
							<span
								title="Decrypt"
								class="active-blue cursor-pointer"
								@click="setFileSelected(scope.row)"
								v-if="(!scope.row.IsUploadAction) && scope.row.Path"
							><i class="el-icon-lock"></i></span>
							<span
								class="active-blue cursor-pointer"
								:title="scope.row.IsUploadAction ? 'start to upload':'start to download'"
								v-show="scope.row.Status === 4"
								@click="uploadOrDownloadAgain(scope.row, transferType)"
							><i
									class="ofont"
									:class="{'ofont-zhongxin': (!scope.row.IsUploadAction && scope.row.Status === 3 && show),'ofont-jixu': scope.row.Status === 4}"
								></i></span>
							<span
								class="active-blue cursor-pointer"
								:title="scope.row.IsUploadAction ? 'start to upload':'start to download'"
								v-show="scope.row.Status === 0"
								@click="uploadOrDownloadContinue(scope.row, transferType)"
							><i class="ofont ofont-jixu"></i></span>
							<span
								class="active-blue cursor-pointer"
								:title="scope.row.IsUploadAction ? 'pause to upload':'pause to download'"
								v-show="(scope.row.Status === 1 || scope.row.Status === 2 )"
								@click="uploadOrDownloadPause(scope.row, transferType)"
							><i class="ofont ofont-zanting"></i></span>
							<span
								class="active-blue cursor-pointer"
								:title="scope.row.IsUploadAction ? 'cancel to upload':'cancel to download'"
								v-show="transferType === 1"
								@click="openPassword(scope.row)"
							><i class="ofont ofont-guanbi"></i></span>
							<span
								class="active-blue cursor-pointer"
								:title="scope.row.IsUploadAction ? 'cancel to upload':'cancel to download'"
								v-show="transferType === 2"
								@click="uploadOrDownloadCancel(scope.row, transferType)"
							><i class="ofont ofont-guanbi"></i></span>
							<span
								class="active-blue cursor-pointer"
								title="look detail"
								@click="openDetailDialog(scope.row)"
								v-show="((scope.row.Nodes && scope.row.Nodes.length > 0) || scope.row.Status === 3) && scope.row.IsUploadAction"
							><i class="ofont ofont-xiangqing"></i></span>
							<span
								class="active-blue cursor-pointer"
								title="delete record"
								@click="deleteRecord(scope.row)"
								v-show="scope.row.Status === 3"
							><i class="ofont ofont-shanchu"></i></span>
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
				@closedialog='switchToggle.newTaskDialog = false'
				v-if="switchToggle.newTaskDialog"
				v-on:closedialog='hideTaskDialog'
			></download-dialog>
		</el-dialog>
		<el-dialog
			width='600px'
			center
			:close-on-click-modal='false'
			:visible.sync="switchToggle.passwordDialog"
		>
			<div slot="title">
				<h2>Confirm</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content password-cancel-dialog">
				<el-form
					ref="passwordCancel"
					:model="passwordCancel"
					:rules="passwordCancelRules"
				>
					<el-form-item
						label="Password:"
						prop="Password"
					>
						<el-input
							v-model="passwordCancel.Password"
							show-password
							type="password"
							@keyup.native.enter='toCancel'
							placeholder="Input Password"
							class="grey-theme mb10"
						></el-input>
					</el-form-item>
				</el-form>
				<div slot="footer">
					<el-button
						class="primary"
						type="primary"
						@click="toCancel"
					>Confirm</el-button>
				</div>
			</div>
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
			<div class="loading-content decrypt">
				<el-form>
					<el-form-item label="File Password:">
						<el-input
							v-model="fileSelected.Password"
							@keyup.native.enter='toDecrypt'
							placeholder="Input File Password"
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
				<h2>Upload Detail</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content node-wrapper">
				<div class="node-count mt10"><span>Node:</span> {{fileDetailNodes.length}}</div>
				<ul class="mb20">
					<li
						class="flex between"
						v-for="(item,index) in fileDetailNodes"
						:key="item.HostAddr"
					>
						<div class="node-name">Node {{index+1}}</div>
						<!-- more-than-5 class: gt text color is white lt text color is #202020-->
						<div class="node-process">
							<el-progress
								:text-inside="true"
								:stroke-width="14"
								class="file-progress"
								:percentage="parseInt(((item.UploadSize?item.UploadSize:item.DownloadSize)/fileObjByHash[detailId].FileSize)*100)"
								:class="{'more-than-5': (((item.UploadSize?item.UploadSize:item.DownloadSize)/fileObjByHash[detailId].FileSize) < 0.05),'progressAnimate': fileObjByHash[detailId].Status != 4 && fileObjByHash[detailId].Status != 0}"
							></el-progress>
						</div>
					</li>
				</ul>
				<div slot="footer">
					<el-button
						class="primary"
						@click="switchToggle.detailDialog = false"
					>OK</el-button>
				</div>
			</div>
		</el-dialog>
		<upload-file-detail-dialog
			@closeUploadFileDetail="toCloseUploadFileDetail"
			:hash="uploadDetailHash"
			v-if="transferType === 0"
		></upload-file-detail-dialog>
	</div>
</template>
<script>
import util from "../assets/config/util";
import downloadDialog from "./DownloadDialog.vue";
import uploadFileDetailDialog from "./UploadFileDetailDialog.vue";
import { shell } from "electron";
export default {
	props: {
		transferType: {
			required: true,
			type: Number // 1 upload 2 download 0 complete
		}
	},
	components: {
		downloadDialog,
		uploadFileDetailDialog
	},
	data() {
		return {
			util,
			show: false,
			switchToggle: {
				loading: null,
				newTaskDialog: false,
				transferItemDialog: false,
				deleteDialog: false,
				decryptDialog: false,
				detailDialog: false,
				passwordDialog: false
			},
			TransferConfig: [
				"completeTransferList",
				"uploadTransferList",
				"downloadTransferList"
			],
			detailId: "",
			uploadDetailHash: "",
			transferItem: {},
			transferTypeConfig: ["Completed", "Upload", "Download"],
			fileSelected: {
				Path: "",
				Password: ""
			},
			passwordCancel: {
				Password: "",
				File: null, // if file is null is cancel all else cancel file
				loadingObj: null
			},
			passwordCancelRules: {
				Password: [
					{
						required: true,
						message: "Please fill password",
						trigger: "blur"
					}
				]
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
					Path: "123",
					Nodes: [
						{
							HostAddr: "tcp://127.0.0.1:14001",
							UploadSize: 188,
							DownloadSize: 188
						},
						{
							HostAddr: "tcp://127.0.0.1:14002",
							UploadSize: 188,
							DownloadSize: 1406
						},
						{
							HostAddr: "tcp://127.0.0.1:14002",
							UploadSize: 188,
							DownloadSize: 16
						},
						{
							HostAddr: "tcp://127.0.0.1:14002",
							UploadSize: 188,
							DownloadSize: 140
						},
						{
							HostAddr: "tcp://127.0.0.1:14002",
							UploadSize: 188,
							DownloadSize: 1406
						},
						{
							HostAddr: "tcp://127.0.0.1:14002",
							UploadSize: 1406,
							DownloadSize: 1406
						}
					],
					DetailStatus: 2
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
					Privilege: 1,
					DetailStatus: 2
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
					Privilege: 1,
					DetailStatus: 2
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
					Privilege: 1,
					DetailStatus: 2
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
					Privilege: 1,
					DetailStatus: 2
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
					Privilege: 1,
					DetailStatus: 2
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
					Privilege: 1,
					DetailStatus: 2
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
					Privilege: 1,
					DetailStatus: 2
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
					Privilege: 1,
					DetailStatus: 2
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
					Privilege: 1,
					DetailStatus: 2
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
					Privilege: 1,
					DetailStatus: 2
				}
			],
			loadinginstace: {},
			waitForing: {}
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
			// return this.mockFileList;
			let arr =
				this.$store.state.Transfer[this.TransferConfig[this.transferType]] ||
				[];
			if (Object.keys(this.waitForing).length) return arr;
			for (let value of arr) {
				if (
					this.waitForing[value.Id] &&
					this.waitForing[value.Id].Status != value.Staus
				) {
					this.$delete(this.waitForing, value.Id);
					if (Object.keys(this.waitForing).length === 0) return arr;
				}
			}
			return arr;
		},
		fileObjByHash() {
			let obj = {};
			for (let value of this.fileList) {
				obj[value.Id] = value;
			}
			return obj;
		},
		fileDetailNodes() {
			if (!this.detailId) return [];
			let arr =
				(this.fileObjByHash[this.detailId] &&
					JSON.parse(
						JSON.stringify(this.fileObjByHash[this.detailId]["Nodes"])
					)) ||
				[];
			arr.sort((a, b) => {
				return a.HostAddr.localeCompare(b.HostAddr);
			});
			return arr;
		},
		getDetailStatus() {
			return function(type, detailStatus) {
				return this.$i18n.error[detailStatus][this.$language];
			};
		}
	},
	methods: {
		// cancel task
		toCancel() {
			// add loading
			this.passwordCancel.loadingObj = this.$loading({
				target: ".password-cancel-dialog.loading-content",
				text: "Loading...",
				lock: true
			});
			if (this.passwordCancel.File === null) {
				// cancel all when File is null
				this.cancelAll();
			} else {
				// cancel task when file is object
				this.uploadOrDownloadCancel(
					this.passwordCancel.File,
					this.transferType
				);
			}
		},
		// upload file open cancel task dialog to input password
		openPassword(file = null) {
			this.switchToggle.passwordDialog = true;
			this.$nextTick(() => {
				this.$refs.passwordCancel.resetFields();
				this.passwordCancel.File = file;
			});
		},
		toCloseUploadFileDetail() {
			this.uploadDetailHash = "";
		},
		// open detail dialog
		openDetailDialog(row) {
			if (row.Status === 3) {
				this.uploadDetailHash = row.FileHash;
			} else {
				this.detailId = row.Id;
				this.switchToggle.detailDialog = true;
			}
		},
		// cancel all task
		cancelAll() {
			const type = this.transferType;
			const arr = this.getTask(type, 0, 1, 2, 4);
			if (arr.length === 0) {
				this.$message({
					message: "There are no tasks to cancel"
				});
				return;
			}
			this.uploadOrDownloadCancel(arr, type);
		},
		// continue all task
		continueAll() {
			const type = this.transferType;
			let flag = false;
			//get pause task to continue
			const arr = this.getTask(type, 0);
			if (arr.length > 0) {
				flag = true;
				this.uploadOrDownloadContinue(arr, type);
			}
			const arr2 = this.getTask(type, 4);
			//get error task to again
			if (arr2.length > 0) {
				flag = true;
				this.uploadOrDownloadAgain(arr2, type);
			}
			//if no task message
			if (!flag) {
				this.$message({
					message: "There are no tasks to start"
				});
			}
		},
		// pause all task
		pauseAll() {
			const type = this.transferType;
			const arr = this.getTask(type, 1, 2);
			if (arr.length === 0) {
				this.$message({
					message: "There are no tasks to pause"
				});
				return;
			}
			this.uploadOrDownloadPause(arr, type);
		},
		// delete complete all task record
		deleteAll() {
			const type = this.transferType;
			const arr = this.getTask(type, 3);
			if (arr.length === 0) {
				this.$message({
					message: "There are no record to delete"
				});
				return;
			}
			this.deleteRecord(arr);
		},
		/**
		 * get filter task list
		 * params
		 * type: 1: upload、 2: download、 0: complete
		 * status： file status
		 */
		getTask(type, ...status) {
			let filterArr = this.fileList.filter(item => {
				if (type === 2 && item.IsUploadAction) {
					return false;
				} else if (type === 1 && !item.IsUploadAction) {
					return false;
				} else if (status.indexOf(item.Status) === -1) {
					return false;
				}
				return true;
			});
			return filterArr;
		},
		// delete complete record!!!!!
		deleteRecord(row) {
			// get params
			let isArray = this.isArray(row);
			let params;
			if (isArray) {
				let arr = [];
				for (let value of row) {
					arr.push(value.Id);
				}
				params = {
					Ids: arr
				};
			} else {
				params = {
					Ids: [row.Id]
				};
			}

			// add wait for task and get have wait for task
			const haveWaitFor = this.addWaitFor({
				row: row,
				waitFor: "delete record"
			});
			if (!haveWaitFor) return;

			this.$axios
				.post(this.$api.deleteRecord, params, {
					timeout: 10000 * params.Ids.length
				})
				.then(res => {
					this.$store.dispatch("setComplete");
					this.removeWaitFor({ Ids: params.Ids });

					if (res.Error === 0) {
						//get error list
						let errorArr = [];
						for (let value of res.Result.Tasks) {
							if (value && value.Code) {
								errorArr.push(value);
							}
						}
						//if no err
						if (errorArr.length === 0) {
							this.$message({
								message: "Opeation Success",
								type: "success"
							});
						}
					} else {
						this.$message.error(
							this.$i18n.error[res.Error]
								? this.$i18n.error[res.Error][this.$language]
								: `error code is ${res.Error}`
						);
					}
				})
				.catch(e => {
					this.removeWaitFor({ Ids: params.Ids });
				});
		},
		isArray(arg) {
			return Object.prototype.toString.call(arg) === "[object Array]";
		},
		/**
		 * params
		 * row: transfer item or list
		 * type: 0:upload    1:download
		 */
		uploadOrDownloadCancel(row, type) {
			// get http url
			let url = type === 1 ? this.$api.uploadCancel : this.$api.downloadCancel;

			// get params
			let isArray = this.isArray(row);
			let params;
			if (isArray) {
				let arr = [];
				for (let value of row) {
					arr.push(value.Id);
				}
				params = {
					Ids: arr
				};
			} else {
				params = {
					Ids: [row.Id]
				};
			}
			if (type === 1) {
				params.Password = this.passwordCancel.Password;
			}

			// add password when current mode is upload
			this.$axios
				.post(url, params, {
					timeout: 10000 * params.Ids.length
				})
				.then(res => {
					this.passwordCancel.loadingObj &&
						this.passwordCancel.loadingObj.close();
					// get transfer list info update status
					if (type === 1) {
						this.$store.dispatch("setUpload");
					} else {
						this.$store.dispatch("setDownload");
					}

					if (res.Error === 0) {
						if (type === 1) {
							this.switchToggle.passwordDialog = false;
						}
						//get error list
						let errorArr = [];
						for (let value of res.Result.Tasks) {
							if (value && value.Code) {
								errorArr.push(value);
							}
						}
						//if no err
						if (errorArr.length === 0) {
							this.$message({
								message: "Opeation Success",
								type: "success"
							});
						}
					} else {
						this.$message.error(
							this.$i18n.error[res.Error]
								? this.$i18n.error[res.Error][this.$language]
								: `error code is ${res.Error}`
						);
					}
				})
				.catch(e => {
					this.passwordCancel.loadingObj &&
						this.passwordCancel.loadingObj.close();
				});
		},
		/**
		 * params
		 * row: transfer item or list
		 * type: 0:upload    1:download
		 */
		uploadOrDownloadAgain(row, type) {
			// get http url
			let url = type === 1 ? this.$api.uploadRetry : this.$api.downloadRetry;

			// get params
			let isArray = this.isArray(row);
			let params;
			if (isArray) {
				let arr = [];
				for (let value of row) {
					arr.push(value.Id);
				}
				params = {
					Ids: arr
				};
			} else {
				params = {
					Ids: [row.Id]
				};
			}
			// add wait for task and get have wait for task
			const haveWaitFor = this.addWaitFor({ row: row, waitFor: "start" });
			if (!haveWaitFor) return;

			this.$axios
				.post(url, params, {
					timeout: 10000 * params.Ids.length
				})
				.then(res => {
					// get transfer list info update status
					if (type === 1) {
						this.$store.dispatch("setUpload");
					} else {
						this.$store.dispatch("setDownload");
					}
					// remove wait for task
					this.removeWaitFor({ Ids: params.Ids });

					if (res.Error === 0) {
					} else {
						this.$message.error(
							this.$i18n.error[res.Error]
								? this.$i18n.error[res.Error][this.$language]
								: `error code is ${res.Error}`
						);
					}
				})
				.catch(e => {
					this.removeWaitFor({ Ids: params.Ids });
				});
		},
		/**
		 * params
		 * row: transfer item or list
		 * type: 0:upload    1:download
		 */
		uploadOrDownloadContinue(row, type) {
			let url = type === 1 ? this.$api.uploadResume : this.$api.downloadResume;

			let isArray = this.isArray(row);
			let params;
			if (isArray) {
				let arr = [];
				for (let value of row) {
					arr.push(value.Id);
				}
				params = {
					Ids: arr
				};
			} else {
				params = {
					Ids: [row.Id]
				};
			}
			// add wait for task and get have wait for task
			const haveWaitFor = this.addWaitFor({ row: row, waitFor: "start" });
			if (!haveWaitFor) return;

			this.$axios
				.post(url, params, {
					timeout: 10000 * params.Ids.length
				})
				.then(res => {
					// get transfer list info update status
					if (type === 1) {
						this.$store.dispatch("setUpload");
					} else {
						this.$store.dispatch("setDownload");
					}
					// remove wait for task
					this.removeWaitFor({ Ids: params.Ids });

					if (res.Error === 0) {
					} else {
						this.$message.error(
							this.$i18n.error[res.Error]
								? this.$i18n.error[res.Error][this.$language]
								: `error code is ${res.Error}`
						);
					}
				})
				.catch(e => {
					this.removeWaitFor({ Ids: params.Ids });
				});
		},
		/**
		 * add wait for task
		 * params
		 * row: transfer item or list
		 */
		addWaitFor({ row, waitFor }) {
			let isArray = this.isArray(row);
			let arr = row;
			let falg = false; // have task need wait for
			if (!isArray) {
				arr = [row];
			}
			for (let item of arr) {
				if (!this.waitForing[item.Id]) {
					this.$set(this.waitForing, item.Id, {
						Status: item.Status,
						waitFor: waitFor
					});
					falg = true;
				}
			}
			this.$forceUpdate();
			return falg;
		},
		removeWaitFor({ Ids }) {
			for (let Id of Ids) {
				if (this.waitForing[Id]) {
					delete this.waitForing[Id];
					this.$delete(this.waitForing, Id);
				}
			}
		},
		/**
		 * params
		 * row: transfer item or list
		 * type: 0:upload    1:download
		 */
		uploadOrDownloadPause(row, type) {
			// get http url
			let url = type === 1 ? this.$api.uploadPause : this.$api.downloadPause;

			// get params
			let isArray = this.isArray(row);
			let params;
			if (isArray) {
				let arr = [];
				for (let value of row) {
					arr.push(value.Id);
				}
				params = {
					Ids: arr
				};
			} else {
				params = {
					Ids: [row.Id]
				};
			}

			// add wait for task and get have wait for task
			const haveWaitFor = this.addWaitFor({ row: row, waitFor: "pause" });
			if (!haveWaitFor) return;

			this.$axios
				.post(url, params, {
					timeout: 10000 * params.Ids.length
				})
				.then(res => {
					// get transfer list info update status
					if (type === 1) {
						this.$store.dispatch("setUpload");
					} else {
						this.$store.dispatch("setDownload");
					}
					// remove wait for task
					this.removeWaitFor({ Ids: params.Ids });

					if (res.Error === 0) {
						//get error list
						// let errorArr = [];
						// for (let value of res.Result.Tasks) {
						// 	if (value && value.Code) {
						// 		errorArr.push(value);
						// 	}
						// }
						// //if no err
						// if (errorArr.length === 0) {
						// 	this.$message({
						// 		message: "Opeation Success",
						// 		type: "success"
						// 	});
						// }
					} else {
						this.$message.error(
							this.$i18n.error[res.Error]
								? this.$i18n.error[res.Error][this.$language]
								: `error code is ${res.Error}`
						);
					}
				})
				.catch(e => {
					this.removeWaitFor({ Ids: params.Ids });
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
				if (res.Error === 0) {
					this.$message({
						message: "Delete Completed",
						type: "success"
					});
				} else {
					this.$message.error(
						this.$i18n.error[res.Error]
							? this.$i18n.error[res.Error][this.$language]
							: `error code is ${res.Error}`
					);
				}
			});
		},
		toDecrypt() {
			if (this.switchToggle.loading) return;
			this.$axios
				.post(this.$api.decrypt, this.fileSelected, {
					loading: {
						text: "Processing..",
						target: ".loading-content.decrypt"
					}
				})
				.then(res => {
					if (res.Error === 0) {
						this.$message({
							message: "Decryption successed",
							type: "success"
						});
						this.fileList.Password = "";
						this.fileList.Path = "";
						this.switchToggle.decryptDialog = false;
					} else {
						this.$message.error(
							this.$i18n.error[res.Error]
								? this.$i18n.error[res.Error][this.$language]
								: `error code is ${res.Error}`
						);
					}
				})
				.catch(err => {
					console.log(err);
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
		.el-button--default {
			position: relative;
			top: 5px;
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
			.opera {
				.ofont {
					&.ofont-jixu {
						position: relative;
						left: 2px;
					}
					&.ofont-guanbi {
						font-size: 15px;
					}
				}
			}
		}
	}
	.action > span {
		display: inline-block;
		width: 32px;
		height: 32px;
		cursor: pointer;
		margin: 0px 4px;
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
				border-bottom: 1px solid rgba(0, 0, 0, 0.1);
				.node-name {
					width: 10%;
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
			color: #2f8ff0;
			span {
				margin-right: 5px;
			}
		}
	}
}
</style>
