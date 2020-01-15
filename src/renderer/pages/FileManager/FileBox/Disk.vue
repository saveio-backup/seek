<template>
	<div id="disk">
		<div
			class="func-nav"
			v-if="controlBar !== 'close'"
		>
			<div class="fun-button">

				<!-- <router-link :to="{name:'upload'}"> -->
				<ripper-button
					class="primary "
					@click="goUpload"
				>{{$t('fileManager.uploadButton')}}</ripper-button>

				<!-- </router-link> -->
				<ripper-button
					class="ml10 bt-download "
					@click="batchDownload"
				>
					{{$t('fileManager.downloadButton')}}
				</ripper-button>
				<ripper-button
					class="ml10 bt-download "
					@click="batchDelete"
				>
					{{$t('fileManager.deleteButton')}}
				</ripper-button>
			</div>
			<div class="fun-search">
				<el-input
					v-model="filterInput"
					prefix-icon="el-icon-search"
					:placeholder="$t('fileManager.searchByName')"
					class="grey-theme-at-grey"
				></el-input>
			</div>
		</div>
		<div
			class="func-nav"
			v-else
		>
			<p class='light-theme-title user-no-select'>
				{{$t('fileManager.minerControl')}}
			</p>
			<div class="fun-search">
				<el-input
					v-model="filterInput"
					prefix-icon="el-icon-search"
					:placeholder="$t('fileManager.searchByName')"
					class="grey-theme-at-grey"
				></el-input>
			</div>
		</div>
		<div class="content">
			<div class="table-element">
				<!-- border -->
				<el-table
					ref='table'
					:data="filterListData"
					:empty-text="$t('public.noData')"
					@row-click="clickRow"
					height="100%"
					row-key="Hash"
					@selection-change="selectFile"
					@select="toSelectFile"
					@select-all="selectAll"
				>
					<!-- :data="mockData" -->
					<el-table-column
						v-if="toggleFilebox"
						type="selection"
						:reserve-selection="true"
						width="30"
					></el-table-column>
					<el-table-column
						:label="$t('fileManager.fileName')"
						class=""
						class-name="rowName primary-font-color"
						prop="Name"
						sortable
						min-width="150"
					>
						<template slot-scope="scope">
							<div class="flex between">

								<span
									class="row-name flex ai-center"
									:class="scope.row.Undone ? 'grey-color':''"
								>{{ scope.row.Name }}
									<span
										v-if="syncProcess(scope.row.Hash) > -1"
										class="sync-process cursor-pointer"
										@click.stop="openDetailDialogProcess(scope.row)"
										:title="$t('fileManager.fileDistribution')"
									>
										<circle-progress
											:percentage="syncProcess(scope.row.Hash)"
											:color="syncColor(scope.row.Hash)"
											:width="20"
										></circle-progress>
									</span>
								</span>
								<!-- @click="executedFile = scope.row" -->
								<div
									class="opera"
									v-if="!scope.row.Undone"
								>
									<span
										@click.stop="shareFile(scope.row)"
										:title="$t('fileManager.share')"
										v-if="scope.row.Privilege != 0"
										class="active-blue cursor-pointer"
									>
										<i class="el-icon-share ftpx18"></i>
									</span>
									<span
										v-if="page === 'filebox'"
										class="active-blue cursor-pointer"
										:title="$t('fileManager.download')"
										@click.stop="downloadFile(scope.row)"
									>
										<i class="el-icon-download ftpx18"></i>
									</span>
									<span
										v-if="page === 'filebox'"
										:title="$t('fileManager.delete')"
										@click.stop="deleteFile(scope.row)"
										class="active-blue cursor-pointer"
									>
										<i class="el-icon-delete ftpx18"></i>
									</span>
									<span
										@click.stop="showInFolder(scope.row.Path)"
										v-if="page === 'miner' && scope.row.Path"
										:title="$t('fileManager.openFolder')"
										class="active-blue cursor-pointer"
									>
										<i class="ofont ofont-wenjianxiangqing ftpx14"></i>
									</span>
									<span
										v-if="page === 'filebox'"
										:title="$t('fileManager.fileDistribution')"
										@click.stop="openDetailDialog(scope.row)"
										class="active-blue cursor-pointer"
									>
										<i class="ofont-xiangqing ofont ftpx16">
										</i>
									</span>
									<!-- @click.stop="switchToggle.deleteDialog = true" -->
								</div>
							</div>
						</template>
					</el-table-column>
					<el-table-column
						:label="$t('fileManager.model')"
						width="100"
						v-if="page === 'filebox'"
						prop="StoreTypeNum"
						sortable
					>
						<template slot-scope="scope">
							<div
								class="ftpx14"
								:class="scope.row.Undone?'grey-color':''"
							>
								{{scope.row.StoreType === 1 ? $t('fileManager.advance') : scope.row.StoreType === 0 ? $t('fileManager.primary') : ''}}
							</div>
						</template>
					</el-table-column>
					<el-table-column
						:label="$t('fileManager.owner')"
						v-if="page ==='miner'"
						min-width="120"
						prop="OwnerAddress"
						sortable
					>
						<template slot-scope="scope">
							<span class="">{{scope.row.OwnerAddress || $t('fileManager.nameless')}}</span>
						</template>
					</el-table-column>
					<!-- api return 'KB' unit -->
					<el-table-column
						:label="$t('fileManager.size')"
						column-key="RealFileSize"
						min-width="70"
						prop="RealFileSize"
						sortable
					>
						<template slot-scope="scope">
							<span
								class=" break-word"
								:class="scope.row.Undone?'grey-color':''"
							>
								{{util.bytesToSize(scope.row.RealFileSize * 1024)}}
							</span>
						</template>
					</el-table-column>
					<el-table-column
						v-if="true"
						:label="$t('fileManager.date')"
						width="170"
						:prop="page ==='filebox'?'UpdatedAt':'DownloadAt'"
						sortable
					>
						<template slot-scope="scope">
							<div
								class=" break-word"
								:class="scope.row.Undone?'grey-color':''"
							>
								{{scope.row.Status === -1 ? '' : date.formatTime(new Date( (scope.row.DownloadAt||scope.row.UpdatedAt) * 1000))}}
							</div>
						</template>
					</el-table-column>
					<el-table-column
						v-if="page ==='miner'"
						:label="$t('fileManager.profit')"
						min-width="70"
						prop="Profit"
						sortable
					>
						<template slot-scope="scope">
							<div class="light-blue break-word">
								{{parseFloat(scope.row.Profit / 1000000000).toFixed(9)}} ONI
							</div>
						</template>
					</el-table-column>
					<el-table-column
						v-if="page ==='miner'"
						:label="$t('fileManager.contributions')"
						prop="DownloadCount"
						width="150"
						sortable
					>

					</el-table-column>
					<el-table-column
						:label="$t('fileManager.type')"
						v-if="page === 'filebox'"
						width="150"
						sortable
						prop="Privilege"
					>
						<template slot-scope="scope">
							<span class=" ftpx14">
								{{$t(`fileManager["${privilegeConfig[scope.row.Privilege]}"]`)}}
							</span>
						</template>
					</el-table-column>
					<div
						slot="append"
						v-show="switchToggle.showLoading"
						class="loading text-center transparent mt20 mb20"
					>
						<i class="ofont ofont-loading loading-rotate"></i>
					</div>
				</el-table>
			</div>
		</div>
		<el-dialog
			:close-on-click-modal='false'
			width='550px'
			:visible.sync="switchToggle.shareDialog"
			center
		>
			<div slot="title">
				<h2>{{$t('fileManager.share')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content">
				<p class="mt10 mb10 tl">{{$t('fileManager.fileName')}}<span class="ftpx14">: {{executedFile.Name}}</span></p>
				<el-form @submit.native.prevent>
					<el-form-item :label="$t('fileManager.link')+':'">
						<el-input
							readonly
							:value="executedFile.Url || executedFile.Hash"
							class="mb20 grey-theme icon-no-bg"
						>
							<template slot="append">
								<i
									class="el-icon-document addr_btn"
									@click="toClipboard(executedFile.Url || executedFile.Hash)"
									:aria-label='executedFile.Hash'
								></i>
							</template>
						</el-input>
					</el-form-item>
				</el-form>
				<div slot="footer">
					<!-- slot="footer" -->
					<ripper-button
						type="primer"
						class="primary"
						@click="switchToggle.shareDialog = false"
					>{{$t('public.close')}}</ripper-button>
				</div>
			</div>
		</el-dialog>
		<el-dialog
			:close-on-click-modal='false'
			width='550px'
			:visible.sync="switchToggle.confrimDownloadDialog"
			center
		>
			<div slot="title">
				<h2>{{$t('fileManager.downloadFile')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content disk-download-loading">
				<div class="adjust">
					<div class="adjust-item">
						<p class="adjust-title  ftpx14">{{$t('fileManager.fileName')}}</p>
						<div class="adjust-info">
							<p
								class="ftpx14 mr20"
								:title="fileDownloadInfo.allName"
							>{{fileDownloadInfo.Name}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title">{{$t('fileManager.fileSize')}}:</p>
						<div class="adjust-info">
							<p class="ftpx14 mr20">{{fileDownloadInfo.Size}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title">{{$t('fileManager.savePath')}}:</p>
						<div class="adjust-info">
							<p class="ftpx14 mr20">{{fileDownloadInfo.DownloadDir || ''}}</p>
						</div>
					</div>
					<div class="dialog-title-border"></div>
					<div class="adjust-item">
						<p class="adjust-title">{{$t('fileManager.cost')}}:</p>
						<div class="adjust-info">
							<p class="ftpx14 mr20">{{fileDownloadInfo.Fee ? fileDownloadInfo.Fee + ' ONI': ''}} </p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title">{{$t('fileManager.channelBalance')}}:</p>
						<div class="adjust-info">
							<p class="ftpx14 mr20">{{channelBind.BalanceFormat}} ONI</p>
						</div>
					</div>
				</div>
				<div slot="footer">
					<ripper-button @click="switchToggle.confrimDownloadDialog = false">{{$t('public.cancel')}}</ripper-button>
					<ripper-button
						class="primary ml10"
						@click="toDownload(fileToDownload)"
					>{{$t('fileManager.downloadButton')}}</ripper-button>
				</div>
			</div>
		</el-dialog>
		<!-- noStorageDialog -->
		<el-dialog
			width='600px'
			:close-on-click-modal="false"
			:visible.sync="switchToggle.noStorageDialog"
			center
		>
			<div slot="title">
				<h2>{{$t('public.notice')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content">
				<p class="mt10 mb10 ft14 tl break-word">{{$t('fileManager.onStorageNotice')}}</p>
				<p class="tr mt10 mb10">
					<el-checkbox
						@change="linkUpdateAllowRemind"
						v-model="linkRemindToggle.noAllowRemind"
					>{{$t('fileManager.noLongerRemindOnlyDoAdvancedUploads')}}</el-checkbox>
				</p>
				<div slot="footer">
					<ripper-button @click="goStorage">{{$t('fileManager.getStorage')}}</ripper-button>
					<ripper-button
						class="primary ml10"
						@click="goAdvanceUpload"
					>{{$t('fileManager.advanceUpload')}}</ripper-button>
				</div>
			</div>
		</el-dialog>
		<el-dialog
			:close-on-click-modal='false'
			width='600px'
			:visible.sync="switchToggle.deleteDialog"
			center
		>
			<div slot="title">
				<h2>{{$t('fileManager.deleteFile')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content disk-delete-loading ft14">
				<div class="delete-dialog-content tl">
					<p class="mt10 mb10">{{$t('fileManager.areYouSureYouWantTo')}} <span>{{$t('fileManager.delete2')}}</span> {{$t('fileManager.theSelectedFile')}}</p>
					<p
						class="mb20 dialog-file-delete-info"
						:title="fileDeleteInfo.allName"
					>{{fileDeleteInfo.Name}}</p>
					<!-- <p class="delete-dialog-gas-fee mb10">{{$t('fileManager.gasFee')}}: {{deleteGasFee}} {{deleteGasFee !== '' ? 'SAVE' : ''}}</p> -->
					<el-form
						ref="extraParamsForm"
						:model="extraParams"
						:rules="extraParamsRules"
						@submit.native.prevent
						class="mb20"
					>
						<el-form-item
							:label="$t('public.walletPassword')+':'"
							prop="Password"
						>
							<el-input
								type="password"
								class="grey-theme"
								:placeholder="$t('public.pleaseInputWalletPassword')"
								show-password
								@keyup.native.enter='toDeleteFileNew(fileToDelete)'
								v-model="extraParams.Password"
							></el-input>
						</el-form-item>
					</el-form>
				</div>
				<div slot="footer">
					<ripper-button @click="switchToggle.deleteDialog = false">{{$t('public.cancel')}}</ripper-button>
					<ripper-button
						type="danger"
						class="primary ml10"
						@click="toDeleteFileNew(fileToDelete)"
					>{{$t('fileManager.delete')}}</ripper-button>
				</div>
			</div>
		</el-dialog>
		<upload-file-detail-dialog
			@closeUploadFileDetail="toCloseUploadFileDetail"
			:hash="uploadDetailHash"
			:fileNodes="uploadDetailNodes"
			ref="uploadFileDetailDialog"
		></upload-file-detail-dialog>
	</div>
</template>
<script>
import date from "../../../assets/tool/date";
import util from "../../../assets/config/util";
import { clipboard, shell, ipcRenderer } from "electron";
import { effectiveNumber } from "../../../assets/config/util";
import fs from "fs";
import uploadFileDetailDialog from "./../../../components/UploadFileDetailDialog";
import circleProgress from "./../../../components/circleProgress";
import uuid from "node-uuid";
import crypto from "crypto";
let tableElement;
export default {
	data() {
		return {
			clipboard,
			effectiveNumber,
			toggleFilebox: false,
			date,
			util,
			deleteGasFee: '',
			fileDownloadInfo: {
				Fee: 0,
				Size: 0,
				Name: "",
				allName: ""
			},
			fileDeleteInfo: {
				Name: "",
				allName: ""
			},
			executedFile: {}, // a file be opera
			filterInput: "",
			uploadDetailHash: "",
			uploadDetailNodes: [],
			fileToDownload: [], // the file/files which chekbox or download button you click
			fileToDelete: [], // the file/files which chekbox  or delete button you click
			mockData: [
				{
					Hash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYwL",
					Path: "asdfsd/sdfaf",
					Name:
						"no1gasdfasdfasdfaweqwerwqerwfasdfadsfasdfasdfadsfasdfasdfasdfsafd111111.txt",
					Size: 153,
					DownloadCount: 0,
					ExpiredAt: 155505156,
					UpdatedAt: 0,
					DownloadAt: 0,
					Profit: 0,
					Privilege: 0,
					Url: "",
					StoreType: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Path: "sdfa/sdfsd/",
					Name: "no22222222.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 15551257,
					UpdatedAt: 1241241240,
					DownloadAt: 1241241240,
					Profit: 12534520,
					Privilege: 1,
					StoreType: 1
				}
			],
			extraParams: {
				Password: ""
			},
			extraParamsRules: {
				Password: [
					{
						required: true,
						message: this.$t("public.pleaseInputPassword"),
						trigger: "blur"
					}
				]
			},
			// fileListDataAll: [], // include waitfor upload list adn fileListData;
			fileListData: [],
			privilegeConfig: ["Private", "Public", "Whitelist"],
			fileSelected: [],
			controlBar: true,
			type: "",
			switchToggle: {
				shareDialog: false,
				confrimDownloadDialog: false,
				deleteDialog: false,
				noStorageDialog: false,
				load: true,
				showLoading: false,
				newFile: true // filebox have more upload file(allow loading more file)
			},
			page: "",
			addrAPI: "",
			limitCount: 100,
			currentFile: null,
			// if no storage link upload is not allow message
			linkRemindToggle: {
				noAllowRemind:
					localStorage.getItem("linkUploadToNoAllowRemind") === "true" ||
					localStorage.getItem("linkUploadToNoAllowRemind") === true
						? true
						: false
			},
			justNowCompleteNumberTimeoutObj: null,
			updateFileRequestCancel: null
		};
	},
	components: {
		uploadFileDetailDialog,
		circleProgress
	},
	mounted() {
		this.page = this.$route.query.page || "filebox";
		this.$nextTick(() => {
			if (this.page == "filebox") {
				this.toggleFilebox = true;
			}
		});
		tableElement = this.$refs.table.bodyWrapper;
		this.addListenScroll();
	},
	methods: {
		linkUpdateAllowRemind() {
			localStorage.setItem(
				"linkUploadToNoAllowRemind",
				this.linkRemindToggle.noAllowRemind
			);
		},
		goAdvanceUpload() {
			this.$router.push({ name: "upload" });
		},
		toCloseUploadFileDetail() {
			this.uploadDetailHash = "";
			this.uploadDetailNodes = [];
		},
		openDetailDialog(row) {
			this.uploadDetailHash = row.Hash;
			this.uploadDetailNodes = row.Nodes || [];
		},
		openDetailDialogProcess(row) {
			this.uploadDetailHash = row.Hash;
			this.uploadDetailNodes = row.Nodes || [];
			this.$refs.uploadFileDetailDialog.selectType(1);
		},
		goStorage() {
			this.$router.push({ name: "expand" });
		},
		goUpload() {
			if (!this.space || (this.space.Used === 0 && this.space.Remain === 0)) {
				if (!this.linkRemindToggle.noAllowRemind) {
					return (this.switchToggle.noStorageDialog = true);
				}
			}
			this.$router.push({ name: "upload" });
		},
		clipText(el) {
			const vm = this;
			clipboard.writeText(this.executedFile.Hash);
			this.$message({
				message: vm.$t("public.copied"),
				duration: 1200,
				type: "success"
			});
		},
		toClipboard(text) {
			const vm = this;
			clipboard.writeText(text);
			this.$message({
				message: vm.$t("public.copied"),
				duration: 1200,
				type: "success"
			});
		},
		showInFolder(path) {
			shell.showItemInFolder(path);
		},
		clickRow(row) {
			if (row.Url) {
				this.$refs.table.toggleRowSelection(row);
			}
		},
		addListenScroll() {
			const that = this;
			const distance = 300;
			tableElement.addEventListener("scroll", function() {
				if (that.switchToggle.load || that.switchToggle.newFile) {
					if (
						tableElement.scrollTop + tableElement.clientHeight + distance >=
						tableElement.scrollHeight
					) {
						that.getFileLists();
					}
				} else {
				}
			});
		},
		selectAll(selection) {
			for (let i = selection.length - 1; i >= 0; i--) {
				if (selection[i].Undone) {
					selection.splice(i, 1);
				}
			}
			this.fileSelected = selection;
		},
		toSelectFile(selection, row) {
			if (!row.Url) {
				this.$refs.table.toggleRowSelection(row, false);
			}
		},
		selectFile(file) {
			this.fileSelected = file;
		},
		updateFileLists() {
			const vm = this;
			try {
				this.updateFileRequestCancel('update upload file list request cancel!')
			} catch(e) {}
			let _end = Math.ceil((this.fileListData.length || 1) / this.limitCount) * this.limitCount + 1;
			let addr = `${this.addrAPI}0/0/${_end}/0`;
			this.$axios
				.get(addr, {
					cancelToken: new vm.$axios.CancelToken(c => {
            vm.updateFileRequestCancel = c;
					}),
				})
				.then(res => {
					if (res.Error === 0) {
						let result = res.Result;
						if (result.length) {
							result.map(item => {
								item.Undone =
									item.Url !== "" && item.Url !== undefined ? false : true;
									if(vm.uploadDetailHash && (item.Hash === vm.uploadDetailHash)) {
										vm.uploadDetailNodes = item.Nodes || [];
									}
								return item;
							});

							// update limit
							if(vm.fileListData.length < result.length) {
								let _limit = vm.fileListData.length;
								vm.$store.dispatch("getSyncFileList", _limit);
							}

							// update list
							if(result.length > (_end - 1)) {
								vm.fileListData = result.slice(0, -1).concat(vm.fileListData.slice(_end));
								// have more file when return limit number 
								vm.switchToggle.newFile = true;
							} else {
								vm.fileListData = result.concat(vm.fileListData.slice(_end));
							}
							vm.$forceUpdate();
							// update sync file limit;
						}
					}
				})
				.catch(err => {
					console.error(err);
					// if (err.message.includes("timeout")) {
					// 	this.$message.error("Request Timeout!");
					// }
				})
		},
		getFileLists() {
			const vm = this;
			if (!this.switchToggle.load && !this.switchToggle.newFile) return;
			this.switchToggle.load = false; // if your are loading list now,  the switch will be set to false
			this.switchToggle.showLoading = true;
			this.switchToggle.newFile = false;
			let _start = this.fileListData.length
			let addr = `${this.addrAPI}${this.type}/${_start}/${this.limitCount
			}${this.addrAPI === this.$api.getFileList ? "/0" : ""}`;
			this.$axios
				.get(addr)
				.then(res => {
					if (res.Error === 0) {
						let result = res.Result;
						// result = this.mockData;
						if (result.length) {
							result.map(item => {
								item.Undone =
									item.Url !== "" && item.Url !== undefined ? false : true;
								if(vm.uploadDetailHash && (item.Hash === vm.uploadDetailHash)) {
									vm.uploadDetailNodes = item.Nodes || [];
								}
								return item;
							});
							// if(vm.fileListData.length > _start) {
							vm.fileListData = vm.fileListData.slice(0, _start).concat(result);
							// }
							// update sync file limit;
							let _limit = vm.fileListData.length;
							vm.$store.dispatch("getSyncFileList", _limit);
						} else {
							vm.switchToggle.load = false;
							vm.switchToggle.newFile = false;
							return;
						}
						vm.switchToggle.load = true;
					} else {
						if (res.Error === 40007) return;
						vm.$message.error(vm.$t(`error[${res.Error}]`));
						vm.switchToggle.load = true;
					}
				})
				.catch(err => {
					console.error(err);
					if (err.message.includes("timeout")) {
						this.$message.error("Request Timeout!");
					}
					this.switchToggle.load = true;
				})
				.finally(() => {
					this.switchToggle.showLoading = false;
				});
		},
		shareFile(file) {
			this.executedFile = file;
			this.switchToggle.shareDialog = true;
		},
		downloadFile(file) {
			const vm = this;
			if (this.isSync) {
				this.$confirm(
					vm.$t("public.blockUnsynchronizedCompletionAreYouSureToDoThis"),
					vm.$t("public.notice"),
					{
						confirmButtonText: vm.$t("public.confirm"),
						cancelButtonText: vm.$t("public.cancel")
					}
				)
					.then(() => {
						this.fileToDownload = [file];
						this.switchToggle.confrimDownloadDialog = true;
					})
					.catch(e => {});
			} else {
				this.fileToDownload = [file];
				this.switchToggle.confrimDownloadDialog = true;
			}
		},
		batchDownload() {
			const vm = this;
			const NO_DOWNLOAD_FILE_MSG = this.$t(
				"fileManager.pleaseSelectTheFileYouWantToDownload"
			);
			if (!this.fileSelected || this.fileSelected.length === 0) {
				this.$message({
					message: NO_DOWNLOAD_FILE_MSG,
					type: "warning"
				});
				return;
			}
			if (this.isSync) {
				this.$confirm(
					vm.$t("fileManager.blockUnsynchronizedCompletionAreYouSureToDoThis"),
					vm.$t("fileManager.notice"),
					{
						confirmButtonText: vm.$t("fileManager.confirm"),
						cancelButtonText: vm.$t("fileManager.cancel")
					}
				)
					.then(() => {
						this.fileToDownload = this.fileSelected;
						this.switchToggle.confrimDownloadDialog = true;
					})
					.catch(e => {});
			} else {
				this.fileToDownload = this.fileSelected;
				this.switchToggle.confrimDownloadDialog = true;
			}
		},
		addTask(arr) {
			let newWaitForDownloadList = this.waitForDownloadList.concat(arr);
			this.$store.commit("SET_WAIT_FOR_DOWNLOAD_LIST", newWaitForDownloadList);
			ipcRenderer.send("run-dialog-event", {
				name: "setWaitForDownloadList",
				data: newWaitForDownloadList
			});
			// update WaitForDownloadOrderList
			let WaitForDownloadOrderList = [];
			for (let value of newWaitForDownloadList) {
				WaitForDownloadOrderList.push(value.Id);
			}
			ipcRenderer.send("run-dialog-event", {
				name: "pushWaitForDownloadOrderList",
				data: WaitForDownloadOrderList
			});
		},
		waitForNowDownload({ arr, len, errorMsg, flag }) {
			const vm = this;
			if (!arr || arr.length === 0 || len === 0) {
				this.downloadDone({ arr, errorMsg, flag });
				return;
			}

			let waitForNowDownloadList = arr.splice(
				0,
				len > arr.length ? arr.length : len
			); // get now download list

			let commitAll = [];
			for (let downloadFileParam of waitForNowDownloadList) {
				commitAll.push(this.getToDownloadFilePromise(downloadFileParam));
			}

			this.$axios.all(commitAll).then(resArr => {
				let errorArr = [];
				for (let res of resArr) {
					if (res.Error === 0) {
						flag = true;
					} else {
						errorArr.push(res);
					}
				}

				if (errorArr.length === 0) {
					this.downloadDone({ arr, errorMsg, flag });
				} else {
					//if have error task joint errorMsg and run me again(argumnets.callee())
					for (let value of errorArr) {
						errorMsg += `<p>`;
						errorMsg += `${value.FileName || ""}`;
						errorMsg += this.$t(`error[${value.Error}]`);
						errorMsg += `</p>`;
					}
					let errorLength = errorArr.length;
					let param = {
						arr: arr,
						len: errorLength,
						errorMsg: errorMsg,
						flag: flag
					};
					vm.waitForNowDownload(param);
				}
			});
		},
		downloadDone({ errorMsg, flag, arr = [] }) {
			const vm = this;
			// close loading...
			this.switchToggle.loading && this.switchToggle.loading.close();
			if (flag === false) {
				// is have download success task
				if (errorMsg) {
					this.$message.error({
						dangerouslyUseHTMLString: true,
						message: errorMsg
					});
				} else {
					this.$message.error(vm.$t("fileManager.downloadError"));
				}
			} else {
				if (!errorMsg) {
					this.$message({
						type: "success",
						message: vm.$t("fileManager.startDownload")
					});
				} else {
					this.$message.error({
						dangerouslyUseHTMLString: true,
						message: errorMsg
					});
				}
				this.switchToggle.confrimDownloadDialog = false;
				ipcRenderer.send("run-dialog-event", { name: "getDownload" });

				if (arr.length > 0) {
					setTimeout(() => {
						vm.addTask(arr);
					}, 2000);
				}
				this.$router.push({
					name: "transfer",
					query: { transferType: 2 }
				});
			}
		},
		getToDownloadFilePromise(data) {
			return this.$axios.post(this.$api.download, data);
		},
		toDownload(downloadFiles) {
			const vm = this;
			if (this.fileDownloadInfo.Fee > this.channelBind.BalanceFormat * 1) {
				this.$message.error(
					vm.$t(
						"fileManager.theChannelBalanceIsInsufficientPleaseTryAgainAfterTopup"
					)
				);
				return;
			}
			this.switchToggle.loading = this.$loading({
				lock: true,
				text: vm.$t("fileManager.fileProcessing"),
				target: ".loading-content.disk-download-loading"
			});
			let arr = [];
			for (let downloadFile of downloadFiles) {
				arr.push({
					Url: downloadFile.Url,
					SetFileName: true,
					MaxPeerNum: ipcRenderer.sendSync("getSettings", "maxPeerNum"),
					Hash: downloadFile.Hash,
					// cache upload data↓
					FileSize: downloadFile.Size,
					DetailStatus: "downloadLoading",
					FileName: downloadFile.Name,
					FileHash: downloadFile.Hash,
					Type: 1,
					Status: 2,
					IsUploadAction: false,
					Id: "waitfor_" + uuid.v4(),
					Nodes: []
				});
			}

			let waitForNowDownloadLength =
				this.$config.maxNumUpload -
					this.$store.state.Transfer.downloadTransferList.length || 0;
			if (waitForNowDownloadLength <= 0) {
				this.switchToggle.loading && this.switchToggle.loading.close();
				this.switchToggle.confrimDownloadDialog = false;
				// this.$store.dispatch("getUpload");
				ipcRenderer.send("run-dialog-event", { name: "getDownload" });
				this.$router.push({
					name: "transfer",
					query: { transferType: 2 }
				});
				this.addTask(arr);
				return;
			}

			let errorMsg = ""; // error message
			let flag = false; // is have success
			this.waitForNowDownload({
				arr,
				len: waitForNowDownloadLength,
				errorMsg,
				flag
			});
		},
		deleteFile(file) {
			this.fileToDelete = [file];
			this.switchToggle.deleteDialog = true;
			this.getDeleteGasFee();
		},
		batchDelete() {
			const NO_DELETE_FILE_MSG = this.$t(
				"fileManager.pleaseSelectTheFileYouWantToDelete"
			);
			if (!this.fileSelected || this.fileSelected.length === 0) {
				this.$message({
					message: NO_DELETE_FILE_MSG,
					type: "warning"
				});
				return;
			}
			this.fileToDelete = this.fileSelected;
			this.switchToggle.deleteDialog = true;
			this.getDeleteGasFee();
		},
		getDeleteGasFee() {
			const vm = this;
			return;
			this.deleteGasFee = '';
			let paramUrl = ''
			for (let file of deleteFiles) {
				paramUrl += `hash=${file.Hash}&`;
			}
			let url = `this.$api.dspFilesDeletefee?${paramUrl.slice(0, -1)}`;
			this.$axios.get(url).then((res) => {
				if(res.Error === 0) {
					this.deleteGasFee = res.Result.TxFeeFormat;
				} else {
					this.$message.error(vm.$t('fileManager.getGasFeeFailed'));
				}
			})
		},
		syncDeleteFile(res) {
			if (Object.prototype.toString.call(res) === "[object Array]") {
				for (let value of res) {
					this.fileListData.some((item, index) => {
						if (item.Hash === value.FileHash) {
							if (value.Tx) {
								this.fileListData.splice(index, 1);
							}
							return true;
						} else {
							return false;
						}
					});
				}
			}
		},
		toDeleteFileNew(deleteFiles) {
			const vm = this;
			if(parseFloat(this.deleteGasFee) > this.currentBalanceFormat) {
				this.$message.error(vm.$t("public.insufficientBalanceAvailable"));
				return;
			}
			this.$refs.extraParamsForm.validate(valid => {
				if (!valid) return;
				let arr = [];
				for (let file of deleteFiles) {
					arr.push(file.Hash);
				}
				this.$axios
					.post(
						this.$api.deletes,
						{
							Hash: arr,
							Password: crypto
								.createHash("sha256")
								.update(vm.extraParams.Password)
								.digest("hex")
						},
						{
							timeout: 20000 * arr.length + vm.$outTime * 2000,
							loading: {
								text: vm.$t("fileManager.deleting"),
								target: ".loading-content.disk-delete-loading"
							}
						}
					)
					.then(res => {
						this.$refs["extraParamsForm"].resetFields();
						this.$refs["table"].clearSelection();
						this.$store.dispatch("setSpace"); // get userspace
						this.switchToggle.deleteDialog = false;
						if (res.Error === 0) {
							this.$message({
								message: vm.$t("fileManager.deleteSuccessful"),
								type: "success"
							});
							this.syncDeleteFile(res.Result);
							// console.log("delete");
						} else {
							this.$message.error(this.$t(`error["${res.Error}"]`));
							this.syncDeleteFile(res.Result);
						}
					})
					.catch(e => {
						if (!e.message.includes("timeout")) {
							this.$message.error(
								vm.$t("fileManager.networkErrorDeleteFailed")
							);
						} else {
							this.$message.error("Request Timeout!");
						}
					});
			});
		},
		toDeleteFile(dataList, hash) {
			const vm = this;
			this.$axios
				.post(
					this.$api.delete,
					{ Hash: hash },
					{
						loading: {
							text: vm.$t("fileManager.deleting"),
							target: ".loading-content.disk-delete-loading"
						}
					}
				)
				.then(res => {
					if (res.Error === 0) {
						this.$message({
							message: vm.$t("fileManager.deleteSuccessful"),
							type: "success"
						});
						dataList.some((item, index) => {
							if (item.Hash === hash) {
								dataList.splice(index, 1);
								return true;
							} else {
								return false;
							}
						});
						this.switchToggle.deleteDialog = false;
					} else {
						this.$message.error(this.$t(`error[${res.Error}]`));
					}
				})
				.catch(error => {
					if (error.message.includes("timeout")) {
						this.$message.error("Request Timeout!");
					}
				});
		}
	},
	watch: {
		fileToDownload: function() {
			const vm = this;
			let fileToDownload = this.fileToDownload;
			let cost = 0;
			let size = 0;
			let name = "";
			this.fileDownloadInfo.Fee = "Calculating";
			fileToDownload.map((item, index) => {
				const path = ipcRenderer.sendSync("string-to-hex", item.Url);
				size += this.fileToDownload[index].Size;
				if (index == fileToDownload.length - 1) {
					this.fileDownloadInfo.Size = util.bytesToSize(size * 1024);
				}
				name =
					name +
					this.fileToDownload[index].Name +
					(index == fileToDownload.length - 1 ? "" : " / ");
				if (name.length > 37) {
					// max length
					this.fileDownloadInfo.Name = name.substring(0, 37) + " ....";
					this.fileDownloadInfo.allName = name;
				} else {
					this.fileDownloadInfo.Name = name;
					this.fileDownloadInfo.allName = name;
				}
				this.$axios
					.get(this.$api.downloadInfo + path)
					.then(res => {
						if (res.Error === 0) {
							cost += res.Result.Fee || 0;
							this.fileDownloadInfo.DownloadDir = res.Result.DownloadDir || "";
							this.fileDownloadInfo.Fee = parseFloat(
								(cost / 1000000000).toFixed(9)
							);
						} else {
							this.$message.error(this.$t(`error[${res.Error}]`));
						}
						// }
					})
					.catch((error) => {
						if (error.message.includes("timeout")) {
							this.$message.error("Request Timeout!");
						}
						console.error("unable to calc");
						this.fileDownloadInfo.Fee = "Unable to calculate. network error.";
					});
			});
		},
		fileToDelete: function() {
			let fileToDelete = this.fileToDelete;
			let name = "";
			fileToDelete.map((item, index) => {
				name =
					name +
					this.fileToDelete[index].Name +
					(index == fileToDelete.length - 1 ? "" : " / ");
				if (name.length > 37) {
					// max length
					this.fileDeleteInfo.Name = name.substring(0, 37) + " ....";
					this.fileDeleteInfo.allName = name;
				} else {
					this.fileDeleteInfo.Name = name;
					this.fileDeleteInfo.allName = name;
				}
			});
		},
		lang() {
			this.extraParamsRules = {
				Password: [
					{
						required: true,
						message: this.$t("public.pleaseInputPassword"),
						trigger: "blur"
					}
				]
			};
		},
		uploadLength(val) {
			const vm = this;
			console.log(val);
			clearTimeout(this.justNowCompleteNumberTimeoutObj)
			this.justNowCompleteNumberTimeoutObj = setTimeout(() => {
				vm.updateFileLists();
			}, 200)
		}
	},
	computed: {
		lang() {
			return this.$i18n.locale;
		},
		space() {
			return this.$store.state.Filemanager.space;
		},
		channelBind() {
			return this.$store.state.Home.channelBind;
		},
		filterListData() {
			const fileListDataAll = this.fileListDataAll;
			return fileListDataAll.filter(item => {
				item.StoreTypeNum = -item.StoreType;
				return item.Name.toLowerCase().indexOf(this.filterInput.toLowerCase()) >= 0;
			});
		},
		isSync: function() {
			return this.$store.state.Home.isSync || false;
		},
		waitForUploadList: function() {
			const vm = this;
			let arr = JSON.parse(
				JSON.stringify(vm.$store.state.Transfer.waitForUploadList || [])
			);
			let UpdatedAt = Date.now() / 1000;
			arr.map(item => {
				item.Name = item.FileName;
				item.RealFileSize = item.FileSize;
				item.Undone = true; //not done upload
				item.Privilege = item.Privilege === undefined ? 1 : item.Privilege;
				item.UpdatedAt = UpdatedAt;
				return item;
			});
			return arr;
		},
		waitForDownloadList() {
			return this.$store.state.Transfer.waitForUploadList || [];
		},
		syncObj() {
			let obj = {};
			let syncList = this.$store.state.Transfer.syncList || [];
			for (let value of syncList) {
				obj[value.Hash] = value;
			}
			return obj;
		},
		syncProcess() {
			const vm = this;
			return function(Hash) {
				if (!vm.syncObj[Hash]) return -1;
				let nodes = vm.syncObj[Hash].Nodes;
				if (nodes.length === 1) return -1;
				let uploadTotal = 0;
				for (let value of nodes) {
					if (value.Index === 0) continue;
					uploadTotal += value.UploadSize;
				}
				let process =
					uploadTotal / (vm.syncObj[Hash].Size * (nodes.length - 1));
				return process || 0;
			};
		},
		syncColor() {
			const vm = this;
			return function(Hash) {
				if (!vm.syncObj[Hash]) return "#2F8FF0";
				let nodes = vm.syncObj[Hash].Nodes;
				if (nodes.length === 1) return "#2F8FF0";
				for (let value of nodes) {
					if (value.Index === 0) continue;
					if (value.State === 4) return "#E9566D";
				}
				return "#2F8FF0";
			};
		},
		// include waitfor upload list adn fileListData;
		fileListDataAll() {
			return this.waitForUploadList.concat(this.fileListData);
		},
		balanceLists() {
			return this.$store.state.Wallet.balanceLists;
		},
		currentBalanceFormat() {
			// let sum = 0;
			if (!this.balanceLists) return 0;
			for (let value of this.balanceLists) {
				if (value.Symbol === "SAVE") {
					return value.BalanceFormat;
				}
			}
		},
		uploadLength() {
			let uploadLength = this.$store.state.Transfer.uploadLength;
			return uploadLength;
		}
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			vm.type = to.query.type;
			vm.controlBar = to.query.controlBar;
			if (to.query.addrAPI) {
				vm.addrAPI = to.query.addrAPI;
			} else if (to.query.page === "miner") {
				vm.addrAPI = vm.$api.getDownloadFileList;
			} else {
				vm.addrAPI = vm.$api.getFileList;
				let _limit = vm.fileListData.length + vm.limitCount;
				vm.$store.dispatch("getSyncFileList", _limit);
			}
			console.log('beforeRouteEnter')
			vm.getFileLists();
		});
	},
	beforeRouteLeave(to, from, next) {
		this.$store.dispatch("clearIntervalSyncFileList");
		console.log('beforeRouteLeave')
		next();
	},
	beforeRouteUpdate(to, from, next) {
		this.type = to.query.type;
		this.switchToggle.load = true;
		this.fileListData = [];
		this.getFileLists();
		next();
	},
	destroyed() {
		this.$store.dispatch("clearIntervalSyncFileList");
	}
};
</script>
<style lang="scss">
$light-blue: #65a6ff;
$theme-color: #1b1e2f;
#disk {
	.func-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30px 0 14px;
		height: 80px;
		@include themify {
			background-color: $color;
		}
		border-bottom: 1px solid rgba(32, 32, 32, 0.1);
		.fun-button {
			button {
				width: 125px;
			}
		}
		.bt {
			width: 100px;
			height: 33px;
			padding: 0px;
			border-color: $theme-color;
			border-radius: 2px;
			background: none;
			box-shadow: 0px 0px 4px 0px rgba(0, 122, 255, 0.3);
			border-radius: 16px;
			border: 1px solid rgba(47, 143, 240, 1);
			color: #2f8ff0;

			&:hover {
				opacity: 0.7;
			}

			&:active {
				opacity: 1;
			}

			&.bt-upload {
				color: #fff;
				background: $light-blue;
				border: none;
				background: linear-gradient(
					90deg,
					rgba(19, 175, 250, 1) 0%,
					rgba(62, 126, 235, 1) 100%
				);
				box-shadow: 0px 4px 6px 0px rgba(111, 139, 173, 0.21);
				border-radius: 16px;
			}
		}
		.fun-search {
			width: 240px;

			.el-input__inner {
				height: 33px;
				line-height: 33px;
				border-radius: 17px;
				padding-left: 40px;
			}
			.el-input__prefix {
				left: 10px;
				.el-input__icon {
					line-height: 34px;
					font-size: 1.6rem;
					@include themify {
						color: $tertiary-font-color;
					}
				}
			}
		}
	}
	& > .content {
		position: absolute;
		top: 80px;
		bottom: 0px;
		width: 100%;
		@include themify {
			background-color: $color;
		}

		.table-element {
			// font-weight: bold;
			height: 100%;
			overflow-y: hidden;
			.rowName {
				.row-name {
					position: relative;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
					min-height: 32px;
					line-height: 32px;
					padding-right: 40px;

					.sync-process {
						position: absolute;
						top: 6px;
						right: 0px;
						width: 40px;
						text-align: center;
					}
				}
				.opera {
					color: rgba(32, 32, 32, 0.4);
					font-weight: bold;
					display: none;
					span {
						display: inline-block;
						width: 32px;
						height: 32px;
						line-height: 32px;
						text-align: center;
						border-radius: 50%;
						margin: 0px 4px;
						cursor: pointer;
						&:hover {
							@include themify {
								background-color: $color;
							}
						}
						&:active {
							opacity: 0.7;
						}
						& > .el-icon-share {
							position: relative;
							top: 2px;
						}
						& > .el-icon-download {
							position: relative;
							top: 1px;
						}
						& > .el-icon-delete {
							position: relative;
							top: 1px;
						}
						& > .ofont-xiangqing {
							position: relative;
							left: 1px;
						}
					}
				}
				&:hover {
					.opera {
						display: flex;
						justify-content: center;
						align-items: center;
					}
				}
			}
		}
	}
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
	.icon-no-bg {
		.el-input-group__append {
			border: 0;
			i {
				&:hover {
					color: #2f8ff0;
				}
				&:active {
					color: rgba(47, 143, 240, 0.7);
				}
			}
		}
	}
	.el-input-group__append {
		[class^="el-icon-"] {
			font-size: 1.8rem;
			cursor: pointer;
		}
	}
	.delete-dialog-content {
		width: 404px;
		margin: 0 auto;

		& > .dialog-file-delete-info {
			@include themify {
				color: $tertiary-font-color
			}
		}

		& > .delete-dialog-gas-fee {
			padding-bottom: 16px;

			@include themify {
				border-bottom: 1px solid $line-color;
			}

		}
	}
}
</style>

