const EmptyState = ({ message = 'Nothing here yet', icon = '📭' }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <span className="text-5xl mb-3">{icon}</span>
    <p className="text-sm">{message}</p>
  </div>
);

export default EmptyState;