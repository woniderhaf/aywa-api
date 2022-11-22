const path = require('path')
const { fileURLToPath, URL } = require('url')
// plug-ins
const jwt = require('jsonwebtoken')
const express = require('express')

//models
const User = require('../models/User')
const Sms = require('../models/Sms')
//controllers
const auth = require('./auth')
const sms = require('../controllers/sms')
// helpers
const responses = require('../helpers/responses')
const sanitize = require('../helpers/sanitize')
const utils = require('../helpers/utils')
const bcrypt = require('bcryptjs')

// config
const config = require('../config')
const { main } = require('../controllers/email')

const router = express.Router()
// base url: localhost:8080/api/user

// register a user. prepare
router.post('/register/prepare', async (req, res, next) => {
  const { email } = req.body
  const existUser = await User.findOne({ email })
  if (existUser) {
    res.send(responses.exist)
    next()
  } else res.send(responses.ok)
})

// register a user
router.post('/register', async (req, res, next) => {
  const { password, email, firstName, lastName } = req.body
  // const { email } = req.body
  const user = new User({
    firstName,
    lastName,
    password,
    email,
  })
  const existUser = await User.findOne({ email })
  if (existUser) {
    res.send(responses.exist)
    next()
  } else {
    utils.password(user.password, async (hash) => {
      user.password = hash
      try {
        const newUser = await user.save()
        // временно закоментил чтобы не тратить ресурсы смсок
        // const ret = await sms.add(phone)
        // if (ret === null || ret.indexOf('error') !== -1) {
        //   res.send(responses.badrequest)
        //   return next()
        // }

        res.send(newUser)
        next()
      } catch (err) {
        console.log(err)
        res.send(responses.internalError)
        next()
      }
    })
  }
})

// authenticate a user
router.post('/auth', async (req, res, next) => {
  const { email, password } = req.body
  try {
    const user = await auth.authenticate(email, password)
    const token = jwt.sign(user.toJSON(), config.JWT.SECRET, { expiresIn: config.JWT.TTL })
    const { iat, exp } = jwt.decode(token)
    res.send({ iat, exp, token, user: sanitize.user(user) })
    next()
  } catch (error) {
    res.send(responses.unauthorized)
    next()
  }
})

// get a single user by id or phone
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id
    let user = null
    if (utils.isObjectId(id)) {
      user = await User.findById(id)
    } else {
      user = await User.findOne({ phone: id })
      if (!user) throw true
    }
    res.send(sanitize.user(user))
    next()
  } catch (error) {
    res.send(responses.notFound)
    next()
  }
})

// update a user
router.put('/:id', async (req, res, next) => {
  const { firstName, lastName, phone, email, nickname, image } = req.body
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { firstName, lastName, phone, email, nickname, image }
    )
    res.send(sanitize.user(user))
    next()
  } catch (error) {
    res.send(responses.notFound)
    next()
  }
})
router.post('/nickname/prepare', async (req, res, next) => {
  try {
    const { nickname } = req.body
    const existNickname = await User.findOne({ nickname })

    const response = existNickname ? responses.exist : responses.ok
    console.log(response)
    res.send(response)
    next()
  } catch (error) {
    res.send(responses.exist)
    next()
  }
})

// activate a user
router.post(':id/activate', async (req, res, next) => {
  try {
    const code = req.body.code,
      id = req.params.id
    const user = await User.findById(id)
    if (!user) {
      res.send(responses.notFound)
      return next()
    }
    const sms = await Sms.findOne({ code, phone: user.phone })
    if (!sms) {
      res.send(responses.notFound)
      return next()
    }
    await User.findOneAndUpdate({ _id: id }, { isActive: true })
    await Sms.deleteOne({ _id: sms._id })
    res.send()
    next()
  } catch (error) {
    res.send(responses.notFound)
    next()
  }
})

// restore a user password. prepare
router.post('/:phone/restore', async (req, res, next) => {
  try {
    console.log('restore phone')
    const phone = req.params.phone
    const user = await User.findOne({ phone })
    if (!user) {
      console.log('not user')
      res.send(responses.notFound)
      return next()
    }
    sms.add(phone)
    res.send({ id: user._id })
    next()
  } catch (error) {
    console.log({ error })
    res.send(responses.notFound)
    next()
  }
})

// restore a user password. check sms code
router.post('/:phone/restore/check', async (req, res, next) => {
  try {
    const code = req.body.code,
      phone = req.params.phone
    console.log(code)

    const user = await User.findOne({ phone })
    if (!user) {
      res.send(responses.notFound)
      return next()
    }
    const sms = await Sms.findOne({ code, phone })
    if (!sms) {
      res.send(responses.notFound)
      return next()
    }
    await Sms.deleteOne({ _id: sms._id })
    const token = jwt.sign(user.toJSON(), config.JWT.SECRET, { expiresIn: config.JWT.TTL })
    const { iat, exp } = jwt.decode(token)
    res.send({ iat, exp, token })
    next()
  } catch (error) {
    res.send(responses.notFound)
    next()
  }
})
// code for buy NFT
router.post('/:phone/check', async (req, res, next) => {
  try {
    const code = req.body.code,
      phone = req.params.phone

    const user = await User.findOne({ phone })
    if (!user) {
      res.send(responses.notFound)
      return next()
    }
    const sms = await Sms.findOne({ code, phone })
    if (!sms) {
      res.send(responses.notFound)
      return next()
    }
    // await Sms.deleteOne({ _id: sms._id })
    res.send(responses.ok)
    next()
  } catch (error) {
    res.send(responses.notFound)
    next()
  }
})

router.post('/:id/changepassword/prepare', async (req, res, next) => {
  try {
    const { password } = req.body
    const _id = req.params.id
    const user = await User.findById({ _id })

    if (user) {
      bcrypt.compare(password, user.password, (err, response) => {
        if (err) {
          res.send(responses.notFound)
          next()
        }
        if (response) {
          res.send(responses.ok)
          next()
        } else {
          res.send(responses.exist)
          next()
        }
      })
    }
  } catch (error) {
    res.send(responses.notFound)
    next()
  }
})

// restore a user password. change password
router.put('/:id/restore/changepassword', async (req, res, next) => {
  try {
    utils.password(req.body.password, async (hash) => {
      const user = await User.findOneAndUpdate({ _id: req.params.id }, { password: hash })
      res.send({ user })
      next()
    })
  } catch (error) {
    res.send(responses.notFound)
    next()
  }
})

router.post('/email/sms', async (req, res, next) => {
  try {
    await main()
    res.send({ code: 0 })
  } catch (error) {}
})

module.exports = router
