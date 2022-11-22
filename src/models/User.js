// plug-ins
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

// schema
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true,
    default: '',
  },
  lastName: {
    type: String,
    trim: true,
    default: '',
  },
  nickname: {
    type: String,
    trim: true,
    default: '',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  image: {
    type: String,
    default: '',
    trim: true,
  },
  email: {
    type: String,
    default: null,
    trim: true,
  },
  password: {
    type: String,
  },
  balance: {
    type: Number,
    default: 0,
  },
  NFT: {
    type: Array, // массив ковриков и аксессуаров
    default: [],
  },
  level: {
    type: Number,
    default: 1,
  },
  transactions: {
    type: Array,
    default: [],
  },
  invited: {
    type: Number,
    default: 0,
  },
  progress: {
    type: Number,
    default: 0,
  },
  energy: {
    type: Number,
    default: 0,
  },
})
UserSchema.plugin(timestamp)

module.exports = mongoose.model('User', UserSchema)
