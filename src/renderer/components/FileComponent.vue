<template>
	<div class="file-component">
		<!-- opeation all btn -->
		<div
			class="top-progress is-not-compelete-top-progress mr50 ml20"
			v-if="transferType != 0"
		>
			<div class="flex1 mr50">
				<p
					class="ft20 mb10 theme-font-color"
					v-if="fileList.length>0"
				>{{$t(`fileManager["${transferTypeConfig[transferType]}"]`)}} {{$t('fileManager.progress')}}</p>
				<!-- <p
					class="grey-xs user-no-select"
					v-else
				>{{$t('fileManager.noTask')}}</p> -->
				<el-progress
					v-if="fileList.length>0"
					class="progress"
					:percentage="Math.ceil(totalProgress * 100) >= 100 ? 99 : Math.ceil(totalProgress * 100)"
					:show-text="false"
				></el-progress>
				<p
					class="ft14 mt10 theme-font-color"
					v-if="fileList.length>0"
				>{{$t('fileManager.complete')}} {{Math.ceil(totalProgress * 100) >= 100 ? 99 : Math.ceil(totalProgress * 100)}}%,
					<span class="ml10 light-blue">{{util.bytesToSize(getAllTaskSpeedTotal*1024)}}/{{$t('fileManager.s')}}</span>
				</p>
			</div>

			<!-- upload cancel btn -->

			<ripper-button
				v-if="transferType === 1"
				class="batch-button"
				@click="openPassword()"
			>{{$t('fileManager.cancelAll')}}</ripper-button>

			<!-- download cancel -->
			<ripper-button
				v-if="transferType === 2"
				class="batch-button"
				@click="openConfirmCancelDownload('all')"
			>{{$t('fileManager.cancelAll')}}</ripper-button>
			<ripper-button
				v-if="transferType !== 0"
				class="batch-button"
				:class="{'not-allow-opeation':!show}"
				@click="continueAll"
			>{{$t('fileManager.startAll')}}</ripper-button>
			<ripper-button
				v-if="transferType !== 0"
				class="batch-button"
				:class="{'not-allow-opeation':!show}"
				@click="pauseAll"
			>{{$t('fileManager.pauseAll')}}</ripper-button>
			<!--@click="switchToggle.newTaskDialog=true"-->
			<ripper-button
				v-if="transferType === 2"
				class="primary batch-button"
				@click="openNewTaskDialog"
			>{{$t('fileManager.newTask')}}</ripper-button>
		</div>
		<!-- delete all -->
		<div
			v-else
			class="top-progress mr50 ml20"
		>
			<p class="theme-font-color ft14 user-no-select flex1">{{$t('fileManager.finished')}} {{fileList.length}} {{$t('fileManager.files')}}</p>
			<ripper-button
				v-if="transferType === 0"
				@click="deleteAll"
			>{{$t('fileManager.deleteAll')}}</ripper-button>
		</div>
		<!-- table -->
		<div
			class="file-list mr50 ml20"
			:class="{'is-not-compelete-top-progress':transferType != 0}"
		>
			<!-- border -->
			<!-- :data="mockFileList" -->
			<el-table
				:data="fileList"
				:empty-text='$t("public.noData")'
				height="100%"
				:show-header="false"
				row-key="Id"
			>
				<!-- :data="fileList" -->
				<el-table-column
					width="30"
					label=""
					class-name="download-type"
					v-if="transferType === 2"
				>
					<template slot-scope="scope">
						<div class="ftpx16">
							<i
								class="ofont ofont-wangye"
								:title="$t('fileManager.thirdPartyWebsitesResources')"
								v-if="scope.row.Url && scope.row.Url.startsWith('oni://www')"
							></i>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					min-width="200"
					:label="$t('fileManager.fileName')"
					class-name="rowName"
				>
					<template slot-scope="scope">
						<div class="ftpx14">
							<p class="theme-font-color">{{scope.row.FileName}}</p>
							<p
								class="grey-xs"
								v-if="transferType === 2"
							>{{util.bytesToSize(scope.row.DownloadSize * 1024 || 0)}}/{{util.bytesToSize(scope.row.FileSize * 1024)}}</p>
							<p
								class="grey-xs"
								v-else-if="transferType === 1"
							>{{util.bytesToSize(scope.row.UploadSize * 1024 || 0)}}/{{util.bytesToSize(scope.row.FileSize * 1024)}}</p>
							<p
								class="grey-xs"
								v-else
							>{{util.bytesToSize(scope.row.FileSize * 1024)}}</p>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					:label="$t('public.status')"
					v-if="transferType === 0"
					min-width="180"
				>
					<template slot-scope="scope">
						<div
							v-if="scope.row.Status === 3"
							class="light-blue break-word"
						>
							<i
								class="ofont mr10 ftpx16"
								:class="scope.row.IsUploadAction ? 'ofont-shangchuan':'ofont-xiazai2'"
							></i>
							<span v-if="!scope.row.IsUploadAction">{{$t('fileManager.downloadCompleted')}}</span>
							<span v-else>{{$t('fileManager.uploadCompleted')}}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					:label="$t('fileManager.progress')"
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
								<span class="grey-color">
									({{speedByS(scope.row)}}/{{$t('fileManager.s')}})
								</span>
							</span>
						</div>
						<div
							class="flex break-word mr20 light-blue"
							v-if="httpWaitForing[scope.row.Id]"
						>
							{{$t(`error["${httpWaitForing[scope.row.Id].waitFor}"]`)}}
						</div>
						<div
							class="flex ai-center break-word mr20"
							v-else
						>
							<div v-if="scope.row.Status === 0">
								<span class="light-blue">{{$t('fileManager.taskPause')}}</span>
							</div>
							<div v-else-if="scope.row.Status === 4">
								<span class="light-error">{{scope.row.ErrMsg && scope.row.ErrMsg.replace(/Neo/g,'NeDevo') || (transferType === 1? $t('fileManager.uploadFailed'):transferType === 2?$t('fileManager.downloadFailed'):'')}}</span>
							</div>
							<div
								class="light-blue"
								v-else
							>
								<!-- {{scope.row.DetailStatus}} -->
								{{ $t(`error['${scope.row.DetailStatus}']`) }}
							</div>
						</div>
					</template>
				</el-table-column>
				<el-table-column
					:label="$t('fileManager.date')"
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
						<div class="action ftpx18 opera">
							<span
								:title="$t('fileManager.openFolder')"
								v-if="scope.row.Path"
								class="active-blue cursor-pointer"
								@click="showInFolder(scope.row.Path)"
							><i class="ofont ofont-wenjianxiangqing ftpx14"></i></span>
							<span
								:title="$t('fileManager.decrypt')"
								class="active-blue cursor-pointer"
								@click="setFileSelected(scope.row)"
								v-if="(!scope.row.IsUploadAction) && scope.row.Path && scope.row.Status === 3 && scope.row.Encrypted"
							><i class="el-icon-lock"></i></span>
							<span
								class="active-blue cursor-pointer"
								:title="scope.row.IsUploadAction ? $t('fileManager.startToUpload'):$t('fileManager.startToDownload')"
								v-show="scope.row.Status === 4"
								@click="toUploadOrDownloadAgain([scope.row])"
							><i class="ofont ofont-jixu"></i></span>
							<span
								class="active-blue cursor-pointer"
								:title="scope.row.IsUploadAction ? $t('fileManager.startToUpload'):$t('fileManager.startToDownload')"
								v-show="scope.row.Status === 0"
								@click="toUploadOrDownloadContinue([scope.row])"
							><i class="ofont ofont-jixu"></i></span>
							<span
								class="active-blue cursor-pointer"
								:class="{'not-allow-opeation':scope.row.DetailStatus === 5 || scope.row.DetailStatus === 23}"
								:title="scope.row.DetailStatus === 5 || scope.row.DetailStatus === 23 ? '' : scope.row.IsUploadAction ? $t('fileManager.pauseToUpload'):$t('fileManager.pauseToDownload')"
								v-show="scope.row.Status === 1 || scope.row.Status === 2 || scope.row.Status === 6"
								@click="uploadOrDownloadPause([scope.row])"
							><i class="ofont ofont-zanting"></i></span>
							<span
								class="active-blue cursor-pointer"
								:class="{'not-allow-opeation': (scope.row.DetailStatus === 5 || scope.row.DetailStatus === 23) && scope.row.Status !== 4}"
								:title="(scope.row.DetailStatus === 5 || scope.row.DetailStatus === 23) && scope.row.Status !== 4 ? '' : scope.row.IsUploadAction ? $t('fileManager.cancelToUpload'):$t('fileManager.cancelToDownload')"
								v-if="transferType === 1"
								@click="openPassword(scope.row)"
							><i class="ofont ofont-guanbi"></i></span>
							<span
								class="active-blue cursor-pointer"
								:class="{'not-allow-opeation': scope.row.Status === 6 || (scope.row.DetailStatus === 5 || scope.row.DetailStatus === 23) && scope.row.Status !== 4}"
								:title="(scope.row.DetailStatus === 5 || scope.row.DetailStatus === 23) && scope.row.Status !== 4 ? '' : scope.row.IsUploadAction ? $t('fileManager.cancelToUpload'):$t('fileManager.cancelToDownload')"
								v-if="transferType === 2"
								@click="openConfirmCancelDownload(scope.row)"
							><i class="ofont ofont-guanbi"></i></span>
							<span
								class="active-blue cursor-pointer"
								:title="$t('fileManager.fileDetail')"
								@click="openDetailDialog(scope.row)"
							><i class="ofont ofont-xiangqing"></i></span>
							<span
								class="active-blue cursor-pointer"
								:title="$t('fileManager.deleteRecord')"
								@click="deleteRecord(scope.row)"
								v-if="transferType === 0"
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
				<h2>{{$t('fileManager.newDownload')}}</h2>
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
				<h2>{{$t('public.confirm')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content password-cancel-dialog">
				<el-form
					ref="passwordCancel"
					:model="passwordCancel"
					:rules="passwordCancelRules"
					@submit.native.prevent
				>
					<el-form-item
						:label="$t('public.password')+':'"
						prop="Password"
					>
						<el-input
							v-model="passwordCancel.Password"
							show-password
							type="password"
							@keyup.native.enter='toCancelCheck'
							:placeholder="$t('public.pleaseInputPassword')"
							class="grey-theme mb10"
						></el-input>
					</el-form-item>
				</el-form>
				<p class="cancel-dialog-gas-fee mb10">{{$t('fileManager.gasFee')}}: {{cancelGasFee !== '' && cancelGasFee != '...' ? (cancelGasFee * 500 / Math.pow(10, 9)) : cancelGasFee}} {{cancelGasFee !== '' && cancelGasFee != '...' ? 'ONI' : ''}}</p>
				<div slot="footer">
					<ripper-button
						v-show="!switchToggle.cancelToggle && !switchToggle.cancelToggleError"
						:disabled="true"
						type="primary"
						class="primary ml10"
					>{{$t('fileManager.calculating')}}</ripper-button>
					<ripper-button
						class="primary ml10"
						v-show="switchToggle.cancelToggleError"
						@click="getCancelGasFee"
					>
						{{$t('fileManager.recalculation')}}
					</ripper-button>
					<ripper-button
						v-show="switchToggle.cancelToggle && !switchToggle.cancelToggleError"
						class="primary"
						type="primary"
						@click="toCancelCheck"
					>{{$t('public.confirm')}}</ripper-button>
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
				<h2>{{$t('fileManager.decryption')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content decrypt">
				<el-form>
					<el-form-item :label="$t('fileManager.filePassword')+':'">
						<el-input
							v-model="fileSelected.Password"
							@keyup.native.enter='toDecrypt'
							:placeholder="$t('public.pleaseInputPassword')"
							class="grey-theme mb10"
						></el-input>
					</el-form-item>
				</el-form>
				<div slot="footer">
					<ripper-button
						class="primary"
						type="primary"
						@click="toDecrypt"
					>{{$t('public.confirm')}}</ripper-button>
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
				<h2>{{$t('public.notice')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<p>{{$t('fileManager.areYourSureToDeleteThisFile')}}</p>
			<p>{{executedFile.FileName}}</p>
			<div slot="footer">
				<ripper-button @click="switchToggle.deleteDialog = false">{{$t('public.cancel')}}</ripper-button>
				<ripper-button
					class="primary ml10"
					@click="toDeleteFile(executedFile.FileHash)"
				>{{$t('fileManager.deleteButton')}}</ripper-button>
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
				<h2>{{transferType === 1?$t('fileManager.uploadDetail'):$t('fileManager.downloadDetail')}}</h2>
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
						<div class="node-name pr30">{{$t('fileManager.uploadModel')}}:</div>
						<div
							class="node-value ft14"
							v-if="fileObjById[detailId]"
						>
							{{fileObjById[detailId].StoreType === 1 ? $t('fileManager.advance') : fileObjById[detailId].StoreType === 0 ? $t('fileManager.primary') : ''}}
						</div>
					</li>
					<li
						class="flex tr"
						:class="{'no-border': fileDetailNodes.length === 0 || transferType !== 1}"
					>
						<div class="node-name pr30">{{$t('fileManager.fileHash')}}:</div>
						<div
							class="node-value"
							v-if="fileObjById[detailId]"
						>{{fileObjById[detailId].FileHash}}</div>
					</li>
					<li
						v-if="transferType !== 1"
						class="flex tr no-border"
					>
						<div class="node-name pr30">{{$t('fileManager.Consumption')}}:</div>
						<div
							class="node-value"
							v-if="fileObjById[detailId]"
						>{{fileObjById[detailId].DownloadSize * 1024 / Math.pow(10, 9) || 0}} ONI</div>
					</li>
					<template v-if="transferType === 2">
						<li class="flex tr no-border">
							<div class="node-name pr30">{{$t('fileManager.sourceNode')}}:</div>
							<div>
								<div
									class="tl flex mb10"
									v-for="(item, index) in fileDetailNodes"
									:key="item.HostAddr"
								>
									<div class="node-content-first ft14">
										{{$t('fileManager.node')}}{{index+1}}
									</div>
									<div class="node-content-second ">
										{{util.bytesToSize(item.DownloadSize*1024)}}
									</div>
									<div class="node-content-third ">
										{{nodeSpeed[item.HostAddr] && ( util.bytesToSize(nodeSpeed[item.HostAddr].speed*1024 || item.Speed))}}/{{$t('fileManager.s')}}
									</div>
								</div>
							</div>
						</li>
					</template>
				</ul>
				<div slot="footer">
					<ripper-button
						class="primary"
						@click="switchToggle.detailDialog = false"
					>{{$t('fileManager.ok')}}</ripper-button>
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
				<h2>{{$t('fileManager.taskDelete')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content confirm-cancel-download-dialog">
				<p class="mb20 mt10">
					{{$t('fileManager.areYouSureYouWantToDeleteTheSelectedTask')}}
				</p>
				<div slot="footer">
					<ripper-button
						type="primary"
						@click="switchToggle.confirmCancelDownloadDialog=false"
					>{{$t('public.cancel')}}</ripper-button>
					<ripper-button
						class="primary ml10"
						type="primary"
						@click="cancelDownload"
					>{{$t('public.confirm')}}</ripper-button>
				</div>
			</div>
		</el-dialog>
		<!-- complete page upload dialog -->
		<upload-file-detail-dialog
			@closeUploadFileDetail="toCloseUploadFileDetail"
			:hash="uploadDetailHash"
			:fileNodes="uploadDetailNodes"
			:isClose="true"
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
				<h2>{{$t('fileManager.fileDetail')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content download-file-detail-loading">
				<div
					class="adjust"
					v-if="fileObjById[detailId]"
				>
					<div class="adjust-item">
						<p class="adjust-title  ft14">{{$t('fileManager.fileHash')}}:</p>
						<div class="adjust-info">
							<p class=" ftpx14 mr20">{{fileObjById[detailId].FileHash || ''}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title  ft14">{{$t('fileManager.downloadDate')}}:</p>
						<div class="adjust-info">
							<p class=" ftpx14 mr20">{{$dateFormat.formatTimeByTimestamp(fileObjById[detailId].UpdatedAt*1000) || ''}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title  ft14">{{$t('fileManager.fee')}}:</p>
						<div class="adjust-info">
							<p class=" ftpx14 mr20">{{fileObjById[detailId].DownloadSize * 1024 / Math.pow(10, 9) || '0'}} ONI</p>
						</div>
					</div>
					<div class="adjust-item">
						<div class="adjust-title">{{$t('fileManager.sourceNode')}}:</div>
						<div class="adjust-info flex column">
							<div
								style="width:100%"
								class="flex mb10"
								v-for="(item, index) in fileObjById[detailId].Nodes"
								:key="item.HostAddr"
							>
								<div :title="item.HostAddr">
									{{$t('fileManager.node')}}{{index+1}}
								</div>
								<div class="ml50">
									{{util.bytesToSize(item.DownloadSize*1024)}}
								</div>
							</div>
						</div>
					</div>
				</div>
				<div slot="footer">
					<ripper-button
						class="primary"
						type="primary"
						@click="switchToggle.downloadDetailDialog=false"
					>{{$t('public.close')}}</ripper-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import util from "../assets/config/util";
import downloadDialog from "./DownloadDialog.vue";
import uploadFileDetailDialog from "./UploadFileDetailDialog.vue";
import crypto from "crypto";
import { shell, ipcRenderer } from "electron";
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
			show: true,
			switchToggle: {
				loading: null,
				newTaskDialog: false,
				transferItemDialog: false,
				deleteDialog: false,
				decryptDialog: false,
				detailDialog: false,
				passwordDialog: false,
				downloadDetailDialog: false,
				confirmCancelDownloadDialog: false,
				confirmCancelDownloadDialogLoading: null,
				cancelToggle: true,
				cancelToggleError: false,
				getGasNumber: 0
			},
			cancelGasFee: "",
			TransferConfig: [
				"completeTransferList",
				"uploadTransferList",
				"downloadTransferList"
			],
			confirmCancelTask: null,
			detailId: "",
			uploadDetailHash: "",
			detailObj: {
				fee: 0
			},
			transferItem: {},
			transferTypeConfig: ["Completed", "Upload", "Download"],
			fileSelected: {
				Path: "",
				Password: ""
			},
			//cancel task input password form
			passwordCancel: {
				Password: "",
				File: null, // if file is null is cancel all else cancel file
				loadingObj: null
			},
			//cancel task input password form check
			passwordCancelRules: {
				Password: [
					{
						required: true,
						message: this.$t("public.pleaseFillPassword"),
						trigger: "blur"
					}
				]
			},
			executedFile: {}, // a file be opera
			mockFileList: [
				{
					Id: "c3c94084-b8bf-11e9-837c-74e5f93a476b",
					FileHash: "QmdUW37NcoT4YdkjgPinNFFT6CGHLRRcXQ5SNzrLqT123123JVpd",
					FileName: "mock_传输管理.png",
					Type: 2,
					Status: 2,
					DetailStatus: 5,
					CopyNum: 2,
					Path:
						"C:\\Users\\qwews\\Desktop\\Seeker交互图\\交互原型图PNG版\\传输管理.png",
					IsUploadAction: false,
					UploadSize: 3072,
					DownloadSize: 1,
					FileSize: 1024,
					Url: "",
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
					Status: 2,
					DetailStatus: 23,
					CopyNum: 2,
					Url: "oni://www",
					Path:
						"C:\\Users\\qwews\\Desktop\\Seeker交互图\\交互原型图PNG版\\传输管理.png",
					IsUploadAction: false,
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
			//http loading array
			httpWaitForing: {},
			// speed association attributes
			taskSpeed: {},
			nodeSpeed: {},
			speedIntervalObj: null,
			passHowLongTimeGetFileList: 0, //computed how long time get file list
			taskSpeedNum: 3, // computed fileList change max time（3s）
			uploadDetailNodes: []
		};
	},
	watch: {
		lang() {
			this.passwordCancelRules = {
				Password: [
					{
						required: true,
						message: this.$t("public.pleaseFillPassword"),
						trigger: "blur"
					}
				]
			};
		},
		uploadLength(val) {
			if (
				this.switchToggle.passwordDialog &&
				this.passwordCancel.File === null
			) {
				this.getCancelGasFee();
			}
		}
	},
	computed: {
		downloadDoneList() {
			return this.$store.state.Transfer.downloadDoneList || [];
		},
		uploadDoneList() {
			return this.$store.state.Transfer.uploadDoneList || [];
		},	
		speedByS() {
			const vm = this;
			return function(row) {
				let _speed = vm.taskSpeed[row.Id] && vm.taskSpeed[row.Id].speed * 1024 || 0;
				if(!_speed && vm.transferType === 2) {
					let _total = 0;
					for(let i = 0;i < row.Nodes.length;i ++) {
						_total += (row.Nodes[i].Speed || 0);
					}
					return vm.util.bytesToSize(_total);
				} else {
					return  vm.util.bytesToSize(_speed) || '0 Byte'
				}
			}
		},
		lang() {
			return this.$i18n.locale;
		},
		totalProgress: function() {
			const vm = this;
			if(this.transferType === 0) {
				return;
			}
			let _total = 0;
			let _use = 0;
			try {
				if(this.transferType === 1) {
					for(let value of vm.fileList) {
						_total += value.RealFileSize;
						_use += (value.Nodes && value.Nodes[0] && value.Nodes[0].RealUploadSize || 0);
					}
					for(let value of vm.uploadDoneList) {
						_total += value;
						_use += value;
					}
					return (_total && (_use/_total) || 0);
				} else if(this.transferType === 2) {
					for(let i = 0;i < vm.fileList.length; i ++) {
						let value = vm.fileList[i];
						if(value.Nodes) {
							for(let node of value.Nodes) {
								_use +=	node.DownloadSize || 0;
							}
							_total += value.FileSize;
						}
					}
					for(let value of vm.downloadDoneList) {
						_total += value;
						_use += value;
					}
					return (_total && (_use/_total) || 0);
				} 
				return 0;
			}catch(e) {
				return (_total && (_use/_total) || 0);
			}
		},
		waitForUploadOrderList: function() {
			return this.$store.state.Transfer.waitForUploadOrderList;
		},
		waitForDownloadOrderList: function() {
			return this.$store.state.Transfer.waitForDownloadOrderList;
		},
		fileList: function() {
			this.taskSpeedNum = 0;
			let arr =
				this.$store.state.Transfer[this.TransferConfig[this.transferType]] ||
				[];
			if (this.transferType === 1) {
				let newArr = this.filterUploadArr(arr);
				return newArr;
			} else if (this.transferType === 2) {
				let newArr = this.filterDownloadArr(arr);
				return newArr;
			}
			if (Object.keys(this.httpWaitForing).length) {
				return arr;
			}
			for (let value of arr) {
				if (
					this.httpWaitForing[value.Id] &&
					this.httpWaitForing[value.Id].Status != value.Status
				) {
					this.$delete(this.httpWaitForing, value.Id);
					if (Object.keys(this.httpWaitForing).length === 0) {
						return arr;
					}
				}
			}
			return arr;
		},
		fileObjById: function() {
			let obj = {};
			for (let value of this.fileList) {
				// update upload file nodes
				if (
					this.uploadDetailHash &&
					this.transferType === 0 &&
					value.FileHash === this.uploadDetailHash
				) {
					this.uploadDetailNodes = value.Nodes;
				}
				//
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
		getAllTaskSpeedTotal: function() {
			let speedTotal = 0;
			try {
				for (let value of Object.keys(this.taskSpeed)) {
					let _speed = this.taskSpeed[value].speed || 0;
					if(_speed === 0 && this.transferType === 2) {
						for(let i = 0;i < this.fileObjById[value].Nodes.length;i ++) {
							_speed += (this.fileObjById[value].Nodes[i].Speed || 0);
						}
						speedTotal += (_speed/1024);
					} else {
						speedTotal += _speed;
					}
				}
				return speedTotal;
			}catch(e) {
				return speedTotal;
			}
		},
		isSync: function() {
			return this.$store.state.Home.isSync || false;
		},
		waitForUploadList: function() {
			return this.$store.state.Transfer.waitForUploadList || [];
		},
		waitForDownloadList: function() {
			return this.$store.state.Transfer.waitForDownloadList || [];
		},
		localStatus: function() {
			// console.log(this.$store.state.Transfer.localStatus);
			return this.$store.state.Transfer.localStatus;
		},
		uploadLength: function() {
			return this.$store.state.Transfer.uploadLength;
		},
		balanceLists() {
			return this.$store.state.Wallet.balanceLists;
		},
		currentBalanceFormat() {
			if (!this.balanceLists) return 0;
			for (let value of this.balanceLists) {
				if (value.Symbol === "SAVE") {
					return value.BalanceFormat;
				}
			}
		}
	},
	methods: {
		filterUploadArr(arr) {
			let newArr = JSON.parse(JSON.stringify(arr));
			if (
				this.localStatus.pausing.length === 0 &&
				this.localStatus.uploading.length === 0
			) {
				return newArr;
			}
			for (let value of newArr) {
				if (this.localStatus.pausing.indexOf(value.Id) >= 0  && value.Status !== 0) {
					value.Status = 0;
					value.DetailStatus = "1";
					continue;
				}
				if (this.localStatus.uploading.indexOf(value.Id) >= 0 && (value.Status !== 2 && value.Status !== 6)) {
					value.Status = 2;
					value.DetailStatus = "uploadLoading";
					continue;
				}
			}
			return newArr;
		},
		filterDownloadArr(arr) {
			let newArr = JSON.parse(JSON.stringify(arr));
			if (
				this.localStatus.pausing.length === 0 &&
				this.localStatus.uploading.length === 0
			) {
				return newArr;
			}
			for (let value of newArr) {
				if (this.localStatus.pausing.indexOf(value.Id) >= 0 && value.Status !== 0) {
					value.Status = 0;
					value.DetailStatus = "1";
					continue;
				}
				if (this.localStatus.uploading.indexOf(value.Id) >= 0 && (value.Status !== 2 && value.Status !== 6)) {
					value.Status = 2;
					value.DetailStatus = "downloadLoading";
					continue;
				}
			}
			return newArr;
		},
		//open new task dilaog for to download task
		openNewTaskDialog() {
			const vm = this;
			if (this.isSync && this.transferType === 2) {
				this.$confirm(
					vm.$t("public.blockUnsynchronizedCompletionAreYouSureToDoThis"),
					vm.$t("public.notice"),
					{
						confirmButtonText: vm.$t("public.confirm"),
						cancelButtonText: vm.$t("public.cancel")
					}
				)
					.then(() => {
						this.switchToggle.newTaskDialog = true;
					})
					.catch(e => {});
			} else {
				this.switchToggle.newTaskDialog = true;
			}
		},
		// dialog confirm cancel download
		cancelDownload() {
			const vm = this;
			// this.switchToggle.confirmCancelDownloadDialog = false;
			this.switchToggle.confirmCancelDownloadDialogLoading = this.$loading({
				target: ".confirm-cancel-download-dialog.loading-content",
				text: vm.$t("fileManager.loading"),
				lock: true
			});
			if (this.confirmCancelTask && this.confirmCancelTask.Id) {
				this.uploadOrDownloadCancel(this.confirmCancelTask);
			} else if (this.confirmCancelTask === "all") {
				this.cancelAll();
			} else {
				this.switchToggle.confirmCancelDownloadDialogLoading &&
					this.switchToggle.confirmCancelDownloadDialogLoading.close();
			}
		},
		/**
		 * open confirm cancel download dialog
		 * params
		 * task 'all':cancel all task  task: cancel the task
		 */
		openConfirmCancelDownload(task) {
			const vm = this;
			const type = this.transferType;
			if (task === "all") {
				const arr = this.getTask(type, 0, 1, 2, 4, 6);
				if (arr.length === 0) {
					this.$message({
						message: vm.$t("fileManager.thereAreNoTasksToCancel"),
						type: "warning"
					});
					return;
				}
				this.confirmCancelTask = task;
			} else {
				if (
					(task.DetailStatus === 5 || task.DetailStatus === 23) &&
					task.Status !== 4
				) {
					return;
				}
				this.confirmCancelTask = Object.assign({}, task);
			}
			this.switchToggle.confirmCancelDownloadDialog = true;
		},
		getCancelGasFee() {
			const vm = this;
			this.cancelGasFee = "...";
			let paramUrl = "";
			this.$set(this.switchToggle, "cancelToggleError", false);
			this.$set(this.switchToggle, "cancelToggle", false);
			this.switchToggle.getGasNumber++;
			if (this.passwordCancel.File === null) {
				for (let file of this.fileList) {
					if (file.IsCache && file.FileHash) continue;
					paramUrl += `hash=${file.FileHash}&`;
				}
			} else {
				if (!this.passwordCancel.File.IsCache && this.passwordCancel.File.FileHash) {
					paramUrl += `hash=${this.passwordCancel.File.FileHash}&`;
				}
			}
			if (paramUrl === "") {
				this.switchToggle.getGasNumber--;
				if (this.switchToggle.getGasNumber !== 0) return;
				this.cancelGasFee = 0;
				this.$set(this.switchToggle, "cancelToggleError", false);
				this.$set(this.switchToggle, "cancelToggle", true);
				return;
			}
			let url = `${this.$api.dspFilesDeletefee}?${paramUrl.slice(0, -1)}`;
			this.$axios
				.get(url)
				.then(res => {
					this.switchToggle.getGasNumber--;
					if (this.switchToggle.getGasNumber !== 0) return;
					if (res.Error === 0 || res.Error === 54013) {
						this.cancelGasFee = res.Result.GasLimit;
						this.$set(this.switchToggle, "cancelToggleError", false);
					} else {
						this.$message.error(vm.$t("fileManager.getGasFeeFailed"));
						this.$set(this.switchToggle, "cancelToggleError", true);
					}
					this.$set(this.switchToggle, "cancelToggle", true);
				})
				.catch(e => {
					this.switchToggle.getGasNumber--;
					if (this.switchToggle.getGasNumber !== 0) return;
					this.$message.error(vm.$t("fileManager.getGasFeeFailed"));
					this.$set(this.switchToggle, "cancelToggleError", true);
					this.$set(this.switchToggle, "cancelToggle", true);
				});
		},
		toCancelCheck() {
			const vm = this;
			if (
				!this.switchToggle.cancelToggle ||
				this.switchToggle.cancelToggleError
			)
				return;
			let balanceLists = this.$store.state.Wallet.balanceLists;
			let currentBalanceFormat = 0;
			if (!this.balanceLists) {
				currentBalanceFormat = 0;
			} else {
				for (let value of balanceLists) {
					if (value.Symbol === "SAVE") {
						currentBalanceFormat = value.BalanceFormat;
					}
				}
			}
			if ((this.cancelGasFee * 500) / Math.pow(10, 9) > currentBalanceFormat) {
				this.$message.error(vm.$t("public.insufficientBalanceAvailable"));
				return;
			}
			this.$refs["passwordCancel"].validate(valid => {
				if (!valid) return;
				vm.toCancel();
			});
		},
		// cancel task
		toCancel() {
			// add loading
			const vm = this;
			this.passwordCancel.loadingObj = this.$loading({
				target: ".password-cancel-dialog.loading-content",
				text: vm.$t("fileManager.loading"),
				lock: true
			});
			if (this.passwordCancel.File === null) {
				// cancel all when File is null
				this.cancelAll();
			} else {
				// cancel task when file is object
				this.uploadOrDownloadCancel(this.passwordCancel.File);
			}
		},
		// upload file open cancel task dialog to input password
		openPassword(file = null) {
			const vm = this;
			if (file && file.DetailStatus === -1) {
				let newWaitForUploadList = this.WaitForUploadList.filter(value => {
					return value.Id !== file.Id;
				});
				this.$store.commit("SET_WAIT_FOR_UPLOAD_LIST", newWaitForUploadList);
				ipcRenderer.send("run-dialog-event", {
					name: "setWaitForUploadList",
					data: newWaitForUploadList
				});
				return;
			}

			if (
				file != null &&
				(file.DetailStatus === 5 || file.DetailStatus === 23) &&
				file.Status !== 4
			) {
				// this.$message({
				// 	message: vm.$t('fileManager.thereAreNoTasksToCancel')
				// });
				return;
			}
			if (this.uploadLength === 0) {
				this.$message({
					message: vm.$t("fileManager.thereAreNoTasksToCancel"),
					type: "warning"
				});
				return;
			}

			this.switchToggle.passwordDialog = true;
			this.$nextTick(() => {
				this.$refs.passwordCancel.resetFields();
				this.passwordCancel.File = file;
				this.getCancelGasFee();
			});
		},
		// close upload file detail dialog callback
		toCloseUploadFileDetail() {
			this.uploadDetailHash = "";
			this.uploadDetailNodes = [];
		},
		// open detail dialog
		openDetailDialog(row) {
			if (this.transferType === 0) {
				if (row.IsUploadAction) {
					this.uploadDetailHash = row.FileHash;
					this.uploadDetailNodes = row.Nodes || [];
				} else {
					this.detailObj = null;
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
			const vm = this;
			const type = this.transferType;
			const arr = this.getTask(type, 0, 1, 2, 3, 4, 6);
			if (arr.length === 0) {
				this.$message({
					message: vm.$t("fileManager.thereAreNoTasksToCancel"),
					type: "warning"
				});
				if(type === 1) {
					this.passwordCancel.loadingObj &&
						this.passwordCancel.loadingObj.close();
				} else {
					this.switchToggle.confirmCancelDownloadDialogLoading &&
						this.switchToggle.confirmCancelDownloadDialogLoading.close();
				}
				return;
			}
			this.uploadOrDownloadCancel(arr);
		},
		toContinueAll() {
			const vm = this;
			const type = this.transferType;
			let flag = false;
			//get pause task to continue
			const arr = this.getTask(type, 0);
			if (arr.length > 0) {
				flag = true;
				this.uploadOrDownloadContinue(arr);
			}
			const arr2 = this.getTask(type, 4);
			//get error task to again
			if (arr2.length > 0) {
				flag = true;
				this.uploadOrDownloadAgain(arr2);
			}
			//if no task message
			if (!flag) {
				this.$message({
					message: vm.$t("fileManager.thereAreNoTasksToStart"),
					type: "warning"
				});
			}
		},
		// continue all task
		continueAll() {
			const vm = this;
			if (this.isSync && this.transferType === 2) {
				this.$confirm(
					vm.$t("public.blockUnsynchronizedCompletionAreYouSureToDoThis"),
					vm.$t("public.notice"),
					{
						confirmButtonText: vm.$t("public.confirm"),
						cancelButtonText: vm.$t("public.cancel")
					}
				)
					.then(() => {
						this.toContinueAll();
					})
					.catch(e => {});
			} else {
				this.toContinueAll();
			}
		},
		// pause all task
		pauseAll() {
			const vm = this;
			const type = this.transferType;
			const arr = this.getTask(type, 1, 2, 6);
			if (arr.length === 0) {
				this.$message({
					message: vm.$t("fileManager.thereAreNoTasksToPause"),
					type: "warning"
				});
				return;
			}
			this.uploadOrDownloadPause(arr);
		},
		// delete complete all task record
		deleteAll() {
			const vm = this;
			const type = this.transferType;
			const arr = this.getTask(type, 3);
			if (arr.length === 0) {
				this.$message({
					message: vm.$t("fileManager.thereAreNoRecordToDelete"),
					type: "warning"
				});
				return;
			}
			this.$confirm(
				vm.$t("fileManager.areYouSureToDeleteAllRecords"),
				vm.$t("fileManager.deleteAll"),
				{
					confirmButtonText: vm.$t("public.confirm"),
					cancelButtonText: vm.$t("public.cancel")
				}
			)
				.then(() => {
					this.deleteRecord(arr);
				})
				.catch(e => {});
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
				if (
					(item.DetailStatus === 5 || item.DetailStatus === 23) &&
					item.Status !== 4 && item.Status !== 0
				) {
					return false;
				}
				return true;
			});
			return filterArr;
		},
		// delete complete record!!!!!
		deleteRecord(row) {
			const vm = this;
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
			const haveHttpWaitFor = this.addHttpWaitFor({
				row: row,
				waitFor: this.$t("fileManager.deleteRecord")
			});
			if (!haveHttpWaitFor) return;

			this.$axios
				.post(this.$api.deleteRecord, params, {
					timeout: (this.$config.outTime * 2000 + 18000) * params.Ids.length
				})
				.then(res => {
					// this.$store.dispatch("getComplete");
					ipcRenderer.send("run-dialog-event", { name: "getComplete" });
					this.removeHttpWaitFor({ Ids: params.Ids });

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
								message: vm.$t("fileManager.opeationSuccess"),
								type: "success"
							});
						}
					} else {
						this.$message.error(this.$t(`error["${res.Error}"]`));
					}
				})
				.catch(e => {
					this.removeHttpWaitFor({ Ids: params.Ids });
					if (!e.message.includes("timeout")) {
						this.$message.error(
							vm.$t("fileManager.networkErrorDeleteRecordFailed")
						);
					} else {
						this.$message.error("Request Timeout!");
					}
				});
		},
		isArray(arg) {
			return Object.prototype.toString.call(arg) === "[object Array]";
		},
		// array difference set
		diffSet(ary1, ary2) {
			let unionSet = [...new Set([...ary1, ...ary2])];
			let crossSet = ary1.filter(item => {
				return ary2.includes(item);
			});
			return unionSet.filter(item => {
				return !crossSet.includes(item);
			});
		},
		/**
		 * params
		 * row: transfer item or list
		 * type: 0:upload    1:download
		 */
		async uploadOrDownloadCancel(row) {
			const vm = this;
			let type = this.transferType;
			// get http url
			let url = type === 1 ? this.$api.uploadCancel : this.$api.downloadCancel;

			// get params
			let isArray = this.isArray(row);
			let params;
			let arr = []; // uploading file
			let waitForUploadArr = []; // wait for upload file, data at front
			let waitForDownloadArr = []; // wait for download file, data at front
			if (isArray) {
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

			// get cancel task again when cancel type is upload
			if (type === 1) {
				params.Password = crypto
					.createHash("sha256")
					.update(vm.passwordCancel.Password)
					.digest("hex");
				for (let value of this.waitForUploadList) {
					if (params.Ids.indexOf(value.Id) >= 0) {
						waitForUploadArr.push(value.Id);
					}
				}
				params.Ids = this.diffSet(params.Ids, waitForUploadArr);
				params.GasLimit = this.cancelGasFee.toString();

				// is have wait for upload file
				if (waitForUploadArr.length > 0) {
					// check password is not true
					let passParams = {
						Password: params.Password
					};
					let passwordCheck = await this.$axios.post(
						this.$api.checkPassword,
						passParams
					);
					if (passwordCheck.Error !== 0) {
						this.passwordCancel.loadingObj &&
							this.passwordCancel.loadingObj.close();
						this.$message.error(vm.$t("fileManager.passwordCheckFailed"));
						return;
					}
					// pass password check wait for to delete wait for upload file
					let newWaitForUploadList =
						this.waitForUploadList.filter(value => {
							if(waitForUploadArr.indexOf(value.Id) === -1) {
								return true;
							} else {
								return false;
							}
							return ;
						}) || [];
					this.$store.commit("SET_WAIT_FOR_UPLOAD_LIST", newWaitForUploadList);
					this.$store.commit("REMOVE_WAIT_FOR_UPLOAD_ORDER_LIST", waitForUploadArr);
					ipcRenderer.send("run-dialog-event", {
						name: "removeReadyUpload",
						data: arr
					});
					ipcRenderer.send("run-dialog-event", {
						name: "setWaitForUploadList",
						data: newWaitForUploadList
					});
				}
				// check is have uploading task
				if (!params.Ids || params.Ids.length === 0) {
					this.passwordCancel.loadingObj &&
						this.passwordCancel.loadingObj.close();
					this.switchToggle.passwordDialog = false;
					return;
				}
			} else {
				for (let value of this.waitForDownloadList) {
					if (params.Ids.indexOf(value.Id) >= 0) {
						waitForDownloadArr.push(value.Id);
					}
				}
				params.Ids = this.diffSet(params.Ids, waitForDownloadArr);
				// is have wait for download file
				if (waitForDownloadArr.length > 0) {
					// wait for to delete wait for download file
					let newWaitForDownloadList =
						this.waitForDownloadList.filter(value => {
							return waitForDownloadArr.indexOf(value.Id) === -1
						}) || [];
					this.$store.commit(
						"SET_WAIT_FOR_DOWNLOAD_LIST",
						newWaitForDownloadList
					);
					this.$store.commit("REMOVE_WAIT_FOR_DOWNLOAD_ORDER_LIST", waitForUploadArr);
					ipcRenderer.send("run-dialog-event", {
						name: "removeReadyDownload",
						data: arr
					});
					ipcRenderer.send("run-dialog-event", {
						name: "setWaitForDownloadList",
						data: newWaitForDownloadList
					});
				}
				// check is have downloading task
				if (!params.Ids || params.Ids.length === 0) {
					this.switchToggle.confirmCancelDownloadDialogLoading &&
						this.switchToggle.confirmCancelDownloadDialogLoading.close();
					this.switchToggle.confirmCancelDownloadDialog = false;
					return;
				}
			}

			// add password when current mode is upload
			this.$axios
				.post(url, params, {
					timeout: (this.$config.outTime * 2000 + 18000) * params.Ids.length
				})
				.then(res => {
					if(type === 1) {
						this.passwordCancel.loadingObj &&
							this.passwordCancel.loadingObj.close();
					} else {
						this.switchToggle.confirmCancelDownloadDialogLoading &&
							this.switchToggle.confirmCancelDownloadDialogLoading.close();
					}
					
					// get transfer list info update status
					if (type === 1) {
						ipcRenderer.send("run-dialog-event", { name: "getUpload" });
						ipcRenderer.send("run-dialog-event", {
							name: "removeWaitForUploadOrderList",
							data: params.Ids
						});
					} else {
						ipcRenderer.send("run-dialog-event", { name: "getDownload" });
						ipcRenderer.send("run-dialog-event", {
							name: "removeWaitForDownloadOrderList",
							data: params.Ids
						});
					}
					ipcRenderer.send("run-dialog-event", {
						name: "removePausing",
						data: params.Ids
					});
					ipcRenderer.send("run-dialog-event", {
						name: "removeUploading",
						data: params.Ids
					});

					if (res.Error === 0) {
						if (type === 1) {
							this.switchToggle.passwordDialog = false;
						} else {
							this.switchToggle.confirmCancelDownloadDialog = false;
						}
						//get error list
						let errorNumber = 0;

						for (let value of res.Result.Tasks) {
							if (value && value.Code) {
								errorNumber++;
							}
						}

						//if no err
						if (errorNumber === 0) {
							this.$message({
								message: vm.$t("fileManager.opeationSuccess"),
								type: "success"
							});
						} else {
							this.$message.error(
								`${this.$t("fileManager.thereAre")}${errorNumber}${this.$t(
									"fileManager.cancelTaskFailed"
								)}`
							);
						}
					} else {
						this.$message.error(this.$t(`error["${res.Error}"]`));
					}
				})
				.catch(e => {
					if (type === 1) {
						this.passwordCancel.loadingObj &&
							this.passwordCancel.loadingObj.close();
					} else {
						this.switchToggle.confirmCancelDownloadDialogLoading &&
							this.switchToggle.confirmCancelDownloadDialogLoading.close();
					}
					if (!e.message.includes("timeout")) {
						this.$message.error(
							vm.$t("fileManager.networkErrorCancelTaskFailed")
						);
					} else {
						this.$message.error("Request Timeout!");
					}
				});
		},
		toUploadOrDownloadAgain(row) {
			const vm = this;
			let type = this.transferType;
			if (this.isSync && type === 2) {
				this.$confirm(
					vm.$t("public.blockUnsynchronizedCompletionAreYouSureToDoThis"),
					vm.$t("public.notice"),
					{
						confirmButtonText: vm.$t("public.confirm"),
						cancelButtonText: vm.$t("public.cancel")
					}
				)
					.then(() => {
						this.uploadOrDownloadAgain(row);
					})
					.catch(e => {});
			} else {
				this.uploadOrDownloadAgain(row);
			}
		},
		/**
		 * params
		 * row: transfer item or list
		 * type: 0:upload    1:download
		 */
		uploadOrDownloadAgain(row) {
			let type = this.transferType;
			// get http url
			let url = type === 1 ? this.$api.uploadRetry : this.$api.downloadRetry;
			// get params
			let params;
			let arr = [];
			for (let value of row) {
				arr.push(value.Id);
			}
			params = {
				Ids: arr
			};

			if (type === 1) {
				ipcRenderer.send("run-dialog-event", {
					name: "pushWaitForUploadOrderList",
					data: params.Ids
				});
				ipcRenderer.send("run-dialog-event", {
					name: "addUploading",
					data: params.Ids
				});
				return;
			} else {
				ipcRenderer.send("run-dialog-event", {
					name: "pushWaitForDownloadOrderList",
					data: params.Ids
				});
				ipcRenderer.send("run-dialog-event", {
					name: "addUploading",
					data: params.Ids
				});
				return;
			}
		},
		toUploadOrDownloadContinue(row) {
			let type = this.transferType;
			if (this.isSync && type === 2) {
				this.$confirm(
					vm.$t("public.blockUnsynchronizedCompletionAreYouSureToDoThis"),
					vm.$t("public.notice"),
					{
						confirmButtonText: vm.$t("public.confirm"),
						cancelButtonText: vm.$t("public.cancel")
					}
				)
					.then(() => {
						this.uploadOrDownloadContinue(row);
					})
					.catch(e => {});
			} else {
				this.uploadOrDownloadContinue(row);
			}
		},
		/**
		 * params
		 * row: transfer item or list
		 * type: 0:upload    1:download
		 */
		uploadOrDownloadContinue(row) {
			const vm = this;
			let type = this.transferType;
			let url = type === 1 ? this.$api.uploadResume : this.$api.downloadResume;
			let params = this.getParams(row, 2);
			if (!params.Ids || params.Ids.length <= 0) {
				return;
			}

			if (type === 1) {
				ipcRenderer.send("run-dialog-event", {
					name: "pushWaitForUploadOrderList",
					data: params.Ids
				});
				ipcRenderer.send("run-dialog-event", {
					name: "addUploading",
					data: params.Ids
				});
				return;
			} else {
				ipcRenderer.send("run-dialog-event", {
					name: "pushWaitForDownloadOrderList",
					data: params.Ids
				});
				ipcRenderer.send("run-dialog-event", {
					name: "addUploading",
					data: params.Ids
				});
				// return;
			}

			let thirdPartyArr = [];
			// add wait for task and get have wait for task
			let httpWaitForList = row.filter(item => {
				if (
					params.Ids.indexOf(item.Id) >= 0 &&
					item.Url.startsWith("oni://www")
				) {
					thirdPartyArr.push(item.Id);
					return true;
				} else {
					return false;
				}
			});
			const haveHttpWaitFor = this.addHttpWaitFor({
				row: httpWaitForList,
				waitFor: "start"
			});
			if (thirdPartyArr.length === 0) return;
			params.Ids = thirdPartyArr;

			this.$axios
				.post(url, params, {
					timeout: (this.$config.outTime * 2000 + 18000) * params.Ids.length
				})
				.then(res => {
					// get transfer list info update status
					if (type === 1) {
						ipcRenderer.send("run-dialog-event", { name: "getUpload" });
					} else {
						ipcRenderer.send("run-dialog-event", { name: "getDownload" });
					}
					// remove wait for task
					this.removeHttpWaitFor({ Ids: params.Ids });

					if (res.Error === 0) {
					} else {
						this.$message.error(this.$t(`error["${res.Error}"]`));
					}
				})
				.catch(e => {
					this.removeHttpWaitFor({ Ids: params.Ids });
					if (!e.message.includes("timeout")) {
						this.$message.error(
							vm.$t("fileManager.networkErrorStartTaskFailed")
						);
					}
				});
		},
		/**
		 * add wait for task
		 * params
		 * row: transfer item or list
		 */
		addHttpWaitFor({ row, waitFor }) {
			let isArray = this.isArray(row);
			let arr = row;
			let falg = false; // have task wait for
			if (!isArray) {
				arr = [row];
			}
			for (let item of arr) {
				if (!this.httpWaitForing[item.Id]) {
					this.$set(this.httpWaitForing, item.Id, {
						Status: item.Status,
						waitFor: waitFor
					});
					falg = true;
				}
			}
			this.$forceUpdate();
			return falg;
		},
		removeHttpWaitFor({ Ids }) {
			for (let Id of Ids) {
				if (this.httpWaitForing[Id]) {
					delete this.httpWaitForing[Id];
					this.$delete(this.httpWaitForing, Id);
				}
			}
		},
		// get params and change wait for list status(pause、start)
		getParams(row, status) {
			// get params
			const vm = this;
			let isArray = this.isArray(row);
			let params = {
				Ids: []
			};
			let haveWaitForFlag = false;
			let arr = [];
			let waitForArr = [];
			for (let value of row) {
				if (value.IsCache) {
					waitForArr.push(value.Id);
					haveWaitForFlag = true;
					continue;
				} else if (
					(value.DetailStatus === 5 || value.DetailStatus === 23) &&
					value.Status !== 4 &&
					value.Status !== 0
				) {
					continue;
				}

				arr.push(value.Id);
			}

			params.Ids = arr;
			if (haveWaitForFlag) {
				if (vm.transferType === 1) {
					let newWaitForList = JSON.parse(
						JSON.stringify(this.waitForUploadList)
					);
					newWaitForList.map(item => {
						if (waitForArr.indexOf(item.Id) >= 0) {
							item.Status = status;
						}
						return item;
					});
					this.$store.commit("SET_WAIT_FOR_UPLOAD_LIST", newWaitForList);
					ipcRenderer.send("run-dialog-event", {
						name: "setWaitForUploadList",
						data: newWaitForList
					});

					if (status === 2) {
						ipcRenderer.send("run-dialog-event", {
							name: "pushWaitForUploadOrderList",
							data: waitForArr
						});
					} else {
						ipcRenderer.send("run-dialog-event", {
							name: "removeWaitForUploadOrderList",
							data: waitForArr
						});
						ipcRenderer.send("run-dialog-event", {
							name: "removeUploading",
							data: waitForArr
						});
					}
				} else {
					let newWaitForList = JSON.parse(
						JSON.stringify(this.waitForDownloadList)
					);
					newWaitForList.map(item => {
						if (waitForArr.indexOf(item.Id) >= 0) {
							item.Status = status;
						}
						return item;
					});
					this.$store.commit("SET_WAIT_FOR_DOWNLOAD_LIST", newWaitForList);
					ipcRenderer.send("run-dialog-event", {
						name: "setWaitForDownloadList",
						data: newWaitForList
					});

					if (status === 2) {
						ipcRenderer.send("run-dialog-event", {
							name: "pushWaitForDownloadOrderList",
							data: waitForArr
						});
					} else {
						ipcRenderer.send("run-dialog-event", {
							name: "removeWaitForDownloadOrderList",
							data: waitForArr
						});
						ipcRenderer.send("run-dialog-event", {
							name: "removeUploading",
							data: waitForArr
						});
					}
				}
			}
			return params;
		},
		/**
		 * params
		 * row: transfer item or list
		 * type: 0:upload    1:download
		 */
		uploadOrDownloadPause(row) {
			const vm = this;
			let type = this.transferType;
			// get http url
			let url = type === 1 ? this.$api.uploadPause : this.$api.downloadPause;
			let params = this.getParams(row, 0);
			if (!params.Ids || params.Ids.length <= 0) {
				return;
			}

			if (type === 1) {
				ipcRenderer.send("run-dialog-event", {
					name: "removeWaitForUploadOrderList",
					data: params.Ids
				});
			} else {
				ipcRenderer.send("run-dialog-event", {
					name: "removeWaitForDownloadOrderList",
					data: params.Ids
				});
			}
			ipcRenderer.send("run-dialog-event", {
				name: "addPausing",
				data: params.Ids
			});
			ipcRenderer.send("run-dialog-event", {
				name: "removeUploading",
				data: params.Ids
			});

			// add wait for task and get have wait for task
			let httpWaitForList = row.filter(item => {
				return params.Ids.indexOf(item.Id) >= 0;
			});
			const haveHttpWaitFor = this.addHttpWaitFor({
				row: httpWaitForList,
				waitFor: "pause"
			});
			if (!haveHttpWaitFor) return;

			this.$axios
				.post(url, params, {
					timeout: (this.$config.outTime * 2000 + 18000) * params.Ids.length
				})
				.then(res => {
					// get transfer list info update status
					if (type === 1) {
						ipcRenderer.send("run-dialog-event", { name: "getUpload" });
					} else {
						ipcRenderer.send("run-dialog-event", { name: "getDownload" });
					}
					// remove wait for task
					this.removeHttpWaitFor({ Ids: params.Ids });
					if (res.Error === 0) {
						//get error list
						let notLocalList = [];
						for (let value of res.Result.Tasks) {
							if (value && value.State !== 4) {
								notLocalList.push(value.Id);
							}
						}
						ipcRenderer.send("run-dialog-event", {
							name: "removePausing",
							data: notLocalList
						});
					} else {
						this.$message.error(this.$t(`error["${res.Error}"]`));
					}
				})
				.catch(e => {
					this.removeHttpWaitFor({ Ids: params.Ids });
					if (!e.message.includes("timeout")) {
						this.$message.error(
							vm.$t("fileManager.networkErrorPauseTaskFailed")
						);
					} else {
						this.$message.error("Request Timeout!");
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
			const vm = this;
			this.switchToggle.deleteDialog = false;
			this.$axios
				.post(this.$api.delete, { Hash: hash })
				.then(res => {
					if (res.Error === 0) {
						this.$message({
							message: vm.$t("fileManager.deleteCompleted"),
							type: "success"
						});
					} else {
						this.$message.error(this.$t(`error["${res.Error}"]`));
					}
				})
				.catch(e => {
					if (!e.message.includes("timeout")) {
						this.$message.error(
							vm.$t("fileManager.networkErrorDeleteFileFailed")
						);
					} else {
						this.$message.error("Request Timeout!");
					}
				});
		},
		toDecrypt() {
			const vm = this;
			if (this.switchToggle.loading) return;
			this.$axios
				.post(this.$api.decrypt, this.fileSelected, {
					loading: {
						text: vm.$t("public.processing"),
						target: ".loading-content.decrypt"
					}
				})
				.then(res => {
					if (res.Error === 0) {
						this.$message({
							message: vm.$t("fileManager.decryptionSuccess"),
							type: "success"
						});
						this.fileList.Password = "";
						this.fileList.Path = "";
						this.switchToggle.decryptDialog = false;
					} else {
						this.$message.error(this.$t(`error["${res.Error}"]`));
					}
				})
				.catch(e => {
					if (!e.message.includes("timeout")) {
						this.$message.error(vm.$t("fileManager.networkErrorDecryptFailed"));
					} else {
						this.$message.error("Request Timeout!");
					}
				});
		},
		getTaskSpeed() {
			let oldTaskSpeed = this.taskSpeed;
			let newTaskSpeed = {};
			this.taskSpeedNum = this.taskSpeedNum + 3;
			for (let value of this.fileList) {
				let uploadOrDownloadSize = value.UploadSize || value.DownloadSize;
				let speed =
					uploadOrDownloadSize -
					(oldTaskSpeed[value.Id]
						? oldTaskSpeed[value.Id].FileSize
						: uploadOrDownloadSize);
				if (newTaskSpeed[value.Id]) continue;
				newTaskSpeed[value.Id] = {
					speed: speed / 3,
					FileSize: uploadOrDownloadSize
				};
			}
			this.taskSpeed = newTaskSpeed;
		},
		// getTaskSpeed() {
		// 	let oldTaskSpeed = this.taskSpeed;
		// 	let newTaskSpeed = {};
		// 	this.taskSpeedNum = this.taskSpeedNum + 3;
		// 	if (this.taskSpeedNum !== 3) {
		// 		this.passHowLongTimeGetFileList = this.taskSpeedNum;
		// 		return;
		// 	}
		// 	for (let value of this.fileList) {
		// 		let uploadOrDownloadSize = value.UploadSize || value.DownloadSize;
		// 		let speed =
		// 			uploadOrDownloadSize -
		// 			(oldTaskSpeed[value.Id]
		// 				? oldTaskSpeed[value.Id].FileSize
		// 				: uploadOrDownloadSize);
		// 		if (newTaskSpeed[value.Id]) continue;
		// 		newTaskSpeed[value.Id] = {
		// 			speed: speed / (this.passHowLongTimeGetFileList + 3),
		// 			FileSize: uploadOrDownloadSize
		// 		};
		// 	}
		// 	// this.passHowLongTimeGetFileList = this.passHowLongTimeGetFileList + 3;
		// 	this.passHowLongTimeGetFileList = 3;
		// 	this.taskSpeed = newTaskSpeed;
		// },
		/**
		 * params
		 * isF: is not force run
		 *  */
		getNodeSpeed(isF = false) {
			if (this.transferType === 1) return;
			let oldNodeSpeed = this.nodeSpeed;
			let newNodeSpeed = {};
			for (let value of this.fileDetailNodes) {
				let uploadOrDownloadSize = value.UploadSize || value.DownloadSize;
				let speed =
					oldNodeSpeed[value.HostAddr] !== undefined
						? uploadOrDownloadSize -
						  (oldNodeSpeed[value.HostAddr].FileSize || 0)
						: 0;
				newNodeSpeed[value.HostAddr] = {
					speed: speed / 3,
					FileSize: uploadOrDownloadSize
				};
			}
			this.nodeSpeed = newNodeSpeed;
			// }
		}
		// getNodeSpeed(isF = false) {
		// 	if (this.transferType === 1) return;
		// 	if ((this.fileDetailNodes.length > 0 && this.taskSpeedNum === 1) || isF) {
		// 		let oldNodeSpeed = this.nodeSpeed;
		// 		let newNodeSpeed = {};
		// 		for (let value of this.fileDetailNodes) {
		// 			let uploadOrDownloadSize = value.UploadSize || value.DownloadSize;
		// 			let speed =
		// 				oldNodeSpeed[value.HostAddr] !== undefined
		// 					? uploadOrDownloadSize -
		// 					  (oldNodeSpeed[value.HostAddr].FileSize || 0)
		// 					: 0;
		// 			newNodeSpeed[value.HostAddr] = {
		// 				speed: speed / this.passHowLongTimeGetFileList,
		// 				FileSize: uploadOrDownloadSize
		// 			};
		// 		}
		// 		this.nodeSpeed = newNodeSpeed;
		// 	}
		// }
	},
	mounted() {
		// const INTERVAL_TIME = 1000;
		const INTERVAL_TIME = 3000;
		clearInterval(this.speedIntervalObj);
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
$brand-blue: #409eff;
$light-blue: #65a6ff;
$sucess: #67c23a;
$danger: #f56c6c;
.file-component {
	height: 100%;
	display: flex;
	flex-direction: column;
	.el-progress-bar__inner {
		transition: width 1s linear;
	}
	.el-progress__text {
		display: inline-block !important;
	}
	.top-progress {
		display: flex;
		height: 140px;
		padding: 0 20px;
		align-items: center;
		.progress {
			flex: 1;
			.el-progress-bar__inner {
				transition: width 0.2s linear;
			}
		}
		.batch-button {
			position: relative;
			top: 5px;
			margin-left: 5px;
		}
		&.is-not-compelete-top-progress {
			height: 140px;
		}
	}
	.file-list {
		height: calc(100% - 80px);
		@include themify {
			border-top: $table-border-color;
		}
		&.is-not-compelete-top-progress {
			height: calc(100% - 140px);
		}
		.el-table {
			font-weight: bold;
			thead th {
				background: #f9f9fb;
			}
			.download-type {
				vertical-align: top;
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
			@include themify {
				background-color: $color;
			}
		}

		&:active {
			opacity: 0.7;
		}
	}
	.speed-content {
		width: 150px;
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
						font-size: 1.4rem;
					}
				}
			}
			li {
				// margin: 15px 0;
				padding: 15px 0;
				border-bottom: 1px solid rgba(0, 0, 0, 0.1);
				.node-name {
					width: 140px;
					font-size: 1.4rem;
					height: 100%;
				}
				.node-value {
					text-align: left;
					width: calc(100% - 140px);
					@extend .grey-color;
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
					@extend .grey-color
				}
				.node-content-third {
					width: 129px;
					text-align: right;
					@extend .grey-color
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

	.cancel-dialog-gas-fee {
		width: 200px;
		position: absolute;
		bottom: 50px;
		right: 30px;
		text-align: right;
		// float: right;
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
			font-size: 1.4rem;
			width: 160px;
			padding-right: 30px;
			text-align: right;
		}
		.adjust-info {
			flex: 1;
			width: 200px;
			display: flex;
			text-align: left;
			@extend .grey-color;

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
