import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { category as webCategories } from "../../data/category";
import { mobileCategory as mobileCategories } from "../../data/mobile_category";
import VideoDropzone from "./VideoDropzone";
import VideoItemCard from "./VideoItemCard";
import TagInput from "./TagInput";
import {
  checkThumbnailFile,
  checkVideoFiles,
  formatSize,
  MAX_TITLE_LENGTH,
  titleFromFileName,
  validateVideoForm,
} from "./validation";
import "../../Assets/Css/VideoForm.css";

const CANCEL_PATH = "/your-video";

const getSubcategories = (videoType, categoryName) => {
  const data = videoType === "web" ? webCategories : mobileCategories;
  const cat = data.find((c) => c.categoryName === categoryName);
  return cat ? cat.subcategories.flatMap((s) => s.items) : [];
};

const Field = ({ id, label, required, hint, error, children }) => (
  <div className="field">
    <label htmlFor={id}>
      {label} {required && <span className="req">*</span>}
    </label>
    {children}
    {hint && !error && <div className="field-hint">{hint}</div>}
    {error && (
      <div className="field-error" id={`${id}-err`} role="alert">
        {error}
      </div>
    )}
  </div>
);

/**
 * Shared add / edit form.
 *
 * mode:      "add" | "edit"
 * initial:   { videoType, category, subCategory, title, description, tags, items }
 *            where items are videos that already exist (edit mode)
 * onSubmit:  async (values, { onProgress, signal }) => message string
 *            values.items = every video to keep/add, values.removedIds = existing
 *            videos the user chose to delete.
 */
