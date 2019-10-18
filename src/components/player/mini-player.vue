<template>

  <div class="mini-player" @click="open" v-show="!fullScreen">
    <div class="icon">
      <img width="40" height="40" :class="cdRotate" :src="currentSong.image">
    </div>
    <div class="text">
      <h2 class="name" v-html="currentSong.name"></h2>
      <p class="desc" v-html="currentSong.singer"></p>
    </div>
    <div class="control">
      <!-- 圆形进度条 包裹 播放按钮 -->
      <progress-circle :radius="progress_circle_radius" :percent="percent">
        <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
      </progress-circle>
    </div>
    <div class="control">
      <i class="icon-playlist"></i>
    </div>
  </div>

</template>

<script>
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import { mapGetters, mapMutations } from 'vuex'

  export default {
    data () {
      return {
        // 播放按钮进度条的半径
        progress_circle_radius: 32
      }
    },
    props: {
      currentSong: {
        type: Object
      },
      playing: {
        type: Boolean
      },
      songReady: {
        type: Boolean
      },
      percent: {
        type: Number
      },
    },
    components: {
      ProgressCircle
    },
    computed: {
      ...mapGetters([
        'fullScreen'
      ]),
      miniIcon () { // 图标字体库的样式
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      cdRotate () {
        return this.playing ? 'play' : 'play pause'
      }
    },
    methods: {
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PLAYING_STATE'
      }),
      open () {
        this.setFullScreen(true)
      },
      togglePlaying () {
        if (!this.songReady) {
          return
        }
        // 对state中的全局状态取反
        this.setPlayingState(!this.playing)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/component/player.styl"

</style>
