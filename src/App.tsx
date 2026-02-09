import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { CalculatorProvider } from './context/CalculatorContext';
import { TabbedCalculatorView } from './features/calculators/TabbedCalculatorView';
import './styles/global.css';
import './styles/variables.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CalculatorProvider>
        <div className="app-min-height">
          <TabbedCalculatorView />
        </div>
      </CalculatorProvider>
    </ThemeProvider>
  );
};

export default App;
