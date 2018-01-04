<template lang="pug">
v-layout(row)
  v-flex(xs12)
    .wrapper
      h2 About

      p(
        v-html="info"
      )
</template>

<script>

export default {
  data () {
    return {
      info: `
        Welcome to the vue-todo application!
        <br><br>
        This application was created as part of a
        vue.js tutorial where we build an application from the ground up.  I wanted to create a simple
        application, and a todo list application is typically the "go to" for a beginners level tutorial.  We don't
        use a backend in this application; instead, we use localstorage to keep track of projects and tasks.  This allows
        us to keep this tutorial focused on only the front end.
        <br><br>
        Vue-Todo also utilizes a couple of popular vue modules, some including:
        <br>
        <br>
        <ul>
          <li>vuetify</li>
          <li>vuex</li>
          <li>vuex-persistedstate</li>
          <li>vue-router</li>
          <li>vuedraggable</li>
        </ul>
        <br>
        In the header of this application, you can find external links to both the full video
        tutorial hosted on YouTube and the code repository hosted on Github.  Feel free to give
        feedback on the tutorial video and contribute to the project on Github if you want to see
        add on to this application.
        <br><br>
        If you watched the tutorial or read through the code, I really hope it has helped you learn more about using
        vue.js; otherwise, I hope you enjoy using this simple little todo application.
        <br><br>
        Feel free to send me a tweet <a href="https://twitter.com/CodyLSeibert" target="_blank">@CodyLSeibert</a> with questions or feedback.
      `
    }
  }
}
</script>

<style scoped lang="sass-loader?indentedSyntax">
.wrapper
  max-width: 800px
  margin: 0 auto
  font-size: 20px
</style>
