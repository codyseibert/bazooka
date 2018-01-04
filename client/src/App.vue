<template lang="pug">
#app
  v-app
    page-header

    main
      v-content
        v-container(fluid)
          router-view
      v-footer(app)
</template>

<script>
import PageHeader from '@/components/Header.vue'

export default {
  name: 'app',
  components: {
    PageHeader
  }
}
</script>

<style>
</style>
