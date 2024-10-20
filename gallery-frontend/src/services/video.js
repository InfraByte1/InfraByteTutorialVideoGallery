import axios from "axios";
import { deleteVideoTutorial } from "../config/config";

export const deleteOneVideo = async (videoId) => {
  var deleteVideoApi = `${deleteVideoTutorial}/${videoId}`;
  try {
    const response = await axios.delete(deleteVideoApi, {});
    return response;
  } catch (err) {    console.error("Upload failed:", err);
  }
};
