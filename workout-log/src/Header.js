import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import Font Awesome
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'; // Import the sun and moon icons

function Header({ isDarkMode, toggleDarkMode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg p-4`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Hamburger menu for mobile on the left */}
        <div className="md:hidden flex items-center">
          <button
            onClick={handleMenuToggle}
            className="text-gray-500 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
              />
            </svg>
          </button>
        </div>

        {/* Logo or Site Name */}
        <div className="text-2xl font-bold text-green-400">
          <Link to="/">Workout Tracker</Link>
        </div>

        {/* Navigation Links for desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} hover:text-green-400`}
          >
            Home
          </Link>
          <Link
            to="/startingweights"
            className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} hover:text-green-400`}
          >
            Starting Weights
          </Link>
          <Link
            to="/calendar"
            className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} hover:text-green-400`}
          >
            Calendar
          </Link>
        </nav>

        {/* Toggle Switch with Sun/Moon Icons */}
        <div className="flex items-center ml-4">
          <label className="relative inline-block w-16 h-8">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={toggleDarkMode}
              className="opacity-0 w-0 h-0"
            />
            <span
              className={`slider round ${isDarkMode ? 'bg-blue-600' : 'bg-orange-400'} shadow-lg`}
              style={{
                borderRadius: '34px',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.15)', // 3D look
              }}
            ></span>
            <FontAwesomeIcon
              icon={isDarkMode ? faMoon : faSun}
              className={`absolute left-2 top-1/2 transform -translate-y-1/2 text-white transition-all duration-300 ease-in-out ${isDarkMode ? 'translate-x-full' : ''}`}
              style={{
                fontSize: '18px',
              }}
            />
          </label>
        </div>
      </div>

      {/* Sliding Menu from Left */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-gray-900 z-50 transform ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={handleMenuToggle}
            className="text-gray-500 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col space-y-6 p-4 text-white">
          <Link to="/" className="text-lg font-medium" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/startingweights" className="text-lg font-medium" onClick={closeMenu}>
            Starting Weights
          </Link>
          <Link to="/calendar" className="text-lg font-medium" onClick={closeMenu}>
            Calendar
          </Link>
        </nav>
      </div>

      {/* Overlay when menu is open */}
      {menuOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
        />
      )}
    </header>
  );
}

export default Header;
