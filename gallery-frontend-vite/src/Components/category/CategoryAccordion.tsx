import { useState } from "react";
import { Accordion } from "react-bootstrap";
import "../../Assets/Css/CategoryAccordion.css";
import type { Category, CategoryItem } from "../../types/category";

interface CategoryAccordionProps {
  data: Category[];
  setSelectedItem: (item: CategoryItem | null) => void;
  modalClose: () => void;
}

const CategoryAccordion = ({ data, setSelectedItem, modalClose }: CategoryAccordionProps) => {
  const [selectedItem, setSelectedAccordionItem] = useState<CategoryItem | null>(null);

  const handleSelect = (itemId: number) => {
    const item = data.reduce<CategoryItem | null>((acc, category) => {
      const foundItem = category.subcategories
        .flatMap((subcategory) => subcategory.items)
        .find((item) => item.id === itemId);
      return foundItem ?? acc;
    }, null);
    modalClose();
    setSelectedItem(item);
    setSelectedAccordionItem(item);
  };

  return (
    <Accordion defaultActiveKey="0">
      {data.map((category) => (
        <Accordion.Item eventKey={category.categoryId.toString()} key={category.categoryId}>
          <Accordion.Header>{category.categoryName}</Accordion.Header>
          <Accordion.Body>
            {category.subcategories.map((subcategory) => (
              <div key={subcategory.subcategoryId}>
                <ul>
                  {subcategory.items.map((item) => (
                    <li
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={selectedItem != null && selectedItem.id === item.id ? "active" : ""}
                    >
                      {item.title}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export default CategoryAccordion;
