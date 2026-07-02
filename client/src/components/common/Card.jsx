const Card = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl shadow-sm
      transition-all duration-200
      ${onClick ? 'cursor-pointer hover:shadow-md dark:hover:shadow-black/30 hover:-translate-y-0.5' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

export default Card;