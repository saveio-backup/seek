<template>
  <div class="canvasBg">
    <canvas id="Mycanvas" width="1920" height="946"></canvas>
  </div>
</template>

<script>
export default {
  data() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      point: 20,
      minRadius: 2,
      maxRadius: 50,
      canvas: null,
      context: null,
      circleArr: [],
      setIntervalObj: null,
      resizeObj: null
    };
  },
  methods: {
    init() {
      this.initAttr()
      this.initDraw();
      clearInterval(this.setIntervalObj);
      this.setIntervalObj = setInterval(() => {
        for(var i = 0; i < this.point; i++) {
          var cir = this.circleArr[i];
          cir.x += cir.moveX;
          cir.y += cir.moveY;
          if(cir.x > this.width) cir.x = 0;
          else if(cir.x < 0) cir.x = this.width;
          if(cir.y > this.height) cir.y = 0;
          else if(cir.y < 0) cir.y = this.height;
        }
        this.draw();
      }, 10);
    },
    initAttr() {
      this.width = window.innerWidth,
      this.height = window.innerHeight - 5,
      this.canvas = document.getElementById("Mycanvas");
      (this.canvas.width = this.width), (this.canvas.height = this.height);
      this.context = this.canvas.getContext("2d");
      (this.context.strokeStyle = "rgba(0,0,0,0.2)"),
        (this.context.strokeWidth = 1),
        (this.context.fillStyle = "rgba(0,0,0,0.1)");
      this.circleArr = [];
    },
    //线条：开始xy坐标，结束xy坐标，线条透明度
    Line(x, y, _x, _y, o) {
      let obj = {
        beginX: x,
        beginY: y,
        closeX: _x,
        closeY: _y,
        o: o
      }
      return obj;
    },
    //点：圆心xy坐标，半径，每帧移动xy的距离
    Circle(x, y, r, moveX, moveY) {
      let obj = {
        x:x,
        y: y,
        r: r,
        moveX: moveX,
        moveY: moveY
      }
      return obj
    },
    //生成max和min之间的随机数
    num(max, _min) {
      var min = arguments[1] || 0;
      return Math.floor(Math.random() * (max - min + 1) + min);
    },
    // 绘制原点
    drawCricle(cxt, x, y, r, moveX, moveY) {
      var circle = this.Circle(x, y, r, moveX, moveY)
      cxt.beginPath()
      cxt.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI)
      cxt.closePath()
      cxt.fill();
      return circle;
    },
    //绘制线条
    drawLine(cxt, x, y, _x, _y, o) {
      var line = this.Line(x, y, _x, _y, o)
      cxt.beginPath()
      cxt.strokeStyle = 'rgba(0,0,0,' + o + ')'
      cxt.moveTo(line.beginX, line.beginY)
      cxt.lineTo(line.closeX, line.closeY)
      cxt.closePath()
      cxt.stroke();

    },
    //每帧绘制
    draw() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for(var i = 0; i < this.point; i++) {
        this.drawCricle(this.context, this.circleArr[i].x, this.circleArr[i].y, this.circleArr[i].r);
      }
      for(var i = 0; i < this.point; i++) {
        for(var j = 0; j < this.point; j++) {
          if(i + j < this.point) {
            var A = Math.abs(this.circleArr[i + j].x - this.circleArr[i].x),
              B = Math.abs(this.circleArr[i + j].y - this.circleArr[i].y);
            var lineLength = Math.sqrt(A * A + B * B);
            var C = 1 / lineLength * 7 - 0.009;
            var lineOpacity = C > 0.03 ? 0.03 : C;
            if(lineOpacity > 0) {
              this.drawLine(this.context, this.circleArr[i].x, this.circleArr[i].y, this.circleArr[i + j].x, this.circleArr[i + j].y, lineOpacity);
            }
          }
        }
      }
    },
    //初始化生成原点
    initDraw() {
      this.circleArr = [];
      for(var i = 0; i < this.point; i++) {
        this.circleArr.push(this.drawCricle(this.context, this.num(this.width), this.num(this.height), this.num(this.maxRadius, this.minRadius), this.num(10, -10) / 40, this.num(10, -10) / 40));
      }
      this.draw();
    }
  },
  mounted() {
    this.init();
		// window.onresize = () => {
    //   clearTimeout(this.resizeObj);
    //   this.resizeObj = setTimeout(() => {
    //     this.init();
    //   },200)
    // }
  },
  beforeDestroy() {
    clearInterval(this.setIntervalObj);
  }
};
</script>
<style>
.canvasBg {
  position: absolute;
  top: 0;
  left: 0;
}
</style>

