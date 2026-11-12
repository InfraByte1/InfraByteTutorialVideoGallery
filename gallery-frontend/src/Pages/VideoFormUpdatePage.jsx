import React, { useEffect, useMemo } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import VideoForm from "../Components/videoForm/VideoForm";
import {
  deleteTutorialVideo,
  updateTutorialVideos,
} from "../services/video";

// Video URLs can contain raw spaces; normalise without double-encoding.
const safeUrl = (url) => {
  try {
    return encodeURI(decodeURI(url));
  } catch (e) {
    return url;
  }
};

const VideoFormUpdatePage = () => {
  const location = useLocation();
  const { videoTypeState } = useParams();
  const item = location.state;
  const group = item && item.subCategories && item.subCategories[0];

  // Opening /edit/video/... directly (refresh, bookmark) has no data to edit.
  const missing = !group;
  useEffect(() => {
    if (missing) toast.info("Choose a video from your list to edit it.");
  }, [missing]);

  const initial = useMemo(() => {
    if (!group) return null;
    return {
      videoType: videoTypeState === "mobile" ? "mobile" : "web",
      category: item.category || "",
      subCategory: item.subCategory || "",
      title: group.videoTitle || "",
      description:
        group.description && group.description !== "null"
          ? group.description
          : "",
      tags: Array.isArray(group.tags) ? group.tags : [],
      items: (group.videoTutorials || []).map((v) => ({
        key: `existing-${v.id}`,
        source: "existing",
        id: v.id,
        previewUrl: safeUrl(v.filePath),
        title: v.subTitle || "",
        isPrivate: !!v.isPrivate,
        existingThumbnail:
          v.thumbnailName != null
            ? `${v.thumbnailPath}/${v.thumbnailName}`
            : null,
        thumbnailFile: null,
        thumbnailPreview: null,
        removed: false,
      })),
    };
  }, [group, item, videoTypeState]);

  if (missing) return <Navigate to="/your-video" replace />;

  const handleSubmit = async (values, options) => {
    await updateTutorialVideos(values, options);

    // Videos the user removed are deleted only now, once the update succeeded.
    const results = await Promise.allSettled(
      values.removedIds.map((id) => deleteTutorialVideo(id))
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      toast.warn(
        `Saved, but ${failed} removed video${
          failed === 1 ? "" : "s"
        } could not be deleted. Please try again from the list.`
      );
    }
    return "Changes saved.";
  };

  return <VideoForm mode="edit" initial={initial} onSubmit={handleSubmit} />;
};

export default VideoFormUpdatePage;
