import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

// 调试工具,直接修改store将报错
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  actions,
  getters,
  state,
  mutations,
  // 严格模式:将检测state的修改是否来源于mutation,否则报警告
  strict: debug,
  // 开启,则每次对mutation的修改在控制台打印log
  plugins: debug ? [createLogger()] : []
})
