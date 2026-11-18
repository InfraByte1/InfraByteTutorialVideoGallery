import { enableSeekFromCache } from "./seekableVideo";

const ranges = (...pairs) => ({
  length: pairs.length,
  start: (i) => pairs[i][0],
  end: (i) => pairs[i][1],
});

// A tiny stand-in for an HTMLVideoElement.
const makeVideo = (props = {}) => {
  const listeners = {};
  const video = {
    duration: 30,
    buffered: ranges(),
    seekable: ranges(),
    currentTime: 0,
    paused: false,
    ended: false,
    load: jest.fn(),
    play: jest.fn(() => Promise.resolve()),
    addEventListener: (name, fn) => {
      (listeners[name] = listeners[name] || []).push(fn);
    },
    removeEventListener: (name, fn) => {
      listeners[name] = (listeners[name] || []).filter((f) => f !== fn);
    },
    emit: (name) => (listeners[name] || []).slice().forEach((fn) => fn()),
    listenerCount: (name) => (listeners[name] || []).length,
    ...props,
  };
  return video;
};

describe("enableSeekFromCache", () => {
  test("does nothing while the video is still downloading", () => {
    const video = makeVideo({ buffered: ranges([0, 10]) });
    enableSeekFromCache(video);
    video.emit("progress");
    expect(video.load).not.toHaveBeenCalled();
  });

  test("does nothing when the video is already seekable (server fixed)", () => {
    const video = makeVideo({
      buffered: ranges([0, 30]),
      seekable: ranges([0, 30]),
    });
    enableSeekFromCache(video);
    expect(video.load).not.toHaveBeenCalled();
    expect(video.listenerCount("progress")).toBe(0); // stopped watching
  });

  test("reloads from cache at the same time when fully buffered but not seekable", () => {
    const video = makeVideo({
      buffered: ranges([0, 10]),
      currentTime: 4,
    });
    enableSeekFromCache(video);

    video.buffered = ranges([0, 30]); // download finishes, still not seekable
    video.currentTime = 12;
    video.emit("progress");

    expect(video.load).toHaveBeenCalledTimes(1);

    video.currentTime = 0; // the reload resets the position
    video.emit("loadedmetadata");
    expect(video.currentTime).toBe(12);
    expect(video.play).toHaveBeenCalledTimes(1); // it was playing
  });

  test("keeps a paused video paused after the reload", () => {
    const video = makeVideo({
      buffered: ranges([0, 30]),
      paused: true,
      currentTime: 7,
    });
    enableSeekFromCache(video);
    video.emit("loadedmetadata");
    expect(video.currentTime).toBe(7);
    expect(video.play).not.toHaveBeenCalled();
  });

  test("only ever reloads once", () => {
    const video = makeVideo({ buffered: ranges([0, 30]) });
    enableSeekFromCache(video);
    video.emit("progress");
    video.emit("timeupdate");
    video.emit("canplaythrough");
    expect(video.load).toHaveBeenCalledTimes(1);
  });

  test("the returned function stops watching", () => {
    const video = makeVideo({ buffered: ranges([0, 10]) });
    const stop = enableSeekFromCache(video);
    stop();
    video.buffered = ranges([0, 30]);
    video.emit("progress");
    expect(video.load).not.toHaveBeenCalled();
  });

  test("ignores a video whose duration is not known yet", () => {
    const video = makeVideo({ duration: NaN, buffered: ranges([0, 30]) });
    enableSeekFromCache(video);
    expect(video.load).not.toHaveBeenCalled();
  });

  test("accepts no video", () => {
    expect(() => enableSeekFromCache(null)()).not.toThrow();
  });
});
