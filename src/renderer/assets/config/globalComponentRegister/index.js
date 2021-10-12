import Vue from 'vue'

// RipperButton
import RipperButton from './../../../components/RipperButton.vue'
import './../../../../../static/css/buttonRipple/js/TweenMax.min'
Vue.use(RipperButton);
Vue.component('ripper-button', RipperButton); // init component

export {
  RipperButton
}

