<template>
	<div id="income">
		<div class="header">
			<p class="light-theme-title mb10 user-no-select">Profit Detail</p>
			<el-date-picker
				class="common-el-input"
				v-model="dateRange"
				type="daterange"
				@change="dateChanageGetIncom"
				unlink-panels
				range-separator="to"
				start-placeholder="Start"
				end-placeholder="End"
			>
			</el-date-picker>
			<div class="total-income ft14">Total Profit: <span>{{filterFloat(result.TotalIncomeFormat).toLocaleString('en-US') || 0}} SAVE</span></div>
		</div>

		<el-table
			class="flex1 incomeTable"
			border
			ref="incomeTable"
			:data="result.Incomes"
			empty-text="No Data"
			height='100%'
		>
			<el-table-column
				label="File Name"
				prop="Name"
			></el-table-column>
			<el-table-column label="Profit(SAVE)">
				<template slot-scope="scope">
					<div>
						{{scope.row.ProfitFormat}}
					</div>
				</template>
			</el-table-column>
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
import { filterFloat } from "../../assets/config/util";
export default {
	data() {
		const now = Math.floor(new Date().getTime());
		const start = now - 2592000000;
		return {
			filterFloat,
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
		dateChanageGetIncom() {
			this.loadSwitch = true;
			this.result.Incomes = [];
			this.getIncom();
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
				this.result.Incomes.length +
				"/" +
				this.limit;
			this.$axios
				.get(addr)
				.then(res => {
					console.log(res);
					const result = res.Result;
					this.result.TotalIncome = result.TotalIncome;
					this.result.TotalIncomeFormat = result.TotalIncomeFormat;
					// this.result.TotalIncomeFormat = 20124.123;
					// this.result.Incomes = this.mockData;
					if (result.Incomes.length > 0) {
						this.result.Incomes = this.result.Incomes.concat(result.Incomes);
					} else {
						this.loadSwitch = false;
						return;
					}
					this.loadSwitch = true;
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
		background: #f9f9fb;
		padding: 20px 20px;
		border-bottom: 1px solid rgba(32, 32, 32, 0.1);
		position: relative;
	}
	.incomeTable {
		height: 100%;
	}
	.el-table {
		padding-top: 20px;
	}
	.total-income {
		color: rgba(32, 32, 32, 0.4);
		font-size: 14px;
		position: absolute;
		bottom: 15px;
		right: 70px;
		span {
			color: rgba(32, 32, 32, 1);
			font-size: 18px;
			margin-left: 10px;
		}
	}
}
</style>
