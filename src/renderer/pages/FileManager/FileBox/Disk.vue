<template>
	<div id="disk">
		<div
		 class="func-nav"
		 v-if="controlBar !== 'close'"
		>
			<div class="fun-button">
				<router-link :to="{name:'upload'}">
					<el-button class="primary theme-font-blue">Upload</el-button>
				</router-link>
				<el-button
				 class="ml10 bt-download theme-font-blue"
				 @click="batchDownload"
				>
					Download
				</el-button>
			</div>
			<div class="fun-search">
				<el-input
				 v-model="filterInput"
				 prefix-icon="el-icon-search"
				 placeholder="search by name"
				  class="grey-theme"
				></el-input>
			</div>
		</div>
		<div
		 class="func-nav"
		 v-else
		>
			<p class='light-theme-title user-no-select'>
				Miner Control
			</p>
			<div class="fun-search">
				<el-input
				 v-model="filterInput"
				 prefix-icon="el-icon-search"
				 placeholder="search by name"
				></el-input>
			</div>
		</div>
		<div class="content">
			<div class="table-element">
				<el-table
				border
				 ref='table'
				 @row-click="clickRow"
				 :data="filterListData"
				 height="100%"
				 @selection-change="selectFile"
				>
					<!-- :data="filterListData" -->
					<el-table-column
					 v-if="toggleFilebox"
					 type="selection"
					 width="30"
					></el-table-column>

					<el-table-column
					 label="File Name"
					 width="500"
					 prop="Name"
					 class-name="rowName"
					>
						<template slot-scope="scope">
							<div class="flex between">
								<span>{{ scope.row.Name }}</span>
								<!-- @click="executedFile = scope.row" -->
								<div class="opera">
									<i
									 @click.stop="shareFile(scope.row)"
									 title="Share"
									 class="el-icon-share"
									></i>
									<i
									 v-if="page === 'filebox'"
									 class="el-icon-download"
									 title="Download"
									 @click.stop="downloadFile(scope.row)"
									></i>
									<i
									 v-if="page === 'filebox'"
									 title="Delete"
									 @click.stop="deleteFile(scope.row)"
									 class="el-icon-delete"
									></i>
									<i
									 v-if="page === 'miner' && scope.row.Path"
									 @click="showInFolder(scope.row.Path)"
									 class="ofont ofont-file"
									 title="Open Folder"
									></i>
									<!-- @click.stop="switchToggle.deleteDialog = true" -->
								</div>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="Owner" v-if="page ==='miner'">
						<template slot-scope="scope">
							<span class="td-grey">{{scope.row.OwnerAddress || 'Nameless'}}</span>
						</template>
					</el-table-column>
					<el-table-column label="Size">
						<template slot-scope="scope">
							<!-- api return 'KB' unit -->
							<span class="td-grey">
								{{util.bytesToSize(scope.row.Size * 1024)}}
							</span>
						</template>
					</el-table-column>
					<!-- <el-table-column
					 label="Download statistics"
					 prop="DownloadCount"
					></el-table-column>-->
					<el-table-column
					 v-if="page ==='miner'"
					 label="Profit"
					>
						<template slot-scope="scope">
							<div class="light-blue">
								{{parseFloat(scope.row.Profit / 1000000000).toFixed(9)}} SAVE
							</div>
						</template>
					</el-table-column>
					<el-table-column v-if="page ==='miner'" label="Contributions" prop="DownloadCount">

					</el-table-column>
					<el-table-column label="Date">
						<template slot-scope="scope">
							<div class="td-grey">
								{{date.formatTime(new Date( (scope.row.DownloadAt||scope.row.UpdatedAt) * 1000))}}
							</div>
						</template>
					</el-table-column>
					<!-- <el-table-column
					 label="Last Share"
					 v-if="page ==='miner'"
					>
						<template slot-scope="scope">
							<span class="td-grey">{{date.formatTime(new Date(scope.row.LastShareAt * 1000))}}</span>
						</template>
					</el-table-column> -->
					<el-table-column
					 label="Type"
					 v-if="page === 'filebox'"
					>
						<template slot-scope="scope">
							<span class="td-grey">
								{{privilegeConfig[scope.row.Privilege]}}
							</span>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>
		<el-dialog
		 :close-on-click-modal='false'
		 :visible.sync="switchToggle.shareDialog"
		 center
		>
			<div slot="title">
				<h2>Share</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content">
				<p class="mt10 mb20 tl">{{executedFile.Name}}</p>
				<el-input
				readonly
				:value="executedFile.Url || executedFile.Hash"
				class="mb20 grey-theme icon-no-bg"
				>
					<template slot="append">
						<i
						class="el-icon-document addr_btn"
						@click="toClipboard(executedFile.Url || executedFile.Hash)"
						:aria-label='executedFile.Hash'
						></i>
					</template>
				</el-input>
				<div slot="footer">
					<!-- slot="footer" -->
					<el-button
					type="primer"
					@click="switchToggle.shareDialog = false"
					>Close</el-button>
				</div>
			</div>
		</el-dialog>
		<el-dialog
		 :close-on-click-modal='false'
		 :visible.sync="switchToggle.deleteDialog"
		 center
		>
			<div slot="title">
				<h2>Notice</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div class="loading-content">
				<p class="mt10 mb10">Are your Sure to Delete this File?</p>
				<p class="mb20">{{executedFile.Name}}</p>
				<div slot="footer">
					<el-button @click="switchToggle.deleteDialog = false">Cancel</el-button>
					<el-button
					type="danger"
					class="primary"
					@click="toDeleteFile(fileListData, executedFile.Hash)"
					>Delete</el-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import date from "../../../assets/tool/date";
