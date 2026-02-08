import React from 'react';
import type { CalculatorConfig } from '../../types';
import { getCalculatorLabel } from '../../utils/validation';
import { formatCurrency, formatDate } from '../../utils/format';
import '../../styles/CalculatorCard.css';

interface CalculatorCardProps {
  config: CalculatorConfig;
  onEdit: (config: CalculatorConfig) => void;
  onDelete: (id: string) => void;
}

export const CalculatorCard: React.FC<CalculatorCardProps> = ({ config, onEdit, onDelete }) => {


  const renderDetails = () => {
    switch (config.type) {
      case 'SIP':
        return (
          <>
            <div className="card-row">
              <span className="card-label">Monthly:</span>
              <span className="card-value">{formatCurrency(config.monthlyAmount)}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Rate:</span>
              <span className="card-value">{config.expectedRatePercent}%</span>
            </div>
          </>
        );
      case 'StepUpSIP':
        return (
          <>
            <div className="card-row">
              <span className="card-label">Initial:</span>
              <span className="card-value">{formatCurrency(config.initialMonthlyAmount)}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Step Up:</span>
              <span className="card-value">{config.stepUpPercentage}%</span>
            </div>
          </>
        );
      case 'SWP':
        return (
          <>
            <div className="card-row">
              <span className="card-label">Investment:</span>
              <span className="card-value">{formatCurrency(config.lumpSumAmount)}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Withdrawal:</span>
              <span className="card-value">{formatCurrency(config.withdrawalAmount)}</span>
            </div>
          </>
        );
      case 'Lumpsum':
        return (
          <>
            <div className="card-row">
              <span className="card-label">Investment:</span>
              <span className="card-value">{formatCurrency(config.lumpSumAmount)}</span>
            </div>
            <div className="card-row">
              <span className="card-label">Rate:</span>
              <span className="card-value">{config.expectedRatePercent}%</span>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="calculator-card">
      <div className="card-header">
        <span className="card-type-badge">{getCalculatorLabel(config.type)}</span>
        <div className="card-actions">
          <button 
            className="icon-btn" 
            onClick={() => onEdit(config)}
            aria-label={`Edit ${config.name}`}
          >
            ✎
          </button>
          <button 
            className="icon-btn delete" 
            onClick={() => onDelete(config.id)}
            aria-label={`Delete ${config.name}`}
          >
            ×
          </button>
        </div>
      </div>
      <h3 className="card-title">{config.name}</h3>
      <div className="card-body">
        {renderDetails()}
        <div className="card-row">
            <span className="card-label">Start Date:</span>
            <span className="card-value">{formatDate(config.startDate)}</span>
        </div>
        <div className="card-row">
            <span className="card-label">Duration:</span>
            <span className="card-value">{config.durationMonths} Months</span>
        </div>
      </div>
    </div>
  );
};
