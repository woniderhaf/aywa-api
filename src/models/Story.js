// plug-ins
const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')
// schema
const StorySchema = new mongoose.Schema({
  storyImage: {
    type: String,
    required: true,
    trim: true,
  },
  stories: {
    type: Array,
    default: [],
  },
  themeStory: {
    type: String,
    default: '',
    trim: true,
  },
  seen: {
    type: Boolean,
    default: false,
  },
})
StorySchema.plugin(timestamp)

module.exports = mongoose.model('Story', StorySchema)
