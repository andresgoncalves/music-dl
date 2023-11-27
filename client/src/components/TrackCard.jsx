export default function TrackCard(
  /**
   * @type {{
   *   data: import("../hooks/api").TrackData,
   *   selected: boolean,
   *   downloaded: boolean,
   *   status: "pending" | "finished" | "error",
   *   onClick: () => void
   * }}
   */ { data, selected, downloaded, status, onClick },
) {
  return (
    <button
      className={
        "flex w-full items-center overflow-hidden rounded-xl  bg-white text-start outline-1 outline-red-500 hover:outline" +
        (downloaded
          ? " outline outline-2 outline-green-500"
          : selected
          ? " outline outline-2"
          : "")
      }
      onClick={onClick}
    >
      <img
        src={data.album.cover}
        alt={data.album.title}
        className="h-[120px] w-[120px] rounded-xl"
      />
      <div className=" flex w-full flex-1 flex-col gap-1 break-words px-4 py-2">
        <div className="text-base">{data.title}</div>
        <div className="text-sm">{data.album.title}</div>
        <div className="text-sm">{data.artist.name}</div>
      </div>
      {status && (
        <div
          className={
            "flex-0 p-4 pl-0 text-sm font-semibold max-[480px]:text-xs " +
            (status === "finished"
              ? "text-green-500"
              : status === "pending"
              ? "text-gray-500"
              : "text-red-500")
          }
        >
          {status === "finished"
            ? "Completado"
            : status === "pending"
            ? "Pendiente"
            : "Reintentar"}
        </div>
      )}
    </button>
  );
}
