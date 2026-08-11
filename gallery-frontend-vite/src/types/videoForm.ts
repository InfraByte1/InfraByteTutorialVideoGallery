export interface VideoDetail {
  id: number;
  videoUrl: File;
  previewUrl: string;
  title: string;
  thumbnail: string | null;
  thumbnailFile: File | null;
  isPrivate: boolean;
}

export interface VideoFormErrors {
  category?: string;
  subCategory?: string;
  tags?: string;
  videoDetails?: string;
  title?: string;
}

export type VideoType = "web" | "mobile";

// Used on the update/edit form, which juggles two kinds of entries: "online"
// ones already on the server (videoUrl is a server URL, id is its real
// tutorial id) and "offline" ones just picked from disk (videoUrl is a File,
// id is a throwaway local index). A discriminated union on `type` so TS
// narrows videoUrl/id correctly wherever `type` is checked.
export interface OnlineVideoDetail {
  type: "online";
  id: string;
  videoUrl: string;
  previewUrl: string;
  title: string;
  thumbnail: string | null;
  // Existing server thumbnail path unless the user picked a new file.
  thumbnailFile: File | string | null;
  isPrivate: boolean;
}

export interface OfflineVideoDetail {
  type: "offline";
  id: number;
  videoUrl: File;
  previewUrl: string;
  title: string;
  thumbnail: string | null;
  thumbnailFile: File | null;
  isPrivate: boolean;
}

export type EditableVideoDetail = OnlineVideoDetail | OfflineVideoDetail;

export interface VideoTutorial {
  id: string;
  filePath: string;
  subTitle: string;
  isPrivate: boolean;
  thumbnailName: string | null;
  thumbnailPath: string | null;
}

// The shape VideoFormUpdatePage requires via useLocation().state — whatever
// navigates here (e.g. an "edit" action on YourVideoListsPage) must pass
// this.
export interface UpdateItemState {
  category: string;
  subCategory: string;
  subCategories: Array<{
    videoTitle: string;
    description: string;
    tags: string[];
    videoTutorials: VideoTutorial[];
  }>;
}
