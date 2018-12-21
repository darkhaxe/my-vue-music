<template>
  <div class="player" v-show="playlist.length>0">
    <!-- CD image animation-->
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <!-- 背景图-->
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image"/>
        </div>
        <div class="top"><!-- 顶部-->
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"><!-- -->
          <div class="middle-l">
            <div class="cd-wrapper" ref="cdWrapper"><!-- 引用用于实现动画-->
              <div class="cd" :class="cdRotate">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
          </div>
        </div>
        <div class="bottom"><!-- 操作按钮-->
          <div class="progress-wrapper">
            <!-- 左侧 -->
            <span class="time time-l">{{formatTime(currentTime)}}</span>
            <!-- flex布局 -->
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <!-- 右侧 -->
            <span class="time time-r">{{formatTime(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left">
              <i class="icon-sequence"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next " class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
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
    </transition>
    <audio ref="audio" :src="currentSong.url" @playing="ready" @error="error"
           @timeupdate="updateTime"></audio>
  </div>
</template>

<script type="text/ecmascript-6">
  import { mapGetters, mapMutations } from 'vuex'
  import { prefixStyle } from 'common/js/dom'
  import animations from 'create-keyframe-animation'
  import ProgressBar from 'base/progress-bar/progress-bar'
  import ProgressCircle from 'base/progress-circle/progress-circle'
  import { formatTime } from 'common/js/util.js'

  const transform = prefixStyle('transform')
  //  const cdAnimeName = 'move'
  export default {
    data () {
      return {
        // 阻止快速点击切换歌曲导致的domException
        songReady: false,
        currentTime: 0,
        // 播放按钮进度条的半径
        progress_circle_radius: 32,
        // 引入工具类的方法
        formatTime: formatTime
      }
    },
    components: {
      ProgressBar,
      ProgressCircle
    },
    computed: {
      playIcon () {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      miniIcon () { // 图标字体库的样式
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      cdRotate () {
        return this.playing ? 'play' : 'play pause'
      },
      disableCls () {
        return this.songReady ? '' : 'disable'
      },
      // 播放进度
      percent () {
        return this.currentTime / this.currentSong.duration
      },
      ...mapGetters([
        'fullScreen',
        'playlist',
        'currentSong',
        'playing',
        'currentIndex'
      ])
    },
    watch: {
      currentSong () {
        const audio = this.$refs.audio
        this.$nextTick(() => {
          // dom ready之后再调用play
          // 在某个动作有可能改变DOM元素结构的时候，对DOM一系列的js操作都要放进Vue.nextTick()的回调函数中
          // 在调用播放的同时去请求src的加载url,将报DomException
          audio.play()
        })
      },
      /**
       * 监测全局状态playing的变化
       */
      playing (newPlaying) {
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      }
    },
    methods: {
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PLAYING_STATE',
        setCurrentIndex: 'SET_CURRENT_INDEX'
      }),
      back () {
        this.setFullScreen(false)
      },
      open () {
        this.setFullScreen(true)
      },
      /** effect:点击歌曲,左下角的mini播放器图片飞入中央
       * 使用create-keyframe-animation库(参见github)
       * 涉及Vue enter-afterEnter,leave-afterLeave四个方法定义
       * @param el
       * @param done 钩子函数,结束进入afterEnter
       */
      enter (el, done) {
        const {x, y, scale} = this._getPosAndScale()
        let animation = {
          // 初始值
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          // 运行到60% ,blur
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          // 运行到100% 正常位置
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }

        animations.registerAnimation({
          name: 'move', // 动画名
          animation,
          presets: {
            duration: 800, // 动画间隔400ms
            easing: 'linear'
          }
        })

        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      /**
       *清空动画
       */
      afterEnter () {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      /**
       * @param el
       * @param done 钩子函数,结束进入afterLeave
       */
      leave (el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
        const timer = setTimeout(done, 400)
        this.$refs.cdWrapper.addEventListener('transitionend', () => {
          clearTimeout(timer)
          done()
        })
      },
      afterLeave () {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style[transform] = ''
      },
      /**
       * 计算左下角图片到居中CD图片的宽高位置
       * @private
       */
      _getPosAndScale () {
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      togglePlaying () {
        if (!this.songReady) {
          return
        }
        // 对state中的全局状态取反
        this.setPlayingState(!this.playing)
      },
      prev () {
        if (!this.songReady) {
          return
        }
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
      },
      next () {
        if (!this.songReady) {
          return
        }
        let index = this.currentIndex + 1
        if (index === this.playlist.length) {
          index = 0
        }
        this.setCurrentIndex(index)
      },
      // audio标签状态控制
      ready () {
        this.songReady = true
      },
      error () {
        this.songReady = true
      },
      /*
      播放进度的时间
       */
      updateTime (e) {
        this.currentTime = e.target.currentTime
      },
      // 子组件的播放进度条变化
      onProgressBarChange (percent) {
        this.$refs.audio.currentTime = this.currentSong.duration * percent
        if (!this.playing) {
          this.togglePlaying()
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/component/player.styl"
</style>

