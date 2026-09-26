import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, ArrowLeftRight, List, User, ShieldCheck, LogOut, Landmark
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout = ({ children, title }: LayoutProps) => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { to: '/transfer', label: 'Transfer', icon: <ArrowLeftRight size={16} /> },
    { to: '/transactions', label: 'Transactions', icon: <List size={16} /> },
    { to: '/profile', label: 'Profile', icon: <User size={16} /> },
  ];

  const initials = user?.username?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <a href="/dashboard" className="sidebar-logo">
          <div className="sidebar-logo-icon"><Landmark size={16} /></div>
          <span className="sidebar-logo-text">SecureBank</span>
        </a>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          {user?.role === 'ADMIN' && (
            <>
              <div className="nav-section-label">Admin</div>
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <ShieldCheck size={16} />
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">{user?.username}</div>
              <div className="user-role">{user?.role?.toLowerCase()}</div>
            </div>
          </div>
          <button className="nav-item btn-danger" style={{ marginTop: 6 }} onClick={logout}>
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">{title}</span>
          <div className="topbar-right">
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </header>
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
