<template>
  <scroll class="listview"
          :data="data"
          ref="listview"
          :listen-scroll="listenScroll"
          :probeType="probeType"
          @scroll="scroll"
  >
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title"> {{group.title}}</h2><!-- 顶部的歌手对应title-->
        <ul>
          <li @click="selectItem(item)" v-for="item in group.items" class="list-group-item">
            <img class="avatar" v-lazy="item.avatar"/>
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!-- 右侧快速入口;1.点击移动到对应字母开头的歌手列表;2.在字母列表滑动时触发歌手列表的滚动-->
    <div class="list-shortcut" @touchstart.stop.prevent="onShortcutTouchStart"
         @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li v-for="(item,index) in shortcutList" class="item"
            :data-index="index"
            :class="{'current':currentIndex===index}">{{item}}
        </li>
      </ul>
    </div>
    <!--固定标题 -->
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}} </div>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import { getData } from 'common/js/dom'
  const ANCHOR_HEIGHT = 18 // 18来自css定义个每个元素的高度
  const TITLE_HEIGHT = 30 // 固定位置的高度

  export default {
    created() {
      // 共享变量 不需要观测touch的变化,故不定义在vue的data中
      this.touch = {}
      // 传入scroll组件的变量,参见dom中写法
      this.listenScroll = true
      this.probeType = 3
    },
    data() {
      return {
        scrollY: -1,
        currentIndex: 0, // 右侧入口高亮元素的index
        listHeight: [], // 每行的纵坐标y值 [0, 760, 1030, 1370, 1780, 1910, 2110, 2450, 2720, 3060, 3190, 3950, 4430, 4700, 4900, 5100, 5370, 5570, 5980, 6460, 7010, 7560, 7900, 9010]
        diff: 0 // 当前区块的title栏与当前title的距离
      }
    },
    props: { // 外部传入的数据
      data: {
        type: Array,
        default: []
      }
    },
    computed: {
      shortcutList() {
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      },
      fixedTitle() {
        if (this.scrollY < 0) {

        }
        // data内容在vue-devtool看
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    methods: {
      /**
       * 派发点击事件到组件外部,使用$emit
       */
      selectItem(item) {
        this.$emit('select', item)
      },
      /**
       * 监听touchstart事件
       * 点击移动到对应字母开头的歌手列表
       * @param e event
       */
      onShortcutTouchStart(e) {
        let anchorIndex = getData(e.target, 'index')
        let firstTouch = e.touches[0] // 开始位置
        this.touch.y1 = firstTouch.pageY
        this.touch.anchorIndex = anchorIndex
        this._scrollTo(anchorIndex)
      },
      /**
       * 监听touchmove事件;
       * 思想:
       * 1.在onShortcutTouchStart获取起始位置的pageY,存入共享变量
       * 2.在(手指)移动结束获得结束位置的pageY,二者相减并除以元素高度,获得移动过的元素个数
       * 3.调用better-scroll跳转到响应的位置
       * @param e
       */
      onShortcutTouchMove(e) {
        let firstTouch = e.touches[0]
        this.touch.y2 = firstTouch.pageY
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0 // 地板除取整
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta
        this._scrollTo(anchorIndex)
      },
      /**
       * pos为接收scroll组件派发的位置
       * @param pos
       */
      scroll(pos) {
//        console.log(pos)
        this.scrollY = pos.y
      },
      _scrollTo: function (anchorIndex) {
        // console.log(this.listHeight)
        if (!anchorIndex && anchorIndex !== 0) {
          return
        }
        // onShortcutTouchMove事件中,在最底与最顶的位置滑动,由于事件未结束可导致计算的anchorIndex超过预期
        if (anchorIndex < 0) {
          anchorIndex = 0
        } else if (anchorIndex > this._maxAnchorIndex()) {
          anchorIndex = this._maxAnchorIndex()
        }
        // 手动改变scrollY,触发更新样式右侧入口字母列表的样式
        this.scrollY = -this.listHeight[anchorIndex]
        // 调用scroll组件 传入参数
        this.$refs.listview.scrollToElement(this.$refs.listGroup[anchorIndex], 0)
      },
      /**
       * 实现: vue的data中存放scrollY,该变量变化将触发watch事件,
       * watch事件调用_calculateHeight重新计算高度数组
       * @private
       */
      _calculateHeight() {
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height) // 高度区间数组
        for (let i = 0; i < list.length; i++) {
          height += list[i].clientHeight
          this.listHeight.push(height)
        }
//        console.log('this.$refs.listGroup长度=' + list.length + '-- 高度数组长度=' + this.listHeight.length)
      },
      /**
       * 右侧快速入口的index的最大值
       */
      _maxAnchorIndex: function () {
        return this.listHeight - 2
      }
    },
    watch: {
      /**
       * data变化时重新计算高度
       */
      data() {
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      /**
       * 监听scrollY的变化
       * @param newY
       */
      scrollY(newY) {
//        console.log(`newy=${newY}`)
        const listHeight = this.listHeight
        // 光标在顶部，newY>0
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // 光标在中间部分 newY<0
        for (let i = 0; i < listHeight.length - 1; i++) {
          let low = listHeight[i]
          let high = listHeight[i + 1]
          if (-newY >= low && -newY < high) { // 在数组的区间内则可算出右侧index=i
            this.currentIndex = i
            return
          }
        }
        // 底部
        this.currentIndex = this._maxAnchorIndex()
      },
      diff(newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        if (this.fixedTop === fixedTop) { // 假如未达到顶端,不修改dom
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)` // todo 未理解 @170714
      }
    },
    components: {
      Scroll
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>

