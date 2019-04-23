<template>
	<div id="income">
		<div class="header">
			<p class="light-theme-title mb10">Income Detail</p>
			<el-date-picker
			class="common-el-input"
			 v-model="dateRange"
			 @change='offset = 0'
			 type="daterange"
			 unlink-panels
			 range-separator="to"
			 start-placeholder="start"
			 end-placeholder="end"
			>
			</el-date-picker>
		</div>

		<el-table
		 class="flex1 incomeTable"
		 ref="incomeTable"
		 :data="result.Incomes"
		 empty-text="No data"
		 height='100%'
		>
			<el-table-column
			 label="File Name"
			 prop="Name"
			></el-table-column>
			<el-table-column
			 label="Income"
			 prop="ProfitFormat"
			></el-table-column>
			<el-table-column label="Time">
				<template slot-scope="scope">
					<div>
						{{$dateFormat.formatTimeByTimestamp(scope.row.SharedAt*1000)}}
					</div>
				</template>
			</el-table-column>
		</el-table>

	</div>
</template>
<script>
export default {
	data() {
		const now = Math.floor(new Date().getTime());
		const start = now - 2592000000;
		return {
			dateRange: [start, now],
			mockData: [
				{
					Name: "test",
					Profit: 1000000000,
					ProfitFormat: "1",
					SharedAt: 1555491126
				},
				{
					Name: "test",
					Profit: 1000000000,
					ProfitFormat: "1",
					SharedAt: 1555491126
				},
				{
					Name: "test",
					Profit: 1000000000,
					ProfitFormat: "1",
					SharedAt: 1555491126
				},
				{
					Name: "test",
					Profit: 1000000000,
					ProfitFormat: "1",
					SharedAt: 1555491126
				},
				{
					Name: "test",
					Profit: 1000000000,
					ProfitFormat: "1",
					SharedAt: 1555491126
				},
				{
					Name: "test",
					Profit: 1000000000,
					ProfitFormat: "1",
					SharedAt: 1555491126
				},
				{
					Name: "test",
					Profit: 1000000000,
					ProfitFormat: "1",
					SharedAt: 1555491126
				},
				{
					Name: "test",
					Profit: 1000000000,
					ProfitFormat: "1",
					SharedAt: 1555491126
				},
				{
					Name: "test",
					Profit: 1000000000,
					ProfitFormat: "1",
					SharedAt: 1555491126
				},
				{
					Name: "test",
					Profit: 1000000000,
					ProfitFormat: "1",
					SharedAt: 1555491126
				},
				{
					Name: "test",
					Profit: 1000000000,
					ProfitFormat: "1",
					SharedAt: 1555491126
				}
			],
			result: { TotalIncome: 0, TotalIncomeFormat: 0, Incomes: [] },
			loadSwitch: true,
			offset: 0,
			limit: 20
		};
	},
	mounted() {
		let element = this.$refs.incomeTable.bodyWrapper;
		this.addListenScroll(element, this.loadSwitch, 300, this.getIncom);
		this.getIncom();
	},
	methods: {
		addListenScroll(element, toggle, distance, callback) {
			element.addEventListener("scroll", function() {
				if (toggle) {
					if (
						element.scrollTop + element.clientHeight + distance >=
						element.scrollHeight
					) {
						console.log("scroll Toggle");
						callback();
					}
				} else {
				}
			});
		},
		getIncom() {
			if (!this.loadSwitch) return;
			this.loadSwitch = false;
			let addr =
				this.$api.income +
				Math.floor(new Date(this.dateRange[0]).getTime() / 1000) +
				"/" +
				Math.floor(new Date(this.dateRange[1]).getTime() / 1000) +
				"/" +
				this.offset * this.limit +
				"/" +
				(this.offset * this.limit + this.limit - 1);
			this.$axios
				.get(addr)
				.then(res => {
					console.log(res);
					if (res.data.Error === 0) {
						const result = res.data.Result;
						this.result.TotalIncome = result.TotalIncome;
						this.result.TotalIncomeFormat = result.TotalIncomeFormat;
						if (result.Incomes.length > 0) {
							this.offset = this.offset + 1;
							this.result.Incomes = this.result.Incomes.concat(result.Incomes);
						} else {
							this.loadSwitch = false;
							return;
						}
						this.loadSwitch = true;
					}
				})
				.catch(err => {
					console.error(err);
					this.loadSwitch = true;
				});
		}
	}
};
</script>
<style lang="scss">
#income {
	height: 100%;
	display: flex;
	flex-direction: column;
	& > .header {
		background: #eeeef1;
		padding: 20px 50px;
	}
	.incomeTable {
		height: 100%;
	}
}
</style>
