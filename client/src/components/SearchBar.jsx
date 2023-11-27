export default function SearchBar(
  /**
   * @type {{
   *   value: string,
   *   placeholder: string,
   *   onChange: () => void,
   *   onSearch: () => void
   * }}
   */ { value, placeholder, onChange, onSearch },
) {
  return (
    <form
      className="flex overflow-hidden rounded-lg border border-red-300 focus-within:border-red-500"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(value);
      }}
    >
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 px-4 outline-none"
      />
      <button
        type="submit"
        className="flex items-center justify-center bg-red-500 px-8 py-2 text-center  font-semibold text-white hover:bg-red-400"
      >
        Buscar
      </button>
    </form>
  );
}
