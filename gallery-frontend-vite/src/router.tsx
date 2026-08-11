import { Route, Routes } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import SelectVideoType from "./Pages/SelectVideoType";
import VideoListsPage from "./Pages/VideoListsPage";
import NoPage from "./Pages/NoPage";
import CallbackPage from "./Pages/CallbackPage";
import LogoutCallback from "./Pages/LogoutCallback";
import SearchPage from "./Pages/SearchPage";
import LoginPage from "./Pages/LoginPage";
import VideoFormPage from "./Pages/VideoFormPage";
import VideoFormUpdatePage from "./Pages/VideoFormUpdatePage";
import YourVideoListsPage from "./Pages/YourVideoListsPage";

const AppRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/logout-callback" element={<LogoutCallback />} />
      <Route path="/videos" element={<SelectVideoType />} />
      <Route path="/videos/your-videos" element={<YourVideoListsPage />} />
      <Route path="/videos/:videoType" element={<VideoListsPage />} />
      <Route path="/add/video" element={<VideoFormPage />} />
      <Route path="/edit/video/:videoTypeState" element={<VideoFormUpdatePage />} />
      <Route path="/search-result/:query" element={<SearchPage />} />
      <Route path="/video/:query" element={<SearchPage isFromShare />} />
      <Route path="*" element={<NoPage />} />
    </Routes>
  );
};

export default AppRoute;
