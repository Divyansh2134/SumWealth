import React, { useState, useEffect } from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import type { CalculatorConfig, SIPConfig } from '../../types';
import { CalculatorEditor } from './CalculatorEditor';
import { Header } from '../../components/Header';
import { TabRow } from '../../components/TabRow/TabRow';
import { formatCompactNumber } from '../../utils/financeCalculators';
import '../../styles/TabbedCalculatorView.css';
import { v4 as uuidv4 } from 'uuid';

import { PlanSummaryReport } from './PlanSummaryReport';

import { useCurrency } from '../../context/CurrencyContext';

export const TabbedCalculatorView: React.FC = () => {
    const { calculators, dispatch } = useCalculator();
    const { currency } = useCurrency(); // Consume context
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
                expectedRatePercent: 12,
                isNew: true
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

    // Auto-Scroll Ref
    const summaryRef = React.useRef<HTMLDivElement>(null);

    // Recalculate Reminder State
    const [hasCalculated, setHasCalculated] = useState(false);
    
    // Check if current calculators differ from snapshot
    // We use JSON.stringify for deep comparison which is acceptable for this data size
    const isDirty = React.useMemo(() => {
        if (!hasCalculated) return false;
        return JSON.stringify(calculators) !== JSON.stringify(snapshotCalculators);
    }, [calculators, snapshotCalculators, hasCalculated]);

    const handleCalculateAll = () => {
        setSnapshotCalculators([...calculators]);
        setShowSummary(true);
        setHasCalculated(true);
        
        // Custom smooth scroll function for better control
        const smoothScrollTo = (element: HTMLElement) => {
            const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = 800;
            let start: number | null = null;

            const animation = (currentTime: number) => {
                if (start === null) start = currentTime;
                const timeElapsed = currentTime - start;
                const run = ease(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            };

            // Easing function (easeInOutQuad)
            const ease = (t: number, b: number, c: number, d: number) => {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            };

            requestAnimationFrame(animation);
        };

        // Timeout to allow DOM to update if showing summary for first time
        setTimeout(() => {
            if (summaryRef.current) {
                smoothScrollTo(summaryRef.current);
            }
        }, 100);
    };

    const activeCalculator = calculators.find(c => c.id === activeTabId);



    return (
        <div className="dashboard-container">
            <Header />

            <div className="hero-section">
                <h1 className="hero-title">Plan Smarter. Invest Better. Grow Wealth.</h1>
                <p className="hero-description">
                    Build a real-world strategy, not just a calculation. Combine SIPs, Step-ups, and SWPs into a dynamic plan that accounts for inflation—visualizing your true wealth and income potential.
                </p>
            </div>

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
                                        <div className="mini-card-title-row">
                                            {calc.name && <div className="mini-card-name" title={calc.name}>{calc.name}</div>}
                                            <span className="mini-card-type">{calc.type}</span>
                                        </div>
                                        <button className="mini-delete" onClick={(e) => handleDeleteClick(calc.id, e)}>×</button>
                                    </div>
                                    
                                    <div className="mini-card-body">
                                        {calc.type === 'SIP' && (
                                            <>
                                                <div className="mini-main-value">
                                                    {formatCompactNumber(calc.monthlyAmount, currency.code, currency.locale)}<span className="mini-unit">/mo</span>
                                                </div>
                                                <div className="mini-footer-row">
                                                    <span>{calc.durationYears}y</span>
                                                    <span className="mini-dot">•</span>
                                                    <span>{calc.expectedRatePercent}%</span>
                                                    {calc.assetClass && (
                                                        <>
                                                            <span className="mini-dot">•</span>
                                                            <span className="mini-asset">{calc.assetClass}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                        {calc.type === 'StepUpSIP' && (
                                            <>
                                                <div className="mini-main-value">
                                                    {formatCompactNumber(calc.initialMonthlyAmount, currency.code, currency.locale)}<span className="mini-unit">/mo</span>
                                                </div>
                                                <div className="mini-footer-row">
                                                    <span>+{calc.stepUpPercentage}%</span>
                                                    <span className="mini-dot">•</span>
                                                    <span>{calc.durationYears}y</span>
                                                    {calc.assetClass && (
                                                        <>
                                                            <span className="mini-dot">•</span>
                                                            <span className="mini-asset">{calc.assetClass}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                        {calc.type === 'SWP' && (
                                            <>
                                                <div className="mini-main-value">
                                                    {formatCompactNumber(calc.withdrawalAmount, currency.code, currency.locale)}<span className="mini-unit">/{calc.frequency.charAt(0).toLowerCase()}</span>
                                                </div>
                                                <div className="mini-footer-row">
                                                    <span style={{opacity: 0.8}}>from</span>
                                                    <span>{formatCompactNumber(calc.lumpSumAmount, currency.code, currency.locale)}</span>
                                                    {calc.assetClass && (
                                                        <>
                                                            <span className="mini-dot">•</span>
                                                            <span className="mini-asset">{calc.assetClass}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                        {calc.type === 'Lumpsum' && (
                                            <>
                                                <div className="mini-main-value">
                                                    {formatCompactNumber(calc.lumpSumAmount, currency.code, currency.locale)}
                                                </div>
                                                <div className="mini-footer-row">
                                                    <span>{calc.durationYears}y</span>
                                                    <span className="mini-dot">•</span>
                                                    <span>{calc.expectedRatePercent}%</span>
                                                    {calc.assetClass && (
                                                        <>
                                                            <span className="mini-dot">•</span>
                                                            <span className="mini-asset">{calc.assetClass}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </>
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
                    <button 
                        className={`btn btn-primary calculate-all-btn ${isDirty ? 'pulse-animation' : ''}`} 
                        onClick={handleCalculateAll}
                    >
                        {isDirty ? 'Update Plan' : 'Calculate All Plans'}
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmationId && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Delete Calculator?</h3>
                        <p>Are you sure you want to remove this calculator from your plan?</p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setDeleteConfirmationId(null)}>Cancel</button>
                            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {showSummary && (
                <div ref={summaryRef}>
                    <PlanSummaryReport
                        calculators={snapshotCalculators}
                    />
                </div>
            )}
        </div>
    );
};
