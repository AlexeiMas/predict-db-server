const { Schema, model } = require('mongoose');
const { modelFields, treatmentHistoryFields } = require('./fields');

// 'PDC Model Treatment Response' - no found for any model
/*
  for 10.(Data available filter)
  [ 'Plasma', 'PBMC',];
*/

const schema = new Schema({
  date_created: { type: Date, default: Date.now },
  'Growth Kinetics': String,
  Sex: String,
  Age: String,
  Ethnicity: String,
  'Primary Tumour Type': String,
  'Tumour Sub-type': String,
  'NIH MeSH Tree Number': String,
  Diagnosis: String,
  Stage: String,
  Histology: String,
  'Receptor Status': String,
  Differentiation: String,
  'Treatment Status': String,
  'Sample Collection Site': String,
  'Sample Type': String,
  'Procedure Type': String,
  'Smoking History': String,
  'Clinical Biomarkers of Interest (non-immune)': String,
  'Clinical Biomarkers of Interest (Immune)': String,
  'PDC Model': String,
  'Case ID': String,
  PBMC: Boolean,
  Plasma: Boolean,
});

schema.virtual('Model', {
  ref: 'pdc_model',
  localField: 'PDC Model',
  foreignField: 'Model ID',
  justOne: true,
  options: {
    select: modelFields,
  },
});

schema.virtual('TreatmentHistory', {
  ref: 'prx_history',
  localField: 'Case ID',
  foreignField: 'PredictRx Case ID',
  options: {
    select: treatmentHistoryFields,
  },
});

module.exports = model('prx_case', schema, 'prx_case');
