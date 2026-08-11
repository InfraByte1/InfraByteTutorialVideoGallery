import { useEffect, useState } from "react";
import { Accordion } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../../Assets/Css/CategoryAccordion.css";
import { getJobTutorialsByCategorySubCategory } from "../../config/config";
import { getHeaders, isAuthenticatedUser } from "../../services/auth";
import type { Category } from "../../types/category";
import type { SelectedCategoryDetail, YourVideosCategoryGroup } from "../../types/videoBrowse";

interface CategoryAccordionProps {
  data: Category[];
  yourVideosData?: YourVideosCategoryGroup[];
  setSelectedItem: (item: SelectedCategoryDetail | null) => void;
  modalClose: () => void;
  videoType?: string;
  setCategorySelected?: (categoryName: string | null) => void;
  setSelectedSubCategory?: (subcategoryName: string | null) => void;
}

const CategoryAccordion = ({
  data,
  yourVideosData,
  setSelectedItem,
  modalClose,
  videoType,
  setCategorySelected,
  setSelectedSubCategory,
}: CategoryAccordionProps) => {
  const [selectedItem, setSelectedAccordionItem] = useState<SelectedCategoryDetail | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const defaultCategoryName = videoType === "web" ? "Dashboard" : "Driver Portal";

  const handleSelect = async (itemId: number) => {
    if (!isAuthenticatedUser()) {
      navigate("/", { replace: true });
      return;
    }

    setLoading(true);

    const item = data.reduce<{ title: string } | null>((acc, category) => {
      const foundItem = category.subcategories.flatMap((subcategory) => subcategory.items).find((item) => item.id === itemId);
      return foundItem ?? acc;
    }, null);

    if (!item) {
      setLoading(false);
      return;
    }

    const reqCategory = selectedCategory ?? defaultCategoryName;
    const reqSubCategory = selectedCategory == null ? defaultCategoryName : item.title;

    try {
      const response = await axios.post<SelectedCategoryDetail>(
        getJobTutorialsByCategorySubCategory,
        { category: reqCategory, subCategory: reqSubCategory, videoType },
        { headers: getHeaders() }
      );
      setSelectedAccordionItem(response.data);
      setSelectedItem(response.data);
      modalClose();
    } catch {
      toast.info(`${item.title} videos are unavailable`);
    } finally {
      setLoading(false);
    }
  };

  const handleYourVideo = (subCategory: string) => {
    if (!yourVideosData) return;

    const item = yourVideosData.reduce<YourVideosCategoryGroup["subCategories"][number] | null>((acc, category) => {
      const foundItem = category.subCategories.find((sub) => sub.subCategory === subCategory);
      return foundItem ?? acc;
    }, null);

    modalClose();
    setSelectedAccordionItem(item);
    setSelectedItem(item);
  };

  useEffect(() => {
    // Auto-select the first item so the page isn't blank on load.
    handleSelect(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (yourVideosData) {
    return (
      <Accordion defaultActiveKey="default">
        {yourVideosData.map((category) => (
          <Accordion.Item eventKey={category.category} key={category.category}>
            <Accordion.Header
              className={selectedItem != null && "category" in selectedItem && selectedItem.category === category.category ? "active" : ""}
              id={category.category}
              onClick={(e) => setSelectedCategory((e.target as HTMLElement).textContent)}
            >
              {category.category}
            </Accordion.Header>
            <Accordion.Body>
              {category.subCategories.map((subcategory) => (
                <div key={subcategory.subCategory}>
                  <ul>
                    <li
                      onClick={() => handleYourVideo(subcategory.subCategory)}
                      className={selectedItem?.subCategory === subcategory.subCategory ? "active" : ""}
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
      {data.map((category) => (
        <Accordion.Item eventKey={category.categoryId.toString()} key={category.categoryId}>
          <Accordion.Header
            className={selectedItem?.category === category.categoryName ? "active" : ""}
            id={category.categoryName}
            onClick={(e) => {
              const categoryName = (e.target as HTMLElement).textContent;
              setSelectedCategory(categoryName);
              setCategorySelected?.(categoryName);
            }}
          >
            {category.categoryName}
          </Accordion.Header>
          <Accordion.Body>
            {category.subcategories.map((subcategory) => (
              <div key={subcategory.subcategoryId}>
                <ul>
                  {subcategory.items.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => {
                        handleSelect(item.id);
                        setSelectedSubCategory?.(item.title);
                      }}
                      className={selectedItem?.subCategory === item.title ? "active" : ""}
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
