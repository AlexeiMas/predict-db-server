const { Schema, model } = require('mongoose');
const { modelFields } = require('./fields');

const schema = new Schema({
  'Gene_1_symbol(5end_fusion_partner)': String,
  'Gene_2_symbol(3end_fusion_partner)': String,
  Fusion_description: String,
  Predicted_effect: String,
  Fusion_sequence: String,
  'Model ID': { type: String, index: true },
});

schema.virtual('Model', {
  ref: 'ptx-model',
  localField: 'Model ID',
  foreignField: 'Model ID',
  options: {
    select: modelFields,
  },
});

module.exports = model('ngs_fusions', schema, 'ngs_fusions');
