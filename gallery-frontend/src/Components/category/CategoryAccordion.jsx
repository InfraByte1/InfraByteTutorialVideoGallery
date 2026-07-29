import React, { useState } from "react";
import { Accordion, Card, Button } from "react-bootstrap";
import "../../Assets/Css/CategoryAccordion.css";

const CategoryAccordion = ({ data, setSelectedItem, modalClose }) => {
  const [selectedItem, setSelectedAccordionItem] = useState(null);
  const handleSelect = (itemId) => {
    var item= ( data.reduce((acc, category) => {
      const foundItem = category.subcategories
        .flatMap((subcategory) => subcategory.items)
        .find((item) => item.id === itemId);
      if (foundItem) {
        return foundItem;
      }
      return acc;
    }, null));
    modalClose();
    setSelectedItem(item);
    setSelectedAccordionItem(item);
  };

  return (
    <Accordion defaultActiveKey="0">
      {data.map((category) => (
        <Accordion.Item
          eventKey={category.categoryId.toString()}
          key={category.categoryId}
        >
          <Accordion.Header
            className={
              selectedItem != null &&
              selectedItem.categoryId == category.categoryId
                ? "active"
                : ""
            }
          >
            {category.categoryName}
          </Accordion.Header>
          <Accordion.Body>
            {category.subcategories.map((subcategory) => (
              <div key={subcategory.subcategoryId}>
                {/* <h5>{subcategory.subcategoryName}</h5> */}
                <ul>
                  {subcategory.items.map((item) => (
                    <li key={item.id} onClick={() => handleSelect(item.id)} className={
                      selectedItem != null &&
                      selectedItem.id == item.id
                        ? "active"
                        : ""
                    }>
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
