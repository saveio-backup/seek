<template>
	<div class="file-component">
		<!-- opeation all btn -->
		<div
			class="top-progress is-not-compelete-top-progress mr50 ml20"
			v-if="transferType != 0"
		>
			<div class="flex1 mr50">
				<p
					class="ft20 mb10"
					v-if="fileList.length>0"
				>{{transferTypeConfig[transferType]}} Progress</p>
				<p
					class="grey-xs user-no-select"
					v-else
				>No task</p>
				<el-progress
					v-if="fileList.length>0"
					class="progress"
					:percentage="Math.ceil(totalProgress * 100)"
					:show-text="false"
				></el-progress>
				<p
					class="ft14 mt10"
					v-if="fileList.length>0"
				>complete {{Math.ceil(totalProgress * 100)}}%,
					<span class="ml10 light-blue">{{util.bytesToSize(getAllTaskSpeedTotal*1024)}}/s</span>
				</p>
			</div>

			<!-- upload cancel btn -->

			<el-button
				v-if="transferType === 1"
				@click="openPassword()"
			>Cancel All</el-button>

			<!-- download cancel -->
			<el-button
				v-if="transferType === 2"
				@click="openConfirmCancelDownload('all')"
			>Cancel All</el-button>
			<el-button
				v-if="transferType !== 0"
				title="Comming Soon..."
				:class="{'not-allow-opeation':!show}"
				@click="continueAll"
			>Start All</el-button>
			<el-button
				v-if="transferType !== 0"
				title="Comming Soon..."
				:class="{'not-allow-opeation':!show}"
				@click="pauseAll"
			>Pause All</el-button>
				<!--@click="switchToggle.newTaskDialog=true"-->
			<el-button
				v-if="transferType === 2"
				class="primary"
				@click="openNewTaskDialog"
			>New Task</el-button>
		</div>
		<!-- delete all -->
		<div
			v-else
			class="top-progress mr50 ml20"
		>
			<p class="theme-font-blue ft14 user-no-select flex1">Finished {{fileList.length}} Files</p>
			<el-button
				v-if="transferType === 0"
				@click="deleteAll"
			>Delete All</el-button>
		</div>
		<!-- table -->
		<div
			class="file-list mr50 ml20"
			:class="{'is-not-compelete-top-progress':transferType != 0}"
		>
			<!-- border -->
			<el-table
				:data="fileList"
				empty-text='No Data'
				height="100%"
				:show-header="false"
			>
				<!-- :data="fileList" -->
				<el-table-column
					min-width="200"
					label="File Name"
					class-name="rowName"
				>
					<template slot-scope="scope">
						<div class="ft14">
							<p class="theme-font-blue">{{scope.row.FileName}}</p>
							<p class="theme-font-blue-40"><span v-if="transferType != 0">{{util.bytesToSize(((scope.row.IsUploadAction ? scope.row.UploadSize : scope.row.DownloadSize))/(scope.row.IsUploadAction ? (scope.row.CopyNum + 1) : 1) * 1024)}}/</span>{{util.bytesToSize(scope.row.FileSize * 1024)}}</p>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					label="Status"
					v-if="transferType === 0"
					min-width="180"
				>
					<template slot-scope="scope">
						<div
							v-if="scope.row.Status === 3"
							class="light-blue break-word"
						>
							<i
								class="ofont mr10 ft16"
								:class="scope.row.IsUploadAction ? 'ofont-shangchuan':'ofont-xiazai2'"
							></i>
							<span v-if="!scope.row.IsUploadAction">Download Completed</span>
							<span v-else>Upload Completed</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					label="Progress"
					v-if="transferType !== 0"
					min-width="250"
				>
					<template slot-scope="scope">
						<div class="flex ai-center">
							<el-progress
								class="file-progress flex1 ai-center mr10"
								:class="{'progressAnimate': scope.row.Status != 4 && scope.row.Status != 0}"
								v-if="(scope.row.Type === 2) || (scope.row.Type === 1)"
								:percentage="Math.ceil((scope.row.Progress||0)*100)"
								:show-text="false"
							></el-progress>
							<span class="tr speed-content">
								<span>
									{{Math.ceil((scope.row.Progress||0)*100)}}%
								</span>
								<span class="theme-font-blue-40">
									({{taskSpeed[scope.row.Id] && util.bytesToSize((taskSpeed[scope.row.Id].speed * 1024)) || '0 Byte'}}/s)
								</span>
							</span>
						</div>
						<div
							class="flex break-word mr20"
							v-if="waitForing[scope.row.Id]"
						>
							waiting for {{waitForing[scope.row.Id].waitFor}}
						</div>
						<div
							class="flex ai-center break-word mr20"
							v-else
						>
							<div v-if="scope.row.Status === 0">
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
					min-width="150"
				>
					<template slot-scope="scope">
						<span class="break-word">
							{{$dateFormat.formatTimeByTimestamp(scope.row.UpdatedAt*1000)}}
						</span>
					</template>
				</el-table-column>
				<el-table-column
					align="center"
					width="250px"
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
								v-if="(!scope.row.IsUploadAction) && scope.row.Path && scope.row.Status === 3 && scope.row.Encrypted"
							><i class="el-icon-lock"></i></span>
							<span
								class="active-blue cursor-pointer"
								:class="{'not-allow-opeation':!show}"
								:title="!show ? 'Comming Soon...' : scope.row.IsUploadAction ? 'Start to Upload':'Start to Download'"
								v-show="scope.row.Status === 4"
								@click="toUploadOrDownloadAgain(scope.row, transferType)"
							><i
									class="ofont"
									:class="{'ofont-zhongxin': (!scope.row.IsUploadAction && scope.row.Status === 3 && show),'ofont-jixu': scope.row.Status === 4}"
								></i></span>
							<span
								class="active-blue cursor-pointer"
								:title="!show ? 'Comming Soon...' : scope.row.IsUploadAction ? 'Start to Upload':'Start to Download'"
								:class="{'not-allow-opeation':!show}"
								v-show="scope.row.Status === 0"
								@click="toUploadOrDownloadContinue(scope.row, transferType)"
							><i class="ofont ofont-jixu"></i></span>
							<span
								class="active-blue cursor-pointer"
								:class="{'not-allow-opeation':!show}"
								:title="!show ? 'Comming Soon...' : scope.row.IsUploadAction ? 'Pause to Upload':'Pause to Download'"
								v-show="(scope.row.Status === 1 || scope.row.Status === 2 )"
								@click="uploadOrDownloadPause(scope.row, transferType)"
							><i class="ofont ofont-zanting"></i></span>
							<span
								class="active-blue cursor-pointer"
								:class="{'not-allow-opeation':show}"
								:title="show ? 'Comming Soon...' : scope.row.IsUploadAction ? 'Cancel to Upload':'Cancel to Download'"
								v-show="transferType === 1"
								@click="openPassword(scope.row)"
							><i class="ofont ofont-guanbi"></i></span>
							<span
								class="active-blue cursor-pointer"
								:class="{'not-allow-opeation':show}"
								:title="show ? 'Comming Soon...' : scope.row.IsUploadAction ? 'Cancel to Upload':'Cancel to Download'"
								v-show="transferType === 2"
								@click="openConfirmCancelDownload(scope.row)"
							><i class="ofont ofont-guanbi"></i></span>
							<span
								class="active-blue cursor-pointer"
								title="Look Detail"
								@click="openDetailDialog(scope.row)"
							><i class="ofont ofont-xiangqing"></i></span>
							<!-- v-show="(scope.row.Nodes && scope.row.Nodes.length > 0) || scope.row.Status === 3" -->
							<span
								class="active-blue cursor-pointer"
								title="Delete Record"
								@click="deleteRecord(scope.row)"
								v-show="transferType === 0"
							><i class="ofont ofont-shanchu"></i></span>
						</div>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<!-- new download dialog -->
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
				@closeDialog='switchToggle.newTaskDialog = false'
				v-if="switchToggle.newTaskDialog"
			></download-dialog>
		</el-dialog>
		<!-- cancel task input password dialog -->
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
		<!-- Decryption input password dialog -->
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
		<!-- notice is not delete file dialog -->
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
		<!-- upload page upload dialog -->
		<el-dialog
			width="600px"
			:close-on-click-modal='false'
			:visible.sync="switchToggle.detailDialog"
			center
		>
			<div slot="title">
				<h2>{{transferType === 1?'Upload Detail':'Download Detail'}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content node-wrapper">
				<ul
					class="mb20"
					:class="{'max1': transferType === 1 && fileDetailNodes.length === 0,'max2': transferType === 2 && fileDetailNodes.length === 0}"
				>
					<li
						v-if="transferType === 1"
						class="flex tr no-border pb0"
					>
						<div class="node-name pr30">Upload Model:</div>
						<div
							class="theme-font-blue-40 node-value"
							v-if="fileObjById[detailId]"
						>
							{{fileObjById[detailId].StoreType === 1 ? 'Advance' : fileObjById[detailId].StoreType === 0 ? 'Primary' : ''}}
						</div>
					</li>
					<li
						class="flex tr"
						:class="{'no-border': fileDetailNodes.length === 0 || transferType !== 1}"
					>
						<div class="node-name pr30">File Hash:</div>
						<div
							class="theme-font-blue-40 node-value"
							v-if="fileObjById[detailId]"
						>{{fileObjById[detailId].FileHash}}</div>
					</li>
					<li
						v-if="transferType !== 1"
						class="flex tr no-border"
					>
						<div class="node-name pr30">Consumption:</div>
						<div
							class="theme-font-blue-40 node-value"
							v-if="fileObjById[detailId]"
						>{{fileObjById[detailId].DownloadSize * 1024 / Math.pow(10, 9)}} SAVE</div>
					</li>
					<template v-if="transferType === 1">
						<li
							class="flex tr"
							v-for="(item, index) in fileDetailNodes"
							:key="item.HostAddr"
						>
							<div class="node-name pr30">Node{{index+1}}:</div>
							<!-- more-than-5 class: gt text color is white lt text color is #202020-->
							<div class="node-process">
								<el-progress
									:text-inside="true"
									:stroke-width="14"
									class="file-progress"
									:percentage="Math.ceil(((item.UploadSize?item.UploadSize:item.DownloadSize)/fileObjById[detailId].FileSize)*100)"
									:class="{'more-than-5': (((item.UploadSize?item.UploadSize:item.DownloadSize)/fileObjById[detailId].FileSize) < 0.05),'progressAnimate': fileObjById[detailId].Status != 4 && fileObjById[detailId].Status != 0}"
								></el-progress>
							</div>
							<div class="ml10 tl node-speed ft14 theme-font-blue-40">{{nodeSpeed[item.HostAddr] && util.bytesToSize(nodeSpeed[item.HostAddr].speed*1024) || '0 Byte'}}/s</div>
							<div
								class="file-size tr theme-font-blue-40"
								v-if="fileObjById[detailId]"
							>{{util.bytesToSize(item.UploadSize*1024 || item.DownloadSize*1024)}}/{{util.bytesToSize(fileObjById[detailId].FileSize * 1024)}}</div>
						</li>
					</template>
					<template v-else-if="transferType === 2">
						<li class="flex tr no-border">
							<div class="node-name pr30">Source Node:</div>
							<div>
								<div
									class="tl flex mb10"
									v-for="(item, index) in fileDetailNodes"
									:key="item.HostAddr"
								>
									<div class="node-content-first theme-font-blue-70">
										Node{{index+1}}
									</div>
									<div class="node-content-second theme-font-blue-40">
										{{util.bytesToSize(item.UploadSize*1024 || item.DownloadSize*1024)}}
									</div>
									<div class="node-content-third theme-font-blue-40">
										{{nodeSpeed[item.HostAddr] && util.bytesToSize(nodeSpeed[item.HostAddr].speed*1024) || '0 Byte'}}/s
									</div>
								</div>
							</div>
						</li>
					</template>
				</ul>
				<div slot="footer">
					<el-button
						class="primary"
						@click="switchToggle.detailDialog = false"
					>OK</el-button>
				</div>
			</div>
		</el-dialog>
		<!-- confirm cancel download task dialog -->
		<el-dialog
			width="600px"
			:close-on-click-modal='false'
			:visible.sync="switchToggle.confirmCancelDownloadDialog"
			class="download-file-detail"
			center
		>
			<div slot="title">
				<h2>Task Delete</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content">
				<p class="mb20 mt10">
					Are you sure you want to delete the selected task?
				</p>
				<div slot="footer">
					<el-button
						type="primary"
						@click="switchToggle.confirmCancelDownloadDialog=false"
					>Cancel</el-button>
					<el-button
						class="primary"
						type="primary"
						@click="cancelDownload"
					>Confirm</el-button>
				</div>
			</div>
		</el-dialog>
		<!-- complete page upload dialog-->
		<upload-file-detail-dialog
			@closeUploadFileDetail="toCloseUploadFileDetail"
			:hash="uploadDetailHash"
			v-if="transferType === 0"
		></upload-file-detail-dialog>
		<!-- complete page download dialog-->
		<el-dialog
			width="600px"
			:close-on-click-modal='false'
			:visible.sync="switchToggle.downloadDetailDialog"
			class="download-file-detail"
			center
		>
			<div slot="title">
				<h2>File Detail</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content download-file-detail-loading">
				<div
					class="adjust"
					v-if="fileObjById[detailId]"
				>
					<div class="adjust-item">
						<p class="adjust-title theme-font-blue ft14">File Hash:</p>
						<div class="adjust-info">
							<p class="theme-font-blue ft14 mr20">{{fileObjById[detailId].FileHash || ''}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title theme-font-blue ft14">Download Date:</p>
						<div class="adjust-info">
							<p class="theme-font-blue ft14 mr20">{{$dateFormat.formatTimeByTimestamp(fileObjById[detailId].UpdatedAt*1000) || ''}}</p>
						</div>
					</div>
				</div>
				<div slot="footer">
					<el-button
						class="primary"
						type="primary"
						@click="switchToggle.downloadDetailDialog=false"
					>Close</el-button>
				</div>
			</div>
		</el-dialog>
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
				passwordDialog: false,
				downloadDetailDialog: false,
				confirmCancelDownloadDialog: false
			},
			TransferConfig: [
				"completeTransferList",
				"uploadTransferList",
				"downloadTransferList"
			],
			confirmCancelTask: null,
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
					Id: "c3c94084-b8bf-11e9-837c-74e5f93a476b",
					FileHash: "QmdUW37NcoT4YdkjgPinNFFT6CGHLRRcXQ5SNzrLqT123123JVpd",
					FileName: "传输管理.png",
					Type: 2,
					Status: 3,
					DetailStatus: 20,
					CopyNum: 2,
					Path:
						"C:\\Users\\qwews\\Desktop\\Seeker交互图\\交互原型图PNG版\\传输管理.png",
					IsUploadAction: false,
					UploadSize: 3072,
					DownloadSize: 0,
					FileSize: 1024,
					Nodes: [
						{
							HostAddr: "tcp://40.73.103.72:33516",
							UploadSize: 1024,
							DownloadSize: 0
						},
						{
							HostAddr: "tcp://40.73.103.72:35269",
							UploadSize: 1024,
							DownloadSize: 0
						},
						{
							HostAddr: "tcp://40.73.103.72:37559",
							UploadSize: 1024,
							DownloadSize: 0
						}
					],
					Progress: 1,
					CreatedAt: 1565146937,
					UpdatedAt: 1565150221,
					ErrorCode: 0,
					StoreType: 0
				},
				{
					Id: "c3c94084-b8bf-11e9-837c-74e5f93a4762",
					FileHash: "QmdUW37NcoT4YdkjgPinNFFT6CGHLR2cXQ5SqTJVpd",
					FileName: "传输管理2.png",
					Type: 1,
					Status: 3,
					DetailStatus: 10,
					CopyNum: 2,
					Path:
						"C:\\Users\\qwews\\Desktop\\Seeker交互图\\交互原型图PNG版\\传输管理.png",
					IsUploadAction: true,
					UploadSize: 2072,
					DownloadSize: 3678121520,
					FileSize: 1024,
					Nodes: [
						{
							HostAddr: "tcp://40.73.103.72:33516",
							UploadSize: 1024,
							DownloadSize: 0
						},
						{
							HostAddr: "tcp://40.73.103.72:35269",
							UploadSize: 1024,
							DownloadSize: 0
						},
						{
							HostAddr: "tcp://40.73.103.72:37559",
							UploadSize: 1024,
							DownloadSize: 0
						}
					],
					Progress: 1,
					CreatedAt: 1565146937,
					UpdatedAt: 1565150221,
					ErrorCode: 0,
					StoreType: 0
				}
			],
			waitForing: {},
			// speed association attributes
			taskSpeed: {},
			nodeSpeed: {},
			speedIntervalObj: null,
			passHowLongTimeGetFileList: 0, //computed how long time get file list
			taskSpeedNum: 1 // computed fileList change max time（3s）
		};
	},
	computed: {
		totalProgress: function() {
			// let progress = 0;
			// let fileList = 0;
			let transferSize = 0;
			let transferTotal = 0;
			this.fileList.map(file => {
				if (file.Status !== 0 && file.Status !== 4) {
					if (this.transferType === 1) {
						transferSize += file.UploadSize;
						transferTotal += file.FileSize * (file.CopyNum + 1);
					} else {
						transferSize += file.DownloadSize;
						transferTotal += file.FileSize;
					}
				}
			});
			return transferSize / transferTotal || 0;
		},
		fileList: function() {
			// return this.mockFileList;
			this.taskSpeedNum = 0;
			let arr =
				this.$store.state.Transfer[this.TransferConfig[this.transferType]] ||
				[];
			if (Object.keys(this.waitForing).length) {
				return arr;
			}
			for (let value of arr) {
				if (
					this.waitForing[value.Id] &&
					this.waitForing[value.Id].Status != value.Status
				) {
					this.$delete(this.waitForing, value.Id);
					if (Object.keys(this.waitForing).length === 0) {
						return arr;
					}
				}
			}
			return arr;
		},
		fileObjById: function() {
			let obj = {};
			for (let value of this.fileList) {
				obj[value.Id] = value;
			}
			return obj;
		},
		fileDetailNodes: function() {
			if (!this.detailId) return [];
			let arr =
				(this.fileObjById[this.detailId] &&
					JSON.parse(
						JSON.stringify(this.fileObjById[this.detailId]["Nodes"])
					)) ||
				[];
			arr.sort((a, b) => {
				return a.HostAddr.localeCompare(b.HostAddr);
			});
			return arr;
		},
		getDetailStatus: function() {
			return function(type, detailStatus) {
				return this.$i18n.error[detailStatus][this.$language];
			};
		},
		getAllTaskSpeedTotal: function() {
			let speedTotal = 0;
			for (let value of Object.keys(this.taskSpeed)) {
				speedTotal += this.taskSpeed[value].speed;
			}
			return speedTotal;
		},
		isSync: function() {
			return this.$store.state.Home.isSync || false;
		}
	},
	methods: {
		openNewTaskDialog() {
			if(this.isSync && this.transferType === 2) {
				this.$confirm('Block unsynchronized completion. Are you sure to do this?', 'Notice', {
					confirmButtonText: 'confirm',
					cancelButtonText: 'cancel',
				}).then(() => {
					this.switchToggle.newTaskDialog = true;
				}).catch(e => {
				})
			} else {
				this.switchToggle.newTaskDialog = true;
			}
		},
		// dialog confirm cancel download
		cancelDownload() {
			this.switchToggle.confirmCancelDownloadDialog = false;
			if(this.confirmCancelTask && this.confirmCancelTask.Id) {
				this.uploadOrDownloadCancel(this.confirmCancelTask, this.transferType);
			} else if(this.confirmCancelTask === 'all') {
				this.cancelAll();
			}
		},
		/**
		 * open confirm cancel download dialog
		 * params
		 * task 'all':cancel all task  task: cancel the task
		 */
		openConfirmCancelDownload(task) {
			const type = this.transferType;
			if(task === 'all') {
				const arr = this.getTask(type, 0, 1, 2, 4);
				if (arr.length === 0) {
					this.$message({
						message: "There are no tasks to cancel"
					});
					return;
				}
				this.confirmCancelTask = task;
			} else {
				this.confirmCancelTask = Object.assign({}, task);
			}
			this.switchToggle.confirmCancelDownloadDialog = true;
		},
		// cancel task
		toCancel() {
			// to do!!!!!
			// if (!this.show) return;
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
			// to do!!!!!
			// if (!this.show) return;
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
			if (this.transferType === 0) {
				if (row.IsUploadAction) {
					this.uploadDetailHash = row.FileHash;
				} else {
					this.detailId = row.Id;
					this.switchToggle.downloadDetailDialog = true;
				}
			} else {
				this.detailId = row.Id;
				this.nodeSpeed = {};
				this.getNodeSpeed(true);
				this.switchToggle.detailDialog = true;
			}
		},
		// cancel all task
		cancelAll() {
			// to do!!!!!
			// if (!this.show) return;
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
		toContinueAll() {
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
		// continue all task
		continueAll() {
			// to do!!!!!
			if (!this.show) return;
			if(this.isSync && this.transferType === 2) {
				this.$confirm('Block unsynchronized completion. Are you sure to do this?', 'Notice', {
					confirmButtonText: 'confirm',
					cancelButtonText: 'cancel',
				}).then(() => {
					this.toContinueAll();
				}).catch(e => {
				})
			} else {
				this.toContinueAll();
			}
		},
		// pause all task
		pauseAll() {
			// to do!!!!!
			if (!this.show) return;
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
					if (!e.message.includes("timeout")) {
						this.$message.error("Network Error. Delete Record Failed!");
					}
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
			// to do!!!!!
			// if (!this.show) return;
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
						let errorMsg = ''
						for (let value of res.Result.Tasks) {
							if (value && value.Code) {
								errorMsg += `<p>`
								errorMsg += `${value.FileName || ''}` 
								errorMsg += this.$i18n.error[value.Error]
									? this.$i18n.error[value.Error][this.$language]
									: `error code is ${value.Error}`
								errorMsg += `</p>`;
							}
						}
						//if no err
						if (errorMsg.length === 0) {
							this.$message({
								message: "Opeation Success",
								type: "success"
							});
						} else {
							this.$message.error({
								dangerouslyUseHTMLString: true,
								message: errorMsg
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
					if (!e.message.includes("timeout")) {
						this.$message.error("Network Error. Cancel Task Failed!");
					}
				});
		},
		toUploadOrDownloadAgain(row, type) {
			// to do!!!!!
			if (!this.show) return;
			if(this.isSync && this.transferType === 2) {
				this.$confirm('Block unsynchronized completion. Are you sure to do this?', 'Notice', {
					confirmButtonText: 'confirm',
					cancelButtonText: 'cancel',
				}).then(() => {
					this.uploadOrDownloadAgain(row, type);
				}).catch(e => {
				})
			} else {
				this.uploadOrDownloadAgain(row, type);
			}
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
					if (!e.message.includes("timeout")) {
						this.$message.error("Network Error. Start Task Failed!");
					}
				});
		},
		toUploadOrDownloadContinue(row, type) {
			// to do!!!!!
			if (!this.show) return;
			if(this.isSync && this.transferType === 2) {
				this.$confirm('Block unsynchronized completion. Are you sure to do this?', 'Notice', {
					confirmButtonText: 'confirm',
					cancelButtonText: 'cancel',
				}).then(() => {
					this.uploadOrDownloadContinue(row, type);
				}).catch(e => {
				})
			} else {
				this.uploadOrDownloadContinue(row, type);
			}
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
					if (!e.message.includes("timeout")) {
						this.$message.error("Network Error. Start Task Failed!");
					}
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
			// to do!!!!!
			if (!this.show) return;
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
					if (!e.message.includes("timeout")) {
						this.$message.error("Network Error. Pause Task Failed!");
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
			this.$axios
				.post(this.$api.delete, { Hash: hash })
				.then(res => {
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
				})
				.catch(e => {
					if (!e.message.includes("timeout")) {
						this.$message.error("Network Error. Delete File Failed!");
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
				.catch(e => {
					if (!e.message.includes("timeout")) {
						this.$message.error("Network Error. Decrypt Failed!");
					}
				});
		},
		getTaskSpeed() {
			let oldTaskSpeed = this.taskSpeed;
			let newTaskSpeed = {};
			this.taskSpeedNum++;
			if (this.taskSpeedNum !== 1) {
				this.passHowLongTimeGetFileList = this.taskSpeedNum;
				return;
			}
			for (let value of this.fileList) {
				let uploadOrDownloadSize = value.UploadSize || value.DownloadSize;
				let speed =
					uploadOrDownloadSize -
					(oldTaskSpeed[value.Id]
						? oldTaskSpeed[value.Id].FileSize
						: uploadOrDownloadSize);
				newTaskSpeed[value.Id] = {
					speed: speed / (this.passHowLongTimeGetFileList + 1),
					FileSize: uploadOrDownloadSize
				};
			}
			this.passHowLongTimeGetFileList++;
			this.taskSpeed = newTaskSpeed;
		},
		/**
		 * params
		 * isF: is not force run
		 *  */
		getNodeSpeed(isF = false) {
			if ((this.fileDetailNodes.length > 0 && this.taskSpeedNum === 1) || isF) {
				let oldNodeSpeed = this.nodeSpeed;
				let newNodeSpeed = {};
				for (let value of this.fileDetailNodes) {
					let uploadOrDownloadSize = value.UploadSize || value.DownloadSize;
					// let speed =
					// 	uploadOrDownloadSize -
					// 	(oldNodeSpeed[value.HostAddr] !== undefined
					// 		? oldNodeSpeed[value.HostAddr].FileSize
					// 		: 0);
					let speed =
						oldNodeSpeed[value.HostAddr] !== undefined
							? uploadOrDownloadSize -
							  (oldNodeSpeed[value.HostAddr].FileSize || 0)
							: 0;
					newNodeSpeed[value.HostAddr] = {
						speed: speed / this.passHowLongTimeGetFileList,
						FileSize: uploadOrDownloadSize
					};
				}
				this.nodeSpeed = newNodeSpeed;
			}
		}
	},
	mounted() {
		const INTERVAL_TIME = 1000;
		this.speedIntervalObj = setInterval(() => {
			this.getTaskSpeed();
			this.getNodeSpeed();
		}, INTERVAL_TIME);
	},
	beforeDestroy() {
		clearInterval(this.speedIntervalObj);
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
		height: 140px;
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
		&.is-not-compelete-top-progress {
			height: 140px;
		}
	}
	.file-list {
		height: calc(100% - 80px);
		border-top: 1px solid #ebeef5;
		&.is-not-compelete-top-progress {
			height: calc(100% - 140px);
		}
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
	.speed-content {
		width: 130px;
	}
	.node-wrapper {
		ul {
			max-height: 300px;
			min-height: 70px;
			overflow: auto;
			&.max1 {
				li {
					.node-name {
						width: 135px;
					}
				}
			}
			li {
				// margin: 15px 0;
				padding: 15px 0;
				border-bottom: 1px solid rgba(0, 0, 0, 0.1);
				.node-name {
					// width: 10%;
					width: 140px;
					color: #202020;
					// text-overflow: ellipsis;
					// overflow: hidden;
					// white-space: nowrap;
					height: 100%;
				}
				.node-value {
					text-align: left;
					width: calc(100% - 140px);
				}
				.node-process {
					width: calc(100% - 370px);
					.more-than-5 {
						.el-progress-bar__innerText {
							color: #202020;
						}
					}
				}
				.node-speed {
					width: 100px;
				}
				.file-size {
					width: 180px;
				}
				&.no-border {
					border: 0;
				}
				&.pb0 {
					padding-bottom: 0;
				}
				.node-content-first {
					width: 129px;
					text-align: left;
				}
				.node-content-second {
					width: 129px;
					text-align: center;
				}
				.node-content-third {
					width: 129px;
					text-align: right;
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
	.not-allow-opeation {
		border-color: #a6a6a6 !important;
		color: #a6a6a6 !important;
		cursor: not-allowed !important;
		box-shadow: none !important;
		&:hover {
			opacity: 1 !important;
			background: none !important;
		}
		&:active {
			opacity: 1 !important;
		}
		&:focus {
			opacity: 1 !important;
		}
	}
}
.download-file-detail {
	.adjust {
		// border-bottom: solid 1px #ebecef;
		padding-bottom: 20px;
		.el-input-number__increase,
		.el-input-number__decrease {
			display: none;
		}
	}
	.adjust-item {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin: 15px 0;
		.adjust-title {
			font-size: 14px;
			width: 160px;
			padding-right: 30px;
			text-align: right;
			color: rgba(32, 32, 32, 0.4);
		}
		.adjust-info {
			flex: 1;
			width: 200px;
			display: flex;
			text-align: left;
			.sizeunit {
				width: 100px;
				margin: 0 20px;
			}
			ul {
				max-height: 150px;
				overflow: auto;
				li {
					margin-bottom: 10px;
				}
			}
		}
	}
}
</style>
