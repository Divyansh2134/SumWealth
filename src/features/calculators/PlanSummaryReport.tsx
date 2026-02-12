import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography } from '@mui/material';
import type { CalculatorConfig, SIPConfig, StepUpSIPConfig, SWPConfig, LumpsumConfig, InflationConfig } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { calculateSIP, calculateStepUpSIP, calculateLumpsum, calculateSWP, formatCurrency, formatCompactNumber, getYearlyProjection } from '../../utils/financeCalculators';
import type { ProjectionResult } from '../../utils/financeCalculators';
import '../../styles/PlanSummaryReport.css';

interface PlanSummaryReportProps {
    calculators: CalculatorConfig[];
}

interface TableRowData {
    id: string;
    name: string;
    asset: string;
    invested: number;
    years: number;
    total: number;
    realValue?: number; // Optional now
    totalWithdrawn?: number;
}



const COLORS = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange
    '#6366f1', // Indigo
];

// Note: To access context in Tooltip, we might need to pass currency as prop or use hook inside if Recharts allows.
// Recharts Tooltip renders as a separate component. Let's make it a proper component.

interface ChartDataItem {
    name?: string;
    calcType?: string;
    realInvested?: number;
    Invested?: number;
    Gained?: number;
    Remaining?: number;
    Withdrawn?: number;
    year?: number;
    [key: string]: number | string | undefined; // Allow dynamic keys
}

interface TooltipPayload {
    name: string;
    value: number;
    color: string;
    payload?: ChartDataItem;
    [key: string]: unknown;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
}

const AssetTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    const { currency } = useCurrency();

    if (active && payload && payload.length && payload[0].payload) {
        const data = payload[0].payload;
        const type = data.calcType;
        const name = data.name;

        return (
            <div className="custom-chart-tooltip" style={{ 
                backgroundColor: 'var(--card-bg)', 
                border: '1px solid var(--border-color)',
                padding: '8px 12px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: 600 }}>{name}</div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Invested:</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {formatCurrency(Number(data.realInvested || 0), currency.code, currency.locale)}
                        </span>
                    </div>

                    {type === 'SWP' ? (
                        <>
                             <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Withdrawn:</span>
                                <span style={{ fontWeight: 600, color: '#ff6d00' }}>
                                    {formatCurrency(Number(data.Withdrawn || 0), currency.code, currency.locale)}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Remaining:</span>
                                <span style={{ fontWeight: 600, color: '#7c4dff' }}>
                                    {formatCurrency(Number(data.Remaining || 0), currency.code, currency.locale)}
                                </span>
                            </div>
                        </>
                    ) : (
                         <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Returns:</span>
                            <span style={{ fontWeight: 600, color: '#10b981' }}>
                                {formatCurrency(Number(data.Gained || 0), currency.code, currency.locale)}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

const GrowthTooltip: React.FC<CustomTooltipProps & { calculators: CalculatorConfig[] }> = ({ active, payload, label, calculators }) => {
    const { currency } = useCurrency();

    if (active && payload && payload.length) {
        return (
            <div className="custom-chart-tooltip" style={{ 
                backgroundColor: 'var(--card-bg)', 
                border: '1px solid var(--border-color)',
                padding: '8px 12px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '6px', fontSize: '11px', fontWeight: 600 }}>Year {label}</div>
                {payload.map((entry: TooltipPayload) => {
                    const name = entry.name;
                    // Find calculator type
                    const calc = calculators.find(c => (c.name || `${c.type} ${calculators.filter(x => x.type === c.type).indexOf(c) + 1}`) === name);
                    const isSWP = calc?.type === 'SWP';
                    
                    const withdrawnKey = `${name}_withdrawn`;
                    // Safe access to withdrawn property from the payload object
                    const payloadData = entry.payload || {};
                    const withdrawn = Number(payloadData[withdrawnKey] || 0);

                    return (
                        <div key={name} style={{ marginBottom: '6px', fontSize: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }}></div>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{name}</span>
                            </div>
                            <div style={{ paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '1px', fontSize: '11px' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Value: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(entry.value, currency.code, currency.locale)}</strong></span>
                                {isSWP && withdrawn > 0 && (
                                    <span style={{ color: 'var(--text-secondary)' }}>Withdrawn: <strong style={{ color: '#ff6d00' }}>{formatCurrency(withdrawn, currency.code, currency.locale)}</strong></span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
    return null;
};

export const PlanSummaryReport: React.FC<PlanSummaryReportProps> = ({ calculators }) => {
    const { currency } = useCurrency(); // Consume context

    // Check if any active inflation settings exist
    const hasInflation = useMemo(() => {
        const globalInflation = calculators.some(c => c.type === 'Inflation');
        const localInflation = calculators.some(c => 'inflationRate' in c && (c as { inflationRate?: number }).inflationRate !== undefined);
        return globalInflation || localInflation;
    }, [calculators]);

    const hasSWP = useMemo(() => {
        return calculators.some(c => c.type === 'SWP');
    }, [calculators]);

    const reportData = useMemo(() => {
        // Detect global inflation rate if present
        const globalInflationCalc = calculators.find(c => c.type === 'Inflation') as InflationConfig | undefined;
        const globalInflationRate = globalInflationCalc?.rate;

        // 1. Unified Calculation Phase
        const calculatedResults = calculators.map(calc => {
            // Priority: Plan-specific inflation > Global inflation calculator
            const inflation = 'inflationRate' in calc ? calc.inflationRate : globalInflationRate;

            let result: ProjectionResult;
            switch (calc.type) {
                case 'SIP': {
                    const c = calc as SIPConfig;
                    result = calculateSIP(c.monthlyAmount, c.expectedRatePercent, c.durationYears, inflation);
                    break;
                }
                case 'StepUpSIP': {
                    const c = calc as StepUpSIPConfig;
                    result = calculateStepUpSIP(c.initialMonthlyAmount, c.expectedRatePercent, c.durationYears, c.stepUpPercentage, c.stepUpFrequency, inflation);
                    break;
                }
                case 'SWP': {
                    const c = calc as SWPConfig;
                    result = calculateSWP(c.lumpSumAmount, c.withdrawalAmount, c.frequency, c.expectedRatePercent, c.durationYears, inflation);
                    break;
                }
                case 'Lumpsum': {
                    const c = calc as LumpsumConfig;
                    result = calculateLumpsum(c.lumpSumAmount, c.expectedRatePercent, c.durationYears, inflation);
                    break;
                }
                default:
                    result = { totalInvested: 0, totalInterest: 0, maturityValue: 0 };
            }

            return {
                id: calc.id,
                name: calc.name || `${calc.type} ${calculators.filter(c => c.type === calc.type).indexOf(calc) + 1}`,
                asset: calc.assetClass || 'General',
                invested: result.totalInvested,
                gained: result.totalInterest,
                totalWithdrawn: result.totalWithdrawn || 0,
                years: 'durationYears' in calc ? (calc as SIPConfig | StepUpSIPConfig | SWPConfig | LumpsumConfig).durationYears : 0,
                total: result.maturityValue,
                realValue: result.inflationAdjustedValue, // Can be undefined
                type: calc.type
            };
        });

        const chartData = calculatedResults.map(res => {
            if (res.type === 'SWP') {
                return {
                    name: res.name,
                    calcType: res.type,
                    realInvested: res.invested,
                    Remaining: res.total,
                    Withdrawn: res.totalWithdrawn,
                    // Zero out others to avoid overlap in the stacked bar if they share stackId
                    Invested: 0,
                    Gained: 0
                };
            }
            return {
                name: res.name,
                calcType: res.type,
                realInvested: res.invested,
                Invested: res.invested,
                Gained: res.gained,
                Remaining: 0,
                Withdrawn: 0
            };
        });

        const tableData: TableRowData[] = calculatedResults.map(res => ({
            id: res.id,
            name: res.name,
            asset: res.asset,
            invested: res.invested,
            years: res.years,
            total: res.total,
            realValue: res.realValue,
            totalWithdrawn: res.totalWithdrawn
        }));

        let maxDuration = 0;
        const colorMap: Record<string, string> = {};

        calculators.forEach((calc, idx) => {
            if ('durationYears' in calc && calc.durationYears > maxDuration) {
                maxDuration = calc.durationYears;
            }
            colorMap[calc.id] = COLORS[idx % COLORS.length];
        });

        const yearlyDataMap = new Map<number, { year: number } & Record<string, number>>();
        for (let y = 1; y <= maxDuration; y++) {
            yearlyDataMap.set(y, { year: y });
        }

        calculators.forEach(calc => {
            const projections = getYearlyProjection(calc);
            const fallbackName = calc.name || `${calc.type} ${calculators.filter(c => c.type === calc.type).indexOf(calc) + 1}`;
            projections.forEach(p => {
                const existing = yearlyDataMap.get(p.year) || { year: p.year };
                existing[fallbackName] = p.value;
                // Add withdrawn data for tooltip using a specific key convention
                if (p.withdrawn !== undefined) {
                    existing[`${fallbackName}_withdrawn`] = p.withdrawn;
                }
                yearlyDataMap.set(p.year, existing);
            });
        });

        const yearlyData = Array.from(yearlyDataMap.values()).sort((a, b) => a.year - b.year);

        const totals = tableData.reduce((acc, curr) => ({
            invested: acc.invested + curr.invested,
            total: acc.total + curr.total,
            realValue: acc.realValue + (curr.realValue ?? curr.total), // If no real value, use nominal for total sum consistency
            totalWithdrawn: acc.totalWithdrawn + (curr.totalWithdrawn || 0)
        }), { invested: 0, total: 0, realValue: 0, totalWithdrawn: 0 } as { invested: number; total: number; realValue: number; totalWithdrawn: number });

        return { chartData, tableData, yearlyData, maxDuration, colorMap, totals };
    }, [calculators]);

    const { chartData, tableData, yearlyData, colorMap, totals } = reportData;

    return (
        <div className="dashboard-content">
            <div className="plan-summary-container">
                <div className="summary-header">
                    <h2>Asset Allocation Analysis</h2>
                </div>

                <div className="summary-card">
                    <div className="summary-card-content">
                        <div className="summary-section-spacer">

                            {/* 1. Bar Chart Section */}
                            <div className="chart-wrapper">
                                <div className="chart-container-resizable" style={{ height: 'max(400px, 40vh)', minHeight: 300, width: '100%', outline: 'none' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                            <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} tick={{ fontSize: 10 }} />
                                            <YAxis
                                                stroke="var(--text-secondary)"
                                                fontSize={10}
                                                tick={{ fontSize: 10 }}
                                                tickFormatter={(val) => formatCompactNumber(val, currency.code, currency.locale)}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                content={<AssetTooltip />}
                                                wrapperStyle={{ outline: 'none' }}
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
                                            {/* Standard Bars */}
                                            <Bar dataKey="Invested" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} maxBarSize={60} />
                                            <Bar dataKey="Gained" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                            {/* SWP Specific Bars - stackId must match if we want them in same column (they are exclusive per row anyway) */}
                                            <Bar dataKey="Remaining" stackId="a" fill="#7c4dff" radius={[0, 0, 4, 4]} maxBarSize={60} />
                                            <Bar dataKey="Withdrawn" stackId="a" fill="#ff6d00" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 2. Yearly Growth Chart */}
                            <div className="chart-wrapper">
                                <Typography className="section-title">Portfolio Growth Over Time</Typography>
                                <div className="chart-container-resizable" style={{ height: 'max(350px, 35vh)', minHeight: 300, width: '100%', outline: 'none' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={yearlyData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                            <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={10} tick={{ fontSize: 10 }} />
                                            <YAxis
                                                stroke="var(--text-secondary)"
                                                fontSize={10}
                                                tick={{ fontSize: 10 }}
                                                tickFormatter={(val) => formatCompactNumber(val, currency.code, currency.locale)}
                                            />
                                            <Tooltip 
                                                content={<GrowthTooltip calculators={calculators} />} 
                                                cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                                                wrapperStyle={{ outline: 'none' }} 
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
                                            {calculators.map((calc) => (
                                                <Bar 
                                                    key={calc.id} 
                                                    dataKey={calc.name || `${calc.type} ${calculators.filter(c => c.type === calc.type).indexOf(calc) + 1}`} 
                                                    stackId="growth" 
                                                    fill={colorMap[calc.id]} 
                                                    maxBarSize={40} 
                                                />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 3. Detailed Table */}
                            <Box sx={{ p: 0 }}>
                                <Typography className="section-title">Plan Breakdown Details</Typography>
                                <TableContainer component={Paper} elevation={0} sx={{
                                    bgcolor: 'var(--card-bg)',
                                    backgroundImage: 'none',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '16px',
                                    overflowX: 'auto',
                                    '&::-webkit-scrollbar': { height: '6px' },
                                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'var(--border-color)', borderRadius: '10px' }
                                }}>
                                    <Table sx={{ minWidth: { xs: 600, sm: 650 } }}>
                                        <TableHead sx={{ bgcolor: 'var(--bg-secondary)' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1.5 }}>Name</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1.5 }}>Asset</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1.5 }}>Invested</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1.5 }}>Years</TableCell>
                                                {hasSWP && (
                                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1.5 }}>Withdrawn</TableCell>
                                                )}
                                                {hasInflation && (
                                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1.5 }}>Real Value</TableCell>
                                                )}
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1.5 }}>Current Value</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tableData.map((row) => (
                                                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'var(--bg-secondary)' } }}>
                                                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'var(--text-primary)', py: 1.5 }}>{row.name}</TableCell>
                                                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1.5 }}>
                                                        <Box component="span" sx={{ px: 1, py: 0.25, borderRadius: '4px', fontSize: { xs: '10px', sm: '12px' }, fontWeight: 600, bgcolor: 'rgba(98, 0, 234, 0.1)', color: 'var(--primary-color)' }}>
                                                            {row.asset}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'var(--text-primary)', py: 1.5 }}>
                                                        {formatCurrency(row.invested, currency.code, currency.locale)}
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'var(--text-primary)', py: 1.5 }}>{row.years}</TableCell>
                                                    {hasSWP && (
                                                        <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: (row.totalWithdrawn || 0) > 0 ? '#ff6d00' : 'var(--text-secondary)', py: 1.5 }}>
                                                            {(row.totalWithdrawn || 0) > 0 ? formatCurrency(row.totalWithdrawn!, currency.code, currency.locale) : '-'}
                                                        </TableCell>
                                                    )}
                                                    {hasInflation && (
                                                        <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'var(--text-primary)', py: 1.5 }}>
                                                            {row.realValue !== undefined ? formatCurrency(row.realValue, currency.code, currency.locale) : '-'}
                                                        </TableCell>
                                                    )}
                                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'var(--success-color)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1.5 }}>
                                                        {formatCurrency(row.total, currency.code, currency.locale)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow sx={{ bgcolor: 'var(--bg-secondary)', '& td': { fontWeight: '800', borderTop: '2px solid var(--border-color)', fontSize: { xs: '0.75rem', sm: '0.875rem' }, py: 1.5 } }}>
                                                <TableCell colSpan={2} sx={{ color: 'var(--text-primary)' }}>Total Portfolio</TableCell>
                                                <TableCell align="right" sx={{ color: 'var(--text-primary)' }}>{formatCurrency(totals.invested, currency.code, currency.locale)}</TableCell>
                                                <TableCell align="center" sx={{ color: 'var(--text-secondary)' }}>—</TableCell>
                                                {hasSWP && (
                                                    <TableCell align="right" sx={{ color: '#ff6d00' }}>{totals.totalWithdrawn ? formatCurrency(totals.totalWithdrawn, currency.code, currency.locale) : '-'}</TableCell>
                                                )}
                                                {hasInflation && (
                                                    <TableCell align="right" sx={{ color: 'var(--text-primary)' }}>{formatCurrency(totals.realValue, currency.code, currency.locale)}</TableCell>
                                                )}
                                                <TableCell align="right" sx={{ color: 'var(--success-color)' }}>{formatCurrency(totals.total, currency.code, currency.locale)}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
