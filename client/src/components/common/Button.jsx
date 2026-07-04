import { FiLoader } from 'react-icons/fi';

const VARIANTS = {
  primary:   'bg-primary text-white hover:bg-primary-hover border border-primary hover:border-primary-hover',
  secondary: 'bg-white text-gray-700 dark:bg-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600',
  danger:    'bg-danger text-white hover:bg-danger-dark border border-danger',
  success:   'bg-success text-white hover:bg-success-dark border border-success',
  ghost:     'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  className = '',
  ...props
}) => (
  <button
    className={`
      inline-flex items-center justify-center gap-2
      font-medium rounded-lg transition-all duration-150
      focus:outline-none focus:ring-2 focus:ring-primary/30
      disabled:opacity-50 disabled:cursor-not-allowed
      ${VARIANTS[variant] || VARIANTS.primary}
      ${SIZES[size] || SIZES.md}
      ${className}
    `}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading
      ? <FiLoader className="animate-spin" size={14} />
      : iconLeft && <span className="shrink-0">{iconLeft}</span>
    }
    {children}
    {!loading && iconRight && <span className="shrink-0">{iconRight}</span>}
  </button>
);

export default Button;