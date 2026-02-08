import React, { useState } from 'react';
import type { LumpsumConfig } from '../../../types';
import { Input } from '../../../components/Inputs';
import { validatePositiveNumber, validateRange, validateDate } from '../../../utils/validation';

interface LumpsumFormProps {
  initialData?: Partial<LumpsumConfig>;
  onSubmit: (data: Omit<LumpsumConfig, 'id' | 'createdAt' | 'type'>) => void;
  onCancel: () => void;
}

export const LumpsumForm: React.FC<LumpsumFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    lumpSumAmount: initialData?.lumpSumAmount?.toString() || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    expectedRatePercent: initialData?.expectedRatePercent?.toString() || '',
    durationMonths: initialData?.durationMonths?.toString() || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Required';
    
    const amountError = validatePositiveNumber(Number(formData.lumpSumAmount), 'Investment Amount');
    if (amountError) newErrors.lumpSumAmount = amountError;

    const dateError = validateDate(formData.startDate);
    if (dateError) newErrors.startDate = dateError;

    const durationError = validatePositiveNumber(Number(formData.durationMonths), 'Duration');
    if (durationError) newErrors.durationMonths = durationError;

    const rateError = validateRange(Number(formData.expectedRatePercent), 1, 30, 'Expected Rate');
    if (rateError) newErrors.expectedRatePercent = rateError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        name: formData.name,
        lumpSumAmount: Number(formData.lumpSumAmount),
        startDate: formData.startDate,
        expectedRatePercent: Number(formData.expectedRatePercent),
        durationMonths: Number(formData.durationMonths),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Input
        label="Calculator Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
      />
      <Input
        label="Lumpsum Amount (₹)"
        name="lumpSumAmount"
        type="number"
        value={formData.lumpSumAmount}
        onChange={handleChange}
        error={errors.lumpSumAmount}
        required
      />
      <Input
        label="Start Date"
        name="startDate"
        type="date"
        value={formData.startDate}
        onChange={handleChange}
        error={errors.startDate}
        required
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Input
          label="Duration (Months)"
          name="durationMonths"
          type="number"
          value={formData.durationMonths}
          onChange={handleChange}
          error={errors.durationMonths}
          required
        />
        <Input
          label="Exp. Return Rate (%)"
          name="expectedRatePercent"
          type="number"
          value={formData.expectedRatePercent}
          onChange={handleChange}
          error={errors.expectedRatePercent}
          required
          step="0.1"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Lumpsum
        </button>
      </div>
    </form>
  );
};
