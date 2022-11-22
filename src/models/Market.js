// plug-ins
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

// schema
const MarketSchema = new mongoose.Schema({
  mats: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mat' }],
    default: [],
  },
  Accessories: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Accessory' }],
    default: [],
  },
})
MarketSchema.plugin(timestamp)

module.exports = mongoose.model('Mat', MarketSchema)
