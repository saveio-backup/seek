<template>
	<div class="file-component">
		{{transferType}}
		<div
		 class="top-progress"
		 v-if="transferType != 2"
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
			 v-if="transferType == 1"
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
			<el-table :data="fileList" empty-text='No data'>
				<el-table-column
				 width="500"
				 prop="Name"
				></el-table-column>
				<el-table-column prop="Name">
					<template slot-scope="scope">
						<!-- api return 'KB' unit -->
						<span>
							{{util.bytesToSize(scope.row.Size * 1024)}}
						</span>
					</template>
				</el-table-column>
				<el-table-column>
					<template slot-scope="scope">
						<el-progress :percentage="(scope.row.Current / scope.row.Size)*100"></el-progress>
					</template>
				</el-table-column>
				<el-table-column>
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
			switchNewTask:false,
			TransferConfig: [
				"completeTransferList",
				"uploadTransferList",
				"downloadTransferList"
			],
			transferTypeConfig: ["Upload", "Download"],
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
