const bcrypt = require('bcryptjs');
const { Schema, model } = require('mongoose');

const schema = new Schema({
  email: String,
  password: { type: String, set(value) { return bcrypt.hashSync(value, 8); } },
  firstName: String,
  lastName: String,
  jobTitle: String,
  companyName: String,
  confirmed: { type: Boolean, default: false },
  enabled: { type: Boolean, default: false },
  created: { type: Date, default: Date.now },
});

module.exports = model('users', schema, 'users');
