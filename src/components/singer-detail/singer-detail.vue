<template>
  <transition name="slide">
    <!-- 传递给子组件的3个变量-->
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
  import { mapGetters } from 'vuex'
  import { ERR_OK } from 'api/config'
  import { getSingerDetail } from 'api/singer'
  import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'
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
//      console.log('singer-detail created singer:' + this.singer)
    },
    methods: {
      _getDetail () {
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        getSingerDetail(this.singer.id).then((res) => {
          if (res.code === ERR_OK) {
            processSongsUrl(this._normalizeSongs(res.data.list)).then((songs) => {
              this.songs = songs
            })
          }
        })
      },
      _normalizeSongs (list) {
        let ret = []
        list.forEach((item) => {
          let {musicData} = item
          if (isValidMusic(musicData)) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
