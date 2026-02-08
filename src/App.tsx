import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { CalculatorProvider } from './context/CalculatorContext';
import { Header } from './components/Header';
import { Viewfinder } from './features/calculators/Viewfinder';
import './styles/global.css';
import './styles/variables.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CalculatorProvider>
        <div className="app-min-height">
          <Header />
          <Viewfinder />
        </div>
      </CalculatorProvider>
    </ThemeProvider>
  );
};

export default App;
