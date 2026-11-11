export default function Input({ label, type = "text", value, onChange, placeholder, error }) {
  return (
    <div className="flex flex-col mb-4">
      {label && <label className="mb-1 text-sm font-semibold text-gray-700">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
          error ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-blue-200"
        }`}
      />
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
}