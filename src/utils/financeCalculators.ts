
/**
 * Finance Calculator Utilities
 * 
 * Handles compound interest, step-up SIP, and inflation adjustments.
 */

export interface ProjectionResult {
    totalInvested: number;
    totalInterest: number;
    maturityValue: number;
    inflationAdjustedValue?: number;
    monthlyData?: { month: number; invested: number; value: number }[]; // For charts if needed
}

export type Frequency = 'monthly' | 'quarterly' | 'semiannually' | 'annually';

/**
 * Calculates Future Value of Lumpsum Investment
 * FV = P * (1 + r)^n
 */
export const calculateLumpsum = (
    principal: number,
    ratePercent: number,
    years: number,
    inflationRatePercent?: number
): ProjectionResult => {
    const r = ratePercent / 100;
    const n = years;

    // Monthly compounding for consistency with mutual funds, or annual? 
    // Usually mutual fund CAGR is annualized effectively, but let's assume annual compounding for simplicity unless specified.
    // Actually, standard formula for CAGR based returns is usually annual compounding: A = P(1+r)^t

    const maturityValue = principal * Math.pow(1 + r, n);
    const totalInterest = maturityValue - principal;

    const inflationAdjustedValue = getInflationAdjustedValue(maturityValue, inflationRatePercent, years);

    return {
        totalInvested: principal,
        totalInterest,
        maturityValue,
        inflationAdjustedValue
    };
};

/**
 * Calculates Future Value of SIP (Monthly Investment)
 * FV = P * [ (1+i)^n - 1 ] * (1+i) / i
 * where i = monthly rate, n = months
 */
export const calculateSIP = (
    monthlyAmount: number,
    ratePercent: number,
    years: number,
    inflationRatePercent?: number
): ProjectionResult => {
    const i = ratePercent / 100 / 12;
    const n = years * 12;

    if (i === 0) {
        return {
            totalInvested: monthlyAmount * n,
            totalInterest: 0,
            maturityValue: monthlyAmount * n
        };
    }

    const maturityValue = monthlyAmount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const totalInvested = monthlyAmount * n;

    const inflationAdjustedValue = getInflationAdjustedValue(maturityValue, inflationRatePercent, years);

    return {
        totalInvested,
        totalInterest: maturityValue - totalInvested,
        maturityValue,
        inflationAdjustedValue
    };
};

/**
 * Calculates Future Value of Step-Up SIP
 * This requires iterating year by year or month by month as the contribution changes.
 * 
 * @param executionFrequency - How often the step-up happens. Using 'annually' is standard.
 */
export const calculateStepUpSIP = (
    initialMonthlyAmount: number,
    ratePercent: number,
    years: number,
    stepUpPercent: number,
    stepUpFrequency: Frequency = 'annually',
    inflationRatePercent?: number
): ProjectionResult => {
    let currentMonthlyAmount = initialMonthlyAmount;
    let totalInvested = 0;
    let currentCorpus = 0;

    const monthlyRate = ratePercent / 100 / 12;
    const months = years * 12;

    // We update contribution every 12 months (if annual)
    // Step up check interval
    const stepUpIntervalMonths = getMonthsFromFrequency(stepUpFrequency);

    for (let m = 1; m <= months; m++) {
        // Add contribution
        currentCorpus += currentMonthlyAmount;
        totalInvested += currentMonthlyAmount;

        // Add Interest for this month
        currentCorpus += currentCorpus * monthlyRate;

        // Apply Step Up
        if (m % stepUpIntervalMonths === 0 && m < months) {
            currentMonthlyAmount += currentMonthlyAmount * (stepUpPercent / 100);
        }
    }

    const inflationAdjustedValue = getInflationAdjustedValue(currentCorpus, inflationRatePercent, years);

    return {
        totalInvested,
        totalInterest: currentCorpus - totalInvested,
        maturityValue: currentCorpus,
        inflationAdjustedValue
    };
};

/**
 * Calculates SWP (Systematic Withdrawal Plan)
 * Returns remaining corpus after withdrawals.
 * Be careful: if withdrawal > return, corpus depletes.
 */
export const calculateSWP = (
    lumpsumAmount: number,
    withdrawalAmount: number,
    withdrawalFrequency: Frequency = 'monthly',
    ratePercent: number,
    years: number,
    inflationRatePercent?: number
): ProjectionResult & { finalCorpus: number, totalWithdrawn: number } => {
    let currentCorpus = lumpsumAmount;
    let totalWithdrawn = 0;

    const monthlyRate = ratePercent / 100 / 12;
    const months = years * 12;
    const withdrawalInterval = getMonthsFromFrequency(withdrawalFrequency);

    for (let m = 1; m <= months; m++) {
        // Add interest for the month first? Or withdraw first?
        // Standard is: Corpus earns interest for the month, then withdrawal happens at end of month (or beginning).
        // Let's assume end of month withdrawal.

        // Add interest
        currentCorpus += currentCorpus * monthlyRate;

        // Withdraw
        if (m % withdrawalInterval === 0) {
            if (currentCorpus >= withdrawalAmount) {
                currentCorpus -= withdrawalAmount;
                totalWithdrawn += withdrawalAmount;
            } else {
                // Depleted
                totalWithdrawn += currentCorpus;
                currentCorpus = 0;
                break;
            }
        }
    }

    const inflationAdjustedValue = getInflationAdjustedValue(currentCorpus, inflationRatePercent, years);

    return {
        totalInvested: lumpsumAmount,
        totalInterest: (currentCorpus + totalWithdrawn) - lumpsumAmount, // Net Gain
        maturityValue: currentCorpus,
        finalCorpus: currentCorpus,
        totalWithdrawn,
        inflationAdjustedValue
    };
};

