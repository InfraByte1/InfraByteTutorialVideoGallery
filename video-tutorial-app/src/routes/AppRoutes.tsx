import React, { Suspense } from "react";
import { Routes, Route } from "react-router-dom";


// Pages
import Home from "../pages/HomePage";
import { RoutesCustom } from "./RoutesCustom";
// import NoPage from "../pages/NoPage";
// import Loading from "../components/Loading";
// import VideoListPage from "../pages/VideoListsPage";
// import VideoFormPage from "../pages/VideoFormPage";
// import VideoFormUpdatePage from "../pages/VideoFormUpdatePage";
// import YourVideoListsPage from "../pages/YourVideoListPage";
// import SearchPage from "../pages/SearchPage";
// import SelectVideoType from "../pages/SelectVideoType";

// // Components
// import Header from "../components/Header";
// import LogoutCallback from "../components/LogoutCallback";
// import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes: React.FC = () => {
  return (
    <Suspense >
    {/* fallback={<Loading />}> */}
      <Routes>
        {/* Public Routes */}
        <Route path={RoutesCustom.Home.path} element={<Home />} />
        {/* <Route path={RoutesCustom.Callback.path} element={<Loading />} />
        <Route
          path={RoutesCustom.LogoutCallback.path}
          element={<LogoutCallback />}
        /> */}

        {/* <Route path={RoutesCustom.Videos.path} element={<SelectVideoType />} /> */}

        {/* Video list by type */}
        {/* <Route
          path={RoutesCustom.VideoByType.path}
          element={
            <>
              <Header />
              <VideoListPage />
            </>
          }
        /> */}

        {/* Protected Routes */}
        {/* <Route element={<ProtectedRoute />}>
          <Route
            path={RoutesCustom.YourVideos.path}
            element={
              <>
                <Header />
                <YourVideoListsPage />
              </>
            }
          />

          <Route
            path={RoutesCustom.AddVideo.path}
            element={
              <>
                <Header />
                <VideoFormPage />
              </>
            }
          />

          <Route
            path={RoutesCustom.EditVideo.path}
            element={
              <>
                <Header />
                <VideoFormUpdatePage />
              </>
            }
          />
        </Route> */}

        {/* Search */}
        {/* <Route
          path={RoutesCustom.SearchResult.path}
          element={
            <>
              <Header />
              <SearchPage isFromShare={false} />
            </>
          }
        /> */}

        {/* <Route
          path={RoutesCustom.SharedVideo.path}
          element={
            <>
              <Header />
              <SearchPage isFromShare={true} />
            </>
          }
        /> */}

        {/* 404 */}
        {/* <Route path="*" element={<NoPage />} /> */}
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
