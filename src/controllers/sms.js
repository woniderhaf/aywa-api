// plug-ins
const fetch = require('cross-fetch')

// models
const Sms = require('../models/Sms')

// helpers
const utils = require('../helpers/utils')

// config
const config = require('../config')

// add
exports.add = async (phone) => {
  const isbypass = config.SMS.PHONES.includes(phone)
  const code = isbypass ? config.SMS.DEFCODE : utils.code()
  try {
    await Sms.findOneAndUpdate({ phone }, { code }, { upsert: true })
    return isbypass ? 'accepted' : await send(phone, `SMS: ${code}`)
  } catch (error) {
    console.log('sms error:', error)
  }
}

// send SMS
const send = async (phone, text) => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Basic ${Buffer.from(config.SMS.LOGIN + ':' + config.SMS.PASS).toString(
        'base64'
      )}`,
    },
  }
  const response = await fetch(
    `${config.SMS.URL}?phone=${phone}&text=${encodeURIComponent(text)}`,
    options
  )
  if (response.status === 200) {
    const text = await response.text()
    console.log(text)
    return text
  }
  return null
}
