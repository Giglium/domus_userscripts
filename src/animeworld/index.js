import "../lib/css/style.scss";
import { bootstrap } from "../lib/core/bootstrap.js";
import { createDownloadButton } from "../lib/dom/downloadButton.js";
import { findVideoUrl } from "../lib/dom/videoFinder.js";

bootstrap(() => {
  const btn = createDownloadButton(() => {
    const url = findVideoUrl();

    if (!url) {
      alert(
        "Could not find the video URL. Try playing the video first, then click download again.",
      );
      return;
    }

    const filename = getFilename(url);

    if (typeof GM_download === "function") {
      GM_download({
        url,
        name: filename,
        onerror: (err) => {
          console.error("GM_download failed, falling back to link click", err);
          fallbackDownload(url, filename);
        },
      });
    } else {
      fallbackDownload(url, filename);
    }
  });

  document.body.appendChild(btn);
});

/**
 * Extracts a filename from the URL or page title.
 */
function getFilename(url) {
  try {
    const urlPath = new URL(url).pathname;
    const segments = urlPath.split("/");
    const lastSegment = segments[segments.length - 1];
    if (lastSegment && lastSegment.includes(".mp4")) {
      return decodeURIComponent(lastSegment);
    }
  } catch (e) {
    // ignore
  }

  const title = document.title.replace(/[^\w\s-]/g, "").trim();
  return `${title || "video"}.mp4`;
}

/**
 * Fallback download method using an anchor element.
 */
function fallbackDownload(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
