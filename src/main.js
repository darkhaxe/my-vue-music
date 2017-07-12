import Vue from 'vue'
import App from './App.vue'
import 'babel-polyfill'
import 'common/stylus/index.styl'
import fastclick from 'fastclick'
import router from './router'
import VueLazyLoad from 'vue-lazyload'

// 解决整个页面的点击事件的300ms延迟的问题
fastclick.attach(document.body)
// 图片懒加载
Vue.use(VueLazyLoad, {
  loading: require('common/image/default.png')
})
/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App),
  router // 路由配置
})
