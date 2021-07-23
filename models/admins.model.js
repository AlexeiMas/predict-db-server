const { Schema, model } = require('mongoose');

const schema = new Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
});

module.exports = model('admins', schema, 'admins');
