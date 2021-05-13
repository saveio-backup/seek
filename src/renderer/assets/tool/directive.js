import Vue from 'vue'

Vue.directive('seekclickoutside', {
  bind: function (el, binding, vnode) {
    el.documentHandler = (e) => {
      e.stopPropagation();
      const {
        handler,
        exclude
      } = binding.value;
      let clickedOnExcludedEl = false
      exclude && exclude.forEach(refName => {
        if (!clickedOnExcludedEl) {
          const excludedEl = vnode.context.$refs[refName]
          clickedOnExcludedEl = excludedEl.contains(e.target)
        }
      })
      if (!el.contains(e.target) && !clickedOnExcludedEl && handler) {
        vnode.context[handler]()
      }
    }
    document.body.addEventListener('click', el.documentHandler);
  },
  unbind(el) {
    console.log('unbind');
    document.body.removeEventListener('click', el.documentHandler);
  }
});