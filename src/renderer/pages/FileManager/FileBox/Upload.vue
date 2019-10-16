<template>
	<div id="upload">
		<div class="content">
			<div class="upload-header">
				<h1 class="user-no-select">Upload File</h1>
				<el-button
					class="primary small"
					@click="toAdvanced"
					v-show="!switchToggle.advanced"
				><i class="ofont ofont-gaoji"></i> Advanced</el-button>
				<el-button
					class="primary small"
					@click="hiddenAdvanced"
					v-show="switchToggle.advanced"
				><i class="ofont ofont-jiandan"></i> Primary</el-button>
			</div>
			<!-- <span @click="resetFileList">asda</span> -->
			<div class="upload-params">
				<el-form
					ref="uploadForm"
					@submit.native.prevent
					:model="uploadFormData"
					:rules="rules"
					hide-required-asterisk
					label-position="left"
					label-width="200px"
				>
					<el-form-item
						label="Select File:"
						class="form-vertical select-file-wrapper"
						prop="FileSize"
					>
						<!-- prop="Path" -->
						<span
							class="form-right browser-layout-reset light-blue"
							@click="resetFileList"
							title="clear all add file"
							v-if="uploadFormData.Files && uploadFormData.Files.length !== 0"
						>Clear</span>
						<ripper-button
							class="form-right browser-layout"
							@click="selectUpload"
						>Browser</ripper-button>
						<el-upload
							class="path-wrapper"
							ref="upload"
							drag
							action="#"
							:multiple="true"
							:show-file-list="false"
							:auto-upload="false"
							:on-change="handleChange"
						>
							<div slot="trigger">
								<!-- <el-button class="browser-layout" type="primary">Browser</el-button> -->
								<div
									class="path-content"
									@click.stop=""
								>
									<ul>
										<el-tag
											:type="(file.fileBytes > (4 * 1024 * 1024 * 1024 )) ?'danger':''"
											:key="file.filePath"
											:disable-transitions="false"
											:title="file.filePath"
											v-for="file in uploadFormData.Files"
											closable
											@close='handleCloseByFile(file)'
											:name="file.fileName"
										>{{file.fileName}}<span v-if="file.fileBytes > (4 * 1024 * 1024 * 1024 )">({{util.bytesToSize(file.fileBytes)}})</span></el-tag>
										<!-- <li v-for="" :key="" >
											{{file.fileName}}
										</li> -->
									</ul>
									<div
										class="path-no-data-title"
										v-if="uploadFormData.Files.length === 0"
									>
										<p class="text-center mt60 user-no-select break-word">Drag your file here or browse</p>
										<p class="text-center mt10 user-no-select break-word">A single file cannot be larger than 4GB</p>
									</div>
								</div>
							</div>
						</el-upload>
					</el-form-item>
					<el-form-item
						class="form-vertical"
						label="File Size:"
					>
						<p class="light-blue">{{util.bytesToSize(fileSize) || '0.00 GB'}}</p>
					</el-form-item>
					<el-form-item label="Encryption:">
						<el-select
							v-model="encryptionToggle"
							class="form-right"
							@change="setEncryptPassword"
						>
							<el-option
								label="Yes"
								:value='true'
							></el-option>
							<el-option
								label="NO"
								:value='false'
							></el-option>
						</el-select>
						<el-form-item
							prop="EncryptPassword"
							class="encryptpassword-input form-right-second"
							v-show="encryptionToggle"
						>
							<el-input
								v-model="uploadFormData.EncryptPassword"
								placeholder="File Password"
								class="encrypt-input"
							></el-input>
						</el-form-item>
					</el-form-item>
				</el-form>

				<!-- advanced Section -->

				<el-form
					v-show="switchToggle.advanced"
					ref="advancedForm"
					:v-model="advancedData"
					:rules="advancedRulus"
					label-position="left"
					label-width="210px"
					@submit.native.prevent
				>
					<el-form-item label="Storage Cycle:">
						<p class="dark-grey tootips">Expired Time: {{expiredDate}} </p>
						<el-input
							v-model="storageCycleNumber"
							:min="1"
							@change="setDuration"
							type="number"
							class="form-right-second-inside"
						></el-input>
						<el-select
							class="form-right"
							v-model="storageCycleSelected"
							@change="setDuration"
						>
							<el-option
								v-for="(item,index) in baseKeys"
								v-show="index !== 0"
								:key="item"
								:label="item"
								:value="item"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item
						label="Integrity Verification Cycle:"
						prop="Interval"
					>
						<p class="dark-grey tootips break-word">Integrity Verification Cycle cannot be longer than Storage Cycle</p>
						<el-input
							:precision='0'
							v-model="verificationCycleNumber"
							:min='0'
							:max='advancedData.Duration / BASE[this.verificationCycleSelected]'
							@change="setDataInterval"
							class="form-right-second-inside"
							type="number"
						></el-input>
						<el-select
							class="form-right"
							v-model="verificationCycleSelected"
							@change="setDataInterval"
						>
							<el-option
								v-for="(item,index) in baseKeys"
								:key="item"
								:label="item"
								:value="item"
								v-show="index < baseKeys.length-1"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item
						label="Backups"
						prop="CopyNum"
					>
						<el-input
							type="number"
							:min="0"
							class="form-right"
							v-model="advancedData.CopyNum"
							@change='toGetPrice'
						></el-input>
					</el-form-item>
					<el-form-item
						label="Authority"
						prop="Privilege"
					>
						<el-select
							class="form-right"
							v-model="advancedData.Privilege"
							@change='toGetPrice'
						>
							<el-option
								label="private"
								:value="0"
							></el-option>
							<el-option
								label="public"
								:value="1"
							></el-option>
							<el-option
								label="whitelist"
								:value="2"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item
						label="whitelist"
						prop="wihteListString"
						class="no-bottom-border"
						v-if="advancedData.Privilege === 2"
					>
						<div class="whitelist-wrap">
							<el-input
								v-if="switchToggle.whiteListInput"
								v-model="advancedData.wihteListString"
								placeholder="Input one wallet address"
								class="save-tag-input form-right"
								ref="saveTagInput"
								size="small"
								@keyup.enter.native="setWhiteList"
								@blur="setWhiteList"
							></el-input>
							<ripper-button
								v-else
								size="small"
								class="form-right"
								@click="showWhitelistInput"
							> + Add WhiteList</ripper-button>
						</div>
					</el-form-item>
					<el-form-item
						class="whitelist-form-item"
						v-show="advancedData.Privilege === 2"
					>
						<div class="whitelist">
							<el-tag
								:key="tag"
								:disable-transitions="false"
								v-for="tag in advancedData.WhiteList"
								closable
								@close='handleClose(tag)'
							>{{tag}}</el-tag>
						</div>
					</el-form-item>
				</el-form>
				<div class="flex price-div">
					<div class="price-div-bg user-no-select">ON</div>
					<p class="price-gas-fee">Gas Fee: {{uploadPrice}} ONI
						<el-popover
							placement="bottom"
							title="Fee Detail"
							trigger="hover"
						>
							<p>Contract Fee: {{uploadPriceInfo && uploadPriceInfo.TxFeeFormat || parseFloat((0.03 * (this.uploadFormData.Files.length || 1)).toFixed(2))}} ONI</p>
							<p>Storage Fee: {{uploadPriceInfo && uploadPriceInfo.StorageFeeFormat || 0}} ONI</p>
							<p>Validate Fee: {{uploadPriceInfo && uploadPriceInfo.ValidFeeFormat || 0}} ONI</p>
							<span slot="reference"><i class="el-icon-question"></i></span>
						</el-popover>
					</p>
					<p class="price-balance">Available: {{mainCount}} ONI</p>
				</div>
				<div class="flex jc-center submit-foot mb10">
					<ripper-button @click="toEmptyUpload">Cancel</ripper-button>
					<ripper-button
						type="primary"
						class="primary"
						@click="OpenPasswordDialog"
					>Pay & Upload</ripper-button>
				</div>
			</div>
		</div>
		<el-dialog
			width='550px'
			:close-on-click-modal='false'
			:visible.sync="passwordForm.show"
			center
		>
			<div slot="title">
				<h2>Confirm</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content upload-loading">
				<el-form
					ref="passwordForm"
					:model="passwordForm"
					:rules="uploadRules"
					@submit.native.prevent
				>
					<el-form-item
						label="Wallet Password:"
						prop="Password"
					>
						<el-input
							type="password"
							class="grey-theme"
							placeholder="Please Input Wallet Password"
							show-password
							@keyup.native.enter='toUploadFile'
							v-model="passwordForm.Password"
						></el-input>
					</el-form-item>
					<p class="mb20 tr">Confirm Payment: {{uploadPrice}} ONI</p>
				</el-form>
				<div slot="footer">
					<ripper-button @click="passwordForm.show = false">Cancel</ripper-button>
					<ripper-button
						type="primary"
						class="primary"
						@click="toUploadFile"
					>Confirm</ripper-button>
				</div>
			</div>
		</el-dialog>
		<el-dialog
			:close-on-click-modal='false'
			:visible.sync="remindToggle.show"
			center
		>
			<div slot="title">
				<h2>Remind</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content">
				<p class="tl mt10 break-word">The files uploaded by the advance mode will not occupy the space you have purchased, but you will need to pay separately according to the uploaded file conditions and parameter configuration.</p>
				<p class="tr mt10 mb10">
					<el-checkbox
						@change="updateAllowRemind"
						v-model="remindToggle.noAllowRemind"
					>No longer remind</el-checkbox>
				</p>
				<div slot="footer">
					<ripper-button
						class="primary"
						@click="remindToggle.show = false"
					>Close</ripper-button>
				</div>
			</div>
		</el-dialog>
		<!-- no storage dialog -->
		<el-dialog
			width='600px'
			:close-on-click-modal="false"
			:visible.sync="noStorageDialog.show"
			center
		>
			<div slot="title">
				<h2>Notice</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content">
				<p class="mt10 mb20 ft14 tl break-word">Sorry, you don't have any storage yet. Please get storage before the Primary Upload.</p>
				<div slot="footer">
					<ripper-button @click="noStorageDialog.show = false">Cancel</ripper-button>
					<ripper-button
						class="primary"
						@click="goStorage"
					>Get Storage</ripper-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import { ipcRenderer } from "electron";
