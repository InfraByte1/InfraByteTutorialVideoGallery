import React, { useState } from "react";
import { Accordion, Card, Button } from "react-bootstrap";
import "../../Assets/Css/CategoryAccordion.css";
import { getJobTutorialsByCategorySubCategory } from "../../config/config";
import { getHeaders } from "../../services/auth";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

    var reqData = {
      category:
        selectedCategory ??
        (videoType === "web" ? "Dashboard" : "Driver Portal"),
      subCategory: item.title,
      videoType: videoType,
    };
    var resData;
    await axios
      .post(getJobTutorialsByCategorySubCategory, reqData, {
        headers: getHeaders(),
      })
      .then((response) => {
        console.log(response.data);
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
      <Accordion defaultActiveKey="default">
        <ToastContainer />
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
              onClick={(e) => {
                setSelectedCategory(e.target.textContent);
              }}
            >
              {category.category}
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
    <Accordion defaultActiveKey="0">
      <ToastContainer />
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
            onClick={(e) => {
              setSelectedCategory(e.target.textContent);
              if (setCategorySelected != null) {
                setCategorySelected(e.target.textContent);
              }
            }}
          >
            {category.categoryName}
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
