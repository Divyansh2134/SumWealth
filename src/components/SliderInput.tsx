import React, { type ChangeEvent } from 'react';
import '../styles/Inputs.css';

interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
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
    hasChangedRef.current = true;
    onChange(Number(e.target.value));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;
  
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isDraggingRef = React.useRef(false);
  const hasChangedRef = React.useRef(false);
  const touchStartPosRef = React.useRef({ x: 0, y: 0 });

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
        <div 
          className="visual-track" 
          style={{
            background: `linear-gradient(to right, var(--primary-color) ${percentage}%, #e0e0e0 ${percentage}%)`
          }}
        />
        <input
          ref={inputRef}
          type="range"
          className="form-range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          onTouchStart={(e) => {
             isDraggingRef.current = false;
             hasChangedRef.current = false;
             touchStartPosRef.current = { 
                x: e.touches[0].clientX, 
                y: e.touches[0].clientY 
             };
          }}
          onTouchMove={(e) => {
             const touch = e.touches[0];
             const moveX = Math.abs(touch.clientX - touchStartPosRef.current.x);
             const moveY = Math.abs(touch.clientY - touchStartPosRef.current.y);
             
             if (moveX > 5 || moveY > 5) {
                isDraggingRef.current = true;
             }
          }}
          onTouchEnd={(e) => {
            const touch = e.changedTouches[0];
            const moveX = Math.abs(touch.clientX - touchStartPosRef.current.x);
            const moveY = Math.abs(touch.clientY - touchStartPosRef.current.y);
            const wasDrag = isDraggingRef.current || (moveX > 5 || moveY > 5);

            if (!wasDrag && !hasChangedRef.current && inputRef.current) {
               const rect = inputRef.current.getBoundingClientRect();
               const touchX = touch.clientX - rect.left;
               const percent = Math.min(Math.max(touchX / rect.width, 0), 1);
               const newValue = Math.round((min + percent * (max - min)) / step) * step;
               
               const clampedValue = Math.min(Math.max(newValue, min), max);
               
               if (Math.abs(clampedValue - value) > step / 10) {
                  onChange(clampedValue);
               }
            }
          }}
        />
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
