<template>
  <div id="syncInfo" class="syncInfoWrapper flex column around">
    <p class="ftpx12 text-center theme-font-blue-70">
      #{{currentHeihgt}} / #{{totalHeight}}
    </p>
    <p class="ftpx12 text-center light-blue">
      <span v-if="needTime">{{needTime}} / </span> {{prograssPercentage}} %
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      intervalObj: null,
      oldCurrentNum: 0,
      time: -1, // defaut
      currentTime: 1,
      speedNum: 1,
      secondSpeed: 1,
      needTime: 0
    }
  },
  computed: {
    prograssPercentage: function() {
      let percenteage = (
				(this.currentHeihgt / this.totalHeight
					? this.currentHeihgt / this.totalHeight
					: 0) * 100
      ).toFixed(2);
      percenteage = ((percenteage === '100.00') && (this.currentHeihgt !== this.totalHeight)) ? '99.99' : percenteage;
      return percenteage;
		},
    currentHeihgt: function() {
			return this.$store.state.Home.currentHeight || 0;
		},
		totalHeight: function() {
      this.speedNum = 0;
			return this.$store.state.Home.totalHeight || 0;
		}
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const TIME_OUT = 1000 * this.$config.outTime;
      this.oldCurrentNum = this.currentHeihgt;
      this.intervalObj = setInterval(() => {
        this.speedNum ++;
        if (this.speedNum !== 1) {
          this.currentTime = this.speedNum;
          return;
        }
        this.secondSpeed = (this.currentHeihgt - this.oldCurrentNum)/(this.currentTime + 1);
        this.oldCurrentNum = this.currentHeihgt;
        this.currentTime++;
        this.needTime = this.getTime();
      }, TIME_OUT)
    },
    getTime() {
      if((this.totalHeight - this.currentHeihgt) > 50) {
        if(this.secondSpeed <= 1) {
          return 0;
        } 
        let _t = (this.totalHeight - this.currentHeihgt)/(this.secondSpeed - 1) * this.$config.outTime;
        let _d = parseInt(_t / 86400);
        let _h = parseInt((_t % 86400) / 3600);
        let _m = parseInt((_t % 3600) / 60);
        let _s = parseInt(_t % 60);
        let arr = [];
        return `${_d===0?'':(_d + 'd ')}${_h===0?'':(_h + 'h ')}${_m===0?'':(_m + 'm ')}${_s===0?'':(_s + 's ')}` 
      } else {
        return 0;
      }
    }
  }
}
</script>
<style lang="scss">
  .syncInfoWrapper {
    padding: 10px 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>