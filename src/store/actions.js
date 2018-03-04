/**
 * 一般是异步操作,或者是对mutations的封装
 */
import * as types from './mutation-types'

/**
 * 选中歌曲时的5个状态变化
 * @param commit
 * @param state
 * @param songlist 变量结构,要求变量名相同,才可获取其中的值,参见music-list.selectItem的调用
 * @param index
 */
export const selectPlay = function ({commit, state}, {songlist, index}) {
  // 设置播放顺序歌单
  commit(types.SET_SEQUENCE_LIST, songlist)
  // 设置歌单
  commit(types.SET_PLAYLIST, songlist)
  // 设置点击的歌曲]索引
  commit(types.SET_CURRENT_INDEX, index)
  // 设置player组件全屏
  commit(types.SET_FULL_SCREEN, true)
  // 设置 播放中 状态
  commit(types.SET_PLAYING_STATE, true)
}
