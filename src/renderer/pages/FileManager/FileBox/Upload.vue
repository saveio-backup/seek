<template>
	<div id="upload">
		<div class="content">
			<div class="upload-header">
				<h1>Upload File</h1>
				<span class="text-underline">Advanced</span>
			</div>
			<div class="upload-params">
				<el-form
				 :model="uploadFormData"
				 label-position="left"
				 label-width="200px"
				>
					<el-form-item
					 label="Choose File:"
					 prop="Path"
					>
						<el-input
						 v-model="uploadFormData.Path"
						 class="path-input"
						>
							<el-button slot="append">Browser</el-button>
						</el-input>
					</el-form-item>
					<el-form-item label="File Size">
						<p>{{fileSize || '0.00 GB'}}</p>
					</el-form-item>
					<el-form-item
					 label="Encryption:"
					 prop="EncryptPassword"
					>
						<el-select v-model="encryptionToggle">
							<el-option
							 label="Yes"
							 :value='true'
							></el-option>
							<el-option
							 label="NO"
							 :value='false'
							></el-option>
						</el-select>
						<el-input
						 v-model="uploadFormData.EncryptPassword"
						 class="encrypt-input"
						></el-input>
					</el-form-item>
				</el-form>

				<!-- advanced Section -->

				<el-form
				 :v-model="advancedData"
				 label-position="left"
				 label-width="200px"
				>
					<el-form-item label="Storage Cycle:">
						{{storageCycleNumber}} {{baseSelected}}
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
						 v-model="baseSelected"
						 @change="setDataInterval"
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
					 label="Integrity Times"
					 prop="Times"
					>
						<el-input-number v-model="advancedData.Times"></el-input-number>
					</el-form-item>
					<el-form-item
					 label="Backups"
					 prop="CopyNum"
					>
						<el-input-number v-model="advancedData.CopyNum"></el-input-number>
					</el-form-item>
					<el-form-item
					 label="Authority"
					 prop="Privilege"
					>
						<el-select v-model="advancedData.Privilege">
							<el-option
							 v-for="i in 3"
							 :key="i"
							 :label="i-1"
							 :value="i-1"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item
					 label="white list"
					 prop="WhiteList"
					>
						<el-input
						 type="textarea"
						 v-model="wihteListString"
						 @blur="setWhiteList"
						></el-input>
					</el-form-item>
				</el-form>
        {{advancedData.WhiteList}}
			</div>
		</div>
	</div>
</template>
<script>
export default {
	data() {
		const BASE = {
			Day: 86400,
			Month: 2592000,
			Year: 1314000
		};
		const baseKeys = Object.keys(BASE);
		return {
			baseKeys,
			BASE,
			baseSelected: baseKeys[1],
			wihteListString: "",
			fileSize: 0,
			verificationCycleNumber: 2, // Integrity verification cycle (default 2 month)
			encryptionToggle: true,
			uploadFormData: {
				Path: "./wallet.dat",
				Desc: "wallet.dat",
				EncryptPassword: "" // Encryption
			},
			advancedData: {
				Interval: 0, // Integrity verification cycle
				Times: 3, // Integrity Times
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
		setWhiteList() {
      let string = this.wihteListString.replace(/[\s\r\n]/g, "");
      string = string.split(";");
      this.advancedData.WhiteList = string;
		},
		setDataInterval() {
			this.advancedData.Interval =
				this.verificationCycleNumber * this.BASE[this.baseSelected];
		}
	},
	computed: {
		storageCycleNumber: function() {
			return this.verificationCycleNumber * this.advancedData.Times;
		}
	}
};
</script>
<style lang="scss">
#upload {
	& > .content {
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
	}
}
</style>
