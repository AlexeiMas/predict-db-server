const bcrypt = require('bcryptjs');
const { Schema, model } = require('mongoose');

const schema = new Schema({
  email: String,
  password: { type: String, set(value) { return bcrypt.hashSync(value, 8); } },
  firstName: String,
  lastName: String,
});

module.exports = model('admins', schema, 'admins');
