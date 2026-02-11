import React, { useState, useEffect } from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import type { CalculatorConfig, SIPConfig } from '../../types';
import { CalculatorEditor } from './CalculatorEditor';
import { Header } from '../../components/Header';
import { TabRow } from '../../components/TabRow/TabRow';
import '../../styles/TabbedCalculatorView.css';
import { v4 as uuidv4 } from 'uuid';

import { PlanSummaryReport } from './PlanSummaryReport';

export const TabbedCalculatorView: React.FC = () => {
    const { calculators, dispatch } = useCalculator();
    const [activeTabId, setActiveTabId] = useState<string | null>(null);
    const [showSummary, setShowSummary] = useState(false);
    const [snapshotCalculators, setSnapshotCalculators] = useState<CalculatorConfig[]>([]);

    // Auto-select first tab
    useEffect(() => {
        if (calculators.length > 0 && !activeTabId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveTabId(calculators[0].id);
        }
    }, [calculators, activeTabId]);

    const handleCreateCalculator = (config: CalculatorConfig) => {
        dispatch({ type: 'ADD_CALCULATOR', payload: config });
        setActiveTabId(config.id);
    };

    const handleUpdate = (config: CalculatorConfig) => {
        dispatch({ type: 'UPDATE_CALCULATOR', payload: config });
    };

    const handleAssetSelect = (assetClass?: string) => {
        if (assetClass) {
            // Create a default calculator for this asset class
            const newConfig: SIPConfig = {
                id: uuidv4(), // Need uuid here
                type: 'SIP',
                name: '',
                assetClass: assetClass,
                createdAt: new Date().toISOString(),
                monthlyAmount: 5000,
                durationYears: 10,
                expectedRatePercent: 12
            };
            handleCreateCalculator(newConfig);
        }
    };

    // Delete Modal State
    const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteConfirmationId(id);
    };

    const confirmDelete = () => {
        if (deleteConfirmationId) {
            dispatch({ type: 'DELETE_CALCULATOR', payload: deleteConfirmationId });
            if (activeTabId === deleteConfirmationId) {
                setActiveTabId(null);
            }
            setDeleteConfirmationId(null);
        }
    };

    const handleCalculateAll = () => {
        setSnapshotCalculators([...calculators]);
        setShowSummary(true);
    };

    const activeCalculator = calculators.find(c => c.id === activeTabId);

    // Helper to safely access inflationRate
    const getInflationRate = (calc: CalculatorConfig) => {
        return 'inflationRate' in calc ? calc.inflationRate : undefined;
    };

    return (
        <div className="dashboard-container">
            <Header />

            <TabRow
                calculators={calculators}
                activeTabId={activeTabId}
                isDraft={false}
                onTabClick={setActiveTabId}
                onDeleteClick={handleDeleteClick}
                onAddClick={handleAssetSelect}
            />

            {/* Main Content Area */}
            <div className="dashboard-content">
                {activeCalculator ? (
                    <div className="calculator-config-panel">


                        {/* The Unified Editor */}
                        <CalculatorEditor
                            calculator={activeCalculator}
                            onUpdate={handleUpdate}
                        />
                    </div>
                ) : (
                    <div className="dashboard-placeholder">
                        <h3>Start Your Plan</h3>
                        <p>Click the <strong>+</strong> button to add an investment calculator.</p>
                    </div>
                )}

                {/* Viewfinder / Summary Area */}
                {calculators.length > 0 && (
                    <div className="viewfinder-section">
                        <div className="viewfinder-header">
                            <h3>Plan Summary</h3>
                        </div>
                        <div className="viewfinder-grid">
                            {calculators.map(calc => (
                                <div key={calc.id} className={`mini-card ${activeTabId === calc.id ? 'highlighted' : ''}`} onClick={() => { setActiveTabId(calc.id); }}>
                                    <div className="mini-card-header">
                                        <span className="mini-card-type">{calc.type}</span>
                                        <button className="mini-delete" onClick={(e) => handleDeleteClick(calc.id, e)}>×</button>
                                    </div>
                                    {calc.name && <div className="mini-card-name">{calc.name}</div>}
                                    <div className="mini-card-details">
                                        {calc.assetClass && <div className="mini-sub" style={{ color: 'var(--accent-color)' }}>{calc.assetClass}</div>}

                                        {calc.type === 'SIP' && (
                                            <>
                                                <div>₹{calc.monthlyAmount}/mo</div>
                                                <div className="mini-sub">{calc.durationYears} yrs @ {calc.expectedRatePercent}%</div>
                                            </>
                                        )}
                                        {calc.type === 'StepUpSIP' && (
                                            <>
                                                <div>₹{calc.initialMonthlyAmount}/mo</div>
                                                <div className="mini-sub">Step {calc.stepUpPercentage}%</div>
                                            </>
                                        )}
                                        {calc.type === 'SWP' && (
                                            <>
                                                <div>Yield ₹{calc.withdrawalAmount}/{calc.frequency.charAt(0)}</div>
                                                <div className="mini-sub">from ₹{calc.lumpSumAmount}</div>
                                            </>
                                        )}
                                        {calc.type === 'Lumpsum' && (
                                            <>
                                                <div>₹{calc.lumpSumAmount}</div>
                                                <div className="mini-sub">{calc.durationYears} yrs @ {calc.expectedRatePercent}%</div>
                                            </>
                                        )}
                                        {getInflationRate(calc) !== undefined && (
                                            <div className="mini-sub">Inflation: {getInflationRate(calc)}%</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Calculate All Button */}
            {calculators.length > 0 && (
                <div className="action-footer-section">
                    <button className="btn btn-primary calculate-all-btn" onClick={handleCalculateAll}>
                        Calculate All Plans
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmationId && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Delete Calculator?</h3>
                        <p>Are you sure you want to remove this calculator from your plan? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirmationId(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {showSummary && (
                <PlanSummaryReport
                    calculators={snapshotCalculators}
                />
            )}
        </div>
    );
};
