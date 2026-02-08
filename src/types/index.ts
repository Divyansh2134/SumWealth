export type CalculatorType = 'SIP' | 'StepUpSIP' | 'SWP' | 'Lumpsum';

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
    startDate: string; // ISO string (YYYY-MM-DD)
    durationMonths: number;
    expectedRatePercent: number;
}

export interface StepUpSIPConfig extends BaseCalculatorConfig {
    type: 'StepUpSIP';
    initialMonthlyAmount: number;
    startDate: string;
    durationMonths: number;
    expectedRatePercent: number;
    stepUpPercentage: number;
    stepUpFrequency: StepUpFrequency;
}

export interface SWPConfig extends BaseCalculatorConfig {
    type: 'SWP';
    lumpSumAmount: number;
    startDate: string;
    withdrawalAmount: number;
    frequency: SWPFrequency;
    durationMonths: number;
}

export interface LumpsumConfig extends BaseCalculatorConfig {
    type: 'Lumpsum';
    lumpSumAmount: number;
    startDate: string; // ISO string
    expectedRatePercent: number;
    durationMonths: number;
}

export type CalculatorConfig = SIPConfig | StepUpSIPConfig | SWPConfig | LumpsumConfig;

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

// State Action Types
export type CalculatorAction =
    | { type: 'ADD_CALCULATOR'; payload: CalculatorConfig }
    | { type: 'UPDATE_CALCULATOR'; payload: CalculatorConfig }
    | { type: 'DELETE_CALCULATOR'; payload: string }; // payload is id
