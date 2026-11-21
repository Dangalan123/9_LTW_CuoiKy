export const InputField = ({
  id,
  label,
  type = 'text',
  name,
  value,
  placeholder = '',
  error = '',
  required = false,
  min,
  step,
  onChange,
}) => {
  const inputId = id || name;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        onChange={onChange}
        className={`w-full rounded-lg border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white ${
          error
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30'
            : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/30 dark:border-slate-600'
        }`}
      />
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
};

export default InputField;
