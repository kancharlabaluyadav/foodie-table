import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from './api';
import { useAuth } from './context';

interface Notice {
  id: string;
  type: 'order' | 'reservation' | 'account';
  title: string;
  message: string;
  href: string;
  readAt: string | null;
  createdAt: string;
}

function dateLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function NotificationsPage() {
  const { user, ready } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    try {
      const result = await api<{ notifications: Notice[]; unreadCount: number }>('/notifications');
      setNotices(result.notifications);
      setUnreadCount(result.unreadCount);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Notifications could not be loaded.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (ready && user) void load(); else if (ready) setLoading(false); }, [ready, user, load]);

  async function markRead(id: string) {
    const current = notices.find((item) => item.id === id);
    if (!current || current.readAt) return;
    try {
      await api(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
      setNotices((items) => items.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'This notification could not be updated.'); }
  }

  async function markAllRead() {
    setSaving(true); setError(''); setNotice('');
    try {
      const result = await api<{ message: string }>('/notifications/read-all', { method: 'POST' });
      const readAt = new Date().toISOString();
      setNotices((items) => items.map((item) => ({ ...item, readAt: item.readAt || readAt })));
      setUnreadCount(0); setNotice(result.message);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Notifications could not be updated.'); }
    finally { setSaving(false); }
  }

  if (!ready) return <div className="section-wrap page-content narrow-content"><p className="quiet-message">Checking your account…</p></div>;
  if (!user) return <div className="section-wrap page-content narrow-content"><p className="eyebrow">FOODIE TABLE · UPDATES</p><h1>Sign in to see updates.</h1><p className="page-lede">Order and reservation updates are saved to your account.</p><Link className="button button-reserve" to="/account">Sign in</Link></div>;

  return <div className="section-wrap page-content notifications-page">
    <header className="page-intro"><p className="eyebrow">YOUR FOODIE TABLE</p><h1>Updates</h1><p className="page-lede">Order and reservation activity saved to your account.</p></header>
    <div className="notifications-toolbar"><p>{unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'You are all caught up.'}</p>{unreadCount > 0 && <button className="button button-outline-dark" type="button" disabled={saving} onClick={() => void markAllRead()}>{saving ? 'Saving…' : 'Mark all as read'}</button>}</div>
    {error && <p className="notice is-error" role="alert">{error}</p>}{notice && <p className="notice" role="status">{notice}</p>}
    {loading ? <p className="quiet-message">Loading updates…</p> : notices.length === 0 ? <section className="notifications-empty"><p className="eyebrow">NO UPDATES YET</p><h2>We’ll keep your account current.</h2><p>Updates about your delivery orders and table requests will appear here.</p><div className="button-row"><Link className="button button-reserve" to="/menu">Explore the menu</Link><Link className="button button-outline-dark" to="/reservations">Reserve a table</Link></div></section> : <div className="notification-list">
      {notices.map((item) => <article className={`notification-card${item.readAt ? '' : ' is-unread'}`} key={item.id}>
        <div className="notification-copy"><div className="notification-card-heading"><span className="eyebrow">{item.type}</span>{!item.readAt && <span className="notification-unread">New</span>}</div><h2>{item.title}</h2><p>{item.message}</p><time dateTime={item.createdAt}>{dateLabel(item.createdAt)}</time></div>
        <div className="notification-actions"><Link className="button button-outline-dark" to={item.href} onClick={() => void markRead(item.id)}>Open</Link>{!item.readAt && <button className="button-text" type="button" onClick={() => void markRead(item.id)}>Mark read</button>}</div>
      </article>)}
    </div>}
  </div>;
}
