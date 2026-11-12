import React, { useRef, useState } from "react";
import { formatSize, MAX_VIDEO_SIZE } from "./validation";

/**
 * Drag & drop / click-to-browse area for picking one or many videos.
 * `compact` renders a slimmer version, used once videos are already listed.
 */
const VideoDropzone = ({ onFiles, disabled, compact, invalid }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const open = () => !disabled && inputRef.current && inputRef.current.click();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length) onFiles(files);
  };

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onFiles(files);
    // allow picking the same file again after removing it
    e.target.value = "";
  };

  return (
    <div
      className={`video-dropzone ${compact ? "compact" : ""} ${
        dragging ? "dragging" : ""
      } ${invalid ? "is-invalid" : ""} ${disabled ? "disabled" : ""}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Add videos. Drop files here or press Enter to browse."
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4"
        multiple
        hidden
        onChange={handleChange}
      />
      <i className="fas fa-cloud-arrow-up dropzone-icon" aria-hidden="true"></i>
      <div className="dropzone-text">
        <strong>
          {compact ? "Add more videos" : "Drag & drop videos here"}
        </strong>
        <span>
          {compact ? "or " : "or "}
          <u>browse your computer</u>
          {compact ? "" : " — you can select several at once"}
        </span>
        {!compact && (
          <small>
            MP4 only, up to {formatSize(MAX_VIDEO_SIZE)} per video
          </small>
        )}
      </div>
    </div>
  );
};

export default VideoDropzone;
