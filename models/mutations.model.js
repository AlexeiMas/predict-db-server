const { Schema, model } = require('mongoose');
const { modelFields } = require('./fields');

const schema = new Schema({
  'Gene.refGene': { type: String, index: true },
  Existing_variation: String,
  Protein_position: String,
  Amino_acids: String,
  Func_refGene: String,
  ExonicFunc_refGene: String,
  Chr: String,
  Start: Number,
  End: Number,
  Ref: String,
  Alt: String,
  Zygosity: String,
  AF: String,
  Quality: Number,
  CurrentExon: Number,
  EnsGenID: String,
  EnsTransID: String,
  cosmic68: String,
  gnomAD_genome_ALL: Number,
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
