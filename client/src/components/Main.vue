<template lang="pug">
v-layout(row)
  v-flex.mr-4(xs12)
    upload

  //- v-flex(
  //-   xs8
  //-   v-if="selectedProject"
  //- )
  //-   v-layout(
  //-     column
  //-   )
  //-     info.mb-2
  //-     tasks
</template>

<script>
import Upload from '@/components/Upload.vue'

export default {
  components: {
    Upload
  }
}
</script>

<style scoped>

</style>