const VideoForm = ({ mode, initial, onSubmit }) => {
  const isEdit = mode === "edit";
  const navigate = useNavigate();

  const [videoType, setVideoType] = useState(initial.videoType);
  const [categoryName, setCategoryName] = useState(initial.category);
  const [subCategory, setSubCategory] = useState(initial.subCategory);
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [tags, setTags] = useState(initial.tags);
  const [items, setItems] = useState(initial.items);

  const [rejections, setRejections] = useState([]);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [serverError, setServerError] = useState("");
  const [dirty, setDirty] = useState(false);

  const keyCounter = useRef(0);
  const objectUrls = useRef(new Set());
  const abortRef = useRef(null);

  const categories = videoType === "web" ? webCategories : mobileCategories;
  const subcategories = useMemo(
    () => getSubcategories(videoType, categoryName),
    [videoType, categoryName]
  );

  const activeItems = items.filter((i) => !i.removed);
  const removedIds = items
    .filter((i) => i.removed && i.source === "existing")
    .map((i) => i.id);
  const newItems = activeItems.filter((i) => i.source === "new");
  const newSize = newItems.reduce((sum, i) => sum + i.file.size, 0);

  const errors = validateVideoForm({
    category: categoryName,
    subCategory,
    title,
    tags,
    items: activeItems,
  });

  const showField = (name) =>
    (submitted || touched[name]) && errors.fields[name] ? errors.fields[name] : "";
  const touch = (name) => setTouched((t) => ({ ...t, [name]: true }));
  const markDirty = () => setDirty(true);

  // Free the in-memory previews when leaving the page.
  useEffect(() => {
    const urls = objectUrls.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  // Native "leave site?" prompt for unsaved work.
  useEffect(() => {
    if (!dirty && !uploading) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, uploading]);

  const makeUrl = (file) => {
    const url = URL.createObjectURL(file);
    objectUrls.current.add(url);
    return url;
  };

  const revokeUrl = (url) => {
    if (url && objectUrls.current.has(url)) {
      URL.revokeObjectURL(url);
      objectUrls.current.delete(url);
    }
  };

  /* ---------------- videos ---------------- */

  const handleFiles = (files) => {
    const { accepted, rejected } = checkVideoFiles(
      files,
      items.filter((i) => i.source === "new")
    );
    setRejections(rejected);
    if (accepted.length === 0) return;

    const added = accepted.map((file) => ({
      key: `new-${keyCounter.current++}`,
      source: "new",
      file,
      previewUrl: makeUrl(file),
      title: titleFromFileName(file.name).slice(0, MAX_TITLE_LENGTH),
      isPrivate: false,
      thumbnailFile: null,
      thumbnailPreview: null,
    }));
    setItems((prev) => [...prev, ...added]);
    markDirty();
  };

  const updateItem = (key, patch) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
    markDirty();
  };

  const removeItem = (key) => {
    const target = items.find((i) => i.key === key);
    if (!target) return;
    if (target.source === "existing") {
      // Existing videos are only deleted on the server when the user saves.
      updateItem(key, { removed: true });
    } else {
      revokeUrl(target.previewUrl);
      revokeUrl(target.thumbnailPreview);
      setItems((prev) => prev.filter((i) => i.key !== key));
      markDirty();
    }
  };

  const pickThumbnail = (key, file) => {
    const problem = checkThumbnailFile(file);
    if (problem) {
      toast.error(problem);
      return;
    }
    const target = items.find((i) => i.key === key);
    revokeUrl(target && target.thumbnailPreview);
    updateItem(key, { thumbnailFile: file, thumbnailPreview: makeUrl(file) });
  };

  const clearThumbnail = (key) => {
    const target = items.find((i) => i.key === key);
    revokeUrl(target && target.thumbnailPreview);
    updateItem(key, { thumbnailFile: null, thumbnailPreview: null });
  };

  /* ---------------- details ---------------- */

  const changeVideoType = (type) => {
    if (type === videoType) return;
    setVideoType(type);
    setCategoryName("");
    setSubCategory("");
    markDirty();
  };

  /* ---------------- submit ---------------- */

  const focusFirstError = () => {
    requestAnimationFrame(() => {
      const el = document.querySelector(
        ".video-form .is-invalid, .video-form .has-error, .video-form .field-error"
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const focusable = el.matches("input,select,textarea")
          ? el
          : el.querySelector("input,select,textarea");
        if (focusable) focusable.focus({ preventScroll: true });
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return;
    setSubmitted(true);
    setServerError("");

    if (errors.hasErrors) {
      toast.error("Please fix the highlighted fields.");
      focusFirstError();
      return;
    }
    if (isEdit && newItems.length === 0 && !dirty) {
      toast.info("No changes to save.");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setUploading(true);
    setProgress(0);

    try {
      const message = await onSubmit(
        {
          videoType,
          category: categoryName,
          subCategory,
          title,
          description,
          tags,
          items: activeItems,
          removedIds,
        },
        { onProgress: setProgress, signal: controller.signal }
      );
      setDirty(false);
      toast.success(message || "Saved successfully.");
      navigate(CANCEL_PATH);
    } catch (err) {
      if (axios.isCancel(err)) {
        toast.info("Upload cancelled.");
      } else {
        console.error("Save failed:", err);
        const msg =
          (err.response && err.response.data && err.response.data.message) ||
          (err.response && err.response.status === 413
            ? "The files are too large for the server."
            : "") ||
          (err.message === "Network Error"
            ? "Could not reach the server. Check your connection and try again."
            : err.message) ||
          "Something went wrong.";
        setServerError(msg);
        toast.error("Upload failed.");
      }
      setUploading(false);
    } finally {
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    if (dirty && !window.confirm("Discard your changes?")) return;
    navigate(CANCEL_PATH);
  };

  const noun = (n) => `${n} video${n === 1 ? "" : "s"}`;
  const submitLabel = isEdit
    ? "Save changes"
    : newItems.length > 0
    ? `Upload ${noun(newItems.length)}`
    : "Upload";

  return (
    <div className="video-form-page">
      <form className="video-form" onSubmit={handleSubmit} noValidate>
        <div className="vf-header">
          <Link to={CANCEL_PATH} className="vf-back">
            <i className="fas fa-arrow-left" aria-hidden="true"></i> Your videos
          </Link>
          <h1>{isEdit ? "Edit tutorial videos" : "Upload tutorial videos"}</h1>
          <p>
            {isEdit
              ? "Update the details, replace thumbnails, or add and remove videos."
              : "Add your videos first, then fill in the details. Everything is uploaded together."}
          </p>
        </div>

        {/* ---------- 1. Videos ---------- */}
        <section className="vf-card">
          <div className="vf-card-head">
            <span className="step">1</span>
            <div>
              <h2>Videos</h2>
              <p>
                {activeItems.length === 0
                  ? "No videos added yet."
                  : `${noun(activeItems.length)}${
                      newItems.length ? ` · ${formatSize(newSize)} to upload` : ""
                    }`}
              </p>
            </div>
          </div>

          <VideoDropzone
            onFiles={handleFiles}
            disabled={uploading}
            compact={items.length > 0}
            invalid={submitted && !!errors.fields.videos}
          />
          {submitted && errors.fields.videos && (
            <div className="field-error" role="alert">
              {errors.fields.videos}
            </div>
          )}

          {rejections.length > 0 && (
            <div className="vf-alert warn" role="alert">
              <div>
                <strong>Some files were not added:</strong>
                <ul>
                  {rejections.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                className="link-btn"
                onClick={() => setRejections([])}
                aria-label="Dismiss"
              >
                <i className="fas fa-xmark" aria-hidden="true"></i>
              </button>
            </div>
          )}

          {items.length > 0 && (
            <div className="video-list">
              {items.map((item, index) => (
                <VideoItemCard
                  key={item.key}
                  item={item}
                  index={index}
                  error={
                    submitted && !item.removed ? errors.items[item.key] : undefined
                  }
                  disabled={uploading}
                  onChange={updateItem}
                  onThumbnailPick={pickThumbnail}
                  onThumbnailClear={clearThumbnail}
                  onRemove={removeItem}
                  onRestore={(key) => updateItem(key, { removed: false })}
                />
              ))}
            </div>
          )}
        </section>

        {/* ---------- 2. Details ---------- */}
        <section className="vf-card">
          <div className="vf-card-head">
            <span className="step">2</span>
            <div>
              <h2>Details</h2>
              <p>Where the videos appear in the gallery and how people find them.</p>
            </div>
          </div>

          <div className="field">
            <label id="type-label">Platform</label>
            <div className="segmented" role="radiogroup" aria-labelledby="type-label">
              {[
                ["web", "Web"],
                ["mobile", "Mobile"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={videoType === value}
                  className={videoType === value ? "active" : ""}
                  disabled={uploading}
                  onClick={() => changeVideoType(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="field-row">
            <Field
              id="category"
              label="Category"
              required
              error={showField("category")}
            >
              <select
                id="category"
                value={categoryName}
                disabled={uploading}
                className={showField("category") ? "is-invalid" : ""}
                onChange={(e) => {
                  setCategoryName(e.target.value);
                  setSubCategory("");
                  markDirty();
                }}
                onBlur={() => touch("category")}
                aria-invalid={showField("category") ? "true" : undefined}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.categoryName} value={cat.categoryName}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              id="subcategory"
              label="Sub category"
              required
              error={showField("subCategory")}
            >
              <select
                id="subcategory"
                value={subCategory}
                disabled={uploading || !categoryName}
                className={showField("subCategory") ? "is-invalid" : ""}
                onChange={(e) => {
                  setSubCategory(e.target.value);
                  markDirty();
                }}
                onBlur={() => touch("subCategory")}
                aria-invalid={showField("subCategory") ? "true" : undefined}
              >
                <option value="">
                  {categoryName ? "Select a sub category" : "Choose a category first"}
                </option>
                {subcategories.map((s) => (
                  <option key={s.title} value={s.title}>
                    {s.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            id="tutorial-title"
            label="Tutorial title"
            required
            hint="The name shown in the gallery for this set of videos."
            error={showField("title")}
          >
            <input
              id="tutorial-title"
              type="text"
              value={title}
              maxLength={MAX_TITLE_LENGTH}
              disabled={uploading}
              placeholder="e.g. How to add and update Lead Source"
              className={showField("title") ? "is-invalid" : ""}
              onChange={(e) => {
                setTitle(e.target.value);
                markDirty();
              }}
              onBlur={() => touch("title")}
              aria-invalid={showField("title") ? "true" : undefined}
            />
          </Field>

          <Field id="description" label="Description" hint="Optional">
            <textarea
              id="description"
              rows={3}
              value={description}
              disabled={uploading}
              placeholder="A short summary of what these videos cover"
              onChange={(e) => {
                setDescription(e.target.value);
                markDirty();
              }}
            />
          </Field>

          <Field
            id="tags"
            label="Tags"
            required
            hint="Press Enter or comma after each tag. Tags are what the search uses."
            error={showField("tags")}
          >
            <TagInput
              id="tags"
              tags={tags}
              invalid={!!showField("tags")}
              onChange={(next) => {
                setTags(next);
                markDirty();
              }}
              onBlur={() => touch("tags")}
            />
          </Field>
        </section>

        {serverError && (
          <div className="vf-alert error" role="alert">
            <div>
              <strong>{isEdit ? "Could not save changes." : "Upload failed."}</strong>{" "}
              {serverError}
            </div>
          </div>
        )}

        {/* ---------- action bar ---------- */}
        <div className="vf-actions">
          {uploading ? (
            <div className="vf-progress" aria-live="polite">
              <div className="vf-progress-label">
                <span>
                  {progress >= 100
                    ? "Processing on the server…"
                    : `Uploading… ${progress}%`}
                </span>
              </div>
              <div
                className="vf-progress-bar"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="vf-summary">
              {noun(activeItems.length)}
              {removedIds.length > 0 && ` · ${removedIds.length} to delete`}
            </div>
          )}

          <div className="vf-buttons">
            {uploading ? (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => abortRef.current && abortRef.current.abort()}
                disabled={progress >= 100}
              >
                Cancel upload
              </button>
            ) : (
              <button type="button" className="btn-ghost" onClick={handleCancel}>
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary-vf" disabled={uploading}>
              {uploading ? (
                <>
                  <span className="btn-spinner" aria-hidden="true"></span> Saving…
                </>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VideoForm;
