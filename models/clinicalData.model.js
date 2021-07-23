const { Schema, model } = require('mongoose');
const { modelFields, treatmentHistoryFields } = require('./fields');

const schema = new Schema({
  Origin: String,
  'Date Created': { type: Date, default: Date.now },
  'Growth Kinetics': String,
  Sex: String,
  Age: String,
  Ethnicity: String,
  'Primary Tumour Type': String,
  'Tumour Sub-type': String,
  'SNOMED ID': String,
  Diagnosis: String,
  Stage: String,
  Histology: [String],
  'Breast Cancer Receptor Status': [String],
  Differentiation: String,
  'Treatment Status': String,
  'Sample Collection Site': String,
  'Sample Type': String,
  'Procedure Type': String,
  'Smoking History': String,
  'Clinical Biomarkers of Interest (non-immune)': [String],
  'Clinical Biomarkers of Interest (Immune)': [String],
  'PDC Model': String,
  'Case ID': String,
});

schema.virtual('Model', {
  ref: 'ptx-model',
  localField: 'PDC Model',
  foreignField: 'Model ID',
  justOne: true,
  options: {
    select: modelFields,
  },
});

schema.virtual('TreatmentHistory', {
  ref: 'prx-treatment-history',
  localField: 'Case ID',
  foreignField: 'PredictRx Case ID',
  options: {
    select: treatmentHistoryFields,
  },
});

module.exports = model('prx-case', schema, 'prx-case');
