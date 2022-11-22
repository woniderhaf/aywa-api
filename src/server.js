// config
const config = require('./config')
const bodyParser = require('body-parser')
// plug-in
const express = require('express')
const rjwt = require('restify-jwt-community')
const user = require('./routes/user')
const mat = require('./routes/mat')
const accessory = require('./routes/accessory')
const story = require('./routes/story')
// db
const mongoose = require('mongoose')

// start
const app = express()
// middleware
app.use(express.json({ limit: '50mb' }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }))
app.use('/api/user', user)
app.use('/api/mat/', mat)
app.use('/api/accessory/', accessory)
app.use('/api/story/', story)

app.listen(config.PORT, () => {
  console.log('%s listening at %s')
  mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
})

const database = mongoose.connection
database.on('error', (err) => {
  console.log(err)
})

database.once('open', () => {
  console.log(`Server running on Port: ${config.PORT}`)
})

// end
