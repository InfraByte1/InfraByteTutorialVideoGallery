import React, { useEffect, useRef, useState } from "react";
import { Form, Button, Container, Row, Col, Card } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import { category } from "../data/category";
import "../Assets/Css/Login.css";
import {
  deleteVideoTutorial,
  oidcConfig,
  tutorialUpload,
  updateJobBookingTutorials,
} from "../config/config";
import { toast, ToastContainer } from "react-toastify";
import { mobileCategory } from "../data/mobile_category";

const VideoFormUpdatePage = () => {
  const location = useLocation();
  const item = location.state;

  const [title, setTitle] = useState(item.subCategories[0].videoTitle);
  const [description, setDescription] = useState(
    item.subCategories[0].description
  );
  const [errors, setErrors] = useState({});

  const [validated, setValidated] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const [videos, setVideos] = useState([]);
  const [videoDetails, setVideoDetails] = useState([]);
  const [oldVideoDetails, setOldVideoDetails] = useState([]);
  // const [videoURLs, setVideoURLs] = useState([]);
  const [error, setError] = useState("");
  // const [tags, setTags] = useState(["how to do job booking", "job booking"]);
  const [tags, setTags] = useState(item.subCategories[0].tags);

  const [inputValue, setInputValue] = useState("");

  const [categorySelected, setCategory] = useState(item.category);
  const [subcategory, setSubcategory] = useState(item.subCategory);
  const [subcategories, setSubcategories] = useState([]);

  const [videoType, setVideoType] = useState("web");
  var [data, setData] = useState(category);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const listRef = useRef(null);
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputKeyPress = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (inputValue.trim()) {
        setTags([...tags, inputValue.trim()]);
        setInputValue("");
      }
    }
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const allowedTypes = ["video/mp4"];
    const maxSize = 50 * 1024 * 1024; // 50MB  "video/webm", "video/ogg"

    let validFiles = [];
    let validUrls = [];
    files.forEach((file) => {
      if (allowedTypes.includes(file.type) && file.size <= maxSize) {
        validFiles.push(file);
        validUrls.push(URL.createObjectURL(file));
      } else {
        setError(
          "Some files are not supported or exceed the size limit of 50MB."
        );
      }
    });

    setVideos([...videos, ...validFiles]);

    setError("");
    // setVideoURLs([...validUrls]);
    var videoDetail = [];
    if (videos.length == 0) {
      validFiles.forEach((e, i) => {
        videoDetail.push({
          id: i,
          videoUrl: e,
          type: "offline",
          title: "",
          thumbnail: null,
          thumbnailFile: null,
          isPrivate: false,
        });
      });
    } else {
      videos.forEach((e, i) => {
        videoDetail.push({
          id: i,
          videoUrl: e,
          type: "offline",
          title: "",
          thumbnail: null,
          thumbnailFile: null,
          isPrivate: false,
        });
      });
    }

    setVideoDetails(videoDetail);
  };

  const deleteSelectedVideos = (index) => {
    // const updatedVideos = vids
    const updatedVideos = videoDetails.filter((_, i) => i !== index);

    setVideoDetails(updatedVideos);

    // setVideoURLs(videoURLs.filter((_, i) => i !== index));
  };

  const deleteOldSelectedVideos = (index) => {
    // const updatedVideos = vids
    const updatedVideos = oldVideoDetails.filter((_, i) => i !== index);

    setOldVideoDetails(updatedVideos);

    // setVideoURLs(videoURLs.filter((_, i) => i !== index));
  };

  let navigate = useNavigate();

  const handleVideoDelete = async (videoId) => {
    setLoading(true);

    var deleteVideoApi = `${deleteVideoTutorial}/${videoId}`;
    try {
      var token = localStorage.getItem("token");

      const response = await axios.delete(deleteVideoApi, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,

          "Access-Control-Allow-Origin": oidcConfig.hostUrl,
        },
      });
      if (response) {
        toast.info("Your video is deleted");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      //   toast.error("Delete failed:", err);
    }
    setLoading(false);
  };

  const validateForm = () => {
    let formErrors = {};
    if (!categorySelected) {
      formErrors.category = "Please select your category";
    }

    if (!subcategory) {
      formErrors.subCategory = "Please select your sub category";
    }
    if (tags.length === 0) {
      formErrors.tags = "Please provide tags";
    }
    // if (videoDetails.length === 0) {
    //   formErrors.videoDetails = "Please select your video(s)";
    // }
    if (!title) {
      formErrors.title = "Please enter video title";
    }
    return formErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    // if (form.checkValidity() === false) {
    //   event.stopPropagation();
    // }

    const formErrors = validateForm();
    if (Object.keys(formErrors).length != 0) {
      setErrors(formErrors);
      setValidated(true);
      return;
    }
    var isTitleValid = false;
    if (tags.length === 0) {
      toast.info("Please provide tags");
      return;
    }
    videoDetails.map((v, i) => {
      if (!(v.title == "" || v.title == null)) {
        isTitleValid = true;
      } else {
      }
    });

    if (videoDetails.length != 0 && !isTitleValid) {
      toast.info("Title is required for all videos");
      return;
    }

    setLoading(true);
    var token = localStorage.getItem("token");

    setValidated(true);
    // console.log("Token:", token);

    // var data = {
    //   title: title,
    //   tags: tags,
    //   category: categorySelected,
    //   sub_category: subcategory,
    //   description: description,
    //    fileName: video.name,
    // };
    var emptyGuid = "00000000-0000-0000-0000-000000000000";
    if (videos.length === 0) {
      setError("Please upload at least one video before submitting.");
      return;
    }

    var videoDetail = [];
    videoDetails.forEach((v, i) => {
      videoDetail.push({ Title: v.title, Thumbnail: v.thumbnailFile });
    });
    const formData = new FormData();
    // formData.append("Title", title);
    formData.append("Tags", [tags]);
    formData.append("Category", categorySelected);
    formData.append("SubCategory", subcategory);
    formData.append("Description", description);
    formData.append("VideoType", videoType);
    formData.append("VideoTitle ", title);

    // formData.append("VideoDetails", videoDetail);
    // console.log("video files");

    var videosReq = [...oldVideoDetails, ...videoDetails];
    // videoDetails.forEach((video, index) => {
    //     formData.append(`VideoDetails[${index}].Title`, video.title);
    //     formData.append(`VideoDetails[${index}].Thumbnail`, video.thumbnailFile);
    //   });
    videosReq.forEach((video, index) => {
      formData.append(`VideoDetails[${index}].Title`, video.title);
      formData.append(`VideoDetails[${index}].Thumbnail`, video.thumbnailFile);
      formData.append(`VideoDetails[${index}].IsPrivate`, video.isPrivate);

      formData.append(
        `VideoFiles[${index}].TutorialId`,
        video.type === "online" ? video.id : emptyGuid
      );
      formData.append(
        `VideoFiles[${index}].VideoFile`,
        video.type === "online" ? null : video.videoUrl
      );
      console.log(video.videoUrl);
    });

    // videoDetails.forEach((video, index) => {
    //   formData.append(`VideoFiles[${index}].TutorialId`, null);
    //   formData.append(`VideoFiles[${index}].VideoFile`, video.videoUrl);
    //   console.log(video.videoUrl);
    // });

    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    try {
      const response = await axios.post(
        updateJobBookingTutorials.toString(),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,

            "Access-Control-Allow-Origin": oidcConfig.hostUrl,
          },
        }
      );
      setLoading(false);
      // console.log("Upload successful:", response.data);
      toast.success(`upload success. ${response.data.length} files uploaded.`);
      resetFormFields();
    } catch (err) {
      console.error("Upload failed:", err);
      setLoading(false);
      toast.error("Upload failed. Please try again.\n" + err);
      // alert("Upload failed. Please try again.\n" + err);
      // setError("Upload failed. Please try again.");
    }
    setLoading(false);
  };

  const handleVideoTypeChange = (e) => {
    const selectedType = e.target.value;
    setVideoType(selectedType);
    if (selectedType != undefined) {
      if (selectedType == "web") {
        setData(category);
      } else {
        setData(mobileCategory);
      }
      setSubcategory("");
      setSubcategories([]);
    }
  };

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    setCategory(selectedCategory);
    setSubcategory(""); // Reset subcategory when category changes

    const categoryObject = data.find(
      (cat) => cat.categoryName === selectedCategory
    );
    var subCat = categoryObject ? categoryObject.subcategories[0]["items"] : [];
    setSubcategories(subCat);
  };

  const handleSubcategoryChange = (event) => {
    setSubcategory(event.target.value);
  };

  const handleTitleChange = (index, newTitle) => {
    const updatedVideos = videoDetails.map((video, i) =>
      i === index ? { ...video, title: newTitle } : video
    );
    setVideos(updatedVideos);
  };

  const handleIsPrivateChange = (index, newIsPrivate) => {
    const updatedVideos = videoDetails.map((video, i) =>
      i === index ? { ...video, isPrivate: newIsPrivate } : video
    );
    setVideos(updatedVideos);
  };

  const onThumbnailChange = (index, newThumbnail) => {
    const updatedVideos = videoDetails.map((video, i) =>
      i === index ? { ...video, thumbnail: newThumbnail } : video
    );
    setVideos(updatedVideos);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - listRef.current.offsetLeft);
    setScrollLeft(listRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const x = e.pageX - listRef.current.offsetLeft;
    const walk = (x - startX) * 2; // The multiplier can be adjusted for faster/slower scroll
    listRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const categoryObject = data.find(
      (cat) => cat.categoryName === categorySelected
    );
    var subCat = categoryObject ? categoryObject.subcategories[0]["items"] : [];
    setSubcategories(subCat);
  }, []);

  useEffect(() => {
    var videoDetail = [];
    var validFiles = item.subCategories[0].videoTutorials;
    if (videos.length == 0) {
      validFiles.forEach((e, i) => {
        videoDetail.push({
          id: e.id,
          videoUrl: e.filePath,
          type: "online",
          title: e.subTitle,
          isPrivate: e.isPrivate,
          thumbnail: null,
          thumbnailFile:
            e.thumbnailName != null
              ? e.thumbnailPath + "/" + e.thumbnailName
              : null,
        });
      });
    }

    setOldVideoDetails(videoDetail);
  }, []);

  const resetFormFields = () => {
    setCategory("");
    setSubcategory("");
    setSubcategories([]);
    setDescription("");
    setTags([]);
    setTitle("");
    setVideoDetails([]);
    setOldVideoDetails([]);
    setVideos([]);
  };

  return (
    <>
      <ToastContainer />
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Please wait ...</p>
        </div>
      ) : (
        <Container className="form-container mt-5">
          {/* <a
          variant="primary"
          className="button-container  "
          onClick={() => {
            navigate("/your-video", { replace: true });
          }}
        >
          Your videos
        </a> */}
          {/* <Button
          onClick={() => {
            navigate("/add/video", { replace: true });
          }}
        >
          Upload a video
        </Button> */}
          <Col className="justify-content-space-around d-flex flex-column mt-3">
            <Col className="mt-3">
              <h2 className="heading3 mb-4">Upload infrabyte video</h2>

              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mt-3">
                  <Form.Label>Select a video type</Form.Label>
                  <Form.Control
                    placeholder="videoType"
                    as="select"
                    value={videoType}
                    onChange={handleVideoTypeChange}
                    id="videoType"
                    required
                  >
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                  </Form.Control>
                  {errors.category && (
                    <Form.Control.Feedback type="invalid">
                      Please Select a video Type
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
                <Form.Group className="mt-3">
                  <Form.Label>Select a category</Form.Label>
                  <Form.Control
                    placeholder="Category"
                    as="select"
                    value={categorySelected}
                    onChange={handleCategoryChange}
                    id="category"
                    required
                  >
                    <option value="">Select a category</option>
                    {data.map((cat) => (
                      <option key={cat.categoryName} value={cat.categoryName}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </Form.Control>
                  {errors.category && (
                    <Form.Control.Feedback type="invalid">
                      Please Select a category
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
                <Form.Group className="mt-3">
                  <Form.Label>Select a sub category</Form.Label>
                  <Form.Control
                    as="select"
                    id="subcategory"
                    value={subcategory}
                    onChange={handleSubcategoryChange}
                    disabled={!categorySelected}
                    required
                  >
                    <option value="">Select a subcategory</option>
                    {subcategories.map((subcat) => (
                      <option key={subcat.id} value={subcat.title}>
                        {subcat.title}
                      </option>
                    ))}
                  </Form.Control>
                  {errors.subCategory && (
                    <Form.Control.Feedback type="invalid">
                      Please Select a sub category.
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
                <Form.Group className="mt-3">
                  <Form.Label>Video Title</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Video Title"
                    value={title}
                    required
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  {errors.title && (
                    <Form.Control.Feedback type="invalid">
                      Please enter a video title.
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
                <Form.Group className="mt-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as={"textarea"}
                    placeholder="Description"
                    value={description}
                    cols="40"
                    rows="5"
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a descrition.
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mt-3">
                  <Form.Label>Add tags</Form.Label>
                  <Form.Control
                    // type="text"
                    placeholder="Add tags (press enter or comma)"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleInputKeyPress}
                    required
                  />
                  <ul className="tags-list">
                    {tags.map((tag, index) => (
                      <li key={index} className="tag">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                        >
                          <i className="fas fa-close"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {errors.tags && (
                    <Form.Control.Feedback type="invalid">
                      Please provide a tags.
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
                {/* to test  */}
                {/* {videoDetails &&
                  videoDetails.map((v, i) => (
                    <div>
                      <h1>{v.title}</h1> 
                      <img src={v.thumbnail}></img>
                    </div>
                  ))} */}
                <Form.Group className="mt-3">
                  <Form.Label>Choose a video</Form.Label>
                  <Form.Control
                    type="file"
                    placeholder="Upload"
                    id="video-upload"
                    accept="video/mp4"
                    onChange={handleFileChange}
                    multiple
                  />
                  {errors.videoDetails && (
                    <Form.Control.Feedback type="invalid">
                      {errors.videoDetails}
                    </Form.Control.Feedback>
                  )}
                  <Form.Control.Feedback type="invalid">
                    {error && <div className="error-message">{error}</div>}
                  </Form.Control.Feedback>
                </Form.Group>
                {
                  <div
                    className="video-preview mt-3"
                    style={videoDetails.length == 0 ? { height: "50vh" } : {}}
                    ref={listRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                  >
                    {videoDetails.length == 0 && (
                      <center className="d-flex justify-content-center flex-column align-item-center w-100">
                        Video Preview <p>You can select multiple videos</p>
                      </center>
                    )}

                    {videoDetails &&
                      videoDetails.map((video, index) => (
                        <div className="video-container" key={video.id}>
                          <video controls key={video.id}>
                            <source
                              //   src={URL.createObjectURL(video.videoUrl)}
                              src={URL.createObjectURL(video.videoUrl)}
                              type={
                                video.videoUrl != null
                                  ? video.videoUrl.type
                                  : "video/mp4"
                              }
                            />
                            Your browser does not support the video tag.
                          </video>
                          <Form.Group className="mt-3 w-100">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Title"
                              value={video.title}
                              onChange={(e) => {
                                videoDetails[index].title = e.target.value;
                                handleTitleChange(index, e.target.value);
                                // setVideoDetails(videoDetails);
                              }}
                              required
                            />
                            <Form.Group className="mt-3">
                              <Form.Label>Is Private?</Form.Label>
                              <Form.Check
                                type={"checkbox"}
                                id={`isPrivate`}
                                label={`isPrivate`}
                                value={video.isPrivate}
                                onChange={(event) => {
                                  setIsPrivate(event.target.checked);
                                  videoDetails[index].isPrivate =
                                    !video.isPrivate;

                                  handleIsPrivateChange(index, !isPrivate);
                                }}
                              />
                            </Form.Group>
                            <Form.Group className="mt-3">
                              <Form.Label>Thumbnail Image</Form.Label>
                              <Form.Control
                                type="file"
                                placeholder="Upload"
                                id="thumbnail-upload"
                                accept="image/jpg"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();

                                    reader.onloadend = () => {
                                      videoDetails[index].thumbnail =
                                        reader.result;
                                      videoDetails[index].thumbnailFile = file;

                                      onThumbnailChange(index, reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />

                              <Form.Control.Feedback type="invalid">
                                {error && (
                                  <div className="error-message">{error}</div>
                                )}
                              </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Control.Feedback type="invalid">
                              Please provide a valid title.
                            </Form.Control.Feedback>
                          </Form.Group>
                          <button
                            type="button"
                            className="button-container mt-3"
                            onClick={() => {
                              deleteSelectedVideos(index);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                  </div>
                }
                Old video details
                {
                  <div
                    className="video-preview mt-3"
                    style={
                      oldVideoDetails.length == 0 ? { height: "50vh" } : {}
                    }
                    ref={listRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                  >
                    {oldVideoDetails.length == 0 && (
                      <center className="d-flex justify-content-center flex-column align-item-center w-100">
                        Video Preview <p>You can select multiple videos</p>
                      </center>
                    )}

                    {oldVideoDetails &&
                      oldVideoDetails.map((video, index) => (
                        <div className="video-container" key={video.id}>
                          <video controls key={video.id}>
                            <source
                              //   src={URL.createObjectURL(video.videoUrl)}
                              src={
                                video.type === "online"
                                  ? video.videoUrl
                                  : URL.createObjectURL(video.videoUrl)
                              }
                              type={"video/mp4"}
                            />
                            Your browser does not support the video tag.
                          </video>
                          <Form.Group className="mt-3 w-100">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Title"
                              value={video.title}
                              onChange={(e) => {
                                oldVideoDetails[index].title = e.target.value;

                                handleTitleChange(index, e.target.value);
                                // setoldVideoDetails(oldVideoDetails);
                              }}
                              required
                            />
                            <Form.Group className="mt-3">
                              <Form.Label>Is Private?</Form.Label>
                              <Form.Check
                                type={"checkbox"}
                                id={`isPrivate`}
                                label={`isPrivate`}
                                value={video.isPrivate}
                                onChange={(event) => {
                                  oldVideoDetails[index].isPrivate =
                                    !video.isPrivate;

                                  handleIsPrivateChange(index, !isPrivate);
                                }}
                              />
                            </Form.Group>
                            {/* <img
                              src={video.thumbnail}
                              alt={video.title}
                              width="270"
                              height="270"
                            
                              className="thumbnail"
                            /> */}
                            <Form.Group className="mt-3">
                              <Form.Label>Thumbnail Image</Form.Label>
                              <Form.Control
                                type="file"
                                placeholder="Upload"
                                id="thumbnail-upload"
                                accept="image/jpg"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();

                                    reader.onloadend = () => {
                                      oldVideoDetails[index].thumbnail =
                                        reader.result;
                                      oldVideoDetails[index].thumbnailFile =
                                        file;

                                      onThumbnailChange(index, reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />

                              <Form.Control.Feedback type="invalid">
                                {error && (
                                  <div className="error-message">{error}</div>
                                )}
                              </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Control.Feedback type="invalid">
                              Please provide a valid title.
                            </Form.Control.Feedback>
                          </Form.Group>
                          <button
                            type="button"
                            className="button-container mt-3"
                            onClick={() => {
                              deleteOldSelectedVideos(index);
                              handleVideoDelete(video.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                  </div>
                }
                <div className="container d-flex mt-3">
                  <Button
                    variant="primary"
                    className="button-container mt-3  "
                    type="submit"
                    block
                  >
                    Submit
                  </Button>{" "}
                  {loading && <div className="spinner"></div>}
                  <Button
                    variant="primary"
                    className="button-container cancel mt-3 mx-2"
                    block
                    onClick={() => {
                      navigate("/videos");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </Form>
            </Col>
          </Col>
        </Container>
      )}
    </>
  );
};

export default VideoFormUpdatePage;
