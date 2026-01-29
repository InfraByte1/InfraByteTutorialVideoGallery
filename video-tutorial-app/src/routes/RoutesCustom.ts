export const RoutesCustom = {
  Home: { path: "/" },
  Callback: { path: "/callback" },
  LogoutCallback: { path: "/logout-callback" },

  Videos: { path: "/videos" },
  VideoByType: { path: "/videos/:videoType" },

  YourVideos: { path: "/your-video" },
  AddVideo: { path: "/add/video" },
  EditVideo: { path: "/edit/video/:videoTypeState" },

  SearchResult: { path: "/search-result/:query" },
  SharedVideo: { path: "/video/:query" },

  Protected: { path: "/protected" },
};
