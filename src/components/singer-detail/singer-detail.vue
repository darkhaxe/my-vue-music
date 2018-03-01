<template>
  <transition name="slide">
    <!-- 传递给子组件的3个变量-->
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import { ERR_OK } from 'api/config'
  import { mapGetters } from 'vuex'
  import { getSingerDetail } from 'api/singer'
  import { createSong } from 'common/js/song'
  import MusicList from 'components/music-list/music-list'

  export default {
    components: {
      MusicList
    },
    data () {
      return {
        songs: []
      }
    },
    computed: {
      ...mapGetters([
        'singer'
      ]),
      // title与bgImage传入子组件使用
      title () {
        return this.singer.name
      },
      bgImage () {
        return this.singer.avatar
      }
    },
    created () {
      this._getDetail()
    },
    methods: {
      _getDetail () {
        // 优化体验:假如用户在割手详情页刷新,导致获取不到store中的singer,则将页面切换到歌手列表
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.data.list)
          }
        })
      },
      _normalizeSongs (list) {
        let ret = []
        list.forEach((item) => {
          let {musicData} = item
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        console.log('singer-detail _normalizeSongs songs:' + ret)
        return ret
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  /*
   6-4~6-7 需要加上这一段 stylus特效对应写死的div,当引入music-list组件后再注释
   .singer-detail
     position: fixed
     z-index: 100
     top: 0
     left: 0
     right: 0
     bottom: 0
     background: $color-background
 */
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
