// Shared constants + validation helpers for the add / edit video forms.

export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB per video
export const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB per thumbnail
export const MAX_TITLE_LENGTH = 200;
export const MAX_TAG_LENGTH = 40;

export const VIDEO_TYPES = ["video/mp4"];
export const THUMBNAIL_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const formatSize = (bytes) => {
  if (bytes == null) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const titleFromFileName = (name) =>
  name
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim();

/**
 * Splits picked files into accepted ones and human readable rejection
 * messages (one per rejected file) so the user knows exactly what went wrong.
 */
export const checkVideoFiles = (files, existing = []) => {
  const accepted = [];
  const rejected = [];
  const seen = new Set(
    existing.map((v) => `${v.file?.name}:${v.file?.size}:${v.file?.lastModified}`)
  );

  files.forEach((file) => {
    const key = `${file.name}:${file.size}:${file.lastModified}`;
    if (!VIDEO_TYPES.includes(file.type)) {
      rejected.push(`${file.name}: only MP4 videos are supported.`);
    } else if (file.size > MAX_VIDEO_SIZE) {
      rejected.push(
        `${file.name}: ${formatSize(file.size)} is over the ${formatSize(
          MAX_VIDEO_SIZE
        )} limit.`
      );
    } else if (seen.has(key)) {
      rejected.push(`${file.name}: already added.`);
    } else {
      seen.add(key);
      accepted.push(file);
    }
  });

  return { accepted, rejected };
};

export const checkThumbnailFile = (file) => {
  if (!THUMBNAIL_TYPES.includes(file.type)) {
    return "Thumbnail must be a JPG, PNG or WebP image.";
  }
  if (file.size > MAX_THUMBNAIL_SIZE) {
    return `Thumbnail must be under ${formatSize(MAX_THUMBNAIL_SIZE)}.`;
  }
  return null;
};

/**
 * Returns { fields: {...}, items: { [itemKey]: { title } }, hasErrors }.
 * `items` are the videos that will actually be saved (not the removed ones).
 */
export const validateVideoForm = ({
  category,
  subCategory,
  title,
  tags,
  items,
}) => {
  const fields = {};
  if (!category) fields.category = "Select a category.";
  if (!subCategory) fields.subCategory = "Select a sub category.";
  if (!title.trim()) fields.title = "Enter a title for this tutorial.";
  if (tags.length === 0) fields.tags = "Add at least one tag.";
  if (items.length === 0) fields.videos = "Add at least one video.";

  const itemErrors = {};
  items.forEach((item) => {
    if (!item.title.trim()) {
      itemErrors[item.key] = { title: "Give this video a title." };
    }
  });

  return {
    fields,
    items: itemErrors,
    hasErrors: Object.keys(fields).length > 0 || Object.keys(itemErrors).length > 0,
  };
};
