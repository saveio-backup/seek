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
				<div class="adjust">
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
						<p class="adjust-title ft14">{{$t('fileManager.verificationCycle')}}:</p>
						<div class="adjust-info">
							<p class="ftpx14 mr20">{{fileDetail && timeTofilter(fileDetail.Interval)}}</p>
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
									{{item}}
								</li>
							</ul>
						</div>
					</div>
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
		}
	},
	data() {
		return {
			fileDetailDialogToggle: false,
			fileDetail: null,
			loading: null,
			util,
			BASE
		};
	},
	watch: {
		hash() {
			this.init();
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
					}
				});
		},
		toClose() {
			this.$emit("closeUploadFileDetail");
		}
	},
	mounted() {
		this.init();
	}
};
</script>
<style lang="scss">
.upload-file-detail {
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
			ul {
				max-height: 150px;
				overflow: auto;
				li {
					margin-bottom: 10px;
				}
			}
		}
	}
}
</style>
