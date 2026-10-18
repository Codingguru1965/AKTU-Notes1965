import React from 'react';
import { Link, NavLink } from 'react-router-dom';

export const Navbar = () => {
  return (
    <nav className='navbar navbar-expand-lg navbar-aktu sticky-top' aria-label='Main navigation'>
      <div className='container'>
        <Link to='/' className='navbar-brand d-flex align-items-center gap-2'>
          <img src='/logo.svg' alt='AKTU Notes1965 Logo' className='navbar-brand-img' />
        </Link>

        <button
          className='navbar-toggler border-0'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#mainNavbar'
          aria-controls='mainNavbar'
          aria-expanded='false'
          aria-label='Toggle navigation'
        >
          <span className='navbar-toggler-icon'></span>
        </button>

        <div className='collapse navbar-collapse' id='mainNavbar'>
          <ul className='navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-1'>
            <li className='nav-item'>
              <NavLink to='/' className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`} end>
                Home
              </NavLink>
            </li>
            <li className='nav-item'>
              <NavLink to='/resources' className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`}>
                Browse Resources
              </NavLink>
            </li>
            <li className='nav-item'>
              <NavLink to='/about' className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`}>
                About
              </NavLink>
            </li>
            <li className='nav-item'>
              <NavLink to='/contact' className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`}>
                Contact
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};
