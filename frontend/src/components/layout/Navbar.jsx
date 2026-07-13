import { useState, useEffect, useRef, useCallback } from 'react';
import { FiBell, FiChevronDown, FiLogOut, FiUser, FiMenu } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const roleLabel = { admin: 'Administrator', librarian: 'Librarian', student: 'Student' };

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch {
      // notifications are non-critical; fail silently
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // poll every minute
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all');
    loadNotifications();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-navy/10 bg-white px-4 md:px-8">
      <button onClick={onMenuClick} className="rounded-sm p-2 text-navy hover:bg-parchment md:hidden" aria-label="Open menu">
        <FiMenu size={20} />
      </button>
      <div className="hidden md:block" />

      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative rounded-sm p-2 text-navy/70 hover:bg-parchment hover:text-navy"
            aria-label="Notifications"
          >
            <FiBell size={19} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rust text-[10px] font-medium text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 z-20 mt-2 w-80 rounded-sm border border-navy/10 bg-white shadow-card">
              <div className="flex items-center justify-between border-b border-navy/10 px-4 py-3">
                <p className="text-sm font-medium text-navy-dark">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-brass-dark hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-navy/40">Nothing here yet.</p>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id} className={`border-b border-navy/5 px-4 py-3 ${!n.isRead ? 'bg-brass/5' : ''}`}>
                      <p className="text-sm font-medium text-navy-dark">{n.title}</p>
                      <p className="mt-0.5 text-xs text-navy/60">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 rounded-sm py-1.5 pl-1.5 pr-2 hover:bg-parchment">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy font-serif text-sm font-semibold text-parchment">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium leading-tight text-navy-dark">{user?.name}</span>
              <span className="block text-xs leading-tight text-navy/50">{roleLabel[user?.role]}</span>
            </span>
            <FiChevronDown size={15} className="text-navy/40" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-sm border border-navy/10 bg-white py-1 shadow-card">
              <a href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-navy-dark hover:bg-parchment">
                <FiUser size={15} /> My Profile
              </a>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-rust hover:bg-rust-light"
              >
                <FiLogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
