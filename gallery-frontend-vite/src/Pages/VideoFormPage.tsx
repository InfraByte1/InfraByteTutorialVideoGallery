import { useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent, type MouseEvent } from "react";
import { Form, Button, Container, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { category } from "../data/category";
import { mobileCategory } from "../data/mobileCategory";
import "../Assets/Css/Login.css";
import { tutorialUpload } from "../config/config";
import { getToken } from "../services/auth";
import { getErrorMessage } from "../utils/converters";
import type { Category, CategoryItem } from "../types/category";
import type { VideoDetail, VideoFormErrors, VideoType } from "../types/videoForm";

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_VIDEO_TYPES = ["video/mp4"];

const VideoFormPage = () => {
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<VideoFormErrors>({});
  const [validated, setValidated] = useState(false);

  const [videos, setVideos] = useState<File[]>([]);
  const [videoDetails, setVideoDetails] = useState<VideoDetail[]>([]);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");

  const [categorySelected, setCategorySelected] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [subcategories, setSubcategories] = useState<CategoryItem[]>([]);

  const [videoType, setVideoType] = useState<VideoType>("web");
  const [data, setData] = useState<Category[]>(category);

  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleInputKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (inputValue.trim()) {
        setTags([...tags, inputValue.trim()]);
        setInputValue("");
      }
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    const validFiles: File[] = [];
    files.forEach((file) => {
      if (ALLOWED_VIDEO_TYPES.includes(file.type) && file.size <= MAX_VIDEO_SIZE) {
        validFiles.push(file);
      } else {
        setError("Some files are not supported or exceed the size limit of 50MB.");
      }
    });

    setVideos([...videos, ...validFiles]);
    setError("");

    const newDetails: VideoDetail[] = validFiles.map((file, i) => ({
      id: i,
      videoUrl: file,
      previewUrl: URL.createObjectURL(file),
      title: "",
      thumbnail: null,
      thumbnailFile: null,
      isPrivate: false,
    }));
    setVideoDetails((prev) => [...prev, ...newDetails]);
  };

  const deleteSelectedVideos = (index: number) => {
    setVideoDetails((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const validateForm = (): VideoFormErrors => {
    const formErrors: VideoFormErrors = {};
    if (!categorySelected) formErrors.category = "Please select your category";
    if (!subcategory) formErrors.subCategory = "Please select your sub category";
    if (tags.length === 0) formErrors.tags = "Please provide tags";
    if (videoDetails.length === 0) formErrors.videoDetails = "Please select your video(s)";
    if (!title) formErrors.title = "Please enter video title";
    return formErrors;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length !== 0) {
      setErrors(formErrors);
      setValidated(true);
      return;
    }

    const isTitleValid = videoDetails.some((v) => v.title !== "" && v.title != null);
    if (!isTitleValid) {
      toast.info("Title is required for all videos");
      return;
    }

    setLoading(true);
    setValidated(true);
    const token = getToken();

    const formData = new FormData();
    formData.append("Tags", tags.join(","));
    formData.append("Category", categorySelected);
    formData.append("SubCategory", subcategory);
    formData.append("Description", description);
    formData.append("VideoType", videoType);
    formData.append("VideoTitle", title);

    videoDetails.forEach((video, index) => {
      formData.append(`VideoDetails[${index}].Title`, video.title);
      if (video.thumbnailFile) {
        formData.append(`VideoDetails[${index}].Thumbnail`, video.thumbnailFile);
      }
      formData.append(`VideoDetails[${index}].IsPrivate`, String(video.isPrivate));
    });
    videoDetails.forEach((video) => {
      formData.append("VideoFiles", video.videoUrl);
    });

    try {
      const response = await axios.post(tutorialUpload, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(`upload success. ${response.data.length} files uploaded.`);
      resetFormFields();
    } catch (err) {
      toast.error(`Upload failed. Please try again.\n${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // react-bootstrap types Form.Control's onChange against the union of every
  // element it can render as (input/select/textarea), regardless of the
  // `as` prop actually used, so the handlers have to accept that union too.
  type FormControlChangeEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;

  const handleVideoTypeChange = (e: FormControlChangeEvent) => {
    const selectedType = e.target.value as VideoType;
    setVideoType(selectedType);
    setData(selectedType === "web" ? category : mobileCategory);
    setSubcategory("");
    setSubcategories([]);
  };

  const handleCategoryChange = (event: FormControlChangeEvent) => {
    const selectedCategory = event.target.value;
    setCategorySelected(selectedCategory);
    setSubcategory("");

    const categoryObject = data.find((cat) => cat.categoryName === selectedCategory);
    setSubcategories(categoryObject ? categoryObject.subcategories[0].items : []);
  };

  const handleSubcategoryChange = (event: FormControlChangeEvent) => {
    setSubcategory(event.target.value);
  };

  const handleTitleChange = (index: number, newTitle: string) => {
    setVideoDetails((prev) => prev.map((v, i) => (i === index ? { ...v, title: newTitle } : v)));
  };

  const handleIsPrivateChange = (index: number, newIsPrivate: boolean) => {
    setVideoDetails((prev) => prev.map((v, i) => (i === index ? { ...v, isPrivate: newIsPrivate } : v)));
  };

  const handleThumbnailChange = (index: number, thumbnail: string, thumbnailFile: File) => {
    setVideoDetails((prev) => prev.map((v, i) => (i === index ? { ...v, thumbnail, thumbnailFile } : v)));
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!listRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - listRef.current.offsetLeft);
    setScrollLeft(listRef.current.scrollLeft);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !listRef.current) return;
    const x = e.pageX - listRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    listRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const resetFormFields = () => {
    setCategorySelected("");
    setSubcategory("");
    setSubcategories([]);
    setDescription("");
    setTags([]);
    setTitle("");
    setVideoDetails([]);
    setVideos([]);
  };

  return (
    <>
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Please wait ...</p>
        </div>
      ) : (
        <Container className="form-container mt-5">
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
                  {errors.category && <Form.Control.Feedback type="invalid">Please Select a category</Form.Control.Feedback>}
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
                    <Form.Control.Feedback type="invalid">Please Select a sub category.</Form.Control.Feedback>
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
                  {errors.title && <Form.Control.Feedback type="invalid">Please enter a video title.</Form.Control.Feedback>}
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    placeholder="Description"
                    value={description}
                    cols={40}
                    rows={5}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label>Add tags</Form.Label>
                  <Form.Control
                    placeholder="Add tags (press enter or comma)"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyPress}
                    required
                  />
                  <ul className="tags-list">
                    {tags.map((tag, index) => (
                      <li key={index} className="tag">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(index)}>
                          <i className="fas fa-close"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {errors.tags && <Form.Control.Feedback type="invalid">Please provide a tags.</Form.Control.Feedback>}
                </Form.Group>

                <Form.Group className="mt-3">
                  <Form.Label>Choose a video</Form.Label>
                  <Form.Control
                    type="file"
                    placeholder="Upload"
                    id="video-upload"
                    accept="video/mp4"
                    onChange={handleFileChange}
                    required
                    multiple
                  />
                  {errors.videoDetails && <Form.Control.Feedback type="invalid">{errors.videoDetails}</Form.Control.Feedback>}
                  {error && (
                    <Form.Control.Feedback type="invalid">
                      <div className="error-message">{error}</div>
                    </Form.Control.Feedback>
                  )}
                </Form.Group>

                <div
                  className="video-preview mt-3"
                  style={videoDetails.length === 0 ? { height: "50vh" } : {}}
                  ref={listRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                >
                  {videoDetails.length === 0 && (
                    <center className="d-flex justify-content-center flex-column align-item-center w-100">
                      Video Preview <p>You can select multiple videos</p>
                    </center>
                  )}

                  {videoDetails.map((video, index) => (
                    <div className="video-container" key={video.id}>
                      <video controls>
                        <source src={video.previewUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <Form.Group className="mt-3 w-100">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Title"
                          value={video.title}
                          onChange={(e) => handleTitleChange(index, e.target.value)}
                          required
                        />

                        <Form.Group className="mt-3">
                          <Form.Label>Is Private?</Form.Label>
                          <Form.Check
                            type="checkbox"
                            id={`isPrivate-${video.id}`}
                            label="isPrivate"
                            checked={video.isPrivate}
                            onChange={(event) => handleIsPrivateChange(index, event.target.checked)}
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
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                handleThumbnailChange(index, reader.result as string, file);
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </Form.Group>
                      </Form.Group>
                      <button type="button" className="button-container mt-3" onClick={() => deleteSelectedVideos(index)}>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>

                <div className="container d-flex mt-3">
                  <Button variant="primary" className="button-container mt-3  " type="submit">
                    Submit
                  </Button>{" "}
                  <Button
                    variant="primary"
                    className="button-container cancel mt-3 mx-2"
                    onClick={() => navigate("/videos")}
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

export default VideoFormPage;
