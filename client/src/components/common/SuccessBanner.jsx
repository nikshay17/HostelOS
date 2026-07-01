import { FiCheckCircle, FiX } from 'react-icons/fi';
import { useState } from 'react';

const SuccessBanner = ({ message }) => {
  const [dismissed, setDismissed] = useState(false);
  if (!message || dismissed) return null;
  return (
    <div className="flex items-start gap-3 bg-success-light border border-green-200 text-success-dark px-4 py-3 rounded-xl mb-4 text-sm">
      <FiCheckCircle size={16} className="shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      <button onClick={() => setDismissed(true)} className="shrink-0 text-success hover:text-success-dark">
        <FiX size={14} />
      </button>
    </div>
  );
};

export default SuccessBanner;