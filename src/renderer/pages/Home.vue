<template>
	<div
		id="home"
		class="common-main"
	>
		<div
			class="content islogin"
			v-show="loginStatus ===1"
		>
			<div class="user-meta">
				<div class="user-meta-left">
					<div class="user-name">
						<div class="user-name-left">
							<div class="user-name-first-wrapper">
								<i
									v-if="!localStorage.getItem('Label')"
									class="ofont ofont-yonghu user user-first"
								></i>
								<i
									v-else
									class="user-first"
								>{{localStorage.getItem('Label') | firstString}}</i>
							</div>
							<div class="user-name-content">
								<p class="user-name-name ftpx24">{{localStorage.getItem('Label') || ''}}</p>
								<p class="ftpx12">
									<span
										class="address"
										:title="localStorage.getItem('Address') || ''"
									>
										{{localStorage.getItem("Address")||''}}
									</span>
									<i
										class="ofont ofont-fuzhi"
										@click="clipText"
									></i>
								</p>
								<div class="user-name-bottom">
									<ripper-button
										class="theme1"
										@click="exportPrivateKey"
									>
										<i class="user-name-btn-icon ofont ofont-daochu"></i> <span class="user-name-btn-content">{{$t('home.privateKey')}}</span>
									</ripper-button>
									<ripper-button
										class="theme1 user-name-button-right"
										@click="exportWallet"
									>
										<i class="user-name-btn-icon ofont ofont-daochu"></i> <span class="user-name-btn-content">{{$t('home.keystoreFile')}}</span>
									</ripper-button>
								</div>
							</div>
						</div>
					</div>
					<!-- pause !!! -->
					<div class="user-revenue">
						<p class="grey-xs bold ft14">{{$t('home.yourProfit')}}:</p>
						<div class="flex between ai-center">
							<span
								class="ftpx36"
							>{{revenueFormat.toLocaleString('en-US')}}</span>
							<span class="bold ftpx16 unit">ONI</span>
						</div>
					</div>
				</div>
				<div
					class="user-meta-center"
				>
					<p class="grey-xs bold ft14 user-meta-title">{{$t('home.totalBalance')}}:</p>
					<p class="total-num"> {{balanceLists.length>0?filterFloat(balanceLists[0].BalanceFormat).toLocaleString('en-US'):'0'}}<span> ONI</span></p>
					<div
						id="balance-view"
						class="balanceView"
					></div>
				</div>
				<div
					class="user-meta-right"
					:class="themeColor +'-theme-card-color'"
				>
					<p class="grey-xs bold ft14 user-meta-title">{{$t('home.channelAsset')}}:</p>
					<div
						id="channel-view"
						class="channelView"
					></div>
					<div class="circle-assist"></div>
				</div>
			</div>
			<ripper-button
				@click="openAddChannel"
				class="openAddChannel primary"
			>
				<i class="el-icon-plus ftpx14"></i> {{$t('home.newChannel')}}
			</ripper-button>
			<channels-list
				ref="channelListObj"
				:showTransfer='true'
			></channels-list>
		</div>
		<div
			class="content not-login"
			v-if="loginStatus === 0"
		>
			<canvas-bg ref="canvasBgObg"></canvas-bg>
			<div class="account-box flex column jc-center">
				<!-- <h3 class="account-box-sub  mb50"><span>Welcome to</span></h3> -->
				<div class="flex between column account-box-sub">
					<div class="save-logo-wrap">
						<div class="save-log-desc user-no-select">
							<!-- Seeker -->
							<img
								src="./../assets/images/home_seeker.svg"
								alt=""
								srcset=""
								width="240"
							>
						</div>
					</div>
					<div class="tologin">
						<ripper-button
							class="button"
							@click="goPage('/CreateAccount')"
						>{{$t('home.createAccount')}}</ripper-button>
						<ripper-button
							class="primary button importAccount"
							@click="goPage('/ImportAccount')"
						>{{$t('home.importAccount')}}</ripper-button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
