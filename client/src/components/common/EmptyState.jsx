import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ title = 'Nothing here yet', description, icon: Icon = FiInbox, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4 transition-colors duration-300">
      <Icon size={32} className="text-gray-400 dark:text-gray-500" />
    </div>
    <h4 className="text-base font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-300">{title}</h4>
    {description && (
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 max-w-xs transition-colors duration-300">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;