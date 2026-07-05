import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllFeedback, getFeedbackSummary } from '../../services/feedbackService';
import PageLayout from '../../components/common/PageLayout';
import PageHeader from '../../components/common/PageHeader';
import SectionHeader from '../../components/common/SectionHeader';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Loader from '../../components/common/Loader';
import ErrorBanner from '../../components/common/ErrorBanner';
import EmptyState from '../../components/common/EmptyState';
import { FiMessageSquare, FiStar, FiFilter } from 'react-icons/fi';

const StarDisplay = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(n => (
      <FiStar key={n} size={12}
        className={n <= rating ? 'text-warning' : 'text-gray-200'}
        style={{ fill: n <= rating ? 'currentColor' : 'none' }}
      />
    ))}
  </div>
);

const FeedbackOverview = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (filterCategory) filters.category = filterCategory;
      const [summaryRes, listRes] = await Promise.all([
        getFeedbackSummary(token),
        getAllFeedback(token, filters)
      ]);

      const summaryData = summaryRes?.data || { byCategory: [], overall: { overallAverage: 0, totalResponses: 0 } };
      const listData = Array.isArray(listRes?.data) ? listRes.data : [];

      setSummary(summaryData);
      setFeedbackList(listData);
    } catch (err) {
      setError('Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token, filterCategory]);

  return (
    <PageLayout>
      <PageHeader title="Feedback Overview" description="Student satisfaction ratings and comments" />
      <ErrorBanner message={error} />

      {loading ? <Loader /> : (
        <>
          {summary && (
            <div className="mb-6">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-card mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">{summary.overall.overallAverage?.toFixed(1) || '—'}</p>
                    <StarDisplay rating={Math.round(summary.overall.overallAverage || 0)} />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{summary.overall.totalResponses} responses</p>
                  </div>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
                    {(summary.byCategory || []).map(cat => (
                      <div key={cat?._id || 'unknown'} className="text-center">
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{(cat?.averageRating ?? 0).toFixed(1)}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{cat?._id || 'Unknown'}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{cat?.totalResponses ?? 0} reviews</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <FiFilter size={14} className="text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="">All categories</option>
              <option value="mess">Mess</option>
              <option value="facilities">Facilities</option>
              <option value="staff">Staff</option>
              <option value="general">General</option>
            </select>
          </div>

          {feedbackList.length === 0 ? (
            <EmptyState title="No feedback found" icon={FiMessageSquare} />
          ) : (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Comments</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {feedbackList.map(f => {
                      const student = f.student || {};
                      const studentName = student.name || 'Unknown student';
                      const studentId = student.studentId || '—';

                      return (
                        <tr key={f._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={studentName} size="sm" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{studentName}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">{studentId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-300 capitalize">{f.category || 'General'}</td>
                          <td className="px-4 py-3"><StarDisplay rating={f.rating || 0} /></td>
                          <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs">
                            <p className="truncate">{f.comments || '—'}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">{f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default FeedbackOverview;