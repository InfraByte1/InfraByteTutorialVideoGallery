export interface Thumbnail {
  title: string;
  url: string;
  videoUrl?: string;
}

export interface CategoryItem {
  id: number;
  title: string;
  // Permission key gating this item for web; categoryKey2 is the mobile
  // equivalent, only present on entries in mobileCategory.
  categoryKey: string;
  categoryKey2?: string;
  // Most items list playable thumbnails; some (e.g. Inventory's "In Stock")
  // are action-only links into another part of the app instead.
  thumbnails?: Thumbnail[];
  actions?: boolean;
}

export interface Subcategory {
  subcategoryId: number;
  subcategoryName: string;
  categoryKey: string;
  items: CategoryItem[];
}

export interface Category {
  categoryId: number;
  categoryName: string;
  categoryKey: string;
  subcategories: Subcategory[];
}
