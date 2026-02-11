// development
var authority = "https://localhost:5020";
var clientId = "infrabyte_tutorial_client";
var redirectUri = "http://localhost:3000/callback";
var postLogoutRedirectUri = "http://localhost:3000/logout-callback";
var apiBaseUrl = "https://api.staging.infrabyte.com.au/api/";
var hostUrl = "http://localhost:3000";
var clientSecret = "1Jn7wg1l+Ppme/VQes4T/+H2YYBlw+CVTXSMtVk30v4=";

if (process.env.REACT_APP_ENVIRONMENT === "production") {
  authority = "https://security.infrabyte.com.au";
  redirectUri = "https://tutorial.infrabyte.com.au/callback";
  postLogoutRedirectUri = "https://tutorial.infrabyte.com.au/logout-callback";
  apiBaseUrl = "https://api.infrabyte.com.au/api/";
  hostUrl = "https://tutorial.infrabyte.com.au";
  clientSecret = "RUFDrGypzfUsgaQPASAzNUeJQ0B0tGrZT6EmkC8JxT4=";
} else if (process.env.REACT_APP_ENVIRONMENT === "staging") {
  redirectUri = "https://tutorial.staging.infrabyte.com.au/callback";
  postLogoutRedirectUri =
    "https://tutorial.staging.infrabyte.com.au/logout-callback";
  apiBaseUrl = "https://api.staging.infrabyte.com.au/api/";
  hostUrl = "https://tutorial.staging.infrabyte.com.au";
  authority = "https://security.staging.infrabyte.com.au";
  clientSecret = "COhOvHI+hwCHn2Ii6/mYTOwy2yt+UFN/+Mr6i+AEa4A=";
} else if (process.env.REACT_APP_ENVIRONMENT === "dev") {
  redirectUri = "https://tutorial.dev.infrabyte.com.au/callback";
  postLogoutRedirectUri =
    "https://tutorial.dev.infrabyte.com.au/logout-callback";
  apiBaseUrl = "https://api.dev.infrabyte.com.au/api/";
  hostUrl = "https://tutorial.dev.infrabyte.com.au";
  authority = "https://security.dev.infrabyte.com.au";
  clientSecret = "COhOvHI+hwCHn2Ii6/mYTOwy2yt+UFN/+Mr6i+AEa4A=";
}
// used to test
// exports.loginUrl = `${authority}/connect/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid profile email jobbookingapi offline_access&state=2323&code_challenge=231232&code_challenge_method=S256`;

// console.log(this.loginUrl)

exports.getTokenUrl = `${authority}/connect/token`;
// exports.getAuthorizationUrl= `${authority}`;
exports.getAuthorizationUrl = `${authority}/connect/authorize`;

exports.getRolePermissionsByUserId = (userId) =>
  `${apiBaseUrl}v6/Accounts/GetRolePermissionsByUserId/${userId}`;

exports.getAllJobTutorials = `${apiBaseUrl}v6/BookingTutorial/GetAllJobTutorials`;
exports.getJobTutorialsByCategorySubCategory = `${apiBaseUrl}v6/BookingTutorial/GetJobTutorialsByCategorySubCategory`;
exports.getJobTutorialsByCategorySubCategoryTitle = `${apiBaseUrl}v6/BookingTutorial/GetJobTutorialsByCategorySubCategoryTitle`; //fetch data for update
exports.deleteVideoTutorial = `${apiBaseUrl}v6/BookingTutorial/DeleteTutorial`;
exports.updateJobBookingTutorials = `${apiBaseUrl}v6.1/BookingTutorial/UpdateJobBookingTutorials`;

exports.tutorialUpload = `${apiBaseUrl}v6.1/BookingTutorial/UploadJobBookingTutorialFiles`;
exports.getJobsTutorialByTags = `${apiBaseUrl}v6.1/BookingTutorial/GetJobTutorialByTags`;
exports.getJobsTutorialById = `${apiBaseUrl}v6.1/BookingTutorial/GetJobTutorialById`;

exports.tokenPayload = () => {};

exports.oidcConfig = {
  authority: authority,
  clientId: clientId,
  clientSecret,
  redirectUri: redirectUri,
  postLogoutRedirectUri: postLogoutRedirectUri,
  response_type: "code",
  scope: "openid profile email jobbookingapi offline_access",
  hostUrl: hostUrl,
  secretCrypt: "video-infrabyte-tutorial",
  // state:getState(),
  // code_challenge: getCodeChallenge(),
  // code_challenge_method:'S256'
};
