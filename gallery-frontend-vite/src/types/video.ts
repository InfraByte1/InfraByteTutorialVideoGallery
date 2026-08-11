export interface JobTutorial {
  id: number;
  fileName: string;
  subTitle: string;
  filePath: string;
  thumbnailPath?: string;
  thumbnailName?: string;
  isPrivate?: boolean;
  videoStatus?: string;
}
