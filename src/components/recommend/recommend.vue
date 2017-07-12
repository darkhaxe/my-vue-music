<template>
  <div class="recommend">
    <!-- !!当歌单数据获取到的时候触发scroll.vue的watch事件,调用better-scroll的refresh方法
    注意:4-11章节--绑定discList是假设recommend接口比discList接口更快返回数据,此时recommend Div
     已经撑开,高度已经获得,假如该接口慢的话,betterScroll获得的高度就不包含recommend轮播图的高度
     解决这个问题,监听轮播图的Img来实现,当轮播图的图片的onload,调用bS的refresh(),最终保证betterScroll
     获得的高度是完整的-->
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div><!-- 此div包裹使得滚动时候上下两个div为一个整体-->
        <!-- 添加v-if 保证异步获取后端数据完成,才开始渲染slider,否则组件slider中的渲染会失败 -->
        <div v-if="recommends.length" class="slider-wrapper">
          <div class="slider-content">
            <slider><!-- 轮播图-->
              <div v-for="item in recommends">
                <a :href="item.linkUrl">
                  <!-- fastclick不拦截class=needsclick的标签的点击事件-->
                  <img class="needsclick" @load="loadImg" :src="item.picUrl"/>
                </a>
              </div>
            </slider>
          </div>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="item in discList" class="item">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl"/>
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <h2 class="desc" v-html="item.dissname"></h2>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
  // 获取轮播图数据
  import { getRecommend, getDiscList } from 'api/recommend'
  import { ERR_OK } from 'api/config'
  import Slider from 'base/slider/slider'
  import Scroll from 'base/scroll/scroll'
  import Loading from 'base/loading/loading'
  export default {
    data() {
      return {
        recommends: [], // 应用于当前dom的轮播图列表数据,vue生命周期created完成赋值
        discList: []
      }
    },
    created() {
      this._getRecommend()
      this._getDiscList()
    },
    methods: {
      _getRecommend() {
        getRecommend().then((res) => {
          if (res.code === ERR_OK) {
//            console.log(res.data.slider)
            this.recommends = res.data.slider
          }
        })
      },
      _getDiscList() {
        getDiscList().then((res) => {
          if (res.code === ERR_OK) {
            this.discList = res.data.list
          }
        })
      },
      loadImg() { // 监听加载轮播图图片事件
        if (!this.sliderPicLoading) { // 优化:只执行1次refresh
          this.$refs.scroll.refresh()
          this.sliderPicLoading = true
        }
      }
    },
    components: {
      Slider,
      Scroll,
      Loading
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        height: 0
        padding-top: 40%
        overflow: hidden
        .slider-content
          position: absolute
          top: 0
          left: 0
          width: 100%
          height: 100%
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
