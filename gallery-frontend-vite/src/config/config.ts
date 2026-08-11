const authority = import.meta.env.VITE_OIDC_AUTHORITY;
const clientId = import.meta.env.VITE_OIDC_CLIENT_ID;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Derived from the running origin instead of hardcoded per environment —
// one less place for a prod/staging domain typo to break login.
const hostUrl = window.location.origin;
const redirectUri = `${hostUrl}/callback`;
const postLogoutRedirectUri = `${hostUrl}/logout-callback`;

export const config = {
  authority,
  clientId,
  apiBaseUrl,
  hostUrl,
  redirectUri,
  postLogoutRedirectUri,
  responseType: "code",
  scope: "openid profile email jobbookingapi offline_access",
  // Obfuscates video IDs in share links (AES-encrypted query param) so they
  // aren't sequential/guessable at a glance. Not real access control — the
  // key ships in this same bundle, so it can't stop anyone who reads the JS.
  // Actual authorization still happens server-side via the Bearer token.
  secretCrypt: "video-infrabyte-tutorial",
};

export const getAuthorizationUrl = `${authority}/connect/authorize`;
export const getTokenUrl = `${authority}/connect/token`;
export const getEndSessionUrl = `${authority}/connect/endsession`;

export const getRolePermissionsByUserId = (userId: string) =>
  `${apiBaseUrl}v6/Accounts/GetRolePermissionsByUserId/${userId}`;

export const getAllJobTutorials = `${apiBaseUrl}v6/BookingTutorial/GetAllJobTutorials`;
export const getJobTutorialsByCategorySubCategory = `${apiBaseUrl}v6/BookingTutorial/GetJobTutorialsByCategorySubCategory`;
export const getJobTutorialsByCategorySubCategoryTitle = `${apiBaseUrl}v6/BookingTutorial/GetJobTutorialsByCategorySubCategoryTitle`;
export const deleteVideoTutorial = `${apiBaseUrl}v6/BookingTutorial/DeleteTutorial`;
export const updateJobBookingTutorials = `${apiBaseUrl}v6.1/BookingTutorial/UpdateJobBookingTutorials`;
export const tutorialUpload = `${apiBaseUrl}v6.1/BookingTutorial/UploadJobBookingTutorialFiles`;
export const getJobsTutorialByTags = `${apiBaseUrl}v6.1/BookingTutorial/GetJobTutorialByTags`;
export const getJobsTutorialById = `${apiBaseUrl}v6.1/BookingTutorial/GetJobTutorialById`;
