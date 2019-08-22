<template>
	<div
		id="stateInfo"
		class="stateInfoWrappper"
	>
		<ul class="ft14 theme-font-blue-70">
			<li class="flex">
				<i
					class="process-status"
					:class="{'process-all-error': statusList.ChainState === 0}"
				></i> Chain State
			</li>
			<li class="flex">
				<i
					class="process-status"
					:class="{'process-all-error': statusList.DNSState === 0}"
				></i> DNS State
			</li>
			<li class="flex">
				<i
					class="process-status"
					:class="{'process-all-error': statusList.DspProxyState === 0}"
				></i> Dsp Proxy State
			</li>
			<li class="flex">
				<i
					class="process-status"
					:class="{'process-all-error': statusList.ChannelProxyState === 0}"
				></i> Channel Proxy State
			</li>
		</ul>
	</div>
</template>

<script>
export default {
	computed: {
		statusList: function() {
			return this.$store.state.Home.state;
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
      background: linear-gradient(180deg,rgba(61,227,86,1) 0%,rgba(23,173,44,1) 100%);;
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
    }
  }
}
</style>