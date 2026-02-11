export type CalculatorType = 'SIP' | 'StepUpSIP' | 'SWP' | 'Lumpsum' | 'Inflation' | 'Currency';

export type StepUpFrequency = 'quarterly' | 'semiannually' | 'annually';
export type SWPFrequency = 'monthly' | 'quarterly' | 'annually';

export interface BaseCalculatorConfig {
    id: string;
    name: string;
    type: CalculatorType;
    assetClass?: string; // e.g., 'Equity', 'Debt', 'Gold'
    createdAt: string; // ISO string
    isNew?: boolean;
}


export interface SIPConfig extends BaseCalculatorConfig {
    type: 'SIP';
    monthlyAmount: number;
    durationYears: number;
    expectedRatePercent: number;
    inflationRate?: number;
}

export interface StepUpSIPConfig extends BaseCalculatorConfig {
    type: 'StepUpSIP';
    initialMonthlyAmount: number;
    durationYears: number;
    expectedRatePercent: number;
    stepUpPercentage: number;
    stepUpFrequency: StepUpFrequency;
    inflationRate?: number;
}

export interface SWPConfig extends BaseCalculatorConfig {
    type: 'SWP';
    lumpSumAmount: number;
    withdrawalAmount: number;
    frequency: SWPFrequency;
    durationYears: number;
    expectedRatePercent: number;
    inflationRate?: number;
}

export interface LumpsumConfig extends BaseCalculatorConfig {
    type: 'Lumpsum';
    lumpSumAmount: number;
    expectedRatePercent: number;
    durationYears: number;
    inflationRate?: number;
}

export interface InflationConfig extends BaseCalculatorConfig {
    type: 'Inflation';
    rate: number;
}

export interface CurrencyConfig extends BaseCalculatorConfig {
    type: 'Currency';
    rate: number;
}

export type CalculatorConfig = SIPConfig | StepUpSIPConfig | SWPConfig | LumpsumConfig | InflationConfig | CurrencyConfig;

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

// State Action Types
export type CalculatorAction =
    | { type: 'ADD_CALCULATOR'; payload: CalculatorConfig }
    | { type: 'UPDATE_CALCULATOR'; payload: CalculatorConfig }
    | { type: 'DELETE_CALCULATOR'; payload: string };

// Toast Types
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}
