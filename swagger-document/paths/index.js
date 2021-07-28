const authSignInJSON = require('./authSignIn.json');
const authSignUpJSON = require('./authSignUp.json');
const authRefreshJSON = require('./authRefresh.json');
const authResetPasswordJSON = require('./authResetPassword.json');
const authResetPasswordTokenJSON = require('./authResetPasswordToken.json');
const authResetPasswordUserIdTokenJSON = require('./authResetPasswordUserIdToken.json');
const searchJSON = require('./search.json');
const detailsGeneralModelIdJSON = require('./detailsGeneralModelId.json');
const detailsClinicalModelIdJSON = require('./detailsClinicalModelId.json');
const detailsHistoryModelIdJSON = require('./detailsHistoryModelId.json');
const detailsResponsesModelIdJSON = require('./detailsResponsesModelId.json');
const filtersTumoursDiagnosisJSON = require('./filtersTumoursDiagnosis.json');
const filtersTumoursPrimaryJSON = require('./filtersTumoursPrimary.json');
const filtersTumoursSubJSON = require('./filtersTumoursSub.json');
const filtersHistoryCollectionJSON = require('./filtersHistoryCollection.json');
const filtersHistoryTreatmentJSON = require('./filtersHistoryTreatment.json');
const filtersHistoryResponseJSON = require('./filtersHistoryResponse.json');
const filtersResponsesTreatmentJSON = require('./filtersResponsesTreatment.json');
const filtersResponsesResponseJSON = require('./filtersResponsesResponse.json');
const filtersModelsJSON = require('./filtersModels.json');
const filtersGenesJSON = require('./filtersGenes.json');
const exportJSON = require('./export.json');
const adminAuthLoginJSON = require('./adminAuthLogin.json');
const adminUsersJSON = require('./adminUsers.json');
const adminUsersIdJSON = require('./adminUsersId.json');
const adminUsersUserIdTokenJSON = require('./adminUsersUserIdToken.json');

const paths = {
  ...authSignInJSON,
  ...authSignUpJSON,
  ...authRefreshJSON,
  ...authResetPasswordJSON,
  ...authResetPasswordTokenJSON,
  ...authResetPasswordUserIdTokenJSON,
  ...searchJSON,
  ...detailsGeneralModelIdJSON,
  ...detailsClinicalModelIdJSON,
  ...detailsHistoryModelIdJSON,
  ...detailsResponsesModelIdJSON,
  ...filtersTumoursDiagnosisJSON,
  ...filtersTumoursPrimaryJSON,
  ...filtersTumoursSubJSON,
  ...filtersHistoryCollectionJSON,
  ...filtersHistoryTreatmentJSON,
  ...filtersHistoryResponseJSON,
  ...filtersResponsesTreatmentJSON,
  ...filtersResponsesResponseJSON,
  ...filtersModelsJSON,
  ...filtersGenesJSON,
  ...exportJSON,
  ...adminAuthLoginJSON,
  ...adminUsersJSON,
  ...adminUsersIdJSON,
  ...adminUsersUserIdTokenJSON,
};

module.exports = paths;
