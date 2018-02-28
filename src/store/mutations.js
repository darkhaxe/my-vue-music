import * as types from './mutation-types'

const mutations = {
  /**
   *
   * @param state 状态树
   * @param singer 传入的singer
   */
  [types.SET_SINGER] (state, singer) {
    state.singer = singer
  }
}

export default mutations
