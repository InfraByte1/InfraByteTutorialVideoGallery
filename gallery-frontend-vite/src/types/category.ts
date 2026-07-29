export interface Thumbnail {
  title: string;
  url: string;
  videoUrl?: string;
}

export interface CategoryItem {
  id: number;
  title: string;
  thumbnails: Thumbnail[];
}

export interface Subcategory {
  subcategoryId: number;
  subcategoryName: string;
  items: CategoryItem[];
}

export interface Category {
  categoryId: number;
  categoryName: string;
  subcategories: Subcategory[];
}
