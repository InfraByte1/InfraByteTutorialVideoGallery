import React, { useEffect, useState } from "react";
import PlayButtonOverlay from "./PlayButtonOverlay";
import { Accordion, Button, Container, Modal } from "react-bootstrap";
import noThumbnail from "../../Assets/images/no_thumbnail.jpg";
import { FaShareAlt } from "react-icons/fa";
import CryptoJS from "crypto-js";

import "../../Assets/Css/ThumbnailGrid.css";
import { deleteOneVideo } from "../../services/video";
import {
  deleteVideoTutorial,
  getJobTutorialsByCategorySubCategoryTitle,
  oidcConfig,
} from "../../config/config";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getHeaders } from "../../services/auth";

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [videoTitle, setVideoTitle] = useState("");

  const [copied, setCopied] = useState(false);

  const copyUrlToClipboard = (videoId) => {
    if (!videoId) return;
    if (!loading) {
      const encrypted = CryptoJS.AES.encrypt(
        videoId,
        oidcConfig.secretCrypt
      ).toString();
      const urlSafeEncryptedUrl = encodeURIComponent(encrypted);

      const url = `${oidcConfig.hostUrl}/video/${urlSafeEncryptedUrl}`;
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy the text to clipboard: ", err);
        });
    }
  };

  const navigate = useNavigate();

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

  const handleVideoDelete = async (videoId) => {
    setLoading(true);

    var deleteVideoApi = `${deleteVideoTutorial}/${videoId}`;
    try {
      var token = localStorage.getItem("token");

      const response = await axios.delete(deleteVideoApi, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,

          "Access-Control-Allow-Origin": oidcConfig.hostUrl,
        },
      });
      if (response) {
        toast.info("Your video is deleted");
      }
      navigate(0);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Delete failed:", err);
    }
    setLoading(false);
  };

  const fetchDataForDelete = async (selectedTitle) => {
    setLoadingData(true);
    var fetchDataForUpdate = `${getJobTutorialsByCategorySubCategoryTitle}`;
    try {
      var token = localStorage.getItem("token");
      var reqData = {
        category:
          selectedCategory ??
          (videoType === "web" ? "Dashboard" : "Driver Portal"),
        subCategory:
          selectedSubCategory ??
          (videoType === "web" ? "Dashboard" : "Driver Portal"),
        videoType: videoType,
        videoTitle: selectedTitle,
      };

      const response = await axios.post(fetchDataForUpdate, reqData, {
        headers: getHeaders(),
      });
      if (response) {
        navigate(`/edit/video/${videoType}`, { state: response.data });
        toast.info("Your video is fetched");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("fetch failed:", err);
    }
    setLoadingData(false);
  };

  return (
    <>
      <ToastContainer />
      <div className="video-player">
        <video controls autoPlay key={videoUrl}>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      {videoTitle && <h5 className="p-3">Now Playing: {videoTitle}</h5>}

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
                      <div className="thumbnail-container" key={index}>
                        <div key={index} className="thumbnail-item">
                          {thumbnail.thumbnailName != null ? (
                            <img
                              src={thumbnail.thumbnailPath}
                              alt={thumbnail.fileName}
                              className="thumbnail-image "
                              onClick={() =>
                                playVideo(thumbnail.filePath, thumbnail.title)
                              }
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
                              onClick={() =>
                                playVideo(thumbnail.filePath, thumbnail.title)
                              }
                            ></video>
                          )}
                          <div className="thumbnail-overlay">
                            <a
                              href="/add/video"
                              variant="primary"
                              className="mt-3 btn  btn-danger"
                            >
                              Delete
                            </a>
                          </div>
                          <PlayButtonOverlay />
                        </div>
                        <h2
                          className="thumbnail-title"
                          onClick={() =>
                            playVideo(thumbnail.filePath, thumbnail.title)
                          }
                        >
                          {thumbnail.title}
                        </h2>
                        {thumbnail.videoStatus && (
                          <div className="new-container">
                            {thumbnail.videoStatus ?? ""}
                          </div>
                        )}

                        <div className="thumbnail-overlay ">
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
    cursor: "pointer",
    marginTop: "8px",
    backgroundColor: "red",
  },
  icon: {
    marginRight: "0px",
  },
  copiedMessage: {
    marginLeft: "00px",
    color: "green",
  },
};

export default ThumbnailGrid;
