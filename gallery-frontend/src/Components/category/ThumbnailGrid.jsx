import React, { useEffect, useState, useRef, useCallback } from "react";
import { Accordion, Button, Container } from "react-bootstrap";
import { FaShareAlt } from "react-icons/fa";
import CryptoJS from "crypto-js";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import noThumbnail from "../../Assets/images/no_thumbnail.jpg";
import "../../Assets/Css/ThumbnailGrid.css";
import { deleteVideoTutorial, getJobTutorialsByCategorySubCategoryTitle, oidcConfig } from "../../config/config";
import { getHeaders } from "../../services/auth";
import axios from "axios";

// Component for video player
// Component for video player
const VideoPlayer = ({ videoUrl, videoTitle }) => {
  const videoRef = useRef(null);
  const [canSeek, setCanSeek] = useState(false); // Track if seeking is possible

  useEffect(() => {
    if (videoRef.current && videoUrl) {
      // console.log("Loading new video URL:", videoUrl);
      videoRef.current.pause(); // Pause current playback
      videoRef.current.currentTime = 0; // Reset to start
      videoRef.current.src = videoUrl; // Explicitly set new source
      videoRef.current.load(); // Reload video
      videoRef.current.play().catch((err) => {
        // console.error("Auto-play failed:", err);
        toast.error("Failed to play video. Please try manually.");
      });
    }
    // Cleanup on unmount or URL change
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = ""; // Clear source to prevent memory leaks
      }
    };
  }, [videoUrl]);

  const handleSeeking = () => {
    // console.log("Video is seeking...");
    if (!canSeek) {
      toast.warn("Seeking not available yet, please wait for video to buffer.");
    }
  };

  const handleSeeked = () => {
    // console.log("Video seeked to:", videoRef.current?.currentTime);
  };

  const handleError = (e) => {
    // console.error("Video error:", e);
    toast.error("Error loading video. Check format or network.");
  };

  // Handle metadata loading to ensure seeking is possible
  const handleLoadedMetadata = () => {
    // console.log("Video metadata loaded, duration:", videoRef.current?.duration);
    if (videoRef.current && isNaN(videoRef.current.duration)) {
      toast.warn("Video metadata incomplete, seeking may fail. Consider re-encoding the video.");
    } else {
      setCanSeek(true); // Enable seeking once metadata is loaded
    }
  };

  // Handle stalled or waiting events for long videos
  const handleStalled = () => {
    // console.warn("Video stalled during seeking or playback");
    if (videoRef.current) {
      videoRef.current.load(); // Reload video on stall
      videoRef.current.play().catch((err) => console.error("Replay failed:", err));
    }
  };

  // Monitor buffering progress to ensure seeking is possible
  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      // console.log("Buffered up to:", bufferedEnd, "seconds");
      if (bufferedEnd > videoRef.current.currentTime) {
        setCanSeek(true); // Allow seeking if enough data is buffered
      }
    }
  };

  return (
    <>
      <div className="video-player">
        <video
          ref={videoRef}
          key={videoUrl || "empty"} // Use "empty" key when no URL to ensure unique key
          controls
          autoPlay
          muted
          preload="metadata" // Changed to metadata to load initial data faster, then buffer as needed
          onSeeking={handleSeeking}
          onSeeked={handleSeeked}
          onError={handleError}
          onLoadedMetadata={handleLoadedMetadata} // Added to debug metadata
          onStalled={handleStalled} // Added to handle buffering issues
          onProgress={handleProgress} // Added to monitor buffering
        >
          {videoUrl && <source src={videoUrl} type="video/mp4" />}
          Your browser does not support the video tag.
        </video>
      </div>
      {videoTitle && <h5 className="p-3">Now Playing: {videoTitle}</h5>}
    </>
  );
};

