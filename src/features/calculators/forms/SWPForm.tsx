import React, { useState } from 'react';
import { useCurrency } from '../../../context/CurrencyContext';
import type { SWPConfig, SWPFrequency } from '../../../types';
import { ToggleGroup } from '../../../components/Inputs';
import { SliderInput } from '../../../components/SliderInput';
import { validatePositiveNumber } from '../../../utils/validation';

interface SWPFormProps {
  initialData?: Partial<SWPConfig>;
  onSubmit: (data: Omit<SWPConfig, 'id' | 'createdAt' | 'type' | 'name'>) => void;
  onCancel: () => void;
  isInline?: boolean;
  id?: string;
}

export const SWPForm: React.FC<SWPFormProps> = ({ initialData, onSubmit, onCancel, isInline, id }) => {
  const { currency } = useCurrency(); // Consume context
  const [formData, setFormData] = useState({
    lumpSumAmount: initialData?.lumpSumAmount || 500000,
    withdrawalAmount: initialData?.withdrawalAmount || 5000,
    frequency: (initialData?.frequency || 'monthly') as SWPFrequency,
    durationYears: initialData?.durationYears || 10,
    expectedRatePercent: initialData?.expectedRatePercent || 12,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Real-time update
    onSubmit({
      lumpSumAmount: Number(newData.lumpSumAmount),
      withdrawalAmount: Number(newData.withdrawalAmount),
      frequency: newData.frequency,
      durationYears: Number(newData.durationYears),
      expectedRatePercent: Number(newData.expectedRatePercent),
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const lumpSumError = validatePositiveNumber(Number(formData.lumpSumAmount), 'Lumpsum Amount');
    if (lumpSumError) newErrors.lumpSumAmount = lumpSumError;

    const withdrawalError = validatePositiveNumber(Number(formData.withdrawalAmount), 'Withdrawal Amount');
    if (withdrawalError) newErrors.withdrawalAmount = withdrawalError;



    const durationError = validatePositiveNumber(Number(formData.durationYears), 'Duration');
    if (durationError) newErrors.durationYears = durationError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        lumpSumAmount: Number(formData.lumpSumAmount),
        withdrawalAmount: Number(formData.withdrawalAmount),
        frequency: formData.frequency,
        durationYears: Number(formData.durationYears),
        expectedRatePercent: Number(formData.expectedRatePercent),
      });
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit} noValidate className={isInline ? 'inline-form' : ''}>
      <div className="form-section">
        {/* Name input moved to header */}

        <SliderInput
          label="Total Investment"
          value={formData.lumpSumAmount}
          onChange={(val) => handleChange('lumpSumAmount', val)}
          min={10000}
          max={10000000}
          step={10000}
          unit={currency.symbol}
          error={errors.lumpSumAmount}
        />

        <div className="form-row-responsive">
          <SliderInput
            label="Withdrawal Amount"
            value={formData.withdrawalAmount}
            onChange={(val) => handleChange('withdrawalAmount', val)}
            min={500}
            max={100000}
            step={500}
            unit={currency.symbol}
            error={errors.withdrawalAmount}
          />
          <ToggleGroup
            value={formData.frequency}
            onChange={(val) => handleChange('frequency', val)}
            options={[
              { value: 'monthly', label: 'Mo' },
              { value: 'quarterly', label: 'Qt' },
              { value: 'annually', label: 'Yr' },
            ]}
          />
        </div>

        <SliderInput
          label="Expected Return (p.a)"
          value={formData.expectedRatePercent}
          onChange={(val) => handleChange('expectedRatePercent', val)}
          min={1}
          max={30}
          step={0.5}
          unit="%"
          error={errors.expectedRatePercent}
        />

        <SliderInput
          label="Time Period"
          value={formData.durationYears}
          onChange={(val) => handleChange('durationYears', val)}
          min={1}
          max={30}
          step={1}
          unit="Years"
          error={errors.durationYears}
        />
      </div>

      {!isInline && (
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Add SWP
          </button>
        </div>
      )}
    </form>
  );
};
