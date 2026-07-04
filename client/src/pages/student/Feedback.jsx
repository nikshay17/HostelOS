import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createFeedback, getMyFeedback } from '../../services/feedbackService';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import SectionHeader from '../../components/common/SectionHeader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import SuccessBanner from '../../components/common/SuccessBanner';
import EmptyState from '../../components/common/EmptyState';
import { FiMessageSquare, FiSend, FiStar } from 'react-icons/fi';

const StarRating = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(n => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="focus:outline-none transition-transform hover:scale-110"
      >
        <FiStar
          size={22}
          className={n <= value ? 'text-warning fill-warning' : 'text-gray-300'}
          style={{ fill: n <= value ? 'currentColor' : 'none' }}
        />
      </button>
    ))}
    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">{value}/5</span>
  </div>
);

const Feedback = () => {
  const { token } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: 'mess', rating: 5, comments: '' });

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await getMyFeedback(token);
      setFeedbackList(res.data);
    } catch (err) {
      setError('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedback(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    setSubmitting(true);
    try {
      await createFeedback(form, token);
      setMessage('Thank you for your feedback!');
      setForm({ category: 'mess', rating: 5, comments: '' });
      fetchFeedback();
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader title="Feedback" description="Help us improve hostel services with your feedback" />
      <ErrorBanner message={error} />
      <SuccessBanner message={message} />

      <Card className="p-6 mb-8">
        <SectionHeader title="Submit Feedback" description="Rate your hostel experience" />
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="mess">Mess</option>
              <option value="facilities">Facilities</option>
              <option value="staff">Staff</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Rating</label>
            <StarRating value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Comments (optional)</label>
            <textarea
              placeholder="Share your thoughts..."
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>
          <Button type="submit" loading={submitting} iconLeft={<FiSend size={13} />}>
            Submit Feedback
          </Button>
        </form>
      </Card>

      <SectionHeader title="My Past Feedback" />
      {loading ? <Loader /> : feedbackList.length === 0 ? (
        <EmptyState title="No feedback submitted" description="Your feedback history will appear here" icon={FiMessageSquare} />
      ) : (
        <div className="space-y-3">
          {feedbackList.map(f => (
            <Card key={f._id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{f.category}</span>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map(n => (
                        <FiStar key={n} size={12}
                          className={n <= f.rating ? 'text-warning' : 'text-gray-200'}
                          style={{ fill: n <= f.rating ? 'currentColor' : 'none' }}
                        />
                      ))}
                    </div>
                  </div>
                  {f.comments && <p className="text-sm text-gray-500 dark:text-gray-400">{f.comments}</p>}
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{new Date(f.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-2xl font-bold text-gray-200 dark:text-white">{f.rating}/5</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default Feedback;