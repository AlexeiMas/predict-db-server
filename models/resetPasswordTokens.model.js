const { Schema, model } = require('mongoose');

const EXPIRES = parseInt(process.env.RESET_PASSWORD_EXPIRY_TIME || 86400);

const schema = new Schema({
  token: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  created: { type: Date, default: Date.now, expires: EXPIRES },
});

module.exports = model('reset-password-tokens', schema, 'reset-password-tokens');
