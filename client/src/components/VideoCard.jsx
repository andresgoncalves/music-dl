export default function VideoCard(
  /**
   * @type {{
   *   data: import("../hooks/api").VideoData,
   *   onClick: () => void
   *   selected: boolean
   * }}
   */ { data, selected, onClick },
) {
  return (
    <button
      className={
        "flex w-full flex-col overflow-hidden rounded-xl text-start outline-1 outline-red-500 hover:outline" +
        (selected ? " outline outline-2" : "")
      }
      onClick={onClick}
    >
      <img src={data.thumbnail} alt={data.title} className="rounded-xl" />
      <div className="flex w-full flex-col gap-2 break-words p-2">
        <div className="text-base">{data.title}</div>
        <div className="text-sm">{data.owner}</div>
      </div>
    </button>
  );
}
