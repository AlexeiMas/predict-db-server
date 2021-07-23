const { Schema, model } = require('mongoose');

const schema = new Schema({
  'Input type': String,
  Options: Array,
});

module.exports = model('ptx-wa-input', schema, 'ptx-wa-input');
