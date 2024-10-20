import React, { useEffect, useState } from "react";
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
  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
  const { videoType } = useParams();
  var [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (videoType != undefined) {
        if (videoType == "web") {
          setData(category);
        } else {
          setData(mobileCategory);
        }
      }
    } catch (err) {
      toast.info(err.message);
    }
  };

  return (
    <>
      <div className="mt-5 mb-5 container-fluid" style={{ minHeight: "100vh" }}>
        <Row>
          <Col md={3} className="hide-container">
            <CategoryAccordion
              data={data}
              setSelectedItem={setSelectedItem}
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
            setSelectedItem={setSelectedItem}
            modalClose={handleClose}
            videoType={videoType}
          />
        </RightSideModal>
      </div>
    </>
  );
};

export default VideoListsPage;
