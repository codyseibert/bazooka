<template lang="pug">
v-toolbar.elevation-1.header.white(
  app
  fixed
  light
)
  v-toolbar-title.mr-4 BAZOOKA.IO

  v-toolbar-items
    v-btn(
      flat
      dark
      to="/"
    )
      v-icon code

  v-spacer

  v-toolbar-items
    //- v-btn(
    //-   flat
    //-   dark
    //- )
    //-   v-icon fa-youtube-play
    v-btn(
      flat
      dark
      href="https://github.com/codyseibert/bazooka"
      target="_blank"
    )
      v-icon fa-github
    //- v-btn(
    //-   flat
    //-   dark
    //-   to="/about"
    //- )
    //-   v-icon info
</template>

<script>
export default {
}
</script>

<style scoped>
.header {
  z-index: 100;
}
</style>
