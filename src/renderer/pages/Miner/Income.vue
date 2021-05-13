<template>
	<div id="income">
		<div class="header">
			<p class="light-theme-title mb10 user-no-select">{{$t('miner.profitDetail')}}</p>
			<el-date-picker
				class="common-el-input"
				v-model="dateRange"
				type="daterange"
				@change="dateChanageGetIncom"
				unlink-panels
				:range-separator="$t('miner.to')"
				:start-placeholder="$t('miner.start')"
				:end-placeholder="$t('miner.end')"
				:default-time="['00:00:00', '23:59:59']"
			>
			</el-date-picker>
			<div class="total-income ft14"> <span class="fixeddddddd">{{$t('miner.totalProfit')}}:</span> <span class="theme-font-color">{{filterFloat(result.TotalIncomeFormat).toLocaleString('en-US') || 0}} ONI</span></div>
		</div>
		<div class="file-total tertiary-font-color">
			{{$t('public.fileTotal')}}: {{total}}
		</div>
		<el-table
			:data="result.Incomes"
			border
			class="flex1 incomeTable"
			ref="incomeTable"
			:empty-text="$t('public.noData')"
			height='100%'
		>
			<el-table-column
				:label="$t('miner.fileName')"
				prop="Name"
				class-name="primary-font-color"
				sortable
			></el-table-column>
			<el-table-column
				:label="$t('miner.profit') + '(ONI)'"
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
				:label="$t('miner.time')"
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
			result: { TotalIncome: 0, TotalIncomeFormat: 0, Incomes: [] },
			loadSwitch: true,
			limit: 20,
			total: 0,
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
						const result = res.Result.List;
						this.total = res.Result.TotalFile;
						this.result.TotalIncome = res.Result.TotalIncome;
						this.result.TotalIncomeFormat = res.Result.TotalIncomeFormat;
						if (res.Result.Incomes.length > 0) {
							this.result.Incomes = this.result.Incomes.concat(res.Result.Incomes);
						} else {
							this.loadSwitch = false;
							return;
						}
						this.loadSwitch = true;
					} else {
						this.$message.error(this.$t(`error[${res.Error}]`));
						this.loadSwitch = true;
					}
				})
				.catch(err => {
					if (err.message.includes("timeout")) {
						this.$message.error(this.$t('error.requestTimeout'));
					}
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
		padding: 20px 20px;
		position: relative;
		@include themify {
			border-bottom: 1px solid $line-color;
		}
		
	}
	.file-total {
		height: 40px;
		line-height: 50px;
		font-size: 14px;
		padding-left: 12px;
	}
	.common-el-input {
		border: 1px solid rgba(4, 15, 57, 0.2);
		.el-range-input {
			@include themify {
				background-color: $card-color;
			}
		}
	}
	.incomeTable {
		height: 100%;
	}
	.total-income {
		font-size: 1.4rem;
		position: absolute;
		bottom: 15px;
		right: 70px;
		.fixeddddddd{
			font-size:12px;
			@extend .dark-grey;
		}
		span {
			font-size: 1.8rem;
			margin-left: 10px;
		}
	}
}
</style>
