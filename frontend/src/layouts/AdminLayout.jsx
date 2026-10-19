import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiGrid,
  FiLayers,
  FiPlusCircle,
  FiAlertCircle,
  FiExternalLink,
  FiLogOut,
  FiUser,
  FiMenu,
  FiX
} from 'react-icons/fi';

export const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Lock document/body scrolling while in admin panel to prevent outer vertical scrollbar
  useEffect(() => {
    document.documentElement.classList.add('admin-active');
    document.body.classList.add('admin-active');
    return () => {
      document.documentElement.classList.remove('admin-active');
      document.body.classList.remove('admin-active');
    };
  }, []);

  // Close drawer automatically when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Handle escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // Exactly 4 Admin Sidebar Navigation Items (A. Keep Exactly Four Admin Sidebar Navigation Items)
  const navItems = [
    { to: '/admin', end: true, label: 'Dashboard', icon: <FiGrid size={18} /> },
    { to: '/admin/resources', end: true, label: 'All Resources', icon: <FiLayers size={18} /> },
    { to: '/admin/resources/new', end: false, label: 'Add Resource', icon: <FiPlusCircle size={18} /> },
    { to: '/admin/reports', end: false, label: 'Reports', icon: <FiAlertCircle size={18} /> }
  ];

  const renderNavLinks = (onItemClick) => (
    <div className='py-3'>
      <div className='px-3 mb-2 small text-uppercase text-secondary fw-bold' style={{ letterSpacing: '0.05em', fontSize: '0.75rem' }}>
        Management
      </div>
      <nav className='d-flex flex-column gap-1' aria-label='Admin menu'>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onItemClick}
            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <div className='admin-shell'>
      {/* Top Navbar - Fixed at top of viewport */}
      <header className='admin-navbar' role='banner'>
        <div className='d-flex align-items-center gap-2'>
          {/* Mobile/Tablet Hamburger Menu Toggle */}
          <button
            type='button'
            className='admin-hamburger-btn d-lg-none'
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-expanded={isMobileOpen}
            aria-label='Toggle navigation menu'
          >
            {isMobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>

          {/* Logo & Portal Title */}
          <Link to='/admin' className='text-decoration-none d-flex align-items-center gap-2 text-white'>
            <img src='/icon.svg' alt='Logo' width='30' height='30' className='flex-shrink-0' />
            <span className='fw-bold fs-6 d-none d-sm-inline'>AKTU Notes1965</span>
            <span className='badge bg-primary bg-opacity-25 text-sky border border-primary border-opacity-50 small ms-1'>
              Admin
            </span>
          </Link>
        </div>

        {/* Navbar Right Actions */}
        <div className='d-flex align-items-center gap-2 gap-sm-3'>
          <Link
            to='/'
            target='_blank'
            rel='noopener noreferrer'
            className='btn btn-outline-light btn-sm d-inline-flex align-items-center gap-1 btn-sm-mobile'
            title='View Public Portal'
          >
            <span className='d-none d-md-inline'>View Public Site</span>
            <FiExternalLink size={13} />
          </Link>

          {/* Admin Identity & Logout */}
          <div className='d-flex align-items-center gap-2 text-light small border-start ps-2 ps-sm-3 border-secondary border-opacity-50'>
            <div className='d-flex align-items-center gap-1' title={admin?.email || 'Logged in Admin'}>
              <FiUser size={15} className='text-info flex-shrink-0' />
              <span className='d-none d-sm-inline fw-semibold text-truncate' style={{ maxWidth: '140px' }}>
                {admin?.name || 'Admin'}
              </span>
            </div>

            <button
              type='button'
              onClick={handleLogout}
              className='btn btn-link text-danger text-decoration-none p-0 d-inline-flex align-items-center gap-1 ms-1 ms-sm-2 small'
              title='Log Out'
              aria-label='Log out of admin panel'
            >
              <FiLogOut size={15} />
              <span className='d-none d-md-inline'>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Body: Fixed Left Desktop Sidebar + Independently Scrollable Main Area */}
      <div className='admin-body-container'>
        {/* Desktop Sidebar (Fixed on left, directly below navbar, d-none d-lg-flex) */}
        <aside className='admin-sidebar-desktop d-none d-lg-flex' aria-label='Desktop Sidebar Menu'>
          {renderNavLinks()}
          <div className='mt-auto p-3 text-center border-top border-secondary border-opacity-25'>
            <small className='text-secondary' style={{ fontSize: '0.72rem' }}>
              &copy; {new Date().getFullYear()} AKTU Notes1965
            </small>
          </div>
        </aside>

        {/* Mobile / Tablet Collapsible Slide-in Drawer */}
        <div
          className={`admin-drawer-backdrop ${isMobileOpen ? 'show' : ''}`}
          onClick={() => setIsMobileOpen(false)}
          aria-hidden={!isMobileOpen}
        />
        <aside
          className={`admin-mobile-drawer ${isMobileOpen ? 'open' : ''} d-lg-none`}
          aria-label='Mobile Navigation Drawer'
          aria-hidden={!isMobileOpen}
        >
          <div className='p-3 border-bottom border-secondary border-opacity-25 d-flex justify-content-between align-items-center'>
            <div className='small text-light fw-bold'>Admin Navigation</div>
            <button
              type='button'
              className='btn-close btn-close-white small'
              onClick={() => setIsMobileOpen(false)}
              aria-label='Close navigation menu'
            />
          </div>
          {renderNavLinks(() => setIsMobileOpen(false))}
          <div className='mt-auto p-3 text-center border-top border-secondary border-opacity-25'>
            <small className='text-secondary' style={{ fontSize: '0.72rem' }}>
              &copy; {new Date().getFullYear()} AKTU Notes1965
            </small>
          </div>
        </aside>

        {/* Main Content Area: Beside sidebar, below navbar, ONLY area that scrolls vertically */}
        <main className='admin-main-content' id='admin-main' tabIndex='-1'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
