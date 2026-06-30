import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createFeedback, getMyFeedback } from '../../services/feedbackService';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Loader from '../../components/common/Loader';

const Feedback = () => {
  const { token } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ category: 'mess', rating: 5, comments: '' });

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await getMyFeedback(token);
      setFeedbackList(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedback(); }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await createFeedback(form, token);
      setMessage('Thanks for your feedback!');
      setForm({ category: 'mess', rating: 5, comments: '' });
      fetchFeedback();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Submission failed');
    }
  };

  const renderStars = (rating) => '⭐'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{ padding: '1rem', flex: 1 }}>
          <h2>Feedback</h2>
          {message && <p style={{ color: 'blue' }}>{message}</p>}

          <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="mess">Mess</option>
              <option value="facilities">Facilities</option>
              <option value="staff">Staff</option>
              <option value="general">General</option>
            </select>

            <div style={{ marginTop: '0.5rem' }}>
              <label>Rating: </label>
              {[1, 2, 3, 4, 5].map(n => (
                <label key={n} style={{ marginRight: '0.5rem' }}>
                  <input
                    type="radio"
                    name="rating"
                    value={n}
                    checked={form.rating === n}
                    onChange={() => setForm({ ...form, rating: n })}
                  />
                  {n}
                </label>
              ))}
            </div>

            <textarea placeholder="Additional comments (optional)" value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              rows="3" style={{ width: '100%', marginTop: '0.5rem' }} />

            <button type="submit" style={{ marginTop: '0.5rem' }}>Submit Feedback</button>
          </form>

          <h3>My Past Feedback</h3>
          {loading ? <Loader /> : feedbackList.length === 0 ? <p>No feedback submitted yet.</p> : (
            <div>
              {feedbackList.map(f => (
                <div key={f._id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
                  <p><strong>Category:</strong> {f.category}</p>
                  <p><strong>Rating:</strong> {renderStars(f.rating)}</p>
                  {f.comments && <p><strong>Comments:</strong> {f.comments}</p>}
                  <p style={{ fontSize: '0.85rem', color: '#666' }}>{new Date(f.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Feedback;