import util from "../../../assets/config/util";
import { connect } from "net";
import fs from "fs";
import crypto from 'crypto';
import uuid from "node-uuid";
const DEFAULT_UPLOAD_PRICE = 0.03;
export default {
	data() {
		let validateEncryptFileSize = (rule, value, callback) => {
			if (this.uploadFormData.Files.length === 0) {
				callback(new Error(`Please select a file.`));
			} else if (
				!this.switchToggle.advanced &&
				(!this.space || this.space.Remain * 1024 < this.fileSize)
			) {
				callback(
					new Error(
						`Insufficient remaining storage space, currently ${this.util.bytesToSize(
							this.space.Remain * 1024
						)} remaining.`
					)
				);
			} else {
				for (let file of this.uploadFormData.Files) {
					if (file.fileBytes > 4 * 1024 * 1024 * 1024) {
						callback(new Error(`A single file cannot be larger than 4GB`));
						return;
					}
				}
			}
			callback();
		};
		let validateEncryptPassword = (rule, value, callback) => {
			// encryptionToggle
			if (!this.encryptionToggle) {
				callback();
			} else if (this.uploadFormData.EncryptPassword.trim()) {
				callback();
			} else {
				callback(new Error("Please fill encryption passcode "));
			}
		};
		let validateWhiteListRex = (rule, value, callback) => {
			const vm = this;
			const whiteListRex = /^A[1-9A-HJ-NP-Za-km-z]{33}$/;
			if (
				vm.advancedData.wihteListString.length === 0 ||
				whiteListRex.test(vm.advancedData.wihteListString)
			) {
				callback();
			} else {
				callback(new Error("Wrong Wallet Address Format"));
			}
		};
		const BASE = {
			Second: 1,
			Day: 86400,
			Month: 2592000,
			Year: 31536000
		};
		const baseKeys = Object.keys(BASE);
		const DEFAULT_KEY = "Year";
		const DEFAULT_STORAGE_CYCLE = BASE[DEFAULT_KEY];
		return {
			util,
			baseKeys,
			BASE,
			verificationCycleSelected: baseKeys[0], // default Second
			verificationCycleNumber: 1500, // Integrity verification cycle
			storageCycleSelected: DEFAULT_KEY, // default Year
			storageCycleNumber: 1,
			DefaultCopyNum: "", // axios.get
			passwordForm: {
				Password: "",
				show: false
			},
			uploadRules: {
				Password: [
					{ required: true, message: "Please input  password", trigger: "blur" }
				]
			},
			switchToggle: {
				loading: null,
				whiteListInput: false,
				advanced: false, // advanced form
				upload: true
			},
			// wihteListString: "",
			uploadPrice: DEFAULT_UPLOAD_PRICE,
			fileSize: 0,
			encryptionToggle: false,
			uploadFormData: {
				Path: "",
				FileSize: "",
				Files: [],
				// Desc: "",
				EncryptPassword: "" // Encryption
			},
			rules: {
				Path: [
					{ required: true, message: "Please select a file", trigger: "blur" }
				],
				FileSize: [
					{
						validator: validateEncryptFileSize,
						trigger: "change"
					}
				],
				EncryptPassword: [
					{
						required: true,
						validator: validateEncryptPassword,
						trigger: "blur"
					}
				]
			},
			advancedRulus: {
				wihteListString: [
					{
						validator: validateWhiteListRex,
						trigger: "blur"
					}
				]
			},
			advancedData: {
				Duration: DEFAULT_STORAGE_CYCLE, // storage cycle  default forever
				Interval: 0, // Integrity verification cycle
				// Times: 1, // Integrity Times
				Privilege: 1, // Authority
				CopyNum: 1, // axios.get
				wihteListString: "",
				WhiteList: []
			},
			remindToggle: {
				show: false,
				// is not allow change upload model to advanced have remind dialog
				noAllowRemind: localStorage.getItem("uploadToNoAllowRemind") || false
			},
			noStorageDialog: {
				show: false
			},
			uploadPriceInfo: null
		};
	},
	mounted() {
		this.getSpaceIsZero();
		this.setDataInterval();
		this.getfscontractsetting();
	},
	methods: {
		resetFileList() {
			this.uploadFormData.Files = [];
			this.toGetPrice();
			this.toGetFileSize();
			this.$refs.uploadForm.validateField("FileSize");
		},
		handleChange(file, fileList) {
			fs.stat(file.raw.path, (err, stats) => {
				console.log(stats);
				if (err) {
					console.log("err", err);
				}
				if (stats.isDirectory()) return;

				for (let value of this.uploadFormData.Files) {
					if (value.filePath === file.raw.path) {
						return;
					}
				}
				this.uploadFormData.Files.push({
					fileName: file.raw.name,
					filePath: file.raw.path,
					fileBytes: file.size
				});
				this.toGetFileSize();
				this.toGetPrice();
				// this.$refs.upload.clearFiles();
				this.$refs.uploadForm.validateField("FileSize");
			});
		},
		// get space is not zero go expand page
		getSpaceIsZero() {
			this.$axios
				.get(this.$api.userspace + window.localStorage.getItem("Address"))
				.then(res => {
					if (res.Error === 0) {
						// if no space to advanced;
						if (
							!res.Result ||
							(res.Result.Used === 0 && res.Result.Remain === 0)
						) {
							this.toAdvanced();
						}
					}
				});
		},
		// link to expand page
		goStorage() {
			this.$router.push({ name: "expand" });
		},
		// notAllowRemind change to set localstorage
		updateAllowRemind() {
			localStorage.setItem(
				"uploadToNoAllowRemind",
				this.remindToggle.noAllowRemind
			);
		},
		//change upload model to advanced
		toAdvanced() {
			this.switchToggle.advanced = true;
			this.setDataInterval();
			if (!this.remindToggle.noAllowRemind) this.remindToggle.show = true;
			this.$refs.uploadForm.validateField("FileSize");
		},
		advancedDataInit() {
			this.uploadPriceInfo = null;
		},
		// set EncryptPassword init value when encryption select change
		setEncryptPassword() {
			if (!this.encryptionToggle) {
				this.uploadFormData.EncryptPassword = "";
			}
		},
		// get contract setting init value
		getfscontractsetting() {
			this.$axios.get(this.$api.getfscontractsetting).then(res => {
				if (res.Error === 0) {
					this.DefaultCopyNum = res.Result.DefaultCopyNum;
					this.advancedData.CopyNum = this.DefaultCopyNum;
				} else {
					this.$message.error(
						this.$i18n.error[res.Error]
							? this.$i18n.error[res.Error][this.$language]
							: `error code is ${res.Error}`
					);
				}
			});
		},
		// to select file for upload
		selectUpload() {
			const vm = this;
			ipcRenderer.send("upload-file-dialog");
			ipcRenderer.once("selected-upload", (event, content) => {
				// get current select not have file list
				let arr = [];
				let currentFilePathList = [];
				for (let value of this.uploadFormData.Files) {
					currentFilePathList.push(value.filePath);
				}
				for (let value of content.files) {
					if (currentFilePathList.indexOf(value.filePath) === -1) {
						arr.push(value);
					}
				}
				vm.uploadFormData.Files = vm.uploadFormData.Files.concat(arr);
				vm.toGetFileSize();
				// this.fileSize = content.fileBytes;
				// this.uploadFormData.Path = content.filePath;
				// this.uploadFormData.Desc = content.fileName;
				vm.toGetPrice();
				vm.$refs.uploadForm.validateField("FileSize");
			});
		},
		handleCloseByFile(file) {
			this.uploadFormData.Files.splice(
				this.uploadFormData.Files.indexOf(file),
				1
			);
			this.toGetFileSize();
			this.toGetPrice();
			this.$refs.uploadForm.validateField("FileSize");
		},
		// close while list item
		handleClose(tag) {
			this.advancedData.WhiteList.splice(
				this.advancedData.WhiteList.indexOf(tag),
				1
			);
		},
		// add while list item
		setWhiteList() {
			// let array = this.wihteListString.replace(/[\s\r\n]/g, "").split(";");
			// this.advancedData.WhiteList = array;
			const whiteListRex = /^A[1-9A-HJ-NP-Za-km-z]{33}$/;
			if (
				this.advancedData.wihteListString.length != 0 &&
				!whiteListRex.test(this.advancedData.wihteListString)
			) {
				// this.$refs.saveTagInput.$refs.input.focus();
				// this.$message("Wrong Wallet Address Format");
				return;
			}
			let inputValue = this.advancedData.wihteListString.trim();
			if (inputValue) {
				this.advancedData.WhiteList.push(inputValue);
			}
			this.switchToggle.whiteListInput = false;
			this.advancedData.wihteListString = "";
			this.toGetPrice();
		},
		// open while list input for add while list item
		showWhitelistInput() {
			this.switchToggle.whiteListInput = true;
			this.$nextTick(() => {
				this.$refs.saveTagInput.$refs.input.focus();
			});
		},
		// get price when storageCycleNumber and storageCycleSelected be changed
		setDuration() {
			this.advancedData.Duration =
				this.storageCycleNumber * this.BASE[this.storageCycleSelected];
			this.formatVerificationCycleNumber();
			this.toGetPrice();
		},
		// get price when verificationCycleNumber and verificationCycleSelected be changed
		setDataInterval() {
			this.formatVerificationCycleNumber();
			console.log("verificationCycleNumber is: ");
			console.log(this.verificationCycleNumber);
			this.advancedData.Interval =
				this.verificationCycleNumber *
				this.BASE[this.verificationCycleSelected];
			this.toGetPrice();
		},
		// format verificationCycleNumber value
		formatVerificationCycleNumber() {
			console.log("before foramt verificationCycleNumber is ");
			console.log(this.verificationCycleNumber);
			this.verificationCycleNumber = Math.min(
				this.verificationCycleNumber,
				Math.floor(
					this.advancedData.Duration / this.BASE[this.verificationCycleSelected]
				)
			);
		},
		// go filebox page
		toEmptyUpload() {
			// this.uploadFormData.Path = "";
			// this.uploadFormData.Desc = "";
			this.uploadFormData.EncryptPassword = "";
			this.fileSize = 0;
			this.switchToggle.advanced = false;
			this.$router.push({
				name: "filebox"
			});
		},
		// open password dialog
		OpenPasswordDialog() {
			if (!this.switchToggle.upload) return;
			this.$refs.uploadForm.validate(valid => {
				if (!valid) return;
				this.passwordForm.show = true;
				this.$nextTick(() => {
					this.$refs["passwordForm"].resetFields();
				});
			});
		},
		// to upload file
		toUploadFile() {
			const vm = this;
			this.$refs["passwordForm"].validate(async valid => {
				// checkout
				if (!valid) return;
				this.switchToggle.upload = false; // set toggle
				this.switchToggle.loading = this.$loading({
					text: "Uploading..",
					target: ".loading-content.upload-loading"
				});

				// password check
				let passwordEncode = crypto.createHash('sha256').update(vm.passwordForm.Password).digest('hex');
				let passwordParams = {
					Password: passwordEncode
				};
				this.$axios.post(this.$api.checkPassword, passwordParams).then(passwordCheck => {
					if (passwordCheck.Error !== 0) {
						this.switchToggle.upload = true; // set toggle
						this.switchToggle.loading && this.switchToggle.loading.close();
						this.$message.error("Password Check Failed");
					}
	
					// get all upload file params
					let arr = [];
					for (let file of this.uploadFormData.Files) {
						let params = {
							Path: file.filePath,
							Desc: file.fileName,
							EncryptPassword: this.uploadFormData.EncryptPassword,
							StoreType: this.switchToggle.advanced ? 1 : 0,
							Password: passwordEncode,
							// cache upload data↓
							FileSize: file.fileBytes / 1024,
							DetailStatus: "uploadLoading",
							FileName: file.fileName,
							FileHash: "",
							Type: 1,
							Status: 2,
							IsUploadAction: true,
							Id: ('waitfor_' + uuid.v4()),
							Nodes: []
							// ,Url: 'oni://www.filmlabtest9.com'
						};
						params = this.switchToggle.advanced
							? Object.assign({}, params, this.advancedData)
							: params;
						delete params.wihteListString;
						arr.push(params);
					}
	
					let waitForNowUploadLength =
						this.$config.maxNumUpload - this.$store.state.Transfer.uploadTransferList.length ||
						0;
					if (waitForNowUploadLength <= 0) {
						this.switchToggle.loading && this.switchToggle.loading.close();
						this.passwordForm.show = false;
						// this.$store.dispatch("setUpload");
						ipcRenderer.send("run-dialog-event", {name: "setUpload"});
						this.$router.push({
							name: "transfer",
							query: { transferType: 1 }
						});
						this.addTask(arr);
						return;
					}
	
					let errorMsg = ""; // error message
					let flag = false; // is have success
					this.waitForNowUpload({ arr, len: waitForNowUploadLength, errorMsg, flag });
				})
			});
		},
		addTask(arr) {
			let newWaitForUploadList = this.waitForUploadList.concat(arr);
			this.$store.commit("SET_WAIT_FOR_UPLOAD_LIST", newWaitForUploadList);
			ipcRenderer.send("run-dialog-event", {name: "setWaitForUploadList", data: newWaitForUploadList});
			// update WaitForUploadOrderList
			let WaitForUploadOrderList = [];
			for(let value of newWaitForUploadList) {
				WaitForUploadOrderList.push(value.Id);
			}
			ipcRenderer.send("run-dialog-event", {name: "pushWaitForUploadOrderList", data: WaitForUploadOrderList});
		},
		// Call upload interface and joint errorMsg
		waitForNowUpload({ arr, len, errorMsg, flag }) {
			if (!arr || arr.length === 0 || len === 0) {
				this.uploadDone({ arr, errorMsg, flag });
				return;
			}

			let waitForNowUploadList = arr.splice(
				0,
				len > arr.length ? arr.length : len
			); // get now upload list

			let commitAll = [];
			for (let uploadFileParam of waitForNowUploadList) {
				commitAll.push(this.getToUploadFilePromise(uploadFileParam));
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
					this.uploadDone({ arr, errorMsg, flag });
				} else {
					//if have error task joint errorMsg and run me again(argumnets.callee())
					for (let value of errorArr) {
						errorMsg += `<p>`;
						errorMsg += `${value.FileName || ""}`;
						errorMsg += this.$i18n.error[value.Error]
							? this.$i18n.error[value.Error][this.$language]
							: `error code is ${value.Error}`;
						errorMsg += `</p>`;
					}
					let errorLength = errorArr.length;
					this.waitForNowUpload({ arr, len: errorLength, errorMsg, flag });
				}
			});
		},
		// Processing after the interface call is complete
		uploadDone({ errorMsg, flag, arr = [] }) {
			const vm = this;
			// close loading...
			this.switchToggle.loading && this.switchToggle.loading.close();
			this.switchToggle.upload = true; // set toggle
			if (flag === false) {
				// is have upload success task
				if (errorMsg) {
					this.$message.error({
						dangerouslyUseHTMLString: true,
						message: errorMsg
					});
				} else {
					this.$message.error("Upload Error");
				}
			} else {
				if (!errorMsg) {
					this.$message({
						type: "success",
						message: "Start Upload"
					});
				} else {
					this.$message.error({
						dangerouslyUseHTMLString: true,
						message: errorMsg
					});
				}
				this.passwordForm.show = false;
				// this.$store.dispatch("setUpload");
				ipcRenderer.send("run-dialog-event", {name: "setUpload"});
				if (arr.length > 0) {
					setTimeout(() => {
						vm.addTask(arr);
					}, 2000)
				}
				this.$router.push({
					name: "transfer",
					query: { transferType: 1 }
				});
			}
		},
		getToUploadFilePromise(data) {
			return this.$axios.post(this.$api.upload, data);
		},
		toGetFileSize() {
			let fileSize = 0;
			for (let value of this.uploadFormData.Files) {
				fileSize += value.fileBytes;
			}
			this.fileSize = fileSize;
		},
		toGetPricePromise({ filePath }) {
			const path = ipcRenderer.sendSync(
				"string-to-hex",
				filePath
				// this.uploadFormData.Path
			);
			const duration = this.advancedData.Duration;
			const interval = this.advancedData.Interval;
			const copyNum = (this.advancedData.CopyNum *= 1);
			const whitelistCount =
				this.advancedData.Privilege === 2
					? this.advancedData.WhiteList.length
					: 0;
			const storeType = this.switchToggle.advanced ? 1 : 0;
			// if (!path) return;
			return this.$axios.get(this.$api.uploadfee + path, {
				params: { duration, interval, copyNum, whitelistCount, storeType }
			});
		},
		// get price
		toGetPrice() {
			if (!this.switchToggle.advanced) {
				this.uploadPrice = parseFloat(
					(
						DEFAULT_UPLOAD_PRICE * (this.uploadFormData.Files.length || 1)
					).toFixed(2)
				);
				return;
			}
			const commitAll = [];
			if (this.uploadFormData.Files.length === 0) {
				this.uploadPrice = DEFAULT_UPLOAD_PRICE;
				return;
			}
			for (let file of this.uploadFormData.Files) {
				commitAll.push(this.toGetPricePromise(file));
			}
			this.$axios
				.all(commitAll)
				.then(resArr => {
					let storageFee = 0;
					let validateFee = 0;
					let contractFee = 0;
					for (let res of resArr) {
						if (res.Error === 0) {
							storageFee += res.Result.StorageFee;
							validateFee += res.Result.ValidFee;
							contractFee += res.Result.TxFee;
						} else {
							this.$message.error(
								this.$i18n.error[res.Error]
									? this.$i18n.error[res.Error][this.$language]
									: `error code is ${res.Error}`
							);
							return;
						}
					}

					let uploadPriceResult =
						(parseFloat(contractFee) || 0) +
						(parseFloat(storageFee) || 0) +
						(parseFloat(validateFee) || 0);
					this.uploadPrice = parseFloat(
						uploadPriceResult.toFixed(9) / Math.pow(10, 9)
					); // format
					this.uploadPriceInfo = {
						TxFeeFormat: contractFee / Math.pow(10, 9),
						StorageFeeFormat: storageFee / Math.pow(10, 9),
						ValidFeeFormat: validateFee / Math.pow(10, 9)
					};
				})
				.catch(e => {
					this.$message.error("Get Price Failes");
				});
		},
		hiddenAdvanced() {
			if (!this.space || (this.space.Used === 0 && this.space.Remain === 0)) {
				return (this.noStorageDialog.show = true);
			}
			this.advancedDataInit();
			this.switchToggle.advanced = false;
			this.setDataInterval();
			this.$refs.uploadForm.validateField("FileSize");
		}
	},
	computed: {
		mainCount() {
			return this.$store.state.Wallet.mainCount;
		},
		expiredDate() {
			return this.$dateFormat.formatYearMonthDayHour(
				new Date(new Date().getTime() + this.advancedData.Duration * 1000)
			);
		},
		space() {
			return this.$store.state.Filemanager.space;
		},
		waitForUploadList() {
			return this.$store.state.Transfer.waitForUploadList || [];
		}
	}
};
</script>
<style lang="scss">
$inputBg: #edeff4;
$inputFocusBg: #dee2ea;
#upload {
	background: #f9f9fb;
	& > .content {
		height: 100%;
		width: 670px;
		margin: 0 auto;
		padding: 20px 40px;
		.upload-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		.el-input__inner {
			border-radius: 0px;
			height: 35px;
			line-height: 35px;
		}
		.el-input-number {
			height: 35px;
			line-height: 35px;
		}
		.el-input-group__append {
			border-radius: 0px;
			background: #9a9eaf;
			color: #fff;
		}
		.el-form-item {
			border-bottom: 1px solid rgba(0, 0, 0, 0.1);
			padding-bottom: 25px;
		}
		.el-form-item__label {
			font-weight: bold;
			color: #202020;
		}
		.el-select {
			input {
				width: 150px;
				height: 32px;
				border: 1px solid rgba(4, 15, 57, 0.2);
				border-radius: 2px;
				// color: rgba(32, 32, 32, 0.4);
				color: rgba(32, 32, 32, 0.7);
			}
		}
		.form-right {
			position: absolute;
			right: 0;
			top: 50%;
			transform: translateY(-50%);
			transition: none;
			&.el-input {
				width: 150px;
				height: 32px;
				input {
					border: 1px solid #dee2ea;
					border-radius: 2px;
					background: $inputBg;
					// color: rgba(32, 32, 32, 0.4);
					color: rgba(32, 32, 32, 0.7);
					&:focus {
						background: $inputFocusBg;
					}
				}
			}
		}
		.form-right-second {
			position: absolute;
			right: 120px;
			top: 50%;
			transform: translateY(-50%);
			padding-bottom: 0;
			input {
				width: 150px;
				height: 32px;
				border: 1px solid #dee2ea;
				border-radius: 2px;
				background: $inputBg;
				// color: rgba(32, 32, 32, 0.4);
				color: rgba(32, 32, 32, 0.7);
				&:focus {
					background: $inputFocusBg;
				}
			}
		}
		.form-right-second-inside {
			position: absolute;
			right: 170px;
			width: 150px;
			top: 50%;
			transform: translateY(-50%);
			padding-bottom: 0;
			input {
				width: 150px;
				height: 32px;
				border: 1px solid #dee2ea;
				border-radius: 2px;
				background: $inputBg;
				color: rgba(32, 32, 32, 0.7);
				&:focus {
					background: $inputFocusBg;
				}
			}
			.el-input-number__increase,
			.el-input-number__decrease {
				display: none;
			}
		}
		.form-vertical {
			position: relative;
			&.select-file-wrapper {
				border-bottom: 0;
				padding-bottom: 0;
			}
			label {
				font-size: 14px;
				color: #202020;
				width: 100% !important;
			}
			.el-form-item__content {
				margin-left: 0 !important;
				p {
					height: 18px;
					line-height: 18px;
					font-size: 14px;
					width: 480px;
					overflow: hidden;
					text-overflow: ellipsis;
					// color: rgba(32, 32, 32, 0.4);
					color: rgba(32, 32, 32, 0.7);
				}
				.light-blue {
					color: #409ef7;
				}
				.path-wrapper {
					width: 100%;
					height: 180px;
					margin-top: 45px;
					clear: both;
					background: #f9f9fb;

					& > .el-upload {
						width: 100%;
						height: 100%;
						& > .el-upload-dragger {
							& > div {
								height: 100%;
							}
							width: 100%;
							height: 100%;
							border-color: rgba(4, 15, 57, 0.2);
							overflow: visible;
							&.is-dragover {
								border-color: #409eff;
							}
						}
					}

					.path-content {
						padding: 10px 15px;
						width: 100%;
						height: 100%;
						overflow: auto;
						text-align: left;
						background: #f9f9fb;
						position: relative;
						.el-tag {
							margin-right: 20px;
						}
						& > .path-no-data-title {
							width: 100%;
							height: 100%;
							position: absolute;
							top: 0;
							left: 0;
							& > p {
								width: 100%;
								color: rgba(32, 32, 32, 0.4);
							}
						}
					}
				}
				.browser-layout {
					top: 10px;
					position: absolute;
				}
				.browser-layout-reset {
					right: 150px;
					top: 10px;
					position: absolute;
					cursor: pointer;
					&:hover {
						// text-decoration: underline;
						opacity: 0.7;
					}
					&:active {
						opacity: 1;
					}
				}
			}
		}
		.tootips {
			position: absolute;
			right: 0px;
			bottom: 0px;
			transform: translateY(34px);
			white-space: nowrap;
		}
		h1 {
			font-size: 24px;
			// color: #ccc;
			color: #202020;
			margin-top: 20px;
			margin-bottom: 30px;
		}
		.path-input {
			width: 400px;
		}
		.encrypt-input {
			width: 200px;
		}
		.encryptpassword-input {
			display: inline-block;
			border-bottom: 0;
		}
		.whitelist-wrap {
			.el-tag {
				margin-right: 10px;
			}
			.save-tag-input {
				width: 320px;
			}
			& + .el-form-item__error {
				left: 70px;
				top: calc(100% + 3px);
			}
		}
		.whitelist-form-item {
			.el-form-item__content {
				margin-left: 0 !important;
			}
			.whitelist {
				padding: 10px 15px;
				background: #f1f3f7;
				background: $inputBg;
				border: 1px solid #dee2ea;
				width: 100%;
				height: 110px;
				margin-bottom: 15px;
				overflow: auto;
				.el-tag {
					margin-right: 20px;
				}
			}
		}
		.no-bottom-border {
			border-bottom: 0;
			padding-bottom: 0;
		}
	}
	// .el-dialog__body {
	// 	padding-bottom: 0;
	// }
}
</style>
