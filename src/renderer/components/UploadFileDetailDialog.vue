<template>
	<div class="upload-file-detail">
		<el-dialog
			width="600px"
			:close-on-click-modal='false'
			:visible.sync="fileDetailDialogToggle"
			center
		>
			<div slot="title">
				<h2>{{$t('fileManager.fileDetail')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content upload-file-detail-loading">
				<div class="flex around upload-file-detail-title" v-if="nodes && !isClose">
					<div class="upload-file-detail-title-item" @click="selectType(0)" :class="{'select': type === 0}">{{$t('fileManager.basicInfo')}}</div>
					<div class="upload-file-detail-title-item" @click="selectType(1)" :class="{'select': type === 1}">{{$t('fileManager.nodesInfo')}}</div>
				</div>
				<div class="adjust" v-if="!nodes || type === 0">
					<div class="adjust-item">
						<p class="adjust-title ft14">{{$t('fileManager.fileHash')}}:</p>
						<div class="adjust-info">
							<p class="ftpx14 mr20">{{fileDetail && fileDetail.FileHash || ''}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title ft14">{{$t('fileManager.createDate')}}:</p>
						<div class="adjust-info">
							<p class="ftpx14 mr20">{{fileDetail && $dateFormat.formatTimeByTimestamp(fileDetail.CreatedAt*1000) || ''}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title ft14">{{$t('fileManager.fileSize')}}:</p>
						<div class="adjust-info">
							<p class="ftpx14 mr20">{{fileDetail && util.bytesToSize(fileDetail.Size*1024 || 0) || ''}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title ft14">{{$t('fileManager.nodeNumber')}}:</p>
						<div class="adjust-info">
							<p class="ftpx14 mr20">{{fileDetail && (fileDetail.CopyNum + 1) || ''}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title ft14">{{$t('fileManager.proveLevel')}}:</p>
						<div class="adjust-info">
							<p class="ftpx14 mr20">{{fileDetail && !!fileDetail.ProveLevel && $t(`fileManager['${fileDetail.ProveLevel}']`) || ''}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title ft14">{{$t('fileManager.expireTime')}}:</p>
						<div class="adjust-info">
							<p class="ftpx14 mr20">{{fileDetail && $dateFormat.formatTimeByTimestamp(fileDetail.ExpiredAt*1000) || ''}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title ft14">{{$t('fileManager.authority')}}:</p>
						<div class="adjust-info">
							<p class="ftpx14 mr20">{{fileDetail && (fileDetail.Privilege===0?$t('fileManager.private'):fileDetail.Privilege===1?$t('fileManager.public'):fileDetail.Privilege===2?$t('fileManager.whitelist'):'') || ''}}</p>
						</div>
					</div>
					<div
						v-if="fileDetail && fileDetail.Privilege === 2"
						class="adjust-item"
					>
						<p class="adjust-title ft14">{{$t('fileManager.whitelist2')}}:</p>
						<div class="adjust-info ftpx14">
							<ul>
								<li
									v-for="item in fileDetail.Whitelist"
									:key="item"
								>
								<p>{{item}}</p>
								</li>
							</ul>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title ft14">{{$t('fileManager.encryption')}}:</p>
						<div class="adjust-info">
							<p class="ftpx14 mr20">{{fileDetail && (fileDetail.Encrypt?$t('fileManager.yes'):$t('fileManager.no'))}}</p>
						</div>
					</div>
				</div>
				<div class="adjust" v-if="nodes && type === 1">
					<el-table
						:data="nodes"
						:empty-text='$t("public.noData")'
					>
						<el-table-column
							type="index"
							:index="indexMethod"
							width="80"
						>
						</el-table-column>
						<el-table-column
							label='HostAddr'
							prop="HostAddr"
							min-width="140"
						>
						</el-table-column>
						<el-table-column
							:label='$t("public.status")'
							min-width="180"
						>
							<template slot-scope="scope">
								<div>
									<el-progress
										class="file-progress flex1 ai-center mr10"
										:class="{'progressAnimate': scope.row.State != 4 && scope.row.State != 0}"
										:percentage="percentage(scope.row.UploadSize)"
									></el-progress>
								</div>
							</template>
						</el-table-column>
					</el-table>
				</div>
				<div slot="footer">
					<ripper-button
						class="primary"
						type="primary"
						@click="fileDetailDialogToggle=false"
					>{{$t('public.close')}}</ripper-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import util from "../assets/config/util";
const BASE = {
	Second: 1,
	Day: 86400,
	Month: 2592000
};
export default {
	props: {
		hash: {
			required: true,
			type: String //file hash
		},
		fileNodes: {
			required: false,
			type: Array,
			default: () => []
		},
		isClose: {
			required: false,
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			fileDetailDialogToggle: false,
			fileDetail: null,
			loading: null,
			util,
			BASE,
			type: 0, // 0: basic info、 1: nodes info
			list: [
				{
					HostAddr: "tcp://40.73.103.72:38942",
					UploadSize: 50,
					Hash: "12312323",
					status: 0
				},
				{
					HostAddr: "tcp://40.73.103.72:38943",
					UploadSize: 99,
					Hash: "12312323",
					status: 0
				}
			]
		};
	},
	watch: {
		hash() {
			this.init();
			this.type = 0;
		},
		fileDetailDialogToggle(oldVal, newVal) {
			if (newVal) {
				this.$nextTick(() => {
					this.toClose();
				});
			}
		}
	},
	computed: {
		timeTofilter() {
			const vm = this;
			return function(value) {
				if (!value) {
					return "";
				}
				if (value / BASE["Month"] >= 1) {
					return `${parseFloat((value / BASE["Month"]).toFixed(3))} ${vm.$t(
						"fileManager.Month"
					)}`;
				} else if (value / BASE["Day"] >= 1) {
					return `${parseFloat((value / BASE["Day"]).toFixed(3))} ${vm.$t(
						"fileManager.Day"
					)}`;
				} else {
					return `${value / BASE["Second"]} ${vm.$t("fileManager.Second")}`;
				}
			};
		},
		syncObj() {
			let obj = {};
			let syncList = this.$store.state.Transfer.syncList || [];
			for (let value of syncList) {
				obj[value.Hash] = value;
			}
			return obj;
		},
		percentage() {
			const vm = this;
			return function(uploadSize) {
				if (!uploadSize) return 0;
				if (!vm.fileDetail) return 0;
				return Math.ceil((uploadSize / vm.fileDetail.Size) * 100);
			};
		},
		nodes() {
			let _nodes;
			if(!this.syncObj[this.hash] || this.syncObj[this.hash].Nodes.length < 1) {
				if(!this.fileNodes || this.fileNodes.length < 1) return [];
				// _nodes = this.fileNodes.slice(1);
				_nodes = this.fileNodes;
			} else {
				// _nodes = this.syncObj[this.hash].Nodes.slice(1);
				_nodes = this.syncObj[this.hash].Nodes;
			}
			return _nodes;
		}
	},
	methods: {
		init() {
			if (!this.hash) {
				this.fileDetailDialogToggle = false;
			} else {
				this.fileDetailDialogToggle = true;
				this.$nextTick(() => {
					this.getFileDetail(this.hash);
				});
			}
		},
		getFileDetail(hash) {
			const vm = this;
			this.$axios
				.get(this.$api.getUploadFileInfo + hash, {
					loading: {
						text: vm.$t("fileManager.loading"),
						target: ".loading-content.upload-file-detail-loading"
					}
				})
				.then(res => {
					if (res.Error === 0) {
						this.fileDetail = res.Result;
					} else {
						this.$message.error(this.$t(`error[${res.Error}]`));
					}
				})
				.catch(e => {
					if (!e.message.includes("timeout")) {
						this.$message.error(
							vm.$t("fileManager.networkErrorGetFileDetailFailed")
						);
					} else {
						this.$message.error(vm.$t('error.requestTimeout'));
					}
				});
		},
		toClose() {
			this.$emit("closeUploadFileDetail");
		},
		selectType(type) {
			this.$nextTick(() => {
				this.type = type;
			});
		},
		indexMethod(index) {
			return `${this.$t('fileManager.node')}${index + 1}`;
		}
	},
	mounted() {
		this.init();
	}
};
</script>
<style lang="scss">
.upload-file-detail {
	.upload-file-detail-title {
		height: 69px;

		.upload-file-detail-title-item {
			line-height: 69px;
			position: relative;
			cursor: pointer;

			&::before {
				content: "";
				display: block;
				position: absolute;
				transition: all 0.3s ease;
				background: #2f8ff0;
				height: 2px;
				width: 40px;
				bottom: 10px;
				left: 50%;
				margin-left: -20px;
				transform: scale(0, 1);
			}

			&:hover,
			&.select {
				color: #2f8ff0;
				&::before {
					transform: scale(1, 1);
				}
			}
		}
	}
	.adjust {
		padding-bottom: 20px;
		.el-input-number__increase,
		.el-input-number__decrease {
			display: none;
		}

		.el-table {
			border-width: 1px;
			border-style: solid;
			border-bottom: 0;
			@include themify {
				border-color: $table-border-color;
			}
			tr {
				td {
					@include themify {
						background-color: $card-color;
					}
				}
			}
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
			.sizeunit {
				width: 100px;
				margin: 0 20px;
			}
			& > p {
				@extend .tertiary-font-color;
			}
			ul {
				max-height: 150px;
				overflow: auto;
				li {
					margin-bottom: 10px;
					@extend .grey-color;
				}
			}
		}
	}
}
</style>
