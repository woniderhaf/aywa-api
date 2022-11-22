// plug-ins
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

// schema
const MatSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  rare: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    default: '',
  },
})
MatSchema.plugin(timestamp)

module.exports = mongoose.model('Mat', MatSchema)
