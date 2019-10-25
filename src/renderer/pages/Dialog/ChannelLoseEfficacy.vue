<template>
  <div class="channel-lose-efficacy">
    <el-dialog
			center
			width='600px'
			:before-close="closeDialog"
			:close-on-click-modal='false'
			:visible.sync="isCreateChannelToggle"
		>
      <div slot="title">
        <h2>{{$t('public.notice')}}</h2>
				<div class="dialog-title-border"></div>
      </div>
      <div class="loading-content">
        <div class="mb20">
          <p class="mt20 ft14">
            当前通道失效,请新建或者替换其他通道
          </p>
        </div>
        <div slot="footer">
          <ripper-button
            type="primary"
            class="primary"
            @click="confirmSwitch"
          >{{$t('public.confirm')}}</ripper-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isCreateChannelToggle: false
    }
  },
  methods: {
    closeDialog() {
			this.$emit("closeDialog", { timeout: 0 });
		},
    confirmSwitch() {
			this.$emit("closeDialog", { timeout: 0 });      
    }
  },
	mounted() {
    this.isCreateChannelToggle = true;
	}
}
</script>
<style lang="scss">
  
</style>