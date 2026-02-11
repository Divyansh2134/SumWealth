import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import '../styles/Header.css';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency, availableCurrencies } = useCurrency();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container header__content">
        <h1 className="header__title">WealthSum</h1>
        <div className="header-actions">
          <div className="currency-selector" style={{ position: 'relative', marginRight: '0.5rem' }}>
            <button
              className="icon-btn"
              onClick={() => setIsCurrencyMenuOpen(!isCurrencyMenuOpen)}
              title="Change Currency"
              style={{ fontSize: '1.2rem', width: '40px', height: '40px' }}
            >
              {currency.symbol}
            </button>
            {isCurrencyMenuOpen && (
              <div className="menu-dropdown" style={{ minWidth: '120px', right: 0 }}>
                {availableCurrencies.map(c => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.code);
                      setIsCurrencyMenuOpen(false);
                    }}
                    className={currency.code === c.code ? 'active' : ''}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      backgroundColor: currency.code === c.code ? 'var(--bg-secondary)' : 'transparent',
                      color: currency.code === c.code ? 'var(--primary-color)' : 'var(--text-primary)'
                    }}
                  >
                    <span>{c.code}</span>
                    <span>{c.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
