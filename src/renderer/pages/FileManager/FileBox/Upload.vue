<template>
	<div id="upload">
		<div class="content">
			<div class="upload-header">
				<h1 class="user-no-select">Upload File</h1>
				<el-button
					class="primary small"
					@click="switchToggle.advanced = true"
					v-show="!switchToggle.advanced"
				><i class="ofont ofont-gaoji"></i> Advanced</el-button>
				<el-button
					class="primary small"
					@click="hiddenAdvanced"
				 v-show="switchToggle.advanced"
				><i class="ofont ofont-jiandan"></i> Simple</el-button>
			</div>
			<div class="upload-params">
				<el-form
				 ref="uploadForm"
				 :model="uploadFormData"
				 :rules="rules"
				 hide-required-asterisk
				 label-position="left"
				 label-width="200px"
				>
					<el-form-item
					 label="Choose File:"
					 class="form-vertical"
					 prop="Path"
					>
						<p class="path-input">{{uploadFormData.Path}}</p>
						<el-button
						 class="form-right"
						 @click="selectUpload"
						>Browser</el-button>
					</el-form-item>
					<el-form-item
					 class="form-vertical"
					 label="File Size:"
					>
						<p class="light-blue">{{fileSize || '0.00 GB'}}</p>
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
				 label-position="left"
				 label-width="200px"
				>
					<el-form-item label="Storage Cycle:">
						<!-- <el-input-number
						> </el-input-number> -->
						<el-input
						 v-model="storageCycleNumber"
						 :min="1"
						 @change="setDuration"
						 :disabled="advancedData.Duration === 0"
						 type="number"
						 class="form-right-second-inside"
						></el-input>
						<el-select
						 class="form-right"
						 v-model="storageCycleSelected"
						 @change="setDuration"
						>
							<el-option
							 v-for="item in baseKeys"
							 :key="item"
							 :label="item"
							 :value="item"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item
					 label="Integrity verification cycle:"
					 prop="Interval"
					>
						<!-- <el-input-number
						>
						</el-input-number> -->
						<el-input
						 v-model="verificationCycleNumber"
						 :min='1'
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
						<!-- <el-input-number
							class="form-right"
						 :min='0'
						 v-model="advancedData.CopyNum"
						 @change='toGetPrice'
						></el-input-number> -->
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
					 prop="WhiteList"
					 class="no-bottom-border"
					 v-show="advancedData.Privilege === 2"
					>
						<div class="whitelist-wrap">
							<el-input
							 v-if="switchToggle.whiteListInput"
							 v-model="wihteListString"
							 class="save-tag-input form-right"
							 ref="saveTagInput"
							 size="small"
							 @keyup.enter.native="setWhiteList"
							 @blur="setWhiteList"
							></el-input>
							<el-button
							 v-else
							 size="small"
							 class="form-right"
							 @click="showWhitelistInput"
							> + Add WhiteList</el-button>
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
					<div class="price-div-bg">SA</div>
					<p class="price-gas-fee">Gas fee: {{uploadPrice}} SAVE</p>
					<p class="price-balance">balance: {{mainCount}} SAVE</p>
				</div>
				<div class="flex jc-center submit-foot">
					<el-button @click="toEmptyUpload">Cancel</el-button>
					<el-button
					 type="primary"
					 class="primary"
					 @click="toUploadFile"
					>Upload</el-button>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import { ipcRenderer } from "electron";
