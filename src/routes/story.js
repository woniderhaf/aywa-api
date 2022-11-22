const express = require('express')
const responses = require('../helpers/responses')
const router = express.Router()
const Story = require('../models/Story')
router.post('/create', async (req, res, next) => {
  try {
    const { themeStory, storyImage, stories } = req.body

    const story = new Story({
      themeStory,
      storyImage,
      stories,
      seen: false,
    })
    const response = await story.save()
    res.send(response)
  } catch (error) {
    console.log(error)
    res.send(responses.notFound)
  }
})
router.put('/view', async (req, res, next) => {
  try {
    const { story } = req.body
    const stories = await Story.findOneAndUpdate(
      { _id: story._id },
      { seen: true },
      { returnDocument: 'after' }
    )
    res.send(stories)
    next()
  } catch (error) {
    res.send(responses.notFound)
    next()
  }
})
router.get('/get', async (req, res, next) => {
  try {
    const stories = await Story.find()
    res.send(stories)
    next()
  } catch (error) {
    res.send(responses.notFound)
    next()
  }
})

module.exports = router
