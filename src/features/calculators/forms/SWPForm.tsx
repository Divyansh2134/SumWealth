import React, { useState } from 'react';
import type { SWPConfig, SWPFrequency } from '../../../types';
import { Input, Select } from '../../../components/Inputs';
import { validatePositiveNumber, validateDate } from '../../../utils/validation';

interface SWPFormProps {
  initialData?: Partial<SWPConfig>;
  onSubmit: (data: Omit<SWPConfig, 'id' | 'createdAt' | 'type'>) => void;
  onCancel: () => void;
}

export const SWPForm: React.FC<SWPFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    lumpSumAmount: initialData?.lumpSumAmount?.toString() || '',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    withdrawalAmount: initialData?.withdrawalAmount?.toString() || '',
    frequency: (initialData?.frequency || 'monthly') as SWPFrequency,
    durationMonths: initialData?.durationMonths?.toString() || '',
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
    
    const lumpSumError = validatePositiveNumber(Number(formData.lumpSumAmount), 'Lumpsum Amount');
    if (lumpSumError) newErrors.lumpSumAmount = lumpSumError;

    const withdrawalError = validatePositiveNumber(Number(formData.withdrawalAmount), 'Withdrawal Amount');
    if (withdrawalError) newErrors.withdrawalAmount = withdrawalError;

    const dateError = validateDate(formData.startDate);
    if (dateError) newErrors.startDate = dateError;

    const durationError = validatePositiveNumber(Number(formData.durationMonths), 'Duration');
    if (durationError) newErrors.durationMonths = durationError;

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
        withdrawalAmount: Number(formData.withdrawalAmount),
        frequency: formData.frequency,
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
        label="Initial Investment (₹)"
        name="lumpSumAmount"
        type="number"
        value={formData.lumpSumAmount}
        onChange={handleChange}
        error={errors.lumpSumAmount}
        required
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Input
          label="Withdrawal Amount (₹)"
          name="withdrawalAmount"
          type="number"
          value={formData.withdrawalAmount}
          onChange={handleChange}
          error={errors.withdrawalAmount}
          required
        />
        <Select
          label="Frequency"
          name="frequency"
          value={formData.frequency}
          onChange={handleChange}
          options={[
            { value: 'monthly', label: 'Monthly' },
            { value: 'quarterly', label: 'Quarterly' },
            { value: 'annually', label: 'Annually' },
          ]}
          required
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Input
          label="Start Date"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
          error={errors.startDate}
          required
        />
        <Input
          label="Duration (Months)"
          name="durationMonths"
          type="number"
          value={formData.durationMonths}
          onChange={handleChange}
          error={errors.durationMonths}
          required
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Save SWP
        </button>
      </div>
    </form>
  );
};
