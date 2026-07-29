import type { ReactNode } from "react";
import { Modal } from "react-bootstrap";
import "../Assets/Css/RightSideModal.css";

interface RightSideModalProps {
  show: boolean;
  handleClose: () => void;
  children: ReactNode;
}

const RightSideModal = ({ show, handleClose, children }: RightSideModalProps) => {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="right-slide-modal"
      centered
      animation={false}
    >
      <Modal.Body>
        <i
          className="fas fa-close"
          onClick={handleClose}
          style={{
            padding: "20px",
            alignContent: "flex-end",
            display: "flex",
            justifyContent: "end",
          }}
        ></i>
        {children}
      </Modal.Body>
    </Modal>
  );
};

export default RightSideModal;
