import React, { useState } from 'react';
import type { SIPConfig } from '../../../types';
import { Input } from '../../../components/Inputs';
import { validateRequired, validatePositiveNumber, validateRange, validateDate } from '../../../utils/validation';

interface SIPFormProps {
  initialData?: Partial<SIPConfig>;
  onSubmit: (data: Omit<SIPConfig, 'id' | 'createdAt' | 'type'>) => void;
  onCancel: () => void;
}

export const SIPForm: React.FC<SIPFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    monthlyAmount: initialData?.monthlyAmount?.toString() || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    durationMonths: initialData?.durationMonths?.toString() || '',
    expectedRatePercent: initialData?.expectedRatePercent?.toString() || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
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

    const nameError = validateRequired(formData.name);
    if (nameError) newErrors.name = nameError;

    const amountError = validatePositiveNumber(Number(formData.monthlyAmount), 'Monthly Amount');
    if (amountError) newErrors.monthlyAmount = amountError;

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
        monthlyAmount: Number(formData.monthlyAmount),
        startDate: formData.startDate,
        durationMonths: Number(formData.durationMonths),
        expectedRatePercent: Number(formData.expectedRatePercent),
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
        placeholder="e.g., My Retirement SIP"
      />
      <Input
        label="Monthly Amount (₹)"
        name="monthlyAmount"
        type="number"
        value={formData.monthlyAmount}
        onChange={handleChange}
        error={errors.monthlyAmount}
        required
        min="500"
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
          Save SIP
        </button>
      </div>
    </form>
  );
};
