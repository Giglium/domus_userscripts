/**
 * Finds the MP4 source URL from the AnimeWorld page.
 *
 * AnimeWorld loads the video player dynamically. The video URL can be found by:
 * 1. Looking for an already-loaded iframe/video in the player area
 * 2. Fetching the episode's iframe src from the API using the episode data-id
 * 3. Parsing the iframe page for the actual MP4 source
 *
 * @returns {Promise<string|null>}
 */
export async function findVideoUrl () {
  // Strategy 1: Check if there's already an iframe loaded in the player
  const playerIframe =
    document.querySelector('#player iframe') ||
    document.getElementById('player-iframe')
  if (playerIframe && playerIframe.src) {
    const url = await fetchAndExtractVideo(playerIframe.src)
    if (url) return url
  }

  // Strategy 2: Check for a <video> element already in the DOM
  const directUrl = extractVideoFromDocument(document)
  if (directUrl) return directUrl

  // Strategy 3: Get the episode ID and fetch the video URL from the API
  const episodeId = getActiveEpisodeId()
  if (episodeId) {
    const url = await fetchVideoFromApi(episodeId)
    if (url) return url
  }

  return null
}

/**
 * Gets the active episode's data-id from the episode list.
 * @returns {string|null}
 */
function getActiveEpisodeId () {
  // The active episode link has class "active"
  const activeEp = document.querySelector('.server.active .episodes a.active')
  if (activeEp) {
    return activeEp.getAttribute('data-id')
  }

  // Fallback: get from the player div
  const player = document.getElementById('player')
  if (player) {
    return player.getAttribute('data-id')
  }

  return null
}

/**
 * Fetches the video URL using AnimeWorld's internal API.
 * The site uses /api/episode/info?id=<episodeDataId> or similar endpoints.
 * @param {string} episodeId
 * @returns {Promise<string|null>}
 */
async function fetchVideoFromApi (episodeId) {
  // Try the info endpoint
  const infoUrl = `${window.location.origin}/api/episode/info?id=${episodeId}`
  const data = await gmFetch(infoUrl)
  if (data) {
    // The API may return a grabber URL or direct link
    if (data.grabber) {
      const grabberData = await gmFetch(data.grabber)
      if (grabberData && Array.isArray(grabberData)) {
        const mp4 = grabberData.find(
          (item) => item.file && item.file.includes('.mp4')
        )
        if (mp4) return mp4.file
        // Return first available file
        if (grabberData.length > 0 && grabberData[0].file) {
          return grabberData[0].file
        }
      }
    }
    if (data.target) {
      // target might be the iframe URL
      const videoUrl = await fetchAndExtractVideo(data.target)
      if (videoUrl) return videoUrl
      // Or it might be a direct MP4 link
      if (data.target.includes('.mp4')) return data.target
      return data.target
    }
  }

  // Try the server endpoint
  const serverUrl = `${window.location.origin}/api/episode/serverPlayerAnime498?id=${episodeId}`
  const serverData = await gmFetch(serverUrl)
  if (serverData && serverData.target) {
    const videoUrl = await fetchAndExtractVideo(serverData.target)
    if (videoUrl) return videoUrl
    return serverData.target
  }

  return null
}

/**
 * Makes a GET request using GM_xmlhttpRequest and returns parsed JSON.
 * @param {string} url
 * @returns {Promise<object|null>}
 */
function gmFetch (url) {
  return new Promise((resolve) => {
    if (typeof GM_xmlhttpRequest === 'undefined') {
      // Fallback to fetch for same-origin requests
      fetch(url, { credentials: 'include' })
        .then((r) => r.json())
        .then(resolve)
        .catch(() => resolve(null))
      return
    }

    GM_xmlhttpRequest({
      method: 'GET',
      url,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      onload: (response) => {
        try {
          resolve(JSON.parse(response.responseText))
        } catch (e) {
          resolve(null)
        }
      },
      onerror: () => resolve(null)
    })
  })
}

/**
 * Extracts a video URL from a document's DOM.
 * @param {Document} doc
 * @returns {string|null}
 */
function extractVideoFromDocument (doc) {
  // <video> with <source type="video/mp4">
  const source = doc.querySelector("video source[type='video/mp4']")
  if (source && source.src) return source.src

  // <video src="...">
  const video = doc.querySelector('video[src]')
  if (video && video.src) return video.src

  // <video> currentSrc
  const anyVideo = doc.querySelector('video')
  if (anyVideo && anyVideo.currentSrc) return anyVideo.currentSrc

  // <source> without type attribute
  const anySource = doc.querySelector('video source')
  if (anySource && anySource.src) return anySource.src

  return null
}

/**
 * Fetches an iframe/page URL and extracts the video source from its HTML.
 * @param {string} url
 * @returns {Promise<string|null>}
 */
function fetchAndExtractVideo (url) {
  return new Promise((resolve) => {
    if (typeof GM_xmlhttpRequest === 'undefined') {
      resolve(null)
      return
    }

    GM_xmlhttpRequest({
      method: 'GET',
      url,
      onload: (response) => {
        const html = response.responseText

        // Look for <source src="...">
        const sourceMatch = html.match(/<source[^>]+src=["']([^"']+)["']/i)
        if (sourceMatch) {
          resolve(sourceMatch[1])
          return
        }

        // Look for <video src="...">
        const videoSrcMatch = html.match(/<video[^>]+src=["']([^"']+)["']/i)
        if (videoSrcMatch) {
          resolve(videoSrcMatch[1])
          return
        }

        // Look for file: "..." pattern (common in JS-based players)
        const fileMatch = html.match(/file:\s*["']([^"']+)["']/i)
        if (fileMatch) {
          resolve(fileMatch[1])
          return
        }

        // Look for url: "..." or src: "..." with video extensions
        const urlMatch = html.match(
          /(?:url|src|source|file)\s*[:=]\s*["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/i
        )
        if (urlMatch) {
          resolve(urlMatch[1])
          return
        }

        // Look for any URL with video extensions
        const mp4Match = html.match(
          /["'](https?:\/\/[^"'\s]+\.(?:mp4|m3u8)[^"'\s]*)["']/i
        )
        if (mp4Match) {
          resolve(mp4Match[1])
          return
        }

        resolve(null)
      },
      onerror: () => resolve(null)
    })
  })
}
