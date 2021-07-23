const { Schema, model } = require('mongoose');
const { modelFields } = require('./fields');

const schema = new Schema({
  Treatment: String,
  'Response Percentile': Number, // TODO: Field type was changed (String -> Number)
  'Phenotypic Response Type': String,
  'Treatment Type': String,
  'Model ID': String,
});

schema.virtual('Model', {
  ref: 'ptx-model',
  localField: 'Model ID',
  foreignField: 'Model ID',
  options: {
    select: modelFields,
  },
});

module.exports = model('ptx-treatment-response', schema, 'ptx-treatment-response');
