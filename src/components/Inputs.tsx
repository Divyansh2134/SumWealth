import React, { type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';
import '../styles/Inputs.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={id} className="form-label">
        {label}
        {props.required && <span className="required-mark" aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        className={`form-input ${error ? 'has-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${id}-error`} className="error-message">
          {error}
        </span>
      )}
    </div>
  );
};

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = '', id, ...props }) => {
  return (
    <div className={`form-group ${className}`}>
      <label htmlFor={id} className="form-label">
        {label}
        {props.required && <span className="required-mark" aria-hidden="true">*</span>}
      </label>
      <select
        id={id}
        className={`form-select ${error ? 'has-error' : ''}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${id}-error`} className="error-message">
          {error}
        </span>
      )}
    </div>
  );
};

interface ToggleGroupProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export const ToggleGroup: React.FC<ToggleGroupProps> = ({ label, value, onChange, options, className = '' }) => {
  return (
    <div className={`form-group ${className}`}>
        {label && <label className="form-label">{label}</label>}
        <div className="toggle-group-container">
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    className={`toggle-group-item ${value === option.value ? 'active' : ''}`}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    </div>
  );
};
