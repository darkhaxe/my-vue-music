<template>
  <!-- 歌曲列表,多处使用,抽取成公共组件 -->
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <!-- bgStyle:计算属性传入图片的url-->
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <!-- 歌曲数量>0才显示按钮 -->
        <div ref="playBtn" v-show="songs.length>0" class="play">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <!-- 蒙层样式-->
      <div class="filter" ref="filter"></div>
    </div>
    <!--
     实现歌单列表往上滚动的特效 bg-layer的 height: 100%与屏幕高度相同
     为了使该div不向上滚动太多,露出歌手图片,需要设置滚动一定距离后停止滚动,
     在scrollY中设置.
     1.获取歌手图片的height
      优化:避免dom操作,在mounted函数使用一个imageHeight缓存适配生成的图片高度
    -->
    <div class="bg-layer" ref="layer"></div>
    <scroll @scroll="getScrollPosition"
            :probe-type="probeType"
            :listen-scroll="listenScroll"
            :data="songs"
            ref="list"
            class="list">
      <div class="song-list-wrapper">
        <song-list @select="selectItem" :songs="songs"></song-list>
      </div>
      <div v-show="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'
  import { prefixStyle } from 'common/js/dom'
  import Loading from 'base/loading/loading'
  import { mapActions } from 'vuex'

  const RESERVED_HEIGHT = 40
  const transform = prefixStyle('transform')
  const backdrop = prefixStyle('backdrop-filter')

  export default {
    // --------接收父组件传递的数据的格式--------
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: function () {
          return []
        }
      },
      title: {
        type: String,
        default: ''
      }
    },
    // ----------------------------------------
    data () {
      return {
        scrollY: 0,
        imageHeight: 0,
        minTranslateHeight: 0
      }
    },
    /*
    歌单列表上移的交互效果
    传递给Scroll组件
    */
    created () {
      this.probeType = 3
      this.listenScroll = true
    },
    mounted () {
      this.imageHeight = this.$refs.bgImage.clientHeight
      /* 根据不同浏览器,顶部的歌手背景图的高度不一样,需要实时计算设置Scroll组件的Top值
      说明:
      this.$refs.list为Scroll组件(Component)
      */
      this.minTranslateHeight = -this.imageHeight + RESERVED_HEIGHT
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    computed: {
      bgStyle () {
//        console.log(this.bgImage)
        return `background-image:url(${this.bgImage})`
      }
    },
    methods: {
      /*
      实时拿到滚动的位置y,赋值到组件维护的变量scrollY
      通过监听scrollY的变化,给layer的style赋予变化
       */
      getScrollPosition (pos) {
        this.scrollY = pos.y
      },
      back () {
        this.$router.back()
      },
      /**
       * 提交vuex的action操作,改变state状态
       * @param item 在本方法中未使用
       * @param index
       */
      selectItem (item, index) {
        console.log('music-list:selectItem' + this.songs)
        this.selectPlay({
          songlist: this.songs,
          index
        })
      },
      ...mapActions(['selectPlay'])
    },
    watch: {
      scrollY (newY) {
        let translateY = Math.max(this.minTranslateHeight, newY)
        this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
        // 向上滚动bgLayer时使bgImage盖住list(即列表的class),
        // 向下滚动时list高度低于
        if (newY < this.minTranslateHeight) {
          this.$refs.bgImage.style.zIndex = 10
        }

        if (newY < this.minTranslateHeight) {
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
        } else {
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
        }

        if (newY < this.minTranslateHeight) {
          this.$refs.playBtn.style.display = 'none'
        } else {
          this.$refs.playBtn.style.display = ''
        }

        // 图片下拉放大
        const percent = Math.abs(newY / this.imageHeight)
        if (newY > 0) {
          this.$refs.bgImage.style[transform] = `scale(${1 + percent})`
        }
        // 图片上移高斯模糊
        if (newY <= 0) {
          this.$refs.filter.style[backdrop] = `blur(${Math.min(20, percent * 20)}px)`
        }
      }
    },
    components: {
      Scroll, SongList, Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: absolute
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>

