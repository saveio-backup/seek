<template>
	<div
		id="login-log"
		class="flex jc-center ai-center"
	>
		<div>
      <div>
        <i class="ofont ofont-success active-blue" v-if="statusList.Chain && statusList.Chain.State"></i>
        <i class="el-icon-loading" v-else></i>
      </div>
			<p>
				{{$t('menuWindow.chainState')}}
			</p>
		</div>
		<div>
      <div>
        <i class="ofont ofont-success active-blue" v-if="statusList.DNS && (statusList.DNS.State || (statusList.DNS.HostAddr === '' && currentHeight === totalHeight && totalHeight !== 0))"></i>
        <i class="el-icon-loading" v-else></i>
      </div>
			<p>
				<!-- DNS状态: -->
				{{$t('menuWindow.dnsState')}}
			</p>
		</div>
		<div>
      <div>
        <i class="ofont ofont-success active-blue" v-if="statusList.DspProxy && statusList.DspProxy.State"></i>
        <i class="el-icon-loading" v-else></i>
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
import { ipcRenderer } from "electron";
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
		this.getNetworkState();
	}
};
</script>
<style lang="scss">
#login-log {
  min-height: 100%;
  & > div {
    text-align: center;
    font-size: 16px;

    & > div {
      height: 50px;
      i {
        font-size: 24px;
        margin-bottom: 20px;
      }
    }
    & > p {
      width: 200px;
    }
  }
}
</style>