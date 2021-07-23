const { Schema, model } = require('mongoose');

const schema = new Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  jobTitle: String,
  companyName: String,
  confirmed: { type: Boolean, default: false },
  enabled: { type: Boolean, default: false },
  created: { type: Date, default: Date.now },
});

module.exports = model('users', schema, 'users');
