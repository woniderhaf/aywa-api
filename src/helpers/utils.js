// plug-ins
const bcrypt = require('bcryptjs')

// start
const isObjectId = (id) => /^[a-f\d]{24}$/i.test(id)

const code = (len = 4) => {
  let digits = '0123456789',
    code = ''
  for (let i = 0; i < len; i++) code += digits.charAt(Math.floor(Math.random() * digits.length))
  return code
}

const password = (password, callback) =>
  bcrypt.genSalt(10, (err, salt) =>
    bcrypt.hash(password, salt, async (err, hash) => callback(hash))
  )

module.exports = {
  isObjectId,
  code,
  password,
}