import util from "../../../assets/config/util";
const DEFAULT_UPLOAD_PRICE = 0.03;
export default {
	data() {
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
		const BASE = {
			Day: 86400,
			Month: 2592000,
			Year: 31536000,
			Permanent: 0
		};
		const baseKeys = Object.keys(BASE);
		return {
			baseKeys,
			BASE,
			verificationCycleSelected: baseKeys[1], // default Month
			verificationCycleNumber: 1, // Integrity verification cycle (default 2 month)
			storageCycleSelected: baseKeys[3], // default Permanent
			storageCycleNumber: 1,
			DefaultCopyNum: '', // axios.get
			switchToggle: {
				loading: null,
				whiteListInput: false,
				advanced: false, // advanced form
				upload: true
			},
			wihteListString: "",
			uploadPrice: DEFAULT_UPLOAD_PRICE,
			fileSize: 0,
			encryptionToggle: false,
			uploadFormData: {
				Path: "",
				Desc: "",
				EncryptPassword: "" // Encryption
			},
			rules: {
				Path: [
					{ required: true, message: "Please chosse file", trigger: "blur" }
				],
				EncryptPassword: [
					{
						required: true,
						validator: validateEncryptPassword,
						trigger: "blur"
					}
				]
			},
			advancedData: {
				Duration: 0, // storage cycle  default forever
				Interval: 0, // Integrity verification cycle
				// Times: 1, // Integrity Times
				Privilege: 1, // Authority
				CopyNum: 1, // axios.get
				// "Url": "oni://share/12nsdhu",
				WhiteList: []
			}
		};
	},
	mounted() {
		this.setDataInterval();
		this.getfscontractsetting();
	},
	methods: {
		advancedDataInit() {
			this.advancedData = {
				Duration: 0,
				Interval: 0,
				Privilege: 1,
				CopyNum: this.DefaultCopyNum,
				WhiteList: []
			};
			this.verificationCycleSelected = this.baseKeys[1];
			this.verificationCycleNumber = 1;
		},
		setEncryptPassword() {
			if (!this.encryptionToggle) {
				this.uploadFormData.EncryptPassword = "";
			}
		},
		getfscontractsetting() {
			this.$axios.get(this.$api.getfscontractsetting).then(res => {
				if (res.data.Error === 0) {
					this.DefaultCopyNum = res.data.Result.DefaultCopyNum;
					this.advancedData.CopyNum = this.DefaultCopyNum;
				}
			});
		},
		selectUpload() {
			ipcRenderer.send("upload-file-dialog");
			ipcRenderer.once("selected-upload", (event, content) => {
				this.fileSize = util.bytesToSize(content.fileBytes);
				this.uploadFormData.Path = content.filePath;
				this.uploadFormData.Desc = content.fileName;
				this.toGetPrice();
			});
		},
		handleClose(tag) {
			this.advancedData.WhiteList.splice(
				this.advancedData.WhiteList.indexOf(tag),
				1
			);
		},
		setWhiteList() {
			// let array = this.wihteListString.replace(/[\s\r\n]/g, "").split(";");
			// this.advancedData.WhiteList = array;
			let inputValue = this.wihteListString.trim();
			if (inputValue) {
				this.advancedData.WhiteList.push(inputValue);
			}
			this.switchToggle.whiteListInput = false;
			this.wihteListString = "";
			this.toGetPrice();
		},
		showWhitelistInput() {
			this.switchToggle.whiteListInput = true;
			this.$nextTick(() => {
				this.$refs.saveTagInput.$refs.input.focus();
			});
		},
		setDuration() {
			this.advancedData.Duration =
				this.storageCycleNumber * this.BASE[this.storageCycleSelected];
			this.toGetPrice();
		},
		setDataInterval() {
			this.advancedData.Interval =
				this.verificationCycleNumber *
				this.BASE[this.verificationCycleSelected];
			this.toGetPrice();
		},
		toEmptyUpload() {
			this.uploadFormData.Path = "";
			this.uploadFormData.Desc = "";
			this.uploadFormData.EncryptPassword = "";
			this.fileSize = 0;
			this.switchToggle.advanced = false;
			this.$router.push({
				name: "filebox"
			});
		},
		toUploadFile() {
			if (!this.switchToggle.upload) return;
			this.$refs.uploadForm.validate(valid => {
				if (!valid) return;
				this.switchToggle.upload = false; // set toggle
				this.switchToggle.loading = this.$loading({
					lock: true,
					text: "Uploading..",
					target: "#upload"
				});
				let data = null;
				data = this.switchToggle.advanced
					? Object.assign(this.uploadFormData, this.advancedData)
					: this.uploadFormData;
				this.$axios
					.post(this.$api.upload, data)
					.then(res => {
						this.switchToggle.upload = true;
						if (res.data.Error === 0) {
							this.$store.dispatch("setUpload");
							this.$router.push({
								name: "transfer",
								query: { transferType: 1 }
							});
						} else if (res.data.Error === 54002) {
							this.$message.error("You don't have enough storage space to use");
						} else if (res.data.Error === 55011) {
							this.$message.error("Your storage has expired.");
						} else {
							this.$message.error(res.data.Desc);
						}
						this.switchToggle.loading.close();
					})
					.catch(() => {
						this.$message.error("Upload Error");
						this.switchToggle.upload = true;
						this.switchToggle.loading.close();
					});
			});
		},
		toGetPrice() {
			if (!this.switchToggle.advanced) {
				this.uploadPrice = DEFAULT_UPLOAD_PRICE;
				return;
			}
			// let Path = encodeURIComponent(this.uploadFormData.Path);
			const path = ipcRenderer.sendSync(
				"string-to-hex",
				this.uploadFormData.Path
			);
			const duration = this.advancedData.Duration;
			const interval = this.advancedData.Interval;
			const copynum = this.advancedData.CopyNum;
			const whitelistcount =
				this.advancedData.Privilege === 2
					? this.advancedData.WhiteList.length
					: 0;
			this.$axios
				.get(this.$api.uploadfee + path, {
					params: { duration, interval, copynum, whitelistcount }
				})
				.then(res => {
					console.log(res);
					if (res.data.Error === 0) {
						this.uploadPrice = res.data.Result.FeeFormat;
					} else if (res.data.Error === 54002) {
						this.$message.error("You don't have enough storage space to use.");
					} else if (res.data.Error === 55011) {
						this.$message.error("Your storage has expired.");
					} else {
						this.$message.error(res.data.Desc);
					}
				});
		},
		hiddenAdvanced() {
			this.advancedDataInit();
			this.setDataInterval();
			this.switchToggle.advanced = false;
		}
	},
	computed: {
		mainCount() {
			return this.$store.state.Wallet.mainCount;
		}
		// storageCycleNumber: function() {
		// 	return this.verificationCycleNumber * this.advancedData.Times;
		// }
	}
};
</script>
<style lang="scss">
$inputBg:#f1f3f7;
$inputFocusBg: #e0e2e6;
#upload {
	height: 100%;
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
			padding-bottom: 15px;
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
				color: rgba(32, 32, 32, 0.4);
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
					color: rgba(32, 32, 32, 0.4);
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
				color: rgba(32, 32, 32, 0.4);
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
				color: rgba(32, 32, 32, 0.4);
				&:focus {
					background: $inputFocusBg;
				}
			}
		}
		.form-vertical {
			position: relative;
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
					width: 550px;
					overflow: hidden;
					text-overflow: ellipsis;
					color: rgba(32, 32, 32, 0.4);
				}
				.light-blue {
					color: #409ef7;
				}
			}
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
		}
		.whitelist-form-item {
			.whitelist {
				padding: 10px 15px;
				background: #f1f3f7;
				border: 1px solid #dee2ea;
				width: 100%;
				height: 110px;
				margin-bottom: 15px;
				overflow: auto;
				.el-tag {
					margin-right: 20px;
				}
			}
			.el-form-item__content {
				margin-left: 0 !important;
			}
		}
		.no-bottom-border {
			border-bottom: 0;
			padding-bottom: 0;
		}
		.price-div {
			width: calc(100% - 30px);
			height: 54px;
			margin: 0 auto 20px;
			background: linear-gradient(
				90deg,
				rgba(19, 176, 250, 1) 0%,
				rgba(62, 126, 235, 1) 100%
			);
			box-shadow: 0px 2px 20px 0px rgba(196, 196, 196, 0.24);
			border-radius: 6px;
			color: #fff;
			line-height: 54px;
			padding: 0 15px;
			position: relative;
			.price-div-bg {
				position: absolute;
				top: 0px;
				right: -10px;
				font-size: 108px;
				font-weight: bold;
				color: #fff;
				opacity: 0.1;
			}
			.price-gas-fee {
				float: left;
				margin-right: 30px;
				font-size: 18px;
				font-weight: 500;
			}
			.price-balance {
				float: left;
				font-size: 14px;
				font-weight: 500;
				opacity: 0.7;
			}
		}
	}
}
</style>
