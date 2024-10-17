import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getHeaders } from "../services/auth";
import { getJobsTutorialByTags } from "../config/config";
import axios from "axios";
import ThumbnailGrid from "../Components/category/ThumbnailGrid";
import noThumbnail from "../Assets/images/no_thumbnail.jpg";
import PlayButtonOverlay from "../Components/category/PlayButtonOverlay";
import { toast, ToastContainer } from "react-toastify";

const SearchPage = () => {
  const location = useLocation();
  var [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { query } = useParams();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [videoUrl, setVideoUrl] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  const [videoTitle, setVideoTitle] = useState("");

  const playVideo = (url, fileName) => {
    setVideoUrl(url);
    setVideoTitle(fileName);
    toast.info(`Now Playing: ${fileName}`);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (query != undefined) {
        const response = await axios.get(
          `${getJobsTutorialByTags}?tags=${query}`,
          {
            headers: getHeaders(),
          }
        );
        setData(response.data);
      }

      setLoading(false);
    } catch (err) {
      // console.error("fetch failed:", err);
      toast.info("Error fetching data: " + err.message);
      setLoading(false);
    }
  };
  return (
    <div
      className={`container thumbnail-grid ${isMobile ? "mobile-list" : ""}`}
    >
      <ToastContainer />
      <div className="video-player mt-2">
        <video controls autoPlay key={videoUrl}>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      {videoTitle && <h5 className="p-3">Now Playing: {videoTitle}</h5>}

      {loading && (
        <span>
          <div className="loading-spinner"></div>
        </span>
      )}
      {/* {data[0]["id"]} */}
      {data && (
        <>
          <>
            <div className="thumbnails mt-3 ">
              {data.map((thumbnail, index) =>
                thumbnail.isPrivate === true ? (
                  <></>
                ) : (
                  <div
                    key={index}
                    className="video-item"
                    onClick={() =>
                      playVideo(thumbnail.filePath, thumbnail.subTitle)
                    }
                  >
                    {thumbnail.thumbnailName != null ? (
                      <img
                        src={`${thumbnail.thumbnailPath}/${thumbnail.thumbnailName}`}
                        alt={thumbnail.fileName}
                        className="thumbnail"
                        // onClick={() => playVideo(thumbnail.filePath)}
                      />
                    ) : (
                      <img
                        src={noThumbnail}
                        alt="No image"
                        className="thumbnail "
                        // onClick={() => playVideo(thumbnail.filePath)}
                      /> // <video src={thumbnail.filePath} className="thumbnail-image" onClick={() => playVideo(thumbnail.filePath)}></video>
                    )}
                    <div className="thumbnail-overlay"></div>
                    <div className="video-details">
                      <h2>{thumbnail.subTitle}</h2>
                      {thumbnail.videoStatus && (
                        <div className="new-container">
                          {thumbnail.videoStatus ?? ""}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        </>
      )}
    </div>
  );
};

export default SearchPage;
