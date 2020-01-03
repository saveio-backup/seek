<template>
	<div class="circle-progress">
		<canvas
			:id="id"
			:width="width"
			:height="width"
		></canvas>
	</div>
</template>
<script>
import uuid from "node-uuid";
export default {
	props: {
		percentage: {
			default: 0,
			type: Number
		},
		width: {
			default: 10,
			type: Number
    },
    color: {
      default: '#2F8FF0',
      type: String
    }
  },
  watch: {
    percentage(newVal) {
      if(!this.ctx) return;
      this.loadProgress(newVal);
    }
  },
	data() {
		return {
      id: uuid.v4(),
      ctx: null,
      progressIntervalObj: null,
      currentPercentage: 0
		};
	},
	methods: {
		init() {
      const vm = this;
      let c = document.getElementById(vm.id);
      if(c === null) return;
      this.ctx = c.getContext("2d");
      this.loadProgress(this.percentage);
    },
    drawBingTu(canvascolor, x, y, r, progress){
      const vm = this;
      //canvascolor fill color，x，y circle center，r，end is end angle
      this.ctx.clearRect(0, 0, vm.width, vm.width);
      // draw circle sector 
      this.ctx.fillStyle = canvascolor;
      this.ctx.beginPath();
      this.ctx.arc(x, y, r, -Math.PI * 0.5, progress, false);
      this.ctx.lineTo(x,y);
      this.ctx.lineTo(x,y-r);
      this.ctx.fill();
      this.ctx.closePath();
      // draw circle
      this.ctx.beginPath();
      this.ctx.arc( x, y, r - 1.5, 0, 2 * Math.PI); //弧度是顺时针算的
      this.ctx.strokeStyle = canvascolor;
      this.ctx.lineWidth=3;
      this.ctx.stroke();
      this.ctx.closePath();
    },
    loadProgress(progress) {
      const vm = this;
      clearInterval(this.progressIntervalObj);
      let piProgress = progress * Math.PI;
      let r = this.width / 2;
      let c = this.width / 2;
      let i = vm.currentPercentage;
      vm.progressIntervalObj = setInterval(() => {
        if(parseInt(i * 100) > parseInt(progress * 100)){
          i = i - 0.01; 
        } else if(parseInt(i * 100) < parseInt(progress * 100)) {
          i = i + 0.01; 
        }
        vm.currentPercentage = i;
        vm.drawBingTu(vm.color, c, c, r, (i * 2 - 0.5) * Math.PI);
      }, 10)
    }
	},
	mounted() {
    this.$nextTick(() => {
      this.init();
    })
	}
};
</script>