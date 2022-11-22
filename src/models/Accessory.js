// plug-ins
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

// schema
const AccessorySchema = new mongoose.Schema({
  number: {
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
AccessorySchema.plugin(timestamp)

module.exports = mongoose.model('Accessory', AccessorySchema)
