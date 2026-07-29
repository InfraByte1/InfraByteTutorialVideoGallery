import React, { useEffect, useState } from "react";
import "../../Assets/Css/ThumbnailGrid.css";
import PlayButtonOverlay from "./PlayButtonOverlay";
import { Button, Container, Modal } from "react-bootstrap";

const ThumbnailGrid = ({ selectedItem, handleShow }) => {
  const [showModal, setShowModal] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  const playVideo = (url) => {
    setVideoUrl(url);
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

  return (
    <>
      <div className="video-player">
        <video controls autoPlay key={videoUrl}>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
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
        {selectedItem && (
          <>
            <h3 className="mt-5 mb-3">{selectedItem.title}</h3>
            <center>
              <div className="thumbnails">
                {selectedItem.thumbnails.map((thumbnail, index) => (
                  <div key={index} className="thumbnail-item">
                    <img
                      src={thumbnail.url}
                      alt={thumbnail.title}
                      className="thumbnail-image"
                      onClick={() => playVideo(thumbnail.videoUrl)}
                    />
                    <div className="thumbnail-overlay">
                      <span className="thumbnail-title">{thumbnail.title}</span>
                    </div>
                    <PlayButtonOverlay
                      onClick={() => playVideo(thumbnail.videoUrl)}
                    />
                  </div>
                ))}
              </div>
            </center>
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

export default ThumbnailGrid;
