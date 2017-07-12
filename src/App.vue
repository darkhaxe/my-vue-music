<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <keep-alive><!-- 缓存,避免每次切换都重新走一遍生命周期-->
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script type="text/ecmascript-6">
  import MHeader from 'components/m-header/m-header.vue'
  import Tab from 'components/tab/tab.vue'
  export default {
    components: {
      MHeader,
      Tab
    }
  }
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
</style>