import util from "../../../assets/config/util";
import { clipboard, shell } from "electron";

let tableElement;
export default {
	data() {
		return {
			clipboard,
			toggleFilebox: false,
			date,
			util,
			executedFile: {}, // a file be opera
			filterInput: "",
			mockMiner: [
				{
					Hash: "QmP9pWe9W6KWnVkoEAFPFvfRYDHft7bvq5aAsTGhjpUCvK",
					Name: "text.txt",
					Size: 1024,
					DownloadCount: 10,
					DownloadAt: 1555166657,
					LastShareAt: 1555166657,
					Privilege: 0,
					Profit: 10
				}
			],
			mockData: [
				{
					Hash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYwL",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 0
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "nihaoaaaaaa.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "helloworld.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				},
				{
					Hash: "Qma5AY9yC8TkWVU6oys7reUpkBpWAohyCvRxR3VEG2h9Ti",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051257,
					UpdatedAt: 0,
					Profit: 0,
					Privilege: 1
				}
			],
			fileListData: [],
			privilegeConfig: ["Private", "Public", "Whitelist"],
			fileSelected: [],
			controlBar: true,
			type: "",
			switchToggle: {
				shareDialog: false,
				deleteDialog: false,
				load: true
			},
			page: "",
			addrAPI: "",
			limitCount: 20,
			currentFile: null
		};
	},
	mounted() {
		// window.vue = this;
		this.page = this.$route.query.page || "filebox";
		this.$nextTick(() => {
			if (this.page == "filebox") {
				this.toggleFilebox = true;
			}
		});
		tableElement = this.$refs.table.bodyWrapper;
		this.addListenScroll();
	},
	methods: {
		clipText(el) {
			clipboard.writeText(this.executedFile.Hash);
			this.$message({
				message: "Copied",
				duration: 1200,
				type: "success"
			});

			// console.log("clip");
			// const clip = new ClipboardJS(el, {
			// 	text: function(trigger) {
			// 		return trigger.getAttribute("aria-label");
			// 	}
			// });
			// clip.on("success", e => {
			// 	this.$message({
			// 		message: "Link Copied",
			// 		duration: 1200,
			// 		type: "success"
			// 	});
			// 	console.log("success");
			// 	console.log(e);
			// 	clip.destroy();
			// });
		},
		toClipboard(text) {
			clipboard.writeText(text);
			this.$message({
				message: "Copied",
				duration: 1200,
				type: "success"
			});
		},
		showInFolder(path) {
			shell.showItemInFolder(path);
		},
		clickRow(row) {
			this.$refs.table.clearSelection();
			this.$refs.table.toggleRowSelection(row);
		},
		addListenScroll() {
			const that = this;
			const distance = 300;
			tableElement.addEventListener("scroll", function() {
				if (that.switchToggle.load) {
					if (
						tableElement.scrollTop + tableElement.clientHeight + distance >=
						tableElement.scrollHeight
					) {
						console.log("scroll Toggle");
						that.getFileLists();
					}
				} else {
				}
			});
		},
		selectFile(file) {
			console.log("file Select!!!");
			console.log(file);
			this.fileSelected = file;
		},
		getFileLists() {
			if (!this.switchToggle.load) return;
			this.switchToggle.load = false; // if your are loading list now,  the switch will be set to false
			let addr =
				this.addrAPI +
				this.type +
				"/" +
				this.fileListData.length +
				"/" +
				this.limitCount;
			this.$axios
				.get(addr)
				.then(res => {
					if (res.data.Error === 0) {
						const result = res.data.Result;
						if (result.length) {
							// do sth
							this.fileListData = this.fileListData.concat(result);
						} else {
							this.switchToggle.load = false;
							return;
						}
					}
					this.switchToggle.load = true;
				})
				.catch(err => {
					console.error(err);
					this.switchToggle.load = true;
				});
		},
		shareFile(file) {
			this.executedFile = file;
			this.switchToggle.shareDialog = true;
		},
		downloadFile(file) {
			this.toDownload([file]);
		},
		batchDownload() {
			const NO_DOWNLOAD_FILE_MSG =
				"Please select the file you want to download.";
			if (!this.fileSelected || this.fileSelected.length === 0) {
				this.$message({
					message: NO_DOWNLOAD_FILE_MSG
				});
				return;
			}
			this.toDownload(this.fileSelected);
		},
		toDownload(downloadFiles) {
			const length = downloadFiles.length;
			const commitAll = [];
			for (let i = 0; i < length; i++) {
				console.log(i);
				commitAll.push(
					this.$axios
						.post(this.$api.download, {
							Url: downloadFiles[i].Url,
							MaxPeerNum: 10
						})
						.then(res => {
							console.log("downloading");
							console.log(res);
						})
				);
			}
			this.$axios.all(commitAll).then(
				this.$axios.spread(() => {
					// this.$store.dispatch("setDownload");
					this.$router.push({
						name: "transfer",
						query: {
							transferType: 2
						}
					});
				})
			);
		},
		deleteFile(file) {
			this.executedFile = file;
			this.switchToggle.deleteDialog = true;
		},
		toDeleteFile(dataList, hash) {
			this.switchToggle.deleteDialog = false;
			this.$axios.post(this.$api.delete, { Hash: hash }).then(res => {
				if (res.data.Error === 0) {
					dataList.some((item, index) => {
						if (item.Hash === hash) {
							dataList.splice(index, 1);
							return true;
						} else {
							return false;
						}
					});
				}
			});
		}
	},
	computed: {
		filterListData: function() {
			const fileListData = this.fileListData;
			return fileListData.filter(item => {
				return item.Name.indexOf(this.filterInput) >= 0 && item.Url;
			});
		}
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			vm.type = to.query.type;
			vm.controlBar = to.query.controlBar;
			if (to.query.addrAPI) {
				vm.addrAPI = to.query.addrAPI;
			} else if (to.query.page === "miner") {
				vm.addrAPI = vm.$api.getDownloadFileList;
			} else {
				vm.addrAPI = vm.$api.getFileList;
			}
			// vm.page = to.query.type || "filebox";
			vm.getFileLists();
		});
	},
	beforeRouteUpdate(to, from, next) {
		this.type = to.query.type;
		this.switchToggle.load = true;
		this.fileListData = [];
		this.getFileLists();
		next();
	}
};
</script>
<style lang="scss">
$light-blue: #65a6ff;
$light-grey: #f9f9fb;
$theme-color: #1b1e2f;
$theme-font-blue: #040f39;
#disk {
	.func-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30px 0 14px;
		height: 80px;
		background: $light-grey;
		border-bottom: 1px solid rgba(32, 32, 32, 0.1);
		.fun-button {
			button {
				width: 125px;
			}
		}
		.bt {
			width: 100px;
			height: 33px;
			padding: 0px;
			border-color: $theme-color;
			border-radius: 2px;
			background: none;
			box-shadow: 0px 0px 4px 0px rgba(0, 122, 255, 0.3);
			border-radius: 16px;
			border: 1px solid rgba(47, 143, 240, 1);
			color: #2f8ff0;

			&:hover {
				opacity: 0.7;
			}

			&:active {
				opacity: 1;
			}

			&.bt-upload {
				color: #fff;
				background: $light-blue;
				border: none;
				background: linear-gradient(
					90deg,
					rgba(19, 175, 250, 1) 0%,
					rgba(62, 126, 235, 1) 100%
				);
				box-shadow: 0px 4px 6px 0px rgba(111, 139, 173, 0.21);
				border-radius: 16px;
			}
		}
		.fun-search {
			width: 240px;

			.el-input__inner {
				height: 33px;
				line-height: 33px;
				border-radius: 17px;
			// 	font-weight: normal;
				background: #edeff4;
			// 	color: rgba(32, 32, 32, 0.7);
				padding-left: 40px;
				&:focus {
					background: #dcdee3;
				}
			}
			.el-input__prefix {
				left: 10px;
				.el-input__icon {
					line-height: 34px;
					font-size: 16px;
					color: rgba(32, 32, 32, 0.4);
				}
			}
		}
	}
	& > .content {
		position: absolute;
		top: 80px;
		bottom: 0px;
		width: 100%;
		padding-top: 20px;
		background: #f9f9fb;

		.table-element {
			// font-weight: bold;
			height: 100%;
			overflow-y: hidden;
			.rowName {
				.opera {
					display: none;
					color: rgba(32, 32, 32, 0.4);
					font-weight: bold;
					[class^="el-icon-"] {
						margin: 0px 4px;
						font-size: 18px;
						cursor: pointer;
						&:hover {
							color: $light-blue;
						}
						&:active {
							opacity: 0.7;
						}
					}
				}
				&:hover {
					.opera {
						display: flex;
						justify-content: center;
						align-items: center;
					}
				}
			}
		}
		.td-grey {
			color: rgba(32, 32, 32, 0.4);
		}

	}
	.icon-no-bg {
		.el-input-group__append {
			background: #F1F3F7;
			border: 0;
			i {
				&:hover {
					color: #2F8FF0;
				}
				&:active {
					color: rgba(47, 143, 240, .7);
				}
			}
		}
	}
	.el-input-group__append {
		[class^="el-icon-"] {
			font-size: 18px;
			cursor: pointer;
		}
	}
}
</style>
