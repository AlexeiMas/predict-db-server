const { Schema, model } = require('mongoose');

const schema = new Schema({
  Treatment: String,
  Type: String,
  Indications: [String],
  'drugbank url': String,
});

module.exports = model('ptx-treatment-info', schema, 'ptx-treatment-info');
