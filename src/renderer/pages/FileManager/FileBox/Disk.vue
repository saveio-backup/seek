<template>
	<div id="disk">
		<div
			class="func-nav"
			v-if="controlBar !== 'close'"
		>
			<div class="fun-button">

				<!-- <router-link :to="{name:'upload'}"> -->
				<ripper-button
					class="primary theme-font-blue"
					@click="goUpload"
				>{{$t('fileManager.upload')}}</ripper-button>

				<!-- </router-link> -->
				<ripper-button
					class="ml10 bt-download theme-font-blue"
					@click="batchDownload"
				>
					{{$t('fileManager.download')}}
				</ripper-button>
				<ripper-button
					class="ml10 bt-download theme-font-blue"
					@click="batchDelete"
				>
					{{$t('fileManager.delete')}}
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
					@selection-change="selectFile"
					@select="toSelectFile"
					@select-all="selectAll"
				>
					<!-- :data="mockData" -->
					<el-table-column
						v-if="toggleFilebox"
						type="selection"
						width="30"
					></el-table-column>
					<el-table-column
						:label="$t('fileManager.fileName')"
						class-name="rowName"
						prop="Name"
						sortable
						min-width="150"
					>
						<template slot-scope="scope">
							<div class="flex between">
								<span
									class="row-name"
									:class="scope.row.Undone?'theme-font-blue-40':''"
								>{{ scope.row.Name }}</span>
								<!-- @click="executedFile = scope.row" -->
								<div
									class="opera"
									v-if="!scope.row.Undone"
								>
									<span
										@click.stop="shareFile(scope.row)"
										:title="$t('fileManager.fileName')"
										v-if="scope.row.Privilege != 0"
										class="active-blue cursor-pointer"
									>
										<i class="el-icon-share ft18"></i>
									</span>
									<span
										v-if="page === 'filebox'"
										class="active-blue cursor-pointer"
										:title="$t('fileManager.download')"
										@click.stop="downloadFile(scope.row)"
									>
										<i class="el-icon-download ft18"></i>
									</span>
									<span
										v-if="page === 'filebox'"
										:title="$t('fileManager.delete')"
										@click.stop="deleteFile(scope.row)"
										class="active-blue cursor-pointer"
									>
										<i class="el-icon-delete ft18"></i>
									</span>
									<span
										@click.stop="showInFolder(scope.row.Path)"
										v-if="page === 'miner' && scope.row.Path"
										:title="$t('fileManager.openFolder')"
										class="active-blue cursor-pointer"
									>
										<i class="ofont ofont-wenjianxiangqing ft14"></i>
									</span>
									<span
										v-if="page === 'filebox'"
										:title="$t('fileManager.lookDetail')"
										@click.stop="openDetailDialog(scope.row)"
										class="active-blue cursor-pointer"
									>
										<i class="ofont-xiangqing ofont ft16">
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
							<div :class="scope.row.Undone?'theme-font-blue-40':''">
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
							<span class="td-grey">{{scope.row.OwnerAddress || $t('fileManager.nameless')}}</span>
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
								class="td-grey break-word"
								:class="scope.row.Undone?'theme-font-blue-40':''"
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
								class="td-grey break-word"
								:class="scope.row.Undone?'theme-font-blue-40':''"
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
							<span class="td-grey">
								{{$t(`fileManager["${privilegeConfig[scope.row.Privilege]}"]`)}}
							</span>
						</template>
					</el-table-column>
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
				<p class="mt10 mb10 tl">{{$t('fileManager.fileName')}}: {{executedFile.Name}}</p>
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
						<p class="adjust-title theme-font-blue ft14">{{$t('fileManager.fileName')}}</p>
						<div class="adjust-info">
							<p class="theme-font-blue ft14 mr20">{{fileDownloadInfo.Name}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title theme-font-blue ft14">{{$t('fileManager.fileSize')}}:</p>
						<div class="adjust-info">
							<p class="theme-font-blue ft14 mr20">{{fileDownloadInfo.Size}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title theme-font-blue ft14">{{$t('fileManager.savePath')}}:</p>
						<div class="adjust-info">
							<p class="ft14 mr20">{{fileDownloadInfo.DownloadDir || ''}}</p>
						</div>
					</div>
					<div class="dialog-title-border"></div>
					<div class="adjust-item">
						<p class="adjust-title ft14">{{$t('fileManager.cost')}}:</p>
						<div class="adjust-info">
							<p class="ft14 mr20">{{fileDownloadInfo.Fee ? fileDownloadInfo.Fee + ' ONI': ''}} </p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title theme-font-blue ft14">{{$t('fileManager.channelBalance')}}:</p>
						<div class="adjust-info">
							<p class="ft14 mr20">{{channelBind.BalanceFormat}} ONI</p>
						</div>
					</div>
				</div>
				<div slot="footer">
					<ripper-button @click="switchToggle.confrimDownloadDialog = false">{{$t('public.cancel')}}</ripper-button>
					<ripper-button
						class="primary"
						@click="toDownload(fileToDownload)"
					>{{$t('fileManager.download')}}</ripper-button>
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
						class="primary"
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
			<div class="loading-content disk-delete-loading">
				<p class="mt10 mb10">{{$t('fileManager.areYouSureYouWantTo')}} <span>{{$t('fileManager.delete2')}}</span> {{$t('fileManager.theSelectedFile')}}</p>
				<p class="mb20">{{fileDeleteInfo.Name}}</p>
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
				<div slot="footer">
					<ripper-button @click="switchToggle.deleteDialog = false">{{$t('public.cancel')}}</ripper-button>
					<ripper-button
						type="danger"
						class="primary"
						@click="toDeleteFileNew(fileToDelete)"
					>{{$t('fileManager.delete')}}</ripper-button>
				</div>
			</div>
		</el-dialog>
		<upload-file-detail-dialog
			@closeUploadFileDetail="toCloseUploadFileDetail"
			:hash="uploadDetailHash"
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
import uuid from 'node-uuid';
let tableElement;
export default {
	data() {
		return {
			clipboard,
			effectiveNumber,
			toggleFilebox: false,
			date,
			util,
			fileDownloadInfo: {
				Fee: 0,
				Size: 0
			},
			fileDeleteInfo: {
				Name: ""
			},
			executedFile: {}, // a file be opera
			filterInput: "",
			uploadDetailHash: "",
			fileToDownload: [], // the file/files which chekbox or download button you click
			fileToDelete: [], // the file/files which chekbox  or delete button you click
			mockMiner: [
				{
					Hash: "QmP9pWe9W6KWnVkoEAFPFvfRYDHft7bvq5aAsTGhjpUCvK",
					Path: "text/tasst/",
					Name: "miner11111.txt",
					Size: 1024,
					DownloadCount: 10,
					DownloadAt: 1555166,
					LastShareAt: 15556657,
					Privilege: 0,
					Profit: 10
				}
			],
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
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "helloworld.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 155051257,
					UpdatedAt: 12412410,
					DownloadAt: 12412412,
					Profit: 532452340,
					Privilege: 1,
					Url: "asdfsdf",
					StoreType: 0
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 155505125,
					UpdatedAt: 124124041,
					DownloadAt: 11241240,
					Profit: 513452345234523450,
					Privilege: 1,
					Url: "aasfewfwa",
					StoreType: 0
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 1240,
					DownloadAt: 1140,
					Profit: 23512312340,
					Privilege: 1,
					StoreType: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 1536,
					ExpiredAt: 555051257,
					UpdatedAt: 1241241240,
					DownloadAt: 1140124124,
					Profit: 1,
					Privilege: 1,
					StoreType: 0
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 15585051257,
					UpdatedAt: 1241240,
					DownloadAt: 11404134,
					Profit: 6456120,
					Privilege: 1,
					StoreType: 0
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 12412410,
					DownloadAt: 12412410,
					Profit: 646240,
					Privilege: 1,
					StoreType: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 51250,
					DownloadAt: 51250,
					Profit: 540,
					Privilege: 1,
					StoreType: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 5213410,
					DownloadAt: 5213410,
					Profit: 41241240,
					Privilege: 1,
					Path: "123123",
					StoreType: 0
				}
			],
			extraParams: {
				Password: ""
			},
			extraParamsRules: {
				Password: [
					{ required: true, message: this.$t('public.pleaseInputPassword'), trigger: "blur" }
				]
			},
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
				load: true
			},
			page: "",
			addrAPI: "",
			limitCount: 20,
			currentFile: null,
			// if no storage link upload is not allow message
			linkRemindToggle: {
				noAllowRemind:
					localStorage.getItem("linkUploadToNoAllowRemind") === "true" ||
					localStorage.getItem("linkUploadToNoAllowRemind") === true
						? true
						: false
			}
		};
	},
	components: {
		uploadFileDetailDialog
	},
	mounted() {
		// window.vue = this;
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
		},
		openDetailDialog(row) {
			this.uploadDetailHash = row.Hash;
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
				message: vm.$t('public.copied'),
				duration: 1200,
				type: "success"
			});
		},
		toClipboard(text) {
			const vm = this;
			clipboard.writeText(text);
			this.$message({
				message: vm.$t('public.copied'),
				duration: 1200,
				type: "success"
			});
		},
		showInFolder(path) {
			shell.showItemInFolder(path);
		},
		clickRow(row) {
			if (row.Url) {
				this.$refs.table.clearSelection();
				this.$refs.table.toggleRowSelection(row);
			}
		},
		addListenScroll() {
			const that = this;
			const distance = 300;
			tableElement.addEventListener("scroll", function() {
				if (that.switchToggle.load) {
					if (
						tableElement.scrollTop + tableElement.clientHeight + distance >=
						tableElement.scrollHeight
					) {
						console.log("scroll Toggle");
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
		getFileLists() {
			if (!this.switchToggle.load) return;
			this.switchToggle.load = false; // if your are loading list now,  the switch will be set to false
			let addr =
				this.addrAPI +
				this.type +
				"/" +
				this.fileListData.length +
				"/" +
				this.limitCount;
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
								return item;
							});
							if (!this.fileListData || this.fileListData.length === 0) {
								this.fileListData = this.fileListData.concat(
									this.waitForUploadList
								);
							}
							// console.log(this.fileListData);
							// console.log(this.waitForUploadList);
							this.fileListData = this.fileListData.concat(result);
						} else {
							this.switchToggle.load = false;
							return;
						}
						this.switchToggle.load = true;
					} else {
						if (res.Error === 40007) return;
						this.$message.error(this.$t(`error[${res.Error}]`));
						this.switchToggle.load = true;
					}
				})
				.catch(err => {
					console.error(err);
					this.switchToggle.load = true;
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
					vm.$t('public.blockUnsynchronizedCompletionAreYouSureToDoThis'),
					vm.$t('public.notice'),
					{
						confirmButtonText: vm.$t('public.confirm'),
						cancelButtonText: vm.$t('public.cancel')
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
			const NO_DOWNLOAD_FILE_MSG =
				this.$t('fileManager.pleaseSelectTheFileYouWantToDownload');
			if (!this.fileSelected || this.fileSelected.length === 0) {
				this.$message({
					message: NO_DOWNLOAD_FILE_MSG
				});
				return;
			}
			if (this.isSync) {
				this.$confirm(
					vm.$t('fileManager.blockUnsynchronizedCompletionAreYouSureToDoThis'),
					vm.$t('fileManager.notice'),
					{
						confirmButtonText: vm.$t('fileManager.confirm'),
						cancelButtonText: vm.$t('fileManager.cancel')
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
			ipcRenderer.send("run-dialog-event", {name: "setWaitForDownloadList", data: newWaitForDownloadList});
			// update WaitForDownloadOrderList
			let WaitForDownloadOrderList = [];
			for(let value of newWaitForDownloadList) {
				WaitForDownloadOrderList.push(value.Id);
			}
			ipcRenderer.send("run-dialog-event", {name: "pushWaitForDownloadOrderList", data: WaitForDownloadOrderList});
		},
		waitForNowDownload({ arr, len, errorMsg, flag }) {
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
					this.waitForNowdownload({ arr, len: errorLength, errorMsg, flag });
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
					this.$message.error(vm.$t('fileManager.downloadError'));
				}
			} else {
				if (!errorMsg) {
					this.$message({
						type: "success",
						message: vm.$t('fileManager.startDownload')
					});
				} else {
					this.$message.error({
						dangerouslyUseHTMLString: true,
						message: errorMsg
					});
				}
				this.switchToggle.confrimDownloadDialog = false;
				ipcRenderer.send("run-dialog-event", {name: "setDownload"});

				if (arr.length > 0) {
					setTimeout(() => {
						vm.addTask(arr);
					}, 2000)
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
					vm.$t('fileManager.theChannelBalanceIsInsufficientPleaseTryAgainAfterTopup')
				);
				return;
			}
			this.switchToggle.loading = this.$loading({
				lock: true,
				text: vm.$t('fileManager.fileProcessing'),
				target: ".loading-content.disk-download-loading"
			});

			let arr = [];
			for(let downloadFile of downloadFiles) {
				arr.push({
					Url: downloadFile.Url,
					SetFileName: true,
					MaxPeerNum: 20,
					// cache upload data↓
					FileSize: downloadFile.Size,
					DetailStatus: "downloadLoading",
					FileName: downloadFile.Name,
					FileHash: downloadFile.Hash,
					Type: 1,
					Status: 2,
					IsUploadAction: false,
					Id: ('waitfor_' + uuid.v4()),
					Nodes: []
				})
			}

			let waitForNowDownloadLength = this.$config.maxNumUpload - this.$store.state.Transfer.downloadTransferList.length || 0
			if(waitForNowDownloadLength <= 0) {
				this.switchToggle.loading && this.switchToggle.loading.close();
				this.switchToggle.confrimDownloadDialog = false;
				// this.$store.dispatch("setUpload");
				ipcRenderer.send("run-dialog-event", {name: "setDownload"});
				this.$router.push({
					name: "transfer",
					query: { transferType: 2 }
				});
				this.addTask(arr);
				return;
			}

			let errorMsg = ""; // error message
			let flag = false; // is have success
			this.waitForNowDownload({ arr, len: waitForNowDownloadLength, errorMsg, flag });
		},
		deleteFile(file) {
			this.fileToDelete = [file];
			this.switchToggle.deleteDialog = true;
		},
		batchDelete() {
			const NO_DELETE_FILE_MSG = this.$t('fileManager.pleaseSelectTheFileYouWantToDelete');
			if (!this.fileSelected || this.fileSelected.length === 0) {
				this.$message({
					message: NO_DELETE_FILE_MSG
				});
				return;
			}
			this.fileToDelete = this.fileSelected;
			this.switchToggle.deleteDialog = true;
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
							Hash: arr
						},
						{
							timeout: 20000 * arr.length + this.$outTime * 2000,
							loading: {
								text: vm.$t('fileManager.deleting'),
								target: ".loading-content.disk-delete-loading"
							}
						}
					)
					.then(res => {
						this.$refs["extraParamsForm"].resetFields();
						this.$store.dispatch("setSpace"); // get userspace
						this.switchToggle.deleteDialog = false;
						if (res.Error === 0) {
							this.$message({
								message: vm.$t('fileManager.deleteSuccessful'),
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
							this.$message.error(vm.$t('fileManager.networkErrorDeleteFailed'));
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
							text: vm.$t('fileManager.deleting'),
							target: ".loading-content.disk-delete-loading"
						}
					}
				)
				.then(res => {
					if (res.Error === 0) {
						this.$message({
							message: vm.$t('fileManager.deleteSuccessful'),
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
				});
		}
	},
	watch: {
		fileToDownload: function() {
			console.log("fileToDownload Changed.");
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
				} else {
					this.fileDownloadInfo.Name = name;
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
					.catch(() => {
						console.error("unable to calc");
						this.fileDownloadInfo.Fee = "Unable to calculate. network error.";
					});
			});
		},
		fileToDelete: function() {
			console.log("file to delete info changed");
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
				} else {
					this.fileDeleteInfo.Name = name;
				}
			});
		},
		lang() {
			this.extraParamsRules = {
				Password: [
					{ required: true, message: this.$t('public.pleaseInputPassword'), trigger: "blur" }
				]
			}
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
			const fileListData = this.fileListData;
			return fileListData.filter(item => {
				item.StoreTypeNum = -item.StoreType;
				return item.Name.indexOf(this.filterInput) >= 0;
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
			}
			// vm.page = to.query.type || "filebox";
			vm.getFileLists();
		});
	},
	beforeRouteUpdate(to, from, next) {
		this.type = to.query.type;
		this.switchToggle.load = true;
		this.fileListData = [];
		this.getFileLists();
		next();
	}
};
</script>
<style lang="scss">
$light-blue: #65a6ff;
$light-grey: #f9f9fb;
$theme-color: #1b1e2f;
$theme-font-blue: #040f39;
#disk {
	.func-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30px 0 14px;
		height: 80px;
		background: $light-grey;
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
				// color: rgba(32, 32, 32, 0.7);
				padding-left: 40px;
				// border: 1px solid #dee2ea;
				// background: #EDEFF4;
				// &:focus {
				//  background: #DEE2EA;
				//  border: 1px solid #dee2ea !important;
				// }
			}
			.el-input__prefix {
				left: 10px;
				.el-input__icon {
					line-height: 34px;
					font-size: 16px;
					color: rgba(32, 32, 32, 0.4);
				}
			}
		}
	}
	& > .content {
		position: absolute;
		top: 80px;
		bottom: 0px;
		width: 100%;
		padding-top: 20px;
		background: #f9f9fb;

		.table-element {
			// font-weight: bold;
			height: 100%;
			overflow-y: hidden;
			.rowName {
				.row-name {
					min-height: 32px;
					line-height: 32px;
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
							background: #dfe2e9;
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
		.td-grey {
			color: rgba(32, 32, 32, 0.4);
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
			color: rgba(32, 32, 32, 0.4);
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
			background: #f1f3f7;
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
			font-size: 18px;
			cursor: pointer;
		}
	}
}
</style>

