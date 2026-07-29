import { Route, Routes } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import VideoListsPage from "./Pages/VideoListsPage";
import NoPage from "./Pages/NoPage";
import Loading from "./Components/Loading";

const AppRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/callback" element={<Loading />} />
      <Route path="/videos" element={<VideoListsPage />} />
      <Route path="*" element={<NoPage />} />
    </Routes>
  );
};

export default AppRoute;