// Component for individual thumbnail
const Thumbnail = ({ thumbnail, playVideo, copyUrlToClipboard, handleVideoDelete, showUpdate, loading }) => {
  return (
    <div className="thumbnail-container">
      <div className="thumbnail-item">
        {thumbnail.thumbnailName ? (
          <img
            src={thumbnail.thumbnailPath}
            alt={thumbnail.title}
            className="thumbnail-image"
            onClick={() => playVideo(thumbnail.filePath, thumbnail.title)}
          />
        ) : (
          // <img
          //   src={noThumbnail}
          //   alt="No image"
          //   className="thumbnail-image "
          //   onClick={() => playVideo(thumbnail.filePath)}
          // />
          <video
            src={thumbnail.filePath}
            className="thumbnail-image"
            onClick={() => playVideo(thumbnail.filePath, thumbnail.title)}
            muted
          />
        )}
        <div className="thumbnail-overlay">
          <a
            href="/add/video"
            variant="primary"
            className="mt-3 btn btn-danger"
          >
            Delete
          </a>
          {/* <PlayButtonOverlay /> */}
        </div>
        {/* <PlayButtonOverlay /> */}
      </div>
      <h2
        className="thumbnail-title"
        onClick={() => playVideo(thumbnail.filePath, thumbnail.title)}
      >
        {thumbnail.title}
      </h2>
      {thumbnail.videoStatus && (
        <div className="new-container">{thumbnail.videoStatus ?? ""}</div>
      )}
      <div className="thumbnail-overlay">
        <Button
          onClick={thumbnail.isPrivate ? null : () => copyUrlToClipboard(thumbnail.id)}
          style={thumbnail.isPrivate ? styles.disabledButton : styles.shareButton}
          aria-label={thumbnail.isPrivate ? "Private video" : "Share video"}
          disabled={thumbnail.isPrivate}
        >
          <FaShareAlt style={styles.icon} />
        </Button>
      </div>
    </div>
  );
};

