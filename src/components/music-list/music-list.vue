<template>
  <!-- 歌曲列表,多处使用,抽取成公共组件 -->
  <div class="music-list">
    <div class="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <!-- bgStyle:计算属性传入图片的url-->
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <!-- 蒙层样式-->
      <div class="filter"></div>
    </div>
    <scroll :data="songs" ref="list" class="list">
      <div class="song-list-wrapper">
        <song-list :songs="songs"></song-list>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  import Scroll from 'base/scroll/scroll'
  import SongList from 'base/song-list/song-list'

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
    mounted () {
      /* 根据不同浏览器,顶部的歌手背景图的高度不一样,需要实时计算设置Scroll组件的Top值
      说明:
      this.$refs.list为Scroll组件(Component)
      */
      this.$refs.list.$el.style.top = `${this.$refs.bgImage.clientHeight}px`
    },
    computed: {
      bgStyle () {
        console.log(this.bgImage)
        return `background-image:url(${this.bgImage})`
      }
    },
    components: {
      Scroll, SongList
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

