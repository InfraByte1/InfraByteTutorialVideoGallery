// Shapes inferred from how CategoryAccordion/ThumbnailGrid/YourVideoListsPage
// consume these responses — not a confirmed API contract. Fields are
// optional where a given mode (browsing the catalog vs. "your videos")
// doesn't populate them.

export interface VideoTutorialEntry {
  id: string;
  filePath: string;
  // "your videos" (flat) mode uses `title`; category-browsing mode uses `subTitle`.
  title?: string;
  subTitle?: string;
  thumbnailName?: string | null;
  // In browsing mode this is a directory, combined with thumbnailName as
  // `${thumbnailPath}/${thumbnailName}`. In "your videos" mode it's already
  // the full image URL, used directly.
  thumbnailPath?: string | null;
  isPrivate?: boolean;
  videoStatus?: string;
}

export interface SubCategoryDetail {
  // Browsing mode keys each entry by videoTitle (used as the accordion item key).
  videoTitle?: string;
  description?: string;
  videoTutorials: VideoTutorialEntry[];
}

// What CategoryAccordion.handleSelect fetches and hands to ThumbnailGrid as
// `selectedItem`. subCategories is populated in browsing mode; videoTutorials
// directly in "your videos" mode. `category` is absent in "your videos" mode
// (the per-subcategory object there never carries its parent category name).
export interface SelectedCategoryDetail {
  category?: string;
  subCategory: string;
  description?: string;
  subCategories?: SubCategoryDetail[];
  videoTutorials?: VideoTutorialEntry[];
}

// What getAllJobTutorials returns for the "your videos" page.
export interface YourVideosCategoryGroup {
  category: string;
  subCategories: Array<{
    subCategory: string;
    description?: string;
    videoTutorials: VideoTutorialEntry[];
  }>;
}
