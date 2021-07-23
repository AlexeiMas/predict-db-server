const CopyNumber = require('./copyNumbers.model');
const Mutation = require('./mutations.model');
const Fusion = require('./fusions.model');
const Expression = require('./expressions.model');
const ClinicalData = require('./clinicalData.model');
const TreatmentHistory = require('./treatmentHistory.model');
const PDCModel = require('./pdcModels.model');
const TreatmentInfo = require('./treatmentInfo.model');
const TreatmentResponse = require('./treatmentResponses.model');
const Input = require('./inputs.model');
const User = require('./users.model');
const RefreshToken = require('./refreshTokens.model');
const ResetPasswordToken = require('./resetPasswordTokens.model');
const Admin = require('./admins.model');
const ApprovalToken = require('./approvalTokens.model');

module.exports = {
  CopyNumber,
  Mutation,
  Fusion,
  Expression,
  ClinicalData,
  TreatmentHistory,
  PDCModel,
  TreatmentInfo,
  TreatmentResponse,
  Input,
  User,
  RefreshToken,
  ResetPasswordToken,
  Admin,
  ApprovalToken,
};
