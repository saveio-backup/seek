<!--
  have more theme pass class name!
  default(no class) .theme1 .primary
-->
<template>
	<div class="ripper-button">
		<div
			style="height: 0; width: 0; position: absolute; visibility: hidden;"
			aria-hidden="true"
		>
			<svg
				version="1.1"
				xmlns="http://www.w3.org/2000/svg"
				xmlns:xlink="http://www.w3.org/1999/xlink"
				focusable="false"
			>
				<symbol
					:id="`ripply-scott${id}`"
					viewBox="0 0 100 100"
				>
					<circle
						:id="`ripple-shape${id}`"
						cx="1"
						cy="1"
						r="1"
					/>
				</symbol>
			</svg>
		</div>
		<button
			:id="`js-ripple-btn${id}`"
			class="button styl-material"
			@mousedown="rippleAnimation($event)"
      @mouseup="toEmitClick"
		>
			<slot></slot>
			<svg
				class="ripple-obj"
				:id="`js-ripple${id}`"
			>
				<use
					height="100"
					width="100"
					:xlink:href="`#ripply-scott${id}`"
					:class="`js-ripple${id}`"
				></use>
			</svg>
		</button>
	</div>
</template>
<script>
import uuid from "node-uuid";
export default {
	data() {
		return {
			id: "",
			ripple: null
		};
	},
	methods: {
		readyInit() {
			this.id = uuid.v4();
    },
    toEmitClick() {
      this.$emit("click");
    },
		rippleAnimation($event) {
      let event = $event;
      // console.log($event);
      // console.log($event.target.offsetParent);
      let w = event.target.offsetWidth,
        h = event.target.offsetHeight,
        x = event.offsetX,
        y = event.offsetY
      if($event.target.offsetParent.nodeName === 'BUTTON') {
        event = $event.target.offsetParent;
        w = event.offsetWidth;
        h = event.offsetHeight; 
        x += 25;
        y += 6;
      }
			const timing = 0.5;
			let ripple =
        this.ripple || document.querySelectorAll(`.js-ripple${this.id}`);
			let tl = new TimelineMax(),
				offsetX = Math.abs(w / 2 - x),
				offsetY = Math.abs(h / 2 - y),
				deltaX = w / 2 + offsetX,
				deltaY = h / 2 + offsetY,
				scale_ratio = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
			// console.log("x is:" + x);
			// console.log("y is:" + y);
			// console.log("offsetX is:" + offsetX);
			// console.log("offsetY is:" + offsetY);
			// console.log("deltaX is:" + deltaX);
			// console.log("deltaY is:" + deltaY);
			// console.log("width is:" + w);
			// console.log("height is:" + h);
			// console.log("scale ratio is:" + scale_ratio);
			tl.fromTo(
				ripple,
				timing,
				{
					x: x,
					y: y,
					transformOrigin: "50% 50%",
					scale: 0,
					opacity: 1,
					ease: Linear.easeIn
				},
				{
					scale: scale_ratio,
					opacity: 0
				}
			);
		}
	},
	created() {
		this.readyInit();
	},
	mounted() {
		this.$nextTick(() => {
			this.ripple = document.querySelectorAll(`.js-ripple${this.id}`);
		});
	}
};
</script>
<style lang="scss" scoped>
.ripper-button {
	/* Component styles */
	border-radius: 20px;
	display: inline-block;

	&.primary {
		button {
			color: #fff;
			border: none;
		}
		.button.styl-material {
			background: linear-gradient(90deg, #13affa 0%, #3e7eeb 100%);
		}
		.ripple-obj {
			fill: rgba(255, 255, 255, 0.7);
		}
	}

	&.theme1 {
		.button {
			font-size: 1.2rem;
			padding: 0 12px;
			height: 32px;
		}
		.button.styl-material {
			background: white;
		}
	}

	svg {
		width: 0;
		height: 0;
	}

	button {
		appearance: none;
		// @include themify{
		// 	box-shadow: $card-shadow;
		// }
		box-shadow: 0px 4px 6px 0px rgba(111, 139, 173, 0.21);
		color: #2f8ff0;
		font-size: 1.4rem;
		border-radius: 20px;
		overflow: hidden;
		cursor: pointer;
		border: 1px solid #2f8ff0;
	}

	.button {
		padding: 6px 25px;
		position: relative;
		display: inline-block;
		font-size: 1.4rem;
	}

	.button.styl-material {
		transition: 200ms background cubic-bezier(0.4, 0, 0.2, 1);
		background: rgba(0, 0, 0, 0);
	}

	.button.styl-material:focus {
		outline: none;
	}

	.button.styl-material:hover {
		outline: none;
		opacity: 0.85;
	}

	.ripple-obj {
		height: 100%;
		pointer-events: none;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 0;
		width: 100%;
		// fill: #2F8FF0;
		fill: rgba(47, 143, 240, 0.7);
	}

	.ripple-obj use {
		opacity: 0;
	}
}
</style>