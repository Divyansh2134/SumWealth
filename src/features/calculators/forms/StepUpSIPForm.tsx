import React, { useState } from 'react';
import type { StepUpSIPConfig, StepUpFrequency } from '../../../types';
import { Input, Select } from '../../../components/Inputs';
import { validatePositiveNumber, validateRange, validateDate } from '../../../utils/validation';

interface StepUpSIPFormProps {
  initialData?: Partial<StepUpSIPConfig>;
  onSubmit: (data: Omit<StepUpSIPConfig, 'id' | 'createdAt' | 'type'>) => void;
  onCancel: () => void;
}

export const StepUpSIPForm: React.FC<StepUpSIPFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    initialMonthlyAmount: initialData?.initialMonthlyAmount?.toString() || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    durationMonths: initialData?.durationMonths?.toString() || '',
    expectedRatePercent: initialData?.expectedRatePercent?.toString() || '',
    stepUpPercentage: initialData?.stepUpPercentage?.toString() || '',
    stepUpFrequency: (initialData?.stepUpFrequency || 'annually') as StepUpFrequency,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    
    const amountError = validatePositiveNumber(Number(formData.initialMonthlyAmount), 'Initial Amount');
    if (amountError) newErrors.initialMonthlyAmount = amountError;

    const dateError = validateDate(formData.startDate);
    if (dateError) newErrors.startDate = dateError;

    const durationError = validatePositiveNumber(Number(formData.durationMonths), 'Duration');
    if (durationError) newErrors.durationMonths = durationError;

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
        name: formData.name,
        initialMonthlyAmount: Number(formData.initialMonthlyAmount),
        startDate: formData.startDate,
        durationMonths: Number(formData.durationMonths),
        expectedRatePercent: Number(formData.expectedRatePercent),
        stepUpPercentage: Number(formData.stepUpPercentage),
        stepUpFrequency: formData.stepUpFrequency,
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
        label="Initial Monthly Amount (₹)"
        name="initialMonthlyAmount"
        type="number"
        value={formData.initialMonthlyAmount}
        onChange={handleChange}
        error={errors.initialMonthlyAmount}
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Input
          label="Step Up Percentage (%)"
          name="stepUpPercentage"
          type="number"
          value={formData.stepUpPercentage}
          onChange={handleChange}
          error={errors.stepUpPercentage}
          required
        />
        <Select
          label="Step Up Frequency"
          name="stepUpFrequency"
          value={formData.stepUpFrequency}
          onChange={handleChange}
          options={[
            { value: 'annually', label: 'Annually' },
            { value: 'semiannually', label: 'Semi-Annually' },
            { value: 'quarterly', label: 'Quarterly' },
          ]}
          required
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save Step-Up
        </button>
      </div>
    </form>
  );
};
