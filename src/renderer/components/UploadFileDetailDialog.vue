<template>
	<div class="upload-file-detail">
		<el-dialog
			width="600px"
			:close-on-click-modal='false'
			:visible.sync="fileDetailDialogToggle"
			center
		>
			<div slot="title">
				<h2>File Detail</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content upload-file-detail-loading">
				<div class="adjust">
					<div class="adjust-item">
						<p class="adjust-title theme-font-blue ft14">File Hash:</p>
						<div class="adjust-info">
							<p class="theme-font-blue ft14 mr20">{{fileDetail && fileDetail.FileHash || ''}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title theme-font-blue ft14">Create Date:</p>
						<div class="adjust-info">
							<p class="theme-font-blue ft14 mr20">{{fileDetail && $dateFormat.formatTimeByTimestamp(fileDetail.CreatedAt*1000) || ''}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title theme-font-blue ft14">Node Number:</p>
						<div class="adjust-info">
							<p class="theme-font-blue ft14 mr20">{{fileDetail && (fileDetail.CopyNum + 1) || ''}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title theme-font-blue ft14">Verification Cycle:</p>
						<div class="adjust-info">
							<p class="theme-font-blue ft14 mr20">{{fileDetail && timeTofilter(fileDetail.Interval)}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title theme-font-blue ft14">Expire Time:</p>
						<div class="adjust-info">
							<p class="theme-font-blue ft14 mr20">{{fileDetail && $dateFormat.formatTimeByTimestamp(fileDetail.ExpiredAt*1000) || ''}}</p>
						</div>
					</div>
					<div class="adjust-item">
						<p class="adjust-title theme-font-blue ft14">Authority:</p>
						<div class="adjust-info">
							<p class="theme-font-blue ft14 mr20">{{fileDetail && (fileDetail.Privilege===0?'private':fileDetail.Privilege===1?'public':fileDetail.Privilege===2?'whitelist':'') || ''}}</p>
						</div>
					</div>
					<div
						v-if="fileDetail && fileDetail.Privilege === 2"
						class="adjust-item"
					>
						<p class="adjust-title theme-font-blue ft14">Whitelist:</p>
						<div class="adjust-info">
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
					<el-button
						class="primary"
						type="primary"
						@click="fileDetailDialogToggle=false"
					>Close</el-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>
<script>
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
			return function(value) {
				if(!value) {
					return ''
				}
				if(value/BASE['Month'] >= 1) {
					return `${value/BASE['Month']} Month`
				} else if(value/BASE['Day'] >= 1) {
					return `${value/BASE['Day']} Day`
				} else {
					return `${value/BASE['Second']} Second`
				}
			}
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
			this.$axios
				.get(this.$api.getUploadFileInfo + hash, {
					loading: {
						text: "loading...",
						target: ".loading-content.upload-file-detail-loading"
					}
				})
				.then(res => {
					if (res.Error === 0) {
						this.fileDetail = res.Result;
					} else {
						this.$message.error(
							this.$i18n.error[res.Error]
								? this.$i18n.error[res.Error][this.$language]
								: `error code is ${res.Error}`
						);
					}
				})
				.catch(err => {
					console.log(err);
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
			font-size: 14px;
			width: 160px;
			padding-right: 30px;
			text-align: right;
			color: rgba(32, 32, 32, 0.4);
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
