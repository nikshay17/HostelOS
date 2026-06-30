import { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    if (!open) fetchNotifications(); // refresh list when opening
    setOpen(!open);
  };

  const handleClickNotification = (n) => {
    if (!n.read) markAsRead(n._id);
  };

  const typeColor = (type) => {
    if (type === 'alert') return '#ef4444';
    if (type === 'warning') return '#f59e0b';
    return '#4f46e5';
  };

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={handleToggle} style={{ position: 'relative', cursor: 'pointer' }}>
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -6, right: -6,
            background: 'red', color: 'white', borderRadius: '50%',
            fontSize: '0.7rem', padding: '2px 6px'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '2rem', width: '320px',
          background: 'white', border: '1px solid #ccc', borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 100, maxHeight: '400px', overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{ fontSize: '0.8rem' }}>Mark all read</button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>No notifications</p>
          ) : (
            notifications.map(n => (
              <div
                key={n._id}
                onClick={() => handleClickNotification(n)}
                style={{
                  padding: '0.75rem', borderBottom: '1px solid #eee', cursor: 'pointer',
                  background: n.read ? 'white' : '#f5f5ff',
                  borderLeft: `3px solid ${typeColor(n.type)}`
                }}
              >
                <p style={{ margin: 0, fontWeight: n.read ? 'normal' : 'bold' }}>{n.title}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#555' }}>{n.message}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#999' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;