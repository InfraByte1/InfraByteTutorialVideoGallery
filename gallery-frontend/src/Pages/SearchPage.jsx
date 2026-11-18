import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getHeaders } from "../services/auth";
import { enableSeekFromCache } from "../services/seekableVideo";
import { getJobsTutorialById, getJobsTutorialByTags } from "../config/config";
import axios from "axios";
import ThumbnailGrid from "../Components/category/ThumbnailGrid";
import noThumbnail from "../Assets/images/no_thumbnail.jpg";
import PlayButtonOverlay from "../Components/category/PlayButtonOverlay";
import { toast } from "react-toastify";
import { FaPlay, FaSearch } from "react-icons/fa";
import CryptoJS from "crypto-js";
import { oidcConfig } from "../config/config";

const SearchPage = ({ isFromShare }) => {
  const location = useLocation();
  var [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { query } = useParams();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [videoUrl, setVideoUrl] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  const [videoTitle, setVideoTitle] = useState("");
  const navigate = useNavigate();

  // The Now Playing card shows what's playing, so no toast is needed here.
  const playVideo = (url, fileName) => {
    setVideoUrl(url);
    setVideoTitle(fileName);
  };

  // Makes the timeline work when the storage server lacks range support.
  const videoRef = useRef(null);
  useEffect(() => enableSeekFromCache(videoRef.current), [videoUrl]);

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
      var responseData;

      if (query != undefined) {
        if (isFromShare) {
          sessionStorage.setItem("shared", query);

          var videoId = CryptoJS.AES.decrypt(
            decodeURIComponent(query),
            oidcConfig.secretCrypt
          ).toString(CryptoJS.enc.Utf8);
          const response = await axios.get(
            `${getJobsTutorialById}/${videoId}`,
            {
              headers: getHeaders(),
            }
          );
          responseData = response.data;
        } else {
          const response = await axios.get(
            `${getJobsTutorialByTags}?tags=${query}`,
            {
              headers: getHeaders(),
            }
          );
          responseData = response.data;
        }
        setData(responseData ?? []);
        if (responseData != null && responseData.length > 0) {
          playVideo(responseData[0].filePath, responseData[0].subTitle);
        }
      }

      setLoading(false);
    } catch (err) {
      // console.error("fetch failed:", err);

      setLoading(false);
      if (isFromShare) {
        toast.info("Error fetching data: Try login again.", {
          onClose: () => {
            navigate("/", { state: { isShared: true } });
          },
        });
      } else {
        toast.info("Error fetching data: " + err.message);
      }
    }
  };
  const results = (data ?? []).filter((video) => video.isPrivate !== true);

  return (
    <div
      className={`container thumbnail-grid search-page ${
        isMobile ? "mobile-list" : ""
      }`}
    >
      {videoUrl && (
        <>
          <div className="video-player mt-2">
            <video
              ref={videoRef}
              controls
              autoPlay
              muted
              key={videoUrl}
              preload="metadata"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          {videoTitle && (
            <div className="now-playing search-now-playing" role="status">
              <span className="now-playing-badge" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <div className="now-playing-text">
                <span className="now-playing-label">Now playing</span>
                <span className="now-playing-title" title={videoTitle}>
                  {videoTitle}
                </span>
              </div>
            </div>
          )}
        </>
      )}

      <div className="search-head">
        <div>
          <h1 className="search-title">
            {isFromShare ? "Shared video" : "Search results"}
          </h1>
          {!isFromShare && query && (
            <p className="search-sub">
              Showing videos for <span className="search-query">“{query}”</span>
            </p>
          )}
        </div>
        {!loading && results.length > 0 && (
          <span className="search-count">
            {results.length} {results.length === 1 ? "video" : "videos"}
          </span>
        )}
      </div>

      {loading && (
        <span>
          <div className="loading-spinner"></div>
        </span>
      )}

      {!loading && results.length === 0 && (
        <div className="search-empty">
          <FaSearch aria-hidden="true" />
          <h2>No videos found</h2>
          <p>
            {isFromShare
              ? "This video isn't available."
              : "Try a different keyword, or browse the Web and Mobile libraries."}
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="search-results">
          {results.map((thumbnail, index) => (
            <div
              key={index}
              className={`video-item${
                thumbnail.filePath === videoUrl ? " is-playing" : ""
              }`}
              onClick={() => playVideo(thumbnail.filePath, thumbnail.subTitle)}
            >
              <div className="thumb-wrap">
                {thumbnail.thumbnailName != null ? (
                  <img
                    src={`${thumbnail.thumbnailPath}/${thumbnail.thumbnailName}`}
                    alt={thumbnail.fileName}
                    className="thumbnail"
                  />
                ) : (
                  <img
                    src={noThumbnail}
                    alt="No image"
                    className="thumbnail thumbnail-placeholder"
                  />
                )}
                <span className="thumb-play" aria-hidden="true">
                  <FaPlay />
                </span>
              </div>
              <div className="video-details">
                <h2>{thumbnail.subTitle}</h2>
                {thumbnail.videoStatus && (
                  <div className="new-container">
                    {thumbnail.videoStatus ?? ""}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