const { ipcRenderer, clipboard } = require("electron");
import { filterFloat, effectiveNumber } from "../assets/config/util";
import channelsList from "../components/ChannelsList.vue";
import canvasBg from "./Home/CanvasBg.vue";
import echarts from "echarts";
export default {
	components: {
		channelsList,
		canvasBg
	},
	mounted() {
		document.title = this.$t("home.home");
		const vm = this;

		this.chartInit();
		this.$store.dispatch("setCurrentAccount"); // get login status
		// open channel callback form createChannel of browserView dialog
		if (this.dnsAdress && this.dnsAdress != "done") {
			this.$refs.channelListObj.openOpen(this.dnsAdress, 100);
			localStorage.setItem("DNSAdress", "done");
		}
		ipcRenderer.on("open-add-channel-dialog", (event, dnsAdress) => {
			console.log(dnsAdress);
			vm.openOpen(dnsAdress, 100);
			// vm.$refs.channelListObj.openOpen(dnsAdress, 100);
		});
	},
	filters: {
		firstString(value) {
			if (!value) return "";
			value += "";
			return value[0];
		}
	},
	data() {
		return {
			filterFloat,
			localStorage,
			// open add channel dialog(param)
			dnsAdress: localStorage.getItem("DNSAdress") || "",
			// balanceSelected: 0,
			chartsDom: "",
			chartsChannelDom: "",
			exec: "",
			index: 0,
			timeoutObj: null,
			historyIntervalObj: null,
			currentBalanceList: [0, 0, 0, 0, 0, 0, 0],
			balanceListsMock: {
				Action: "getbalancehistory",
				Desc: "SUCCESS",
				Error: 0,
				Result: [
					{
						DateAt: 1563379200,
						TxsCount: 0,
						TxsSendCount: 0,
						TxsReceiveCount: 0,
						Asset: "save",
						Balance: 550000000,
						BalanceFormat: "0"
					},
					{
						DateAt: 1563379200,
						TxsCount: 0,
						TxsSendCount: 0,
						TxsReceiveCount: 0,
						Asset: "save",
						Balance: 550000000,
						BalanceFormat: "0"
					},
					{
						DateAt: 1563379200,
						TxsCount: 0,
						TxsSendCount: 0,
						TxsReceiveCount: 0,
						Asset: "save",
						Balance: 550000000,
						BalanceFormat: "2000"
					},
					{
						DateAt: 1563379200,
						TxsCount: 0,
						TxsSendCount: 0,
						TxsReceiveCount: 0,
						Asset: "save",
						Balance: 550000000,
						BalanceFormat: "1000"
					},
					{
						DateAt: 1563379200,
						TxsCount: 0,
						TxsSendCount: 0,
						TxsReceiveCount: 0,
						Asset: "save",
						Balance: 550000000,
						BalanceFormat: "5000"
					},
					{
						DateAt: 1563379200,
						TxsCount: 0,
						TxsSendCount: 0,
						TxsReceiveCount: 0,
						Asset: "save",
						Balance: 550000000,
						BalanceFormat: "2000000"
					},
					{
						DateAt: 1563465600,
						TxsCount: 0,
						TxsSendCount: 0,
						TxsReceiveCount: 0,
						Asset: "save",
						Balance: 550000000,
						BalanceFormat: "0.5"
					}
				],
				Version: "1.0.0"
			}
		};
	},
	methods: {
		goPage(path) {
			this.$router.push({
				path: path
			});
		},
		openOpen(dnsAdress, amount) {
			this.$nextTick(() => {
				this.$refs.channelListObj.openOpen(dnsAdress, amount);
			});
		},
		// init chart dom and listening resize event to change chart
		chartInit() {
			// bind resize event
			window.onresize = () => {
				this.updateDom();
				this.$nextTick(() => {
					clearTimeout(this.timeoutObj);
					this.timeoutObj = setTimeout(() => {
						if (this.loginStatus === 1) {
							try {
								this.chartsDom.resize();
							} catch (e) {
								console.log(e);
							}
							try {
								this.chartsChannelDom.resize();
								this.chartsChannelDom.dispatchAction({
									type: "highlight",
									seriesIndex: 0,
									dataIndex: this.index
								});
							} catch (e) {
								console.log(e);
							}
						} else {
							this.$refs.canvasBgObg.init();
						}
					}, 50);
				});
			};
			this.updateDom();
			// this nextTick is updateDom function update dom is done
			this.$nextTick(() => {
				this.initDrawBalanceView();
				this.drawChannelView();
				//this nexetTick is chart dom loading is done
				this.$nextTick(() => {
					this.getBalanceListInterval();
					try {
						this.chartsDom.resize();
					} catch (e) {
						console.log(e);
					}
					try {
						this.chartsChannelDom.resize();
						this.chartsChannelDom.dispatchAction({
							type: "highlight",
							seriesIndex: 0,
							dataIndex: this.index
						});
					} catch (e) {
						console.log(e);
					}
				});
			});
		},
		getBalanceListInterval() {
			const INTERVAL_TIME = 3000;
			clearInterval(this.historyIntervalObj);
			this.historyIntervalObj = setInterval(() => {
				if (localStorage.getItem("Address")) {
					clearInterval(this.historyIntervalObj);
					this.getBalanceList();
				}
			}, INTERVAL_TIME);
		},
		//get history balance
		getBalanceList() {
			const DAY_NUM = 7;
			this.$axios
				.get(
					this.$api.balancehistory +
						"/" +
						(localStorage.getItem("Address") || "") +
						"/" +
						DAY_NUM,
					{
						timeout: 120000
					}
				)
				.then(res => {
					if (res.Error === 0) {
						const result = res.Result;
						let balanceData = [];
						const dayLen = result.length || 0;
						for (let i = 0; i < DAY_NUM; i++) {
							if (dayLen >= i) {
								balanceData.push(result[i].BalanceFormat || 0);
							} else {
								balanceData.unshift(0);
							}
						}
						balanceData[7] = this.currentBalanceFormat;
						balanceData.splice(0, 1);
						this.currentBalanceList = balanceData;
						this.chartsDom.setOption({
							series: {
								data: balanceData
							}
						});
					} else {
						this.$message.error(this.$t(`error${[res.Error]}`));
					}
				});
		},
		//get today 00:00 timestamp
		getZeroTimestamp() {
			let date = new Date();
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);
			let timestamp = date.getTime(); // 1477670400000
			// let unix_timestamp = Math.floor(date.getTime()/1000);
			return timestamp;
		},
		openAddChannel() {
			const vm = this;
			if (this.isSync) {
				this.$confirm(
					vm.$t("public.blockUnsynchronizedCompletionAreYouSureToDoThis"),
					vm.$t("public.notice"),
					{
						confirmButtonText: vm.$t("public.confirm"),
						cancelButtonText: vm.$t("public.cancel")
					}
				)
					.then(() => {
						this.$refs.channelListObj.openOpen();
					})
					.catch(e => {});
			} else {
				this.$refs.channelListObj.openOpen();
			}
		},
		// init channel chart
		drawChannelView() {
			const that = this;
			const channelDom = document.getElementById("channel-view");
			this.chartsChannelDom = echarts.init(channelDom);
			const currentChannelData =
				this.currentChannelData.length === 0
					? [{ value: 0, name: that.$t("home.noChannel") }]
					: this.currentChannelData;
			const color =
				this.currentChannelData.length === 0
					? ["#D4DDEB"]
					: ["#3E6695", "#3B81EB", "#FF607B", "#D3E84E", "#E15C91"];
			this.chartsChannelDom.setOption({
				series: [
					{
						name: "channel info:",
						type: "pie",
						radius: ["77%", "88%"],
						avoidLabelOverlap: false,
						backgroundColor: "#000111",
						label: {
							normal: {
								show: false,
								position: "center",
								formatter: ["{a|{b}}", "{c|{c} ONI}", "{b|{d}%}"].join("\n"),
								rich: {
									a: {
										color: "#2F8FF0",
										fontFamily: "Montserrat-Medium",
										fontSize: 16,
										padding: [10, 0, 10, 0]
									},
									b: {
										color: "rgba(32, 32, 32, .4)",
										fontFamily: "Montserrat-Medium",
										fontSize: 14,
										padding: [5, 0, 0, 0]
									},
									c: {
										color: "rgba(32, 32, 32, .4)",
										fontFamily: "Montserrat-Medium",
										fontSize: 14
									}
								}
							},
							emphasis: {
								show: true,
								textStyle: {
									fontSize: "12",
									fontWeight: "bold"
								}
							}
						},
						labelLine: {
							show: true
							// normal: {
							// 	show: false
							// }
						},
						data: currentChannelData,
						color: color,
						selectedOffset: 5
					}
				]
			});
			// default selcet and bind select event
			this.chartsChannelDom.dispatchAction({
				type: "highlight",
				seriesIndex: 0,
				dataIndex: 0
			});
			this.chartsChannelDom.on("mouseover", function(e) {
				if (e.dataIndex != that.index) {
					that.chartsChannelDom.dispatchAction({
						type: "downplay",
						seriesIndex: 0,
						dataIndex: that.index
					});
				}
			});
			this.chartsChannelDom.on("mouseout", function(e) {
				that.index = e.dataIndex;
				that.chartsChannelDom.dispatchAction({
					type: "highlight",
					seriesIndex: 0,
					dataIndex: e.dataIndex
				});
			});
		},
		// init draw balance chart to get date
		initDrawBalanceView() {
			const DAY_NUM = 7;
			let balanceXAxisData = [];
			let balanceData = [0, 0, 0, 0, 0, 0, 0];
			let todayZeroTimestamp = this.getZeroTimestamp();
			let i = 0;
			while (i < DAY_NUM) {
				let timestamp = todayZeroTimestamp - i * 86400000;
				let dateItem = new Date(timestamp);
				let monthItem =
					dateItem.getMonth() >= 9
						? dateItem.getMonth() + 1
						: "0" + (dateItem.getMonth() + 1);
				let dayItem =
					dateItem.getDate() > 9
						? dateItem.getDate()
						: "0" + dateItem.getDate();
				balanceXAxisData.unshift(`${monthItem}/${dayItem}`);
				i++;
			}
			this.drawBalanceView(balanceXAxisData, balanceData);
		},
		// init balance chart
		drawBalanceView(balanceXAxisData, balanceData) {
			const balanceDom = document.getElementById("balance-view");
			this.chartsDom = echarts.init(balanceDom);
			this.chartsDom.setOption({
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: "cross",
						label: {
							backgroundColor: "#3094F1"
						}
					}
				},
				xAxis: {
					type: "category",
					boundaryGap: false,
					axisLine: {
						lineStyle: {
							color: "#AFACAC"
						}
					},
					data: balanceXAxisData
					// data: ['06/13', '06/14', '06/15', '06/16', '06/17', '06/18', '06/19']
				},
				yAxis: {
					type: "value",
					scale: true,
					axisLine: {
						lineStyle: {
							color: "#AFACAC"
						}
					},
					color: ["#fff"],
					splitArea: {
						show: true,
						areaStyle: {
							color: ["rgba(250,250,250,0.0)", "#F8F9FA"]
						}
					}
				},
				grid: {
					left: "70",
					right: "8%",
					bottom: "10%",
					top: "10%"
				},
				series: [
					{
						data: balanceData,
						// data: [20, 40, 70, 200, 120, 100, 50],
						type: "line",
						areaStyle: {
							normal: {
								color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
									{
										offset: 0,
										color: "rgba(55, 142, 239, .69)"
									},
									{
										offset: 1,
										color: "rgba(54, 143, 239, .08)"
									}
								])
							}
						},
						smooth: true,
						color: ["#3094F1"]
					}
				]
			});
		},
		updateDom() {
			const channelDom = document.getElementById("channel-view");
			channelDom.style.width = document.body.clientWidth * 0.4 - 265 + "px";
			const balanceDom = document.getElementById("balance-view");
			balanceDom.style.width = document.body.clientWidth * 0.6 - 395 + "px";
		},
		clipText(el) {
			const vm = this;
			console.log("clip");
			clipboard.writeText(localStorage.getItem("Address") || "");
			this.$message({
				message: vm.$t("public.copied"),
				duration: 1200,
				type: "success"
			});
		},
		exportWallet() {
			const vm = this;
			this.$axios
				.get(this.$api.account + "/export/walletfile")
				.then(res => {
					if (res.Error === 0) {
						ipcRenderer.send("export-file-dialog", res.Result.Wallet, "Wallet");
						ipcRenderer.once("export-finished", () => {
							this.$message({
								message: vm.$t("dialog.exportSuccess"),
								type: "success"
							});
						});
					} else {
						this.$message.error(this.$t(`error[${res.Error}]`));
					}
				})
				.catch(err => {
					console.error(err);
				});
		},
		exportPrivateKey() {
			ipcRenderer.send("dialog-open", "exportPrivateKey");
		},
		generateChannelView() {
			const that = this;
			if (this.currentChannelData.length === 0) {
				const currentChannelData = [
					{ value: 0, name: that.$t("home.noChannel") }
				];
				const color =
					this.currentChannelData.length === 0
						? ["#D4DDEB"]
						: ["#3E6695", "#3B81EB", "#FF607B", "#D3E84E", "#E15C91"];
				this.chartsChannelDom.setOption({
					series: [
						{
							name: "channel info:",
							type: "pie",
							radius: ["77%", "88%"],
							avoidLabelOverlap: false,
							backgroundColor: "#000111",
							label: {
								normal: {
									show: false,
									position: "center",
									formatter: ["{a|{b}}", "{c|{c} ONI}", "{b|{d}%}"].join("\n"),
									rich: {
										a: {
											color: "#2F8FF0",
											fontFamily: "Montserrat-Medium",
											fontSize: 16,
											padding: [10, 0, 10, 0]
										},
										b: {
											color: "rgba(32, 32, 32, .4)",
											fontFamily: "Montserrat-Medium",
											fontSize: 14,
											padding: [5, 0, 0, 0]
										},
										c: {
											color: "rgba(32, 32, 32, .4)",
											fontFamily: "Montserrat-Medium",
											fontSize: 14
										}
									}
								},
								emphasis: {
									show: true,
									textStyle: {
										fontSize: "12",
										fontWeight: "bold"
									}
								}
							},
							labelLine: {
								show: true
								// normal: {
								// 	show: false
								// }
							},
							data: currentChannelData,
							color: color,
							selectedOffset: 5
						}
					]
				});
				// default selcet and bind select event
				this.chartsChannelDom.dispatchAction({
					type: "highlight",
					seriesIndex: 0,
					dataIndex: 0
				});
				this.chartsChannelDom.on("mouseover", function(e) {
					if (e.dataIndex != that.index) {
						that.chartsChannelDom.dispatchAction({
							type: "downplay",
							seriesIndex: 0,
							dataIndex: that.index
						});
					}
				});
				this.chartsChannelDom.on("mouseout", function(e) {
					that.index = e.dataIndex;
					that.chartsChannelDom.dispatchAction({
						type: "highlight",
						seriesIndex: 0,
						dataIndex: e.dataIndex
					});
				});
			}
		}
	},
	watch: {
		currentChannelData(newVal, oldVal) {
			let obj = {};
			if (newVal.length != oldVal.length) {
				const color =
					newVal.length === 0
						? ["#D4DDEB"]
						: ["#3E6695", "#3B81EB", "#FF607B", "#D3E84E", "#E15C91"];
				if (this.chartsChannelDom) {
					this.chartsChannelDom.setOption({
						series: {
							data: newVal,
							color: color
						}
					});
				}
				if (this.chartsChannelDom) {
					this.chartsChannelDom.dispatchAction({
						type: "highlight",
						seriesIndex: 0,
						dataIndex: this.index
					});
				}
				return;
			}
			for (let value of oldVal) {
				obj[value.ChannelId] = value.BalanceFormat;
			}
			for (let value of newVal) {
				if (obj[value.ChannelId] !== value.BalanceFormat) {
					this.chartsChannelDom.setOption({
						series: {
							data: newVal
						}
					});
					this.chartsChannelDom.dispatchAction({
						type: "highlight",
						seriesIndex: 0,
						dataIndex: this.index
					});
					return;
				}
			}
		},
		currentBalanceFormat(newVal, oldVal) {
			try {
				this.currentBalanceList[6] = newVal;
				this.chartsDom.setOption({
					series: {
						data: this.currentBalanceList
					}
				});
			} catch (e) {
				console.log(e);
			}
		},
		lang(newVal, oldVal) {
			document.title = this.$t("home.home");
			this.generateChannelView();
		}
	},
	computed: {
		themeColor() {
			return this.$store.state.Home.themeColor;
		},
		lang() {
			return this.$i18n.locale;
		},
		loginStatus() {
			return this.$store.state.Home.loginStatus;
		},
		balanceLists() {
			return this.$store.state.Wallet.balanceLists;
		},
		revenue() {
			return this.$store.state.Home.revenue;
		},
		revenueFormat() {
			return this.$store.state.Home.revenueFormat;
		},
		channels() {
			return this.$store.state.Home.channels;
		},
		currentBalanceFormat() {
			// let sum = 0;
			if (!this.balanceLists) return 0;
			for (let value of this.balanceLists) {
				if (value.Symbol === "SAVE") {
					return value.BalanceFormat;
				}
			}
		},
		// currentChannelTotal() {
		// 	return parseFloat(this.currentBalanceFormat).toFixed(9);
		// },
		// get [max, max - 1, max - 2, [min array]]
		currentChannelData() {
			if (!this.channels) return [];
			const maxNum = 4; // default show alone channel number
			let arr = [];
			let otherArr = [];
			for (let value of this.channels) {
				if (arr.length === maxNum) {
					if (value.Balance > arr[maxNum - 1].Balance) {
						otherArr.push(arr[maxNum - 1]);
						arr.splice(maxNum - 1, 1, value);
						arr.sort((a, b) => {
							return b.Balance - a.Balance;
						});
					}
					continue;
				}
				if (arr.length === maxNum - 1) {
					arr.push(value);
					// sort
					arr.sort((a, b) => {
						return b.Balance - a.Balance;
					});
					continue;
				}
				arr.push(value);
			}
			//if have other channel sum push arr
			if (otherArr.length !== 0) {
				let sum = 0;
				for (let value of otherArr) {
					sum += value.Balance;
				}
				arr.push({
					BalanceFormat: sum / 1000000000,
					ChannelId: "remain"
				});
			}
			arr.map(channel => {
				channel["value"] = parseFloat(
					parseFloat(channel["BalanceFormat"]).toFixed(3)
				);
				channel["name"] = channel["ChannelId"];
				return channel;
			});
			return arr;
		},
		isSync: function() {
			return this.$store.state.Home.isSync || false;
		}
	},
	beforeRouteEnter(to, from, next) {
		next(vm => {
			vm.exec = to.query.exec ? to.query.exec : "";
			if (vm.exec) {
				console.log("exec is exit");
				vm[vm.exec]();
			}
		});
	},
	beforeDestroy() {
		clearInterval(this.historyIntervalObj);
	}
};
</script>
<style lang="scss">
$light-grey: #f2f2f2;
$grey: #ccc;
$input-color: rgba(203, 203, 203, 1);
.el-select-dropdown,
.el-popper {
	// border: solid 1px #fff;
	border-top: none;
}
.asset-item {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 1.6rem;
}
.prefix-icon {
	margin-left: 15px;
	height: 100%;
	display: flex;
	align-items: center;
}
.asset-icon {
	display: inline-block;
	width: 15px;
	height: 15px;
}
#home {
	display: flex;
	flex: 1;
	.el-input {
		&.is-focus {
			.el-input__inner {
				border-bottom: none;
			}
		}
	}
	.el-select {
		border-color: $input-color !important;
	}
	.content {
		width: 100%;
		display: flex;
		flex-direction: column;
		&.islogin {
			padding: 40px 88px 70px;
		}
		&.not-login {
			align-items: center;
			width: 100%;
			height: 100%;

			& > .account-box {
				width: 100%;
				height: 100%;
			}

			.account-box-sub {
				width: 60%;
				// height: 70%;
				height: 480px;
				max-width: 750px;
				margin: 0 auto;
				// margin-left: auto;
				// margin-right: auto;
				.save-logo-wrap {
					position: relative;
					// top: 20%;
					top: 0;
					& > .save-logo-image {
						width: 111px;
						height: 122px;
						margin: 0 auto;
						display: block;
					}
					& > .save-log-desc {
						text-align: center;
						color: #2f8ff0;
						font-size: 4rem;
						font-weight: 600;
						margin-top: 30px;
					}
				}
			}
			.tologin {
				display: flex;
				justify-content: center;
				position: relative;
				z-index: 999;

				& > .button {
					padding: 10px;
					color: #fff;
					font-size: 1.4rem;
					margin: 0 40px;
				}
			}
		}
		.user-meta {
			display: flex;
			justify-content: space-between;
			margin-bottom: 15px;
			.user-meta-left {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				width: 384px;
				height: 288px;

				&.no-user {
					// flex-direction: row;
					align-items: center;
					justify-content: space-around;
					background: #fff;
					.ofont-yonghu {
						width: 80px;
						display: flex;
						justify-content: center;
						align-items: center;
					}
					.please-login {
						flex: initial;
					}
				}
				.ofont-yonghu {
					font-size: 4.5rem;
				}
				.user-name {
					@include themify{
						box-shadow: $card-shadow;
					}
					display: flex;
					align-items: center;
					justify-content: center;
					flex-direction: column;
					// height: 90px;
					height: 152px;
					background: #fff;
					padding: 5px 10px;
					background: linear-gradient(
						90deg,
						rgba(19, 176, 250, 1) 0%,
						rgba(62, 126, 235, 1) 100%
					);
					border-radius: 6px;
					position: relative;

					&::before {
						content: "S";
						font-size: 10rem;
						color: rgba(255, 255, 255, 0.06);
						position: absolute;
						top: -27px;
						right: -5px;
						font-family: "OpenSans-Bold";
						font-weight: bold;
					}

					.ofont-yonghu {
						margin: 0 8px;
					}

					.user-name-left {
						display: flex;
						align-items: center;
						justify-content: space-between;
						height: 75%;
					}

					.user-name-first-wrapper {
						width: 70px;
						height: 70px;
						text-align: center;
						line-height: 70px;
						border-radius: 50%;
						// border: 1px solid black;
						margin-right: 15px;
						user-select: none;
						background: #76cafa;
						color: #fff;
						align-self: flex-start;

						.user-first {
							font-style: initial;
							margin: 0;
							font-size: 50px;
						}
					}

					.user-name-content {
						display: flex;
						justify-content: space-between;
						flex-direction: column;
						height: 100%;
						color: #fff;

						.ofont-fuzhi {
							position: relative;
							top: -2px;
							cursor: pointer;

							&:hover {
								opacity: 0.7;
							}

							&:active {
								opacity: 1;
							}
						}

						.address {
							display: inline-block;
							width: 230px;
							overflow: hidden;
							text-overflow: ellipsis;
						}
					}

					.user-name-bottom {
						display: flex;
						.user-name-btn-icon {
							font-size: 1.4rem;
							display: inline-block;
						}

						.user-name-btn-content {
							position: relative;
							top: -1px;
						}

						.user-name-button-right {
							margin-left: 3px;
						}
					}
				}
				.user-revenue {
					display: flex;
					flex-direction: column;
					justify-content: space-around;
					// height: 100px;
					height: 120px;
					border-radius: 6px;
					padding: 5px 36px 5px 16px;
					@include themify {
						background-color: $card-color;
						color:$font-color;
						box-shadow: $card-shadow;
					}

					& > p {
						user-select: none;
					}

					& > div {
						.unit {
							position: relative;
							top: 5px;
							user-select: none;
						}
					}
				}
				.please-login {
					flex: 1;
					display: flex;
					flex-direction: column;
					justify-content: space-between;
				}
			}
			.user-meta-center {
				@include themify{
					color: $font-color;
					background-color: $card-color;
					box-shadow: $card-shadow;
				}
				width: calc(60% - 260px);
				height: 288px;
				border-radius: 6px;
				padding: 5px 16px;

				.user-meta-title {
					margin-top: 12px;
					user-select: none;
					height: 18px;
				}

				.total-num {
					font-size: 24px;
					font-weight: 400;
					margin-top: 12px;
					span {
						user-select: none;
					}
				}

				.balanceView {
					// width: 300px;
					width: 100%;
					height: 180px;
					margin-top: 10px;
				}
			}
			.user-meta-right {
				@include themify{
					color:$font-color;
					background: $card-color;
					box-shadow: $card-shadow;
				}
				width: calc(40% - 160px);
				height: 288px;
				border-radius: 6px;
				padding: 5px 16px;
				position: relative;

				.user-meta-title {
					margin-top: 12px;
					user-select: none;
					height: 18px;
				}

				.channelView {
					width: 100%;
					height: 180px;
					margin-top: 30px;
				}

				.circle-assist {
					width: 128px;
					height: 128px;
					border-radius: 50%;
					border: 3px solid #eaeffd;
					position: absolute;
					top: 91px;
					left: 50%;
					transform: translateX(-66px);
				}
			}
		}
		& > .openAddChannel {
			width: -webkit-fill-available;
			margin-bottom: 10px;
			text-align: right;
		}
		.channels-title {
			border-radius: 2px;
			height: 70px;
			background: #fff;
			padding: 20px 15px;
			color: $grey;
			margin-top: 20px;
		}
	}
}
</style>
