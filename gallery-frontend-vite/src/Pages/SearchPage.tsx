import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import CryptoJS from "crypto-js";
import { toast } from "react-toastify";
import { getHeaders } from "../services/auth";
import { config, getJobsTutorialById, getJobsTutorialByTags } from "../config/config";
import { getErrorMessage } from "../utils/converters";
import noThumbnail from "../Assets/images/no_thumbnail.svg";
import type { JobTutorial } from "../types/video";

interface SearchPageProps {
  isFromShare?: boolean;
}

const SearchPage = ({ isFromShare }: SearchPageProps) => {
  const { query } = useParams<{ query: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<JobTutorial[]>([]);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  const playVideo = (url: string, title: string) => {
    setVideoUrl(url);
    setVideoTitle(title);
    toast.info(`Now Playing: ${title}`);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 769);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!query) return;

      setLoading(true);
      try {
        let responseData: JobTutorial[];

        if (isFromShare) {
          sessionStorage.setItem("shared", query);
          const videoId = CryptoJS.AES.decrypt(decodeURIComponent(query), config.secretCrypt).toString(
            CryptoJS.enc.Utf8
          );
          const response = await axios.get<JobTutorial[]>(`${getJobsTutorialById}/${videoId}`, {
            headers: getHeaders(),
          });
          responseData = response.data;
        } else {
          const response = await axios.get<JobTutorial[]>(`${getJobsTutorialByTags}?tags=${query}`, {
            headers: getHeaders(),
          });
          responseData = response.data;
        }

        setData(responseData);
        if (responseData?.length) {
          playVideo(responseData[0].filePath, responseData[0].subTitle);
        }
      } catch (err) {
        if (isFromShare) {
          toast.info("Error fetching data: Try login again.", {
            onClose: () => navigate("/", { state: { isShared: true } }),
          });
        } else {
          toast.info(`Error fetching data: ${getErrorMessage(err)}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, isFromShare, navigate]);

  return (
    <div className={`container thumbnail-grid ${isMobile ? "mobile-list" : ""}`}>
      <div className="video-player mt-2">
        <video controls autoPlay muted key={videoUrl} preload="metadata">
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      {videoTitle && <h5 className="p-3">Now Playing: {videoTitle}</h5>}

      {loading && (
        <span>
          <div className="loading-spinner"></div>
        </span>
      )}

      <div className="thumbnails mt-3 ">
        {data
          .filter((tutorial) => !tutorial.isPrivate)
          .map((tutorial, index) => (
            <div
              key={index}
              className="video-item"
              onClick={() => playVideo(tutorial.filePath, tutorial.subTitle)}
            >
              {tutorial.thumbnailName ? (
                <img
                  src={`${tutorial.thumbnailPath}/${tutorial.thumbnailName}`}
                  alt={tutorial.fileName}
                  className="thumbnail"
                />
              ) : (
                <img src={noThumbnail} alt="No image" className="thumbnail " />
              )}
              <div className="thumbnail-overlay"></div>
              <div className="video-details">
                <h2>{tutorial.subTitle}</h2>
                {tutorial.videoStatus && <div className="new-container">{tutorial.videoStatus}</div>}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SearchPage;
