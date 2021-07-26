const { Schema, model } = require('mongoose');
const { clinicalDataFields } = require('./fields');

const schema = new Schema({
  'Pre/Post Collection': String,
  Regime: String,
  'Date Started': Date,
  'Dose  (mg/day or mg/kg)': String, // TODO: Fix field name in the DB (space)
  'Treatment Duration (Months)': Number,
  'Best Response (RECIST)': String,
  'Response Duration (Months)': Number,
  Treatment: String,
  'Date of Last Treatment': Date,
  'PredictRx Case ID': String,
});

schema.virtual('ClinicalData', {
  ref: 'prx_case',
  localField: 'PredictRx Case ID',
  foreignField: 'Case ID',
  options: {
    select: clinicalDataFields,
  },
});

module.exports = model('prx_history', schema, 'prx_history');
