import React, { useState } from 'react';
import { useCurrency } from '../../../context/CurrencyContext';
import type { SIPConfig } from '../../../types';
import { SliderInput } from '../../../components/SliderInput';
import { validatePositiveNumber, validateRange } from '../../../utils/validation';

interface SIPFormProps {
  initialData?: Partial<SIPConfig>;
  onSubmit: (data: Omit<SIPConfig, 'id' | 'createdAt' | 'type' | 'name'>) => void;
  onCancel: () => void;
  isInline?: boolean; // New prop to adjust layout/buttons if needed
  id?: string;
}

export const SIPForm: React.FC<SIPFormProps> = ({ initialData, onSubmit, onCancel, isInline, id }) => {
  const { currency } = useCurrency(); // Consume context

  const [formData, setFormData] = useState({
    monthlyAmount: initialData?.monthlyAmount || 5000,
    durationYears: initialData?.durationYears || 10,
    expectedRatePercent: initialData?.expectedRatePercent || 12,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);

    // Clear specific error
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Real-time update
    onSubmit({
      monthlyAmount: Number(newData.monthlyAmount),
      durationYears: Number(newData.durationYears),
      expectedRatePercent: Number(newData.expectedRatePercent),
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Name is optional now, will auto-generate if empty on submit

    const amountError = validatePositiveNumber(Number(formData.monthlyAmount), 'Monthly Amount');
    if (amountError) newErrors.monthlyAmount = amountError;



    const durationError = validatePositiveNumber(Number(formData.durationYears), 'Duration');
    if (durationError) newErrors.durationYears = durationError;

    const rateError = validateRange(Number(formData.expectedRatePercent), 1, 30, 'Expected Rate');
    if (rateError) newErrors.expectedRatePercent = rateError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validate()) {
      onSubmit({
        monthlyAmount: Number(formData.monthlyAmount),
        durationYears: Number(formData.durationYears),
        expectedRatePercent: Number(formData.expectedRatePercent),
      });
    }
  };

  // Auto-save effect/debounce? 
  // For now, let's stick to explicit save button in inline mode unless spec demanded live update "I can still click... but bar main part". 
  // "each added calculator... upon clicking it will open configured values".
  // Let's keep a "Update / Save" button for clarity, or auto-save if isInline?
  // User didn't explicitly ask for auto-save, just "edit". 

  return (
    <form id={id} onSubmit={handleSubmit} noValidate className={isInline ? 'inline-form' : ''}>
      <div className="form-section">
        {/* Name input moved to header */}

        <SliderInput
          label="Monthly Investment"
          value={formData.monthlyAmount}
          onChange={(val) => handleChange('monthlyAmount', val)}
          min={500}
          max={100000}
          step={500}
          unit={currency.symbol}
          error={errors.monthlyAmount}
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
      </div>

      {!isInline && (
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Add SIP
          </button>
        </div>
      )}
    </form>
  );
};
