const Mat = require('../models/Mat')
const express = require('express')
const responses = require('../helpers/responses')
const User = require('../models/User')
const router = express.Router()
const sanitize = require('../helpers/sanitize')
//default url api/mat/

// create mat
router.post('/create', async (req, res, next) => {
  try {
    const { mat } = req.body
    const newMat = new Mat(mat)
    const response = await newMat.save()
    res.send(response)
    next()
  } catch (error) {
    console.log(error)
    res.send(responses.badrequest)
    next()
  }
})

// add mats
router.get('/add', async (req, res, next) => {
  try {
    const mats = await Mat.find()
    res.send(mats)
    next()
  } catch (error) {
    console.log(error)
    res.send(responses.badrequest)
    next()
  }
})
router.post('/buy', async (req, res, next) => {
  try {
    const { id, data } = req.body
    const user = await User.findById(id)
    if (user) {
      const balance = user.balance
      if (balance >= data.cost) {
        const remains = balance - data.cost
        const userUpdate = await User.findByIdAndUpdate(
          id,
          { $push: { NFT: data }, balance: remains },
          { returnDocument: 'after' }
        )
        res.send(sanitize.user(userUpdate))
        next()
      }
    } else {
      throw Error()
    }
  } catch (error) {
    res.send(responses.notFound)
    next()
  }
})
module.exports = router