// --- Helpers ---

const getInflationAdjustedValue = (value: number, inflationRate: number | undefined, years: number): number | undefined => {
    if (inflationRate === undefined) return undefined;
    // Real Value = Nominal Value / (1 + inflation)^years
    return value / Math.pow(1 + (inflationRate / 100), years);
};

const getMonthsFromFrequency = (freq: Frequency): number => {
    switch (freq) {
        case 'monthly': return 1;
        case 'quarterly': return 3;
        case 'semiannually': return 6;
        case 'annually': return 12;
        default: return 12;
    }
};

// Update formatCurrency to accept optional currency/locale, but default to INR/en-IN for backward compatibility if needed, 
// though we should aim to pass them in.
export const formatCurrency = (amount: number, currencyCode: string = 'INR', locale: string = 'en-IN'): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Formats large numbers into compact notation (e.g., 1.5M, 2Cr)
 * Handles Indian Number System for INR locale, otherwise standard International.
 */
export const formatCompactNumber = (amount: number, currencyCode: string = 'INR', locale: string = 'en-IN'): string => {
    // Special handling for Indian System (Lakhs/Crores) if locale is en-IN
    if (locale === 'en-IN') {
        if (amount >= 10000000) { // 1 Crore
            return `₹${(amount / 10000000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;
        }
        if (amount >= 100000) { // 1 Lakh
            return `₹${(amount / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} L`;
        }
    }

    // Standard Compact Notation for other locales
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1
    }).format(amount);
};


// --- Yearly Projection for Charts ---

import type { CalculatorConfig, SIPConfig, StepUpSIPConfig, SWPConfig, LumpsumConfig } from '../types';

export const getYearlyProjection = (calc: CalculatorConfig): { year: number; value: number; invested: number }[] => {
    const data: { year: number; value: number; invested: number }[] = [];

    // Determine duration
    let duration = 0;
    if ('durationYears' in calc) duration = calc.durationYears;

    if (duration <= 0) return [];

    let currentCorpus = 0;
    let totalInvested = 0;

    // Common params
    const rate = 'expectedRatePercent' in calc ? calc.expectedRatePercent : 0;
    const monthlyRate = rate / 100 / 12; // Monthly compounding standard

    // Specific logic per type
    if (calc.type === 'Lumpsum') {
        const c = calc as LumpsumConfig;
        totalInvested = c.lumpSumAmount;
        currentCorpus = c.lumpSumAmount;

        for (let y = 1; y <= duration; y++) {
            // Annual compounding for Lumpsum
            // standard formula: P * (1+r)^n
            // But if we want monthly compounding consistency:
            currentCorpus = c.lumpSumAmount * Math.pow(1 + monthlyRate, y * 12);

            data.push({ year: y, value: currentCorpus, invested: totalInvested });
        }
    } else if (calc.type === 'SIP') {
        const c = calc as SIPConfig;
        const monthly = c.monthlyAmount;

        currentCorpus = 0;
        totalInvested = 0;

        for (let y = 1; y <= duration; y++) {
            // Simulate 12 months for this year
            for (let m = 0; m < 12; m++) {
                currentCorpus += monthly; // Invest at start or end? Standard SIP usually start. 
                // Let's assume End of Month for simplicity or Start. 
                // If Start: Invest -> Interest. If End: Interest -> Invest.
                // Standard formula assumes Start? No, annuity due vs immediate.
                // To match typical calculators: Interest usually applied on balance.
                // Let's do: Add contribution -> Add Interest (Start of month)

                // standard: FV = P * ...

                // Let's stick to a simple loop:
                // Month Start: Add SIP
                // Month End: Add Interest

                totalInvested += monthly;
                currentCorpus += monthly; // Add SIP
                currentCorpus += currentCorpus * monthlyRate; // Interest
            }
            data.push({ year: y, value: currentCorpus, invested: totalInvested });
        }

    } else if (calc.type === 'StepUpSIP') {
        const c = calc as StepUpSIPConfig;
        let monthly = c.initialMonthlyAmount;
        const stepUpRate = c.stepUpPercentage / 100;

        currentCorpus = 0;
        totalInvested = 0;

        for (let y = 1; y <= duration; y++) {
            for (let m = 0; m < 12; m++) {
                totalInvested += monthly;
                currentCorpus += monthly;
                currentCorpus += currentCorpus * monthlyRate;
            }

            // Step Up annually
            if (c.stepUpFrequency === 'annually') {
                monthly += monthly * stepUpRate;
            } else if (c.stepUpFrequency === 'semiannually') {
                // complex to handle inside annual loop without tracking months globally
                // Simplifying: assume annual step up for chart if config says semi-annual? 
                // Or better:
            }
            data.push({ year: y, value: currentCorpus, invested: totalInvested });
        }
    } else if (calc.type === 'SWP') {
        const c = calc as SWPConfig;
        currentCorpus = c.lumpSumAmount;
        totalInvested = c.lumpSumAmount;
        const withdrawal = c.withdrawalAmount;

        const withdrawalInterval = getMonthsFromFrequency(c.frequency);

        for (let y = 1; y <= duration; y++) {
            for (let m = 1; m <= 12; m++) {
                currentCorpus += currentCorpus * monthlyRate; // Interest

                // Withdraw
                // Calculate global month index essentially
                // Simplified: if standard monthly
                if (c.frequency === 'monthly' || (m % withdrawalInterval === 0)) {
                    if (currentCorpus >= withdrawal) {
                        currentCorpus -= withdrawal;
                    } else {
                        currentCorpus = 0;
                    }
                }
            }
            data.push({ year: y, value: currentCorpus, invested: totalInvested });
        }
    }

    return data;
};
