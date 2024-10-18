// development
var authority = "https://localhost:5020";
var clientId = "react_tutorial_client";
var redirectUri = "http://localhost:3000/callback";
var postLogoutRedirectUri = "http://localhost:3000/logout-callback";
var apiBaseUrl = "https://api.staging.infrabyte.com.au/api/";
var hostUrl = "http://localhost:3000";

if (process.env.REACT_APP_ENVIRONMENT === "production") {
  authority = "https://security.infrabyte.com.au";
  redirectUri = "https://tutorial.infrabyte.com.au/callback";
  postLogoutRedirectUri = "https://tutorial.infrabyte.com.au/logout-callback";
  apiBaseUrl = "https://api.infrabyte.com.au/api/";
  hostUrl = "https://tutorial.infrabyte.com.au";
} else if (process.env.REACT_APP_ENVIRONMENT === "staging") {
  authority = "https://security.staging.infrabyte.com.au";
  redirectUri = "https://tutorial.staging.infrabyte.com.au/callback";
  postLogoutRedirectUri =
    "https://tutorial.staging.infrabyte.com.au/logout-callback";
  apiBaseUrl = "https://api.staging.infrabyte.com.au/api/";
  hostUrl = "https://tutorial.staging.infrabyte.com.au";
}
// used to test
// exports.loginUrl = `${authority}/connect/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid profile email jobbookingapi offline_access&state=2323&code_challenge=231232&code_challenge_method=S256`;

// console.log(this.loginUrl)

exports.getTokenUrl = `${authority}/connect/token`;
// exports.getAuthorizationUrl= `${authority}`;
exports.getAuthorizationUrl = `${authority}/connect/authorize`;

exports.getAllJobTutorials = `${apiBaseUrl}v6/BookingTutorial/GetAllJobTutorials`;
exports.getJobTutorialsByCategorySubCategory = `${apiBaseUrl}v6/BookingTutorial/GetJobTutorialsByCategorySubCategory`;
exports.getJobTutorialsByCategorySubCategoryTitle = `${apiBaseUrl}v6/BookingTutorial/GetJobTutorialsByCategorySubCategoryTitle`; //fetch data for update
exports.deleteVideoTutorial = `${apiBaseUrl}v6/BookingTutorial/DeleteTutorial`;
exports.updateJobBookingTutorials = `${apiBaseUrl}v6.1/BookingTutorial/UpdateJobBookingTutorials`;

exports.tutorialUpload = `${apiBaseUrl}v6.1/BookingTutorial/UploadJobBookingTutorialFiles`;
exports.getJobsTutorialByTags = `${apiBaseUrl}v6.1/BookingTutorial/GetJobTutorialByTags`;

exports.tokenPayload = () => {};

exports.oidcConfig = {
  authority: authority,
  clientId: clientId,
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
