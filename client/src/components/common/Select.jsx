const Select = ({ label, helperText, error, className = '', children, ...props }) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
    )}
    <select
      className={`
        w-full px-3 py-2 text-sm bg-white dark:bg-gray-900
        border rounded-lg text-gray-900 dark:text-white
        focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
        transition-colors duration-150 cursor-pointer
        disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
        ${error ? 'border-danger' : 'border-gray-300'}
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
    {helperText && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{helperText}</p>}
    {error && <p className="mt-1 text-xs text-danger">{error}</p>}
  </div>
);

export default Select;