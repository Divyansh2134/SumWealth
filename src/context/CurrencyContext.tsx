/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { SUPPORTED_CURRENCIES, type CurrencyCode, type CurrencyConfig } from '../utils/constants';

interface CurrencyContextType {
    currency: CurrencyConfig;
    setCurrency: (code: CurrencyCode) => void;
    availableCurrencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Default to INR or load from local storage
    const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(() => {
        const saved = localStorage.getItem('app_currency');
        return (saved as CurrencyCode) || 'INR';
    });

    useEffect(() => {
        localStorage.setItem('app_currency', currencyCode);
    }, [currencyCode]);

    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];

    const handleSetCurrency = (code: CurrencyCode) => {
        setCurrencyCode(code);
    };

    return (
        <CurrencyContext.Provider value={{
            currency,
            setCurrency: handleSetCurrency,
            availableCurrencies: SUPPORTED_CURRENCIES
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = (): CurrencyContextType => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
