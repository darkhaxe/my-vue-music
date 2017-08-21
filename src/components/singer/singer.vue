<template>
  <div class="singer">
    <list-view @select="selectSinger" :data="singerList"></list-view>
    <router-view></router-view>
  </div>

</template>

<script type="text/ecmascript-6">
  import { getSingerList } from 'api/singer'
  import { ERR_OK } from 'api/config'
  import Singer from 'common/js/singer'
  import ListView from 'base/listview/listview'
  const HOT_NAME = '热门'
  const HOY_SINGER_LEN = 10

  export default{
    data() {
      return {
        singerList: []
      }
    },
    created() {
      this._getSingerList()
    },
    components: {ListView},
    methods: {
      selectSinger(singer) {
        this.$router.push({
          path: `singer/${singer.id}`
        })
      },
      _getSingerList() {
        getSingerList().then((res) => {
          if (res.code === ERR_OK) {
            this.singerList = this._normalizeSinger(res.data.list)
            console.log(this.singerList)
          }
        })
      },
      /**
       * 对歌手数据再封装,返回一个已排序的一维数组
       * @param list
       * @private
       */
      _normalizeSinger(list) {
        // map = {
        //  [{title:'热门',items:[]},...],
        //  [{title:'a',items:[]},{title:'b',items:[]},...]
        // }
        let map = {
          hot: {title: HOT_NAME, items: []}
        }
        list.forEach((item, index) => {
          // ------------------------------------------------ //
          if (index < HOY_SINGER_LEN) { // 封装 {热门歌手--items}
            map.hot.items.push(new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            }))
          }
          // ------------------------------------------------ //
          const key = item.Findex
          if (!map[key]) { // 封装 {A-Z--items}
            map[key] = {title: key, items: []}
          }
          map[key].items.push(new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        })
        // vue v-for可遍历对象属性,但不能保证顺序,因此需要再封装成两个数组
        let hotSinger = []
        let alphabetSinger = []
        for (let key in map) {
          let item = map[key]
          if (item.title.match(/[a-zA-Z]/)) {
            alphabetSinger.push(item)
          } else if (item.title === HOT_NAME) {
            hotSinger.push(item)
          }
        }
        alphabetSinger.sort((a, b) => { // 排序,从a-z
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hotSinger.concat(alphabetSinger) // 拼接成完整的一维数组
      }

    }

  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 88px
    bottom: 0
    width: 100%
</style>
