import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { CalculatorConfig, SIPConfig, StepUpSIPConfig, SWPConfig, LumpsumConfig } from '../../types';
import { SIPForm } from './forms/SIPForm';
import { SWPForm } from './forms/SWPForm';
import { LumpsumForm } from './forms/LumpsumForm';
import { SliderInput } from '../../components/SliderInput';
import { ToggleGroup } from '../../components/Inputs';
import { calculateSIP, calculateStepUpSIP, calculateLumpsum, calculateSWP, formatCurrency } from '../../utils/financeCalculators';
import type { ProjectionResult } from '../../utils/financeCalculators';
import '../../styles/CalculatorEditor.css';

interface CalculatorEditorProps {
    calculator: CalculatorConfig;
    onUpdate: (config: CalculatorConfig) => void;
}

const CATEGORIES = ['SIP', 'SWP', 'Lumpsum'];
const COLORS = ['#6200ea', '#03dac6']; // Primary, Secondary

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

    // --- Calculations ---
    const projection: ProjectionResult = useMemo(() => {
        const inflationRate = 'inflationRate' in calculator ? calculator.inflationRate : undefined;

        switch (calculator.type) {
            case 'SIP': {
                const c = calculator as SIPConfig;
                return calculateSIP(c.monthlyAmount, c.expectedRatePercent, c.durationYears, inflationRate);
            }
            case 'StepUpSIP': {
                const c = calculator as StepUpSIPConfig;
                return calculateStepUpSIP(c.initialMonthlyAmount, c.expectedRatePercent, c.durationYears, c.stepUpPercentage, c.stepUpFrequency, inflationRate);
            }
            case 'Lumpsum': {
                const c = calculator as LumpsumConfig;
                return calculateLumpsum(c.lumpSumAmount, c.expectedRatePercent, c.durationYears, inflationRate);
            }
            case 'SWP': {
                const c = calculator as SWPConfig;
                return calculateSWP(c.lumpSumAmount, c.withdrawalAmount, c.frequency, c.expectedRatePercent, c.durationYears, inflationRate);
            }
            default:
                return { totalInvested: 0, totalInterest: 0, maturityValue: 0 };
        }
    }, [calculator]);

    const chartData = [
        { name: 'Invested', value: projection.totalInvested },
        { name: 'Gained', value: projection.totalInterest > 0 ? projection.totalInterest : 0 }
    ];

    // For SWP, if interest is negative (loss of capital), we handle it differently? 
    // Usually SWP shows remaining corpus. 
    // Let's stick to Invested vs Gained for now. If gained is negative, we might just show 0 or handle it.
    // In SWP, "Invested" is the initial Lumpsum.
    // "Maturity Value" is final corpus.
    // "Total Withdrawn" + "Final Corpus" - "Initial Investment" = Total Gain.

    return (
        <div className="calculator-editor">
            {/* Left Panel: Configuration */}
            <div className="editor-left-panel">

                {/* Header Internal: Badge Left, Name Center */}
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

                {/* Categories */}
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
                            key={calculator.id}
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
                            onCancel={() => { }}
                            isInline={true}
                        />
                    )}
                    {calculator.type === 'SWP' && (
                        <SWPForm
                            key={calculator.id}
                            id={formId}
                            initialData={calculator as SWPConfig}
                            onSubmit={(data) => onUpdate({ ...calculator as SWPConfig, ...data })}
                            onCancel={() => { }}
                            isInline={true}
                        />
                    )}
                    {calculator.type === 'Lumpsum' && (
                        <LumpsumForm
                            key={calculator.id}
                            id={formId}
                            initialData={calculator as LumpsumConfig}
                            onSubmit={(data) => onUpdate({ ...calculator as LumpsumConfig, ...data })}
                            onCancel={() => { }}
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
                <div style={{ width: '100%', height: 220, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={0}
                                outerRadius={80}
                                startAngle={90}
                                endAngle={-270}
                                paddingAngle={0}
                                dataKey="value"
                                isAnimationActive={false}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number | undefined) => formatCurrency(value || 0)}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Custom Oval Legend */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem' }}>
                    {chartData.map((entry, index) => (
                        <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                                width: '20px',
                                height: '10px',
                                borderRadius: '10px',
                                backgroundColor: COLORS[index % COLORS.length]
                            }}></div>
                            <span style={{ fontSize: '0.85rem', color: '#555', fontWeight: 500 }}>{entry.name}</span>
                        </div>
                    ))}
                </div>

                <div className="projection-details" style={{ marginTop: '1.5rem', width: '100%', textAlign: 'center' }}>
                    <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Value</div>
                        <div style={{ fontSize: '1.5rem', color: '#1a1a1a', fontWeight: 700 }}>
                            {formatCurrency(projection.maturityValue)}
                        </div>
                    </div>

                    {/* Inflation Note */}
                    {hasInflation && projection.inflationAdjustedValue && (
                        <div style={{ fontSize: '0.85rem', color: '#666', background: 'rgba(0,0,0,0.03)', padding: '6px 12px', borderRadius: '8px', display: 'inline-block' }}>
                            Real Value: <strong>{formatCurrency(projection.inflationAdjustedValue)}</strong>
                        </div>
                    )}
                </div>

                {/* Update Button */}
                {/* Update Button Removed - Real-time updates enabled */}
            </div>
        </div>
    );
};
