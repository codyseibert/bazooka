<template lang="pug">
panel(
  :title="selectedProject.title"
  v-if="selectedProject"
)
  v-dialog(
    v-model="dialog"
  )
    v-card
      v-card-title
        h6 Edit Project Title
      v-card-text
        v-text-field(
          label="Title"
          v-model="title"
          autofocus
          v-on:keydown.enter="updateProjectTitleLocal"
        )
        v-btn.text-xs-center(
          color="primary"
          @click="updateProjectTitleLocal"
        ) Save

  v-speed-dial(
    slot="action"
    v-model='fab'
    direction='left'
    light
    absolute
    right
    medium
  )
    v-btn(
      slot='activator'
      color='white'
      light
      fab
      v-model='fab'
    )
      v-icon more_vert
      v-icon close
    v-btn(fab
      dark
      small
      color='red'
      @click="deleteProject"
    )
      v-icon delete
    v-btn(fab
      light
      small
      color='yellow'
      @click="openEditDialog"
    )
      v-icon edit

  v-layout(column)
    v-flex.pt-3(
      xs12
    )
      h6 {{getTotalCompleted}} / {{selectedProject.tasks.length}} Completed
      v-progress-linear(
        v-model="percentCompleted"
        buffer
        v-bind:buffer-value="100"
      )
</template>

<script>
import {mapState, mapMutations} from 'vuex'

export default {
  data () {
    return {
      fab: false,
      dialog: false,
      title: ''
    }
  },
  computed: {
    ...mapState('projects', [
      'selectedProject'
    ]),
    getTotalCompleted () {
      return this.selectedProject.tasks.reduce(
        (sum, task) => sum + (task.completed ? 1 : 0)
        , 0
      )
    },
    percentCompleted () {
      return this.selectedProject.tasks.reduce(
        (sum, task) => sum + (task.completed ? 1 : 0)
        , 0
      ) / this.selectedProject.tasks.length * 100
    }
  },
  methods: {
    ...mapMutations('projects', [
      'deleteProject',
      'updateProjectTitle'
    ]),
    openEditDialog () {
      this.dialog = true
      this.title = this.selectedProject.title
    },
    updateProjectTitleLocal () {
      this.updateProjectTitle(this.title)
      this.dialog = false
    }
  }
}
</script>

<style scoped lang="sass-loader?indentedSyntax">
.no-pad-top
  padding-top: 0px

.speed-dial
  margin-right: 0px !important
</style>
