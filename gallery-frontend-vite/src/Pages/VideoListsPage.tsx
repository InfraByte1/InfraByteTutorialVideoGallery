import { useState } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import CategoryAccordion from "../Components/category/CategoryAccordion";
import ThumbnailGrid from "../Components/category/ThumbnailGrid";
import Header from "../Components/Header";
import RightSideModal from "../Components/RightSideModal";
import { category } from "../data/category";
import { mobileCategory } from "../data/mobileCategory";
import type { SelectedCategoryDetail } from "../types/videoBrowse";

const VideoListsPage = () => {
  const { videoType } = useParams<{ videoType: string }>();
  const categories = videoType === "mobile" ? mobileCategory : category;

  const [selectedItem, setSelectedItem] = useState<SelectedCategoryDetail | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <>
      <Header />
      <Container className="mt-5 mb-5" style={{ minHeight: "100vh" }}>
        <Row>
          <Col md={3} className="hide-container">
            <CategoryAccordion
              data={categories}
              setSelectedItem={setSelectedItem}
              modalClose={handleClose}
              videoType={videoType}
            />
          </Col>
          <Col md={9}>
            <div className="output">
              <ThumbnailGrid selectedItem={selectedItem} handleShow={handleShow} videoType={videoType} />
            </div>
          </Col>
        </Row>

        {showModal && (
          <RightSideModal show={showModal} handleClose={handleClose}>
            <CategoryAccordion
              data={categories}
              setSelectedItem={setSelectedItem}
              modalClose={handleClose}
              videoType={videoType}
            />
          </RightSideModal>
        )}
      </Container>
    </>
  );
};

export default VideoListsPage;
