<template>
	<div id="upload">
		<div class="content">
			<div class="upload-header">
				<h1>Upload File</h1>
				<span
				 class="text-underline active-blue ft18"
				 @click="switchToggle.advanced = true"
				 v-show="!switchToggle.advanced"
				>Advanced</span>
				<span
				 class="text-underline active-blue ft18"
				 @click="switchToggle.advanced = false"
				 v-show="switchToggle.advanced"
				>Simple</span>
			</div>
			<div class="upload-params">
				<el-form
				 ref="uploadForm"
				 :model="uploadFormData"
				 :rules="rules"
				 label-position="left"
				 label-width="200px"
				>
					<el-form-item
					 label="Choose File:"
					 prop="Path"
					>
						<el-input
						 v-model="uploadFormData.Path"
						 :readonly="true"
						 class="path-input"
						>
							<el-button
							 slot="append"
							 @click="selectUpload"
							>Browser</el-button>
						</el-input>
					</el-form-item>
					<el-form-item label="File Size">
						<p class="light-blue">{{fileSize || '0.00 GB'}}</p>
					</el-form-item>
					<el-form-item label="Price">
						<p>{{uploadPrice}}</p>
					</el-form-item>
					<el-form-item label="Encryption:">
						<el-select
						 v-model="encryptionToggle"
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
						 class="encryptpassword-input"
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
						<el-input-number
						 v-model="storageCycleNumber"
						 :min="1"
						 @change="setDuration"
						 :disabled="advancedData.Duration === 0"
						> </el-input-number>
						<el-select
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
						<el-input-number
						 v-model="verificationCycleNumber"
						 :min='1'
						 @change="setDataInterval"
						 class="cyclenumber-input"
						>
						</el-input-number>
						<el-select
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
						<el-input-number
						 :min='0'
						 v-model="advancedData.CopyNum"
						 @change='toGetPrice'
						></el-input-number>
					</el-form-item>
					<el-form-item
					 label="Authority"
					 prop="Privilege"
					>
						<el-select
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
					 v-show="advancedData.Privilege === 2"
					>
						<div class="whitelist-wrap">
							<el-tag							
							 :key="tag"
							 :disable-transitions="false"
							 v-for="tag in advancedData.WhiteList"
							 closable
							 @close='handleClose(tag)'
							>{{tag}}</el-tag>
							<el-input
							 v-if="switchToggle.whiteListInput"
							 v-model="wihteListString"
							 class="save-tag-input"
							 ref="saveTagInput"
							 size="small"
							 @keyup.enter.native="setWhiteList"
							 @blur="setWhiteList"
							></el-input>
							<el-button
							 v-else
							 size="small"
							 @click="showWhitelistInput"
							> + Add WhiteList</el-button>
						</div>
					</el-form-item>
				</el-form>
				<div class="flex jc-center submit-foot">
					<el-button
					 type="primary"
					 @click="toUploadFile"
					>Upload</el-button>
					<el-button @click="toEmptyUpload">Cancel</el-button>
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
			switchToggle: {
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
				CopyNum: 3, // Backups default 3
				// "Url": "oni://share/12nsdhu",
				WhiteList: []
			}
		};
	},
	mounted() {
		this.setDataInterval();
	},
	methods: {
		setEncryptPassword() {
			if (!this.encryptionToggle) {
				this.uploadFormData.EncryptPassword = "";
			}
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
		handleClose(tag){
			this.advancedData.WhiteList.splice(this.advancedData.WhiteList.indexOf(tag),1)
		},
		setWhiteList() {
			// let array = this.wihteListString.replace(/[\s\r\n]/g, "").split(";");
			// this.advancedData.WhiteList = array;
			let inputValue = this.wihteListString.trim();
			if(inputValue){
				this.advancedData.WhiteList.push(inputValue)
			}
			this.switchToggle.whiteListInput = false;
			this.wihteListString = '';
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
		},
		toUploadFile() {
			if (!this.switchToggle.upload) return;
			this.switchToggle.upload = false; // set toggle
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
						this.$router.push({ name: "transfer", query: { transferType: 1 } });
					} else {
						this.$message.error(res.data.Desc);
					}
				})
				.catch(() => {
					this.$message.error("Upload Error");
					this.switchToggle.upload = true;
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
				encodeURIComponent(this.uploadFormData.Path)
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
				});
		}
	},
	computed: {
		// storageCycleNumber: function() {
		// 	return this.verificationCycleNumber * this.advancedData.Times;
		// }
	}
};
</script>
<style lang="scss">
#upload {
	height: 100%;
	& > .content {
		height: 100%;
		background: #ededed;
		padding: 20px 40px;
		.upload-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		.el-button {
			border-radius: 0px;
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
		.el-form-item__label {
			font-weight: bold;
		}
		h1 {
			font-size: 24px;
			color: #ccc;
			margin-bottom: 40px;
		}
		.path-input {
			width: 400px;
		}
		.encrypt-input {
			width: 200px;
		}
		.encryptpassword-input {
			display: inline-block;
		}
		.whitelist-wrap {
			.el-tag{
				margin-right:10px;
			}
			.save-tag-input {
				width:90px;
			}
		}
	}
}
</style>
