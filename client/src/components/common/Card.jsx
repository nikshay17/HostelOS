const Card = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`
      bg-white border border-gray-200 rounded-xl shadow-card
      transition-all duration-200
      ${onClick ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5' : ''}
      ${className}
    `}
  >
    {children}
  </div>
);

export default Card;