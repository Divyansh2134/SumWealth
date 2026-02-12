import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useToast } from '../../context/ToastContext';
import { useCurrency } from '../../context/CurrencyContext'; // New import
import type { CalculatorConfig, SIPConfig, StepUpSIPConfig, SWPConfig, LumpsumConfig } from '../../types';
import { SIPForm } from './forms/SIPForm';
import { SWPForm } from './forms/SWPForm';
import { LumpsumForm } from './forms/LumpsumForm';
import { SliderInput } from '../../components/SliderInput';
import { ToggleGroup } from '../../components/Inputs';
import { calculateSIP, calculateStepUpSIP, calculateLumpsum, calculateSWP, formatCurrency, formatCompactNumber } from '../../utils/financeCalculators';
import type { ProjectionResult } from '../../utils/financeCalculators';
import '../../styles/CalculatorEditor.css';

interface CalculatorEditorProps {
    calculator: CalculatorConfig;
    onUpdate: (config: CalculatorConfig) => void;
}

const CATEGORIES = ['SIP', 'SWP', 'Lumpsum'];
// COLORS moved to dynamic CHART_COLORS inside component

export const CalculatorEditor: React.FC<CalculatorEditorProps> = ({ calculator, onUpdate }) => {
    const formId = "calculator-form";
    const { currency } = useCurrency(); // Consume context
    
    // Local state to track changes before committing
    const [localConfig, setLocalConfig] = React.useState<CalculatorConfig>(calculator);
    const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

    // Sync local state when external calculator prop changes (e.g. switching tabs, or after save)
    React.useEffect(() => {
        setLocalConfig(calculator);
    }, [calculator]);

    // Derived state for disabled button
    // Check if localConfig is different from calculator (saved state)
    const hasChanges = useMemo(() => {
        return JSON.stringify(localConfig) !== JSON.stringify(calculator);
    }, [localConfig, calculator]);

    const isNew = 'isNew' in localConfig && localConfig.isNew;
    const { addToast } = useToast();
    
    const handleLocalUpdate = (newConfig: CalculatorConfig) => {
        setLocalConfig(newConfig);
    };

    // Helper type for internal use
    type CalculatorWithMeta = CalculatorConfig & { isNew?: boolean };

    const handleSave = () => {
        // Remove isNew flag on save
        const configToSave = { ...localConfig } as CalculatorWithMeta;
        if (configToSave.isNew) {
            delete configToSave.isNew;
        }
        onUpdate(configToSave);

        // Show Toast
        const action = isNew ? 'Added' : 'Updated';
        const name = configToSave.name || configToSave.type;
        addToast(`${action} ${name}`, 'success');
    };


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

        // If it was new, keep it new
        if (isNew) {
            (newConfig as CalculatorWithMeta).isNew = true;
        }

        handleLocalUpdate(newConfig);
    };

    const handleStepUpToggle = (enabled: boolean) => {
        // Use localConfig to preserve current edits
        if (localConfig.type !== 'SIP' && localConfig.type !== 'StepUpSIP') return;

        if (enabled) {
            // Convert SIP to StepUpSIP
            const sipConfig = localConfig as SIPConfig;
            const newConfig: StepUpSIPConfig = {
                ...sipConfig,
                type: 'StepUpSIP',
                initialMonthlyAmount: sipConfig.monthlyAmount,
                stepUpPercentage: 10,
                stepUpFrequency: 'annually'
            };
            handleLocalUpdate(newConfig);
        } else {
            // Convert StepUpSIP to SIP
            const stepUpConfig = localConfig as StepUpSIPConfig;
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
            handleLocalUpdate(newConfig);
        }
    };

    const handleInflationToggle = (enabled: boolean) => {
        const newConfig = { ...localConfig };
        if (enabled) {
            (newConfig as CalculatorConfig & { inflationRate?: number }).inflationRate = 6;
        } else {
            delete (newConfig as CalculatorConfig & { inflationRate?: number }).inflationRate;
        }
        handleLocalUpdate(newConfig);
    };

    const currentCategory = localConfig.type === 'StepUpSIP' ? 'SIP' : localConfig.type;
    const isStepUp = localConfig.type === 'StepUpSIP';
    const hasInflation = 'inflationRate' in localConfig && localConfig.inflationRate !== undefined;

    // --- Calculations ---
    const projection: ProjectionResult = useMemo(() => {
        const inflationRate = 'inflationRate' in localConfig ? localConfig.inflationRate : undefined;

        switch (localConfig.type) {
            case 'SIP': {
                const c = localConfig as SIPConfig;
                return calculateSIP(c.monthlyAmount, c.expectedRatePercent, c.durationYears, inflationRate);
            }
            case 'StepUpSIP': {
                const c = localConfig as StepUpSIPConfig;
                return calculateStepUpSIP(c.initialMonthlyAmount, c.expectedRatePercent, c.durationYears, c.stepUpPercentage, c.stepUpFrequency, inflationRate);
            }
            case 'Lumpsum': {
                const c = localConfig as LumpsumConfig;
                return calculateLumpsum(c.lumpSumAmount, c.expectedRatePercent, c.durationYears, inflationRate);
            }
            case 'SWP': {
                const c = localConfig as SWPConfig;
                return calculateSWP(c.lumpSumAmount, c.withdrawalAmount, c.frequency, c.expectedRatePercent, c.durationYears, inflationRate);
            }
            default:
                return { totalInvested: 0, totalInterest: 0, maturityValue: 0 };
        }
    }, [localConfig]);

    // Standard Colors: Purple, Teal
    // SWP Colors: Blue (Invested), Orange (Withdrawn) - Distinct to avoid confusion
    const CHART_COLORS = useMemo(() => {
        return localConfig.type === 'SWP' ? ['#2962ff', '#ff6d00'] : ['#6200ea', '#03dac6'];
    }, [localConfig.type]);

    const chartData = useMemo(() => {
        if (localConfig.type === 'SWP') {
            const swpProjection = projection as ProjectionResult & { totalWithdrawn: number };
            return [
                { name: 'Invested', value: swpProjection.totalInvested },
                { name: 'Withdrawn', value: swpProjection.totalWithdrawn || 0 }
            ];
        }
        return [
            { name: 'Invested', value: projection.totalInvested },
            { name: 'Gained', value: projection.totalInterest > 0 ? projection.totalInterest : 0 }
        ];
    }, [projection, localConfig.type]);

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
                    {localConfig.assetClass && (
                        <div className="editor-asset-badge-small">
                            {localConfig.assetClass}
                        </div>
                    )}
                    <div className="editor-name-container">
                        <input
                            type="text"
                            className="editor-name-input"
                            placeholder="Calculator Name"
                            value={localConfig.name || ''}
                            onChange={(e) => handleLocalUpdate({ ...localConfig, name: e.target.value })}
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
                    {(localConfig.type === 'SIP' || localConfig.type === 'StepUpSIP') && (
                        <SIPForm
                            key={localConfig.id}
                            id={formId}
                            initialData={
                                localConfig.type === 'StepUpSIP'
                                    ? { ...localConfig, monthlyAmount: localConfig.initialMonthlyAmount } as unknown as SIPConfig
                                    : localConfig as SIPConfig
                            }
                            onSubmit={(data) => {
                                if (localConfig.type === 'StepUpSIP') {
                                    handleLocalUpdate({
                                        ...localConfig,
                                        initialMonthlyAmount: data.monthlyAmount,
                                        durationYears: data.durationYears,
                                        expectedRatePercent: data.expectedRatePercent
                                    });
                                } else {
                                    handleLocalUpdate({ ...localConfig, ...data } as SIPConfig);
                                }
                            }}
                            onCancel={() => { }}
                            isInline={true}
                        />
                    )}
                    {localConfig.type === 'SWP' && (
                        <SWPForm
                            key={localConfig.id}
                            id={formId}
                            initialData={localConfig as SWPConfig}
                            onSubmit={(data) => handleLocalUpdate({ ...localConfig as SWPConfig, ...data })}
                            onCancel={() => { }}
                            isInline={true}
                        />
                    )}
                    {localConfig.type === 'Lumpsum' && (
                        <LumpsumForm
                            key={localConfig.id}
                            id={formId}
                            initialData={localConfig as LumpsumConfig}
                            onSubmit={(data) => handleLocalUpdate({ ...localConfig as LumpsumConfig, ...data })}
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
                                                value={(localConfig as StepUpSIPConfig).stepUpPercentage}
                                                onChange={(val) => handleLocalUpdate({ ...localConfig, stepUpPercentage: val } as StepUpSIPConfig)}
                                                min={1} max={50} step={1} unit="%"
                                            />
                                        </div>
                                        <div style={{ minWidth: '220px', flexShrink: 0 }}>
                                            <ToggleGroup
                                                value={(localConfig as StepUpSIPConfig).stepUpFrequency}
                                                onChange={(val) => handleLocalUpdate({ ...localConfig, stepUpFrequency: val } as StepUpSIPConfig)}
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

                    {['SIP', 'StepUpSIP', 'SWP', 'Lumpsum'].includes(localConfig.type) && (
                        <div className="toggle-block">
                            <div className="toggle-row-inline">
                                <button
                                    type="button"
                                    className={`pill-switch ${hasInflation ? 'active' : ''}`}
                                    onClick={() => handleInflationToggle(!hasInflation)}
                                >
                                    {hasInflation ? 'Inflation Adjusted' : 'Adjust Inflation'}
                                </button>

                                {hasInflation && (
                                    <div className="inline-controls">
                                        <div style={{ flex: '1', minWidth: '140px' }}>
                                            <SliderInput
                                                label=""
                                                variant="compact"
                                                min={1} max={15} step={0.5} unit="%"
                                                value={(localConfig as CalculatorConfig & { inflationRate: number }).inflationRate}
                                                onChange={(val) => handleLocalUpdate({ ...localConfig, inflationRate: val } as CalculatorConfig)}
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
            <div className="editor-right-panel" style={{ display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                
                {/* Custom Oval Legend - Moved to Top */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    {chartData.map((entry, index) => (
                        <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                                width: '24px',
                                height: '8px',
                                borderRadius: '4px',
                                backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                            }}></div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                {entry.name === 'Gained' ? 'Returns' : entry.name}
                            </span>
                        </div>
                    ))}
                </div>

                <div style={{ width: '100%', height: 260, position: 'relative', flexShrink: 0 }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        pointerEvents: 'none',
                        zIndex: 1
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                            {activeIndex !== null 
                                ? (chartData[activeIndex].name === 'Gained' ? 'Returns' : chartData[activeIndex].name) 
                                : (localConfig.type === 'SWP' ? 'Withdrawn' : 'Returns')
                            }
                        </div>
                        <div style={{ fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                            {activeIndex !== null 
                                ? formatCompactNumber(chartData[activeIndex].value, currency.code, currency.locale) 
                                : (localConfig.type === 'SWP' 
                                    ? formatCompactNumber((projection as ProjectionResult & { totalWithdrawn: number }).totalWithdrawn || 0, currency.code, currency.locale)
                                    : formatCompactNumber(projection.totalInterest, currency.code, currency.locale))
                            }
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                startAngle={90}
                                endAngle={-270}
                                paddingAngle={2}
                                dataKey="value"
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                            >
                                {chartData.map((_, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={CHART_COLORS[index % CHART_COLORS.length]} 
                                        stroke="none"
                                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="projection-details" style={{ marginTop: '0.5rem', width: '100%', textAlign: 'center' }}>
                    <div style={{ marginBottom: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {localConfig.type === 'SWP' ? 'Remaining Corpus' : 'Total Value'}
                        </div>
                        <div style={{ fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: 700, lineHeight: 1.2 }}>
                            {formatCurrency(projection.maturityValue, currency.code, currency.locale)}
                        </div>
                    </div>

                    {/* Inflation Note */}
                    {hasInflation && projection.inflationAdjustedValue && (
                        <div style={{ fontSize: '0.75rem', color: '#666', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px', display: 'inline-block', marginTop: '4px' }}>
                            Real Value: <strong>{formatCurrency(projection.inflationAdjustedValue, currency.code, currency.locale)}</strong>
                        </div>
                    )}
                </div>

                {/* Update Button */}
                <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={!isNew && !hasChanges}
                        style={{ width: '100%', padding: '10px' }}
                    >
                        {isNew ? 'Add' : 'Update'}
                    </button>
                </div>
            </div>
        </div>
    );
};
