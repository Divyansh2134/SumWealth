import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import type { CalculatorType, CalculatorConfig } from '../../types';
import { SIPForm } from './forms/SIPForm';
import { StepUpSIPForm } from './forms/StepUpSIPForm';
import { SWPForm } from './forms/SWPForm';
import { LumpsumForm } from './forms/LumpsumForm';
import { Select } from '../../components/Inputs';
import { v4 as uuidv4 } from 'uuid';

interface CalculatorConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: CalculatorConfig) => void;
  calculatorToEdit?: CalculatorConfig | null;
}

export const CalculatorConfigModal: React.FC<CalculatorConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  calculatorToEdit,
}) => {
  const [selectedType, setSelectedType] = useState<CalculatorType>('SIP');

  useEffect(() => {
    if (isOpen) {
      if (calculatorToEdit) {
        setSelectedType(calculatorToEdit.type);
      } else {
        setSelectedType('SIP');
      }
    }
  }, [isOpen, calculatorToEdit]);

  const handleSave = (data: any) => {
    const config: CalculatorConfig = {
      ...data,
      id: calculatorToEdit?.id || uuidv4(),
      createdAt: calculatorToEdit?.createdAt || new Date().toISOString(),
      type: selectedType,
    };
    onSave(config);
    onClose();
  };

  const renderForm = () => {
    const commonProps = {
      onCancel: onClose,
    };

    switch (selectedType) {
      case 'SIP':
        return (
          <SIPForm
            initialData={calculatorToEdit?.type === 'SIP' ? calculatorToEdit : undefined}
            onSubmit={handleSave}
            {...commonProps}
          />
        );
      case 'StepUpSIP':
        return (
          <StepUpSIPForm
            initialData={calculatorToEdit?.type === 'StepUpSIP' ? calculatorToEdit : undefined}
            onSubmit={handleSave}
            {...commonProps}
          />
        );
      case 'SWP':
        return (
          <SWPForm
            initialData={calculatorToEdit?.type === 'SWP' ? calculatorToEdit : undefined}
            onSubmit={handleSave}
            {...commonProps}
          />
        );
      case 'Lumpsum':
        return (
          <LumpsumForm
            initialData={calculatorToEdit?.type === 'Lumpsum' ? calculatorToEdit : undefined}
            onSubmit={handleSave}
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  const calculatorOptions = [
    { value: 'SIP', label: 'SIP Calculator' },
    { value: 'StepUpSIP', label: 'Step-Up SIP Calculator' },
    { value: 'SWP', label: 'SWP Calculator' },
    { value: 'Lumpsum', label: 'Lumpsum Calculator' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={calculatorToEdit ? `Edit ${calculatorToEdit.name}` : 'Add New Calculator'}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <Select
          label="Calculator Type"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as CalculatorType)}
          options={calculatorOptions}
          disabled={!!calculatorToEdit} // Disable type change when editing
        />
      </div>
      
      {renderForm()}
    </Modal>
  );
};
