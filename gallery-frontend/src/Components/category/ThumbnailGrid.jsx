import React, {
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { Accordion, Button, Container } from "react-bootstrap";
import {
  FaDesktop,
  FaExpandAlt,
  FaListUl,
  FaMobileAlt,
  FaPlay,
  FaShareAlt,
  FaTimes,
} from "react-icons/fa";
import { usePreferences } from "../../contexts/PreferencesContext";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";
import ThemedToastContainer from "../ThemedToastContainer";
import { useNavigate } from "react-router-dom";
import noThumbnail from "../../Assets/images/no_thumbnail.jpg";
import "../../Assets/Css/ThumbnailGrid.css";
import {
  deleteVideoTutorial,
  getJobTutorialsByCategorySubCategoryTitle,
  oidcConfig,
} from "../../config/config";
import { getHeaders } from "../../services/auth";
import { enableSeekFromCache } from "../../services/seekableVideo";
import axios from "axios";

// YouTube-style description: two lines, then "…more" / "Show less".
// "…more" only appears when the text actually overflows two lines.
const NowPlayingDescription = ({ text }) => {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  // The backend sends the string "null" for groups without a description.
  const clean = text && text !== "null" ? text.trim() : "";

  useEffect(() => {
    setExpanded(false);
  }, [clean]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      // Only meaningful while clamped; keep the last answer when expanded.
      if (!expanded) setOverflowing(el.scrollHeight > el.clientHeight + 1);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [clean, expanded]);

  if (!clean) return null;

  return (
    <div className="now-playing-desc">
      <p
        ref={ref}
        className={`now-playing-desc-text${expanded ? " is-expanded" : ""}`}
      >
        {clean}
      </p>
      {(overflowing || expanded) && (
        <button
          type="button"
          className="now-playing-more"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "…more"}
        </button>
      )}
    </div>
  );
};

// Viewers never see private videos; "Your videos" shows everything.
const visibleVideos = (group, showUpdate) =>
  showUpdate
    ? group.videoTutorials
    : group.videoTutorials.filter((video) => video.isPrivate !== true);

