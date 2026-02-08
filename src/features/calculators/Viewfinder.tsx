import React, { useState } from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import { CalculatorCard } from './CalculatorCard';
import { CalculatorConfigModal } from './CalculatorConfigModal';
import type { CalculatorConfig } from '../../types';
import { StickyButton } from '../../components/StickyButton';
import '../../styles/Viewfinder.css';

export const Viewfinder: React.FC = () => {
  const { calculators, dispatch } = useCalculator();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCalculator, setEditingCalculator] = useState<CalculatorConfig | null>(null);

  const handleSave = (config: CalculatorConfig) => {
    if (editingCalculator) {
      dispatch({ type: 'UPDATE_CALCULATOR', payload: config });
    } else {
      dispatch({ type: 'ADD_CALCULATOR', payload: config });
    }
  };

  const handleEdit = (config: CalculatorConfig) => {
    setEditingCalculator(config);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this calculator?')) {
      dispatch({ type: 'DELETE_CALCULATOR', payload: id });
    }
  };

  const openNewModal = () => {
    setEditingCalculator(null);
    setIsModalOpen(true);
  };

  const handleCalculateAll = () => {
    console.log('--- ALL CONFIGURED CALCULATORS ---');
    console.log(JSON.stringify(calculators, null, 2));
    alert('Calculators JSON exported to console!');
  };

  return (
    <div className="viewfinder">
      <div className="container">
        {calculators.length > 0 && (
          <div className="viewfinder-header">
            <h2 className="viewfinder-title">Your Investment Plan ({calculators.length})</h2>
            <button className="btn btn-primary" onClick={handleCalculateAll}>
              Calculate All
            </button>
          </div>
        )}

        {calculators.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-text">
              No calculators configured yet. Click the + button to add one.
            </p>
          </div>
        ) : (
          <div className="card-grid">
            {calculators.map((calc) => (
              <CalculatorCard
                key={calc.id}
                config={calc}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <StickyButton onClick={openNewModal} />

      {isModalOpen && (
        <CalculatorConfigModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          calculatorToEdit={editingCalculator}
        />
      )}
    </div>
  );
};
