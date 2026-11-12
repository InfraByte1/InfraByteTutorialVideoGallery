import React from "react";

import VideoForm from "../Components/videoForm/VideoForm";
import { uploadTutorialVideos } from "../services/video";

const INITIAL = {
  videoType: "web",
  category: "",
  subCategory: "",
  title: "",
  description: "",
  tags: [],
  items: [],
};

const VideoFormPage = () => {
  const handleSubmit = async (values, options) => {
    const response = await uploadTutorialVideos(values, options);
    const count = Array.isArray(response.data)
      ? response.data.length
      : values.items.length;
    return `Upload complete. ${count} video${count === 1 ? "" : "s"} uploaded.`;
  };

  return <VideoForm mode="add" initial={INITIAL} onSubmit={handleSubmit} />;
};

export default VideoFormPage;
