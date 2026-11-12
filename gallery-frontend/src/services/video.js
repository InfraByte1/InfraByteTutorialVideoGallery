import axios from "axios";
import {
  deleteVideoTutorial,
  tutorialUpload,
  updateJobBookingTutorials,
} from "../config/config";

const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

// Don't set Content-Type here: axios/the browser add the multipart boundary.
const authHeaders = () => ({
  Accept: "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const deleteOneVideo = async (videoId) => {
  var deleteVideoApi = `${deleteVideoTutorial}/${videoId}`;
  try {
    const response = await axios.delete(deleteVideoApi, {});
    return response;
  } catch (err) {
    console.error("Upload failed:", err);
  }
};

export const deleteTutorialVideo = (videoId, options = {}) =>
  axios.delete(`${deleteVideoTutorial}/${videoId}`, {
    headers: authHeaders(),
    ...options,
  });

const appendCommon = (formData, v) => {
  formData.append("Tags", v.tags.join(","));
  formData.append("Category", v.category);
  formData.append("SubCategory", v.subCategory);
  formData.append("Description", v.description || "");
  formData.append("VideoType", v.videoType);
  formData.append("VideoTitle", v.title.trim());
};

const appendThumbnail = (formData, index, item) => {
  // Only send a thumbnail when the user picked a new image; otherwise the
  // server keeps whatever it already has.
  if (item.thumbnailFile instanceof File) {
    formData.append(`VideoDetails[${index}].Thumbnail`, item.thumbnailFile);
  }
};

/**
 * values: { videoType, category, subCategory, title, description, tags, items }
 * items: new videos only ({ title, isPrivate, file, thumbnailFile }).
 */
export const uploadTutorialVideos = (values, { onProgress, signal } = {}) => {
  const formData = new FormData();
  appendCommon(formData, values);

  values.items.forEach((item, index) => {
    formData.append(`VideoDetails[${index}].Title`, item.title.trim());
    appendThumbnail(formData, index, item);
    formData.append(`VideoDetails[${index}].IsPrivate`, item.isPrivate);
  });
  values.items.forEach((item) => formData.append("VideoFiles", item.file));

  return axios.post(tutorialUpload.toString(), formData, {
    headers: authHeaders(),
    signal,
    onUploadProgress: (e) =>
      onProgress && e.total && onProgress(Math.round((e.loaded / e.total) * 100)),
  });
};

/**
 * items: every video that should exist after saving - existing ones
 * ({ source: "existing", id }) and newly added ones ({ source: "new", file }).
 */
export const updateTutorialVideos = (values, { onProgress, signal } = {}) => {
  const formData = new FormData();
  appendCommon(formData, values);

  values.items.forEach((item, index) => {
    const existing = item.source === "existing";
    formData.append(`VideoDetails[${index}].Title`, item.title.trim());
    appendThumbnail(formData, index, item);
    formData.append(`VideoDetails[${index}].IsPrivate`, item.isPrivate);
    formData.append(
      `VideoFiles[${index}].TutorialId`,
      existing ? item.id : EMPTY_GUID
    );
    if (!existing) {
      formData.append(`VideoFiles[${index}].VideoFile`, item.file);
    }
  });

  return axios.post(updateJobBookingTutorials.toString(), formData, {
    headers: authHeaders(),
    signal,
    onUploadProgress: (e) =>
      onProgress && e.total && onProgress(Math.round((e.loaded / e.total) * 100)),
  });
};
