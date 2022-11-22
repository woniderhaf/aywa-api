// plug-ins
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

// schema
const LevelSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true,
  },
  medetations: {
    type: Array,
    default: [],
    required: true,
  },
})
LevelSchema.plugin(timestamp)

module.exports = mongoose.model('Mat', LevelSchema)
