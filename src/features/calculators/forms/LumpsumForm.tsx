import React, { useState } from 'react';
import type { LumpsumConfig } from '../../../types';
import { SliderInput } from '../../../components/SliderInput';
import { validatePositiveNumber, validateRange } from '../../../utils/validation';

interface LumpsumFormProps {
  initialData?: Partial<LumpsumConfig>;
  onSubmit: (data: Omit<LumpsumConfig, 'id' | 'createdAt' | 'type' | 'name'>) => void;
  onCancel: () => void;
  isInline?: boolean;
  id?: string;
}

export const LumpsumForm: React.FC<LumpsumFormProps> = ({ initialData, onSubmit, onCancel, isInline, id }) => {
  const [formData, setFormData] = useState({
    lumpSumAmount: initialData?.lumpSumAmount || 100000,
    expectedRatePercent: initialData?.expectedRatePercent || 12,
    durationYears: initialData?.durationYears || 10,
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

    const amountError = validatePositiveNumber(Number(formData.lumpSumAmount), 'Investment Amount');
    if (amountError) newErrors.lumpSumAmount = amountError;



    const durationError = validatePositiveNumber(Number(formData.durationYears), 'Duration');
    if (durationError) newErrors.durationYears = durationError;

    const rateError = validateRange(Number(formData.expectedRatePercent), 1, 30, 'Expected Rate');
    if (rateError) newErrors.expectedRatePercent = rateError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        lumpSumAmount: Number(formData.lumpSumAmount),
        expectedRatePercent: Number(formData.expectedRatePercent),
        durationYears: Number(formData.durationYears),
      });
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit} noValidate className={isInline ? 'inline-form' : ''}>
      <div className="form-section">
        {/* Name input moved to header */}
        
        <SliderInput
            label="Lumpsum Amount"
            value={formData.lumpSumAmount}
            onChange={(val) => handleChange('lumpSumAmount', val)}
            min={5000}
            max={10000000}
            step={5000}
            unit="₹"
            error={errors.lumpSumAmount}
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
                Add Lumpsum
            </button>
        </div>
      )}
    </form>
  );
};
