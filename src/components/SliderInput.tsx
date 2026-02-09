import React, { type ChangeEvent } from 'react';
import '../styles/Inputs.css';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  step?: number;
  unit?: string;
  error?: string;
  variant?: 'default' | 'compact';
}

export const SliderInput: React.FC<SliderInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  error,
  variant = 'default',
}) => {
  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className={`form-group slider-group ${variant}`}>
      <div className="slider-header">
        <label className="form-label">{label}</label>
        <div className="slider-input-wrapper">
          <input
            type="number"
            className={`slider-number-input ${error ? 'has-error' : ''}`}
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
          />
          {unit && <span className="slider-unit">{unit}</span>}
        </div>
      </div>
      <div className="slider-track-wrapper">
        <input
          type="range"
          className="form-range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          style={{
            background: `linear-gradient(to right, var(--primary-color) ${percentage}%, #e0e0e0 ${percentage}%)`
          }}
        />
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
