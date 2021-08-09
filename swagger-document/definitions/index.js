const ApiResponseJSON = require('./ApiResponse.json');
const AuthResponseJSON = require('./AuthResponse.json');
const ClinicalDataJSON = require('./ClinicalData.json');
const ClinicalDataWithModelJSON = require('./ClinicalDataWithModel.json');
const PDCModelJSON = require('./PDCModel.json');
const PDCModelWithTreatmentResponsesCountJSON = require('./PDCModelWithTreatmentResponsesCount.json');
const RefreshTokenRequestJSON = require('./RefreshTokenRequest.json');
const ResetPasswordStep1RequestJSON = require('./ResetPasswordStep1Request.json');
const ResetPasswordStep2RequestJSON = require('./ResetPasswordStep2Request.json');
const SignUpRequestJSON = require('./SignUpRequest.json');
const TreatmentHistoryJSON = require('./TreatmentHistory.json');
const TreatmentResponseJSON = require('./TreatmentResponse.json');
const TumourFilterPrimaryJSON = require('./TumourFilterPrimary.json');
const UserCredentialsJSON = require('./UserCredentials.json');
const UserIdResponseJSON = require('./UserIdResponse.json');
const UserIdsRequestJSON = require('./UserIdsRequest.json');
const UserInfoJSON = require('./UserInfo.json');
const UserRequestJSON = require('./UserRequest.json');
const UserResponseJSON = require('./UserResponse.json');
const UsersResponseJSON = require('./UsersResponse.json');
const AdminRequestJSON = require('./AdminRequest.json');
const AdminResponseJSON = require('./AdminResponse.json');
const AdminsResponseJSON = require('./AdminsResponse.json');
const AdminIdsRequestJSON = require('./AdminIdsRequest.json');

const definitions = {
  ...ApiResponseJSON,
  ...AuthResponseJSON,
  ...ClinicalDataJSON,
  ...ClinicalDataWithModelJSON,
  ...PDCModelJSON,
  ...PDCModelWithTreatmentResponsesCountJSON,
  ...RefreshTokenRequestJSON,
  ...ResetPasswordStep1RequestJSON,
  ...ResetPasswordStep2RequestJSON,
  ...SignUpRequestJSON,
  ...TreatmentHistoryJSON,
  ...TreatmentResponseJSON,
  ...TumourFilterPrimaryJSON,
  ...UserCredentialsJSON,
  ...UserIdResponseJSON,
  ...UserIdsRequestJSON,
  ...UserInfoJSON,
  ...UserRequestJSON,
  ...UserResponseJSON,
  ...UsersResponseJSON,

  ...AdminRequestJSON,
  ...AdminResponseJSON,
  ...AdminsResponseJSON,
  ...AdminIdsRequestJSON,
};

module.exports = definitions;
