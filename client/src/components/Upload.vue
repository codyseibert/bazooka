<template lang="pug">
div
  panel(
    title="1. Write your Snippit"
  )
    codemirror(
      v-model="code"
      :options="options"
    )

  panel.mt-4(
    title="2. Upload your Snippit"
  )
    v-btn.mt-2(
      color="primary"
      @click="uploadSnippit"
      v-if="!uploading"
    ) Upload
      span.ml-1(
        v-if="endpoint"
       ) Another

    v-progress-circular.mt-2(
      v-if="uploading"
      indeterminate 
      v-bind:size="50" 
      color="primary"
    )

    p(
      v-if="uploading"
    ) Your function is uploading!  Be patient while we install your modules

    p(
      v-if="!uploading && endpoint"
    ) Your function has uploaded!

  panel.mt-4(
    v-if="endpoint && !uploading"
    title="3. Test your Snippit"
  )
    p.mt-2 Keep track this endpoint!  If you lose it, just upload your function again.

    v-text-field(
      name="endpoint"
      label="Endpoint"
      v-model="endpoint"
      readonly=true
    )
    
    br

    p <b>Edit</b> and <b>run</b> this curl command to test your snippit:
    pre(
      v-highlightjs="example"
    )
      code.bash
    br
    br
    p Please leave me feedback or report issues here: <a target="_blank" href="http://github.com/codyseibert/bazooka/issues">github repo</a>.<br>HAPPY CODING!

</template>

<script>
import axios from 'axios'
// import {mapState, mapMutations} from 'vuex'

export default {
  data () {
    return {
      code: `
// Note: any require call with install the node module automatically
// on the server.  The more things you require, the slower your 
// code will take to initialize on the server; therefore, choose your
// packages wisely.

// EXAMPLE CODE - REPLACE ME
const randomstring = require('randomstring');

// you MUST export a function(body, cb);
// body - the request json body passed in the post request (application/json)
// cb - the callback you MUST invoke when your code is done
//    cb(err) - there was an error return - status 500
//    cb(null, payload) - no errors occured - status 200
module.exports = function (body, cb) {
  // EXAMPLE CODE - REPLACE ME
  const output = randomstring.generate({
    length: body.length,
    charset: 'alphabetic'
  });
  cb(null, output);
}
      `,
      options: {
        tabSize: 2,
        mode: 'text/javascript',
        // theme: 'base16-dark',
        lineNumbers: true,
        line: true
      },
      endpoint: null,
      key: null,
      uploading: false
    }
  },
  computed: {
    example () {
      return `curl -L -XPOST -H "Content-type: application/json" -d '{"length": 8}' '${this.endpoint}'`
    }
  },
  methods: {
    async uploadSnippit () {
      this.uploading = true
      this.key = (await axios.post(`${process.env.API_ENDPOINT}/snippits`, {
        snippit: this.code
      })).data
      this.uploading = false
      this.endpoint = `${process.env.API_ENDPOINT}/snippits/${this.key}`
    }
  }
}
</script>

<style scoped lang="sass-loader?indentedSyntax">
p
  font-size: 16px
</style>
