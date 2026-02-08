import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { CalculatorConfig, CalculatorAction } from '../types';

interface CalculatorContextType {
  calculators: CalculatorConfig[];
  dispatch: React.Dispatch<CalculatorAction>;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

const calculatorReducer = (state: CalculatorConfig[], action: CalculatorAction): CalculatorConfig[] => {
  switch (action.type) {
    case 'ADD_CALCULATOR':
      return [...state, action.payload];
    case 'UPDATE_CALCULATOR':
      return state.map((calc) => (calc.id === action.payload.id ? action.payload : calc));
    case 'DELETE_CALCULATOR':
      return state.filter((calc) => calc.id !== action.payload);
    default:
      return state;
  }
};

export const CalculatorProvider = ({ children }: { children: ReactNode }) => {
  const [calculators, dispatch] = useReducer(calculatorReducer, []);

  return (
    <CalculatorContext.Provider value={{ calculators, dispatch }}>
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};
