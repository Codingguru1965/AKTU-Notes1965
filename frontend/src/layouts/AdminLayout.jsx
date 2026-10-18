import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiLayers, FiPlusCircle, FiAlertCircle, FiExternalLink, FiLogOut, FiUser } from 'react-icons/fi';

export const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className='d-flex flex-column min-vh-100 bg-light'>
      {/* Admin Top Header */}
      <header className='navbar navbar-expand navbar-dark px-3 shadow-sm' style={{ backgroundColor: 'var(--navy-dark)' }}>
        <Link to='/admin' className='navbar-brand d-flex align-items-center gap-2'>
          <img src='/icon.svg' alt='Logo' width='32' height='32' />
          <span className='fw-bold text-white fs-6'>AKTU Notes1965 &bull; Admin</span>
        </Link>

        <div className='ms-auto d-flex align-items-center gap-3'>
          <Link to='/' target='_blank' className='btn btn-outline-light btn-sm d-inline-flex align-items-center gap-1'>
            <span>View Public Site</span>
            <FiExternalLink size={13} />
          </Link>

          <div className='d-flex align-items-center gap-2 text-light small border-start ps-3 border-secondary'>
            <FiUser size={14} className='text-info' />
            <span className='d-none d-sm-inline fw-semibold'>{admin?.name || 'Admin'}</span>
            <button
              type='button'
              onClick={handleLogout}
              className='btn btn-link text-danger text-decoration-none p-0 d-inline-flex align-items-center gap-1 ms-2 small'
              title='Log Out'
            >
              <FiLogOut size={14} />
              <span className='d-none d-md-inline'>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Body */}
      <div className='container-fluid flex-grow-1'>
        <div className='row min-vh-100'>
          {/* Sidebar */}
          <nav className='col-lg-2 col-md-3 p-0 admin-sidebar d-none d-md-block' aria-label='Admin menu'>
            <div className='py-3'>
              <div className='px-3 mb-2 small text-uppercase text-secondary fw-bold'>Management</div>
              <NavLink to='/admin' end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                <FiGrid size={16} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to='/admin/resources' end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                <FiLayers size={16} />
                <span>All Resources</span>
              </NavLink>
              <NavLink to='/admin/resources/new' className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                <FiPlusCircle size={16} />
                <span>Add Resource</span>
              </NavLink>
              <NavLink to='/admin/reports' className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                <FiAlertCircle size={16} />
                <span>Reports</span>
              </NavLink>
            </div>
          </nav>

          {/* Main Content Area */}
          <main className='col-lg-10 col-md-9 p-4' id='admin-main'>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
