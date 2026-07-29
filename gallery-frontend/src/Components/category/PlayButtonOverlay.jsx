import React from 'react';
import '../../Assets/Css/PlayButtonOverlay.css'; 

const PlayButtonOverlay = ({ onClick }) => {
  return (
    <div className="play-button-overlay"  onClick={onClick}>
      <i className="fas fa-play"></i>
    </div>
  );
};

export default PlayButtonOverlay;