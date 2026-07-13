import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiBook,
  FiTag,
  FiUsers,
  FiUserCheck,
  FiRepeat,
  FiBookmark,
  FiDollarSign,
  FiBarChart2,
  FiClipboard,
  FiSettings,
  FiUser,
} from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';

const NAV_BY_ROLE = {
  admin: [
    { section: 'Overview', items: [{ to: '/dashboard', label: 'Dashboard', icon: FiGrid }] },
    {
      section: 'Catalog',
      items: [
        { to: '/books', label: 'Books', icon: FiBook },
        { to: '/categories', label: 'Categories', icon: FiTag },
      ],
    },
    {
      section: 'People',
      items: [
        { to: '/students', label: 'Students', icon: FiUsers },
        { to: '/librarians', label: 'Librarians', icon: FiUserCheck },
      ],
    },
    {
      section: 'Circulation',
      items: [
        { to: '/borrowing', label: 'Borrowing', icon: FiRepeat },
        { to: '/reservations', label: 'Reservations', icon: FiBookmark },
        { to: '/fines', label: 'Fines', icon: FiDollarSign },
      ],
    },
    {
      section: 'Insights',
      items: [
        { to: '/reports', label: 'Reports', icon: FiBarChart2 },
        { to: '/audit-logs', label: 'Audit Logs', icon: FiClipboard },
      ],
    },
    { section: 'System', items: [{ to: '/settings', label: 'Settings', icon: FiSettings }] },
  ],
  librarian: [
    { section: 'Overview', items: [{ to: '/dashboard', label: 'Dashboard', icon: FiGrid }] },
    {
      section: 'Catalog',
      items: [
        { to: '/books', label: 'Books', icon: FiBook },
        { to: '/categories', label: 'Categories', icon: FiTag },
      ],
    },
    { section: 'People', items: [{ to: '/students', label: 'Students', icon: FiUsers }] },
    {
      section: 'Circulation',
      items: [
        { to: '/borrowing', label: 'Borrowing', icon: FiRepeat },
        { to: '/reservations', label: 'Reservations', icon: FiBookmark },
        { to: '/fines', label: 'Fines', icon: FiDollarSign },
      ],
    },
    { section: 'Insights', items: [{ to: '/reports', label: 'Reports', icon: FiBarChart2 }] },
  ],
  student: [
    { section: 'Overview', items: [{ to: '/dashboard', label: 'My Dashboard', icon: FiGrid }] },
    {
      section: 'Library',
      items: [
        { to: '/books', label: 'Browse Books', icon: FiBook },
        { to: '/reservations', label: 'My Reservations', icon: FiBookmark },
        { to: '/borrowing', label: 'Borrowing History', icon: FiRepeat },
        { to: '/fines', label: 'My Fines', icon: FiDollarSign },
      ],
    },
    { section: 'Account', items: [{ to: '/profile', label: 'Profile', icon: FiUser }] },
  ],
};

const Sidebar = ({ mobile = false }) => {
  const { user } = useAuth();
  const sections = NAV_BY_ROLE[user?.role] || [];

  return (
    <aside className={`w-64 shrink-0 flex-col bg-navy ${mobile ? 'flex h-full' : 'hidden md:flex'}`}>
      <div className="flex items-center gap-2.5 border-b border-white/10 px-6 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-brass text-navy-dark font-serif text-lg font-bold">
          C
        </span>
        <div>
          <p className="font-serif text-base font-semibold leading-tight text-parchment">Cedarbrook</p>
          <p className="text-[11px] uppercase tracking-widest text-parchment/50">Library System</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {sections.map((section) => (
          <div key={section.section} className="mb-6">
            <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-widest text-parchment/40">
              {section.section}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-white/10 text-parchment font-medium border-l-2 border-brass -ml-0.5 pl-[11px]'
                          : 'text-parchment/70 hover:bg-white/5 hover:text-parchment'
                      }`
                    }
                  >
                    <Icon size={17} />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
