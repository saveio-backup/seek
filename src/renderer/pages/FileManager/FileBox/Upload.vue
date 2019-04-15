<template>
	<div id="upload">
		<div class="content">
			<div class="upload-header">
				<h1>Upload File</h1>
				<span
				 class="text-underline"
				 @click="switchToggle.advanced = true"
				 v-show="!switchToggle.advanced"
				>Advanced</span>
				<span
				 class="text-underline"
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
						<p>{{fileSize || '0.00 GB'}}</p>
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
						 @input="setDuration"
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
						 @input="setDataInterval"
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
						 :min='1'
						 v-model="advancedData.CopyNum"
						></el-input-number>
					</el-form-item>
					<el-form-item
					 label="Authority"
					 prop="Privilege"
					>
						<el-select v-model="advancedData.Privilege">
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
						<el-input
						 type="textarea"
						 v-model="wihteListString"
						 @blur="setWhiteList"
						></el-input>
					</el-form-item>
				</el-form>
				<el-button
				 type="primary"
				 @click="toUploadFile"
				>Pay & Upload</el-button>
				<el-button @click="toEmptyUpload">Cancel</el-button>
				{{advancedData.WhiteList}}
			</div>
		</div>
	</div>
</template>
<script>
import { ipcRenderer } from "electron";
import util from "../../../assets/config/util";
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
				advanced: false, // advanced form
				upload: true
			},
			wihteListString: "",
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
			});
		},
		setWhiteList() {
			let array = this.wihteListString.replace(/[\s\r\n]/g, "").split(";");
			this.advancedData.WhiteList = array;
		},
		setDuration() {
			this.advancedData.Duration =
				this.storageCycleNumber * this.BASE[this.storageCycleSelected];
		},
		setDataInterval() {
			this.advancedData.Interval =
				this.verificationCycleNumber *
				this.BASE[this.verificationCycleSelected];
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
						this.$router.push({ name: "transfer", query: { transferType: 0 } });
					} else {
						this.$message.error("Upload Error");
					}
				})
				.catch(() => {
					this.$message.error("Upload Error");
					this.switchToggle.upload = true;
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
	& > .content {
		padding: 20px 40px;
		.upload-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
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
	}
}
</style>
