<template>
	<div id="login-log">
		<div class="flex jc-center ai-center">
			<div>
				<i
					class="first-ofont ofont ofont-lianjie1"
					:class="
						stateObjByName['chain'] && stateObjByName['chain'].State === 3 && statusList.Chain && statusList.Chain.State
							? 'active-blue'
							: 'ofont-grep'
					"
				></i>
				<div
					class="connect-success"
					v-if="
						stateObjByName['chain'] && stateObjByName['chain'].State === 3 && statusList.Chain && statusList.Chain.State
					"
				>
					<i class="ofont ofont-wancheng-"></i>
				</div>
				<div slot="append" v-else class="loading text-center transparent">
					<i class="ofont ofont-loading loading-rotate"></i>
				</div>
				<p>
					{{ $t("menuWindow.chainState") }}
				</p>
			</div>
			<div>
				<i
					class="first-ofont ofont ofont-ziyuan"
					:class="
						stateObjByName['dsp'] &&
						stateObjByName['dsp'].State === 3 &&
						statusList.DspProxy &&
						statusList.DspProxy.State
							? 'active-blue'
							: 'ofont-grep'
					"
				></i>
				<div
					v-if="
						stateObjByName['dsp'] &&
							stateObjByName['dsp'].State === 3 &&
							statusList.DspProxy &&
							statusList.DspProxy.State
					"
					class="connect-success"
				>
					<i class="ofont ofont-wancheng-"></i>
				</div>
				<div slot="append" v-else class="loading text-center transparent">
					<i class="ofont ofont-loading loading-rotate"></i>
				</div>
				<p>
					<!-- Dsp代理状态 -->
					{{ $t("menuWindow.dspProxyState") }}
				</p>
			</div>
			<div>
				<i
					class="first-ofont ofont ofont-DNS-"
					:class="
						stateObjByName['pylons'] &&
						stateObjByName['pylons'].State === 3 &&
						statusList.DNS &&
						(statusList.DNS.State || statusList.DNS.HostAddr === '')
							? 'active-blue'
							: stateObjByName['pylons'] && stateObjByName['pylons'].State === 6
							? 'ofont-error'
							: 'ofont-grep'
					"
				></i>
				<div
					class="connect-success"
					v-if="
						stateObjByName['pylons'] &&
							stateObjByName['pylons'].State === 3 &&
							statusList.DNS &&
							(statusList.DNS.State || statusList.DNS.HostAddr === '')
					"
				>
					<i class="ofont ofont-wancheng-"></i>
				</div>
				<div slot="append" v-else class="loading text-center transparent">
					<i class="ofont ofont-loading loading-rotate"></i>
				</div>
				<p>
					<!-- DNS状态: -->
					{{ $t("menuWindow.dnsState") }}
				</p>
			</div>
		</div>
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
		moduleState() {
			return this.$store.state.Home.moduleState || [];
		},
		stateObjByName() {
			let obj = {};
			for (let item of this.moduleState) {
				obj[item.Name] = item;
			}
			return obj;
		}
	},
	watch: {
		statusList() {
			this.checkDoneLog();
		},
		stateObjByName() {
			this.checkDoneLog();
		}
	},
	methods: {
		checkDoneLog() {
			const vm = this;
			clearTimeout(vm.statusListTimeoutObj);
			vm.statusListTimeoutObj = setTimeout(() => {
				let flag = true;
				let dnsHasError = false;
				if (!vm.statusList) return;
				if (vm.stateObjByName["chain"] && vm.stateObjByName["chain"].State === 3) {
					if (!vm.statusList["Chain"] || vm.statusList["Chain"].State === 0) {
						return false;
					}
				} else {
					return false;
				}
				if (vm.stateObjByName["dsp"] && vm.stateObjByName["dsp"].State === 3) {
					if (!vm.statusList["DspProxy"] || vm.statusList["DspProxy"].State === 0) {
						return false;
					}
				} else {
					return false;
				}

				if (vm.stateObjByName["pylons"]) {
					if (vm.stateObjByName["pylons"].State === 6) {
						dnsHasError = true;
					} else if (vm.stateObjByName["pylons"].State === 3) {
						if (!vm.statusList["DNS"] || (vm.statusList["DNS"].State === 0 && vm.statusList["DNS"].HostAddr != "")) {
							return false;
						}
					} else {
						return false;
					}
				} else {
					return false;
				}
				if (flag) {
					ipcRenderer.send("run-dialog-event", {
						name: "setIsLoginShowLog",
						data: true
					});
					if (dnsHasError) {
						ipcRenderer.send("run-dialog-event", {
							name: "message",
							data: {
								info: vm.$t("error[1002]"),
								type: "error",
								dangerouslyUseHTMLString: false
							}
						});
					}
				}
			}, 1000);
		},
		getNetworkState() {
			this.$axios.get(this.$api.networkStatus).then(res => {
				if (res.Error === 0) {
					this.$store.commit("SET_STAET", res.Result);
				}
			});
		},
		attach() {
			ipcRenderer.send("run-dialog-event", {
				name: "attach",
				data: {
					names: ["progress", "state", "channel", "modulestate"],
					id: remote.getCurrentWebContents().id
				}
			});
		}
	},
	mounted() {
		const vm = this;
		ipcRenderer.on("dialog-load", e => {
			vm.attach();
		});
		vm.attach();
		this.getNetworkState();
	}
};
</script>

<style lang="scss">
#login-log {
	min-height: 100%;
	width: 100%;
	height: 100%;
	padding: 80px 108px;
	@include themify {
		color: $primary-font-color;
	}

	& > div {
		width: 100%;
		height: 100%;
		border-radius: 6px;

		@include themify {
			box-shadow: $card-shadow;
			background-color: $card-color;
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

					&.ofont-error {
						color: #c44;
					}
				}

				&.ofont-success {
					color: #8bd179;
				}
			}

			& > div {
				width: 30px;
				height: 30px;
				// background: #A6A6A6;
				display: flex;
				justify-content: center;
				align-items: center;
				border-radius: 15px;
				&.connect-success {
					i {
						color: #8bd179;
					}
				}

				i {
					font-size: 22px;
					color: #a6a6a6;
					// color: white;
				}
			}

			& > p {
				width: 200px;
				margin-top: 24px;
			}
		}
	}
}
</style>
