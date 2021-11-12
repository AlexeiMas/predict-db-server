const { Schema, model } = require('mongoose');
const { modelFields } = require('./fields');

const schema = new Schema({
  SYMBOL: { type: String, index: true },
  AAChange: String,
  Existing_variation: String,
  Amino_acids: String,
  AlleleFrequency: Number,
  EXON: String,
  EnsGenID: String,
  Feature: String,
  CLIN_SIG: String,
  VARIANT_CLASS: String,
  GenomicPosition: String,
  Consequence: String,
  IMPACT: String,
  Depth: Number,
  BIOTYPE: String,
  Codons: String,
  Population_Max: Number,
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

module.exports = model('ngs_dna', schema, 'ngs_dna');
