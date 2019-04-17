<template>
	<div id="income">
		Income Detail
		<el-date-picker
		 v-model="dateRange"
		 type="daterange"
		 unlink-panels
		 range-separator="to"
		 start-placeholder="start"
		 end-placeholder="end"
		>
		</el-date-picker>
		<div>
			<el-table :data="mockData" empty-text="No data">
				<el-table-column label="File Name" prop="Name"></el-table-column>
				<el-table-column label="Size" prop="Size"></el-table-column>
			</el-table>
		</div>
	</div>
</template>
<script>
export default {
	data() {
		return {
			dateRange: "",
			mockData: [
				{
					Hash: "QmP9pWe9W6KWnVkoEAFPFvfRYDHft7bvq5aAsTGhjpUCvK",
					Name: "text.txt",
					Size: 1024,
					DownloadCount: 10,
					DownloadAt: 1555166657,
					LastShareAt: 1555166657,
					Profit: 10
				}
			]
		};
	}
};
</script>
<style lang="scss">
</style>
