import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import "../../Assets/Css/ThumbnailGrid.css";
import PlayButtonOverlay from "./PlayButtonOverlay";
import type { CategoryItem } from "../../types/category";

interface ThumbnailGridProps {
  selectedItem: CategoryItem | null;
  handleShow: () => void;
}

const ThumbnailGrid = ({ selectedItem, handleShow }: ThumbnailGridProps) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  const playVideo = (url?: string) => {
    setVideoUrl(url ?? "");
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
                    <PlayButtonOverlay onClick={() => playVideo(thumbnail.videoUrl)} />
                  </div>
                ))}
              </div>
            </center>
          </>
        )}
      </div>
    </>
  );
};

export default ThumbnailGrid;
