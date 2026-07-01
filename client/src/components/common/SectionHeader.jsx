const SectionHeader = ({ title, description, actions }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    {actions && <div>{actions}</div>}
  </div>
);

export default SectionHeader;