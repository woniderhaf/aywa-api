const Accessory = require('../models/Accessory')
const express = require('express')
const responses = require('../helpers/responses')
const router = express.Router()

//default url api/mat/

// create
router.post('/create', async (req, res, next) => {
  try {
    const { accessory } = req.body
    const newAccessory = new Accessory(accessory)
    const response = await newAccessory.save()
    res.send(response)
    next()
  } catch (error) {
    console.log(error)
    res.send(responses.badrequest)
    next()
  }
})

// add
router.get('/add', async (req, res, next) => {
  try {
    const accessory = await Accessory.find()
    res.send(accessory)
    next()
  } catch (error) {
    console.log(error)
    res.send(responses.badrequest)
    next()
  }
})
module.exports = router