// Component for video player
const VideoPlayer = ({
  videoUrl,
  videoTitle,
  description,
  shareable,
  onShare,
  floatable,
}) => {
  const videoRef = useRef(null);
  // Video URLs can contain raw spaces/special characters (e.g. folder names
  // like "Driver Portal"), which can break HTTP Range requests - and with
  // them, seeking - even though the same file seeks fine opened locally.
  const encodedVideoUrl = videoUrl ? encodeURI(videoUrl) : videoUrl;

  useEffect(() => {
    let stopSeekFix = () => {};
    if (videoRef.current && encodedVideoUrl) {
      // console.log("Loading new video URL:", encodedVideoUrl);
      videoRef.current.pause(); // Pause current playback
      videoRef.current.currentTime = 0; // Reset to start
      videoRef.current.src = encodedVideoUrl; // Explicitly set new source
      videoRef.current.load(); // Reload video
      videoRef.current.play().catch((err) => {
        // console.error("Auto-play failed:", err);
        // toast.error("Failed to play video. Please try manually.");
      });
      // Makes the timeline work when the storage server lacks range support.
      stopSeekFix = enableSeekFromCache(videoRef.current);
    }
    // Cleanup on unmount or URL change
    return () => {
      stopSeekFix();
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = ""; // Clear source to prevent memory leaks
      }
    };
  }, [encodedVideoUrl]);

  const handleSeeking = () => {
    // console.log("Video is seeking...");
  };

  const handleSeeked = () => {
    // console.log("Video seeked to:", videoRef.current?.currentTime);
  };

  const handleError = (e) => {
    // console.error("Video error:", e);
    // toast.error("Error loading video. Check format or network.");
  };

  const handleLoadedMetadata = () => {
    // console.log("Video metadata loaded, duration:", videoRef.current?.duration);
  };

  // Do not render player if no video URL
  // if (!videoUrl) return null;

  // ---- Floating mini player (viewers) -------------------------------------
  // The slot keeps the player's space in the page. When it scrolls out of
  // view, the *same* .video-player element is switched to a small fixed
  // window by CSS only, so the video keeps playing without reloading.
  const slotRef = useRef(null);
  const [pastPlayer, setPastPlayer] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // On/off lives in the navbar's Settings menu (PreferencesContext).
  const { floatingPlayer: floatEnabled } = usePreferences();

  useEffect(() => {
    const el = slotRef.current;
    if (!floatable || !el || typeof IntersectionObserver === "undefined") {
      setPastPlayer(false);
      return undefined;
    }
    // -100px: the sticky navbar covers the top of the viewport
    const observer = new IntersectionObserver(
      ([entry]) =>
        setPastPlayer(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { rootMargin: "-100px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [floatable]);

  // Closing the mini player lasts until the player is back in view or a new
  // video is picked.
  useEffect(() => {
    if (!pastPlayer) setDismissed(false);
  }, [pastPlayer]);
  useEffect(() => {
    setDismissed(false);
  }, [videoUrl]);

  const floating =
    floatable && floatEnabled && !!videoUrl && pastPlayer && !dismissed;

  const backToPlayer = () => {
    const el = slotRef.current;
    if (!el) return;
    window.scrollTo({
      top: window.scrollY + el.getBoundingClientRect().top - 110,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className="player-slot" ref={slotRef}>
        <div className={`video-player${floating ? " is-floating" : ""}`}>
          <video
            ref={videoRef}
            key={encodedVideoUrl || "empty"} // Use "empty" key when no URL to ensure unique key
            controls
            autoPlay
            muted
            preload="metadata" // Changed to metadata to load initial data faster, then buffer as needed
            onSeeking={handleSeeking}
            onSeeked={handleSeeked}
            onError={handleError}
            onLoadedMetadata={handleLoadedMetadata} // Added to debug metadata
          >
            {encodedVideoUrl && (
              <source src={encodedVideoUrl} type="video/mp4" />
            )}
            Your browser does not support the video tag.
          </video>
          {floating && (
            <div className="float-actions">
              <button
                type="button"
                onClick={backToPlayer}
                title="Back to full player"
                aria-label="Back to full player"
              >
                <FaExpandAlt aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                title="Close mini player"
                aria-label="Close mini player"
              >
                <FaTimes aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
      {videoTitle && (
        <div className="now-playing" role="status">
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
            <NowPlayingDescription text={description} />
          </div>
          {shareable && (
            <button
              type="button"
              className="now-playing-share"
              onClick={onShare}
              title="Copy share link"
            >
              <FaShareAlt aria-hidden="true" />
              Share
            </button>
          )}
        </div>
      )}{" "}
    </>
  );
};

// Component for individual thumbnail
const Thumbnail = ({
  thumbnail,
  playVideo,
  copyUrlToClipboard,
  handleVideoDelete,
  showUpdate,
  loading,
}) => {
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
          onClick={
            thumbnail.isPrivate ? null : () => copyUrlToClipboard(thumbnail.id)
          }
          style={
            thumbnail.isPrivate ? styles.disabledButton : styles.shareButton
          }
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
  // id / isPrivate of the playing video, so Now Playing can offer "Share"
  const [videoMeta, setVideoMeta] = useState({});
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState({});
  const [loadingData, setLoadingData] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  const navigate = useNavigate();

  const copyUrlToClipboard = useCallback(
    (videoId) => {
      if (!videoId || loading[videoId]) return;
      const encrypted = CryptoJS.AES.encrypt(
        videoId,
        oidcConfig.secretCrypt,
      ).toString();
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
    },
    [loading],
  );

  const playVideo = useCallback((url, title, meta = {}) => {
    // console.log("Playing video:", { url, title });
    setVideoUrl(url);
    setVideoTitle(title);
    setVideoMeta(meta);
    // Large screens already show the Now Playing card next to the player, so
    // a toast on every click is noise. On phones the card can be off-screen,
    // so keep the toast there.
    if (window.innerWidth < 769) {
      toast.info(`Now Playing: ${title}`);
    }
  }, []);

  const handleVideoDelete = useCallback(
    async (videoId) => {
      setLoading((prev) => ({ ...prev, [videoId]: true }));
      try {
        const response = await axios.delete(
          `${deleteVideoTutorial}/${videoId}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Access-Control-Allow-Origin": oidcConfig.hostUrl,
            },
          },
        );
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
    },
    [navigate],
  );

  const fetchDataForDelete = useCallback(
    async (selectedTitle) => {
      setLoadingData(true);
      try {
        const response = await axios.post(
          getJobTutorialsByCategorySubCategoryTitle,
          {
            category:
              selectedCategory ??
              (videoType === "web" ? "Dashboard" : "Driver Portal"),
            subCategory:
              selectedSubCategory ??
              (videoType === "web" ? "Dashboard" : "Driver Portal"),
            videoType,
            videoTitle: selectedTitle,
          },
          { headers: getHeaders() },
        );
        navigate(`/edit/video/${videoType}`, { state: response.data });
        toast.success("Video data fetched successfully");
      } catch (err) {
        console.error("Fetch failed:", err);
        toast.error("Failed to fetch video data");
      } finally {
        setLoadingData(false);
      }
    },
    [navigate, selectedCategory, selectedSubCategory, videoType],
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 769);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setVideoUrl("");
    setVideoTitle("");
    setVideoMeta({});
  }, [selectedItem]);

  // Web / Mobile › Category › Topic
  const hasSub =
    !!selectedItem &&
    !!selectedItem.subCategory &&
    selectedItem.subCategory !== selectedItem.category;
  const TypeIcon = videoType === "mobile" ? FaMobileAlt : FaDesktop;
  const breadcrumb = selectedItem ? (
    <ol className="crumbs" aria-label="Breadcrumb">
      {videoType && (
        <li className="crumb">
          <TypeIcon aria-hidden="true" />
          {videoType === "mobile" ? "Mobile" : "Web"}
        </li>
      )}
      <li
        className={`crumb${hasSub ? "" : " crumb-current"}`}
        aria-current={hasSub ? undefined : "page"}
      >
        {selectedItem.category}
      </li>
      {hasSub && (
        <li className="crumb crumb-current" aria-current="page">
          {selectedItem.subCategory}
        </li>
      )}
    </ol>
  ) : null;

  return (
    <>
      <ThemedToastContainer />
      {!showUpdate && breadcrumb}
      <VideoPlayer
        videoUrl={videoUrl}
        videoTitle={videoTitle}
        description={videoMeta.description}
        // Viewers (not "Your videos") share from here; private videos can't be.
        shareable={!showUpdate && !!videoMeta.id && !videoMeta.isPrivate}
        onShare={() => copyUrlToClipboard(videoMeta.id)}
        // Mini player is a viewer feature; "Your videos" is unchanged.
        floatable={!showUpdate}
      />
      {/* {videoTitle && <h5 className="p-3">Now Playing: {videoTitle}</h5>} */}

      <div className={`thumbnail-grid ${isMobile ? "mobile-list" : ""}`}>
        {/* {isMobile && (
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
        )} */}
        {!selectedItem && (
          <p>Welcome to InfraByte {videoType} video tutorial. </p>
        )}
        {selectedItem && (
          <>
            {yourVideosData && (
              <>
                <h2 className="mt-3 mb-3">{selectedItem.subCategory}</h2>
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

            {/* "Your videos" keeps the breadcrumb here; viewers get it above
                the player. */}
            {showUpdate && breadcrumb}

            {selectedItem.description && (
              <p className="section-description">{selectedItem.description}</p>
            )}
            <Accordion
              defaultActiveKey="default"
              className={showUpdate ? undefined : "viewer-accordion"}
            >
              {isMobile && <ThemedToastContainer />}
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
                    className= { 
                      selectedItem != null && selectedItem.category == category
                        ? " active"
                        : ""
                    }
                    id={category.videoTitle}
                  >
                    {showUpdate ? (
                      <div className="d-flex align-items-center justify-content-between w-100">
                        <h5 className="mt-0 mb-1 accordion-title">{category.videoTitle}</h5>
                        <a
                          onClick={(e) => {
                            e.stopPropagation(); //   prevent accordion toggle
                            fetchDataForDelete(category.videoTitle);
                          }}
                          variant="primary"
                          className="button-container mt-3  "
                        >
                          Update video
                        </a>
                      </div>
                    ) : (
                      <span className="pl-head">
                        <span className="pl-icon" aria-hidden="true">
                          <FaListUl />
                        </span>
                        <span className="pl-text">
                          <span className="pl-title">{category.videoTitle}</span>
                          <span className="pl-count">
                            {visibleVideos(category, false).length}{" "}
                            {visibleVideos(category, false).length === 1
                              ? "video"
                              : "videos"}
                          </span>
                        </span>
                        {category.videoTutorials.some(
                          (v) => v.filePath === videoUrl,
                        ) && (
                          <span className="pl-live">
                            <span className="eq" aria-hidden="true">
                              <i />
                              <i />
                              <i />
                            </span>
                            Playing
                          </span>
                        )}
                      </span>
                    )}
                  </Accordion.Header>

                  <Accordion.Body  >
                    <div className="video-list w-100">
                      {visibleVideos(category, showUpdate).map(
                        (thumbnail, index) => (
                          <div
                            key={index}
                            className={`video-item${
                              thumbnail.filePath === videoUrl
                                ? " is-playing"
                                : ""
                            }`}
                          >
                            {/* Viewers see a numbered playlist; the number
                                becomes an equalizer on the playing row. */}
                            {!showUpdate && (
                              <span className="video-index" aria-hidden="true">
                                {thumbnail.filePath === videoUrl ? (
                                  <span className="eq">
                                    <i />
                                    <i />
                                    <i />
                                  </span>
                                ) : (
                                  index + 1
                                )}
                              </span>
                            )}
                            <div
                              className="thumb-wrap"
                              onClick={() =>
                                playVideo(thumbnail.filePath, thumbnail.subTitle, {
                                  id: thumbnail.id,
                                  isPrivate: thumbnail.isPrivate,
                                  description: category.description,
                                })
                              }
                            >
                              {thumbnail.thumbnailName != null ? (
                                <img
                                  src={`${thumbnail.thumbnailPath}/${thumbnail.thumbnailName}`}
                                  alt={thumbnail.thumbnailName}
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

                            <div
                              className="video-details"
                              onClick={() =>
                                playVideo(
                                  thumbnail.filePath,
                                  thumbnail.subTitle,
                                  {
                                    id: thumbnail.id,
                                    isPrivate: thumbnail.isPrivate,
                                    description: category.description,
                                  },
                                )
                              }
                            >
                              <h2>{thumbnail.subTitle}</h2>
                              {/* <p>{}</p> */}
                              {thumbnail.videoStatus && (
                                <div className="new-container">
                                  {thumbnail.videoStatus ?? ""}
                                </div>
                              )}
                              <div className="thumbnail-overlay">
                                {showUpdate && (
                                  <a
                                    href={thumbnail.filePath} // or thumbnail.videoUrl / filePath
                                    download
                                    className="btn btn-success btn-sm"
                                    onClick={(e) => e.stopPropagation()} // prevents accordion toggle
                                  >
                                    Download
                                  </a>
                                )}
                                {showUpdate && (
                                  <>
                                    <a
                                      onClick={() =>
                                        handleVideoDelete(thumbnail.id)
                                      }
                                      variant="primary"
                                      className="btn btn-danger btn-sm"
                                      rel="noopener noreferrer"
                                    >
                                      Delete
                                    </a>
                                    {loading[thumbnail.id] && (
                                      <span>
                                        <div className="loading-spinner"></div>
                                      </span>
                                    )}
                                  </>
                                )}

                                {/* Viewers share from the Now Playing card;
                                    the per-row button is only for the
                                    "Your videos" management page. */}
                                {showUpdate && (
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
                                    title={
                                      thumbnail.isPrivate === true
                                        ? "Private video"
                                        : "Copy share link"
                                    }
                                    aria-label={
                                      thumbnail.isPrivate === true
                                        ? "Private video"
                                        : "Copy share link"
                                    }
                                  >
                                    <FaShareAlt style={styles.icon} />{" "}
                                  </button>
                                )}
                                {showUpdate && copied && (
                                  <span style={styles.copiedMessage}>
                                    Video Link Copied!
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ),
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
    justifyContent: "center",
    backgroundImage: "linear-gradient(135deg, #ff9d00, #e07b00)",
    border: "none",
    color: "white",
    width: "34px",
    height: "34px",
    fontSize: "14px",
    borderRadius: "999px",
    cursor: "pointer",
    boxShadow: "0 4px 12px -6px rgba(224, 123, 0, 0.6)",
  },
  disabledButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    color: "white",
    width: "34px",
    height: "34px",
    fontSize: "14px",
    borderRadius: "999px",
    cursor: "not-allowed",
    backgroundColor: "#c7c7d1",
  },
  icon: {
    marginRight: "0px",
  },
  copiedMessage: {
    marginLeft: "10px",
    color: "#1c8a3d",
    fontWeight: 600,
  },
};

export default ThumbnailGrid;
