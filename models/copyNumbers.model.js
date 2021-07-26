const { Schema, model } = require('mongoose');
const { modelFields } = require('./fields');

const schema = new Schema({
  'AnnotSV ID': String,
  'SV chrom': Number,
  'SV start': Number,
  'SV end': Number,
  'SV length': Number,
  'SV type': String,
  log2FC: Number,
  Qscore: Number,
  ObservedDepth: Number,
  ExpectedDepth: Number,
  Zscore: Number,
  HetVar: Number,
  IsCNV: Boolean,
  Length: Number,
  IsLOH_Only: Boolean,
  'Annotation mode': String,
  Gene_name: String,
  Tx: String,
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

module.exports = model('ngs_cnv', schema, 'ngs_cnv');
