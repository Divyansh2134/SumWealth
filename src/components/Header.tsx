import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import '../styles/Header.css';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container header__content">
        <h1 className="header__title">WealthSum</h1>
        <div className="header-actions">
          <button
            className="theme-toggle icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title="Toggle Theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <div className="hamburger-wrapper" style={{ position: 'relative' }}>
            <button
              className="icon-btn hamburger-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              ☰
            </button>
            {isMenuOpen && (
              <div className="menu-dropdown">
                <button onClick={() => alert('Profile Clicked')}>Profile</button>
                <button onClick={() => alert('Settings Clicked')}>Settings</button>
                <button onClick={() => alert('Help Clicked')}>Help</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
