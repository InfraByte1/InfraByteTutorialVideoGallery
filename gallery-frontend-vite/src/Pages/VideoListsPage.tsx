import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import CategoryAccordion from "../Components/category/CategoryAccordion";
import ThumbnailGrid from "../Components/category/ThumbnailGrid";
import Header from "../Components/Header";
import RightSideModal from "../Components/RightSideModal";
import { category } from "../data/category";
import type { CategoryItem } from "../types/category";

const VideoListsPage = () => {
  const [selectedItem, setSelectedItem] = useState<CategoryItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  return (
    <>
      <Header />
      <Container className="mt-5 mb-5" style={{ minHeight: "100vh" }}>
        <Row>
          <Col md={3} className="hide-container">
            <CategoryAccordion data={category} setSelectedItem={setSelectedItem} modalClose={handleClose} />
          </Col>
          <Col md={9}>
            <div className="output">
              <ThumbnailGrid selectedItem={selectedItem} handleShow={handleShow} />
            </div>
          </Col>
        </Row>

        <RightSideModal show={showModal} handleClose={handleClose}>
          <CategoryAccordion data={category} setSelectedItem={setSelectedItem} modalClose={handleClose} />
        </RightSideModal>
      </Container>
    </>
  );
};

export default VideoListsPage;
