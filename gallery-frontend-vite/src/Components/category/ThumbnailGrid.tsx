import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { Accordion, Button } from "react-bootstrap";
import axios from "axios";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";
import { FaShareAlt } from "react-icons/fa";
import "../../Assets/Css/ThumbnailGrid.css";
import noThumbnail from "../../Assets/images/no_thumbnail.svg";
import { config, deleteVideoTutorial, getJobTutorialsByCategorySubCategoryTitle } from "../../config/config";
import { getHeaders, getToken } from "../../services/auth";
import { getErrorMessage } from "../../utils/converters";
import type { SelectedCategoryDetail, VideoTutorialEntry } from "../../types/videoBrowse";

interface VideoPlayerProps {
  videoUrl: string;
  videoTitle: string;
}

const VideoPlayer = ({ videoUrl, videoTitle }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [, setCanSeek] = useState(false);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (videoEl && videoUrl) {
      videoEl.pause();
      videoEl.currentTime = 0;
      videoEl.src = videoUrl;
      videoEl.load();
      videoEl.play().catch(() => {});
    }
    return () => {
      if (videoEl) {
        videoEl.pause();
        videoEl.src = "";
      }
    };
  }, [videoUrl]);

  const handleSeeking = () => {};
  const handleSeeked = () => {};
  const handleError = () => {};

  const handleLoadedMetadata = () => {
    if (videoRef.current && isNaN(videoRef.current.duration)) {
      toast.warn("Video metadata incomplete, seeking may fail. Consider re-encoding the video.");
    } else {
      setCanSeek(true);
    }
  };

  // On stall, reload and resume — cheap recovery for a mid-stream network hiccup.
  const handleStalled = () => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch((err) => console.error("Replay failed:", err));
    }
  };

  const handleProgress = () => {
    const videoEl = videoRef.current;
    if (videoEl && videoEl.buffered.length > 0) {
      const bufferedEnd = videoEl.buffered.end(videoEl.buffered.length - 1);
      if (bufferedEnd > videoEl.currentTime) {
        setCanSeek(true);
      }
    }
  };

  return (
    <>
      <div className="video-player">
        <video
          ref={videoRef}
          key={videoUrl || "empty"}
          controls
          autoPlay
          muted
          preload="metadata"
          onSeeking={handleSeeking}
          onSeeked={handleSeeked}
          onError={handleError}
          onLoadedMetadata={handleLoadedMetadata}
          onStalled={handleStalled}
          onProgress={handleProgress}
        >
          {videoUrl && <source src={videoUrl} type="video/mp4" />}
          Your browser does not support the video tag.
        </video>
      </div>
      {videoTitle && (
        <div className="mx-3 mt-3 p-3 rounded bg-light border">
          <div className="text-uppercase text-muted small mb-1">Now Playing</div>
          <div className="fw-semibold text-truncate">{videoTitle}</div>
        </div>
      )}
    </>
  );
};

interface ThumbnailProps {
  thumbnail: VideoTutorialEntry;
  playVideo: (url: string, title: string) => void;
  copyUrlToClipboard: (videoId: string) => void;
  handleVideoDelete: (videoId: string) => void;
  loading?: boolean;
}

