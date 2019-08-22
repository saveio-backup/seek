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

		<!-- border -->
		<el-table
			class="flex1 incomeTable"
			ref="incomeTable"
			:data="result.Incomes"
			empty-text="No Data"
			height='100%'
		>
			<el-table-column
				label="File Name"
				prop="Name"
				sortable
			></el-table-column>
			<el-table-column
				label="Profit(SAVE)"
				sortable
				prop="Profit"
			>
				<template slot-scope="scope">
					<div>
						{{scope.row.ProfitFormat}}
					</div>
				</template>
			</el-table-column>
			<el-table-column
				label="Time"
				sortable
				prop="SharedAt"
			>
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
					Name: "tet",
					Profit: 1,
					ProfitFormat: "1",
					SharedAt: 155491126
				},
				{
					Name: "te41st",
					Profit: 1,
					ProfitFormat: "1",
					SharedAt: 15491126
				},
				{
					Name: "fstest",
					Profit: 1124,
					ProfitFormat: "1124",
					SharedAt: 15491126
				},
				{
					Name: "tdsest",
					Profit: 1362,
					ProfitFormat: "1362",
					SharedAt: 15591126
				},
				{
					Name: "tes525235t",
					Profit: 13535,
					ProfitFormat: "13535",
					SharedAt: 1555126
				},
				{
					Name: "test",
					Profit: 12,
					ProfitFormat: "12",
					SharedAt: 1555491126
				},
				{
					Name: "test",
					Profit: 152,
					ProfitFormat: "152",
					SharedAt: 1555491126
				},
				{
					Name: "test",
					Profit: 21,
					ProfitFormat: "21",
					SharedAt: 1555491126
				},
				{
					Name: "test",
					Profit: 31,
					ProfitFormat: "31",
					SharedAt: 1555491126
				},
				{
					Name: "test",
					Profit: 231,
					ProfitFormat: "231",
					SharedAt: 1555491126
				},
				{
					Name: "test",
					Profit: 201,
					ProfitFormat: "201",
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
					if (res.Error === 0) {
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
					} else {
						this.$message.error(
							this.$i18n.error[res.Error]
								? this.$i18n.error[res.Error][this.$language]
								: `error code is ${res.Error}`
						);
						this.loadSwitch = true;
					}
				})
				.catch(err => {
					console.error(err);
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
