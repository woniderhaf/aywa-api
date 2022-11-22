const path = require('path')
const { fileURLToPath, URL } = require('url')
// plug-ins
const jwt = require('jsonwebtoken')

// controllers
const sms = require('../controllers/sms')

// models
const User = require('../models/User')
const Sms = require('../models/Sms')
// const Contacts = require('../models/Contacts')
// helpers
const responses = require('../helpers/responses')
const sanitize = require('../helpers/sanitize')
const utils = require('../helpers/utils')

// routes
const auth = require('./auth')

// config
const config = require('../config')

// start
module.exports = (server) => {
  server.get('/api/v1/sms', async (req, res, next) => {
    const sms = await Sms.find()
    return res.send(sms)
  })
  // search
  server.post('/api/v1/search', async (req, res, next) => {
    const { search, type } = req.body
    let condition
    switch (type) {
      case 'people':
        condition = {
          $or: [
            { company: { $regex: search, $options: 'i' } },
            { name: { $regex: search, $options: 'i' } },
            { position: { $regex: search, $options: 'i' } },
            { tags: { $regex: search, $options: 'i' } },
          ],
        }

        break
      case 'company':
        condition = {
          company: { $regex: search, $options: 'i' },
        }
        break
      case 'positions':
        condition = {
          position: { $regex: search, $options: 'i' },
        }
        break
      case 'tags':
        condition = {
          tags: { $regex: search, $options: 'i' },
        }
        break
      default:
        condition = {
          name: { $regex: search, $options: 'i' },
        }
    }
    // const users = await Contacts.find(condition)
    res.send(users)
    next()
  })

  // register a user. prepare
  server.post('/api/v1/user/register/prepare', async (req, res, next) => {
    const { name, phone, password, email } = req.body
    const user = new User({
      name,
      phone,
      password,
      email,
    })
    const existUser = await User.findOne({ phone: user.phone })
    if (existUser && existUser.isActive) {
      res.send(responses.exist)
      next()
    } else res.send()
  })

  // register a user
  server.post('/api/v1/user/register', async (req, res, next) => {
    const { name, phone, password, email, company, position, isActive } = req.body
    const user = new User({
      name,
      phone,
      password,
      email,
      company,
      position,
      isActive,
    })
    const existUser = await User.findOne({ phone })
    if (existUser && existUser.isActive) {
      res.send(responses.exist)
      next()
    } else {
      utils.password(user.password, async (hash) => {
        user.password = hash
        try {
          if (existUser) await User.deleteOne({ _id: existUser._id })
          const newUser = await user.save()
          const ret = await sms.add(phone)
          if (ret === null || ret.indexOf('error') !== -1) {
            res.send(responses.badrequest)
            return next()
          }
          res.send(sanitize.user(newUser))
          next()
        } catch (err) {
          res.send(responses.internalError)
          next()
        }
      })
    }
  })

  // get user all
  server.get('/api/v1/user/all', async (req, res, next) => {
    const users = await User.find()
    res.send(users)
    next()
  })

  // authenticate a user
  server.post('/api/v1/auth', async (req, res, next) => {
    const { phone, password } = req.body
    try {
      const user = await auth.authenticate(phone, password)
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
  server.get('/api/v1/user/:id', async (req, res, next) => {
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
  server.put('/api/v1/user/:id', async (req, res, next) => {
    try {
      const user = await User.findOneAndUpdate({ _id: req.params.id }, req.body, {
        returnDocument: 'after',
      })
      res.send(sanitize.user(user))
      next()
    } catch (error) {
      res.send(responses.notFound)
      next()
    }
  })

  // activate a user
  server.post('/api/v1/user/:id/activate', async (req, res, next) => {
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
  server.post('/api/v1/user/:phone/restore', async (req, res, next) => {
    try {
      const phone = req.params.phone
      const user = await User.findOne({ phone })
      if (!user || !user.isActive) {
        res.send(responses.notFound)
        return next()
      }
      sms.add(phone)
      res.send({ id: user._id })
      next()
    } catch (error) {
      res.send(responses.notFound)
      next()
    }
  })

  // restore a user password. check sms code
  server.post('/api/v1/user/:phone/restore/check', async (req, res, next) => {
    try {
      const code = req.body.code,
        phone = req.params.phone
      const user = await User.findOne({ phone })
      if (!user || !user.isActive) {
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

  // restore a user password. change password
  server.put('/api/v1/user/:id/restore/changepassword', async (req, res, next) => {
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
  //createContact
  // server.post('/api/v1/user/:id/contacts', async (req, res, next) => {
  //   try {
  //     const { id } = req.params
  //     const { contact: newContact, isContact } = req.body
  //     const userContacts = await UserContacts.findOne({ userId: id })
  //     const user = await User.findById({ _id: id })
  //     if (userContacts) {
  //       const isNewContact = userContacts.contacts.find(
  //         (contact) => contact.phone == newContact.phone
  //       )
  //       if (!isNewContact) {
  //         const { contacts } = await UserContacts.findOneAndUpdate(
  //           { userId: id },
  //           {
  //             contacts: [newContact, ...userContacts.contacts],
  //           },
  //           { returnDocument: 'after' }
  //         )
  //         res.send({ user, contacts })
  //       } else {
  //         res.send(responses.notFound)
  //       }
  //     } else {
  //       const contacts = new UserContacts({
  //         userId: id,
  //         contacts: [newContact],
  //       })

  //       const newcontacts = await contacts.save()
  //       res.send({ newcontacts })
  //     }
  //     //createContact in contacts
  //     if (!isContact) {
  //       const createContact = new Contacts({
  //         contactOwner: {
  //           userId: id,
  //           name: user.name,
  //           image: user.img,
  //         },
  //         ...newContact,
  //       })
  //       await createContact.save()
  //     } else {
  //       await User.findByIdAndUpdate(
  //         { _id: newContact.contactOwner.userId },
  //         { $pull: { reqContacts: { phone: newContact.phone } } },
  //         { returnDocument: 'after' }
  //       )
  //       const resRequest = {
  //         result: true,
  //         name: newContact.name,
  //         givenName: newContact.givenName,
  //         familyName: newContact.familyName,
  //         phone: newContact.phone,
  //       }
  //       await User.findByIdAndUpdate(
  //         { _id: id },
  //         { $push: { resRequests: resRequest } },
  //         { returnDocument: 'after' }
  //       )
  //     }
  //     next()
  //     //catch
  //   } catch (error) {
  //     console.log(error)
  //     res.send(responses.notFound)
  //     next()
  //   }
  // })
  // server.get('/api/v1/user/:id/contacts', async (req, res, next) => {
  //   try {
  //     const { id } = req.params
  //     const response = await UserContacts.findOne({ userId: id })
  //     res.send(response?.contacts || [])
  //     next()
  //   } catch (error) {
  //     console.log('error', error)
  //     res.send(responses.notFound)
  //     next()
  //   }
  // })

  //reqContacts
  // server.post('/api/v1/user/:id/contacts/request', async (req, res, next) => {
  //   try {
  //     const { id } = req.params
  //     const { contact } = req.body
  //     const response = await User.findOneAndUpdate({ _id: id }, { $push: { reqContacts: contact } })
  //     res.send(response)
  //   } catch (error) {
  //     console.log('error', error)
  //     res.send(responses.notFound)
  //     next()
  //   }
  // })
  // server.put('/api/v1/user/:id/contacts/request', async (req, res, next) => {
  //   try {
  //     const { id } = req.params
  //     const { contact } = req.body
  //     await User.findOneAndUpdate(
  //       { _id: id },
  //       { $pull: { reqContacts: { phone: contact.phone } } },
  //       { returnDocument: 'after' }
  //     )
  //     await User.findByIdAndUpdate({ _id: contact.idUserReq }, { $push: { resRequests: contact } })
  //     res.send()
  //     next()
  //   } catch (error) {
  //     console.log('error', error)
  //     res.send(responses.notFound)
  //     next()
  //   }
  // })

  // server.put('/api/v1/user/:id/contacts', async (req, res, next) => {
  //   try {
  //     const { id } = req.params
  //     const { phone } = req.body
  //     await User.findOneAndUpdate(
  //       { _id: id },
  //       { $pull: { resRequests: { phone } } },
  //       { returnDocument: 'after' }
  //     )
  //     res.send()
  //     next()
  //   } catch (error) {
  //     console.log('error', error)
  //     res.send(responses.notFound)
  //     next()
  //   }
  // })
}
