/**
 * Finds the MP4 source URL from the page's video player.
 * AnimeWorld typically uses a <video> element or stores the URL in a data attribute.
 * @returns {string|null}
 */
export function findVideoUrl() {
  // Try: <video> element with <source> tag
  const source = document.querySelector("video source[type='video/mp4']");
  if (source && source.src) {
    return source.src;
  }

  // Try: <video> element src attribute
  const video = document.querySelector("video[src]");
  if (video && video.src && video.src.includes(".mp4")) {
    return video.src;
  }

  // Try: video element currentSrc
  const anyVideo = document.querySelector("video");
  if (anyVideo && anyVideo.currentSrc) {
    return anyVideo.currentSrc;
  }

  // Try: look for the download URL in anchor tags
  const downloadLink = document.querySelector("a[href*='.mp4']");
  if (downloadLink) {
    return downloadLink.href;
  }

  // Try: look in the #player source
  const playerSource = document.querySelector("#player source");
  if (playerSource && playerSource.src) {
    return playerSource.src;
  }

  return null;
}
