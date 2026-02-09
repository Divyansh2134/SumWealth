export type CalculatorType = 'SIP' | 'StepUpSIP' | 'SWP' | 'Lumpsum' | 'Inflation' | 'Currency';

export type StepUpFrequency = 'quarterly' | 'semiannually' | 'annually';
export type SWPFrequency = 'monthly' | 'quarterly' | 'annually';

export interface BaseCalculatorConfig {
    id: string;
    name: string;
    type: CalculatorType;
    createdAt: string; // ISO string
}

export interface SIPConfig extends BaseCalculatorConfig {
    type: 'SIP';
    monthlyAmount: number;
    durationYears: number;
    expectedRatePercent: number;
}

export interface StepUpSIPConfig extends BaseCalculatorConfig {
    type: 'StepUpSIP';
    initialMonthlyAmount: number;
    durationYears: number;
    expectedRatePercent: number;
    stepUpPercentage: number;
    stepUpFrequency: StepUpFrequency;
}

export interface SWPConfig extends BaseCalculatorConfig {
    type: 'SWP';
    lumpSumAmount: number;
    withdrawalAmount: number;
    frequency: SWPFrequency;
    durationYears: number;
}

export interface LumpsumConfig extends BaseCalculatorConfig {
    type: 'Lumpsum';
    lumpSumAmount: number;
    expectedRatePercent: number;
    durationYears: number;
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
