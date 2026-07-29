import React, { useState } from "react";
import App from "./App";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  redirect,
  useNavigate,
} from "react-router-dom";
import VideoListpage from "./Pages/VideoListsPage";
import Homepage from "./Pages/Homepage";
import NoPage from "./Pages/NoPage";
import Loading from "./Components/Loading";

const AppRoute = () => {
  return (
    <Routes>
      <Route exact path="/" element={<Homepage />} />
      <Route exact path="/callback" element={ <Loading />} />
      {/* <Route exact path="/logout" element={ <Loading />} /> */}
      <Route path="/videos" element={<VideoListpage />} />
      <Route path="*" element={<NoPage />} />
    </Routes>
  );
};

export default AppRoute;
