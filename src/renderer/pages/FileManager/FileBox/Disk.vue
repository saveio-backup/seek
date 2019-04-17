<template>
	<div id="disk">
		<div
		 class="func-nav"
		 v-if="controlBar !== 'close'"
		>
			<div class="fun-button">
				<router-link :to="{name:'upload'}">
					<el-button>Upload</el-button>
				</router-link>
				<el-button
				 type="success"
				 @click="toDownload"
				>Download</el-button>
				<el-button type="primary">Share</el-button>
			</div>
			<div class="fun-search">
				<el-input
				 v-model="filterInput"
				 placeholder="search by name"
				></el-input>
			</div>
		</div>
		<div
		 class="func-nav"
		 v-else
		>
			Miner Control
			<div class="fun-search">
				<el-input
				 v-model="filterInput"
				 placeholder="search by name"
				></el-input>
			</div>
		</div>
		<div class="content">
			<div class="table-element">
				<el-table
				 ref='table'
				 :data="filterListData"
				 height="100%"
				 @select="selectFile"
				 @select-all="selectFile"
				>

					<el-table-column
					 v-if="toggleFilebox"
					 type="selection"
					 width="55"
					></el-table-column>

					<el-table-column
					 label="Filename"
					 width="500"
					 prop="Name"
					>
						<template slot-scope="scope">
							<div>{{ scope.row.Name }}</div>
						</template>
					</el-table-column>
					<el-table-column label="Size">
						<template slot-scope="scope">
							<!-- api return 'KB' unit -->
							<span>
								{{util.bytesToSize(scope.row.Size * 1024)}}
							</span>
						</template>
					</el-table-column>
					<el-table-column
					 label="Download statistics"
					 prop="DownloadCount"
					></el-table-column>
					<el-table-column
					 label="Profit"
					 prop="Profit"
					></el-table-column>
					<el-table-column
					 label="Last Share"
					 v-if="page ==='miner'"
					>
						<template slot-scope="scope">
							<span>{{date.formatTime(new Date(scope.row.LastShareAt * 1000))}}</span>
						</template>
					</el-table-column>
					<el-table-column
					 label="Type"
					 v-if="page === 'filebox'"
					>
						<template slot-scope="scope">
							<span>
								{{privilegeConfig[scope.row.Privilege]}}
							</span>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>

	</div>
</template>
<script>
import date from "../../../assets/tool/date";
import util from "../../../assets/config/util";
let tableElement;
export default {
	data() {
		return {
			toggleFilebox: false,
			date,
			util,
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
			offsetArray: [],
			fileSelected: [],
			controlBar: true,
			type: "",
			switchToggle: {
				load: true
			},
			page: "",
			addrAPI: "",
			limitCount: 20
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
			let offset = this.offsetArray[this.type] || 0;
			let addr =
				this.addrAPI +
				this.type +
				"/" +
				offset * this.limitCount +
				"/" +
				(offset * this.limitCount + this.limitCount - 1);
			this.$axios
				.get(addr)
				.then(res => {
					if (res.data.Error === 0) {
						const result = res.data.Result;
						if (result.length) {
							// do sth
							this.offsetArray[this.type] = this.offsetArray[this.type]
								? this.offsetArray[this.type] + 1
								: 1;
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
		toDownload() {
			const fileSelected = this.fileSelected;
			const length = fileSelected.length;
			const commitAll = [];
			for (let i = 0; i < length; i++) {
				console.log(i);
				commitAll.push(
					this.$axios
						.post(this.$api.download, {
							Hash: fileSelected[i].Hash,
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
		}
	},
	computed: {
		filterListData: function() {
			const filterInput = this.filterInput;
			const fileListData = this.fileListData;
			return fileListData.filter(item => {
				return item.Name.indexOf(filterInput) >= 0;
			});
		}
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			vm.type = to.query.type;
			vm.controlBar = to.query.controlBar;
			vm.addrAPI = to.query.addrAPI || vm.$api.getFileList;
			// vm.page = to.query.type || "filebox";
			vm.getFileLists();
		});
	},
	beforeRouteUpdate(to, from, next) {
		this.type = to.query.type;
		this.offsetArray = [];
		this.switchToggle.load = true;
		this.fileListData = [];
		this.getFileLists();
		next();
	}
};
</script>
<style lang="scss">
$light-grey: #f2f2f2;
#disk {
	.func-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 50px;
		height: 80px;
		background: $light-grey;
	}
	& > .content {
		position: absolute;
		top: 80px;
		bottom: 0px;
		width: 100%;
		.table-element {
			height: 100%;
			overflow-y: hidden;
		}
	}
}
</style>
