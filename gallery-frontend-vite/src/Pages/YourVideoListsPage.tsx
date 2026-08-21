import { useEffect, useState, type ChangeEvent } from "react";
import { Row, Col, Form } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import CategoryAccordion from "../Components/category/CategoryAccordion";
import ThumbnailGrid from "../Components/category/ThumbnailGrid";
import RightSideModal from "../Components/RightSideModal";
import { category } from "../data/category";
import { mobileCategory } from "../data/mobileCategory";
import { getAllJobTutorials } from "../config/config";
import { getHeaders } from "../services/auth";
import { getErrorMessage } from "../utils/converters";
import type { Category } from "../types/category";
import type { VideoType } from "../types/videoForm";
import type { SelectedCategoryDetail, YourVideosCategoryGroup } from "../types/videoBrowse";

const YourVideoListsPage = () => {
  const [selectedItem, setSelectedItem] = useState<SelectedCategoryDetail | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const [data, setData] = useState<Category[]>(category);
  const [videoType, setVideoType] = useState<VideoType>("web");

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const [yourVideosData, setYourVideosData] = useState<YourVideosCategoryGroup[] | null>(null);

  useEffect(() => {
    const fetchYourVideos = async () => {
      try {
        const response = await axios.get<YourVideosCategoryGroup[]>(getAllJobTutorials, {
          headers: getHeaders(),
        });
        setYourVideosData(response.data);
      } catch (err) {
        toast.error(`Failed to load your videos: ${getErrorMessage(err)}`);
      }
    };
    fetchYourVideos();
  }, []);

  const handleVideoTypeChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const selectedType = e.target.value as VideoType;

    setData(selectedType === "web" ? category : mobileCategory);
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setSelectedItem(null);
    setVideoType(selectedType);
  };

  return (
    <div className="mt-3 mb-5 container-fluid" style={{ minHeight: "100vh" }}>
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
      </Form.Group>
      <h1 className="heading3 mb-3 mt-5">Your videos</h1>
      <Row>
        <Col md={3} className="hide-container">
          <CategoryAccordion
            data={data}
            yourVideosData={yourVideosData ?? undefined}
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
              videoType={videoType}
              handleShow={handleShow}
              showUpdate
              yourVideosData={yourVideosData != null}
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
            />
          </div>
        </Col>
      </Row>
      {showModal && (
        <RightSideModal show={showModal} handleClose={handleClose}>
          <CategoryAccordion
            data={data}
            yourVideosData={yourVideosData ?? undefined}
            setSelectedItem={setSelectedItem}
            modalClose={handleClose}
            videoType={videoType}
            setCategorySelected={setSelectedCategory}
            setSelectedSubCategory={setSelectedSubCategory}
          />
        </RightSideModal>
      )}
    </div>
  );
};

export default YourVideoListsPage;