const Thumbnail = ({ thumbnail, playVideo, copyUrlToClipboard, handleVideoDelete }: ThumbnailProps) => {
  return (
    <div className="thumbnail-container">
      <div className="thumbnail-item">
        {thumbnail.thumbnailName ? (
          <img
            src={thumbnail.thumbnailPath ?? undefined}
            alt={thumbnail.title}
            className="thumbnail-image"
            onClick={() => playVideo(thumbnail.filePath, thumbnail.title ?? "")}
          />
        ) : (
          <video
            src={thumbnail.filePath}
            className="thumbnail-image"
            onClick={() => playVideo(thumbnail.filePath, thumbnail.title ?? "")}
            muted
          />
        )}
        <div className="thumbnail-overlay">
          <button
            type="button"
            className="mt-3 btn btn-danger"
            onClick={() => handleVideoDelete(thumbnail.id)}
          >
            Delete
          </button>
        </div>
      </div>
      <h2 className="thumbnail-title" onClick={() => playVideo(thumbnail.filePath, thumbnail.title ?? "")}>
        {thumbnail.title}
      </h2>
      {thumbnail.videoStatus && <div className="new-container">{thumbnail.videoStatus}</div>}
      <div className="thumbnail-overlay">
        <Button
          onClick={thumbnail.isPrivate ? undefined : () => copyUrlToClipboard(thumbnail.id)}
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

interface ThumbnailGridProps {
  selectedItem: SelectedCategoryDetail | null;
  handleShow: () => void;
  videoType?: string;
  yourVideosData?: boolean;
  showUpdate?: boolean;
  selectedCategory?: string | null;
  selectedSubCategory?: string | null;
}

const ThumbnailGrid = ({
  selectedItem,
  videoType,
  yourVideosData,
  showUpdate,
  selectedCategory,
  selectedSubCategory,
}: ThumbnailGridProps) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [loadingData, setLoadingData] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  const navigate = useNavigate();

  const copyUrlToClipboard = useCallback(
    (videoId: string) => {
      if (!videoId || loading[videoId]) return;
      const encrypted = CryptoJS.AES.encrypt(videoId, config.secretCrypt).toString();
      const url = `${config.hostUrl}/video/${encodeURIComponent(encrypted)}`;
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopied(true);
          toast.success("Video link copied!");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(() => toast.error("Failed to copy link"));
    },
    [loading]
  );

  const playVideo = useCallback((url: string, title: string) => {
    setVideoUrl(url);
    setVideoTitle(title);
    toast.info(`Now Playing: ${title}`);
  }, []);

  const handleVideoDelete = useCallback(
    async (videoId: string) => {
      setLoading((prev) => ({ ...prev, [videoId]: true }));
      try {
        const response = await axios.delete(`${deleteVideoTutorial}/${videoId}`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${getToken()}` },
        });
        if (response.status === 200) {
          toast.success("Video deleted successfully");
          navigate(0);
        }
      } catch (err) {
        toast.error(`Failed to delete video: ${getErrorMessage(err)}`);
      } finally {
        setLoading((prev) => ({ ...prev, [videoId]: false }));
      }
    },
    [navigate]
  );

  const fetchDataForDelete = useCallback(
    async (selectedTitle: string) => {
      setLoadingData(true);
      try {
        const defaultCategoryName = videoType === "web" ? "Dashboard" : "Driver Portal";
        const response = await axios.post(
          getJobTutorialsByCategorySubCategoryTitle,
          {
            category: selectedCategory ?? defaultCategoryName,
            subCategory: selectedSubCategory ?? defaultCategoryName,
            videoType,
            videoTitle: selectedTitle,
          },
          { headers: getHeaders() }
        );
        navigate(`/edit/video/${videoType}`, { state: response.data });
        toast.success("Video data fetched successfully");
      } catch (err) {
        toast.error(`Failed to fetch video data: ${getErrorMessage(err)}`);
      } finally {
        setLoadingData(false);
      }
    },
    [navigate, selectedCategory, selectedSubCategory, videoType]
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 769);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setVideoUrl("");
    setVideoTitle("");
  }, [selectedItem]);

  return (
    <>
      <VideoPlayer videoUrl={videoUrl} videoTitle={videoTitle} />

      <div className={`thumbnail-grid ${isMobile ? "mobile-list" : ""}`}>
        {!selectedItem && <p>Welcome to InfraByte {videoType} video tutorial. </p>}
        {selectedItem && (
          <>
            {yourVideosData && selectedItem.videoTutorials && (
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
                        loading={loading[thumbnail.id]}
                      />
                    ))}
                  </div>
                </center>
              </>
            )}

            <div className="mt-0 mb-2 d-flex align-items-center flex-wrap gap-2">
              <span className="badge rounded-pill bg-secondary">{selectedItem.category}</span>
              {selectedItem.subCategory && selectedItem.subCategory !== selectedItem.category && (
                <>
                  <i className="fa-solid fa-chevron-right text-muted small"></i>
                  <span className="badge rounded-pill bg-info text-dark">{selectedItem.subCategory}</span>
                </>
              )}
            </div>

            <h6 className="text-muted mb-3">{selectedItem.description}</h6>

            {selectedItem.subCategories && (
              <Accordion defaultActiveKey="default">
                {loadingData && (
                  <span>
                    <div className="loading-spinner"></div>
                  </span>
                )}
                {selectedItem.subCategories.map((subCategoryDetail) => (
                  <Accordion.Item eventKey={subCategoryDetail.videoTitle ?? ""} key={subCategoryDetail.videoTitle}>
                    <Accordion.Header id={subCategoryDetail.videoTitle}>
                      <div className="d-flex align-items-center justify-content-between w-100">
                        <h5 className="mt-0 mb-1 accordion-title">{subCategoryDetail.videoTitle}</h5>
                        {showUpdate && (
                          <a
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchDataForDelete(subCategoryDetail.videoTitle ?? "");
                            }}
                            className="button-container mt-3"
                          >
                            Update video
                          </a>
                        )}
                      </div>
                    </Accordion.Header>

                    <Accordion.Body>
                      <h6 className="mt-0 mb-3 mx-2">
                        {subCategoryDetail.description === "null" ? "" : subCategoryDetail.description}
                      </h6>
                      <div className="video-list w-100">
                        {subCategoryDetail.videoTutorials.map((thumbnail, index) =>
                          !showUpdate && thumbnail.isPrivate ? null : (
                            <div key={index} className="video-item">
                              {thumbnail.thumbnailName ? (
                                <img
                                  src={`${thumbnail.thumbnailPath}/${thumbnail.thumbnailName}`}
                                  alt={thumbnail.thumbnailName}
                                  className="thumbnail"
                                  onClick={() => playVideo(thumbnail.filePath, thumbnail.subTitle ?? "")}
                                />
                              ) : (
                                <img
                                  src={noThumbnail}
                                  alt="No image"
                                  className="thumbnail "
                                  onClick={() => playVideo(thumbnail.filePath, thumbnail.subTitle ?? "")}
                                />
                              )}

                              <div
                                className="video-details"
                                onClick={() => playVideo(thumbnail.filePath, thumbnail.subTitle ?? "")}
                              >
                                <h2>{thumbnail.subTitle}</h2>
                                {thumbnail.videoStatus && (
                                  <div className="new-container">{thumbnail.videoStatus}</div>
                                )}
                                {showUpdate && (
                                  <a
                                    href={thumbnail.filePath}
                                    download
                                    className="btn btn-success btn-sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    Download
                                  </a>
                                )}
                                <div className="thumbnail-overlay">
                                  {showUpdate && (
                                    <>
                                      <a
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleVideoDelete(thumbnail.id);
                                        }}
                                        className="mt-3 btn btn-danger"
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

                                  <button
                                    type="button"
                                    onClick={
                                      thumbnail.isPrivate
                                        ? undefined
                                        : (e) => {
                                            e.stopPropagation();
                                            copyUrlToClipboard(thumbnail.id);
                                          }
                                    }
                                    disabled={thumbnail.isPrivate}
                                    style={thumbnail.isPrivate ? styles.disabledButton : styles.shareButton}
                                  >
                                    <FaShareAlt style={styles.icon} />
                                  </button>
                                  {copied && <span style={styles.copiedMessage}>Video Link Copied!</span>}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            )}
          </>
        )}
      </div>
    </>
  );
};

const styles: Record<string, CSSProperties> = {
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
