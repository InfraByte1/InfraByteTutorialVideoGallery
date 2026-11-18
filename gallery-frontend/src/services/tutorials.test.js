import { findTutorialById } from "./tutorials";

const list = [
  {
    category: "Web",
    subCategories: [
      {
        videoTitle: "A",
        videoTutorials: [{ id: "AAAA-1", filePath: "https://x/a.mp4" }],
      },
      {
        videoTitle: "B",
        videoTutorials: [
          { id: "bbbb-2", filePath: "https://x/b.mp4" },
          { id: "cccc-3", filePath: "https://x/c.mp4" },
        ],
      },
    ],
  },
  { category: "Mobile", subCategories: [] },
  { category: "Odd", subCategories: [{ videoTutorials: null }] },
];

describe("findTutorialById", () => {
  test("finds a video in any category", () => {
    expect(findTutorialById(list, "cccc-3").filePath).toBe("https://x/c.mp4");
  });

  test("ignores letter case and surrounding spaces", () => {
    expect(findTutorialById(list, " aaaa-1 ").filePath).toBe("https://x/a.mp4");
    expect(findTutorialById(list, "BBBB-2").filePath).toBe("https://x/b.mp4");
  });

  test("returns null when the video is not in the list", () => {
    expect(findTutorialById(list, "zzzz-9")).toBeNull();
  });

  test("copes with missing or malformed data", () => {
    expect(findTutorialById(null, "aaaa-1")).toBeNull();
    expect(findTutorialById({}, "aaaa-1")).toBeNull();
    expect(findTutorialById([null, {}], "aaaa-1")).toBeNull();
    expect(findTutorialById(list, "")).toBeNull();
    expect(findTutorialById(list, undefined)).toBeNull();
  });
});
