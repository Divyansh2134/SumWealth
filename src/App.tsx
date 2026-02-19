import React, { Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ToastProvider } from './context/ToastContext';
import { CalculatorProvider } from './context/CalculatorContext';
import { TabbedCalculatorView } from './features/calculators/TabbedCalculatorView';
import './styles/global.css';
import './styles/variables.css';
import './styles/Toast.css';

// Lazy-load below-the-fold components
const SEOContent = React.lazy(() =>
  import('./components/SEOContent').then(m => ({ default: m.SEOContent }))
);
const Footer = React.lazy(() =>
  import('./components/Footer').then(m => ({ default: m.Footer }))
);

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <ToastProvider>
          <CalculatorProvider>
            <div className="app-min-height">
              <TabbedCalculatorView />
              <Suspense fallback={null}>
                <SEOContent />
              </Suspense>
            </div>
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </CalculatorProvider>
        </ToastProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
};

export default App;
