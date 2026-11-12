import React, { useState } from "react";
import { MAX_TAG_LENGTH } from "./validation";

/**
 * Chip style tag input. Tags are committed on Enter / comma / blur / paste of
 * comma separated text, de-duplicated (case-insensitive) and removable.
 */
const TagInput = ({ id, tags, onChange, invalid, onBlur }) => {
  const [value, setValue] = useState("");

  const addTags = (raw) => {
    const incoming = raw
      .split(",")
      .map((t) => t.trim().slice(0, MAX_TAG_LENGTH))
      .filter(Boolean);
    if (incoming.length === 0) return;

    const next = [...tags];
    incoming.forEach((tag) => {
      if (!next.some((t) => t.toLowerCase() === tag.toLowerCase())) {
        next.push(tag);
      }
    });
    onChange(next);
  };

  const commit = () => {
    addTags(value);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !value && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className={`tag-input ${invalid ? "is-invalid" : ""}`}>
      {tags.map((tag) => (
        <span key={tag} className="tag-chip">
          {tag}
          <button
            type="button"
            aria-label={`Remove tag ${tag}`}
            onClick={() => onChange(tags.filter((t) => t !== tag))}
          >
            <i className="fas fa-xmark" aria-hidden="true"></i>
          </button>
        </span>
      ))}
      <input
        id={id}
        type="text"
        value={value}
        maxLength={MAX_TAG_LENGTH * 5}
        placeholder={tags.length ? "Add another…" : "e.g. job booking, invoices"}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          commit();
          onBlur && onBlur();
        }}
        aria-invalid={invalid ? "true" : undefined}
      />
    </div>
  );
};

export default TagInput;
