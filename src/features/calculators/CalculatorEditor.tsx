import React from 'react';
import type { CalculatorConfig, SIPConfig, StepUpSIPConfig, SWPConfig, LumpsumConfig } from '../../types';
import { SIPForm } from './forms/SIPForm';
import { SWPForm } from './forms/SWPForm';
import { LumpsumForm } from './forms/LumpsumForm';
import { SliderInput } from '../../components/SliderInput';
import { ToggleGroup } from '../../components/Inputs';
import '../../styles/CalculatorEditor.css';

interface CalculatorEditorProps {
    calculator: CalculatorConfig;
    onUpdate: (config: CalculatorConfig) => void;
}

const CATEGORIES = ['SIP', 'SWP', 'Lumpsum'];

export const CalculatorEditor: React.FC<CalculatorEditorProps> = ({ calculator, onUpdate }) => {
    const formId = "calculator-form";
    
    // Type Switching Logic
    const handleCategoryChange = (newCategory: string) => {
        // Base config to preserve
        const baseConfig = {
            id: calculator.id,
            name: calculator.name,
            assetClass: calculator.assetClass,
            createdAt: calculator.createdAt,
            inflationRate: 'inflationRate' in calculator ? calculator.inflationRate : undefined
        };

        let newConfig: CalculatorConfig;

        if (newCategory === 'SIP') {
             newConfig = { ...baseConfig, type: 'SIP', monthlyAmount: 5000, durationYears: 10, expectedRatePercent: 12 } as SIPConfig;
        } else if (newCategory === 'SWP') {
             newConfig = { ...baseConfig, type: 'SWP', lumpSumAmount: 500000, withdrawalAmount: 5000, frequency: 'monthly', durationYears: 10, expectedRatePercent: 12 } as SWPConfig;
        } else { // Lumpsum
             newConfig = { ...baseConfig, type: 'Lumpsum', lumpSumAmount: 100000, expectedRatePercent: 12, durationYears: 10 } as LumpsumConfig;
        }

        onUpdate(newConfig);
    };

    const handleStepUpToggle = (enabled: boolean) => {
        if (calculator.type !== 'SIP' && calculator.type !== 'StepUpSIP') return;

        if (enabled) {
            // Convert SIP to StepUpSIP
            const sipConfig = calculator as SIPConfig;
            const newConfig: StepUpSIPConfig = {
                ...sipConfig,
                type: 'StepUpSIP',
                initialMonthlyAmount: sipConfig.monthlyAmount,
                stepUpPercentage: 10,
                stepUpFrequency: 'annually'
            };
            onUpdate(newConfig);
        } else {
            // Convert StepUpSIP to SIP
            const stepUpConfig = calculator as StepUpSIPConfig;
            const newConfig: SIPConfig = {
                id: stepUpConfig.id,
                name: stepUpConfig.name,
                type: 'SIP',
                assetClass: stepUpConfig.assetClass,
                createdAt: stepUpConfig.createdAt,
                monthlyAmount: stepUpConfig.initialMonthlyAmount,
                durationYears: stepUpConfig.durationYears,
                expectedRatePercent: stepUpConfig.expectedRatePercent,
                inflationRate: stepUpConfig.inflationRate
            };
            onUpdate(newConfig);
        }
    };

    const handleInflationToggle = (enabled: boolean) => {
        const newConfig = { ...calculator };
        if (enabled) {
            (newConfig as CalculatorConfig & { inflationRate?: number }).inflationRate = 6;
        } else {
            delete (newConfig as CalculatorConfig & { inflationRate?: number }).inflationRate;
        }
        onUpdate(newConfig);
    };

    const currentCategory = calculator.type === 'StepUpSIP' ? 'SIP' : calculator.type;
    const isStepUp = calculator.type === 'StepUpSIP';
    const hasInflation = 'inflationRate' in calculator && calculator.inflationRate !== undefined;

    return (
        <div className="calculator-editor">
            {/* Left Panel: Configuration */}
            <div className="editor-left-panel">
                
                {/* Header Internal: Badge Left, Name Center */ }
                <div className="editor-internal-header">
                    {calculator.assetClass && (
                        <div className="editor-asset-badge-small">
                            {calculator.assetClass}
                        </div>
                    )}
                    <div className="editor-name-container">
                        <input 
                            type="text" 
                            className="editor-name-input" 
                            placeholder="Calculator Name"
                            value={calculator.name || ''}
                            onChange={(e) => onUpdate({ ...calculator, name: e.target.value })}
                        />
                    </div>
                </div>

                {/* Asset Header removed */ }

                {/* Category Tabs (Only if it's one of the main 3 types) */}
                {CATEGORIES.includes(currentCategory) && (
                    <div className="editor-category-tabs">
                        {CATEGORIES.map(cat => (
                            <button 
                                key={cat} 
                                className={`editor-category-tab ${currentCategory === cat ? 'active' : ''}`}
                                onClick={() => handleCategoryChange(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* Main Form */}
                <div className="editor-form-wrapper">
                      {(calculator.type === 'SIP' || calculator.type === 'StepUpSIP') && (
                          <SIPForm 
                            id={formId}
                            initialData={
                                calculator.type === 'StepUpSIP' 
                                ? { ...calculator, monthlyAmount: calculator.initialMonthlyAmount } as unknown as SIPConfig
                                : calculator as SIPConfig
                            } 
                            onSubmit={(data) => {
                                if (calculator.type === 'StepUpSIP') {
                                     onUpdate({
                                         ...calculator,
                                         initialMonthlyAmount: data.monthlyAmount,
                                         durationYears: data.durationYears,
                                         expectedRatePercent: data.expectedRatePercent
                                     });
                                } else {
                                     onUpdate({ ...calculator, ...data } as SIPConfig);
                                }
                            }} 
                            onCancel={() => {}} 
                            isInline={true} 
                          />
                      )}
                      {calculator.type === 'SWP' && (
                          <SWPForm 
                            id={formId}
                            initialData={calculator as SWPConfig} 
                            onSubmit={(data) => onUpdate({ ...calculator as SWPConfig, ...data })} 
                            onCancel={() => {}} 
                            isInline={true} 
                          />
                      )}
                      {calculator.type === 'Lumpsum' && (
                          <LumpsumForm 
                            id={formId}
                            initialData={calculator as LumpsumConfig} 
                            onSubmit={(data) => onUpdate({ ...calculator as LumpsumConfig, ...data })} 
                            onCancel={() => {}} 
                            isInline={true} 
                          />
                      )}
                </div>
                
                {/* Toggles */}
                 <div className="editor-toggles">
                    {(currentCategory === 'SIP') && (
                        <div className="toggle-block">
                            <div className="toggle-row-inline">
                                <button 
                                    type="button"
                                    className={`pill-switch ${isStepUp ? 'active' : ''}`}
                                    onClick={() => handleStepUpToggle(!isStepUp)}
                                >
                                    {isStepUp ? 'Step Up Enabled' : 'Enable Step Up'}
                                </button>
                                
                                {isStepUp && (
                                    <div className="inline-controls">
                                        <div style={{ flex: '1', minWidth: '140px' }}> 
                                            <SliderInput
                                                label=""
                                                variant="compact"
                                                value={(calculator as StepUpSIPConfig).stepUpPercentage}
                                                onChange={(val) => onUpdate({ ...calculator, stepUpPercentage: val } as StepUpSIPConfig)}
                                                min={1} max={50} step={1} unit="%"
                                            />
                                        </div>
                                        <div style={{ minWidth: '220px', flexShrink: 0 }}>
                                            <ToggleGroup
                                                value={(calculator as StepUpSIPConfig).stepUpFrequency}
                                                onChange={(val) => onUpdate({ ...calculator, stepUpFrequency: val } as StepUpSIPConfig)}
                                                options={[
                                                    { value: 'annually', label: 'Annually' },
                                                    { value: 'semiannually', label: 'Semi-Annually' },
                                                    { value: 'quarterly', label: 'Quarterly' },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {['SIP', 'StepUpSIP', 'SWP', 'Lumpsum'].includes(calculator.type) && (
                         <div className="toggle-block">
                             <div className="toggle-row-inline">
                                <button 
                                    type="button"
                                    className={`pill-switch ${hasInflation ? 'active' : ''}`}
                                    onClick={() => handleInflationToggle(!hasInflation)}
                                >
                                    {hasInflation ? 'Inflation Enabled' : 'Adjust Inflation'}
                                </button>

                                {hasInflation && (
                                    <div className="inline-controls">
                                         <div style={{ flex: '1', minWidth: '140px' }}>
                                            <SliderInput 
                                                label=""
                                                variant="compact"
                                                min={1} max={15} step={0.5} unit="%"
                                                value={(calculator as CalculatorConfig & { inflationRate: number }).inflationRate}
                                                onChange={(val) => onUpdate({ ...calculator, inflationRate: val } as CalculatorConfig)}
                                            />
                                         </div>
                                    </div>
                                )}
                             </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Right Panel: Graph */}
            <div className="editor-right-panel">
                <h4>Projected Returns</h4>
                <div className="graph-placeholder circular-graph">
                    <div className="pie-chart-mock"></div>
                    <span className="graph-label">Projection</span>
                </div>
                {/* Update Button in Bottom Right */}
                <div className="editor-footer">
                     <button 
                        type="submit" 
                        form={formId}
                        className="btn btn-primary"
                        style={{
                            borderRadius: '50px',
                            padding: '0.8rem 2rem',
                            boxShadow: '0 4px 12px rgba(98, 0, 234, 0.3)',
                            fontWeight: 600
                        }}
                     >
                        Update 
                     </button>
                </div>
            </div>
        </div>
    );
};
