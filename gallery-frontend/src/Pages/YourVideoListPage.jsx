import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import CategoryAccordion from "../Components/category/CategoryAccordion";
import { category } from "../data/category";
import { mobileCategory } from "../data/mobile_category";

import ThumbnailGrid from "../Components/category/ThumbnailGrid";
import Header from "../Components/Header";
import RightSideModal from "../Components/RightSideModal";
import { getHeaders } from "../services/auth";
import axios from "axios";
import { getAllJobTutorials } from "../config/config";

const YourVideoListsPage = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const [data, setData] = useState([]);
  const [videoType, setVideoType] = useState("web");

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  useEffect(() => {
    // fetchData();
    setData(category);
  }, []);

  // const fetchData = () => {
  //   axios
  //     .get(getAllJobTutorials, {
  //       headers: getHeaders(),
  //     })
  //     .then((response) => {
  //       setData(response.data);
  //       // console.log(response.data);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching data:", error);
  //     });
  // };

  const handleVideoTypeChange = (e) => {
    const selectedType = e.target.value;

    if (selectedType != undefined) {
      if (selectedType == "web") {
        setData(category);
      } else {
        setData(mobileCategory);
      }

      // var videoTitle = selectedType === "web" ? "Dashboard" : "Driver Portal";
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setSelectedItem(null);
      setVideoType(selectedType);
    }
  };

  return (
    <>
      <div className="mt-5 mb-5 container-fluid" style={{ minHeight: "100vh" }}>
        {/* <a
          href="/add/video"
          variant="primary"
          className="button-container mt-3  "
        >
          Upload video
        </a> */}
        <Form.Group className="mt-3">
          <Form.Label>Select a video type</Form.Label>
          <Form.Control
            placeholder="videoType"
            as="select"
            value={videoType}
            onChange={handleVideoTypeChange}
            id="videoType"
            required
          >
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
          </Form.Control>

          <Form.Control.Feedback type="invalid">
            Please Select a video Type
          </Form.Control.Feedback>
        </Form.Group>
        <h1 className="heading3 mb-3 mt-5">Your videos</h1>
        <Row>
          <Col md={3} className="hide-container">
            {/* hides if mobile */}
            <CategoryAccordion
              // yourVideosData={data}
              data={data}
              setSelectedItem={setSelectedItem}
              modalClose={handleClose}
              videoType={videoType}
              setCategorySelected={setSelectedCategory}
              setSelectedSubCategory={setSelectedSubCategory}
            />
          </Col>
          <Col md={9}>
            <div className="output">
              <ThumbnailGrid
                selectedItem={selectedItem}
                // yourVideosData={data}
                videoType={videoType}
                handleShow={handleShow}
                showUpdate={true}
                selectedCategory={selectedCategory}
                selectedSubCategory={selectedSubCategory}
              />
            </div>
          </Col>
        </Row>
        <RightSideModal show={showModal} handleClose={handleClose}>
          <CategoryAccordion
            // yourVideosData={data}
            data={data}
            setSelectedItem={setSelectedItem}
            modalClose={handleClose}
            videoType={videoType}
            setCategorySelected={setSelectedCategory}
            setSelectedSubCategory={setSelectedSubCategory}
          />
        </RightSideModal>
      </div>
    </>
  );
};

export default YourVideoListsPage;
