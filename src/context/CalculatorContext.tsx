import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { CalculatorConfig, CalculatorAction } from '../types';

interface CalculatorContextType {
  calculators: CalculatorConfig[];
  dispatch: React.Dispatch<CalculatorAction>;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

const calculatorReducer = (state: { calculators: CalculatorConfig[] }, action: CalculatorAction) => {
  switch (action.type) {
    case 'ADD_CALCULATOR':
      return { ...state, calculators: [...state.calculators, action.payload] };
    case 'UPDATE_CALCULATOR':
      return {
        ...state,
        calculators: state.calculators.map((calc) =>
          calc.id === action.payload.id ? action.payload : calc
        ),
      };
    case 'DELETE_CALCULATOR':
      return {
        ...state,
        calculators: state.calculators.filter((calc) => calc.id !== action.payload),
      };
    default:
      return state;
  }
};

const initialState = {
    calculators: [
        {
            id: 'default-sip',
            type: 'SIP',
            name: 'My Goal Plan',
            assetClass: 'Mutual Fund',
            createdAt: new Date().toISOString(),
            monthlyAmount: 5000,
            durationYears: 10,
            expectedRatePercent: 12,
            isNew: true
        }
    ] as CalculatorConfig[],
};

export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(calculatorReducer, initialState, (initial) => {
    const saved = localStorage.getItem('calculatorData');
    return saved ? JSON.parse(saved) : initial;
  });

  useEffect(() => {
    localStorage.setItem('calculatorData', JSON.stringify(state));
  }, [state]);

  return (
    <CalculatorContext.Provider value={{ calculators: state.calculators, dispatch }}>
      {children}
    </CalculatorContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
