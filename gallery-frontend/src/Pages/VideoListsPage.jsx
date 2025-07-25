import React, { useEffect, useState, useCallback } from "react";
import { Container, Row, Col } from "react-bootstrap";
import CategoryAccordion from "../Components/category/CategoryAccordion";
import ThumbnailGrid from "../Components/category/ThumbnailGrid";
import RightSideModal from "../Components/RightSideModal";
import axios from "axios";
import { getAllJobTutorials } from "../config/config";
import { getHeaders } from "../services/auth";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import noThumbnail from "../Assets/images/no_thumbnail.jpg";
import { usePermissions } from "../contexts/PermissionContext";

const VideoListsPage = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const { videoType } = useParams();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);
  const { filteredWebCategories, filteredMobileCategories, isLoaded, error } =
    usePermissions();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 769);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleShow = useCallback((e) => {
    e.stopPropagation();
    setShowModal(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [videoType, filteredWebCategories, filteredMobileCategories, isLoaded]);

  const fetchData = async () => {
    try {
      if (!isLoaded) {
        // throw new Error("Permissions are still loading");
      }

      if (error) {
        throw new Error(`Permission error: ${error}`);
      }

      let newData = [];
      if (videoType) {
        if (videoType === "web") {
          newData = filteredWebCategories;
        } else if (videoType === "mobile") {
          newData = filteredMobileCategories;
        } else {
          throw new Error("Invalid videoType");
        }

        setData(newData);
        // Reset selectedItem when data changes or is empty
        if (newData.length === 0) {
          // console.log(`Resetting selectedItem: videoType=${videoType}, data is empty`);
          setSelectedItem(null);
        }

        // console.log("filteredWebCategories:", filteredWebCategories);
        // console.log("filteredMobileCategories:", filteredMobileCategories);
        // console.log("setData:", newData);

        // Validate data
        if (newData.length > 0) {
          newData.forEach((item) => {
            if (item.subcategories) {
              item.subcategories.forEach((subcat) => {
                subcat.items.forEach((subItem) => {
                  // console.log(`Processing item: ${subItem.title}, categoryKey: ${subItem.categoryKey}`);
                  if (subItem.thumbnails) {
                    subItem.thumbnails.forEach((thumbnail) => {
                      if (
                        thumbnail.videoUrl &&
                        !thumbnail.videoUrl.endsWith(".mp4")
                      ) {
                        toast.warn(
                          `Invalid video URL for ${thumbnail.title || "video"}`
                        );
                      }
                    });
                  }
                });
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
      setData([]);
      setSelectedItem(null);
    }
  };

  const handleSetSelectedItem = useCallback((item) => {
    // console.log("handleSetSelectedItem called with:", item);
    setSelectedItem(item);
  }, []);

  return (
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

      {isMobile && (
        <center>
          <Container
            onClick={handleShow}
            style={{
              backgroundColor: "gray",
              padding: "10px",
              color: "white",
              cursor: "pointer",
            }}
          >
            <i className="fas fa-eye"></i> Show Video List
          </Container>
        </center>
      )}

      <RightSideModal show={showModal} handleClose={handleClose}>
        <CategoryAccordion
          data={data}
          setSelectedItem={handleSetSelectedItem}
          modalClose={handleClose}
          videoType={videoType}
        />
      </RightSideModal>
    </div>
  );
};

export default VideoListsPage;