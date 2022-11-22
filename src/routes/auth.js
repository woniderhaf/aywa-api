// plug-ins
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

// model
const User = mongoose.model('User')

// start
exports.authenticate = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      // try to fetch user
      const user = await User.findOne({ email })
      // match User phone with password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err
        if (isMatch) {
          resolve(user)
        } else {
          // password did not match
          reject('Failed to authenicate user')
        }
      })
    } catch (err) {
      // can't find user phone
      reject('Sorry, Authentication failed')
    }
  })
}
