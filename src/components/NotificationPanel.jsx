import { useEffect, useMemo, useState } from 'react';
import MaterialIcon from './MaterialIcon.jsx';
import {
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../services/notificationService.js';

function NotificationPanel({ receiverUid }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadNotifications() {
      if (!receiverUid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const notificationData = await getUserNotifications(receiverUid);
        if (!ignore) {
          setNotifications(notificationData);
        }
      } catch (loadError) {
        if (!ignore) {
          setError('Gagal memuat notifikasi.');
          console.error(loadError);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      ignore = true;
    };
  }, [receiverUid]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.readStatus).length,
    [notifications],
  );

  async function handleMarkAsRead(notificationId) {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? { ...notification, readStatus: true } : notification,
        ),
      );
    } catch (markError) {
      setError(markError.message || 'Gagal menandai notifikasi.');
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsAsRead(receiverUid);
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, readStatus: true })),
      );
    } catch (markError) {
      setError(markError.message || 'Gagal menandai semua notifikasi.');
    }
  }

  return (
    <section className="notification-panel">
      <div className="notification-header">
        <div>
          <p className="eyebrow">Notifikasi</p>
          <h2>
            <MaterialIcon name="notifications" filled />
            Notifikasi Terbaru
          </h2>
        </div>
        <button type="button" onClick={handleMarkAllAsRead} disabled={!unreadCount}>
          <MaterialIcon name="task_alt" size="sm" />
          Tandai Semua Dibaca
        </button>
      </div>

      {error && <p className="form-message error">{error}</p>}
      {loading && <p>Memuat notifikasi...</p>}
      {!loading && !notifications.length && <p>Belum ada notifikasi.</p>}

      <div className="notification-list">
        {!loading &&
          notifications.slice(0, 5).map((notification) => (
            <article
              className={`notification-item ${notification.readStatus ? '' : 'notification-unread'}`}
              key={notification.id}
            >
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
                <span>{notification.type || 'info'}</span>
              </div>
              {!notification.readStatus && (
                <button type="button" onClick={() => handleMarkAsRead(notification.id)}>
                  <MaterialIcon name="check_circle" size="sm" />
                  Dibaca
                </button>
              )}
            </article>
          ))}
      </div>
    </section>
  );
}

export default NotificationPanel;
