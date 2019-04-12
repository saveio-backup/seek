<template>
	<div id="disk">
		<div class="func-nav">
			<div class="fun-button">
				<router-link :to="{name:'upload'}">
					<el-button>Upload</el-button>
				</router-link>
				<el-button type="success">Download</el-button>
				<el-button type="primary">Share</el-button>
			</div>
			<div class="fun-search">
				<el-input placeholder="search by name"></el-input>
			</div>
		</div>
		<div class="content">
			<div style="position:absolute; top:0; left:50%">当前 type {{type}}</div>
			<div class="table-element">
				<el-table ref='table' :data="mockData" height="100%">
					<el-table-column
					 type="selection"
					 width="55"
					></el-table-column>
					<el-table-column
					 label="Filename"
					 prop="Name"
					></el-table-column>
					<el-table-column label="Size">
						<template slot-scope="scope">
							<span>
								{{util.bytesToSize(scope.row.Size)}}
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
					<el-table-column label="Type">
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
import util from "../../../assets/config/util";
let tableElement;
export default {
	data() {
		return {
			util,
			mockData: [
				{
					Hash: "QmYaQ9667z6D11FZ9yECeUWDQkboLmu7UCrhVgJUutsYwL",
					Name: "hahat.txt",
					Size: 1536,
					DownloadCount: 0,
					ExpiredAt: 1555051356,
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
			privilegeConfig: ["Private", "Public", "Whitelist"],
			offsetArray: [],
			type: "",
			loadToggle: true,
			limit: 20
		};
	},
	mounted() {
		// window.vue = this;
		tableElement = this.$refs.table.bodyWrapper;
		this.addListenScroll();
	},
	methods: {
		addListenScroll() {
			const that = this;
			const distance = 300;
			tableElement.addEventListener("scroll", function() {
				if (that.loadToggle) {
					if (
						tableElement.scrollTop +
							tableElement.clientHeight +
							distance >=
						tableElement.scrollHeight
					) {
						console.log("scroll Toggle");
						that.getFileLists();
					}
				} else {
				}
			});
		},
		getFileLists() {
			if (!this.loadToggle) return;
			this.loadToggle = false; // if your are loading list now,  the switch will be set to false
			this.$axios
				.get(
					this.$api.getFileList +
						this.type +
						"/" +
						(this.offsetArray[this.type] || 0) +
						"/" +
						this.limit
				)
				.then(res => {
					console.log(res);
					if (res.data.Error === 0) {
						const result = res.data.Result;
						if (result.length) {
							// do sth
							this.offsetArray[this.type] = this.offsetArray[this.type]
								? this.offsetArray[this.type] + 1
								: 1;
						}
					}
					this.loadToggle = true;
					// setTimeout(() => {
					// 	this.loadToggle = true;
					// }, 3000);
				})
				.catch(err => {
					console.error(err);
					this.loadToggle = true;
				});
		}
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			vm.type = to.query.type;
			vm.getFileLists();
		});
	},
	beforeRouteUpdate(to, from, next) {
		this.type = to.query.type;
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
	&>.content{
		position: absolute;
		top:80px;
		bottom:0px;
		width:100%;
		.table-element{
			height: 100%;
			overflow-y: hidden;
		}
	}
}
</style>
