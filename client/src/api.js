/**
 * @template {Object} T
 * @typedef {Promise<T | null>} ApiResponse<T>
 */

/**
 * @typedef {{
 *   video_id: string,
 *   title: string,
 *   thumbnail: string,
 *   owner: string,
 *   owner_id: string
 * }} VideoData
 */

/**
 * @typedef {{
 *   id: number,
 *   title: string,
 *   duration: number,
 *   album: {
 *     id: number,
 *     cover: string,
 *     title: string
 *   },
 *   artist: {
 *     id: number,
 *     name: string,
 *     picture: string
 *   }
 * }} TrackData
 */

/**
 * @typedef {{
 *   id: number,
 *   cover: string,
 *   title: string,
 *   tracks: {
 *     data: TrackData[]
 *   }
 *   genres: {
 *     data: {
 *       id: number,
 *       name: string
 *     }[]
 *   }
 * }} AlbumData
 */

/**
 * @param {string} endpoint
 * @returns {ApiResponse}
 */
async function getApi(endpoint) {
  const url = new URL(endpoint, window.location);
  if (import.meta.env.DEV) {
    url.port = 5000;
  }
  const res = await fetch(url);
  if (res.ok) {
    const json = await res.json();
    return json;
  } else {
    return null;
  }
}

/**
 * @param {string} track_id
 * @param {string} video_id
 * @returns {Promise<boolean>}
 */
export async function downloadAudio(track_id, video_id) {
  const url = new URL(
    `/api/download/${encodeURIComponent(track_id)}/${encodeURIComponent(
      video_id,
    )}`,
    window.location,
  );

  if (import.meta.env.DEV) {
    url.port = 5000;
  }

  try {
    const res = await fetch(url.href, { method: "HEAD" });
    if (res.ok) {
      const anchor = document.createElement("a");
      document.body.appendChild(anchor);
      anchor.href = url.href;
      anchor.download = true;
      anchor.style.display = "none";
      anchor.click();
      document.body.removeChild(anchor);
      return true;
    }
  } catch (e) {
    console.error(e);
  }
  return false;
}

/**
 * @param {string} query
 * @returns {ApiResponse<TrackData[]>}
 */
export function getSearch(query) {
  return getApi("/api/search?q=" + encodeURIComponent(query)).then(
    (json) => json.data,
  );
}

/**
 *  @param {string} query
 *  @returns {ApiResponse<VideoData[]>}
 */
export function getVideos(query) {
  return getApi("/api/videos?q=" + encodeURIComponent(query)).then(
    (json) => json.data,
  );
}

/**
 * @param {string} album_id
 * @returns {ApiResponse<AlbumData>}
 */
export function getAlbum(album_id) {
  return getApi("/api/album/" + encodeURIComponent(album_id));
}

/**
 * @param {string} track_id
 * @returns {Object}
 */
export function getTrack(track_id) {
  return getApi("/api/track/" + encodeURIComponent(track_id));
}

/**
 * @param {string} artist_id
 * @returns {Object}
 */
export function getArtist(artist_id) {
  return getApi("/api/artist/" + encodeURIComponent(artist_id));
}
