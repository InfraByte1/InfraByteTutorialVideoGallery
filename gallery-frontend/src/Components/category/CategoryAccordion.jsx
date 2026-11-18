import React, { useEffect, useState } from "react";
import { Accordion, Card, Button } from "react-bootstrap";
import "../../Assets/Css/CategoryAccordion.css";
import { getJobTutorialsByCategorySubCategory } from "../../config/config";
import { getHeaders } from "../../services/auth";
import axios from "axios";
import { toast } from "react-toastify";
import ThemedToastContainer from "../ThemedToastContainer";
import "react-toastify/dist/ReactToastify.css";
import {
  FiArchive,
  FiBarChart2,
  FiCalendar,
  FiFolder,
  FiGrid,
  FiPackage,
  FiSettings,
  FiTruck,
} from "react-icons/fi";
import { FaCarSide } from "react-icons/fa";

// Picks an icon from the category name; unknown categories get a folder.
const categoryIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("dashboard")) return FiGrid;
  if (n.includes("off") && n.includes("inventory")) return FiArchive;
  if (n.includes("inventory") && !n.includes("vehicle")) return FiPackage;
  if (n.includes("booking")) return FiCalendar;
  if (n.includes("report")) return FiBarChart2;
  if (n.includes("vehicle") || n.includes("inspection")) return FaCarSide;
  if (n.includes("scrap") || n.includes("collection") || n.includes("driver"))
    return FiTruck;
  if (n.includes("setting")) return FiSettings;
  return FiFolder;
};

const CategoryLabel = ({ name, count }) => {
  const Icon = categoryIcon(name);
  return (
    <span className="cat-label">
      <span className="cat-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <span className="cat-name">{name}</span>
      {count > 0 && <span className="cat-count">{count}</span>}
    </span>
  );
};

const CategoryAccordion = ({
  data,
  yourVideosData,
  setSelectedItem,
  setCategorySelected,
  setSelectedSubCategory,
  modalClose,
  videoType,
}) => {
  const [selectedItem, setSelectedAccordionItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 769);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 769);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSelect = async (itemId) => {
    setLoading(true);

    var item = data.reduce((acc, category) => {
      const foundItem = category.subcategories
        .flatMap((subcategory) => subcategory.items)
        .find((item) => item.id === itemId);
      if (foundItem) {
        return foundItem;
      }
      return acc;
    }, null);

    if (item == null) {
      setLoading(false);
      return;
    }

    var category = videoType === "web" ? "Dashboard" : "Driver Portal";
    var reqData = {
      category: selectedCategory ?? category,
      subCategory: selectedCategory == null ? category : item.title,
      videoType: videoType,
    };
    var resData;
    await axios
      .post(getJobTutorialsByCategorySubCategory, reqData, {
        headers: getHeaders(),
      })
      .then((response) => {
        // console.log(response.data);
        resData = response.data;
        // setSelectedItem(response.data);
      })
      .catch((error) => {
        // console.error("Error fetching data:", error);
      });
    setSelectedAccordionItem(item);
    if (resData != null) {
      setSelectedItem(resData);
      modalClose();
    } else {
      toast.info(`${item.title} videos are unavailable`);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (
      (setCategorySelected != null || setCategorySelected === undefined) &&
      selectedItem == null &&
      data != null &&
      Array.isArray(data) &&
      data.length > 0
    ) {
      handleSelect(1);
    }
  }, [data]);

  const handleYourVideo = async (subCategory) => {
    var item = yourVideosData.reduce((acc, category) => {
      const foundItem = category.subCategories.find(
        (item) => item.subCategory === subCategory
      );
      if (foundItem) {
        return foundItem;
      }
      return acc;
    }, null);

    modalClose();

    setSelectedAccordionItem(item);

    setSelectedItem(item);
  };

  if (yourVideosData != null) {
    return (
      <Accordion defaultActiveKey="default" className="category-accordion">
        {isMobile && <ThemedToastContainer />}
        {yourVideosData.map((category) => (
          <Accordion.Item
            eventKey={category.category.toString()}
            key={category.category}
          >
            <Accordion.Header
              className={
                selectedItem != null && selectedItem.category == category
                  ? "active"
                  : ""
              }
              id={category.category}
              onClick={() => {
                setSelectedCategory(category.category);
              }}
            >
              <CategoryLabel
                name={category.category}
                count={category.subCategories.length}
              />
            </Accordion.Header>
            <Accordion.Body>
              {category.subCategories.map((subcategory) => (
                <div key={subcategory.subCategory}>
                  {/* <h5>{subcategory.subcategoryName}</h5> */}
                  <ul>
                    <li
                      key={subcategory.subCategory}
                      onClick={() => handleYourVideo(subcategory.subCategory)}
                      className={
                        selectedItem != null &&
                        selectedItem.subCategory == subcategory.subCategory
                          ? "active"
                          : ""
                      }
                    >
                      {subcategory.subCategory}
                    </li>
                  </ul>
                </div>
              ))}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    );
  }
  return (
    <Accordion defaultActiveKey="0" className="category-accordion">
      {isMobile && <ThemedToastContainer />}
      {data.map((category) => (
        <Accordion.Item
          eventKey={category.categoryId.toString()}
          key={category.categoryId}
          // onClick={(e)=>{setSelectedCategory(e)}}
        >
          <Accordion.Header
            className={
              selectedItem != null &&
              selectedItem.categoryId == category.categoryId
                ? "active"
                : ""
            }
            id={category.categoryName}
            onClick={() => {
              setSelectedCategory(category.categoryName);
              if (setCategorySelected != null) {
                setCategorySelected(category.categoryName);
              }
            }}
          >
            <CategoryLabel
              name={category.categoryName}
              count={category.subcategories.reduce(
                (total, sub) => total + sub.items.length,
                0,
              )}
            />
          </Accordion.Header>
          <Accordion.Body>
            {category.subcategories.map((subcategory) => (
              <div key={subcategory.subcategoryId}>
                {/* <h5>{subcategory.subcategoryName}</h5> */}
                <ul>
                  {subcategory.items.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => {
                        handleSelect(item.id);
                        if (setSelectedSubCategory != null) {
                          setSelectedSubCategory(item.title);
                        }
                      }}
                      className={
                        selectedItem != null && selectedItem.id == item.id
                          ? "active"
                          : ""
                      }
                    >
                      {item.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {loading && (
              <span>
                <div className="loading-spinner"></div>
              </span>
            )}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export default CategoryAccordion;
