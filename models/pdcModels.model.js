const { Schema, model } = require('mongoose');
const {
  clinicalDataFields,
  mutationsFields,
  expressionsFields,
  fusionsFields,
  treatmentResponsesFields,
  copyNumbersFields,
} = require('./fields');

const schema = new Schema({
  'Model Status': String,
  'Growth Characteristics': String,
  '3D Model Status': String,
  'Patient Sequential Models': String,
  'Confirmed Protein Expression': String,
  NGS: String,
  'Tumour Mutation Burden Status': String,
  'Microsatelite Status': String,
  'Has Patient Treatment History': Boolean,
  'Has NGS Data': Boolean,
  'Has Growth Characteristics': Boolean,
  'Has Plasma': Boolean,
  'Has PBMC': Boolean,
  'PredictRx Case ID': String,
  'Model ID': { type: String, index: true },
  hla: {
    alleles: [String],
  },
});

schema.virtual('ClinicalData', {
  ref: 'prx-case',
  localField: 'Model ID',
  foreignField: 'PDC Model',
  justOne: true,
  options: {
    select: clinicalDataFields,
  },
});

schema.virtual('Mutations', {
  ref: 'ngs_dna',
  localField: 'Model ID',
  foreignField: 'Model ID',
  options: {
    select: mutationsFields,
  },
});

schema.virtual('Expressions', {
  ref: 'ngs_rna',
  localField: 'Model ID',
  foreignField: 'Model ID',
  options: {
    select: expressionsFields,
  },
});

schema.virtual('TreatmentResponses', {
  ref: 'ptx-treatment-response',
  localField: 'Model ID',
  foreignField: 'Model ID',
  options: {
    select: treatmentResponsesFields,
  },
});

schema.virtual('Fusions', {
  ref: 'ngs_fusions',
  localField: 'Model ID',
  foreignField: 'Model ID',
  options: {
    select: fusionsFields,
  },
});

schema.virtual('CopyNumbers', {
  ref: 'ngs_cnv',
  localField: 'Model ID',
  foreignField: 'Model ID',
  options: {
    select: copyNumbersFields,
  },
});

schema.virtual('TreatmentResponsesCount', {
  ref: 'ptx-treatment-response',
  localField: 'Model ID',
  foreignField: 'Model ID',
  count: true,
  options: {
    select: treatmentResponsesFields,
  },
});

schema.virtual('MutationsGenes', {
  ref: 'ngs_dna',
  localField: 'Model ID',
  foreignField: 'Model ID',
  options: {
    select: { 'Model ID': 1, Gene_refGene: 1 },
  },
});

schema.virtual('CopyNumbersGenes', {
  ref: 'ngs_cnv',
  localField: 'Model ID',
  foreignField: 'Model ID',
  options: {
    select: { 'Model ID': 1, Gene_name: 1 },
  },
});

schema.virtual('ExpressionsGenes', {
  ref: 'ngs_rna',
  localField: 'Model ID',
  foreignField: 'Model ID',
  options: {
    select: { 'Model ID': 1, Symbol: 1 },
  },
});

schema.virtual('FusionsGenes', {
  ref: 'ngs_fusions',
  localField: 'Model ID',
  foreignField: 'Model ID',
  options: {
    select: { 'Model ID': 1, 'Gene_1_symbol(5end_fusion_partner)': 1, 'Gene_2_symbol(3end_fusion_partner)': 1 },
  },
});

module.exports = model('ptx-model', schema, 'ptx-model');
