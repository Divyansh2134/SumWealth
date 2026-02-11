import React, { useState } from 'react';
import { useCurrency } from '../../../context/CurrencyContext';
import type { StepUpSIPConfig, StepUpFrequency } from '../../../types';
import { ToggleGroup } from '../../../components/Inputs';
import { SliderInput } from '../../../components/SliderInput';
import { validatePositiveNumber, validateRange } from '../../../utils/validation';

interface StepUpSIPFormProps {
  initialData?: Partial<StepUpSIPConfig>;
  onSubmit: (data: Omit<StepUpSIPConfig, 'id' | 'createdAt' | 'type' | 'name'>) => void;
  onCancel: () => void;
  isInline?: boolean;
  id?: string;
}

export const StepUpSIPForm: React.FC<StepUpSIPFormProps> = ({ initialData, onSubmit, onCancel, isInline, id }) => {
  const { currency } = useCurrency(); // Consume context
  
  const [formData, setFormData] = useState({
    initialMonthlyAmount: initialData?.initialMonthlyAmount || 5000,
    durationYears: initialData?.durationYears || 10,
    expectedRatePercent: initialData?.expectedRatePercent || 12,
    stepUpPercentage: initialData?.stepUpPercentage || 10,
    stepUpFrequency: (initialData?.stepUpFrequency || 'annually') as StepUpFrequency,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const amountError = validatePositiveNumber(Number(formData.initialMonthlyAmount), 'Initial Amount');
    if (amountError) newErrors.initialMonthlyAmount = amountError;



    const durationError = validatePositiveNumber(Number(formData.durationYears), 'Duration');
    if (durationError) newErrors.durationYears = durationError;

    const rateError = validateRange(Number(formData.expectedRatePercent), 1, 30, 'Expected Rate');
    if (rateError) newErrors.expectedRatePercent = rateError;

    const stepUpError = validatePositiveNumber(Number(formData.stepUpPercentage), 'Step Up %');
    if (stepUpError) newErrors.stepUpPercentage = stepUpError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        initialMonthlyAmount: Number(formData.initialMonthlyAmount),
        durationYears: Number(formData.durationYears),
        expectedRatePercent: Number(formData.expectedRatePercent),
        stepUpPercentage: Number(formData.stepUpPercentage),
        stepUpFrequency: formData.stepUpFrequency,
      });
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit} noValidate className={isInline ? 'inline-form' : ''}>
      <div className="form-section">
        {/* Name input moved to header */}
        
        <SliderInput
            label="Initial Monthly Amount"
            value={formData.initialMonthlyAmount}
            onChange={(val) => handleChange('initialMonthlyAmount', val)}
            min={500}
            max={100000}
            step={500}
            unit={currency.symbol}
            error={errors.initialMonthlyAmount}
        />

        <SliderInput
            label="Expected Return Rate"
            value={formData.expectedRatePercent}
            onChange={(val) => handleChange('expectedRatePercent', val)}
            min={1}
            max={30}
            step={0.1}
            unit="%"
            error={errors.expectedRatePercent}
        />

        <SliderInput
            label="Time Period"
            value={formData.durationYears}
            onChange={(val) => handleChange('durationYears', val)}
            min={1}
            max={50}
            step={1}
            unit="Years"
            error={errors.durationYears}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
            <SliderInput
                label="Step Up %"
                value={formData.stepUpPercentage}
                onChange={(val) => handleChange('stepUpPercentage', val)}
                min={1}
                max={50}
                step={1}
                unit="%"
                error={errors.stepUpPercentage}
            />
            <ToggleGroup
                value={formData.stepUpFrequency}
                onChange={(val) => handleChange('stepUpFrequency', val)}
                options={[
                    { value: 'annually', label: 'Yr' },
                    { value: 'semiannually', label: 'Hy' },
                    { value: 'quarterly', label: 'Qt' },
                ]}
            />
        </div>
      </div>

      {!isInline && (
        <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
            </button>
            <button type="submit" className="btn btn-primary">
                Add Step Up SIP
            </button>
        </div>
      )}
    </form>
  );
};
