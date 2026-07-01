const STYLES = {
  // Success
  paid:        'bg-success-light text-success-dark',
  approved:    'bg-success-light text-success-dark',
  resolved:    'bg-success-light text-success-dark',
  present:     'bg-success-light text-success-dark',
  completed:   'bg-success-light text-success-dark',
  available:   'bg-success-light text-success-dark',
  active:      'bg-success-light text-success-dark',
  // Warning
  pending:     'bg-warning-light text-warning-dark',
  'in-progress':'bg-warning-light text-warning-dark',
  overdue:     'bg-warning-light text-warning-dark',
  unpaid:      'bg-warning-light text-warning-dark',
  late:        'bg-warning-light text-warning-dark',
  maintenance: 'bg-warning-light text-warning-dark',
  // Danger
  rejected:    'bg-danger-light text-danger-dark',
  absent:      'bg-danger-light text-danger-dark',
  cancelled:   'bg-danger-light text-danger-dark',
  full:        'bg-danger-light text-danger-dark',
  // Neutral
  open:        'bg-gray-100 text-gray-600',
  info:        'bg-primary-light text-primary-dark',
};

const Badge = ({ status, className = '' }) => (
  <span className={`
    inline-flex items-center px-2.5 py-0.5
    rounded-full text-xs font-semibold capitalize
    ${STYLES[status] || 'bg-gray-100 text-gray-600'}
    ${className}
  `}>
    {status?.replace('-', ' ')}
  </span>
);

export default Badge;