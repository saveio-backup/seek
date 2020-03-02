<template>
	<div
		id="login-log"
		class="flex jc-center ai-center"
	>
		<div>
			<!-- <div> -->
			<i
				class="first-ofont ofont ofont-lianjie1"
				:class="statusList.Chain && statusList.Chain.State ? 'active-blue' : 'ofont-grep'"
			></i>
			<div
				class="connect-success"
				v-if="statusList.Chain && statusList.Chain.State"
			>
				<i
					class="el-icon-check"
				></i>
			</div>
			<div
				slot="append"
				v-else
				class="loading text-center transparent"
			>
				<i class="ofont ofont-loading loading-rotate"></i>
			</div>
			<!-- </div> -->
			<p>
				{{$t('menuWindow.chainState')}}
			</p>
		</div>
		<div>
			<i
				class="first-ofont ofont ofont-DNS-"
				:class="statusList.DNS && (statusList.DNS.State || (statusList.DNS.HostAddr === '' && currentHeight === totalHeight && totalHeight !== 0)) ? 'active-blue' : 'ofont-grep'"
			></i>
			<div
				class="connect-success"
				v-if="statusList.DNS && (statusList.DNS.State || (statusList.DNS.HostAddr === '' && currentHeight === totalHeight && totalHeight !== 0))"
			>
				<i
					class="el-icon-check"
				></i>
			</div>
			<div
				slot="append"
				v-else
				class="loading text-center transparent"
			>
				<i class="ofont ofont-loading loading-rotate"></i>
			</div>
			<p>
				<!-- DNS状态: -->
				{{$t('menuWindow.dnsState')}}
			</p>
		</div>
		<div>
			<i
				class="first-ofont ofont ofont-ziyuan"
				:class="statusList.DspProxy && statusList.DspProxy.State ? 'active-blue' : 'ofont-grep'"
			></i>
			<div
				v-if="statusList.DspProxy && statusList.DspProxy.State"
				class="connect-success"
			>
				<i
					class="el-icon-check"
				></i>
			</div>
			<div
				slot="append"
				v-else
				class="loading text-center transparent"
			>
				<i class="ofont ofont-loading loading-rotate"></i>
			</div>
			<p>
				<!-- Dsp代理状态 -->
				{{$t('menuWindow.dspProxyState')}}
			</p>
		</div>
		<!-- <div>
      <div>
        <i class="ofont ofont-success active-blue" v-if="statusList.ChannelProxy && statusList.ChannelProxy.State"></i>
        <i class="el-icon-loading" v-else></i>
      </div>
			<p>
				通道代理状态:
			</p>
		</div> -->
	</div>
</template>

<script>
import { ipcRenderer, remote } from "electron";
export default {
	name: "LoginLog",
	data() {
		return {
			statusListTimeoutObj: null,
			loading: false
		};
	},
	computed: {
		statusList() {
			return this.$store.state.Home.state;
		},
		currentHeight() {
			return this.$store.state.Home.currentHeight || 0;
		},
		totalHeight() {
			return this.$store.state.Home.totalHeight;
		},
		account() {
			return this.$store.state.Home.account;
		}
	},
	watch: {
		statusList() {
			this.checkDoneLog();
		},
		currentHeight() {
			this.checkDoneLog();
		},
		totalHeight() {
			this.checkDoneLog();
		}
	},
	methods: {
		checkDoneLog() {
			const vm = this;
			// if(vm.account && vm.account.Address) {
			clearTimeout(vm.statusListTimeoutObj);
			vm.statusListTimeoutObj = setTimeout(() => {
				let flag = true;
				if (!vm.statusList) return;
				for (let key in vm.statusList) {
					if (
						vm.statusList &&
						vm.statusList[key] &&
						(vm.statusList[key].State === 1 ||
							(key === "DNS" &&
								vm.statusList[key].HostAddr === "" &&
								vm.currentHeight === vm.totalHeight &&
								vm.totalHeight !== 0))
					) {
					} else {
						flag = false;
					}
				}
				if (flag) {
					ipcRenderer.send("run-dialog-event", {
						name: "setIsLoginShowLog",
						data: true
					});
				}
			}, 100);
			// };
		},
		getNetworkState() {
			this.$axios.get(this.$api.networkStatus).then(res => {
				if (res.Error === 0) {
					this.$store.commit("SET_STAET", res.Result);
				}
			});
		}
	},
	mounted() {
		ipcRenderer.send("run-dialog-event", {
			name: "attach",
			data: {
				names: ['progress', 'state', 'account', 'channel'],
				id: remote.getCurrentWebContents().id
			}
		});
		this.getNetworkState();
	}
};
</script>
<style lang="scss">
#login-log {
	min-height: 100%;
	@include themify {
		color: $primary-font-color;
	}
	& > div {
		display: flex;
		text-align: center;
		align-items: center;
		flex-direction: column;
		justify-content: center;
		font-size: 18px;
		width: 262px;
		height: 360px;
		margin: 0 12px;
		    

		i {
			font-size: 30px;

			&.first-ofont {
				font-size: 50px;
				margin-bottom: 40px;
				&.ofont-grep {
					color: #a6a6a6;
				}
			}

			&.ofont-success {
				color: #8bd179;
			}
		}

		& > div {
			width: 30px;
			height: 30px;
			background: #A6A6A6;
			display: flex;
			justify-content: center;
			align-items: center;
			border-radius: 15px;
			&.connect-success {
				background: #8BD179;
			}

			i {
				font-size: 22px;
				color: white;
			}
		}

		& > p {
			width: 200px;
			margin-top: 24px;
		}
	}
}
</style>