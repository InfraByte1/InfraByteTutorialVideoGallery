import "../../Assets/Css/PlayButtonOverlay.css";

interface PlayButtonOverlayProps {
  onClick: () => void;
}

const PlayButtonOverlay = ({ onClick }: PlayButtonOverlayProps) => {
  return (
    <div className="play-button-overlay" onClick={onClick}>
      <i className="fas fa-play"></i>
    </div>
  );
};

export default PlayButtonOverlay;
