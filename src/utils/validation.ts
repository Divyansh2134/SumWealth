import type { CalculatorType } from '../types';

export const validateRequired = (value: string | number | null | undefined): string | null => {
    if (value === null || value === undefined || value === '') {
        return 'This field is required';
    }
    return null;
};

export const validatePositiveNumber = (value: number, label: string): string | null => {
    if (isNaN(value) || value <= 0) {
        return `${label} must be a positive number`;
    }
    return null;
};

export const validateRange = (value: number, min: number, max: number, label: string): string | null => {
    if (isNaN(value) || value < min || value > max) {
        return `${label} must be between ${min} and ${max}`;
    }
    return null;
};

export const validateDate = (dateString: string): string | null => {
    if (!dateString) return 'Date is required';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return null;
};

export const getCalculatorLabel = (type: CalculatorType): string => {
    switch (type) {
        case 'SIP': return 'SIP';
        case 'StepUpSIP': return 'Step-Up SIP';
        case 'SWP': return 'SWP';
        case 'Lumpsum': return 'Lumpsum';
        default: return type;
    }
};
