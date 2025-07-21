import React, { useEffect, useState, useCallback } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import CategoryAccordion from "../Components/category/CategoryAccordion";
import { category } from "../data/category";
import { mobileCategory } from "../data/mobile_category";

import ThumbnailGrid from "../Components/category/ThumbnailGrid";
import Header from "../Components/Header";
import RightSideModal from "../Components/RightSideModal";
import axios from "axios";
import { getAllJobTutorials } from "../config/config";
import { getHeaders } from "../services/auth";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import noThumbnail from "../Assets/images/no_thumbnail.jpg";
import PlayButtonOverlay from "../Components/category/PlayButtonOverlay";

const VideoListsPage = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const { videoType } = useParams();

  // Memoize handleShow and handleClose to prevent unnecessary re-renders
  const handleShow = useCallback(() => setShowModal(true), []);
  const handleClose = useCallback(() => setShowModal(false), []);

  useEffect(() => {
    fetchData();
  }, [videoType]); // Add videoType as dependency to refetch if it changes

  const fetchData = async () => {
    try {
      if (videoType) {
        if (videoType === "web") {
          setData(category);
        } else if (videoType === "mobile") {
          setData(mobileCategory);
        } else {
          throw new Error("Invalid videoType");
        }
        // Optional: Uncomment to enable dynamic fetching
        /*
        const response = await axios.get(getAllJobTutorials, {
          headers: getHeaders(),
          params: { videoType },
        });
        setData(response.data);
        */
        // Validate data
        if (data.length > 0) {
          data.forEach((item) => {
            if (item.videoTutorials) {
              item.videoTutorials.forEach((video) => {
                if (!video.filePath || !video.filePath.endsWith(".mp4")) {
                  console.warn("Invalid video URL:", video.filePath);
                  toast.warn(`Invalid video URL for ${video.title || "video"}`);
                }
              });
            }
          });
        }
      } else {
        throw new Error("videoType is undefined");
      }
    } catch (err) {
      console.error("Fetch data error:", err);
      toast.error(`Failed to load videos: ${err.message}`);
    }
  };

  // Memoize setSelectedItem to prevent unnecessary re-renders
  const handleSetSelectedItem = useCallback((item) => {
    setSelectedItem(item);
  }, []);

  return (
    <>
      <div className="mt-5 mb-5 container-fluid" style={{ minHeight: "100vh" }}>
        <Row>
          <Col md={3} className="hide-container">
            <CategoryAccordion
              data={data}
              setSelectedItem={handleSetSelectedItem}
              modalClose={handleClose}
              videoType={videoType}
            />
          </Col>

          <Col md={9}>
            <div className="output">
              <ThumbnailGrid
                selectedItem={selectedItem}
                handleShow={handleShow}
                showUpdate={false}
                videoType={videoType}
              />
            </div>
          </Col>
        </Row>
        {/* <div key={1} className="video-item" onClick={() => {}}>
                          
                          
                                <img
                                  src={noThumbnail}
                                  alt="No image"
                                  className="thumbnail "
                                  // onClick={() => playVideo(thumbnail.filePath)}
                                />  
                          
                          
                          <div className="video-details">
                            <h2>{'sdafsdafasdfasdf'}</h2>
                            <div className="new-container">
                            
                            New
                            </div> 
                          </div>
                        </div> */}

        <RightSideModal show={showModal} handleClose={handleClose}>
          <CategoryAccordion
            data={data}
            setSelectedItem={handleSetSelectedItem}
            modalClose={handleClose}
            videoType={videoType}
          />
        </RightSideModal>
      </div>
    </>
  );
};

export default VideoListsPage;