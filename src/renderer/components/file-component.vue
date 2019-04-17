<template>
	<div class="file-component">
		{{transferType}}
		<div
		 class="top-progress"
		 v-if="transferType != 0"
		>
			<span>{{transferTypeConfig[transferType]}} progress</span>
			<el-progress
			 class="progress"
			 :percentage="70"
			></el-progress>
			<el-button>Pause All</el-button>
			<el-button>Start all</el-button>
			<el-button>Cancel All</el-button>
			<el-button
			 v-if="transferType == 2"
			 @click="switchNewTask=true"
			>New Task</el-button>
		</div>
		<div v-else>
			Finished " " Files
		</div>
		<el-dialog
		 title='New Download'
		 width='600px'
		 :visible.sync="switchNewTask"
		>
			<download-dialog></download-dialog>
		</el-dialog>
		<div class="file-list">
			<el-table
			 :data="fileList"
			 empty-text='No data'
			>
			<el-table-column
				 width="500"
				 label="FileName"
				 prop="FileName"
				></el-table-column>
				<el-table-column
				 width="500"
				 label="FileHash"
				 prop="FileHash"
				></el-table-column>
				<el-table-column
				 label="FileSize"
				 prop="FileSize"
				>
					<template slot-scope="scope">
						<!-- api return 'KB' unit -->
						<span>
							{{util.bytesToSize(scope.row.FileSize * 1024)}}
						</span>
					</template>
				</el-table-column>
				<el-table-column label="Progress">
					<template slot-scope="scope">
						<el-progress :percentage="(scope.row.DownloadSize / (scope.row.FileSize?scope.row.FileSize:1))*100"></el-progress>
					</template>
				</el-table-column>
				<el-table-column
				 label="Status"
				 prop="Status"
				></el-table-column>
				<el-table-column label="opera">
					<span>pause</span>
					<span>continue</span>
					<span>cancel</span>
					<span>detail</span>
				</el-table-column>
			</el-table>
		</div>
	</div>
</template>
<script>
import util from "../assets/config/util";
import downloadDialog from "./DownloadDialog.vue";
export default {
	props: {
		transferType: {
			required: true,
			type: Number // 0 upload 1 download
		}
	},
	components: {
		downloadDialog
	},
	data() {
		return {
			util,
			switchNewTask: false,
			TransferConfig: [
				"completeTransferList",
				"uploadTransferList",
				"downloadTransferList"
			],
			transferTypeConfig: ["Completed", "Upload", "Download"],
			mockFileList: [
				{
					Hash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYwL",
					Name: "hahat.txt",
					Current: 500,
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				}
			]
		};
	},
	computed: {
		fileList: function() {
			return this.$store.state.Transfer[this.TransferConfig[this.transferType]];
		}
	},
	methods: {}
};
</script>
<style lang="scss">
.file-component {
	.top-progress {
		display: flex;
		.progress {
			flex: 1;
		}
	}
}
</style>
