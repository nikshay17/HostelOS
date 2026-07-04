import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { broadcastNotification } from '../../services/notificationService';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import { FiBell, FiSend } from 'react-icons/fi';

const Broadcast = () => {
  const { token } = useAuth();
  const [form, setForm] = useState({ title: '', message: '', type: 'info' });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const TYPE_STYLES = {
    info: 'border-primary-light bg-primary-light/30',
    warning: 'border-warning-light bg-warning-light/30',
    alert: 'border-danger-light bg-danger-light/30',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    setSending(true);
    try {
      const res = await broadcastNotification(form, token);
      setMessage(res.data.message);
      setForm({ title: '', message: '', type: 'info' });
    } catch (err) {
      setError(err.response?.data?.message || 'Broadcast failed');
    } finally {
      setSending(false);
    }
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";

  return (
    <PageLayout>
      <PageHeader
        title="Broadcast Announcement"
        description="Send a notification to all registered students"
      />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      <div className="max-w-xl">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notification Type</label>
              <div className="flex items-center gap-3">
                {['info', 'warning', 'alert'].map(type => (
                  <label
                    key={type}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-colors capitalize
                      ${form.type === type ? TYPE_STYLES[type] + ' border-current' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={form.type === type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="sr-only"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
              <input
                placeholder="e.g. Water Supply Interruption"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
              <textarea
                placeholder="Write your announcement here..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className={`p-3 rounded-lg border ${TYPE_STYLES[form.type]}`}>
              <div className="flex items-center gap-2 mb-1">
                <FiBell size={13} />
                <span className="text-xs font-semibold">{form.title || 'Notification Preview'}</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{form.message || 'Your message will appear here...'}</p>
            </div>
            <Button type="submit" loading={sending} className="w-full" iconLeft={<FiSend size={13} />}>
              Send to All Students
            </Button>
          </form>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Broadcast;