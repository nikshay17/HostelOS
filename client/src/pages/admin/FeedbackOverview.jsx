import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllFeedback, getFeedbackSummary } from '../../services/feedbackService';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const FeedbackOverview = () => {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
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
      setSummary(summaryRes.data);
      setFeedbackList(listRes.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load feedback data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token, filterCategory]);

  const renderStars = (rating) => '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Feedback Overview</h2>
          {message && <p style={{ color: 'blue' }}>{message}</p>}

          {loading ? <Loader /> : (
            <>
              <h3>Summary</h3>
              {summary && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p>
                    <strong>Overall Average:</strong> {summary.overall.overallAverage?.toFixed(2) || '—'} / 5
                    {' '}({summary.overall.totalResponses} responses)
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {summary.byCategory.map(cat => (
                      <div key={cat._id} style={{ border: '1px solid #ccc', padding: '1rem' }}>
                        <h4>{cat._id}</h4>
                        <p>{cat.averageRating.toFixed(2)} / 5</p>
                        <p style={{ fontSize: '0.85rem', color: '#666' }}>{cat.totalResponses} responses</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h3>All Feedback</h3>
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ marginBottom: '1rem' }}>
                <option value="">All categories</option>
                <option value="mess">Mess</option>
                <option value="facilities">Facilities</option>
                <option value="staff">Staff</option>
                <option value="general">General</option>
              </select>

              {feedbackList.length === 0 ? <p>No feedback found.</p> : (
                <table border="1" cellPadding="8">
                  <thead>
                    <tr><th>Student</th><th>Category</th><th>Rating</th><th>Comments</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {feedbackList.map(f => (
                      <tr key={f._id}>
                        <td>{f.student.name} ({f.student.studentId})</td>
                        <td>{f.category}</td>
                        <td>{renderStars(f.rating)}</td>
                        <td>{f.comments || '—'}</td>
                        <td>{new Date(f.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default FeedbackOverview;