<template>
  <div id="syncInfo" class="syncInfoWrapper flex column around">
    <p class="ft12 text-center theme-font-blue-70">
      #{{currentHeihgt}} / #{{totalHeight}}
    </p>
    <p class="ft12 text-center light-blue">
      {{prograssPercentage}} %
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      intervalObj: null,
      oldCurrentNum: 0,
      time: -1 // defaut
    }
  },
  computed: {
    prograssPercentage: function() {
			return (
				(this.currentHeihgt / this.totalHeight
					? this.currentHeihgt / this.totalHeight
					: 0) * 100
			).toFixed(2) === "100.00"
				? "99.99"
				: (
						(this.currentHeihgt / this.totalHeight
							? this.currentHeihgt / this.totalHeight
							: 0) * 100
				  ).toFixed(2);
		},
    currentHeihgt: function() {
			return this.$store.state.Home.currentHeight || 0;
		},
		totalHeight: function() {
			return this.$store.state.Home.totalHeight || 0;
		}
  },
  mounted() {
    // this.init();
  },
  methods: {
    init() {
      const TIME_OUT = 5000;
      this.oldCurrentNum = this.currentHeihgt;
      this.intervalObj = setInterval(() => {
        let secondSpeed = (this.currentHeihgt - this.oldCurrentNum) / 5;
        this.oldCurrentNum = this.currentHeihgt;
      }, TIME_OUT)
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