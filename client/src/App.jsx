import { useCallback, useEffect, useRef, useState } from "react";
import SearchBar from "./components/SearchBar";
import { downloadAudio, getAlbum, getSearch, getVideos } from "./api";
import TrackCard from "./components/TrackCard";
import VideoCard from "./components/VideoCard";

/**
 *  @typedef {{
 *    track: import("./api").TrackData,
 *    video: import("./api").VideoData,
 *    status: "finished" | "pending" | "error"
 *  }} DownloadQueueItem
 */

export default function App() {
  const [searchValue, setSearchValue] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const modalRef = useRef();

  /** @type {[import("./api").TrackData[], React.Dispatch<React.SetStateAction<import("./api").TrackData[]>]} */
  const [trackResults, setTrackResults] = useState(null);

  /** @type {[import("./api").VideoData[], React.Dispatch<React.SetStateAction<import("./api").VideoData[]>]} */
  const [videoResults, setVideoResults] = useState(null);

  /** @type {[import("./api").TrackData, React.Dispatch<React.SetStateAction<import("./api").TrackData>]} */
  const [selectedTrack, setSelectedTrack] = useState(null);

  /** @type {[import("./api").VideoData, React.Dispatch<React.SetStateAction<import("./api").VideoData>]} */
  const [selectedVideo, setSelectedVideo] = useState(null);

  /** @type {[import("./api").AlbumData, React.Dispatch<React.SetStateAction<import("./api").AlbumData>]} */
  const [selectedAlbum, setSelectedAlbum] = useState(null);

  /** @type {[DownloadQueueItem[], React.Dispatch<React.SetStateAction<DownloadQueueItem[]>]} */
  const [downloadQueue, setDownloadQueue] = useState([]);

  const handleSearch = useCallback(async (/** @type {string} */ query) => {
    setTrackResults(null);
    setVideoResults(null);
    setSelectedVideo(null);
    setSelectedAlbum(null);
    setSelectedTrack(null);
    const results = await getSearch(query);
    setTrackResults(results);
  }, []);

  const handleVideoSelect = useCallback(
    async (/** @type {import("./api").VideoData}*/ video) => {
      setSelectedVideo(video);
    },
    [],
  );

  const handleTrackSelect = useCallback(
    async (/** @type {import("./api").TrackData}*/ track) => {
      setVideoResults(null);
      setSelectedVideo(null);
      if (track.album.id !== selectedAlbum?.id) {
        setSelectedAlbum(null);
      }
      setSelectedTrack(track);
      const videoResults = await getVideos(
        `${track.title} - ${track.artist.name}`,
      );
      setVideoResults(videoResults);
      if (videoResults.length > 0) {
        handleVideoSelect(videoResults[0]);
      }
      if (track.album.id !== selectedAlbum?.id) {
        const albumResult = await getAlbum(track.album.id);
        setSelectedAlbum(albumResult);
      }
    },
    [handleVideoSelect, selectedAlbum?.id],
  );

  const handleDownload = useCallback(
    async (
      /** @type {import("./api").TrackData}*/ track,
      /** @type {import("./api").VideoData}*/ video,
    ) => {
      if (
        track &&
        video &&
        !downloadQueue.find(
          (item) =>
            item.track.id === track.id &&
            item.video.video_id === video.video_id &&
            item.status === "pending",
        )
      ) {
        setDownloadQueue((queue) => [
          { track, video, status: "pending" },
          ...queue,
        ]);
        const success = await downloadAudio(track.id, video.video_id);
        setDownloadQueue((queue) => {
          const newQueue = [...queue];
          newQueue.find(
            (item) =>
              item.track.id === track.id &&
              item.video.video_id === video.video_id,
          ).status = success ? "finished" : "error";
          return newQueue;
        });
      }
    },
    [downloadQueue],
  );

  const handleRetry = useCallback(
    async (
      /** @type {import("./api").TrackData}*/ track,
      /** @type {import("./api").VideoData}*/ video,
    ) => {
      if (
        track &&
        video &&
        downloadQueue.find(
          (item) =>
            item.track.id === track.id &&
            item.video.video_id === video.video_id &&
            item.status === "error",
        )
      ) {
        setDownloadQueue((queue) => {
          const newQueue = [...queue];
          newQueue.find(
            (item) =>
              item.track.id === track.id &&
              item.video.video_id === video.video_id,
          ).status = "pending";
          return newQueue;
        });
        const success = await downloadAudio(track.id, video.video_id);
        setDownloadQueue((queue) => {
          const newQueue = [...queue];
          newQueue.find(
            (item) =>
              item.track.id === track.id &&
              item.video.video_id === video.video_id,
          ).status = success ? "finished" : "error";
          return newQueue;
        });
      }
    },
    [downloadQueue],
  );

  useEffect(() => {
    const json = localStorage.getItem("downloads");
    json && setDownloadQueue(JSON.parse(json));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "downloads",
      JSON.stringify(downloadQueue.filter((item) => item.status !== "pending")),
    );
  }, [downloadQueue]);

  return (
    <main className="mb-24">
      <section className="p-8 pb-0">
        <SearchBar
          value={searchValue}
          placeholder="Buscar canciones"
          onChange={setSearchValue}
          onSearch={handleSearch}
        />
      </section>
      {trackResults ? (
        <section>
          <div className="p-8 pb-0 text-xl font-bold">Canciones</div>
          <div className="w-full overflow-x-auto">
            <div className="grid w-max grid-flow-col-dense grid-rows-1 items-center gap-4 p-4 sm:grid-rows-2">
              {trackResults.map((track) => (
                <div key={track.id} className="w-[320px]">
                  <TrackCard
                    data={track}
                    selected={track.id === selectedTrack?.id}
                    downloaded={
                      !!downloadQueue.find(
                        (item) =>
                          item.track.id === track.id &&
                          item.status === "finished",
                      )
                    }
                    onClick={() => handleTrackSelect(track)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <div className="px-8 py-32 text-center text-gray-500">
          Realice una búsqueda para empezar
        </div>
      )}
      {videoResults && (
        <section>
          <div className="p-8 pb-0 text-xl font-bold">Videos</div>
          <div className="w-full overflow-x-auto">
            <div className="grid w-max grid-flow-col-dense grid-rows-1 gap-4 p-4">
              {videoResults.map((video) => (
                <div key={video.video_id} className="w-[240px]">
                  <VideoCard
                    data={video}
                    selected={video.video_id === selectedVideo?.video_id}
                    onClick={() => handleVideoSelect(video)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {selectedAlbum?.tracks?.data && (
        <section>
          <div className="p-8 pb-0 text-xl font-bold">Álbum</div>
          <div className="w-full overflow-x-auto">
            <div className="grid w-max grid-flow-col-dense grid-rows-1 items-center gap-4 p-4 sm:grid-rows-2">
              {selectedAlbum.tracks.data.map((track) => (
                <div key={track.id} className="w-[320px]">
                  <TrackCard
                    data={track}
                    selected={track.id === selectedTrack?.id}
                    downloaded={
                      !!downloadQueue.find(
                        (item) =>
                          item.track.id === track.id &&
                          item.status === "finished",
                      )
                    }
                    onClick={() => handleTrackSelect(track)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      {downloadQueue && downloadQueue.length > 0 && (
        <section>
          <div className="p-8 pb-0 text-xl font-bold">Cola de descarga</div>
          <div className="w-full">
            <div className="grid grid-cols-1 items-center gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
              {downloadQueue.map(({ track, video, status }, key) => (
                <div key={key}>
                  <TrackCard
                    data={track}
                    status={status}
                    onClick={
                      status === "error"
                        ? () => handleRetry(track, video)
                        : async () => {
                            await handleTrackSelect(track);
                            await handleVideoSelect(video);
                          }
                    }
                  />
                </div>
              ))}
            </div>
            {downloadQueue.length > 0 && (
              <div className="flex justify-center p-4">
                <button
                  onClick={async () => setDownloadQueue([])}
                  className="rounded-lg px-4 py-2 text-center font-semibold text-red-500 hover:bg-red-100"
                >
                  Borrar historial
                </button>
              </div>
            )}
          </div>
        </section>
      )}
      {selectedTrack && selectedVideo && (
        <aside className="fixed bottom-0 left-0 flex w-full flex-row-reverse gap-4 border-t bg-white p-4">
          <button
            onClick={() => handleDownload(selectedTrack, selectedVideo)}
            className="rounded-lg bg-red-500 px-4 py-2 text-center font-semibold text-white hover:bg-red-400"
          >
            Descargar
          </button>
          <button
            onClick={() => setPreviewOpen(true)}
            className="rounded-lg px-4 py-2 text-center font-semibold text-red-500 hover:bg-red-100"
          >
            Previsualizar
          </button>
        </aside>
      )}
      {previewOpen && (
        <aside
          ref={modalRef}
          onClick={(event) =>
            event.target === modalRef.current && setPreviewOpen(false)
          }
          className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,.75)] p-4"
        >
          <iframe
            src={`https://www.youtube.com/embed/${selectedVideo.video_id}`}
            className="aspect-video max-h-full w-full max-w-2xl overflow-hidden rounded-2xl"
          />
        </aside>
      )}
    </main>
  );
}
