import React, { useRef } from "react";
import { formatSize, MAX_TITLE_LENGTH } from "./validation";

/**
 * One video in the form: preview, title, visibility, optional thumbnail and
 * remove / undo. Used for both newly picked files and (in edit mode) videos
 * that already exist on the server.
 */
const VideoItemCard = ({
  item,
  index,
  error,
  disabled,
  onChange,
  onThumbnailPick,
  onThumbnailClear,
  onRemove,
  onRestore,
}) => {
  const thumbInputRef = useRef(null);
  const isExisting = item.source === "existing";
  const thumbSrc = item.thumbnailPreview || item.existingThumbnail || null;

  if (item.removed) {
    return (
      <div className="video-card removed">
        <span>
          <i className="fas fa-trash-can" aria-hidden="true"></i> “
          {item.title || `Video ${index + 1}`}” will be deleted when you save.
        </span>
        <button
          type="button"
          className="link-btn"
          onClick={() => onRestore(item.key)}
          disabled={disabled}
        >
          Undo
        </button>
      </div>
    );
  }

  const titleId = `video-title-${item.key}`;

  return (
    <div className={`video-card ${error ? "has-error" : ""}`}>
      <div className="video-card-media">
        <video
          src={item.previewUrl}
          controls
          preload="metadata"
          aria-label={`Preview of ${item.title || `video ${index + 1}`}`}
        >
          Your browser does not support the video tag.
        </video>
        <div className="video-card-meta">
          <span className={`badge-source ${isExisting ? "existing" : "new"}`}>
            {isExisting ? "Uploaded" : "New"}
          </span>
          {item.file && (
            <span className="file-meta" title={item.file.name}>
              {item.file.name} · {formatSize(item.file.size)}
            </span>
          )}
        </div>
      </div>

      <div className="video-card-fields">
        <div className="field">
          <label htmlFor={titleId}>
            Video title <span className="req">*</span>
          </label>
          <input
            id={titleId}
            type="text"
            className={error ? "is-invalid" : ""}
            value={item.title}
            maxLength={MAX_TITLE_LENGTH}
            placeholder="e.g. How to create a job booking"
            disabled={disabled}
            onChange={(e) => onChange(item.key, { title: e.target.value })}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${titleId}-err` : undefined}
          />
          {error && (
            <div className="field-error" id={`${titleId}-err`} role="alert">
              {error.title}
            </div>
          )}
        </div>

        <div className="field">
          <label>Thumbnail</label>
          <div className="thumb-row">
            <div className={`thumb-box ${thumbSrc ? "" : "empty"}`}>
              {thumbSrc ? (
                <img src={thumbSrc} alt="Thumbnail preview" />
              ) : (
                <i className="far fa-image" aria-hidden="true"></i>
              )}
            </div>
            <div className="thumb-actions">
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  if (file) onThumbnailPick(item.key, file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className="btn-soft"
                disabled={disabled}
                onClick={() => thumbInputRef.current.click()}
              >
                {thumbSrc ? "Change image" : "Upload image"}
              </button>
              {item.thumbnailFile && (
                <button
                  type="button"
                  className="link-btn"
                  disabled={disabled}
                  onClick={() => onThumbnailClear(item.key)}
                >
                  Remove
                </button>
              )}
              <small>
                {thumbSrc
                  ? "JPG, PNG or WebP"
                  : "Optional · JPG, PNG or WebP"}
              </small>
            </div>
          </div>
        </div>

        <div className="video-card-footer">
          <label className="switch" htmlFor={`private-${item.key}`}>
            <input
              id={`private-${item.key}`}
              type="checkbox"
              checked={item.isPrivate}
              disabled={disabled}
              onChange={(e) =>
                onChange(item.key, { isPrivate: e.target.checked })
              }
            />
            <span className="switch-track" aria-hidden="true"></span>
            <span className="switch-label">
              Private
              <small>Only visible to people with access</small>
            </span>
          </label>

          <button
            type="button"
            className="btn-danger-soft"
            disabled={disabled}
            onClick={() => onRemove(item.key)}
          >
            <i className="fas fa-trash-can" aria-hidden="true"></i>{" "}
            {isExisting ? "Delete" : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoItemCard;
