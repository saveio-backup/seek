<template>
	<div
		id="stateInfo"
		class="stateInfoWrappper"
	>
		<ul class="ftpx14 theme-font-color">
			<li class="flex">
				<i
					class="process-status"
					:class="{'process-all-error': statusList.Chain.State === 0}"
				></i> {{$t('menuWindow.chainState')}}
			</li>
			<li class="flex">
				<i
					class="process-status"
					:class="{'process-all-error': statusList.DNS.State === 0 && statusList.DNS.HostAddr, 'process-all-offline': statusList.DNS.State === 0 && !statusList.DNS.HostAddr}"
				></i> {{$t('menuWindow.dnsState')}}
				<i
					v-show="statusList.DNS.State === 0 && statusList.DNS.HostAddr && UpdatedAt(statusList.DNS.UpdatedAt)"
					class="ofont ofont-chonglian ftpx18 ml10 light-blue cursor-click cursor-pointer"
					:class="{'rotate-animate': isLoading}"
					@click="reconnect"
				></i>
			</li>
			<li class="flex">
				<i
					class="process-status"
					:class="{'process-all-error': statusList.DspProxy.State === 0}"
				></i> {{$t('menuWindow.dspProxyState')}}
			</li>
			<li class="flex">
				<i
					class="process-status"
					:class="{'process-all-error': statusList.ChannelProxy.State === 0}"
				></i> {{$t('menuWindow.channelProxyState')}}
			</li>
		</ul>
	</div>
</template>

<script>
import { ipcRenderer, remote } from "electron";
export default {
	data() {
		return {
			isLoading: false
		};
	},
	computed: {
		statusList: function() {
			return this.$store.state.Home.state;
		},
		UpdatedAt: function() {
			return function(UpdatedAt) {
				try {
					let currentAt = + new Date();
					const TIMEOUT = 60 * 1000 * 3;
					if(currentAt - (UpdatedAt*1000) > TIMEOUT) {
						return true;
					}
					return false;
				}catch(e) {
					return false;
				}
			}
		}
	},
	methods: {
		reconnect() {
			if(this.isLoading) return;
			this.isLoading = true;
			let params = {
				Peers: [this.statusList.DNS.HostAddr]
			}
			this.$axios
				.post(this.$api.reconnect, params, {
					timeout: 60000
				})
				.then(res => {
					this.isLoading = false;
				})
				.catch(e => {
					this.isLoading = false;
				});
		}
	}
};
</script>
<style lang="scss">
.stateInfoWrappper {
	padding: 10px 20px;
	li {
		margin-top: 10px;
		.process-status {
			position: relative;
			margin-right: 7px;
			top: 5px;
			width: 6px;
			height: 6px;
			border-radius: 50%;
			display: block;
			border: 2px solid white;
			background: linear-gradient(
				180deg,
				rgba(61, 227, 86, 1) 0%,
				rgba(23, 173, 44, 1) 100%
			);
			box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.3);
			border: 1px solid rgba(237, 237, 237, 1);

			&.process-all-error {
				background: linear-gradient(
					180deg,
					rgba(247, 144, 115, 1) 0%,
					rgba(194, 70, 43, 1) 100%
				);
				box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.3);
				border: 1px solid rgba(237, 237, 237, 1);
			}

			&.process-all-offline {
				background: linear-gradient(
					180deg,
					rgba(222, 222, 222, 1) 0%,
					rgba(144, 144, 144, 1) 100%
				);
				box-shadow: 0px 0px 3px 0px rgba(0, 0, 0, 0.3);
				border: 1px solid rgba(237, 237, 237, 1);

			}
		}
		.rotate-animate {
			animation: rotates 1s linear infinite;
			transform-origin: 50% 50%;
		}
		@keyframes rotates {
			from {
				transform: rotateZ(0);
			}
			to {
				transform: rotateZ(360deg)
			}
		}
	}
}
</style>