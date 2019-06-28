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
								<i v-if="!user.name" class="ofont ofont-user user user-first"></i>
								<i v-else class="user-first">{{user.name | firstString}}</i>
							</div>
							<div class="user-name-content">
								<p class="user-name-name ft24">{{userName}}</p>
								<p class="ft12">
									<span class="address" :title="user.address">
										{{user.address}}
									</span>
									<i
									class="ofont ofont-fuzhi"
									@click="clipText"
									></i>
								</p>
								<div class="user-name-bottom">
									<el-button
									class="seek-btn"
									@click="exportPrivateKey"
									><i class="user-name-btn-icon ofont ofont-20daochu"></i> <span class="user-name-btn-content">Private key</span></el-button>
									<el-button
									class="seek-btn"
									@click="$exportWallet"
									><i class="user-name-btn-icon ofont ofont-20daochu"></i> <span class="user-name-btn-content">Wallet file</span></el-button>
								</div>
							</div>
						</div>
					</div>
					<!-- pause !!! -->
					<div class="user-revenue">
						<p class="grey-xs bold ft14">Your revenue:</p>
						<div class="flex between ai-center">
							<span class="theme-bold ft36">{{revenue.toLocaleString('en-US')}}</span>
							<span class="bold ft16 unit">SAVE</span>
						</div>
					</div>
				</div>
				<div class="user-meta-center">
					<p class="grey-xs bold ft14 user-meta-title">Total Balance:</p>
					<p class="total-num">{{currentChannelTotal}}<span> SAVE</span></p>
					<div id="balance-view" class="balanceView"></div>
				</div>
				<div class="user-meta-right">
					<p class="grey-xs bold ft14 user-meta-title">Channel Asset:</p>
					<div id="channel-view" class="channelView"></div>
				</div>
				
				<!-- <div class="user-meta-right">
					<div class="balance-title">
						<div class="balance-meta">
							<p class="grey-xs bold mb10">Total Balance</p>
							<p class="theme-bold"> {{balanceLists.length>0?filterFloat(balanceLists[balanceSelected].BalanceFormat).toLocaleString('en-US'):'0'}}</p>
						</div>
						<el-select
						 class="asset-select"
						 v-model='balanceSelected'
						 @change="setBalanceListsIndex"
						>
							<div
							 slot="prefix"
							 class="prefix-icon"
							>
								<img
								 v-if="balanceLists.length>0"
								 class="asset-icon"
								 :src="'static/images/logo/'+balanceLists[balanceSelected].Symbol+'.png'"
								 alt=""
								>
							</div>
							<el-option
							 class="asset-item"
							 v-for="(item,index) in balanceLists"
							 :key='item.Name'
							 :label='item.Symbol'
							 :value='index'
							><img
								 class="asset-icon mr10"
								 :src="'static/images/logo/'+ item.Symbol+ '.png'"
								 :alt="item.Symbol"
								> <span class="">{{item.Symbol}}</span></el-option>
						</el-select>

					</div>
					<div
					 class="balance-detail"
					 v-if="balanceLists.length>0"
					>
						<div class="balance-item">
							<div class="balance-top">
								<div class="flex ai-center">
									<img
									 class="asset-icon mr10"
									 :src="'static/images/logo/'+balanceLists[balanceSelected].Symbol+'.png'"
									 alt=""
									>
									<p class="theme-bold">{{ balanceLists[balanceSelected].Symbol}}</p>
								</div>
								<p class="theme-bold">{{filterFloat(balanceLists[balanceSelected].BalanceFormat).toLocaleString('en-US')}}</p>
							</div>
						</div>
					</div>
				</div> -->
			</div>
			<!-- <div class="channels-title">Channel Balance</div> -->
			<channels-list :showTransfer='true'></channels-list>
		</div>
		<div
		 class="content not-login account-wrap"
		 v-if="loginStatus === 0"
		>
			<div class="account-box flex column jc-center">
				<h3 class="account-box-sub  mb50"><span>Welcome to</span></h3>
				<div class="flex between account-box-sub">
					<div class="save-logo-wrap">
						<img
						 src="../assets/images/save_768x316.png"
						 alt="SAVE"
						 class="save-logo-image"
						>
					</div>
					<div class="tologin">
						<router-link
						 to="/CreateAccount"
						 class="button"
						>
							<el-button type="primary">Create Account</el-button>
						</router-link>
						<router-link
						 to="/ImportAccount"
						 class="button"
						>
							<el-button>Import Account</el-button>
						</router-link>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
