import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ToastProvider } from './context/ToastContext';
import { CalculatorProvider } from './context/CalculatorContext';
import { TabbedCalculatorView } from './features/calculators/TabbedCalculatorView';
import './styles/global.css';
import './styles/variables.css';
import './styles/Toast.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <ToastProvider>
          <CalculatorProvider>
            <div className="app-min-height">
              <TabbedCalculatorView />
            </div>
          </CalculatorProvider>
        </ToastProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
};

export default App;
