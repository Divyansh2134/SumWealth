export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface CurrencyConfig {
    code: CurrencyCode;
    symbol: string;
    locale: string;
    name: string;
}

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
    { code: 'INR', symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', locale: 'en-IE', name: 'Euro' }, // en-IE for English Euro formatting
    { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen' },
];
