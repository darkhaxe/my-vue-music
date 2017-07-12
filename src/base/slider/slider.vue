/**
* Created by haze-Mac on 2017/7/7.
*/

<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot" v-for="(d,index) in dots" :class="{active:currentPageIndex === index}"></span>
    </div>
  </div>
</template>
<script type="text/ecmascript-6">

  import BScroll from 'better-scroll'
  import { addClass } from 'common/js/dom'
  export default {
    data() {
      return {
        dots: [],
        currentPageIndex: 0
      }
    },
    props: { // 可从外部控制这个组件
      loop: {
        type: Boolean,
        default: true
      },
      autoPlay: {
        type: Boolean,
        default: true
      },
      interval: {
        type: Number,
        default: 4000
      }
    },
    // 正确渲染轮播图 ,setTimeout也可使用nextTick替代
    mounted() {
      setTimeout(() => {
        this._setSliderWidth()
        this._initDots()
        this._initSlider()

        if (this.autoPlay) {
          this._play()
        }
      }, 20)  // 浏览器刷新dom间隔为17ms,将setTimeout设置成1ms也是17ms才刷新一次
      // 优化:当窗口大小发生改变时重新调用_setSliderWidth,
      window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }
        this._setSliderWidth(true)
      })
    },
    methods: {
      /**
       * 1.将每个轮播的子Div的宽度设置为父容器的初始宽度
       * 2.更具列表长度计算并重置父容器的加总宽度
       */
      _setSliderWidth(isResize) {
        // children数组是this.$refs.sliderGroup.children的shallow copy,实际是包裹图片的div元素,用于语义化编程;
        this.children = this.$refs.sliderGroup.children
        let width = 0
        let sliderWidth = this.$refs.slider.clientWidth // 父容器的宽度
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          addClass(child, 'slider-item') // 正确的样式slider-item,避免耦合不可再recommend.vue完成
          // 由于是shallow copy,改变每个div的宽度即改变了实际的this.$refs.sliderGroup.children的元素的属性
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        // 轮播可循环则在左右增加两个dom的长度,better-scroll要求
        // 标志位,在重新调整的时候不可将width+=2再执行一遍
        if (this.loop && !isResize) {
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px' // 加总,改变父容器的宽度
      },
      /**
       *由于
       */
      _initDots() {
        this.dots = new Array(this.children.length) // dot数量就是children数组的数量
      },
      _play() {
        let pageIndex = this.currentPageIndex + 1 // pageIndex为跳到下一张图片的索引,因此需要 +1
        if (this.loop) { // 在_initSlider的处理中已经把当前页的索引-1,需要加回来
          pageIndex += 1
        }
        clearTimeout(this.timer) // 每次轮播前要进行清除,否则假如 手动滑动图片,会马上触发一次滚动图片
        this.timer = setTimeout(() => {
          this.slider.goToPage(pageIndex, 0, 400) // y轴为0,代表只在x轴轮播
        }, this.interval)
      },
      /**
       * 应用Better_scroll,初始化绑定要轮播的Dom
       * @private
       */
      _initSlider() {
        this.slider = new BScroll(this.$refs.slider,
          { // 配置,含义参见git
            scrollX: true,
            scrollY: false,
            momentum: false,
            snap: true,
            snapLoop: this.loop,
            snapThreshold: 0.3,
            snapSpeed: 400
            // 此设置将导致点击无法跳转,原因:better-scroll阻止了浏览器的click,自行派发一个click事件,而fastClick捕获此事件,再次将其阻止
//            click: true
          })
        this._onScrollEnd()
      },
      _onScrollEnd() {
        // better-scroll滚动完毕派发事件,绑定dots
        this.slider.on('scrollEnd', () => {
          let pageIndex = this.slider.getCurrentPage().pageX
          if (this.loop) { // betterScroll轮播设置为循环的时候需要-1,因为循环模式的时候,betterScroll将索引+1处理
            pageIndex -= 1
          }
          this.currentPageIndex = pageIndex
          if (this.autoPlay) {
            this._play()
          }
        })
      }
    },
    /**
     * 清除timout防止泄露
     */
    destroyed() {
      clearTimeout(this.timer)
    }
  }

</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      transform: translateZ(1px)
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active // dots亮点样式
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