const { ipcRenderer, clipboard } = require("electron");
import { filterFloat } from "../assets/config/util";
import channelsList from "../components/ChannelsList.vue";
import echarts from 'echarts'
import { clearTimeout, setTimeout } from 'timers';
export default {
	components: {
		channelsList
	},
	mounted() {
		document.title = "Home";
		this.$store.dispatch("setCurrentAccount"); // get login status
		this.$nextTick(() => {
			this.updateDom();
			this.drawBalanceView();
			this.drawChannelView();
		});
		window.onresize = () => {
			this.updateDom();
			this.$nextTick(() => {
				this.chartsDom.resize();
				this.chartsChannelDom.resize();
				this.chartsChannelDom.dispatchAction({type: 'highlight',seriesIndex: 0,dataIndex: this.index})
			})
		};
	},
	filters: {
		firstString(value) {
			if(!value) return '';
			value += '';
			return value[0];
		}
	},
	data() {
		return {
			// switchToggle: {
			// 	loading: null,
				// logoutDialog: false
			// },
			filterFloat,
			// balanceValue: "",
			// loginStatus: 0, // 1: login 0: not login
			user: {
				name: localStorage.getItem("Label") || "",
				address: localStorage.getItem("Address") || "",
			},
			// balanceSelected: 0,
			chartsDom: '',
			chartsChannelDom:'',
			index: 0,
			timeoutObj: null
		};
	},
	methods: {
		drawChannelView() {
			const that = this;
			const channelDom = document.getElementById('channel-view');
			this.chartsChannelDom = echarts.init(channelDom);
			const currentChannelData = this.currentChannelData;
			this.chartsChannelDom.setOption({
				series: [
					{
						name:'channel info:',
						type:'pie',
						radius: ['65%', '85%'],
						avoidLabelOverlap: false,
						// hoverOffset: 6,
						label: {
							normal: {
								show: false,
								position: 'center',
								formatter: function (argument) {
									var html;
									console.log(argument);
									html = `name:${argument.name}\n\n${argument.percent + '%'}\n\n${argument.value}`
									return html
								},
								textStyle:{
									fontSize: 15,
									color:'#202020'
								}
							},
							emphasis: {
								show: true,
								textStyle: {
									fontSize: '12',
									fontWeight: 'bold'
								}
							}
						},
						labelLine: {
							normal: {
								show: false
							}
						},
						data: currentChannelData,
						color:['#E15C91', '#D3E84E','#FF607B','#3B81EB','#7DA1CB'],
						selectedOffset: 5
					}
				]
			});
			// default selcet and bind select event
			this.chartsChannelDom.dispatchAction({type: 'highlight',seriesIndex: 0,dataIndex: 0})
			this.chartsChannelDom.on('mouseover',function(e) {
				if(e.dataIndex != that.index) {
					that.chartsChannelDom.dispatchAction({type: 'downplay',seriesIndex: 0,dataIndex: that.index});
				}
			});
			this.chartsChannelDom.on('mouseout',function(e){
				that.index = e.dataIndex;
				that.chartsChannelDom.dispatchAction({type: 'highlight',seriesIndex: 0,dataIndex: e.dataIndex});
			});
		},
		drawBalanceView() {
			const balanceDom = document.getElementById('balance-view');
			this.chartsDom = echarts.init(balanceDom);
			this.chartsDom.setOption({
				tooltip : {
					trigger: 'axis',
					axisPointer: {
						type: 'cross',
						label: {
							backgroundColor: '#3094F1'
						}
					}
				},
				xAxis: {
					type: 'category',
					boundaryGap: false,
					axisLine: {
						lineStyle: {
							color: '#AFACAC'
						}
					},
					data: ['06/13', '06/14', '06/15', '06/16', '06/17', '06/18', '06/19']
				},
				yAxis: {
					type: 'value',
					axisLine: {
						lineStyle: {
							color: '#AFACAC'
						}
					},
					color: ['#fff']
				},
				grid: {
					left: '10%',
					right: '8%',
					bottom: '10%',
					top: '10%'
				},
				series: [{
					data: [20, 40, 70, 100, 120, 100, 50],
					type: 'line',
					areaStyle: {
						normal: {
							color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
								offset: 0,
								color: 'rgba(55, 142, 239, .39)'
							}, {
								offset: 1,
								color: 'rgba(54, 143, 239, .08)'
							}])
						}
					},
					smooth: true,
					color: ['#3094F1']
				}]
			});
		},
		updateDom() {
			const channelDom = document.getElementById('channel-view');
			channelDom.style.width = document.body.clientWidth*0.4-265+'px';
			const balanceDom = document.getElementById('balance-view');
			balanceDom.style.width = document.body.clientWidth*0.6-395+'px';
		},
		clipText(el) {
			console.log("clip");
			clipboard.writeText(this.user.address);
			this.$message({
				message: "Link Copied",
				duration: 1200,
				type: "success"
			});
		},
		// setBalanceListsIndex(index) {
		// 	this.balanceSelected = index;
		// },
		// getBalance() {
		// 	this.$store.dispatch("setBalanceLists");
		// },
		// getAllChannels() {
		// 	this.$store.dispatch("setChannelBalanceTotal");
		// },
		// logOut() {
		// 	this.switchToggle.loading = this.$loading({
		// 		lock: true,
		// 		text: "logging out",
		// 		target: ".loading-content"
		// 	});
		// 	this.$axios
		// 		.post(this.$api.account + "/logout", {})
		// 		.then(res => {
		// 			if (res.data.Desc === "SUCCESS" && res.data.Error === 0) {
		// 				window.localStorage.clear();
		// 				window.location.href = location.origin + location.pathname; // success login out link to home page
		// 			}
		// 		})
		// 		.catch(err => {
		// 			this.switchToggle.loading.close();
		// 			this.switchToggle.loading = null;
		// 			console.error(err);
		// 		});
		// },
		exportWallet() {
			this.$axios
				.get(this.$api.account + "/export/walletfile")
				.then(res => {
					if (res.data.Desc === "SUCCESS" && res.data.Error === 0) {
						ipcRenderer.send(
							"export-file-dialog",
							res.data.Result.Wallet,
							"Wallet"
						);
					}
					ipcRenderer.once("export-finished", () => {
						this.$message({
							message: "Export Success!",
							type: "success"
						});
					});
				})
				.catch(err => {
					console.error(err);
				});
		},
		exportPrivateKey() {
			ipcRenderer.send('dialog-open', 'exportPrivateKey');
		}
	},
	watch: {
		currentChannelData(newVal,oldVal) {
			// for(let value of newVal) {
			// }
			let obj = {};
			for(let value of oldVal) {
				obj[value.ChannelId] = value.BalanceFormat;
			}
			for(let value of newVal) {
				if(obj[value.ChannelId] !== value.BalanceFormat) {
					this.chartsChannelDom.setOption({
						series : {
							data: newVal
						}
					});
					this.chartsChannelDom.dispatchAction({type: 'highlight',seriesIndex: 0,dataIndex: this.index})
					return;
				};
			}
		}
	},
	computed: {
		loginStatus: function() {
			return this.$store.state.Home.loginStatus;
		},
		userName: function() {
			return localStorage.getItem("Label") || "";
		},
		balanceLists: function() {
			return this.$store.state.Wallet.balanceLists;
		},
		revenue: function() {
			return this.$store.state.Home.revenue;
		},
		channels: function() {
			return this.$store.state.Home.channels;
		},
		currentChannelTotal() {
			let sum = 0;
			for(let value of this.channels) {
				let balanceNum = value.Balance || 0;
				sum += balanceNum;
			}
			return sum/1000000000;
		},
		// get [max, max - 1, max - 2, [min array]]
		currentChannelData: function() {
			if(!this.channels) return [];
			const maxNum = 4; // default show alone channel number
			let arr = [];
			let otherArr = [];
			for(let value of this.channels) {
				if(arr.length === maxNum) {
					if(value.Balance > arr[maxNum - 1].Balance) {
						otherArr.push(arr[maxNum - 1]);
						arr.splice(maxNum - 1, 1, value);
						arr.sort((a, b) => {
							return b.Balance - a.Balance;
						});
					}
					continue;
				}
				if(arr.length === maxNum - 1) {
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
			if(otherArr.length !== 0) {
				let sum = 0;
				for(let value of otherArr) {
					sum += value.Balance
				}
				arr.push({
					BalanceFormat: sum/1000000000,
					ChannelId: 'remain',
				});
			}
			arr.map((channel) => {
				channel['value'] = channel['BalanceFormat'];
				channel['name'] = channel['ChannelId'];
				return channel;
			})
			return arr;
		}
	}
};
</script>
<style lang="scss">
$light-grey: #f2f2f2;
$grey: #ccc;
$theme-color: #1b1e2f;
$input-color: rgba(203, 203, 203, 1);
.el-select-dropdown,
.el-popper {
	border: solid 1px #fff;
	border-top: none;
}
.asset-item {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
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
	.el-select .el-input__inner:focus {
		border-color: $input-color !important;
	}
	.el-input__inner {
		border-radius: 2px;
		font-weight: bold;
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
			.save-logo-image {
				width: 300px;
			}
			.account-box-sub {
				width: 60%;
				max-width: 700px;
				margin-left: auto;
				margin-right: auto;
			}
			.tologin {
				display: flex;
				flex-direction: column;
				justify-content: space-around;

				.button {
					padding: 10px;
					color: #fff;
					font-size: 14px;
					.el-button {
						border-radius: 0px;
					}
					.el-button--default {
						color: #040f39;
						border-color: rgba(4, 15, 57, 0.5);
					}
				}
			}
		}
		.user-meta {
			display: flex;
			justify-content: space-between;
			margin-bottom: 15px;
		}
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
				.ofont-user {
					width: 80px;
					display: flex;
					justify-content: center;
					align-items: center;
				}
				.please-login {
					flex: initial;
				}
			}
			.ofont-user {
				font-size: 45px;
			}
			.user-name {
				display: flex;
				align-items: center;
				justify-content: center;
				flex-direction: column;
				// height: 90px;
				height: 152px;
				background: #fff;
				padding: 5px 10px;
				background:linear-gradient(90deg,rgba(19,176,250,1) 0%,rgba(62,126,235,1) 100%);
				box-shadow: 0px 2px 20px 0px rgba(196,196,196,0.24);
				border-radius:6px;
				position: relative;

				&::before {
					content: 'S';
					font-size: 100px;
					color: rgba(255, 255, 255, .06);
					position: absolute;
					top: -27px;
					right: -5px;
					font-family: 'OpenSans-Bold';
					font-weight: bold;
				}

				.ofont-user {
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
					background: #76CAFA;
					color: #fff;
					align-self:flex-start;

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
							opacity: .7;
						}
						
						&:active {
							opacity: 1;
						}
					}
	
					.address {
						display:inline-block;
						width:230px;
						overflow:hidden;
						text-overflow: ellipsis;
					}
				}

				.user-name-bottom {
					.user-name-btn-icon {
						font-size: 14px;
						display: inline-block;
					}

					.user-name-btn-content {
						position: relative;
						top: -1px;
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
				background: #fff;
				padding: 5px 36px 5px 16px;
				box-shadow:0px 2px 20px 0px rgba(196,196,196,0.24);
				
				& > p {
					user-select: none;
					color: rgba(32, 32, 32, .4);
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
			// display: flex;
			// flex-direction: column;
			// justify-content: space-between;
			width: calc(60% - 260px);
			height: 288px;
			background: #fff;
			border-radius: 6px;
			padding: 5px 16px;
			box-shadow:0px 2px 20px 0px rgba(196,196,196,0.24);

			.user-meta-title {
				margin-top: 12px;
				user-select: none;
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
			// display: flex;
			// flex-direction: column;
			// justify-content: space-between;
			width: calc(40% - 160px);
			height: 288px;
			background: #fff;
			border-radius: 6px;
			padding: 5px 16px;
			box-shadow: 0px 2px 20px 0px rgba(196,196,196,0.24);

			.user-meta-title {
				margin-top: 12px;
				user-select: none;
			}

			.channelView {
				width: 100%;
				height: 180px;
				margin-top: 30px;
			}
		}
		// .user-meta-right {
		// 	// width: 600px;
		// 	flex: 1;
		// 	display: flex;
		// 	height: 200px;
		// 	flex-direction: column;
		// 	justify-content: space-between;
		// 	padding: 20px 20px;
		// 	margin-left: 10px;
		// 	background: #fff;
		// 	border-radius: 2px;
		// 	.balance-title {
		// 		display: flex;
		// 		justify-content: space-between;
		// 		align-items: center;
		// 		.el-input__inner {
		// 			text-align: center;
		// 		}
		// 	}
		// 	.balance-detail {
		// 		height: 80px;
		// 		.balance-item {
		// 			width: 240px;
		// 			height: 100%;
		// 			display: flex;
		// 			align-items: center;
		// 			background: #fff;
		// 			border-radius: 2px;
		// 			border: solid 1px rgba(203, 203, 203, 1);
		// 			padding: 5px 8px;
		// 			.balance-top {
		// 				display: flex;
		// 				flex: 1;
		// 				justify-content: space-between;
		// 			}
		// 			.balance-bottom {
		// 				display: flex;
		// 				justify-content: space-between;
		// 			}
		// 		}
		// 	}
		// }
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
