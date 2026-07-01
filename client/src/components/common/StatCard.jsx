import Card from './Card';

const StatCard = ({ title, value, description, icon: Icon, iconColor = 'text-primary', iconBg = 'bg-primary-light', trend }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
      </div>
      {Icon && (
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
      )}
    </div>
  </Card>
);

export default StatCard;