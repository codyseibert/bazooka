const r = ['a', 'b', 'c'][parseInt(Math.random() * 14239) % 3];
const express = require('express')
const app = express()
app.get('/', (req, res) => {
  res.send('Hello world from a Node.js app!' + r)
})
app.listen(80, () => {
  console.log('Server is up on 3000')
})