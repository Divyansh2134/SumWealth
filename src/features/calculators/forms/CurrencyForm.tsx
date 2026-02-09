import React, { useState } from 'react';
import type { CurrencyConfig } from '../../../types';
import { SliderInput } from '../../../components/SliderInput';
import { validateRange } from '../../../utils/validation';

interface CurrencyFormProps {
  initialData?: Partial<CurrencyConfig>;
  onSubmit: (data: Omit<CurrencyConfig, 'id' | 'createdAt' | 'type' | 'name'>) => void;
  onCancel: () => void;
  isInline?: boolean;
}

export const CurrencyForm: React.FC<CurrencyFormProps> = ({ initialData, onSubmit, onCancel, isInline }) => {
  const [formData, setFormData] = useState({
    rate: initialData?.rate || 0,
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
    
    // Currency effect can be negative or positive (-20 to +20)
    const rateError = validateRange(Number(formData.rate), -20, 20, 'Currency Rate');
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
    <form onSubmit={handleSubmit} noValidate className={isInline ? 'inline-form' : ''}>
      <div className="form-section">
        {/* Name input moved to header */}
        
        <SliderInput
            label="Currency Effect Rate"
            value={formData.rate}
            onChange={(val) => handleChange(val)}
            min={-20}
            max={20}
            step={0.1}
            unit="%"
            error={errors.rate}
        />
        <p className="field-hint">Positive values indicate appreciation (boost), negative values indicate depreciation (drag).</p>
      </div>

      <div className="form-actions">
        {!isInline && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
            </button>
        )}
        <button type="submit" className="btn btn-primary">
          {isInline ? 'Update' : 'Add Currency Effect'}
        </button>
      </div>
    </form>
  );
};
