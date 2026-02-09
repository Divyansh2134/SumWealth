import React, { useState } from 'react';
import type { InflationConfig } from '../../../types';
import { SliderInput } from '../../../components/SliderInput';
import { validateRange } from '../../../utils/validation';

interface InflationFormProps {
  initialData?: Partial<InflationConfig>;
  onSubmit: (data: Omit<InflationConfig, 'id' | 'createdAt' | 'type' | 'name'>) => void;
  onCancel: () => void;
  isInline?: boolean;
  id?: string;
}

export const InflationForm: React.FC<InflationFormProps> = ({ initialData, onSubmit, onCancel, isInline, id }) => {
  const [formData, setFormData] = useState({
    rate: initialData?.rate || 6,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (value: number) => {
    setFormData({ rate: value });
    if (errors.rate) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.rate;
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    const rateError = validateRange(Number(formData.rate), 0, 20, 'Inflation Rate');
    if (rateError) newErrors.rate = rateError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validate()) {
      onSubmit({
        rate: Number(formData.rate),
      });
    }
  };

  return (
    <form id={id} onSubmit={handleSubmit} noValidate className={isInline ? 'inline-form' : ''}>
      <div className="form-section">
        {/* Name input moved to header */}
        
        <SliderInput
            label="Inflation Rate"
            value={formData.rate}
            onChange={(val) => handleChange(val)}
            min={0}
            max={20}
            step={0.1}
            unit="%"
            error={errors.rate}
        />
      </div>

      {!isInline && (
        <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
            </button>
            <button type="submit" className="btn btn-primary">
                Add Inflation
            </button>
        </div>
      )}
    </form>
  );
};
