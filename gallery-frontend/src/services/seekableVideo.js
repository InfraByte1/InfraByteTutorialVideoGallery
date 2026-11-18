// Workaround for videos whose storage server does not support HTTP range
// requests properly (the storage account is on an old service version: it
// answers Chrome's "Range: bytes=0-" with a plain 200 and sends no
// Accept-Ranges header). Chrome then treats the video as a live stream:
// `seekable` stays empty and dragging the timeline snaps back to 0:00.
//
// The proper fix is on the storage account (set its default service version to
// 2023-11-03 or newer); once that is done this helper does nothing, because the
// video is already seekable and it never reloads anything.
//
// While the server is not fixed: once the browser has downloaded the whole
// file, the copy in the browser cache IS seekable, so reloading the same URL
// from there makes the timeline work. Until the download finishes (a few
// seconds for typical tutorials) seeking still snaps back.

const TOLERANCE = 0.25; // seconds

const lastEnd = (ranges) =>
  ranges && ranges.length ? ranges.end(ranges.length - 1) : 0;

/**
 * Watches `video` and, if it ends up fully downloaded but not seekable,
 * reloads it from the cache at the same position and play state.
 * Returns a function that stops watching (call it in the effect cleanup).
 * Safe to call on every video: it reloads at most once.
 */
export const enableSeekFromCache = (video) => {
  if (!video) return () => {};

  const events = ["progress", "canplaythrough", "timeupdate", "ended"];
  let finished = false;

  const stop = () => {
    finished = true;
    events.forEach((name) => video.removeEventListener(name, check));
  };

  function check() {
    if (finished) return;
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    const wanted = duration - TOLERANCE;
    if (lastEnd(video.buffered) < wanted) return; // still downloading

    stop(); // from here on we decide once
    if (lastEnd(video.seekable) >= wanted) return; // already seekable: nothing to do

    const time = video.ended ? 0 : video.currentTime;
    const wasPlaying = !video.paused && !video.ended;
    video.addEventListener(
      "loadedmetadata",
      () => {
        video.currentTime = time;
        if (wasPlaying) video.play().catch(() => {});
      },
      { once: true }
    );
    video.load();
  }

  events.forEach((name) => video.addEventListener(name, check));
  check(); // it may already be fully buffered
  return stop;
};
