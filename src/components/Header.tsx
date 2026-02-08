import React from 'react';
import { useTheme } from '../context/ThemeContext';
import '../styles/Header.css';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <div className="container header__content">
        <h1 className="header__title">SumWealth</h1>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
};
