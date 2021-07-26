const { Schema, model } = require('mongoose');
const { modelFields } = require('./fields');

const schema = new Schema({
  gene_id: String,
  'Log.TPM': Number,
  Percentile: Number,
  Symbol: String,
  'Model ID': { type: String, index: true },
});

schema.virtual('Model', {
  ref: 'pdc_model',
  localField: 'Model ID',
  foreignField: 'Model ID',
  options: {
    select: modelFields,
  },
});

module.exports = model('ngs_rna', schema, 'ngs_rna');
