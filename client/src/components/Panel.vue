<template lang="pug">
.white.elevation-2
  v-toolbar.green(
    flat
    dense
    dark
  )
    v-toolbar-title {{title}}
    slot(name="action")

  .pl-4.pr-4.pt-2.pb-2
    slot No slot content defined.
</template>

<script>
export default {
  props: [
    'title'
  ]
}
</script>

<style scoped>
</style>