const ThumbnailGrid = ({
  selectedItem,
  yourVideosData,
  handleShow,
  showUpdate,
  videoType,
  selectedCategory,
  selectedSubCategory,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState({});
  const [loadingData, setLoadingData] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  const navigate = useNavigate();

  const copyUrlToClipboard = useCallback((videoId) => {
    if (!videoId || loading[videoId]) return;
    const encrypted = CryptoJS.AES.encrypt(videoId, oidcConfig.secretCrypt).toString();
    const url = `${oidcConfig.hostUrl}/video/${encodeURIComponent(encrypted)}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        toast.success("Video link copied!");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        // console.error("Failed to copy:", err);
        toast.error("Failed to copy link");
      });
  }, [loading]);

  const playVideo = useCallback((url, title) => {
    // console.log("Playing video:", { url, title });
    setVideoUrl(url);
    setVideoTitle(title);
    toast.info(`Now Playing: ${title}`);
  }, []);

  const handleVideoDelete = useCallback(async (videoId) => {
    setLoading((prev) => ({ ...prev, [videoId]: true }));
    try {
      const response = await axios.delete(`${deleteVideoTutorial}/${videoId}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Access-Control-Allow-Origin": oidcConfig.hostUrl,
        },
      });
      if (response.status === 200) {
        toast.success("Video deleted successfully");
        navigate(0);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete video");
    } finally {
      setLoading((prev) => ({ ...prev, [videoId]: false }));
    }
  }, [navigate]);

  const fetchDataForDelete = useCallback(async (selectedTitle) => {
    setLoadingData(true);
    try {
      const response = await axios.post(
        getJobTutorialsByCategorySubCategoryTitle,
        {
          category: selectedCategory ?? (videoType === "web" ? "Dashboard" : "Driver Portal"),
          subCategory: selectedSubCategory ?? (videoType === "web" ? "Dashboard" : "Driver Portal"),
          videoType,
          videoTitle: selectedTitle,
        },
        { headers: getHeaders() }
      );
      navigate(`/edit/video/${videoType}`, { state: response.data });
      toast.success("Video data fetched successfully");
    } catch (err) {
      console.error("Fetch failed:", err);
      toast.error("Failed to fetch video data");
    } finally {
      setLoadingData(false);
    }
  }, [navigate, selectedCategory, selectedSubCategory, videoType]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 769);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <ToastContainer />
      <VideoPlayer videoUrl={videoUrl} videoTitle={videoTitle} />
      {/* {videoTitle && <h5 className="p-3">Now Playing: {videoTitle}</h5>} */}

      <div className={`thumbnail-grid ${isMobile ? "mobile-list" : ""}`}>
        {isMobile && (
          <center>
            <Container
              onClick={handleShow}
              style={{
                backgroundColor: "gray",
                padding: "10px",
                color: "white",
              }}
            >
              <i className="fas fa-eye"></i> Show Video List
            </Container>
          </center>
        )}
        {!selectedItem && (
          <p>Welcome to InfraByte {videoType} video tutorial. </p>
        )}
        {selectedItem && (
          <>
            {yourVideosData && (
              <>
                <h2 className="mt-5 mb-3">{selectedItem.subCategory}</h2>
                <h6 className="mt-5 mb-3">{selectedItem.description}</h6>
                <center>
                  <div className="thumbnails">
                    {selectedItem.videoTutorials.map((thumbnail, index) => (
                      <Thumbnail
                        key={index}
                        thumbnail={thumbnail}
                        playVideo={playVideo}
                        copyUrlToClipboard={copyUrlToClipboard}
                        handleVideoDelete={handleVideoDelete}
                        showUpdate={showUpdate}
                        loading={loading[thumbnail.id]}
                      />
                    ))}
                  </div>
                </center>
              </>
            )}

            <h3 className="mt-5 mb-3">{selectedItem.category}</h3>

            <Accordion defaultActiveKey="default">
              {isMobile && <ToastContainer />}
              {loadingData && (
                <span>
                  <div className="loading-spinner"></div>
                </span>
              )}
              {selectedItem.subCategories.map((category) => (
                <Accordion.Item
                  eventKey={category.videoTitle ?? ""}
                  key={category.videoTitle}
                >
                  <Accordion.Header
                    className={
                      selectedItem != null && selectedItem.category == category
                        ? "active"
                        : ""
                    }
                    id={category.videoTitle}
                  >
                    <div className="d-flex align-items-center justify-content-between w-100">
                      <h5 className="mt-0 mb-1">{category.videoTitle}</h5>
                      {showUpdate && (
                        <a
                          onClick={() =>
                            fetchDataForDelete(category.videoTitle)
                          }
                          variant="primary"
                          className="button-container mt-3  "
                        >
                          Update video
                        </a>
                      )}
                    </div>
                  </Accordion.Header>

                  <Accordion.Body>
                    <h6 className="mt-0 mb-3 mx-2">
                      {category.description === `null`
                        ? ""
                        : category.description}
                    </h6>
                    <div className="video-list w-100">
                      {category.videoTutorials.map((thumbnail, index) =>
                        !showUpdate && thumbnail.isPrivate === true ? (
                          <></>
                        ) : (
                          <div key={index} className="video-item">
                            {thumbnail.thumbnailName != null ? (
                              <img
                                src={`${thumbnail.thumbnailPath}/${thumbnail.thumbnailName}`}
                                alt={thumbnail.thumbnailName}
                                className="thumbnail"
                                onClick={() =>
                                  playVideo(
                                    thumbnail.filePath,
                                    thumbnail.subTitle
                                  )
                                }
                              />
                            ) : (
                              <img
                                src={noThumbnail}
                                alt="No image"
                                className="thumbnail "
                                onClick={() =>
                                  playVideo(
                                    thumbnail.filePath,
                                    thumbnail.subTitle
                                  )
                                }
                              /> // <video src={thumbnail.filePath} className="thumbnail-image" onClick={() => playVideo(thumbnail.filePath)}></video>
                            )}

                            <div className="video-details">
                              <h2
                                onClick={() =>
                                  playVideo(
                                    thumbnail.filePath,
                                    thumbnail.subTitle
                                  )
                                }
                              >
                                {thumbnail.subTitle}
                              </h2>
                              {/* <p>{}</p> */}
                              {thumbnail.videoStatus && (
                                <div className="new-container">
                                  {thumbnail.videoStatus ?? ""}
                                </div>
                              )}
                              <div className="thumbnail-overlay">
                                {showUpdate && (
                                  <>
                                    <a
                                      onClick={() =>
                                        handleVideoDelete(thumbnail.id)
                                      }
                                      variant="primary"
                                      className="mt-3 btn  btn-danger"
                                      rel="noopener noreferrer"
                                    >
                                      Delete
                                    </a>
                                    {loading && (
                                      <span>
                                        <div className="loading-spinner"></div>
                                      </span>
                                    )}
                                  </>
                                )}

                                {
                                  <button
                                    onClick={
                                      thumbnail.isPrivate === true
                                        ? null
                                        : () => copyUrlToClipboard(thumbnail.id)
                                    }
                                    style={
                                      thumbnail.isPrivate === true
                                        ? styles.disabledButton
                                        : styles.shareButton
                                    }
                                  >
                                    <FaShareAlt style={styles.icon} />{" "}
                                  </button>
                                }
                                {copied && (
                                  <span style={styles.copiedMessage}>
                                    Video Link Copied!
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                    {/* <center>
                      <div className="thumbnails ">
                        {category.videoTutorials.map((thumbnail, index) => (
                          <div className="thumbnail-container" key={index}>
                            <div key={index} className="thumbnail-item">
                              {thumbnail.thumbnailName != null ? (
                                <img
                                  src={`${thumbnail.thumbnailPath}/${thumbnail.thumbnailName}`}
                                  alt={thumbnail.fileName}
                                  className="thumbnail-image w-100"
                                  onClick={() => playVideo(thumbnail.filePath)}
                                />
                              ) : (
                                <img
                                  src={noThumbnail}
                                  alt="No image"
                                  className="thumbnail-image "
                                  onClick={() => playVideo(thumbnail.filePath)}
                                /> // <video src={thumbnail.filePath} className="thumbnail-image" onClick={() => playVideo(thumbnail.filePath)}></video>
                              )}

                              <PlayButtonOverlay
                                onClick={() => playVideo(thumbnail.filePath)}
                              />
                              <div className="thumbnail-overlay">
                                {showUpdate && (
                                  <>
                                    <a
                                      onClick={() =>
                                        handleVideoDelete(thumbnail.id)
                                      }
                                      variant="primary"
                                      className="mt-3 btn  btn-danger"
                                      rel="noopener noreferrer"
                                    >
                                      Delete
                                    </a>
                                    {loading && (
                                      <span>
                                        <div className="loading-spinner"></div>
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            <h2 className="thumbnail-title">
                              <span>
                                <i className="fa fa-video-camera"></i>
                              </span>
                              {"  "}
                              {thumbnail.subTitle}
                            </h2>
                          </div>
                        ))}
                      </div>
                    </center> */}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>

            {/* {!yourVideosData && (
              <>
                <h3 className="mt-5 mb-3">
                  {selectedItem.subCategories[0].subCategory}
                </h3>
                <h6 className="mt-5 mb-3">
                  {selectedItem.subCategories[0].description}
                </h6>
                <center>
                  <div className="thumbnails">
                    {selectedItem.subCategories[0].videoTutorials.map(
                      (thumbnail, index) => (
                        <div className="thumbnail-container" key={index}>
                          <div key={index} className="thumbnail-item">
                            {thumbnail.thumbnailName != null ? (
                              <img
                                src={thumbnail.thumbnailPath}
                                alt={thumbnail.fileName}
                                className="thumbnail-image"
                                onClick={() => playVideo(thumbnail.filePath)}
                              />
                            ) : (
                              <img
                                src={noThumbnail}
                                alt="No image"
                                className="thumbnail-image "
                                onClick={() => playVideo(thumbnail.filePath)}
                              /> // <video src={thumbnail.filePath} className="thumbnail-image" onClick={() => playVideo(thumbnail.filePath)}></video>
                            )}

                            <PlayButtonOverlay
                              onClick={() => playVideo(thumbnail.filePath)}
                            />
                          </div>
                          <h2 className="thumbnail-title">
                            <span>
                              <i className="fa fa-play-circle"></i>
                            </span>{" "}
                            {thumbnail.title}
                          </h2>
                        </div>
                      )
                    )}
                  </div>
                </center>
              </>
            )} */}
            {/* <Modal show={showModal} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>{selectedItem.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="video-player">
                <video controls autoPlay>
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal> */}
          </>
        )}
      </div>
    </>
  );
};

const styles = {
  shareButton: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "orange",
    border: "none",
    color: "white",
    padding: "5px",
    fontSize: "16px",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "8px",
  },
  disabledButton: {
    display: "flex",
    alignItems: "center",
    border: "none",
    color: "white",
    padding: "5px",
    fontSize: "16px",
    borderRadius: "5px",
    cursor: "not-allowed",
    marginTop: "8px",
    backgroundColor: "red",
  },
  icon: {
    marginRight: "0px",
  },
  copiedMessage: {
    marginLeft: "10px",
    color: "green",
  },
};

export default ThumbnailGrid;