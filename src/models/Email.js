// plug-ins
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

// schema
const EmailSchema = new mongoose.Schema({
  Email: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    trim: true,
  },
})
EmailSchema.plugin(timestamp)

module.exports = mongoose.model('Email', EmailSchema)
