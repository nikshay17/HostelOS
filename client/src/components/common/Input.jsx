const Input = ({ label, helperText, error, iconLeft, className = '', ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    )}
    <div className="relative">
      {iconLeft && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {iconLeft}
        </div>
      )}
      <input
        className={`
          w-full px-3 py-2 text-sm
          bg-white border rounded-lg
          text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
          transition-colors duration-150
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
          ${error ? 'border-danger focus:ring-danger/30 focus:border-danger' : 'border-gray-300'}
          ${iconLeft ? 'pl-9' : ''}
          ${className}
        `}
        {...props}
      />
    </div>
    {helperText && !error && (
      <p className="mt-1 text-xs text-gray-400">{helperText}</p>
    )}
    {error && (
      <p className="mt-1 text-xs text-danger">{error}</p>
    )}
  </div>
);

export default Input;