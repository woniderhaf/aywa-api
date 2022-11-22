// plug-ins
const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');

// schema
const SmsSchema = new mongoose.Schema({
	phone: {
		type: String,
		required: true,
		trim: true
	},
	code: {
		type: String,
		required: true,
		trim: true
	}
});
SmsSchema.plugin(timestamp);

module.exports = mongoose.model('Sms', SmsSchema);