/**
 * Finds one video in the nested "all tutorials" response:
 *   [{ category, subCategories: [{ videoTitle, videoTutorials: [{ id, ... }] }] }]
 * Returns the video entry (it has filePath, subTitle, thumbnailPath, isPrivate, ...)
 * or null. Ids are compared case-insensitively.
 *
 * Used when GetJobTutorialById fails: the list endpoint is the same data, so a
 * shared link can still be resolved from it.
 */
export const findTutorialById = (categories, id) => {
  if (!Array.isArray(categories) || !id) return null;
  const wanted = String(id).trim().toLowerCase();

  for (const category of categories) {
    for (const group of category?.subCategories ?? []) {
      for (const video of group?.videoTutorials ?? []) {
        if (video && String(video.id).toLowerCase() === wanted) return video;
      }
    }
  }
  return null;
};
